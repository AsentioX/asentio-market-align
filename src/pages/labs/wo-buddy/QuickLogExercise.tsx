import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft, Check, Search, Clock, Plus, X, Sparkles, ChevronDown, ChevronUp,
  Hash, Weight, Timer, MapPin, Activity, Flame, Heart, Mic,
} from 'lucide-react';
import { EXERCISE_LIBRARY, CATEGORY_CONFIG, type ExerciseDefinition, type ExerciseMetric } from './exerciseLibrary';
import type { PlanExercise } from './planEngine';
import { useIsMobile } from './useIsMobile';

// ─── Storage helpers ────────────────────────────────────────────────────────
const RECENTS_KEY = 'wob_quicklog_recents_v1';
const LAST_METRICS_KEY = (id: string) => `wob_quicklog_last_${id}`;

const readRecents = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; }
};
const pushRecent = (id: string) => {
  const prev = readRecents().filter(x => x !== id);
  localStorage.setItem(RECENTS_KEY, JSON.stringify([id, ...prev].slice(0, 8)));
};
const readLastMetrics = (id: string): Record<string, number | string> => {
  try { return JSON.parse(localStorage.getItem(LAST_METRICS_KEY(id)) || '{}'); } catch { return {}; }
};
const writeLastMetrics = (id: string, v: Record<string, number | string>) => {
  localStorage.setItem(LAST_METRICS_KEY(id), JSON.stringify(v));
};

// ─── Category → PlanExercise type mapping (mirrors planEngine) ──────────────
const toPlanType = (cat: ExerciseDefinition['category']): PlanExercise['type'] =>
  cat === 'endurance' ? 'cardio'
  : cat === 'strength' ? 'strength'
  : cat === 'bodyweight' || cat === 'power' || cat === 'agility' ? 'bodyweight'
  : 'flexibility';

// Metric presets for one-tap entry
const PRESETS: Record<string, (number | string)[]> = {
  duration: [5, 10, 15, 20, 30, 45, 60],
  time: [10, 20, 30, 45, 60],
  distance: [1, 2, 3, 5, 10],
  reps: [5, 8, 10, 12, 15, 20],
  reps_per_leg: [5, 8, 10, 12],
  sets: [1, 2, 3, 4, 5],
  weight: [45, 65, 95, 135, 185, 225],
  heart_rate: [120, 140, 160, 170],
  rpe: [4, 6, 7, 8, 9],
};

const METRIC_ICON: Record<string, React.ReactNode> = {
  duration: <Timer className="w-3.5 h-3.5" />,
  time: <Timer className="w-3.5 h-3.5" />,
  distance: <MapPin className="w-3.5 h-3.5" />,
  reps: <Hash className="w-3.5 h-3.5" />,
  reps_per_leg: <Hash className="w-3.5 h-3.5" />,
  sets: <Hash className="w-3.5 h-3.5" />,
  weight: <Weight className="w-3.5 h-3.5" />,
  heart_rate: <Heart className="w-3.5 h-3.5" />,
  pace: <Activity className="w-3.5 h-3.5" />,
  rpe: <Flame className="w-3.5 h-3.5" />,
};

interface Props {
  onBack: () => void;
  onSave: (exercise: PlanExercise) => void;
}

