import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Users, Home, Sliders, Sparkles, Building2, LogOut, Clock, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import X1SmartLogin from './X1SmartLogin';
import IntelligenceFeed from './screens/IntelligenceFeed';
import TimelineMemory from './screens/TimelineMemory';
import ResidentialPeople from './screens/residential/ResidentialPeople';
import ResidentialSpaces from './screens/residential/ResidentialSpaces';
import ResidentialAutonomy from './screens/residential/ResidentialAutonomy';
import CommercialPeople from './screens/commercial/CommercialPeople';
import CommercialSpaces from './screens/commercial/CommercialSpaces';
import CommercialAutonomy from './screens/commercial/CommercialAutonomy';
import { AutonomyProvider, useAutonomy, AUTONOMY_LEVELS, type AutonomyLevel } from './AutonomyContext';

type AppMode = 'aihome' | 'aispaces';
type Surface = 'feed' | 'people' | 'spaces' | 'autonomy' | 'timeline';

const TABS: { key: Surface; label: string; icon: any }[] = [
  { key: 'feed', label: 'Intelligence', icon: Activity },
  { key: 'people', label: 'People', icon: Users },
  { key: 'spaces', label: 'Spaces', icon: Home },
  { key: 'autonomy', label: 'Autonomy', icon: Sliders },
  { key: 'timeline', label: 'Timeline', icon: Clock },
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

const X1SmartLayoutInner = () => {
  const [appMode, setAppMode] = useState<AppMode>('aihome');
  const [surface, setSurface] = useState<Surface>('feed');
  const { user, loading, signOut } = useAuth();
  const { level, setLevel } = useAutonomy();

  const meta = APP_META[appMode];
  const AppIcon = meta.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-stone-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <X1SmartLogin />;
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#0a0a0a]">
      {/* Top bar */}
      <header className="border-b border-black/[0.06] bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link to="/labs" className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Labs</span>
          </Link>
          <div className="h-4 w-px bg-black/10" />
          <div className="flex items-center gap-2">
            <AppIcon className="w-4 h-4 text-stone-700" strokeWidth={2} />
            <span className="text-[14px] font-semibold tracking-tight">{meta.name}</span>
            <span className="text-[12px] text-stone-400 hidden sm:inline">· {meta.tagline}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <AutonomyChip level={level} onChange={setLevel} />
            {/* App mode toggle */}
            <div className="inline-flex rounded-lg border border-black/10 overflow-hidden text-[12px]">
              <ModeToggleBtn active={appMode === 'aihome'} onClick={() => setAppMode('aihome')} label="AiHome" />
              <ModeToggleBtn active={appMode === 'aispaces'} onClick={() => setAppMode('aispaces')} label="AiSpaces" />
            </div>
            <button
              onClick={signOut}
              className="text-stone-400 hover:text-stone-900 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Surface tabs */}
        <nav className="max-w-6xl mx-auto px-5">
          <div className="flex gap-1 -mb-px">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = surface === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSurface(t.key)}
                  className={`relative flex items-center gap-2 px-3 py-2.5 text-[13px] border-b-2 transition-colors ${
                    active
                      ? 'border-stone-900 text-stone-900 font-medium'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
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
            {surface === 'feed' && <IntelligenceFeed appMode={appMode} />}
            {surface === 'people' && (appMode === 'aihome' ? <ResidentialPeople /> : <CommercialPeople />)}
            {surface === 'spaces' && (appMode === 'aihome' ? <ResidentialSpaces /> : <CommercialSpaces />)}
            {surface === 'autonomy' && (appMode === 'aihome' ? <ResidentialAutonomy /> : <CommercialAutonomy />)}
            {surface === 'timeline' && <TimelineMemory appMode={appMode} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const X1SmartLayout = () => (
  <AutonomyProvider>
    <X1SmartLayoutInner />
  </AutonomyProvider>
);

const ModeToggleBtn = ({ active, onClick, label }: {
  active: boolean; onClick: () => void; label: string;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 transition-colors ${
      active ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:text-stone-900'
    }`}
  >
    {label}
  </button>
);

const _AutonomyChip_separator = null;

const AutonomyChip = ({ level, onChange }: { level: AutonomyLevel; onChange: (l: AutonomyLevel) => void }) => {
  const [open, setOpen] = useState(false);
  const current = AUTONOMY_LEVELS.find((l) => l.value === level)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
        title="Autonomy level"
      >
        <Brain className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider text-[10px] text-violet-500">Autonomy</span>
        <span>{current.label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-black/[0.08] shadow-2xl z-50 p-2 overflow-hidden">
            {AUTONOMY_LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => { onChange(l.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  l.value === level ? 'bg-violet-50' : 'hover:bg-stone-50'
                }`}
              >
                <div className={`text-[13px] font-bold ${l.value === level ? 'text-violet-700' : 'text-stone-900'}`}>{l.label}</div>
                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">{l.description}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default X1SmartLayout;
