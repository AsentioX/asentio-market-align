import { useState } from 'react';
import { Dumbbell, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Target, Trophy, TrendingUp, Zap, BarChart3, Users, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWOBuddyAuth } from '@/hooks/useWOBuddyAuth';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    icon: Target,
    title: 'Goal-Driven Training',
    description: 'Set personalized fitness goals and get AI-powered workout plans tailored to your body and ambitions.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track every rep, set, and milestone with rich visual analytics. Watch your strength curve climb over time.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Trophy,
    title: 'Social Competitions',
    description: 'Challenge friends and the community. Earn achievements and climb leaderboards as you train.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: Zap,
    title: 'Smart Exercise Library',
    description: '500+ exercises with form guides, muscle group targeting, and progressive overload suggestions.',
    color: 'from-violet-500 to-violet-600',
  },
];

const stats = [
  { value: '500+', label: 'Exercises' },
  { value: '12', label: 'Goal Drivers' },
  { value: '∞', label: 'Potential' },
];

const WOBuddyLogin = () => {
  const { signIn, signUp } = useWOBuddyAuth();
  const [showAuth, setShowAuth] = useState(false);
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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-xl border-b border-stone-900/10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-2 text-stone-900/60 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Labs</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">
            W.O.<span className="text-emerald-400">Buddy</span>
          </h1>
          <button
            onClick={() => { setShowAuth(true); setMode('login'); }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-12 overflow-y-auto">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-12 pb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
            <Dumbbell className="w-10 h-10 text-stone-900" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-3 leading-tight">
            Your Workout.<br />
            <span className="text-emerald-400">Your Way.</span>
          </h2>

          <p className="text-sm text-stone-900/50 leading-relaxed max-w-xs mx-auto mb-8">
            W.O.Buddy is a smart fitness companion that adapts to your goals, tracks your progress, and keeps you motivated with social competitions.
          </p>

          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={() => { setShowAuth(true); setMode('signup'); }}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get Started Free
            </button>
            <button
              onClick={() => { setShowAuth(true); setMode('login'); }}
              className="h-11 px-6 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 text-sm font-medium hover:bg-stone-900/10 transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-[10px] text-stone-900/40 uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mb-8"
        >
          <ChevronDown className="w-5 h-5 text-stone-900/20 animate-bounce" />
        </motion.div>

        {/* Features */}
        <section className="space-y-4 mb-12">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900/30 mb-4">What You Get</h3>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="flex gap-4 p-4 rounded-2xl bg-stone-900/[0.04] border border-stone-900/10 hover:border-stone-900/15 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0`}>
                <feature.icon className="w-5 h-5 text-stone-900" />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">{feature.title}</h4>
                <p className="text-xs text-stone-900/40 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900/30 mb-4">How It Works</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Tell us your fitness goals — lose weight, build muscle, improve endurance, or just stay active.' },
              { step: '2', text: 'Get a personalized workout plan built around exercises you enjoy and equipment you have.' },
              { step: '3', text: 'Log workouts, track progress, compete with friends, and watch yourself transform.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-3 p-3"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </span>
                <p className="text-sm text-stone-900/50 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center pb-8"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-700/5 border border-emerald-500/15">
            <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Ready to Start?</h3>
            <p className="text-xs text-stone-900/40 mb-4">Join W.O.Buddy and transform how you train. It's free.</p>
            <button
              onClick={() => { setShowAuth(true); setMode('signup'); }}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              Create Free Account
            </button>
          </div>
        </motion.section>
      </main>

      {/* Auth Modal Overlay */}
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
              className="w-full max-w-lg bg-[#13131a] border border-stone-900/10 rounded-t-3xl sm:rounded-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full bg-stone-900/10 mx-auto mb-6 sm:hidden" />

              <h2 className="text-xl font-bold text-center mb-1">
                {mode === 'login' ? 'Welcome Back' : 'Join W.O.Buddy'}
              </h2>
              <p className="text-sm text-stone-900/40 text-center mb-6">
                {mode === 'login'
                  ? 'Sign in to continue your fitness journey'
                  : 'Create an account to start training'}
              </p>

              {/* SSO Buttons */}
              <div className="space-y-3 mb-5">
                <button
                  onClick={() => handleSSO('google')}
                  disabled={!!ssoLoading}
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 hover:bg-stone-900/10 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {ssoLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-stone-900/20 border-t-white rounded-full animate-spin" />
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
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 hover:bg-stone-900/10 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {ssoLoading === 'apple' ? (
                    <div className="w-5 h-5 border-2 border-stone-900/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  )}
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-stone-900/[0.08]" />
                <span className="text-xs text-stone-900/30">or</span>
                <div className="flex-1 h-px bg-stone-900/[0.08]" />
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-900/30" />
                    <input
                      type="text"
                      placeholder="Display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 text-sm placeholder:text-stone-900/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-900/30" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 text-sm placeholder:text-stone-900/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-900/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-12 pl-10 pr-12 rounded-xl bg-stone-900/[0.06] border border-stone-900/10 text-sm placeholder:text-stone-900/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-900/30 hover:text-stone-900/60"
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
                    <div className="w-5 h-5 border-2 border-stone-900/20 border-t-white rounded-full animate-spin mx-auto" />
                  ) : mode === 'login' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <p className="mt-5 text-sm text-stone-900/40 text-center">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
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
};

export default WOBuddyLogin;
