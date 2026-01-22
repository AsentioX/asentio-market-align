import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in as admin
  if (isAdmin) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      
      if (error) {
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox and click the verification link to activate your account.'
      });
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Login Successful',
      description: 'Redirecting to dashboard...'
    });
    
    setTimeout(() => {
      navigate('/admin/dashboard');
    }, 500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Reset Email Sent',
        description: 'Check your inbox for a password reset link.'
      });
      setIsForgotPassword(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/xr-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 justify-center">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          <CardTitle className="text-2xl">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Admin Login'}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? 'Enter your email to receive a password reset link'
              : isSignUp 
                ? 'Create an admin account to manage the directory' 
                : 'Sign in to manage the XR Products Directory'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@asentio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-asentio-blue hover:bg-asentio-blue/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-asentio-blue hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@asentio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full bg-asentio-blue hover:bg-asentio-blue/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>
              
              {!isSignUp && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-asentio-blue hover:underline"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : 'Need an account? Create one'}
                </button>
              </div>
              
              {isSignUp && (
                <div className="text-center text-xs text-muted-foreground mt-4 space-y-1">
                  <p>Use <strong>admin@asentio.com</strong> to get admin privileges.</p>
                  <p className="text-warning">You'll need to verify your email before signing in.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
