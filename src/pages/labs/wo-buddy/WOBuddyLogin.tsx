import { useState } from 'react';
import { Dumbbell, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWOBuddyAuth } from '@/hooks/useWOBuddyAuth';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

const WOBuddyLogin = () => {
  const { signIn, signUp } = useWOBuddyAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back! 💪');
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Check your email to verify your account!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async (provider: 'google' | 'apple') => {
    setSsoLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + '/labs/wo-buddy',
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch (err: any) {
      toast.error(err.message || `${provider} sign in failed`);
    } finally {
      setSsoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Labs</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">
            W.O.<span className="text-emerald-400">Buddy</span>
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <Dumbbell className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-1">
          {mode === 'login' ? 'Welcome Back' : 'Join W.O.Buddy'}
        </h2>
        <p className="text-sm text-white/40 mb-8">
          {mode === 'login'
            ? 'Sign in to continue your fitness journey'
            : 'Create an account to start training'}
        </p>

        {/* SSO Buttons */}
        <div className="w-full space-y-3 mb-6">
          <button
            onClick={() => handleSSO('google')}
            disabled={!!ssoLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all text-sm font-medium disabled:opacity-50"
          >
            {ssoLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleSSO('apple')}
            disabled={!!ssoLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all text-sm font-medium disabled:opacity-50"
          >
            {ssoLoading === 'apple' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            )}
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 pl-10 pr-12 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/40">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </main>
    </div>
  );
};

export default WOBuddyLogin;
