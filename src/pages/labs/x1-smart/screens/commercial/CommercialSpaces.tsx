import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Warehouse, Store, Users, AlertTriangle, Sparkles, Activity, Shield, Brain, ArrowRight, Clock } from 'lucide-react';
import { COM_SPACES, type ComSpace, type ComSpaceMode, type ComAdaptiveState } from '../../commercialData';
import { toast } from 'sonner';

const TYPE_ICON = { office: Building2, warehouse: Warehouse, retail: Store } as const;
const TYPE_GRAD = {
  office: 'from-indigo-400 via-blue-500 to-cyan-500',
  warehouse: 'from-violet-500 via-purple-500 to-fuchsia-500',
  retail: 'from-emerald-400 via-teal-400 to-cyan-400',
} as const;

const ADAPTIVE_GRAD: Record<ComAdaptiveState, string> = {
  'business-hours':     'from-emerald-500 to-teal-500',
  'after-hours-secure': 'from-indigo-700 to-violet-900',
  'closing-routine':    'from-amber-500 to-orange-600',
  'vendor-window':      'from-cyan-500 to-blue-600',
  'maintenance':        'from-stone-500 to-stone-700',
  'incident-response':  'from-rose-500 to-red-600',
};

const MODES: { value: ComSpaceMode; label: string; description: string }[] = [
  { value: 'open', label: 'Open', description: 'Business hours · normal access policies active' },
  { value: 'closed', label: 'Closed', description: 'After-hours · perimeter armed · emergency only' },
  { value: 'after-hours', label: 'After-hours', description: 'Limited access · vendor windows respected' },
  { value: 'maintenance', label: 'Maintenance', description: 'Restricted zones unlocked for crew · audit on' },
  { value: 'emergency', label: 'Emergency', description: 'All doors unlock · alerts to all hands' },
];

const formatEta = (mins: number) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `~${h}h`;
  return `${Math.round(h / 24)}d`;
};

