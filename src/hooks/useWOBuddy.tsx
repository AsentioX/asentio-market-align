import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WOBuddyProfile {
  height: number;
  weight: number;
  goalWeight: number;
  birthdate: string;
  gender: string;
  ethnicity: string;
  bodyFat: number;
  restingHR: number;
  displayName: string;
  avatarInitials: string;
  dailyGoal: number;
  weeklyGoal: number;
  avatarUrl: string | null;
  backgroundUrl: string | null;
}

export interface Workout {
  id: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  exercise: string;
  score: number;
  date: string;
  details: Record<string, any>;
}

const emptyProfile: WOBuddyProfile = {
  height: 0,
  weight: 0,
  goalWeight: 0,
  birthdate: '',
  gender: '',
  ethnicity: '',
  bodyFat: 0,
  restingHR: 0,
  displayName: '',
  avatarInitials: '',
  dailyGoal: 500,
  weeklyGoal: 5,
  avatarUrl: null,
  backgroundUrl: null,
};

export function useWOBuddyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WOBuddyProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(emptyProfile); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('wobuddy_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({
          height: Number(data.height_cm) || 0,
          weight: Number(data.weight_kg) || 0,
          goalWeight: Number(data.goal_weight_kg) || 0,
          birthdate: data.birthdate || '',
          gender: data.gender || '',
          ethnicity: data.ethnicity || '',
          bodyFat: Number(data.body_fat_pct) || 0,
          restingHR: data.resting_hr || 0,
          displayName: data.display_name || '',
          avatarInitials: data.avatar_initials || '',
          dailyGoal: data.daily_goal,
          weeklyGoal: data.weekly_goal,
          avatarUrl: (data as any).avatar_url || null,
          backgroundUrl: (data as any).background_url || null,
        });
      } else {
        // Create profile for new user
        await supabase.from('wobuddy_profiles').insert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          avatar_initials: (user.email?.slice(0, 2) || 'U').toUpperCase(),
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<WOBuddyProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    if (!user) return;

    await supabase.from('wobuddy_profiles').update({
      height_cm: newProfile.height,
      weight_kg: newProfile.weight,
      goal_weight_kg: newProfile.goalWeight,
      birthdate: newProfile.birthdate,
      gender: newProfile.gender,
      ethnicity: newProfile.ethnicity,
      body_fat_pct: newProfile.bodyFat,
      resting_hr: newProfile.restingHR,
      display_name: newProfile.displayName,
      avatar_initials: newProfile.avatarInitials,
      daily_goal: newProfile.dailyGoal,
      weekly_goal: newProfile.weeklyGoal,
      avatar_url: newProfile.avatarUrl,
      background_url: newProfile.backgroundUrl,
    } as any).eq('user_id', user.id);
  }, [user, profile]);

  return { profile, updateProfile, loading, isAuthenticated: !!user };
}

export function useWOBuddyWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setWorkouts([]); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('wobuddy_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const workoutIds = data.map(w => w.id);
        const { data: exData } = await supabase
          .from('wobuddy_exercises')
          .select('*')
          .in('workout_id', workoutIds);

        const exByWorkout = (exData || []).reduce<Record<string, any[]>>((acc, ex) => {
          (acc[ex.workout_id] ||= []).push(ex);
          return acc;
        }, {});

        setWorkouts(data.map(w => {
          const exs = exByWorkout[w.id] || [];
          const primary = exs[0];
          return {
            id: w.id,
            type: (primary?.type || w.mode) as Workout['type'],
            exercise: primary?.name || w.mode,
            score: w.total_score,
            date: new Date(w.created_at).toISOString().split('T')[0],
            details: {
              exercises: exs.map(e => ({
                name: e.name,
                type: e.type,
                reps: e.reps,
                sets: e.sets,
                weight: e.weight_lbs ? Number(e.weight_lbs) : undefined,
                distance: e.distance_km ? Number(e.distance_km) : undefined,
                duration_seconds: e.duration_seconds,
              })),
            } as any,
          };
        }));
      } else {
        setWorkouts([]);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const saveWorkout = useCallback(async (mode: string, totalScore: number, exercises: Array<{
    name: string; type: string; reps: number; sets?: number;
    weight?: number; distance?: number; duration: number; confidence?: number;
  }>) => {
    if (!user) return null;

    const { data: workout } = await supabase
      .from('wobuddy_workouts')
      .insert({
        user_id: user.id,
        mode,
        total_score: totalScore,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (workout && exercises.length > 0) {
      await supabase.from('wobuddy_exercises').insert(
        exercises.map(ex => ({
          workout_id: workout.id,
          user_id: user.id,
          name: ex.name,
          type: ex.type,
          reps: ex.reps,
          sets: ex.sets || 1,
          weight_lbs: ex.weight || null,
          distance_km: ex.distance || null,
          duration_seconds: ex.duration,
          confidence: ex.confidence || null,
        }))
      );
    }

    return workout;
  }, [user]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    if (!user) return;
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    await supabase.from('wobuddy_exercises').delete().eq('workout_id', workoutId);
    await supabase.from('wobuddy_workouts').delete().eq('id', workoutId).eq('user_id', user.id);
  }, [user]);

  const deleteWorkoutsByDate = useCallback(async (date: string) => {
    if (!user) return;
    const toDelete = workouts.filter(w => w.date === date).map(w => w.id);
    if (toDelete.length === 0) return;
    setWorkouts(prev => prev.filter(w => w.date !== date));
    await supabase.from('wobuddy_exercises').delete().in('workout_id', toDelete);
    await supabase.from('wobuddy_workouts').delete().in('id', toDelete).eq('user_id', user.id);
  }, [user, workouts]);

  return { workouts, saveWorkout, deleteWorkout, deleteWorkoutsByDate, loading, isAuthenticated: !!user };
}
