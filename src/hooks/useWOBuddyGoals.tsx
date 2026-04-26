import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GoalCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  icon: string;
}

export interface GoalDriver {
  driver: string;
  weight: number;
  explanation: string | null;
}

// Backward-compatible Goal shape: we expose BOTH new fields (title, target_date, priority,
// category_id, target_unit, start_value, start_date, description) AND legacy aliases
// (name = title, deadline = target_date, category = category_slug, metric = target_unit)
// so older UI keeps working while we migrate screens.
export interface Goal {
  id: string;
  // New canonical fields
  title: string;
  description: string | null;
  category_id: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived' | string;
  priority: 'primary' | 'secondary' | 'supporting' | string;
  target_value: number;
  target_unit: string | null;
  current_value: number;
  start_value: number;
  start_date: string | null;
  target_date: string | null;
  drivers: GoalDriver[];
  created_at: string;
  // Legacy aliases (read-only; kept so old components keep rendering)
  name: string;
  category: string;        // category slug, e.g. 'strength_power'
  metric: string;          // mirror of target_unit
  deadline: string | null; // mirror of target_date
  timeframe: string | null;
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

const STATIC_PERFORMANCE_DRIVERS: PerformanceDriver[] = [
  { id: 'Strength', name: 'Strength', description: 'Raw force production and muscle power', icon: '💪' },
  { id: 'Endurance', name: 'Endurance', description: 'Sustained effort over time', icon: '🫁' },
  { id: 'Power', name: 'Power', description: 'Explosive force and speed', icon: '⚡' },
  { id: 'Stability', name: 'Stability', description: 'Core control and balance', icon: '🏔️' },
  { id: 'Mobility', name: 'Mobility', description: 'Range of motion and flexibility', icon: '🧘' },
  { id: 'Efficiency', name: 'Efficiency', description: 'Energy economy and performance per effort', icon: '📊' },
  { id: 'Technique', name: 'Technique', description: 'Movement quality and skill precision', icon: '🎯' },
];

export function usePerformanceDrivers() {
  // Driver names are now a fixed CHECK-constraint set on wobuddy_goal_drivers,
  // so we expose them statically (no DB round-trip needed).
  return STATIC_PERFORMANCE_DRIVERS;
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

export function useGoalCategories() {
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  useEffect(() => {
    supabase
      .from('wobuddy_goal_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => { if (data) setCategories(data as GoalCategory[]); });
  }, []);
  return categories;
}

export function useWOBuddyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<GoalCategory[]>([]);

  // Fetch categories once for slug lookup
  useEffect(() => {
    supabase.from('wobuddy_goal_categories').select('*').then(({ data }) => {
      if (data) setCategories(data as GoalCategory[]);
    });
  }, []);

  const categoryMap = useMemo(() => {
    const m = new Map<string, GoalCategory>();
    categories.forEach(c => m.set(c.id, c));
    return m;
  }, [categories]);

  const fetchGoals = useCallback(async () => {
    if (!user) { setGoals([]); setLoading(false); return; }

    const { data: goalsData } = await supabase
      .from('wobuddy_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!goalsData) { setLoading(false); return; }

    const goalIds = goalsData.map(g => g.id);
    const { data: driverData } = await supabase
      .from('wobuddy_goal_drivers')
      .select('goal_id, driver, weight, explanation')
      .in('goal_id', goalIds.length > 0 ? goalIds : ['00000000-0000-0000-0000-000000000000']);

    const driversByGoal = new Map<string, GoalDriver[]>();
    (driverData || []).forEach((d: { goal_id: string; driver: string; weight: number; explanation: string | null }) => {
      if (!driversByGoal.has(d.goal_id)) driversByGoal.set(d.goal_id, []);
      driversByGoal.get(d.goal_id)!.push({ driver: d.driver, weight: d.weight, explanation: d.explanation });
    });

    const mapped: Goal[] = goalsData.map(g => {
      const cat = g.category_id ? categoryMap.get(g.category_id) : undefined;
      const drivers = driversByGoal.get(g.id) || [];
      return {
        id: g.id,
        title: g.title,
        description: g.description,
        category_id: g.category_id,
        status: g.status,
        priority: g.priority,
        target_value: Number(g.target_value ?? 0),
        target_unit: g.target_unit,
        current_value: Number(g.current_value ?? 0),
        start_value: Number(g.start_value ?? 0),
        start_date: g.start_date,
        target_date: g.target_date,
        drivers,
        created_at: g.created_at,
        // Legacy aliases
        name: g.title,
        category: cat?.slug ?? '',
        metric: g.target_unit ?? '',
        deadline: g.target_date,
        timeframe: null,
      };
    });

    setGoals(mapped);
    setLoading(false);
  }, [user, categoryMap]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = useCallback(async (goal: {
    title: string;
    description?: string;
    category_id?: string | null;
    priority?: 'primary' | 'secondary' | 'supporting';
    target_value: number;
    target_unit?: string;
    current_value?: number;
    start_value?: number;
    start_date?: string;
    target_date?: string;
    drivers: Array<{ driver: string; weight?: number; explanation?: string }>;
  }) => {
    if (!user) return null;

    const { data: newGoal, error } = await supabase
      .from('wobuddy_goals')
      .insert({
        user_id: user.id,
        title: goal.title,
        description: goal.description ?? null,
        category_id: goal.category_id ?? null,
        priority: goal.priority ?? 'primary',
        target_value: goal.target_value,
        target_unit: goal.target_unit ?? null,
        current_value: goal.current_value ?? goal.start_value ?? 0,
        start_value: goal.start_value ?? goal.current_value ?? 0,
        start_date: goal.start_date ?? new Date().toISOString().split('T')[0],
        target_date: goal.target_date ?? null,
        status: 'active',
      })
      .select()
      .single();

    if (error || !newGoal) {
      console.error('createGoal error', error);
      return null;
    }

    if (goal.drivers.length > 0) {
      const rows = goal.drivers.map(d => ({
        goal_id: newGoal.id,
        driver: d.driver,
        weight: d.weight ?? 5,
        explanation: d.explanation ?? null,
      }));
      await supabase.from('wobuddy_goal_drivers').insert(rows);
    }

    await fetchGoals();
    return newGoal;
  }, [user, fetchGoals]);

  const updateGoal = useCallback(async (
    id: string,
    updates: Partial<Pick<Goal, 'current_value' | 'status' | 'title' | 'description' | 'priority' | 'target_value' | 'target_unit' | 'target_date'>>
  ) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = { ...updates };
    await supabase.from('wobuddy_goals').update(dbUpdates).eq('id', id).eq('user_id', user.id);
    await fetchGoals();
  }, [user, fetchGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('wobuddy_goals').delete().eq('id', id).eq('user_id', user.id);
    await fetchGoals();
  }, [user, fetchGoals]);

  const logProgress = useCallback(async (goalId: string, value: number, opts?: { metricName?: string; unit?: string; source?: 'manual'|'workout'|'wearable'|'equipment'|'app'; note?: string }) => {
    if (!user) return;
    await supabase.from('wobuddy_goal_progress_logs').insert({
      user_id: user.id,
      goal_id: goalId,
      metric_name: opts?.metricName ?? 'progress',
      value,
      unit: opts?.unit ?? null,
      source: opts?.source ?? 'manual',
    });
    await supabase.from('wobuddy_goals').update({ current_value: value }).eq('id', goalId).eq('user_id', user.id);
    await fetchGoals();
  }, [user, fetchGoals]);

  return { goals, loading, categories, createGoal, updateGoal, deleteGoal, logProgress, isAuthenticated: !!user };
}
