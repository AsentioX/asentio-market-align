import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  mockUser, mockWorkouts, mockCompetitions, mockLeaderboard,
  mockAchievements, mockProgressData, mockWeeklyTrend,
  type Workout, type Competition, type LeaderboardEntry, type Achievement,
  calculateScore,
} from '@/pages/labs/wo-buddy/mockData';

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

const defaultProfile: WOBuddyProfile = {
  height: mockUser.height,
  weight: mockUser.weight,
  goalWeight: mockUser.goalWeight,
  birthdate: '1998-01-15',
  gender: mockUser.gender,
  ethnicity: 'Asian',
  bodyFat: mockUser.bodyFat,
  restingHR: mockUser.restingHR,
  displayName: mockUser.name,
  avatarInitials: mockUser.avatar,
  dailyGoal: mockUser.dailyGoal,
  weeklyGoal: mockUser.weeklyGoal,
  avatarUrl: null,
  backgroundUrl: null,
};

export function useWOBuddyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WOBuddyProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(defaultProfile); setLoading(false); return; }
    
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
          birthdate: data.birthdate || '1998-01-15',
          gender: data.gender || '',
          ethnicity: data.ethnicity || '',
          bodyFat: Number(data.body_fat_pct) || 0,
          restingHR: data.resting_hr || 0,
          displayName: data.display_name || '',
          avatarInitials: data.avatar_initials || '',
          dailyGoal: data.daily_goal,
          weeklyGoal: data.weekly_goal,
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
    }).eq('user_id', user.id);
  }, [user, profile]);

  return { profile, updateProfile, loading, isAuthenticated: !!user };
}

export function useWOBuddyWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setWorkouts(mockWorkouts); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('wobuddy_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setWorkouts(data.map(w => ({
          id: w.id,
          type: w.mode as Workout['type'],
          exercise: w.mode,
          score: w.total_score,
          date: new Date(w.created_at).toISOString().split('T')[0],
          details: {},
        })));
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

  return { workouts, saveWorkout, loading, isAuthenticated: !!user };
}

// Re-export mock data for non-DB parts (leaderboard, progress charts)
export { mockUser, mockCompetitions, mockLeaderboard, mockAchievements, mockProgressData, mockWeeklyTrend, calculateScore };
