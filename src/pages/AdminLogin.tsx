import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
        title: 'Account Created',
        description: 'You can now sign in with your credentials.'
      });
      setIsSignUp(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/xr-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 justify-center">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Admin Login'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create an admin account to manage the directory' 
              : 'Sign in to manage the XR Products Directory'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          <div className="mt-6 text-center">
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
            <p className="text-center text-xs text-muted-foreground mt-4">
              Use <strong>admin@asentio.com</strong> to get admin privileges.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
