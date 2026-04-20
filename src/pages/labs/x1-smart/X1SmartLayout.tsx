import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Users, Home, Sliders, Sparkles } from 'lucide-react';
import IntelligenceFeed from './screens/IntelligenceFeed';
import PeopleLayer from './screens/PeopleLayer';
import SpacesLayer from './screens/SpacesLayer';
import AutonomyLayer from './screens/AutonomyLayer';

type Surface = 'feed' | 'people' | 'spaces' | 'autonomy';

const TABS: { key: Surface; label: string; icon: any }[] = [
  { key: 'feed', label: 'Intelligence', icon: Activity },
  { key: 'people', label: 'People', icon: Users },
  { key: 'spaces', label: 'Spaces', icon: Home },
  { key: 'autonomy', label: 'Autonomy', icon: Sliders },
];

const X1SmartLayout = () => {
  const [surface, setSurface] = useState<Surface>('feed');

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#0a0a0a] relative overflow-hidden">
      {/* Vibrant ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-gradient-to-br from-violet-300/40 via-fuchsia-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 -right-20 w-[480px] h-[480px] bg-gradient-to-br from-cyan-200/40 via-sky-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] bg-gradient-to-br from-amber-200/30 via-rose-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 border-b border-black/[0.06] backdrop-blur-xl bg-white/60 sticky top-0">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/labs"
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Labs</span>
            </Link>
            <div className="h-4 w-px bg-black/10" />
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-400 to-fuchsia-400 rounded-xl blur-md opacity-40 -z-10" />
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight leading-none">X1 Smart</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-violet-600/80 mt-1 font-medium">Xthings One · Intelligence layer</div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 bg-white/80 border border-black/[0.06] rounded-full px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium">4 spaces · 12 people · learning</span>
          </div>
        </div>

        {/* Surface tabs — pill style */}
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
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-violet-500/30"
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
            key={surface}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {surface === 'feed' && <IntelligenceFeed />}
            {surface === 'people' && <PeopleLayer />}
            {surface === 'spaces' && <SpacesLayer />}
            {surface === 'autonomy' && <AutonomyLayer />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default X1SmartLayout;
