import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Mail, Lock, ArrowLeft, Eye, EyeOff, Search, Database, Bookmark, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';
import { cfTheme } from './cfTheme';

const features = [
  {
    icon: Search,
    title: 'Targeted Discovery',
    description: 'Search and filter licensed contractors by trade, region, and business signal in seconds.',
  },
  {
    icon: Bookmark,
    title: 'Saved Segments',
    description: 'Build, save, and reuse contractor segments for outreach, research, and pipeline planning.',
  },
  {
    icon: Database,
    title: 'Live Intelligence Pipeline',
    description: 'Continuously refreshed CSLB data plus business enrichment and verified contact extraction.',
  },
];

const stats = [
  { value: '300K+', label: 'Contractors' },
  { value: '40+', label: 'Trade Codes' },
  { value: '1', label: 'Pipeline' },
];

export default function ContractorFinderLogin() {
  const { signIn, signUp } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        toast.success('Welcome to Contractor Finder');
      } else {
        const { error } = await signUp(email, password);
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
        redirect_uri: window.location.origin + '/labs/contractor-finder',
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
    <div style={cfTheme} className="min-h-screen">
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'hsl(var(--cf-bg))', color: 'hsl(var(--cf-text))' }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl"
          style={{
            background: 'hsl(var(--cf-surface) / 0.85)',
            borderBottom: '1px solid hsl(var(--cf-border))',
          }}
        >
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/labs" className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">Labs</span>
            </Link>
            <h1 className="text-base font-bold tracking-tight">Contractor Finder</h1>
            <button
              onClick={() => { setShowAuth(true); setMode('login'); }}
              className="text-xs font-medium"
              style={{ color: 'hsl(var(--cf-primary))' }}
            >
              Sign In
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-12 overflow-y-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center pt-12 pb-8"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              style={{ background: 'hsl(var(--cf-primary))' }}
            >
              <HardHat className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-3 leading-tight">
              Find the right<br />
              <span style={{ color: 'hsl(var(--cf-primary))' }}>contractors.</span>
            </h2>

            <p className="text-sm leading-relaxed max-w-xs mx-auto mb-8" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              An intelligence platform for discovering, segmenting, and engaging licensed contractors across California.
            </p>

            <div className="flex gap-3 justify-center mb-8">
              <button
                onClick={() => { setShowAuth(true); setMode('signup'); }}
                className="h-11 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-lg"
                style={{ background: 'hsl(var(--cf-primary))' }}
              >
                Get Started
              </button>
              <button
                onClick={() => { setShowAuth(true); setMode('login'); }}
                className="h-11 px-6 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'hsl(var(--cf-surface-alt))',
                  border: '1px solid hsl(var(--cf-border))',
                  color: 'hsl(var(--cf-text))',
                }}
              >
                Sign In
              </button>
            </div>

            <div className="flex justify-center gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold" style={{ color: 'hsl(var(--cf-primary))' }}>{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'hsl(var(--cf-text-subtle))' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center mb-8"
          >
            <ChevronDown className="w-5 h-5 animate-bounce" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
          </motion.div>

          <section className="space-y-4 mb-12">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'hsl(var(--cf-text-subtle))' }}>What You Get</h3>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex gap-4 p-4 rounded-2xl transition-colors"
                style={{
                  background: 'hsl(var(--cf-surface))',
                  border: '1px solid hsl(var(--cf-border))',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: 'hsl(var(--cf-primary))' }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">{feature.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--cf-text-muted))' }}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center pb-8"
          >
            <div
              className="p-6 rounded-2xl"
              style={{
                background: 'hsl(var(--cf-primary-soft))',
                border: '1px solid hsl(var(--cf-border))',
              }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--cf-primary))' }} />
              <h3 className="text-lg font-bold mb-2">Start Exploring</h3>
              <p className="text-xs mb-4" style={{ color: 'hsl(var(--cf-text-muted))' }}>Sign up to access the contractor intelligence pipeline.</p>
              <button
                onClick={() => { setShowAuth(true); setMode('signup'); }}
                className="h-11 px-8 rounded-xl text-white font-semibold text-sm transition-all shadow-lg"
                style={{ background: 'hsl(var(--cf-primary))' }}
              >
                Create Free Account
              </button>
            </div>
          </motion.section>
        </main>

        <AnimatePresence>
          {showAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
              onClick={() => setShowAuth(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto"
                style={{
                  background: 'hsl(var(--cf-surface))',
                  border: '1px solid hsl(var(--cf-border))',
                  color: 'hsl(var(--cf-text))',
                }}
              >
                <div className="w-10 h-1 rounded-full mx-auto mb-6 sm:hidden" style={{ background: 'hsl(var(--cf-border))' }} />

                <h2 className="text-xl font-bold text-center mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Join Contractor Finder'}
                </h2>
                <p className="text-sm text-center mb-6" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                  {mode === 'login' ? 'Sign in to access the contractor pipeline' : 'Create an account to get started'}
                </p>

                <div className="space-y-3 mb-5">
                  <button
                    onClick={() => handleSSO('google')}
                    disabled={!!ssoLoading}
                    className="w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: 'hsl(var(--cf-surface-alt))',
                      border: '1px solid hsl(var(--cf-border))',
                      color: 'hsl(var(--cf-text))',
                    }}
                  >
                    {ssoLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'hsl(var(--cf-border))', borderTopColor: 'hsl(var(--cf-primary))' }} />
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
                    className="w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: 'hsl(var(--cf-text))',
                      color: 'hsl(var(--cf-surface))',
                    }}
                  >
                    {ssoLoading === 'apple' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    )}
                    Continue with Apple
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{ background: 'hsl(var(--cf-border))' }} />
                  <span className="text-xs" style={{ color: 'hsl(var(--cf-text-subtle))' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'hsl(var(--cf-border))' }} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl text-sm focus:outline-none transition-colors"
                      style={{
                        background: 'hsl(var(--cf-surface-alt))',
                        border: '1px solid hsl(var(--cf-border))',
                        color: 'hsl(var(--cf-text))',
                      }}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full h-12 pl-10 pr-12 rounded-xl text-sm focus:outline-none transition-colors"
                      style={{
                        background: 'hsl(var(--cf-surface-alt))',
                        border: '1px solid hsl(var(--cf-border))',
                        color: 'hsl(var(--cf-text))',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'hsl(var(--cf-text-subtle))' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg"
                    style={{ background: 'hsl(var(--cf-primary))' }}
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

                <p className="mt-5 text-sm text-center" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="font-medium"
                    style={{ color: 'hsl(var(--cf-primary))' }}
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
