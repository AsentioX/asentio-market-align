import { useState } from 'react';
import { Pencil, Check, X, Clock, Timer, Dumbbell, Wind, Accessibility } from 'lucide-react';

export interface TrackedExercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  reps: number;
  duration: number; // seconds
  timestamp: Date;
  confidence: number;
}

interface ExerciseWidgetProps {
  exercise: TrackedExercise;
  onUpdate: (id: string, updates: Partial<TrackedExercise>) => void;
  onRemove: (id: string) => void;
  allExercises: string[];
}

const typeConfig = {
  strength: { emoji: '🏋️', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/15', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  cardio: { emoji: '🏃', color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/15', icon: <Wind className="w-3.5 h-3.5" /> },
  bodyweight: { emoji: '💪', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/15', icon: <Accessibility className="w-3.5 h-3.5" /> },
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const ExerciseWidget = ({ exercise, onUpdate, onRemove, allExercises }: ExerciseWidgetProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(exercise.name);
  const [editReps, setEditReps] = useState(exercise.reps);
  const cfg = typeConfig[exercise.type];

  const handleSave = () => {
    onUpdate(exercise.id, { name: editName, reps: editReps });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(exercise.name);
    setEditReps(exercise.reps);
    setEditing(false);
  };

  return (
    <div className={`bg-gradient-to-r ${cfg.bg} rounded-2xl border ${cfg.border} overflow-hidden transition-all`}>
      {editing ? (
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-700 uppercase tracking-wider">Edit Exercise</span>
            <div className="flex items-center gap-2">
              <button onClick={handleCancel} className="w-10 h-10 rounded-xl bg-stone-900/5 flex items-center justify-center text-stone-700 active:bg-stone-900/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <button onClick={handleSave} className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 active:bg-emerald-500/30 transition-colors">
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
          <select
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-stone-900/5 border border-stone-200/70 rounded-xl px-3 py-3 text-base text-stone-900 focus:outline-none focus:border-emerald-500/30 appearance-none"
          >
            {allExercises.map(e => <option key={e} value={e} className="bg-white">{e}</option>)}
          </select>
          <div>
            <label className="text-[10px] text-stone-700 uppercase tracking-wider mb-1.5 block">Reps</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditReps(Math.max(0, editReps - 1))} className="w-12 h-12 rounded-xl bg-stone-900/5 text-stone-800 active:bg-stone-900/10 flex items-center justify-center text-xl font-medium select-none">−</button>
              <input type="number" value={editReps} onChange={(e) => setEditReps(Number(e.target.value))}
                className="w-16 bg-stone-900/5 border border-stone-200/70 rounded-xl px-2 py-3 text-center text-lg font-semibold text-stone-900 focus:outline-none focus:border-emerald-500/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <button onClick={() => setEditReps(editReps + 1)} className="w-12 h-12 rounded-xl bg-stone-900/5 text-stone-800 active:bg-stone-900/10 flex items-center justify-center text-xl font-medium select-none">+</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 flex items-center gap-3">
          {/* Type icon */}
          <div className={`w-11 h-11 rounded-xl bg-stone-900/5 flex items-center justify-center text-xl flex-shrink-0`}>
            {cfg.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold truncate">{exercise.name}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-stone-900/5 ${cfg.color} font-medium`}>
                {exercise.confidence}%
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-stone-700">
              <span className="flex items-center gap-0.5">
                <span className="font-bold text-stone-700 text-xs">{exercise.reps}</span> reps
              </span>
              <span className="flex items-center gap-0.5">
                <Timer className="w-2.5 h-2.5" />
                {formatDuration(exercise.duration)}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(exercise.timestamp)}
              </span>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditing(true)}
            className="w-8 h-8 rounded-lg bg-stone-900/5 flex items-center justify-center text-stone-600 hover:text-stone-800 hover:bg-stone-900/10 transition-colors flex-shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseWidget;
