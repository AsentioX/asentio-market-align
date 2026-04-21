import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Mountain, KeyRound, Users, AlertTriangle, Sparkles, Activity } from 'lucide-react';
import { RES_SPACES, RES_PEOPLE, type ResSpace, type ResHomeMode } from '../../residentialData';
import { toast } from 'sonner';

const TYPE_ICON = { primary: Home, vacation: Mountain, rental: KeyRound } as const;
const TYPE_GRAD = {
  primary: 'from-emerald-400 via-teal-400 to-cyan-400',
  vacation: 'from-violet-500 via-purple-500 to-fuchsia-500',
  rental: 'from-cyan-500 via-blue-400 to-indigo-400',
} as const;

const STATE_META = {
  active: { dot: 'bg-indigo-500', label: 'Active', text: 'text-indigo-700', soft: 'bg-indigo-50', border: 'border-indigo-200' },
  secure: { dot: 'bg-emerald-500', label: 'Secure', text: 'text-emerald-700', soft: 'bg-emerald-50', border: 'border-emerald-200' },
  alert: { dot: 'bg-rose-500 animate-pulse', label: 'Alert', text: 'text-rose-700', soft: 'bg-rose-50', border: 'border-rose-200' },
} as const;

const MODES: { value: ResHomeMode; label: string; description: string }[] = [
  { value: 'home', label: 'Home', description: 'Welcoming · lights, comfort scenes active' },
  { value: 'away', label: 'Away', description: 'Doors locked · system armed · eco HVAC' },
  { value: 'night', label: 'Night', description: 'Quiet · doors locked · pathway lights only' },
  { value: 'vacation', label: 'Vacation', description: 'Long away · randomized lights · max alerts' },
];

const ResidentialSpaces = () => {
  const [selected, setSelected] = useState<ResSpace>(RES_SPACES[0]);
  const [modeOverride, setModeOverride] = useState<Record<string, ResHomeMode>>({});
  const currentMode = modeOverride[selected.id] ?? selected.mode;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Spaces · lifestyle modes</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Each home runs a <span className="text-stone-900 font-semibold">lifestyle mode</span>, not a list of devices.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {RES_SPACES.map((space) => {
          const Icon = TYPE_ICON[space.type];
          const state = STATE_META[space.state];
          const active = selected.id === space.id;
          const grad = TYPE_GRAD[space.type];
          return (
            <button
              key={space.id}
              onClick={() => setSelected(space)}
              className={`relative text-left rounded-2xl border p-4 transition-all overflow-hidden ${
                active ? 'border-stone-900 shadow-lg bg-white' : 'border-black/[0.06] bg-white hover:border-black/15 hover:shadow-md shadow-sm'
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${grad} opacity-20 rounded-full blur-2xl -translate-y-6 translate-x-6`} />
              <div className="relative flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${state.soft} ${state.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${state.text}`}>{state.label}</span>
                </span>
              </div>
              <div className="relative text-sm font-semibold text-stone-900 leading-tight">{space.name}</div>
              <div className="relative flex items-center gap-3 mt-2 text-[11px] text-stone-500 font-medium">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{space.presentPeople.length} present</span>
                <span className="text-stone-300">·</span>
                <span className="capitalize">{modeOverride[space.id] ?? space.mode} mode</span>
                {space.alerts > 0 && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="inline-flex items-center gap-1 text-rose-700"><AlertTriangle className="w-3 h-3" />{space.alerts}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-black/[0.06] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/[0.06] relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${TYPE_GRAD[selected.type]} opacity-10 rounded-full blur-3xl -translate-y-20 translate-x-20`} />
          <div className="relative mb-5">
            <h3 className="text-2xl font-bold tracking-tight text-stone-900">{selected.name}</h3>
            <div className="text-[12px] text-stone-500 mt-1 font-medium">
              {selected.presentPeople.length === 0
                ? 'No one present'
                : `${selected.presentPeople.map((id) => RES_PEOPLE.find((p) => p.id === id)?.name).filter(Boolean).join(', ')} present`}
            </div>
          </div>

          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-2">Lifestyle mode</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODES.map((m) => {
                const active = currentMode === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => {
                      setModeOverride({ ...modeOverride, [selected.id]: m.value });
                      toast.success(`${selected.name} → ${m.label}`, { description: m.description });
                    }}
                    className={`text-left rounded-xl border-2 p-3 transition-all ${
                      active ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className={`text-sm font-bold ${active ? 'text-indigo-700' : 'text-stone-700'}`}>{m.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-snug">{m.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">Floorplan · live</div>
            <div className="grid grid-cols-2 gap-2">
              {selected.rooms.map((r) => (
                <div key={r.name} className={`rounded-2xl border p-3.5 transition-all ${
                  r.activity === 'active' ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50/30' : 'border-stone-200 bg-stone-50'
                }`}>
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

          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-700 font-bold mb-3 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Active automations
              </div>
              <div className="space-y-2">
                {selected.activeAutomations.map((a) => (
                  <div key={a} className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm text-stone-800 font-medium">{a}</div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Suggested actions
              </div>
              <div className="space-y-2">
                {selected.suggestedActions.length === 0 && <div className="text-sm text-stone-400 italic">All caught up.</div>}
                {selected.suggestedActions.map((a) => (
                  <button key={a} onClick={() => toast.success('Action queued', { description: a })}
                    className="w-full text-left rounded-xl border border-stone-200 bg-white hover:bg-violet-50 hover:border-violet-300 px-4 py-2.5 text-sm text-stone-800 font-medium transition-all flex items-center justify-between group">
                    <span>{a}</span>
                    <span className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResidentialSpaces;
