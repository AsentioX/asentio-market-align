import { useState, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Sparkles, Target, Activity,
  Dumbbell, Wind, Accessibility, Wrench, Zap, Trophy, Heart,
} from 'lucide-react';
import { PERFORMANCE_DRIVERS } from './goalMappings';
import type { PlanExercise } from './planEngine';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Category = 'cardio' | 'strength' | 'bodyweight' | 'mobility' | 'sport' | 'functional';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type MetricType = 'number' | 'duration' | 'distance' | 'weight' | 'pace' | 'heart_rate';

interface DriverEntry {
  driver: string;
  contribution: number; // 1-10
  isPrimary: boolean;
  explanation: string;
}

interface MetricEntry {
  id: string;
  name: string;
  type: MetricType;
  unit: string;
  required: boolean;
}

interface GoalLite {
  id: string;
  name: string;
  status: string;
}

interface GoalContribution {
  goalId: string;
  explanation: string;
}

export interface AddExerciseWizardProps {
  onBack: () => void;
  onSave: (exercise: PlanExercise) => void;
  goals?: GoalLite[];
}

// ─────────────────────────────────────────────
// Static UI config
// ─────────────────────────────────────────────
const CATEGORY_OPTIONS: { value: Category; label: string; icon: React.ReactNode; emoji: string }[] = [
  { value: 'strength',   label: 'Strength',   icon: <Dumbbell className="w-4 h-4" />,      emoji: '🏋️' },
  { value: 'cardio',     label: 'Cardio',     icon: <Wind className="w-4 h-4" />,          emoji: '🏃' },
  { value: 'bodyweight', label: 'Bodyweight', icon: <Accessibility className="w-4 h-4" />, emoji: '💪' },
  { value: 'mobility',   label: 'Mobility',   icon: <Activity className="w-4 h-4" />,      emoji: '🧘' },
  { value: 'functional', label: 'Functional', icon: <Wrench className="w-4 h-4" />,        emoji: '🛠️' },
  { value: 'sport',      label: 'Sport',      icon: <Trophy className="w-4 h-4" />,        emoji: '🎯' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner',     label: 'Beginner',     color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { value: 'advanced',     label: 'Advanced',     color: 'text-red-400 border-red-500/30 bg-red-500/10' },
];

const METRIC_TYPE_OPTIONS: { value: MetricType; label: string; defaultUnit: string }[] = [
  { value: 'number',     label: 'Number',     defaultUnit: 'reps' },
  { value: 'duration',   label: 'Duration',   defaultUnit: 'min' },
  { value: 'distance',   label: 'Distance',   defaultUnit: 'mi' },
  { value: 'weight',     label: 'Weight',     defaultUnit: 'lbs' },
  { value: 'pace',       label: 'Pace',       defaultUnit: 'min/mi' },
  { value: 'heart_rate', label: 'Heart Rate', defaultUnit: 'bpm' },
];

const METRIC_PRESETS: Record<string, { label: string; metrics: Omit<MetricEntry, 'id'>[] }> = {
  strength:   { label: 'Strength preset',   metrics: [
    { name: 'Sets',   type: 'number', unit: 'sets', required: true },
    { name: 'Reps',   type: 'number', unit: 'reps', required: true },
    { name: 'Weight', type: 'weight', unit: 'lbs',  required: true },
  ]},
  cardio:     { label: 'Cardio preset',     metrics: [
    { name: 'Distance', type: 'distance', unit: 'mi',     required: true },
    { name: 'Duration', type: 'duration', unit: 'min',    required: true },
    { name: 'Pace',     type: 'pace',     unit: 'min/mi', required: false },
  ]},
  bodyweight: { label: 'Bodyweight preset', metrics: [
    { name: 'Sets',     type: 'number',   unit: 'sets', required: true },
    { name: 'Reps',     type: 'number',   unit: 'reps', required: true },
    { name: 'Duration', type: 'duration', unit: 'sec',  required: false },
  ]},
  mobility:   { label: 'Mobility preset',   metrics: [
    { name: 'Duration', type: 'duration', unit: 'min', required: true },
  ]},
};

const STEPS = [
  { id: 1, label: 'Basics' },
  { id: 2, label: 'Drivers' },
  { id: 3, label: 'Metrics' },
  { id: 4, label: 'Goals' },
  { id: 5, label: 'Review' },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const AddExerciseWizard = ({ onBack, onSave, goals = [] }: AddExerciseWizardProps) => {
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('strength');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [icon, setIcon] = useState('💪');

  // Step 2
  const [drivers, setDrivers] = useState<DriverEntry[]>([]);

  // Step 3
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);

  // Step 4
  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);

  // Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (step >= 1 && !name.trim()) e.name = 'Name is required';
    if (step >= 2 && drivers.length === 0) e.drivers = 'Add at least one driver';
    if (step >= 2 && drivers.some(d => d.contribution < 1 || d.contribution > 10)) e.driverScore = 'Score must be 1–10';
    if (step >= 3 && metrics.length === 0) e.metrics = 'Add at least one metric';
    if (step >= 3 && metrics.some(m => !m.name.trim())) e.metricName = 'Metric name required';
    return e;
  }, [step, name, drivers, metrics]);

  const canAdvance = useMemo(() => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return drivers.length > 0 && drivers.every(d => d.contribution >= 1 && d.contribution <= 10);
    if (step === 3) return metrics.length > 0 && metrics.every(m => m.name.trim().length > 0);
    return true;
  }, [step, name, drivers, metrics]);

  // ── Helpers ──
  const toggleDriver = (driverName: string) => {
    setDrivers(prev => {
      const existing = prev.find(d => d.driver === driverName);
      if (existing) return prev.filter(d => d.driver !== driverName);
      return [...prev, { driver: driverName, contribution: 7, isPrimary: prev.length === 0, explanation: '' }];
    });
  };

  const updateDriver = (driverName: string, patch: Partial<DriverEntry>) => {
    setDrivers(prev => prev.map(d => d.driver === driverName ? { ...d, ...patch } : d));
  };

  const setPrimaryDriver = (driverName: string) => {
    setDrivers(prev => prev.map(d => ({ ...d, isPrimary: d.driver === driverName })));
  };

  const addMetric = (preset?: Omit<MetricEntry, 'id'>) => {
    const base: Omit<MetricEntry, 'id'> = preset ?? { name: '', type: 'number', unit: 'reps', required: true };
    setMetrics(prev => [...prev, { ...base, id: Math.random().toString(36).slice(2, 9) }]);
  };

  const applyPreset = (presetKey: keyof typeof METRIC_PRESETS) => {
    const preset = METRIC_PRESETS[presetKey];
    if (!preset) return;
    setMetrics(preset.metrics.map(m => ({ ...m, id: Math.random().toString(36).slice(2, 9) })));
  };

  const updateMetric = (id: string, patch: Partial<MetricEntry>) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  const removeMetric = (id: string) => setMetrics(prev => prev.filter(m => m.id !== id));

  const toggleGoal = (goalId: string) => {
    setGoalContributions(prev => {
      const existing = prev.find(g => g.goalId === goalId);
      if (existing) return prev.filter(g => g.goalId !== goalId);
      return [...prev, { goalId, explanation: '' }];
    });
  };

  const updateGoalExplanation = (goalId: string, explanation: string) => {
    setGoalContributions(prev => prev.map(g => g.goalId === goalId ? { ...g, explanation } : g));
  };

  // ── Save ──
  const handleSave = () => {
    const planType: PlanExercise['type'] =
      category === 'cardio' ? 'cardio' :
      category === 'strength' ? 'strength' :
      category === 'mobility' ? 'flexibility' : 'bodyweight';

    const setsMetric  = metrics.find(m => /^sets$/i.test(m.name));
    const repsMetric  = metrics.find(m => /^reps$/i.test(m.name));
    const durMetric   = metrics.find(m => m.type === 'duration');

    const driverNames = drivers.map(d => d.driver);
    const linkedGoalNames = goalContributions
      .map(gc => goals.find(g => g.id === gc.goalId)?.name)
      .filter(Boolean) as string[];

    const reasonParts: string[] = [];
    if (driverNames.length) reasonParts.push(`Supports ${driverNames.join(', ')}`);
    if (linkedGoalNames.length) reasonParts.push(`helps with ${linkedGoalNames.join(', ')}`);
    const reason = reasonParts.length ? reasonParts.join(' — ') : description;

    const ex: PlanExercise = {
      name: name.trim(),
      type: planType,
      icon,
      sets: setsMetric ? 3 : undefined,
      reps: repsMetric ? 10 : undefined,
      duration: !setsMetric && durMetric ? '20 min' : undefined,
      reason,
      note: description || undefined,
    };

    onSave(ex);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header / progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">
            Step {step} of {STEPS.length}
          </span>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-1.5">
          {STEPS.map(s => (
            <div key={s.id} className="flex-1">
              <div
                className={`h-1 rounded-full transition-all ${
                  s.id < step ? 'bg-emerald-500' :
                  s.id === step ? 'bg-emerald-400' :
                  'bg-stone-900/10'
                }`}
              />
              <div className={`text-[9px] mt-1 text-center font-medium ${s.id === step ? 'text-emerald-300' : 'text-stone-600'}`}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 1: BASIC INFO ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Tell us about the exercise</h2>
            <p className="text-xs text-stone-700 mt-0.5">The basics help us file it correctly.</p>
          </div>

          <Field label="Exercise name" required error={errors.name}>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Bulgarian Split Squat"
                className="flex-1 bg-transparent border border-stone-200/70 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/40"
                maxLength={80}
              />
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value.slice(0, 2))}
                className="w-14 text-center bg-transparent border border-stone-200/70 rounded-xl px-2 py-2.5 text-xl"
                aria-label="Icon emoji"
              />
            </div>
          </Field>

          <Field label="Category" required>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] transition-all ${
                    category === opt.value
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-transparent border-stone-200/70 text-stone-700 hover:bg-transparent'
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Difficulty">
            <div className="grid grid-cols-3 gap-1.5">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`py-2 rounded-xl border text-[11px] font-medium transition-all ${
                    difficulty === opt.value ? opt.color : 'bg-transparent border-stone-200/70 text-stone-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A short note on form, setup, or intent."
              rows={2}
              maxLength={240}
              className="w-full bg-transparent border border-stone-200/70 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/40 resize-none"
            />
          </Field>

          <Field label="Equipment needed (optional)">
            <input
              type="text"
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
              placeholder="e.g. dumbbells, bench"
              maxLength={120}
              className="w-full bg-transparent border border-stone-200/70 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/40"
            />
          </Field>
        </div>
      )}

      {/* ── STEP 2: DRIVERS ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Which drivers does it train?</h2>
            <p className="text-xs text-stone-700 mt-0.5">Drivers connect this exercise to your goals.</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {PERFORMANCE_DRIVERS.map(d => {
              const selected = drivers.some(x => x.driver === d.name);
              return (
                <button
                  key={d.name}
                  onClick={() => toggleDriver(d.name)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    selected
                      ? 'bg-emerald-500/15 border-emerald-500/40'
                      : 'bg-transparent border-stone-200/70 hover:bg-transparent'
                  }`}
                >
                  <span className="text-base">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${selected ? 'text-emerald-300' : 'text-stone-800'}`}>{d.name}</div>
                  </div>
                  {selected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {errors.drivers && <p className="text-[11px] text-red-400">{errors.drivers}</p>}

          {/* Driver detail cards */}
          {drivers.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">
                Tune each driver
              </div>
              {drivers.map(d => {
                const meta = PERFORMANCE_DRIVERS.find(p => p.name === d.driver);
                return (
                  <div key={d.driver} className="rounded-xl border border-stone-200/70 bg-transparent p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta?.icon}</span>
                        <span className="text-sm font-semibold text-stone-900">{d.driver}</span>
                      </div>
                      <button
                        onClick={() => setPrimaryDriver(d.driver)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                          d.isPrimary
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-stone-900/5 text-stone-700 border border-stone-200/70 hover:text-stone-700'
                        }`}
                      >
                        {d.isPrimary ? '★ Primary' : 'Make primary'}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-stone-700">Contribution</span>
                        <span className="text-xs font-semibold text-emerald-300">{d.contribution} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={d.contribution}
                        onChange={e => updateDriver(d.driver, { contribution: Number(e.target.value) })}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <input
                      type="text"
                      value={d.explanation}
                      onChange={e => updateDriver(d.driver, { explanation: e.target.value })}
                      placeholder={`Why does this support ${d.driver.toLowerCase()}? (optional)`}
                      maxLength={140}
                      className="w-full bg-transparent border border-stone-200/70 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/30"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: METRICS ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">How will you measure it?</h2>
            <p className="text-xs text-stone-700 mt-0.5">Pick a preset or add metrics yourself.</p>
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.06] to-stone-900/[0.03] p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">Quick presets</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(METRIC_PRESETS) as (keyof typeof METRIC_PRESETS)[]).map(key => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="text-[11px] py-2 rounded-lg bg-transparent border border-stone-200/70 text-stone-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all capitalize"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics list */}
          <div className="space-y-2">
            {metrics.map(m => (
              <div key={m.id} className="rounded-xl border border-stone-200/70 bg-transparent p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={e => updateMetric(m.id, { name: e.target.value })}
                    placeholder="Metric name"
                    className="flex-1 bg-transparent border border-stone-200/70 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/30"
                  />
                  <button
                    onClick={() => removeMetric(m.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10"
                    aria-label="Remove metric"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <select
                    value={m.type}
                    onChange={e => {
                      const newType = e.target.value as MetricType;
                      const def = METRIC_TYPE_OPTIONS.find(o => o.value === newType);
                      updateMetric(m.id, { type: newType, unit: def?.defaultUnit ?? m.unit });
                    }}
                    className="col-span-1 bg-transparent border border-stone-200/70 rounded-lg px-2 py-1.5 text-[11px] text-stone-900 focus:outline-none focus:border-emerald-500/30"
                  >
                    {METRIC_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-stone-100">{o.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={m.unit}
                    onChange={e => updateMetric(m.id, { unit: e.target.value })}
                    placeholder="Unit"
                    className="col-span-1 bg-transparent border border-stone-200/70 rounded-lg px-2 py-1.5 text-[11px] text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/30"
                  />
                  <button
                    onClick={() => updateMetric(m.id, { required: !m.required })}
                    className={`col-span-1 rounded-lg px-2 py-1.5 text-[10px] font-medium border transition-all ${
                      m.required
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-transparent border-stone-200/70 text-stone-700'
                    }`}
                  >
                    {m.required ? '● Required' : '○ Optional'}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => addMetric()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-stone-900/15 text-xs text-stone-700 hover:text-emerald-300 hover:border-emerald-500/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add metric
            </button>
          </div>

          {errors.metrics && <p className="text-[11px] text-red-400">{errors.metrics}</p>}
        </div>
      )}

      {/* ── STEP 4: GOAL CONTRIBUTION ── */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Connect to your goals</h2>
            <p className="text-xs text-stone-700 mt-0.5">Optional — tells us why this exercise matters to you.</p>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-xl border border-stone-200/70 bg-transparent p-5 text-center space-y-2">
              <Target className="w-5 h-5 text-stone-600 mx-auto" />
              <p className="text-xs text-stone-700">No active goals yet.</p>
              <p className="text-[11px] text-stone-600">Add a goal in the Goals tab to link exercises.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map(g => {
                const selected = goalContributions.find(gc => gc.goalId === g.id);
                return (
                  <div key={g.id} className={`rounded-xl border transition-all ${selected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-stone-200/70'}`}>
                    <button
                      onClick={() => toggleGoal(g.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${selected ? 'bg-emerald-500 border-emerald-500' : 'border-stone-900/15'}`}>
                        {selected && <Check className="w-3 h-3 text-stone-900" />}
                      </div>
                      <Target className="w-3.5 h-3.5 text-stone-700" />
                      <span className={`text-xs font-medium flex-1 truncate ${selected ? 'text-emerald-200' : 'text-stone-700'}`}>{g.name}</span>
                    </button>
                    {selected && (
                      <div className="px-3 pb-2.5">
                        <input
                          type="text"
                          value={selected.explanation}
                          onChange={e => updateGoalExplanation(g.id, e.target.value)}
                          placeholder="How does this exercise help this goal?"
                          maxLength={160}
                          className="w-full bg-transparent border border-stone-200/70 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-900 placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/30"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 5: REVIEW ── */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Looks good?</h2>
            <p className="text-xs text-stone-700 mt-0.5">Review and add to your workout.</p>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-900/5 flex items-center justify-center text-2xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-stone-900 truncate">{name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900/5 text-stone-700 capitalize">{category}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900/5 text-stone-700 capitalize">{difficulty}</span>
                </div>
              </div>
            </div>

            {description && <p className="text-xs text-stone-700 leading-relaxed">{description}</p>}

            <Section title="Drivers">
              <div className="flex flex-wrap gap-1.5">
                {drivers.map(d => (
                  <span key={d.driver} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    d.isPrimary ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-stone-900/5 text-stone-800 border-stone-200/70'
                  }`}>
                    {d.isPrimary && '★ '}{d.driver} · {d.contribution}/10
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Metrics">
              <div className="flex flex-wrap gap-1.5">
                {metrics.map(m => (
                  <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900/5 text-stone-800 border border-stone-200/70">
                    {m.name}{m.unit ? ` (${m.unit})` : ''}{m.required ? ' •' : ''}
                  </span>
                ))}
              </div>
            </Section>

            {goalContributions.length > 0 && (
              <Section title="Connected goals">
                <div className="space-y-1">
                  {goalContributions.map(gc => {
                    const goal = goals.find(g => g.id === gc.goalId);
                    if (!goal) return null;
                    return (
                      <div key={gc.goalId} className="flex items-start gap-1.5 text-[11px] text-emerald-300/80">
                        <Target className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{goal.name}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Why this matters */}
            <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">Why it matters</span>
              </div>
              <p className="text-[11px] text-stone-800 leading-relaxed">
                {drivers.length
                  ? `Trains ${drivers.map(d => d.driver).join(', ')}${
                      goalContributions.length
                        ? `, supporting ${goalContributions.map(gc => goals.find(g => g.id === gc.goalId)?.name).filter(Boolean).join(', ')}.`
                        : '.'
                    }`
                  : 'Add drivers to see how this exercise fits your training.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer nav ── */}
      <div className="flex items-center gap-2 pt-2">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-xl bg-transparent border border-stone-200/70 text-sm font-medium text-stone-700 hover:bg-transparent transition-colors"
          >
            Back
          </button>
        )}
        {step < STEPS.length ? (
          <button
            onClick={() => canAdvance && setStep(s => s + 1)}
            disabled={!canAdvance}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              canAdvance
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-900 shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                : 'bg-transparent text-stone-600 cursor-not-allowed'
            }`}
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-900 text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <Check className="w-4 h-4" /> Add to Workout
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Small subcomponents
// ─────────────────────────────────────────────
const Field = ({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">
        {label}{required && <span className="text-emerald-400 ml-0.5">*</span>}
      </span>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
    {children}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">{title}</div>
    {children}
  </div>
);

export default AddExerciseWizard;
