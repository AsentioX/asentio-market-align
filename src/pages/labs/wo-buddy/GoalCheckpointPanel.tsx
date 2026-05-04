import { useState, useMemo } from 'react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { CheckCircle2, Clock, Flag, MinusCircle, Sparkles } from 'lucide-react';
import { useGoalCheckpoints, type GoalCheckpoint } from '@/hooks/useGoalCheckpoints';

interface Props {
  goalId: string;
  goalName: string;
  metricUnit: string;
  startValue: number;       // initial current_value at goal creation
  targetValue: number;
  currentValue: number;     // latest current_value (updates as checkpoints log)
  deadline?: string | null;
}

/**
 * Shows the next 4-week checkpoint for a goal, lets the user log a real
 * measurement, and displays past checkpoints so they can see the trajectory.
 *
 * Logging a checkpoint updates the goal's current_value, which is what the
 * plan engine uses to recalibrate intensity, phase progression, and
 * volume — so the rest of the training plan automatically adapts.
 */
const GoalCheckpointPanel = ({
  goalId, goalName, metricUnit, startValue, targetValue, currentValue, deadline,
}: Props) => {
  const { checkpoints, logCheckpoint, skipCheckpoint } = useGoalCheckpoints();
  const [inputValue, setInputValue] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goalCheckpoints = useMemo(
    () => checkpoints
      .filter(c => c.goal_id === goalId)
      .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for)),
    [checkpoints, goalId]
  );

  const next = useMemo(
    () => goalCheckpoints.find(c => c.status === 'pending'),
    [goalCheckpoints]
  );
  const past = useMemo(
    () => goalCheckpoints.filter(c => c.status !== 'pending'),
    [goalCheckpoints]
  );


  // Compute "expected at this checkpoint" so the user sees how they're tracking
  const expectedAtNext = useMemo(() => {
    if (!next || !deadline) return null;
    const totalRange = targetValue - startValue;
    if (totalRange === 0) return targetValue;
    const created = new Date(goalCheckpoints[0]?.scheduled_for || next.scheduled_for).getTime() - 28 * 24 * 60 * 60 * 1000;
    const deadlineMs = new Date(deadline).getTime();
    const checkpointMs = new Date(next.scheduled_for).getTime();
    const totalMs = deadlineMs - created;
    if (totalMs <= 0) return targetValue;
    const fraction = Math.min(1, Math.max(0, (checkpointMs - created) / totalMs));
    return Number((startValue + totalRange * fraction).toFixed(1));
  }, [next, deadline, startValue, targetValue, goalCheckpoints]);

  if (goalCheckpoints.length === 0) {
    return (
      <div className="rounded-xl bg-transparent border border-stone-200/70 p-3 text-center">
        <p className="text-[11px] text-stone-700">
          Checkpoints will be scheduled every 4 weeks once this goal is set up.
        </p>
      </div>
    );
  }

  const handleLog = async () => {
    if (!next) return;
    const v = Number(inputValue);
    if (!Number.isFinite(v)) return;
    setSubmitting(true);
    await logCheckpoint(next.id, goalId, v, note || undefined);
    setInputValue('');
    setNote('');
    setSubmitting(false);
  };

  const handleSkip = async () => {
    if (!next) return;
    setSubmitting(true);
    await skipCheckpoint(next.id);
    setSubmitting(false);
  };

  const isDue = next && new Date(next.scheduled_for) <= new Date();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Flag className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] text-stone-700 uppercase tracking-wider">4-Week Checkpoints</span>
      </div>

      {next && (
        <div className={`rounded-xl border p-3 space-y-2.5 ${
          isDue
            ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02] border-amber-500/20'
            : 'bg-transparent border-stone-200/70'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isDue ? <Sparkles className="w-3.5 h-3.5 text-amber-400" /> : <Clock className="w-3.5 h-3.5 text-stone-700" />}
              <span className={`text-xs font-medium ${isDue ? 'text-amber-300' : 'text-stone-700'}`}>
                {isDue ? 'Checkpoint due now' : `Next checkpoint ${formatDistanceToNow(new Date(next.scheduled_for), { addSuffix: true })}`}
              </span>
            </div>
            <span className="text-[10px] text-stone-600 font-mono">#{next.sequence_number}</span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed">
            Measure your current performance now. We'll use this to adjust the rest of your training plan.
            {expectedAtNext !== null && (
              <> Expected pace: <span className="text-stone-700 font-medium">~{expectedAtNext} {metricUnit}</span>.</>
            )}
          </p>
          {isDue && (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={`Your current ${metricUnit || 'value'}`}
                  className="flex-1 bg-stone-900/5 border border-stone-200/70 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/40 [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="flex items-center text-[11px] text-stone-700 px-1">{metricUnit}</span>
              </div>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note (how it felt, conditions…)"
                className="w-full bg-stone-900/5 border border-stone-200/70 rounded-lg px-3 py-2 text-[11px] text-stone-900 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLog}
                  disabled={!inputValue || submitting}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold text-xs disabled:opacity-40"
                >
                  Log & Adapt Plan
                </button>
                <button
                  onClick={handleSkip}
                  disabled={submitting}
                  className="px-3 py-2 rounded-lg bg-stone-900/5 text-stone-700 text-xs hover:bg-stone-900/10"
                >
                  Skip
                </button>
              </div>
            </>
          )}
          {!isDue && (
            <p className="text-[10px] text-stone-600">
              Scheduled for {format(new Date(next.scheduled_for), 'MMM d, yyyy')}
              {' · '}
              {differenceInDays(new Date(next.scheduled_for), new Date())} day(s) away
            </p>
          )}
        </div>
      )}

      {!next && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">All checkpoints logged for this goal.</span>
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-stone-600 uppercase tracking-wider">Past check-ins</p>
          {past.slice(-4).map(c => (
            <div key={c.id} className="flex items-center gap-2 text-[11px] bg-transparent rounded-lg px-2.5 py-1.5">
              {c.status === 'logged' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <MinusCircle className="w-3 h-3 text-stone-600 shrink-0" />
              )}
              <span className="text-stone-700">{format(new Date(c.scheduled_for), 'MMM d')}</span>
              {c.status === 'logged' && c.measured_value !== null && (
                <span className="text-stone-700 font-medium">
                  {c.measured_value} {metricUnit}
                </span>
              )}
              {c.status === 'skipped' && <span className="text-stone-600 italic">skipped</span>}
              {c.note && <span className="text-stone-600 truncate">· {c.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalCheckpointPanel;
