import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { estimateCalories } from '@/pages/labs/wo-buddy/scoring';

export type Period = 'week' | 'month' | 'all';

export interface PeriodOverview {
  workouts: number;
  totalVolume: number;     // lbs
  totalDistance: number;   // mi
  totalReps: number;
  avgDuration: number;     // minutes
  caloriesBurned: number;
}

export interface ExerciseStat {
  name: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  icon: string;
  allTime: { value: number; unit: string };
  month: { value: number; unit: string };
  week: { value: number; unit: string };
  pr?: string;
}

export interface BodyTrendPoint { date: string; weight: number; bodyFat: number; muscleMass: number; }

export interface PersonalRecord {
  exerciseName: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  icon: string;
  /** Human-readable PR value, e.g. "225 lbs", "12.4 km", "120 reps" */
  value: string;
  /** Short label for the metric, e.g. "Max Weight", "Longest Distance", "Most Reps" */
  label: string;
  /** ISO date string when the PR was set */
  achievedAt: string;
  /** Numeric improvement over previous best of the same exercise (same units as `value`). */
  delta?: number;
  /** True if delta represents an improvement (higher for strength/bw, longer for cardio). */
  improving?: boolean;
}

export interface ExerciseTrendPoint {
  week: string;          // e.g. "W1"
  weekStart: string;     // ISO date
  value: number;         // metric value (lbs / mi / reps)
}

export interface ExerciseTrendMeta {
  name: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  icon: string;
  unit: string;          // "lbs" | "mi" | "reps"
  metricLabel: string;   // "Max Weight" | "Distance" | "Max Reps"
}

export interface ConsistencyStats {
  currentStreak: number;
  longestStreak: number;
  thisMonth: number;
  avgPerWeek: number;
}

const KM_TO_MI = 0.621371;

const ICON_BY_NAME: Record<string, string> = {
  'Running': '🏃', 'Run': '🏃',
  'Bench Press': '🏋️',
  'Squats': '🦵', 'Squat': '🦵',
  'Push-ups': '💪', 'Push-Ups': '💪',
  'Sit-ups': '🔄', 'Sit-Ups': '🔄',
  'Pull-ups': '🧗', 'Pull-Ups': '🧗',
  'Deadlift': '⬆️',
  'Rowing': '🚣', 'Row': '🚣',
};

function pickIcon(name: string, type: string) {
  return ICON_BY_NAME[name] ?? (type === 'cardio' ? '🏃' : type === 'strength' ? '🏋️' : '💪');
}

function unitFor(type: string): string {
  if (type === 'cardio') return 'mi';
  if (type === 'strength') return 'lbs';
  return 'reps';
}

interface RawWorkout {
  id: string;
  user_id: string;
  mode: string;
  total_score: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface RawExercise {
  id: string;
  workout_id: string;
  name: string;
  type: string;
  reps: number;
  sets: number;
  weight_lbs: number | null;
  distance_km: number | null;
  duration_seconds: number;
  timestamp: string;
}

const startOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday-based
  return d;
};
const startOfMonth = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
};

