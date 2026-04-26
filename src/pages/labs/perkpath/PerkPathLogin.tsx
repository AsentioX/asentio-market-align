import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Mail, Lock, User, Eye, EyeOff, Sparkles, Search, MapPin, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerkPathAuth } from '@/hooks/usePerkPathAuth';
import { toast } from 'sonner';

const PerkPathLogin = () => {
  const { signIn, signUp } = usePerkPathAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Check your email to verify your account.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <Link to="/labs" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">PerkPath</h1>
            <button onClick={() => { setShowAuth(true); setMode('login'); }} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Sign In
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 pt-8 pb-8">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-10">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <Wallet className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight">
              Your Personal<br /><span className="text-emerald-600">Benefit Agent</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
              Stop leaving money on the table. PerkPath organizes every membership you hold — credit cards, AAA, AARP, museums, alumni — and tells you which one to use, where, and when.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setShowAuth(true); setMode('signup'); }} className="h-11 px-6 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors">
                Get Started Free
              </button>
              <button onClick={() => { setShowAuth(true); setMode('login'); }} className="h-11 px-6 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
                Sign In
              </button>
            </div>
          </motion.section>

          <section className="space-y-3 mb-10">
            {[
              { icon: Layers, title: 'Work, Home & Play', body: 'Your benefits, organized by life context. See what applies right now.', color: 'text-violet-600 bg-violet-50' },
              { icon: Search, title: 'Universal Search', body: 'Type "Hertz" or "hotel" — see your best card, status, and discount in one card.', color: 'text-emerald-600 bg-emerald-50' },
              { icon: Sparkles, title: 'Perk Stacking', body: 'Combine a Chase reward with an AAA discount and a Hyatt status perk on the same booking.', color: 'text-amber-600 bg-amber-50' },
              { icon: MapPin, title: 'Nearby Now', body: 'When you walk past a partner location, your phone tells you to flash a card.', color: 'text-rose-600 bg-rose-50' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100"
              >
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">{f.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </section>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            PII-light by design. We never ask for account numbers — just the membership name and tier.
          </p>
        </main>
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuth(false)}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
              <h2 className="text-xl font-bold text-slate-900 text-center mb-1">{mode === 'login' ? 'Welcome Back' : 'Create your vault'}</h2>
              <p className="text-sm text-slate-500 text-center mb-6">
                {mode === 'login' ? 'Sign in to your perks' : 'Your demo memberships will be ready immediately'}
              </p>
              <form onSubmit={submit} className="space-y-3">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-12 pl-10 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {loading ? '…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>
              <p className="mt-5 text-sm text-slate-500 text-center">
                {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-emerald-600 font-semibold hover:text-emerald-700">
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

export default PerkPathLogin;
