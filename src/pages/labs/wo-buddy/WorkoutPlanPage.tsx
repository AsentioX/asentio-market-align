import { useState, useMemo, useCallback } from 'react';
import { CalendarDays, Sparkles, Zap, RotateCcw, ChevronDown, ChevronUp, Dumbbell, Wind, Flame } from 'lucide-react';
import { useWOBuddyGoals, usePerformanceDrivers } from '@/hooks/useWOBuddyGoals';
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS } from './goalMappings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface PlanDay {
  dayOfWeek: number;
  workoutType: 'strength' | 'cardio' | 'bodyweight' | 'rest' | 'active_recovery';
  focusDrivers: string[];
  exercises: { name: string; sets?: number; reps?: number; duration?: string; note?: string }[];
  reason: string;
}

const WORKOUT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  strength: { icon: <Dumbbell className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/15' },
  cardio: { icon: <Wind className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  bodyweight: { icon: <Flame className="w-4 h-4" />, color: 'text-orange-400', bg: 'bg-orange-500/15' },
  rest: { icon: <CalendarDays className="w-4 h-4" />, color: 'text-white/40', bg: 'bg-white/5' },
  active_recovery: { icon: <RotateCcw className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

function generatePlanFromGoals(goals: ReturnType<typeof useWOBuddyGoals>['goals']): PlanDay[] {
  // Collect all drivers from active goals
  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const driverFrequency: Record<string, number> = {};
  activeGoals.forEach(g => {
    g.drivers.forEach(d => {
      driverFrequency[d] = (driverFrequency[d] || 0) + 1;
    });
  });

  const topDrivers = Object.entries(driverFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  // Map drivers to exercises
  const driverExercises: Record<string, { name: string; sets?: number; reps?: number; duration?: string }[]> = {
    Strength: [
      { name: 'Squats', sets: 4, reps: 8 },
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Deadlift', sets: 3, reps: 5 },
      { name: 'Overhead Press', sets: 3, reps: 8 },
      { name: 'Barbell Row', sets: 3, reps: 10 },
    ],
    Endurance: [
      { name: 'Run', duration: '30 min' },
      { name: 'Bike', duration: '25 min' },
      { name: 'Row', duration: '20 min' },
    ],
    Power: [
      { name: 'Squats', sets: 5, reps: 3 },
      { name: 'Bench Press', sets: 5, reps: 3 },
      { name: 'Burpees', sets: 3, reps: 10 },
    ],
    Stability: [
      { name: 'Sit-ups', sets: 3, reps: 20 },
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Pull-ups', sets: 3, reps: 8 },
    ],
    Mobility: [
      { name: 'Dynamic stretching', duration: '15 min' },
      { name: 'Yoga flow', duration: '20 min' },
    ],
    Efficiency: [
      { name: 'Run', duration: '20 min intervals' },
      { name: 'Bike', duration: '30 min steady' },
    ],
    Technique: [
      { name: 'Skill drills', duration: '20 min' },
      { name: 'Form practice', duration: '15 min' },
    ],
  };

  // No goals → default balanced plan
  if (topDrivers.length === 0) {
    return [
      { dayOfWeek: 0, workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(0, 3), reason: 'Build foundational strength' },
      { dayOfWeek: 1, workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 2), reason: 'Build aerobic base' },
      { dayOfWeek: 2, workoutType: 'rest', focusDrivers: [], exercises: [], reason: 'Recovery day' },
      { dayOfWeek: 3, workoutType: 'bodyweight', focusDrivers: ['Stability'], exercises: driverExercises.Stability, reason: 'Core and bodyweight strength' },
      { dayOfWeek: 4, workoutType: 'strength', focusDrivers: ['Strength'], exercises: driverExercises.Strength.slice(2, 5), reason: 'Upper body focus' },
      { dayOfWeek: 5, workoutType: 'cardio', focusDrivers: ['Endurance'], exercises: driverExercises.Endurance.slice(0, 1), reason: 'Endurance session' },
      { dayOfWeek: 6, workoutType: 'active_recovery', focusDrivers: ['Mobility'], exercises: driverExercises.Mobility || [], reason: 'Active recovery and mobility' },
    ];
  }

  // Build goal-driven plan
  const plan: PlanDay[] = [];
  const trainingDays = topDrivers.length >= 3 ? 5 : topDrivers.length >= 2 ? 4 : 3;

  for (let day = 0; day < 7; day++) {
    if (day === 2 || (day === 6 && trainingDays <= 4)) {
      // Rest days
      plan.push({
        dayOfWeek: day,
        workoutType: day === 6 ? 'active_recovery' : 'rest',
        focusDrivers: day === 6 ? ['Mobility'] : [],
        exercises: day === 6 ? (driverExercises.Mobility || []) : [],
        reason: day === 6 ? 'Active recovery to support training quality' : 'Recovery day',
      });
      continue;
    }

    if (day === 5 && trainingDays <= 3) {
      plan.push({ dayOfWeek: day, workoutType: 'rest', focusDrivers: [], exercises: [], reason: 'Recovery day' });
      continue;
    }

    // Pick drivers for this day (rotate through top drivers)
    const activeDayIndex = plan.filter(p => p.workoutType !== 'rest' && p.workoutType !== 'active_recovery').length;
    const driverIndex = activeDayIndex % topDrivers.length;
    const primaryDriver = topDrivers[driverIndex];
    const secondaryDriver = topDrivers[(driverIndex + 1) % topDrivers.length];
    const dayDrivers = [primaryDriver];
    if (secondaryDriver !== primaryDriver) dayDrivers.push(secondaryDriver);

    const workoutType: PlanDay['workoutType'] =
      ['Endurance', 'Efficiency'].includes(primaryDriver) ? 'cardio' :
      ['Stability'].includes(primaryDriver) ? 'bodyweight' : 'strength';

    const primaryExercises = (driverExercises[primaryDriver] || []).slice(0, 3);
    const secondaryExercises = secondaryDriver !== primaryDriver
      ? (driverExercises[secondaryDriver] || []).slice(0, 1) : [];

    const goalNames = activeGoals
      .filter(g => g.drivers.some(d => dayDrivers.includes(d)))
      .map(g => g.name);

    plan.push({
      dayOfWeek: day,
      workoutType,
      focusDrivers: dayDrivers,
      exercises: [...primaryExercises, ...secondaryExercises],
      reason: goalNames.length > 0
        ? `Supports: ${goalNames.slice(0, 2).join(', ')}`
        : `Focus on ${primaryDriver.toLowerCase()}`,
    });
  }

  return plan;
}

const WorkoutPlanPage = () => {
  const { goals, loading: goalsLoading } = useWOBuddyGoals();
  const { user } = useAuth();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const plan = useMemo(() => generatePlanFromGoals(goals), [goals]);

  const today = new Date().getDay();
  // JS: 0=Sun, convert to our 0=Mon
  const todayIndex = today === 0 ? 6 : today - 1;

  const savePlan = useCallback(async () => {
    if (!user) return;
    setSaving(true);

    const monday = new Date();
    const diff = monday.getDay() === 0 ? -6 : 1 - monday.getDay();
    monday.setDate(monday.getDate() + diff);
    const weekStart = monday.toISOString().split('T')[0];

    // Delete old plan for this week
    const { data: existing } = await supabase
      .from('wobuddy_workout_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStart);

    if (existing && existing.length > 0) {
      await supabase.from('wobuddy_workout_plans').delete().in('id', existing.map(e => e.id));
    }

    const { data: newPlan } = await supabase
      .from('wobuddy_workout_plans')
      .insert({ user_id: user.id, week_start: weekStart, name: 'Auto-Generated Plan' })
      .select()
      .single();

    if (newPlan) {
      const days = plan.map(d => ({
        plan_id: newPlan.id,
        day_of_week: d.dayOfWeek,
        workout_type: d.workoutType,
        focus_drivers: d.focusDrivers,
        exercises: d.exercises,
        notes: d.reason,
      }));
      await supabase.from('wobuddy_plan_days').insert(days);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [user, plan]);

  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const trainingDays = plan.filter(p => p.workoutType !== 'rest').length;
  const restDays = 7 - trainingDays;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Weekly Plan</h2>
          <p className="text-xs text-white/40 mt-0.5">Auto-generated from your goals</p>
        </div>
        <button
          onClick={savePlan}
          disabled={!user || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-40"
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Plan'}
        </button>
      </div>

      {/* Summary strip */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-white">{trainingDays}</p>
          <p className="text-[10px] text-white/40">Training</p>
        </div>
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-white">{restDays}</p>
          <p className="text-[10px] text-white/40">Rest</p>
        </div>
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">{activeGoals.length}</p>
          <p className="text-[10px] text-white/40">Active Goals</p>
        </div>
      </div>

      {/* Goal connection banner */}
      {activeGoals.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/10 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white/80">Plan optimized for:</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {activeGoals.slice(0, 3).map(g => (
                  <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                    {g.name}
                  </span>
                ))}
                {activeGoals.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                    +{activeGoals.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeGoals.length === 0 && (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
          <Zap className="w-5 h-5 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">Add goals to get a personalized plan</p>
          <p className="text-[10px] text-white/30 mt-1">Showing a balanced default plan</p>
        </div>
      )}

      {/* Day cards */}
      <div className="space-y-2">
        {plan.map((day) => {
          const config = WORKOUT_TYPE_CONFIG[day.workoutType] || WORKOUT_TYPE_CONFIG.rest;
          const isToday = day.dayOfWeek === todayIndex;
          const isExpanded = expandedDay === day.dayOfWeek;

          return (
            <button
              key={day.dayOfWeek}
              onClick={() => setExpandedDay(isExpanded ? null : day.dayOfWeek)}
              className={`w-full text-left rounded-xl border transition-all ${
                isToday
                  ? 'bg-emerald-500/[0.07] border-emerald-500/20'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <span className={config.color}>{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{DAY_SHORT[day.dayOfWeek]}</span>
                    {isToday && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        TODAY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 capitalize mt-0.5">
                    {day.workoutType.replace('_', ' ')}
                    {day.focusDrivers.length > 0 && ` · ${day.focusDrivers.join(', ')}`}
                  </p>
                </div>
                <div className="text-white/20">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-white/[0.04] pt-2 space-y-2">
                  {day.reason && (
                    <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {day.reason}
                    </p>
                  )}
                  {day.exercises.length > 0 ? (
                    <div className="space-y-1.5">
                      {day.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-2.5 py-2">
                          <span className="text-xs text-white/70">{ex.name}</span>
                          <span className="text-[10px] text-white/40">
                            {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.duration || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-white/30 italic">No exercises — enjoy the rest!</p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutPlanPage;
