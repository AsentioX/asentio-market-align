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

  return {
    loading,
    isAuthenticated: !!user,
    overviews,
    exerciseStats,
    weeklyMinutes,
    weeklyTrend,
    dailyBreakdown,
    todayScore,
    workoutCount: workouts.length,
  };
}
