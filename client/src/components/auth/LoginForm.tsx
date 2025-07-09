import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { verifyOtp } from '@/contexts/AuthContext';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [loginOtp, setLoginOtp] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (step === 'login') {
      // For spoc and admin, require OTP after password
      if (email.endsWith('@school.com')) { // Example: adjust logic for your roles
        // Send OTP to email
        const sent = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/otp/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (sent.ok) {
          toast({ title: 'OTP sent to your email' });
          setStep('otp');
        } else {
          toast({ title: 'Failed to send OTP', variant: 'destructive' });
        }
        setIsLoading(false);
        return;
      }
      // For students, normal login
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login successful!",
          description: "Welcome back to the AI Paper Correction System",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials. Try: admin@school.com / password123",
          variant: "destructive"
        });
      }
      setIsLoading(false);
      return;
    }
    if (step === 'otp') {
      // Verify OTP for spoc/admin
      const valid = await verifyOtp(email, loginOtp);
      if (valid) {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Login successful!",
            description: "Welcome back to the AI Paper Correction System",
          });
        } else {
          toast({
            title: "Login failed",
            description: "Invalid credentials. Try: admin@school.com / password123",
            variant: "destructive"
          });
        }
      } else {
        toast({ title: 'Invalid OTP', description: 'Please check the OTP and try again.', variant: 'destructive' });
        // Stay on OTP page
      }
      setIsLoading(false);
      return;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
        <p className="text-gray-600">Access your academic dashboard</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'login' && (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onToggleForm}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Register here
                </button>
              </div>
            </>
          )}
          {step === 'otp' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="loginOtp">Enter OTP sent to your email</Label>
              <Input
                id="loginOtp"
                value={loginOtp}
                onChange={(e) => setLoginOtp(e.target.value)}
                className="mt-1"
                placeholder="OTP"
              />
              <Button
                className="mt-2 w-full"
                onClick={handleSubmit}
                disabled={isLoading || !loginOtp}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <div className="text-xs text-gray-500 mt-2">
                <button type="button" onClick={() => setStep('login')} className="hover:underline">Back</button>
              </div>
            </div>
          )}
        </form>

        {showForgot && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {!otpSent ? (
              <>
                <Label htmlFor="forgotEmail">Enter your registered email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-1"
                  placeholder="Email"
                />
                <Button
                  className="mt-2 w-full"
                  onClick={async () => {
                    setForgotLoading(true);
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/otp/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: forgotEmail })
                      });
                      if (res.ok) {
                        setOtpSent(true);
                        toast({ title: 'OTP sent to your email' });
                      } else {
                        const errorText = await res.text();
                        toast({ title: 'Failed to send OTP', description: errorText, variant: 'destructive' });
                      }
                    } catch (err) {
                      toast({ title: 'Failed to send OTP', description: String(err), variant: 'destructive' });
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading || !forgotEmail}
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1"
                  placeholder="OTP"
                />
                <Label htmlFor="newPassword" className="mt-2">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                  placeholder="New password"
                />
                <Button
                  className="mt-2 w-full"
                  onClick={async () => {
                    setForgotLoading(true);
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/otp/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: forgotEmail, otp, newPassword })
                      });
                      if (res.ok) {
                        setShowForgot(false);
                        setOtpSent(false);
                        setForgotEmail('');
                        setOtp('');
                        setNewPassword('');
                        toast({ title: 'Password reset successful! Please login.' });
                      } else {
                        const errorText = await res.text();
                        toast({ title: 'Failed to reset password', description: errorText, variant: 'destructive' });
                      }
                    } catch (err) {
                      toast({ title: 'Failed to reset password', description: String(err), variant: 'destructive' });
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading || !otp || !newPassword}
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </>
            )}
            <div className="text-xs text-gray-500 mt-2">
              <button type="button" onClick={() => { setShowForgot(false); setOtpSent(false); }} className="hover:underline">Cancel</button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginForm;
