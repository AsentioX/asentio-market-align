import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building2, Mail, Lock, ArrowLeft, Eye, EyeOff, Activity, Users, Sliders, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

const features = [
  {
    icon: Activity,
    title: 'Intelligence Feed',
    description: 'A live stream of insights from your spaces, blending people, environment, and autonomy signals.',
    grad: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'People Layer',
    description: 'Understand presence, preferences, and routines for residents, employees, and guests.',
    grad: 'from-indigo-500 via-violet-500 to-fuchsia-500',
  },
  {
    icon: Home,
    title: 'Spaces Layer',
    description: 'See how rooms, zones, and entire properties respond to context in real time.',
    grad: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    icon: Sliders,
    title: 'Autonomy Controls',
    description: 'Tune how much the system decides on its own — from manual to fully autonomous.',
    grad: 'from-cyan-500 via-sky-500 to-blue-500',
  },
];

const stats = [
  { value: '2', label: 'Modes' },
  { value: '4', label: 'Layers' },
  { value: '∞', label: 'Signals' },
];

export default function X1SmartLogin() {
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
        toast.success('Welcome to X1 Smart');
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
        redirect_uri: window.location.origin + '/labs/x1-smart',
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
    <div className="min-h-screen bg-[#fafaf7] text-[#0a0a0a] relative overflow-hidden">
      {/* Vibrant ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-gradient-to-br from-violet-300/40 via-fuchsia-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 -right-20 w-[480px] h-[480px] bg-gradient-to-br from-cyan-200/40 via-sky-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] bg-gradient-to-br from-amber-200/30 via-rose-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <header className="relative z-10 border-b border-black/[0.06] backdrop-blur-xl bg-white/60 sticky top-0">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Labs</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">X1 Smart</h1>
          <button
            onClick={() => { setShowAuth(true); setMode('login'); }}
            className="text-xs font-medium text-stone-900 hover:text-stone-600"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-lg mx-auto w-full px-4 pb-12 overflow-y-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-12 pb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl">
              <Home className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl">
              <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-3 leading-tight">
            Spaces that<br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">think with you.</span>
          </h2>

          <p className="text-sm text-stone-600 leading-relaxed max-w-xs mx-auto mb-8">
            X1 Smart is the intelligence layer for residential and commercial properties — sensing people, spaces, and context in real time.
          </p>

          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={() => { setShowAuth(true); setMode('signup'); }}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-semibold text-sm text-white hover:opacity-90 transition-all shadow-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => { setShowAuth(true); setMode('login'); }}
              className="h-11 px-6 rounded-xl bg-white border border-black/[0.08] text-sm font-medium hover:bg-stone-50 transition-all"
            >
              Sign In
            </button>
          </div>

          <div className="flex justify-center gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
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
          <ChevronDown className="w-5 h-5 text-stone-300 animate-bounce" />
        </motion.div>

        <section className="space-y-4 mb-12">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">What's Inside</h3>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-black/[0.06] hover:border-black/[0.12] transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.grad} flex items-center justify-center shrink-0 shadow-md`}>
                <feature.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">{feature.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{feature.description}</p>
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
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 border border-indigo-500/15">
            <Sparkles className="w-8 h-8 text-violet-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Step Into Your Spaces</h3>
            <p className="text-xs text-stone-600 mb-4">Sign in to explore the X1 AiHome and AiSpaces intelligence layers.</p>
            <button
              onClick={() => { setShowAuth(true); setMode('signup'); }}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg"
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
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-black/[0.08] rounded-t-3xl sm:rounded-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-6 sm:hidden" />

              <h2 className="text-xl font-bold text-center mb-1">
                {mode === 'login' ? 'Welcome Back' : 'Join X1 Smart'}
              </h2>
              <p className="text-sm text-stone-500 text-center mb-6">
                {mode === 'login' ? 'Sign in to your spaces' : 'Create an account to get started'}
              </p>

              <div className="space-y-3 mb-5">
                <button
                  onClick={() => handleSSO('google')}
                  disabled={!!ssoLoading}
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white border border-black/[0.1] hover:bg-stone-50 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {ssoLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-stone-200 border-t-violet-500 rounded-full animate-spin" />
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
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm font-medium disabled:opacity-50"
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

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-black/[0.08]" />
                <span className="text-xs text-stone-400">or</span>
                <div className="flex-1 h-px bg-black/[0.08]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-50 border border-black/[0.08] text-sm placeholder:text-stone-400 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-12 pl-10 pr-12 rounded-xl bg-stone-50 border border-black/[0.08] text-sm placeholder:text-stone-400 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
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

              <p className="mt-5 text-sm text-stone-500 text-center">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-violet-600 hover:text-violet-500 font-medium"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
