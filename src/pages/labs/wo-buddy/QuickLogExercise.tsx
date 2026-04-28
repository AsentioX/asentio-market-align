import { useState, useMemo } from 'react';
import { ArrowLeft, Check, Dumbbell, Wind, Accessibility, Activity, Hash, Weight, Timer, MapPin, Sparkles, X } from 'lucide-react';
import type { PlanExercise } from './planEngine';

type QuickType = 'cardio' | 'strength' | 'bodyweight' | 'flexibility';

const TYPE_OPTIONS: { value: QuickType; label: string; icon: React.ReactNode; emoji: string; hint: string }[] = [
  { value: 'cardio',      label: 'Cardio',     icon: <Wind className="w-4 h-4" />,          emoji: '🏃', hint: 'e.g. 15 min row' },
  { value: 'strength',    label: 'Strength',   icon: <Dumbbell className="w-4 h-4" />,      emoji: '🏋️', hint: 'e.g. 3×10 bench' },
  { value: 'bodyweight',  label: 'Bodyweight', icon: <Accessibility className="w-4 h-4" />, emoji: '💪', hint: 'e.g. 20 push ups' },
  { value: 'flexibility', label: 'Mobility',   icon: <Activity className="w-4 h-4" />,      emoji: '🧘', hint: 'e.g. 10 min stretch' },
];

const QUICK_PRESETS: { label: string; emoji: string; type: QuickType; build: () => Partial<State> }[] = [
  { label: '15 min row',    emoji: '🚣', type: 'cardio',     build: () => ({ name: 'Row',          type: 'cardio',     duration: 15 }) },
  { label: '20 push ups',   emoji: '💪', type: 'bodyweight', build: () => ({ name: 'Push Ups',     type: 'bodyweight', reps: 20, sets: 1 }) },
  { label: '10 quick jumps',emoji: '🦘', type: 'bodyweight', build: () => ({ name: 'Jump Squats',  type: 'bodyweight', reps: 10, sets: 1 }) },
  { label: '5 min stretch', emoji: '🧘', type: 'flexibility',build: () => ({ name: 'Stretch',      type: 'flexibility',duration: 5 }) },
  { label: '3×10 squats',   emoji: '🏋️', type: 'strength',   build: () => ({ name: 'Squats',       type: 'strength',   sets: 3, reps: 10, weight: 0 }) },
  { label: '1 mile run',    emoji: '🏃', type: 'cardio',     build: () => ({ name: 'Run',          type: 'cardio',     duration: 10, distance: 1 }) },
];

interface State {
  name: string;
  type: QuickType;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // minutes
  distance?: number; // miles
  note?: string;
}

interface Props {
  onBack: () => void;
  onSave: (exercise: PlanExercise) => void;
}

