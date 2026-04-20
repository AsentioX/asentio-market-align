import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Warehouse, KeyRound, Users, AlertTriangle, Sparkles } from 'lucide-react';
import { SPACES, PEOPLE, type Space } from '../x1Data';
import { STATE_STYLES } from '../x1Theme';
import { toast } from 'sonner';

const TYPE_ICON = {
  home: Home, office: Building2, rental: KeyRound, warehouse: Warehouse,
} as const;

const MODES = ['home', 'away', 'night', 'business'] as const;
type Mode = typeof MODES[number];

const SpacesLayer = () => {
  const [selected, setSelected] = useState<Space>(SPACES[0]);
  const [modeOverride, setModeOverride] = useState<Record<string, Mode>>({});

  const currentMode = modeOverride[selected.id] ?? selected.mode;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 font-medium mb-1">Spaces & context</h2>
        <p className="text-[15px] text-white/70">Organized by <span className="text-white">situation</span>, not devices.</p>
      </div>

      {/* Space selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SPACES.map((space) => {
          const TypeIcon = TYPE_ICON[space.type];
          const state = STATE_STYLES[space.state];
          const active = selected.id === space.id;
          return (
            <button
              key={space.id}
              onClick={() => setSelected(space)}
              className={`text-left rounded-2xl border backdrop-blur-sm p-4 transition-all ${
                active
                  ? 'border-cyan-400/40 bg-cyan-400/[0.04] shadow-[0_0_24px_-8px_rgba(34,211,238,0.4)]'
                  : 'border-white/[0.06] bg-white/[0.025] hover:border-white/12 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  active ? 'bg-cyan-400/15 text-cyan-300' : 'bg-white/[0.04] text-white/50'
                }`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${state.text}`}>{state.label}</span>
                </span>
              </div>
              <div className="text-sm font-medium text-white leading-tight">{space.name}</div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-white/40">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{space.presentPeople.length}</span>
                {space.activeEvents > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-300/80">
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
        className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm overflow-hidden"
      >
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{selected.name}</h3>
              <div className="text-[11px] text-white/45 mt-0.5">
                {selected.presentPeople.length === 0
                  ? 'No one present'
                  : `${selected.presentPeople.map((id) => PEOPLE.find((p) => p.id === id)?.name).filter(Boolean).join(', ')} present`}
              </div>
            </div>
          </div>

          {/* Mode switcher */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-2">Mode</div>
            <div className="inline-flex p-1 rounded-xl bg-black/30 border border-white/[0.06]">
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModeOverride({ ...modeOverride, [selected.id]: m });
                    toast.success(`${selected.name} → ${m} mode`, { description: 'X1 is adapting scenes accordingly.' });
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    currentMode === m ? 'bg-cyan-400 text-[#0a0e14]' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floor map */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-2.5">Floorplan · live</div>
            <div className="grid grid-cols-2 gap-1.5">
              {selected.rooms.map((r) => (
                <div
                  key={r.name}
                  className={`rounded-xl border p-3 transition-all ${
                    r.activity === 'active'
                      ? 'border-cyan-400/30 bg-cyan-400/[0.04]'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{r.name}</span>
                    {r.activity === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />}
                  </div>
                  <div className="text-[10px] text-white/40">{r.sensors} sensors · {r.activity}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/80 font-semibold mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Suggested actions
            </div>
            <div className="space-y-2">
              {selected.suggestedActions.length === 0 && (
                <div className="text-sm text-white/40 italic">All caught up. X1 is observing.</div>
              )}
              {selected.suggestedActions.map((a) => (
                <button
                  key={a}
                  onClick={() => toast.success('Action queued', { description: a })}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/30 px-3.5 py-2.5 text-sm text-white/85 transition-all"
                >
                  {a}
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
