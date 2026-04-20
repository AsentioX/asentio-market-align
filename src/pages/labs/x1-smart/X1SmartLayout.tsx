import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Users, Home, Sliders, Sparkles, Building2 } from 'lucide-react';
import IntelligenceFeed from './screens/IntelligenceFeed';
import ResidentialPeople from './screens/residential/ResidentialPeople';
import ResidentialSpaces from './screens/residential/ResidentialSpaces';
import ResidentialAutonomy from './screens/residential/ResidentialAutonomy';
import CommercialPeople from './screens/commercial/CommercialPeople';
import CommercialSpaces from './screens/commercial/CommercialSpaces';
import CommercialAutonomy from './screens/commercial/CommercialAutonomy';

type AppMode = 'aihome' | 'aispaces';
type Surface = 'feed' | 'people' | 'spaces' | 'autonomy';

const TABS: { key: Surface; label: string; icon: any }[] = [
  { key: 'feed', label: 'Intelligence', icon: Activity },
  { key: 'people', label: 'People', icon: Users },
  { key: 'spaces', label: 'Spaces', icon: Home },
  { key: 'autonomy', label: 'Autonomy', icon: Sliders },
];

const APP_META = {
  aihome: {
    name: 'X1 AiHome',
    tagline: 'Residential intelligence layer',
    icon: Home,
    grad: 'from-emerald-500 via-teal-500 to-cyan-500',
    badge: '3 homes · 5 people · learning',
    badgeDot: 'bg-emerald-500',
  },
  aispaces: {
    name: 'X1 AiSpaces',
    tagline: 'Commercial intelligence layer',
    icon: Building2,
    grad: 'from-indigo-500 via-violet-500 to-fuchsia-500',
    badge: '3 sites · 17 people · learning',
    badgeDot: 'bg-indigo-500',
  },
} as const;

const X1SmartLayout = () => {
  const [appMode, setAppMode] = useState<AppMode>('aihome');
  const [surface, setSurface] = useState<Surface>('feed');

  const meta = APP_META[appMode];
  const AppIcon = meta.icon;

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

      {/* Top bar */}
      <header className="relative z-10 border-b border-black/[0.06] backdrop-blur-xl bg-white/60 sticky top-0">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <Link to="/labs" className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Labs</span>
            </Link>
            <div className="h-4 w-px bg-black/10" />
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <motion.div
                  key={appMode}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.grad} flex items-center justify-center shadow-lg`}
                >
                  <AppIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight leading-none">{meta.name}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mt-1 font-medium">{meta.tagline}</div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-stone-500 bg-white/80 border border-black/[0.06] rounded-full px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.badgeDot} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${meta.badgeDot}`} />
            </span>
            <span className="font-medium">{meta.badge}</span>
          </div>
        </div>

        {/* App mode toggle: AiHome ↔ AiSpaces */}
        <div className="max-w-6xl mx-auto px-5 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-stone-900 shadow-lg">
            <ModeToggleBtn
              active={appMode === 'aihome'}
              onClick={() => setAppMode('aihome')}
              icon={Home}
              label="X1 AiHome"
              sublabel="Residential"
              activeGrad="from-emerald-500 to-cyan-500"
            />
            <ModeToggleBtn
              active={appMode === 'aispaces'}
              onClick={() => setAppMode('aispaces')}
              icon={Building2}
              label="X1 AiSpaces"
              sublabel="Commercial"
              activeGrad="from-indigo-500 to-violet-600"
            />
          </div>
        </div>

        {/* Surface tabs */}
        <nav className="max-w-6xl mx-auto px-5 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-white/80 border border-black/[0.06] backdrop-blur-sm shadow-sm">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = surface === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSurface(t.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors ${
                    active ? 'text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="x1-tab-pill"
                      className={`absolute inset-0 bg-gradient-to-br ${meta.grad} rounded-xl shadow-md`}
                      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="font-medium relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Surface content */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${appMode}-${surface}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {surface === 'feed' && <IntelligenceFeed />}
            {surface === 'people' && (appMode === 'aihome' ? <ResidentialPeople /> : <CommercialPeople />)}
            {surface === 'spaces' && (appMode === 'aihome' ? <ResidentialSpaces /> : <CommercialSpaces />)}
            {surface === 'autonomy' && (appMode === 'aihome' ? <ResidentialAutonomy /> : <CommercialAutonomy />)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const ModeToggleBtn = ({ active, onClick, icon: Icon, label, sublabel, activeGrad }: {
  active: boolean; onClick: () => void; icon: any; label: string; sublabel: string; activeGrad: string;
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl transition-colors ${
      active ? 'text-white' : 'text-stone-400 hover:text-white'
    }`}
  >
    {active && (
      <motion.div
        layoutId="app-mode-pill"
        className={`absolute inset-0 bg-gradient-to-br ${activeGrad} rounded-xl shadow-lg`}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
      />
    )}
    <Icon className="w-4 h-4 relative z-10" strokeWidth={2.5} />
    <div className="relative z-10 text-left">
      <div className="text-[13px] font-bold leading-none">{label}</div>
      <div className="text-[9px] uppercase tracking-[0.15em] opacity-80 mt-0.5">{sublabel}</div>
    </div>
  </button>
);

export default X1SmartLayout;
