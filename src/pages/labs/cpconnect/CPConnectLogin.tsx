import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import heroImg from '@/assets/cpconnect/hero-login.jpg';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home, DollarSign, Users, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CPConnectLogin = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Check your email to verify your account');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/labs/cpconnect',
    });
    if (result.error) toast.error('Google sign-in failed');
  };

  const handleApple = async () => {
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin + '/labs/cpconnect',
    });
    if (result.error) toast.error('Apple sign-in failed');
  };

  const features = [
    { icon: Home, label: 'Smart Takeoffs', desc: 'Upload plans, get instant material & labor estimates' },
    { icon: DollarSign, label: 'Budget Slider', desc: 'Economy → Premium with real-time cost updates' },
    { icon: Users, label: 'Pro-Link', desc: 'Share projects with homeowners — no login required' },
    { icon: Layers, label: 'AI Visualization', desc: 'Generate styled room renders in seconds' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center gap-3">
        <Link to="/labs" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Labs
        </Link>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left — Hero */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 relative">
          <img src={heroImg} alt="Home renovation" className="absolute inset-0 w-full h-full object-cover opacity-10" />
          <div className="max-w-lg relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-6">
              <Home className="w-3.5 h-3.5" />
              Beta
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              CasaPro<span className="text-amber-600">Connect</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              The unified project hub for home renovation. Connect contractors and homeowners through a shared source of truth.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Auth */}
        <div className="flex items-center justify-center px-8 py-12 lg:w-[440px] lg:border-l border-gray-200 bg-white">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {isSignUp ? 'Create your account' : 'Sign in'}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {isSignUp ? 'Start managing renovation projects today' : 'Welcome back to CasaPro Connect'}
            </p>

            <div className="space-y-2.5 mb-6">
              <Button onClick={handleGoogle} variant="outline" className="w-full justify-center gap-2 h-11">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Button>
              <Button onClick={handleApple} variant="outline" className="w-full justify-center gap-2 h-11">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Continue with Apple
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">or</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
              <Button type="submit" disabled={loading} className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white">
                {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-amber-600 hover:underline font-medium">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPConnectLogin;