const QuickLogExercise = ({ onBack, onSave }: Props) => {
  const isMobile = useIsMobile();

  // ── Top-level state ──
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExerciseDefinition | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number | string>>({});
  const [showOptional, setShowOptional] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const recents = useMemo(() => {
    const ids = readRecents();
    return ids.map(id => EXERCISE_LIBRARY.find(e => e.id === id)).filter(Boolean) as ExerciseDefinition[];
  }, [selected]); // refresh after each save

  const suggested = useMemo(
    () => EXERCISE_LIBRARY.filter(e => ['rowing', 'push_ups', 'squats', 'running', 'plank'].includes(e.id)),
    []
  );

  // ── Search filter ──
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as ExerciseDefinition[];
    return EXERCISE_LIBRARY
      .filter(e =>
        e.name.toLowerCase().includes(q)
        || e.subcategory.toLowerCase().includes(q)
        || e.purposeTags.some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query]);

  // ── When exercise selected, seed metrics from last log or defaults ──
  useEffect(() => {
    if (!selected) { setMetrics({}); setShowOptional(false); return; }
    const last = readLastMetrics(selected.id);
    const seed: Record<string, number | string> = {};
    selected.defaultMetrics.forEach(m => {
      seed[m.key] = last[m.key] ?? m.defaultValue ?? (m.type === 'numeric' || m.type === 'time' || m.type === 'distance' ? 0 : '');
    });
    setMetrics(seed);
    setShowOptional(false);
  }, [selected]);

  const pickExercise = (def: ExerciseDefinition) => {
    setSelected(def);
    setQuery('');
  };

  // ── Build PlanExercise from current state ──
  const buildPlanExercise = (): PlanExercise | null => {
    if (!selected) return null;
    const planType = toPlanType(selected.category);
    const pe: PlanExercise = {
      name: selected.name,
      type: planType,
      libraryId: selected.id,
      icon: selected.icon,
    };

    // Sets / reps
    if (metrics.sets) pe.sets = Number(metrics.sets) || undefined;
    if (metrics.reps) pe.reps = Number(metrics.reps) || undefined;
    else if (metrics.reps_per_leg) pe.reps = Number(metrics.reps_per_leg) || undefined;

    // Duration: prefer 'duration' (sec), else 'time' (min)
    if (metrics.duration) {
      const secs = Number(metrics.duration);
      pe.duration = secs >= 60 ? `${Math.round(secs / 60)} min` : `${secs} sec`;
    } else if (metrics.time) {
      pe.duration = `${Number(metrics.time)} min`;
    }

    // Capture extra metrics in `note` for visibility
    const extras: string[] = [];
    if (metrics.distance) extras.push(`${metrics.distance} ${selected.defaultMetrics.find(m => m.key === 'distance')?.unit || 'mi'}`);
    if (metrics.weight) extras.push(`${metrics.weight} lbs`);
    if (metrics.pace) extras.push(`${metrics.pace} pace`);
    if (metrics.heart_rate) extras.push(`${metrics.heart_rate} bpm`);
    if (metrics.rpe) extras.push(`RPE ${metrics.rpe}`);
    if (extras.length) pe.note = extras.join(' · ');
    return pe;
  };

  const canSave = !!selected && Object.values(metrics).some(v => Number(v) > 0 || (typeof v === 'string' && v.length > 0));

  const handleSave = () => {
    const pe = buildPlanExercise();
    if (!pe || !selected) return;
    pushRecent(selected.id);
    writeLastMetrics(selected.id, metrics);
    onSave(pe);
  };

  const cat = selected ? CATEGORY_CONFIG[selected.category] : null;

  // ───────────────────────────────────────────────────────────────────────
  return (
    <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} pb-28`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={selected ? () => setSelected(null) : onBack}
          className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {selected ? 'Change exercise' : 'Back'}
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">
          Quick Log
        </span>
      </div>

      {!selected && (
        <>
          {/* Big prompt */}
          <div>
            <h2 className="text-xl font-bold text-stone-900 leading-tight">What did you do today?</h2>
            <p className="text-xs text-stone-700 mt-1">Search any exercise — we'll handle the rest.</p>
          </div>

          {/* Primary search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
            <input
              ref={searchRef}
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Try “row”, “bench”, “push ups”…"
              className="w-full bg-white/60 border border-stone-200 rounded-2xl pl-10 pr-11 py-3.5 text-base text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex items-center justify-center transition"
              title="Voice logging (coming soon)"
              aria-label="Voice logging"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Autocomplete dropdown */}
            {results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden">
                {results.map(def => {
                  const c = CATEGORY_CONFIG[def.category];
                  return (
                    <button
                      key={def.id}
                      onClick={() => pickExercise(def)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-stone-50 transition border-b border-stone-100 last:border-b-0"
                    >
                      <span className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center text-lg shrink-0`}>{def.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-stone-900 truncate">{def.name}</span>
                        <span className={`block text-[11px] ${c.color} truncate`}>{c.label} · {def.subcategory}</span>
                      </span>
                      <Plus className="w-4 h-4 text-stone-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick chips: recents */}
          {recents.length > 0 && (
            <Section icon={<Clock className="w-3.5 h-3.5" />} label="Recent">
              <ChipRow items={recents} onPick={pickExercise} />
            </Section>
          )}

          {/* Quick chips: suggested */}
          <Section icon={<Sparkles className="w-3.5 h-3.5" />} label="Suggested for you">
            <ChipRow items={suggested} onPick={pickExercise} />
          </Section>

          {/* Custom fallback */}
          <button
            onClick={() => setShowCustom(true)}
            className="w-full text-xs text-stone-700 hover:text-stone-900 underline underline-offset-4 decoration-stone-300"
          >
            Can't find it? Log a custom exercise
          </button>

          {showCustom && (
            <CustomExerciseForm
              onCancel={() => setShowCustom(false)}
              onSave={(ex) => { setShowCustom(false); onSave(ex); }}
            />
          )}
        </>
      )}

      {/* ── Selected exercise card ─────────────────────────────────── */}
      {selected && cat && (
        <div className="space-y-4">
          {/* Hero card */}
          <div className={`rounded-3xl ${cat.bg} ${cat.border} border p-4`}>
            <div className="flex items-start gap-3">
              <div className={`w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center text-3xl shrink-0`}>
                {selected.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[10px] font-semibold uppercase tracking-widest ${cat.color}`}>{cat.label}</div>
                <h3 className="text-lg font-bold text-stone-900 leading-tight">{selected.name}</h3>
                <p className="text-[11px] text-stone-700 mt-0.5 line-clamp-2">{selected.description}</p>
              </div>
            </div>
          </div>

          {/* Smart-default hint */}
          {Object.keys(readLastMetrics(selected.id)).length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-stone-700 px-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Prefilled from your last session.</span>
            </div>
          )}

          {/* Primary metrics */}
          <div className="space-y-2.5">
            {selected.defaultMetrics.slice(0, 2).map(m => (
              <MetricInput
                key={m.key}
                metric={m}
                value={metrics[m.key]}
                onChange={v => setMetrics(prev => ({ ...prev, [m.key]: v }))}
              />
            ))}
          </div>

          {/* Progressive disclosure */}
          {(selected.defaultMetrics.length > 2 || selected.optionalMetrics.length > 0) && (
            <button
              onClick={() => setShowOptional(s => !s)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 py-2 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 transition"
            >
              {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showOptional ? 'Hide extras' : 'Add more metrics'}
            </button>
          )}

          {showOptional && (
            <div className="space-y-2.5">
              {selected.defaultMetrics.slice(2).map(m => (
                <MetricInput
                  key={m.key}
                  metric={m}
                  value={metrics[m.key]}
                  onChange={v => setMetrics(prev => ({ ...prev, [m.key]: v }))}
                />
              ))}
              {selected.optionalMetrics.map(m => (
                <MetricInput
                  key={m.key}
                  metric={m}
                  value={metrics[m.key]}
                  onChange={v => setMetrics(prev => ({ ...prev, [m.key]: v }))}
                />
              ))}
            </div>
          )}

          {/* Why this matters */}
          <div className="rounded-2xl bg-stone-900/[0.03] border border-stone-200 p-3.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 mb-1">Why it matters</div>
            <p className="text-xs text-stone-800 leading-relaxed">{selected.whyItMatters}</p>
            {selected.shortTermBenefit && (
              <p className="text-[11px] text-stone-600 mt-1.5 italic">{selected.shortTermBenefit}</p>
            )}
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      {selected && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-30 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-2xl transition-all ${
                canSave
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-2xl shadow-emerald-500/30 active:scale-[0.98]'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Log Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const Section = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-700 mb-1.5 px-1">
      {icon}<span>{label}</span>
    </div>
    {children}
  </div>
);

const ChipRow = ({ items, onPick }: { items: ExerciseDefinition[]; onPick: (def: ExerciseDefinition) => void }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(def => {
      const c = CATEGORY_CONFIG[def.category];
      return (
        <button
          key={def.id}
          onClick={() => onPick(def)}
          className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full ${c.bg} ${c.border} border text-stone-900 hover:scale-[1.02] active:scale-[0.98] transition`}
        >
          <span className="text-base leading-none">{def.icon}</span>
          <span className="text-xs font-medium">{def.name}</span>
        </button>
      );
    })}
  </div>
);