export function useWOBuddyStats() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<RawWorkout[]>([]);
  const [exercises, setExercises] = useState<RawExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setWorkouts([]); setExercises([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: w } = await supabase
        .from('wobuddy_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const ids = (w || []).map(x => x.id);
      let ex: RawExercise[] = [];
      if (ids.length > 0) {
        const { data: e } = await supabase
          .from('wobuddy_exercises')
          .select('*')
          .in('workout_id', ids);
        ex = (e || []) as RawExercise[];
      }
      if (cancelled) return;
      setWorkouts((w || []) as RawWorkout[]);
      setExercises(ex);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const overviews = useMemo<Record<Period, PeriodOverview>>(() => {
    const wkStart = startOfWeek();
    const moStart = startOfMonth();

    const empty = (): PeriodOverview => ({
      workouts: 0, totalVolume: 0, totalDistance: 0,
      totalReps: 0, avgDuration: 0, caloriesBurned: 0,
    });
    const acc: Record<Period, PeriodOverview & { _durSum: number }> = {
      week: { ...empty(), _durSum: 0 },
      month: { ...empty(), _durSum: 0 },
      all: { ...empty(), _durSum: 0 },
    };

    const exByWorkout = new Map<string, RawExercise[]>();
    for (const e of exercises) {
      const arr = exByWorkout.get(e.workout_id) ?? [];
      arr.push(e);
      exByWorkout.set(e.workout_id, arr);
    }

    for (const w of workouts) {
      const when = new Date(w.completed_at || w.created_at);
      const buckets: Period[] = ['all'];
      if (when >= moStart) buckets.push('month');
      if (when >= wkStart) buckets.push('week');

      const exs = exByWorkout.get(w.id) || [];
      const dur = exs.reduce((s, e) => s + (e.duration_seconds || 0), 0);
      const reps = exs.reduce((s, e) => s + (e.reps || 0) * Math.max(1, e.sets || 1), 0);
      const volume = exs.reduce((s, e) => s + (e.type === 'strength' ? (e.reps || 0) * (e.sets || 1) * (Number(e.weight_lbs) || 0) : 0), 0);
      const distMi = exs.reduce((s, e) => s + (e.type === 'cardio' ? (Number(e.distance_km) || 0) * KM_TO_MI : 0), 0);
      const cal = exs.reduce((s, e) => s + estimateCalories({
        type: e.type, durationSeconds: e.duration_seconds, distanceKm: Number(e.distance_km),
        reps: e.reps, sets: e.sets, weightLbs: Number(e.weight_lbs),
      }), 0);

      for (const b of buckets) {
        acc[b].workouts += 1;
        acc[b].totalVolume += volume;
        acc[b].totalDistance += distMi;
        acc[b].totalReps += reps;
        acc[b].caloriesBurned += cal;
        acc[b]._durSum += dur;
      }
    }
    const finalize = (p: PeriodOverview & { _durSum: number }): PeriodOverview => ({
      workouts: p.workouts,
      totalVolume: Math.round(p.totalVolume),
      totalDistance: Math.round(p.totalDistance * 10) / 10,
      totalReps: Math.round(p.totalReps),
      avgDuration: p.workouts > 0 ? Math.round(p._durSum / p.workouts / 60) : 0,
      caloriesBurned: Math.round(p.caloriesBurned),
    });
    return { week: finalize(acc.week), month: finalize(acc.month), all: finalize(acc.all) };
  }, [workouts, exercises]);

  const exerciseStats = useMemo<ExerciseStat[]>(() => {
    const wkStart = startOfWeek();
    const moStart = startOfMonth();
    const byName = new Map<string, {
      type: string;
      all: number; month: number; week: number;
      pr: number; // for cardio: best pace as min/mi (lower better stored), strength: max weight, bodyweight: max single rep
    }>();
    for (const e of exercises) {
      const when = new Date(e.timestamp);
      const cur = byName.get(e.name) || { type: e.type, all: 0, month: 0, week: 0, pr: 0 };
      let amount = 0;
      if (e.type === 'cardio') amount = (Number(e.distance_km) || 0) * KM_TO_MI;
      else if (e.type === 'strength') amount = (e.reps || 0) * (e.sets || 1) * (Number(e.weight_lbs) || 0);
      else amount = (e.reps || 0) * Math.max(1, e.sets || 1);

      cur.all += amount;
      if (when >= moStart) cur.month += amount;
      if (when >= wkStart) cur.week += amount;

      if (e.type === 'strength') cur.pr = Math.max(cur.pr, Number(e.weight_lbs) || 0);
      else if (e.type === 'bodyweight') cur.pr = Math.max(cur.pr, e.reps || 0);
      // cardio PR (pace) intentionally omitted unless we get pace data
      byName.set(e.name, cur);
    }

    const result: ExerciseStat[] = [];
    byName.forEach((v, name) => {
      const unit = unitFor(v.type);
      const round = (n: number) => v.type === 'cardio' ? Math.round(n * 10) / 10 : Math.round(n);
      const pr = v.type === 'strength' && v.pr > 0 ? `${Math.round(v.pr)} lbs`
        : v.type === 'bodyweight' && v.pr > 0 ? `${v.pr} reps` : undefined;
      result.push({
        name,
        type: (v.type as ExerciseStat['type']),
        icon: pickIcon(name, v.type),
        allTime: { value: round(v.all), unit },
        month: { value: round(v.month), unit },
        week: { value: round(v.week), unit },
        pr,
      });
    });
    return result.sort((a, b) => Number(b.allTime.value) - Number(a.allTime.value));
  }, [exercises]);

  /** Per-day minutes for the current week (Sun..Sat). */
  const weeklyMinutes = useMemo<number[]>(() => {
    const wkStart = startOfWeek();
    const arr = [0, 0, 0, 0, 0, 0, 0];
    for (const e of exercises) {
      const when = new Date(e.timestamp);
      if (when < wkStart) continue;
      const idx = when.getDay();
      arr[idx] += (e.duration_seconds || 0) / 60;
    }
    return arr.map(m => Math.round(m));
  }, [exercises]);

  /** Last N weekly score totals. */
  const weeklyTrend = useMemo<{ week: string; score: number }[]>(() => {
    const buckets = new Map<string, number>();
    for (const w of workouts) {
      const when = new Date(w.completed_at || w.created_at);
      const monday = new Date(when);
      monday.setDate(monday.getDate() - monday.getDay());
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + (w.total_score || 0));
    }
    const sorted = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
    return sorted.map(([k, v], i) => ({ week: `W${i + 1}`, score: v }));
  }, [workouts]);

  /** Daily strength/cardio score breakdown for current week. */
  const dailyBreakdown = useMemo(() => {
    const wkStart = startOfWeek();
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const acc = labels.map(d => ({ date: d, score: 0, strength: 0, cardio: 0 }));
    const exByWorkout = new Map<string, RawExercise[]>();
    for (const e of exercises) {
      const arr = exByWorkout.get(e.workout_id) ?? [];
      arr.push(e); exByWorkout.set(e.workout_id, arr);
    }
    for (const w of workouts) {
      const when = new Date(w.completed_at || w.created_at);
      if (when < wkStart) continue;
      const idx = when.getDay();
      const exs = exByWorkout.get(w.id) || [];
      let strScore = 0, carScore = 0;
      for (const e of exs) {
        const s = e.type === 'strength' ? (e.reps || 0) * (e.sets || 1) * (Number(e.weight_lbs) || 0) * 0.15
          : e.type === 'cardio' ? (Number(e.distance_km) || 0) * KM_TO_MI * 60 + (e.duration_seconds || 0) / 60 * 2
          : (e.reps || 0) * 2;
        if (e.type === 'strength') strScore += s;
        else if (e.type === 'cardio') carScore += s;
        else strScore += s; // bodyweight rolled into strength col
      }
      acc[idx].strength += Math.round(strScore);
      acc[idx].cardio += Math.round(carScore);
      acc[idx].score += Math.round(strScore + carScore);
    }
    return acc;
  }, [workouts, exercises]);

  const todayScore = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workouts.reduce((s, w) => {
      const when = new Date(w.completed_at || w.created_at);
      return when >= today ? s + (w.total_score || 0) : s;
    }, 0);
  }, [workouts]);

  /** One personal record per tracked exercise (best single-set value + date). */
  const personalRecords = useMemo<PersonalRecord[]>(() => {
    // Group exercises per name, sorted oldest -> newest, so we can compute previous best.
    const byName = new Map<string, RawExercise[]>();
    for (const e of exercises) {
      const arr = byName.get(e.name) ?? [];
      arr.push(e);
      byName.set(e.name, arr);
    }

    const metricFor = (e: RawExercise): number => {
      if (e.type === 'strength') return Number(e.weight_lbs) || 0;
      if (e.type === 'cardio') return (Number(e.distance_km) || 0) * KM_TO_MI;
      return e.reps || 0;
    };

    const records: PersonalRecord[] = [];
    byName.forEach((list, name) => {
      const sorted = [...list].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      let bestSoFar = 0;
      let prevBest = 0;
      let prEx: RawExercise | null = null;
      for (const e of sorted) {
        const m = metricFor(e);
        if (m <= 0) continue;
        if (m > bestSoFar) {
          prevBest = bestSoFar;
          bestSoFar = m;
          prEx = e;
        }
      }
      if (!prEx || bestSoFar <= 0) return;
      const type = prEx.type as PersonalRecord['type'];
      const value = type === 'strength' ? `${Math.round(bestSoFar)} lbs`
        : type === 'cardio' ? `${(Math.round(bestSoFar * 10) / 10)} mi`
        : `${Math.round(bestSoFar)} reps`;
      const label = type === 'strength' ? 'Max Weight'
        : type === 'cardio' ? 'Longest Distance'
        : 'Most Reps';
      const delta = prevBest > 0 ? bestSoFar - prevBest : undefined;
      records.push({
        exerciseName: name,
        type,
        icon: pickIcon(name, prEx.type),
        value,
        label,
        achievedAt: prEx.timestamp,
        delta,
        improving: delta !== undefined ? delta > 0 : undefined,
      });
    });
    return records.sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
  }, [exercises]);

  /** Per-exercise weekly trend (last up-to-8 weeks where the exercise has data). */
  const exerciseTrends = useMemo<{ meta: ExerciseTrendMeta; points: ExerciseTrendPoint[] }[]>(() => {
    const byName = new Map<string, RawExercise[]>();
    for (const e of exercises) {
      const arr = byName.get(e.name) ?? [];
      arr.push(e);
      byName.set(e.name, arr);
    }

    const result: { meta: ExerciseTrendMeta; points: ExerciseTrendPoint[] }[] = [];
    byName.forEach((list, name) => {
      const type = list[0].type as ExerciseTrendMeta['type'];
      // Bucket by ISO Sunday-week start.
      const buckets = new Map<string, RawExercise[]>();
      for (const e of list) {
        const d = new Date(e.timestamp);
        const w = new Date(d);
        w.setHours(0, 0, 0, 0);
        w.setDate(w.getDate() - w.getDay());
        const key = w.toISOString().slice(0, 10);
        const arr = buckets.get(key) ?? [];
        arr.push(e);
        buckets.set(key, arr);
      }
      const ordered = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
      const points: ExerciseTrendPoint[] = ordered.map(([weekStart, exs], i) => {
        let value = 0;
        if (type === 'strength') value = Math.max(...exs.map(x => Number(x.weight_lbs) || 0));
        else if (type === 'cardio') value = exs.reduce((s, x) => s + (Number(x.distance_km) || 0) * KM_TO_MI, 0);
        else value = Math.max(...exs.map(x => x.reps || 0));
        return {
          week: `W${i + 1}`,
          weekStart,
          value: type === 'cardio' ? Math.round(value * 10) / 10 : Math.round(value),
        };
      });
      const unit = type === 'cardio' ? 'mi' : type === 'strength' ? 'lbs' : 'reps';
      const metricLabel = type === 'cardio' ? 'Distance' : type === 'strength' ? 'Max Weight' : 'Max Reps';
      result.push({
        meta: { name, type, icon: pickIcon(name, type), unit, metricLabel },
        points,
      });
    });
    // Prefer trends with more data points
    return result
      .filter(r => r.points.length >= 2)
      .sort((a, b) => b.points.length - a.points.length);
  }, [exercises]);

  /** Streaks + monthly volume. */
  const consistency = useMemo<ConsistencyStats>(() => {
    if (workouts.length === 0) {
      return { currentStreak: 0, longestStreak: 0, thisMonth: 0, avgPerWeek: 0 };
    }
    // Set of unique YYYY-MM-DD strings (local-ish using UTC slice for stability).
    const dayKey = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x.toISOString().slice(0, 10);
    };
    const days = new Set<string>();
    for (const w of workouts) {
      days.add(dayKey(new Date(w.completed_at || w.created_at)));
    }
    const sortedDays = [...days].sort();

    // Longest streak
    let longest = 1;
    let run = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const cur = new Date(sortedDays[i]);
      const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) { run++; longest = Math.max(longest, run); }
      else run = 1;
    }

    // Current streak (counting back from today / yesterday)
    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let cursor = new Date(today);
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // allow break for today
    while (days.has(dayKey(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // This month
    const moStart = startOfMonth();
    const thisMonth = workouts.filter(w =>
      new Date(w.completed_at || w.created_at) >= moStart
    ).length;

    // Avg per week: total workouts / weeks since first workout
    const first = new Date(sortedDays[0]);
    const weeks = Math.max(1, (today.getTime() - first.getTime()) / (7 * 86400000));
    const avgPerWeek = Math.round((workouts.length / weeks) * 10) / 10;

    return { currentStreak: current, longestStreak: longest, thisMonth, avgPerWeek };
  }, [workouts]);

  return {
    loading,
    isAuthenticated: !!user,
    overviews,
    exerciseStats,
    personalRecords,
    exerciseTrends,
    consistency,
    weeklyMinutes,
    weeklyTrend,
    dailyBreakdown,
    todayScore,
    workoutCount: workouts.length,
  };
}