const QuickLogExercise = ({ onBack, onSave }: Props) => {
  const [state, setState] = useState<State>({ name: '', type: 'cardio', duration: 15 });
  const [presetsOpen, setPresetsOpen] = useState(false);

  const update = (patch: Partial<State>) => setState(prev => ({ ...prev, ...patch }));

  const applyPreset = (preset: typeof QUICK_PRESETS[number]) => {
    setState({ name: '', type: preset.type, ...preset.build() } as State);
    setPresetsOpen(false);
  };

  const showSetsReps = state.type === 'strength' || state.type === 'bodyweight';
  const showWeight = state.type === 'strength';
  const showDuration = state.type === 'cardio' || state.type === 'flexibility';
  const showDistance = state.type === 'cardio';

  const canSave = state.name.trim().length > 0;

  const typeMeta = TYPE_OPTIONS.find(t => t.value === state.type)!;

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (state.sets && state.reps) parts.push(`${state.sets} × ${state.reps}`);
    else if (state.reps) parts.push(`${state.reps} reps`);
    if (state.weight) parts.push(`${state.weight} lbs`);
    if (state.duration) parts.push(`${state.duration} min`);
    if (state.distance) parts.push(`${state.distance} mi`);
    return parts.join(' · ');
  }, [state]);

  const handleSave = () => {
    if (!canSave) return;
    const ex: PlanExercise = {
      name: state.name.trim(),
      type: state.type,
      icon: typeMeta.emoji,
      sets: showSetsReps ? state.sets : undefined,
      reps: showSetsReps ? state.reps : undefined,
      duration: showDuration && state.duration
        ? `${state.duration} min${state.distance ? ` · ${state.distance} mi` : ''}`
        : undefined,
      note: state.note?.trim() || undefined,
    };
    onSave(ex);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Quick Log
        </span>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white">Log an exercise</h2>
        <p className="text-xs text-white/40 mt-0.5">Just the essentials — name it and add a number.</p>
      </div>

      {/* Quick presets */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Quick presets
        </span>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {QUICK_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-left transition-all"
            >
              <span className="text-base">{p.emoji}</span>
              <span className="text-xs text-white/70 font-medium truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06]" />

      {/* Name */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">
          What did you do?
        </label>
        <input
          type="text"
          value={state.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Row, Push Ups, Squats"
          maxLength={60}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/40"
          autoFocus
        />
      </div>

      {/* Type */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">
          Type
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ type: opt.value })}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] transition-all ${
                state.type === opt.value
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Numbers (type-specific) */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">
          How much?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {showSetsReps && (
            <>
              <NumberField
                label="Sets"
                icon={<Hash className="w-3.5 h-3.5" />}
                value={state.sets ?? 0}
                onChange={(n) => update({ sets: n })}
                min={0}
                max={20}
              />
              <NumberField
                label="Reps"
                icon={<Hash className="w-3.5 h-3.5" />}
                value={state.reps ?? 0}
                onChange={(n) => update({ reps: n })}
                min={0}
                max={500}
              />
            </>
          )}
          {showWeight && (
            <NumberField
              label="Weight (lbs)"
              icon={<Weight className="w-3.5 h-3.5" />}
              value={state.weight ?? 0}
              onChange={(n) => update({ weight: n })}
              min={0}
              max={1000}
              step={5}
            />
          )}
          {showDuration && (
            <NumberField
              label="Duration (min)"
              icon={<Timer className="w-3.5 h-3.5" />}
              value={state.duration ?? 0}
              onChange={(n) => update({ duration: n })}
              min={0}
              max={300}
            />
          )}
          {showDistance && (
            <NumberField
              label="Distance (mi)"
              icon={<MapPin className="w-3.5 h-3.5" />}
              value={state.distance ?? 0}
              onChange={(n) => update({ distance: n })}
              min={0}
              max={100}
              step={0.1}
              decimals={1}
            />
          )}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">
          Note (optional)
        </label>
        <input
          type="text"
          value={state.note ?? ''}
          onChange={e => update({ note: e.target.value })}
          placeholder="e.g. felt strong, easy pace"
          maxLength={120}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/40"
        />
      </div>

      {/* Summary preview */}
      {(state.name.trim() || summary) && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 flex items-center gap-3">
          <span className="text-2xl">{typeMeta.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {state.name.trim() || 'Unnamed exercise'}
            </p>
            <p className="text-[11px] text-white/50 truncate">
              {summary || typeMeta.hint}
            </p>
          </div>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-2xl transition-all ${
          canSave
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white active:scale-[0.98] shadow-lg shadow-emerald-500/20'
            : 'bg-white/[0.04] text-white/30 cursor-not-allowed'
        }`}
      >
        <Check className="w-4 h-4" />
        Add to Workout
      </button>
    </div>
  );
};

// ── Number Field ──
interface NumberFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
}
const NumberField = ({ label, icon, value, onChange, min = 0, max = 999, step = 1, decimals = 0 }: NumberFieldProps) => {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(decimals)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(decimals)));
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-white/40 font-medium mb-1.5">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={dec}
          className="w-7 h-7 rounded-lg bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 transition-colors"
          aria-label={`Decrease ${label}`}
        >−</button>
        <input
          type="number"
          value={value}
          onChange={e => {
            const n = parseFloat(e.target.value);
            if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
            else onChange(0);
          }}
          step={step}
          className="flex-1 min-w-0 bg-transparent text-center text-base font-bold text-white tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={inc}
          className="w-7 h-7 rounded-lg bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 transition-colors"
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  );
};

export default QuickLogExercise;