const CommercialSpaces = () => {
  const [selected, setSelected] = useState<ComSpace>(COM_SPACES[0]);
  const [modeOverride, setModeOverride] = useState<Record<string, ComSpaceMode>>({});
  const currentMode = modeOverride[selected.id] ?? selected.mode;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Sites · adaptive states</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Each site flows through <span className="text-stone-900 font-semibold">adaptive operational states</span> tied to occupancy, time, and incidents.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COM_SPACES.map((space) => {
          const Icon = TYPE_ICON[space.type];
          const active = selected.id === space.id;
          const grad = TYPE_GRAD[space.type];
          const occPct = Math.round((space.occupancy / space.capacity) * 100);
          const adaptive = space.adaptiveState;
          const adaptiveGrad = adaptive ? ADAPTIVE_GRAD[adaptive.current] : grad;
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
                {adaptive ? (
                  <motion.div
                    layout
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${adaptiveGrad} shadow-sm`}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white">{adaptive.label}</span>
                    <ConfidenceDots value={adaptive.confidence} />
                  </motion.div>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">{space.state}</span>
                )}
              </div>
              <div className="relative text-sm font-semibold text-stone-900 leading-tight">{space.name}</div>
              {adaptive && (
                <div className="relative text-[11px] text-stone-500 mt-1.5 leading-snug line-clamp-2">
                  <span className="font-medium text-stone-700">Because</span> · {adaptive.reason}
                </div>
              )}
              <div className="relative flex items-center gap-3 mt-2 text-[11px] text-stone-500 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{space.occupancy}/{space.capacity} ({occPct}%)</span>
                {space.issues > 0 && (
                  <span className="inline-flex items-center gap-1 text-rose-700"><AlertTriangle className="w-3 h-3" />{space.issues}</span>
                )}
              </div>
              {adaptive?.next && (
                <div className="relative mt-2 inline-flex items-center gap-1 text-[11px] text-violet-700 font-semibold">
                  <ArrowRight className="w-3 h-3" />
                  {adaptive.next.state}
                  <span className="text-stone-400 font-normal">· {formatEta(adaptive.next.etaMin)}</span>
                </div>
              )}
              <div className="relative mt-2 h-1 rounded-full bg-stone-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${grad}`} style={{ width: `${occPct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* State timeline strip */}
      {selected.stateTimeline && selected.stateTimeline.length > 0 && (
        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">
            <Clock className="w-3 h-3" /> Today's state transitions · {selected.name.split('·')[0].trim()}
          </div>
          <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
            {selected.stateTimeline.map((seg, i) => (
              <div key={i} className="flex-1 min-w-[110px] rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-white px-3 py-2" title={seg.state}>
                <div className="text-[10px] text-stone-400 font-medium tracking-wider">{seg.from} → {seg.to}</div>
                <div className="text-[12px] font-semibold text-stone-800 mt-0.5 truncate">{seg.state}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-black/[0.06] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/[0.06] relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${TYPE_GRAD[selected.type]} opacity-10 rounded-full blur-3xl -translate-y-20 translate-x-20`} />
          <div className="relative mb-5">
            <h3 className="text-2xl font-bold tracking-tight text-stone-900">{selected.name}</h3>
            <div className="text-[12px] text-stone-500 mt-1 font-medium">
              {selected.occupancy} of {selected.capacity} on-site · {Math.round((selected.occupancy / selected.capacity) * 100)}% capacity
            </div>
          </div>

          {selected.adaptiveState && (
            <div className="relative mb-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shrink-0">
                  <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold">Current adaptive state</div>
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-lg font-bold text-stone-900">{selected.adaptiveState.label}</span>
                    <span className="text-[12px] text-violet-700 font-semibold">{Math.round(selected.adaptiveState.confidence * 100)}% confident</span>
                    <span className="text-[12px] text-stone-500">· entered {selected.adaptiveState.enteredAt}</span>
                  </div>
                  <div className="text-[13px] text-stone-700 mt-1 leading-relaxed">
                    <span className="font-semibold text-violet-700">Because · </span>{selected.adaptiveState.reason}
                  </div>
                  {selected.adaptiveState.next && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-stone-700 rounded-lg border border-stone-200 bg-white px-2 py-1">
                      <ArrowRight className="w-3 h-3 text-violet-600" />
                      Next: <span className="font-semibold">{selected.adaptiveState.next.state}</span>
                      <span className="text-stone-400">· {formatEta(selected.adaptiveState.next.etaMin)}</span>
                      <span className="text-stone-400">· {selected.adaptiveState.next.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-2">Override · operational mode</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MODES.map((m) => {
                const active = currentMode === m.value;
                const isEmergency = m.value === 'emergency';
                return (
                  <button
                    key={m.value}
                    onClick={() => {
                      setModeOverride({ ...modeOverride, [selected.id]: m.value });
                      toast.success(`${selected.name} → ${m.label}`, { description: m.description });
                    }}
                    className={`text-left rounded-xl border-2 p-3 transition-all ${
                      active
                        ? isEmergency
                          ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'
                          : 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className={`text-sm font-bold ${active ? (isEmergency ? 'text-rose-700' : 'text-indigo-700') : 'text-stone-700'}`}>{m.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-snug">{m.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">Access zones · live</div>
              <div className="space-y-2">
                {selected.zones.map((z) => (
                  <div key={z.name} className={`rounded-xl border p-3 flex items-center justify-between ${
                    z.activity === 'restricted' ? 'border-rose-200 bg-rose-50/40' :
                    z.activity === 'active' ? 'border-indigo-200 bg-indigo-50/40' : 'border-stone-200 bg-stone-50'
                  }`}>
                    <div>
                      <div className="text-sm font-semibold text-stone-900">{z.name}</div>
                      <div className="text-[11px] text-stone-500 capitalize mt-0.5">{z.activity}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700">
                      <Users className="w-3.5 h-3.5" /> {z.people}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Active policies
              </div>
              <div className="space-y-1.5">
                {selected.activePolicies.map((p) => (
                  <div key={p} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-700 font-medium">{p}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-700 font-bold mb-3 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Real-time activity feed
              </div>
              <div className="space-y-2">
                {selected.liveActivity.map((a, i) => (
                  <div key={i} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px]">
                    <div className="text-stone-800 font-medium">{a.action}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Suggested actions
              </div>
              <div className="space-y-2">
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

const ConfidenceDots = ({ value }: { value: number }) => {
  const total = 3;
  const filled = Math.max(1, Math.round(value * total));
  return (
    <span className="inline-flex items-center gap-[2px]">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`w-1 h-1 rounded-full ${i < filled ? 'bg-white' : 'bg-white/30'}`} />
      ))}
    </span>
  );
};

export default CommercialSpaces;
