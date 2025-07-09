
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import StudentDashboard from '@/components/student/StudentDashboard';
import SpocDashboard from '@/components/spoc/SpocDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Route based on user role
  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  if (user.role === 'spoc') {
    return <SpocDashboard />;
  }

  // Admin users get the main dashboard with SPOC management
  return <Dashboard />;
};

export default Index;
