import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'spoc' | 'admin';
  rollNo?: string;
  section?: string;
  subjects?: string[];
  assignedBy?: string; // For SPOCs - which admin assigned them
  profilePhoto?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData, otp?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  assignSpoc: (spocData: SpocAssignmentData) => Promise<boolean>;
  getAssignedSpocs: () => Promise<User[]>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'spoc' | 'admin';
  rollNo?: string;
  section?: string;
  subjects?: string[];
}

interface SpocAssignmentData {
  name: string;
  email: string;
  subjects: string[];
  password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function sendOtp(email: string): Promise<boolean> {
  try {
    console.log('Sending OTP to:', email);
    console.log('API Base URL:', API_BASE_URL);
    
    const res = await fetch(`${API_BASE_URL}/otp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('OTP send failed:', errorText);
      return false;
    }
    
    const data = await res.json();
    console.log('OTP response data:', data);
    
    return true;
  } catch (error) {
    console.error('OTP send error:', error);
    return false;
  }
}

async function verifyOtp(email: string, otp: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      // Store token in memory for API requests
      window.sessionStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Patch fetch to always send Authorization header if token exists
  const fetchWithAuth = async (url: string, options: any = {}) => {
    const token = window.sessionStorage.getItem('token') || localStorage.getItem('token');
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers, credentials: 'include' });
  };

  const register = async (userData: RegisterData, otp?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Only require OTP for admin registration
      if (userData.role === 'admin') {
        if (!otp) return false;
        const otpValid = await verifyOtp(userData.email, otp);
        if (!otpValid) return false;
      }
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Registration failed:', errorText);
        return false;
      }
      // Do NOT set user in localStorage after registration
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const assignSpoc = async (spocData: SpocAssignmentData): Promise<boolean> => {
    if (!user || user.role !== 'admin') {
      return false;
    }
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/spoc/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: spocData.name,
          email: spocData.email,
          password: spocData.password,
          department: spocData.subjects?.[0] || 'General',
          subjects: spocData.subjects
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('SPOC assignment failed:', errorText);
        return false;
      }
      return true;
    } catch (error) {
      console.error('SPOC assignment error:', error);
      return false;
    }
  };

  const getAssignedSpocs = async (): Promise<User[]> => {
    if (!user || user.role !== 'admin') {
      return [];
    }
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/spoc?limit=100`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.spocs || []).map((spoc: any) => ({
        id: spoc.userId?._id || spoc.userId,
        name: spoc.userId?.name || '',
        email: spoc.userId?.email || '',
        role: 'spoc',
        subjects: spoc.subjects || [],
        assignedBy: user.id
      }));
    } catch (error) {
      console.error('Get assigned SPOCs error:', error);
      return [];
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    assignSpoc,
    getAssignedSpocs
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export sendOtp and verifyOtp as named exports for direct import in RegisterForm
export { sendOtp, verifyOtp };