interface MetricInputProps {
  metric: ExerciseMetric;
  value: number | string | undefined;
  onChange: (v: number | string) => void;
}
const MetricInput = ({ metric, value, onChange }: MetricInputProps) => {
  const presets = PRESETS[metric.key];
  const numeric = metric.type === 'numeric' || metric.type === 'time' || metric.type === 'distance';
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-800">
          <span className="text-stone-600">{METRIC_ICON[metric.key] ?? <Hash className="w-3.5 h-3.5" />}</span>
          <span>{metric.label}</span>
          {metric.unit && <span className="text-[10px] text-stone-500 font-normal">({metric.unit})</span>}
          {metric.required && <span className="text-[10px] text-emerald-600 font-medium">·required</span>}
        </div>
        <input
          type={numeric ? 'number' : 'text'}
          inputMode={numeric ? 'decimal' : 'text'}
          value={value ?? ''}
          step={metric.step ?? 1}
          onChange={e => {
            const v = e.target.value;
            if (numeric) onChange(v === '' ? '' : Number(v));
            else onChange(v);
          }}
          placeholder="0"
          className="w-20 bg-transparent text-right text-lg font-bold text-stone-900 tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      {presets && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => {
            const active = Number(value) === Number(p);
            return (
              <button
                key={String(p)}
                onClick={() => onChange(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  active
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Custom (fallback) exercise form ────────────────────────────────────────
const CustomExerciseForm = ({
  onCancel, onSave,
}: { onCancel: () => void; onSave: (ex: PlanExercise) => void }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PlanExercise['type']>('cardio');
  const [duration, setDuration] = useState<number | ''>(15);
  const [reps, setReps] = useState<number | ''>('');
  const [sets, setSets] = useState<number | ''>('');

  const canSave = name.trim().length > 0;
  const typeEmoji: Record<PlanExercise['type'], string> = {
    cardio: '🫁', strength: '🏋️', bodyweight: '💪', flexibility: '🧘',
  };

  const submit = () => {
    if (!canSave) return;
    const ex: PlanExercise = {
      name: name.trim(),
      type,
      icon: typeEmoji[type],
      sets: sets || undefined,
      reps: reps || undefined,
      duration: duration ? `${duration} min` : undefined,
    };
    onSave(ex);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-700">Custom exercise</span>
        <button onClick={onCancel} className="w-6 h-6 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Exercise name"
        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500/50"
        autoFocus
      />
      <div className="grid grid-cols-4 gap-1.5">
        {(['cardio', 'strength', 'bodyweight', 'flexibility'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-[10px] capitalize transition ${
              type === t
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 font-semibold'
                : 'bg-white border-stone-200 text-stone-700'
            }`}
          >
            <span className="text-base">{typeEmoji[t]}</span>{t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MiniNum label="Sets" value={sets} onChange={setSets} />
        <MiniNum label="Reps" value={reps} onChange={setReps} />
        <MiniNum label="Min" value={duration} onChange={setDuration} />
      </div>
      <button
        onClick={submit}
        disabled={!canSave}
        className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-sm transition ${
          canSave ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-stone-200 text-stone-500 cursor-not-allowed'
        }`}
      >
        <Check className="w-4 h-4" /> Log custom exercise
      </button>
    </div>
  );
};

const MiniNum = ({ label, value, onChange }: { label: string; value: number | ''; onChange: (n: number | '') => void }) => (
  <label className="block">
    <span className="block text-[10px] font-medium text-stone-600 mb-1">{label}</span>
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      placeholder="0"
      className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-stone-900 text-center tabular-nums focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  </label>
);

export default QuickLogExercise;
