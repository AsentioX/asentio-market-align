import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Goal {
  id: string;
  name: string;
  category: string;
  metric: string;
  target_value: number;
  current_value: number;
  timeframe: string | null;
  deadline: string | null;
  status: string;
  drivers: string[];
  created_at: string;
}

export interface PerformanceDriver {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

export interface ActivityEnrichment {
  activity_name: string;
  training_purpose: string | null;
  driver_name: string;
  explanation: string | null;
  target_suggestion: string | null;
}

export function usePerformanceDrivers() {
  const [drivers, setDrivers] = useState<PerformanceDriver[]>([]);

  useEffect(() => {
    supabase.from('wobuddy_performance_drivers').select('*').then(({ data }) => {
      if (data) setDrivers(data);
    });
  }, []);

  return drivers;
}

export function useActivityEnrichments() {
  const [enrichments, setEnrichments] = useState<ActivityEnrichment[]>([]);

  useEffect(() => {
    supabase.from('wobuddy_activity_enrichments').select('*').then(({ data }) => {
      if (data) setEnrichments(data as unknown as ActivityEnrichment[]);
    });
  }, []);

  return enrichments;
}

export function useWOBuddyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) { setGoals([]); setLoading(false); return; }

    const { data: goalsData } = await supabase
      .from('wobuddy_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!goalsData) { setLoading(false); return; }

    // Fetch driver mappings for all goals
    const goalIds = goalsData.map(g => g.id);
    const { data: driverData } = await supabase
      .from('wobuddy_goal_drivers')
      .select('goal_id, driver_id')
      .in('goal_id', goalIds.length > 0 ? goalIds : ['none']);

    // Fetch driver names
    const { data: allDrivers } = await supabase
      .from('wobuddy_performance_drivers')
      .select('id, name');

    const driverNameMap = new Map((allDrivers || []).map(d => [d.id, d.name]));

    const mapped: Goal[] = goalsData.map(g => ({
      id: g.id,
      name: g.name,
      category: g.category,
      metric: g.metric,
      target_value: Number(g.target_value),
      current_value: Number(g.current_value),
      timeframe: g.timeframe,
      deadline: g.deadline,
      status: g.status,
      created_at: g.created_at,
      drivers: (driverData || [])
        .filter(d => d.goal_id === g.id)
        .map(d => driverNameMap.get(d.driver_id) || '')
        .filter(Boolean),
    }));

    setGoals(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = useCallback(async (goal: {
    name: string; category: string; metric: string; target_value: number;
    timeframe?: string; deadline?: string; drivers: string[];
  }) => {
    if (!user) return null;

    const { data: newGoal } = await supabase
      .from('wobuddy_goals')
      .insert({
        user_id: user.id,
        name: goal.name,
        category: goal.category,
        metric: goal.metric,
        target_value: goal.target_value,
        timeframe: goal.timeframe || null,
        deadline: goal.deadline || null,
      })
      .select()
      .single();

    if (newGoal && goal.drivers.length > 0) {
      const { data: allDrivers } = await supabase
        .from('wobuddy_performance_drivers')
        .select('id, name');
      
      const driverIds = (allDrivers || [])
        .filter(d => goal.drivers.includes(d.name))
        .map(d => ({ goal_id: newGoal.id, driver_id: d.id }));

      if (driverIds.length > 0) {
        await supabase.from('wobuddy_goal_drivers').insert(driverIds);
      }
    }

    await fetchGoals();
    return newGoal;
  }, [user, fetchGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Pick<Goal, 'current_value' | 'status' | 'name'>>) => {
    if (!user) return;
    await supabase.from('wobuddy_goals').update(updates).eq('id', id).eq('user_id', user.id);
    await fetchGoals();
  }, [user, fetchGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('wobuddy_goals').delete().eq('id', id).eq('user_id', user.id);
    await fetchGoals();
  }, [user, fetchGoals]);

  return { goals, loading, createGoal, updateGoal, deleteGoal, isAuthenticated: !!user };
}
