import { useState, useCallback } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, Lightbulb, Check, Trash2, MessageSquare } from 'lucide-react';
import { type ExerciseDefinition, RPE_SCALE } from './exerciseLibrary';

export interface SetData {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  time?: number;
  rest?: number;
  pace?: string;
  heartRate?: number;
  [key: string]: number | string | undefined;
}

export interface ExerciseEntryData {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
  rpe: number;
  notes: string;
  goalLinks: string[];
}

interface EnhancedExerciseEntryProps {
  exercise: ExerciseDefinition;
  onSave: (data: ExerciseEntryData) => void;
  onCancel: () => void;
}

const EnhancedExerciseEntry = ({ exercise, onSave, onCancel }: EnhancedExerciseEntryProps) => {
  const [showWhy, setShowWhy] = useState(false);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Initialize sets based on exercise type
  const getInitialSets = useCallback((): SetData[] => {
    if (exercise.entryType === 'sets') {
      const defaultSets = exercise.defaultMetrics.find(m => m.key === 'sets')?.defaultValue as number || 3;
      const defaultReps = exercise.defaultMetrics.find(m => m.key === 'reps' || m.key === 'reps_per_leg')?.defaultValue as number || 10;
      return Array.from({ length: defaultSets }, (_, i) => ({
        setNumber: i + 1,
        reps: defaultReps,
        weight: 0,
      }));
    }
    if (exercise.entryType === 'intervals') {
      const defaultSets = exercise.defaultMetrics.find(m => m.key === 'total_sets')?.defaultValue as number || 4;
      return Array.from({ length: defaultSets }, (_, i) => ({
        setNumber: i + 1,
        distance: 0,
        time: 0,
        rest: (exercise.defaultMetrics.find(m => m.key === 'rest_time')?.defaultValue as number) || 60,
      }));
    }
    // simple or duration
    return [{ setNumber: 1 }];
  }, [exercise]);

  const [sets, setSets] = useState<SetData[]>(getInitialSets());

  // For simple entry types, maintain a flat values map
  const [simpleValues, setSimpleValues] = useState<Record<string, number>>({});

  const updateSet = (index: number, key: string, value: number) => {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  const addSet = () => {
    setSets(prev => [...prev, { setNumber: prev.length + 1, reps: prev[0]?.reps || 10, weight: prev[prev.length - 1]?.weight || 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 })));
  };

  const handleSave = () => {
    onSave({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets,
      rpe,
      notes,
      goalLinks: [],
    });
  };

  const rpeInfo = RPE_SCALE.find(r => r.value === rpe)!;

  return (
    <div className="space-y-4">
      {/* Exercise header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-stone-900/5 flex items-center justify-center text-2xl">
          {exercise.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-stone-900">{exercise.name}</h3>
          <p className="text-[11px] text-stone-700">{exercise.subcategory} • {exercise.entryType === 'sets' ? `${sets.length} sets` : exercise.entryType}</p>
        </div>
      </div>

      {/* Why This Matters toggle */}
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/10 text-left"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 flex-1">Why This Matters</span>
        {showWhy ? <ChevronUp className="w-3 h-3 text-stone-600" /> : <ChevronDown className="w-3 h-3 text-stone-600" />}
      </button>
      {showWhy && (
        <div className="px-3 pb-1 space-y-2">
          <p className="text-xs text-stone-700 leading-relaxed">{exercise.whyItMatters}</p>
          <div className="flex flex-wrap gap-1">
            {exercise.linkedDrivers.map(d => (
              <span key={d} className="text-[9px] px-2 py-0.5 rounded-md bg-stone-900/5 text-stone-800 border border-stone-200/70">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── SETS-BASED ENTRY ── */}
      {exercise.entryType === 'sets' && (
        <div className="space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-2 text-[9px] text-stone-600 uppercase tracking-wider">
            <span className="w-8 text-center">Set</span>
            {exercise.defaultMetrics.filter(m => m.key !== 'sets').map(m => (
              <span key={m.key} className="flex-1 text-center">{m.label}{m.unit ? ` (${m.unit})` : ''}</span>
            ))}
            <span className="w-8" />
          </div>

          {sets.map((set, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-transparent rounded-xl border border-stone-200/70 p-2">
              <span className="w-8 text-center text-xs font-bold text-stone-700">{set.setNumber}</span>
              {exercise.defaultMetrics.filter(m => m.key !== 'sets').map(m => (
                <div key={m.key} className="flex-1">
                  <input
                    type="number"
                    value={set[m.key] as number || ''}
                    onChange={e => updateSet(idx, m.key, Number(e.target.value))}
                    placeholder={m.label}
                    className="w-full bg-stone-900/5 border border-stone-200/70 rounded-lg px-2 py-2 text-center text-sm font-semibold text-stone-900 focus:outline-none focus:border-emerald-500/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              ))}
              <button onClick={() => removeSet(idx)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button onClick={addSet} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-stone-200/70 text-xs text-stone-600 hover:text-stone-700 hover:border-stone-900/15 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Set
          </button>
        </div>
      )}

      {/* ── INTERVALS ENTRY ── */}
      {exercise.entryType === 'intervals' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 text-[9px] text-stone-600 uppercase tracking-wider">
            <span className="w-8 text-center">#</span>
            {exercise.defaultMetrics.filter(m => m.key !== 'total_sets').map(m => (
              <span key={m.key} className="flex-1 text-center">{m.label}</span>
            ))}
            <span className="w-8" />
          </div>

          {sets.map((set, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-transparent rounded-xl border border-stone-200/70 p-2">
              <span className="w-8 text-center text-xs font-bold text-stone-700">{set.setNumber}</span>
              {exercise.defaultMetrics.filter(m => m.key !== 'total_sets').map(m => (
                <div key={m.key} className="flex-1">
                  <input
                    type="number"
                    value={set[m.key.replace('interval_', '').replace('rest_time', 'rest').replace('rest_intervals', 'rest')] as number || ''}
                    onChange={e => updateSet(idx, m.key.replace('interval_', '').replace('rest_time', 'rest').replace('rest_intervals', 'rest'), Number(e.target.value))}
                    placeholder={m.unit || ''}
                    className="w-full bg-stone-900/5 border border-stone-200/70 rounded-lg px-2 py-2 text-center text-sm font-semibold text-stone-900 focus:outline-none focus:border-emerald-500/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              ))}
              <button onClick={() => removeSet(idx)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button onClick={addSet} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-stone-200/70 text-xs text-stone-600 hover:text-stone-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Interval
          </button>
        </div>
      )}

      {/* ── SIMPLE / DURATION ENTRY ── */}
      {(exercise.entryType === 'simple' || exercise.entryType === 'duration') && (
        <div className="grid grid-cols-2 gap-2">
          {exercise.defaultMetrics.map(m => (
            <div key={m.key} className="bg-transparent rounded-xl border border-stone-200/70 p-3">
              <label className="text-[9px] text-stone-600 uppercase tracking-wider block mb-1.5">{m.label}{m.unit ? ` (${m.unit})` : ''}</label>
              <input
                type="number"
                value={simpleValues[m.key] || ''}
                onChange={e => setSimpleValues(prev => ({ ...prev, [m.key]: Number(e.target.value) }))}
                placeholder="0"
                className="w-full bg-stone-900/5 border border-stone-200/70 rounded-lg px-3 py-2.5 text-lg font-bold text-stone-900 text-center focus:outline-none focus:border-emerald-500/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* RPE slider */}
      <div className="bg-transparent rounded-xl border border-stone-200/70 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-stone-600 uppercase tracking-wider">Perceived Effort (RPE)</span>
          <span className={`text-sm font-bold ${rpeInfo.color}`}>{rpe}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={rpe}
          onChange={e => setRpe(Number(e.target.value))}
          className="w-full h-2 bg-stone-900/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-emerald-400/50">Easy</span>
          <span className={`text-[10px] font-medium ${rpeInfo.color}`}>{rpeInfo.label}</span>
          <span className="text-[9px] text-red-400/50">Max</span>
        </div>
      </div>

      {/* Notes toggle */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-700 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {showNotes ? 'Hide Notes' : 'Add Notes'}
      </button>
      {showNotes && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did this feel? Any observations…"
          rows={3}
          className="w-full bg-transparent border border-stone-200/70 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/30 resize-none"
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-stone-900/5 text-stone-700 text-sm font-medium active:bg-stone-900/10 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-500 text-stone-900 text-sm font-semibold active:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> Save Entry
        </button>
      </div>
    </div>
  );
};

export default EnhancedExerciseEntry;
