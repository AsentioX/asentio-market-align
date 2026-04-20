import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Users, Home, Sliders, Sparkles } from 'lucide-react';
import { X1_THEME } from './x1Theme';
import IntelligenceFeed from './screens/IntelligenceFeed';
import PeopleLayer from './screens/PeopleLayer';
import SpacesLayer from './screens/SpacesLayer';
import AutonomyLayer from './screens/AutonomyLayer';

type Surface = 'feed' | 'people' | 'spaces' | 'autonomy';

const TABS: { key: Surface; label: string; icon: any; sub: string }[] = [
  { key: 'feed', label: 'Intelligence', icon: Activity, sub: 'What\'s happening' },
  { key: 'people', label: 'People', icon: Users, sub: 'Who & identity' },
  { key: 'spaces', label: 'Spaces', icon: Home, sub: 'Where & context' },
  { key: 'autonomy', label: 'Autonomy', icon: Sliders, sub: 'How it acts' },
];

const X1SmartLayout = () => {
  const [surface, setSurface] = useState<Surface>('feed');

  return (
    <div className={`min-h-screen ${X1_THEME.bgGradient} ${X1_THEME.text} relative overflow-hidden`}>
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/[0.06] backdrop-blur-xl bg-black/20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/labs"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Labs</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0a0e14]" strokeWidth={2.5} />
                </div>
                <div className="absolute -inset-1 bg-cyan-400/30 rounded-lg blur-md -z-10" />
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight leading-none">X1 Smart</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70 mt-1">Xthings One · Intelligence layer</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>4 spaces · 12 people · learning</span>
          </div>
        </div>

        {/* Surface tabs */}
        <nav className="max-w-6xl mx-auto px-5 flex gap-1 -mb-px">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = surface === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setSurface(t.key)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                  active ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{t.label}</span>
                <span className="hidden sm:inline text-[11px] text-white/30 font-normal">{t.sub}</span>
                {active && (
                  <motion.div
                    layoutId="x1-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  />
                )}
              </button>
            );
          })}
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
