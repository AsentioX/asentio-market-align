import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Warehouse, KeyRound, Users, AlertTriangle, Sparkles } from 'lucide-react';
import { SPACES, PEOPLE, type Space } from '../x1Data';
import { STATE_STYLES } from '../x1Theme';
import { toast } from 'sonner';

const TYPE_ICON = {
  home: Home, office: Building2, rental: KeyRound, warehouse: Warehouse,
} as const;

const TYPE_GRADIENT = {
  home: 'from-emerald-400 via-teal-400 to-cyan-400',
  office: 'from-indigo-400 via-blue-500 to-cyan-500',
  rental: 'from-amber-400 via-orange-400 to-rose-400',
  warehouse: 'from-violet-500 via-purple-500 to-fuchsia-500',
} as const;

const MODES = ['home', 'away', 'night', 'business'] as const;
type Mode = typeof MODES[number];

const SpacesLayer = () => {
  const [selected, setSelected] = useState<Space>(SPACES[0]);
  const [modeOverride, setModeOverride] = useState<Record<string, Mode>>({});

  const currentMode = modeOverride[selected.id] ?? selected.mode;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Spaces & context</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Organized by <span className="text-stone-900 font-semibold">situation</span>, not devices.</p>
      </div>

      {/* Space selector cards — visual hero tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SPACES.map((space) => {
          const TypeIcon = TYPE_ICON[space.type];
          const state = STATE_STYLES[space.state];
          const active = selected.id === space.id;
          const grad = TYPE_GRADIENT[space.type];
          return (
            <button
              key={space.id}
              onClick={() => setSelected(space)}
              className={`relative text-left rounded-2xl border p-4 transition-all overflow-hidden ${
                active
                  ? 'border-stone-900 shadow-lg bg-white scale-[1.01]'
                  : 'border-black/[0.06] bg-white hover:border-black/15 hover:shadow-md shadow-sm'
              }`}
            >
              {/* Decorative gradient orb */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${grad} opacity-20 rounded-full blur-2xl -translate-y-6 translate-x-6`} />

              <div className="relative flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                  <TypeIcon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${state.soft} ${state.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${state.text}`}>{state.label}</span>
                </span>
              </div>
              <div className="relative text-sm font-semibold text-stone-900 leading-tight">{space.name}</div>
              <div className="relative flex items-center gap-3 mt-2 text-[11px] text-stone-500 font-medium">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{space.presentPeople.length}</span>
                {space.activeEvents > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <AlertTriangle className="w-3 h-3" />{space.activeEvents}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-black/[0.06] bg-white shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-black/[0.06] relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${TYPE_GRADIENT[selected.type]} opacity-10 rounded-full blur-3xl -translate-y-20 translate-x-20`} />
          <div className="relative flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-stone-900">{selected.name}</h3>
              <div className="text-[12px] text-stone-500 mt-1 font-medium">
                {selected.presentPeople.length === 0
                  ? 'No one present'
                  : `${selected.presentPeople.map((id) => PEOPLE.find((p) => p.id === id)?.name).filter(Boolean).join(', ')} present`}
              </div>
            </div>
          </div>

          {/* Mode switcher — modern pill */}
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-2">Mode</div>
            <div className="inline-flex p-1 rounded-2xl bg-stone-100 border border-black/[0.04]">
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModeOverride({ ...modeOverride, [selected.id]: m });
                    toast.success(`${selected.name} → ${m} mode`, { description: 'X1 is adapting scenes accordingly.' });
                  }}
                  className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    currentMode === m ? 'text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {currentMode === m && (
                    <motion.div
                      layoutId={`mode-pill-${selected.id}`}
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-sm"
                      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                    />
                  )}
                  <span className="relative z-10">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floor map */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">Floorplan · live</div>
            <div className="grid grid-cols-2 gap-2">
              {selected.rooms.map((r) => (
                <div
                  key={r.name}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    r.activity === 'active'
                      ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50/30'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-stone-900">{r.name}</span>
                    {r.activity === 'active' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">{r.sensors} sensors · {r.activity}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Suggested actions
            </div>
            <div className="space-y-2">
              {selected.suggestedActions.length === 0 && (
                <div className="text-sm text-stone-400 italic">All caught up. X1 is observing.</div>
              )}
              {selected.suggestedActions.map((a) => (
                <button
                  key={a}
                  onClick={() => toast.success('Action queued', { description: a })}
                  className="w-full text-left rounded-xl border border-stone-200 bg-white hover:bg-violet-50 hover:border-violet-300 px-4 py-3 text-sm text-stone-800 font-medium transition-all flex items-center justify-between group"
                >
                  <span>{a}</span>
                  <span className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpacesLayer;
