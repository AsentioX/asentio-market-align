import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GoalCheckpoint {
  id: string;
  goal_id: string;
  scheduled_for: string; // YYYY-MM-DD
  measured_value: number | null;
  measured_at: string | null;
  note: string | null;
  status: 'pending' | 'logged' | 'skipped';
  sequence_number: number;
}

export function useGoalCheckpoints() {
  const { user } = useAuth();
  const [checkpoints, setCheckpoints] = useState<GoalCheckpoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckpoints = useCallback(async () => {
    if (!user) {
      setCheckpoints([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('wobuddy_goal_checkpoints')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true });

    if (data) setCheckpoints(data as unknown as GoalCheckpoint[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCheckpoints(); }, [fetchCheckpoints]);

  /**
   * Log a checkpoint measurement. This:
   *  - Records the user's measured value on the checkpoint
   *  - Updates the parent goal's current_value so the plan engine adapts
   *  - Recomputes status (on_track / behind / ahead / achieved) based on pace
   */
  const logCheckpoint = useCallback(async (
    checkpointId: string,
    goalId: string,
    measuredValue: number,
    note?: string
  ) => {
    if (!user) return;

    // Update the checkpoint
    await supabase
      .from('wobuddy_goal_checkpoints')
      .update({
        measured_value: measuredValue,
        measured_at: new Date().toISOString(),
        note: note || null,
        status: 'logged',
      })
      .eq('id', checkpointId)
      .eq('user_id', user.id);

    // Pull goal context to adjust status + current_value
    const { data: goalData } = await supabase
      .from('wobuddy_goals')
      .select('target_value, current_value, deadline, created_at')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (goalData) {
      const target = Number(goalData.target_value);
      const start = Number(goalData.current_value || 0);

      // Determine new status by comparing actual progress to expected pace
      let newStatus: 'on_track' | 'behind' | 'ahead' | 'achieved' = 'on_track';
      if (target > 0 && (measuredValue >= target || (start > target && measuredValue <= target))) {
        newStatus = 'achieved';
      } else if (goalData.deadline) {
        const created = new Date(goalData.created_at).getTime();
        const deadline = new Date(goalData.deadline).getTime();
        const now = Date.now();
        const totalMs = deadline - created;
        const elapsedMs = now - created;
        const expectedFraction = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;
        // For "decreasing" goals (e.g. lower time is better), invert
        const isDecreasing = start > target;
        const range = Math.abs(target - start) || 1;
        const actualProgress = isDecreasing
          ? Math.max(0, (start - measuredValue) / range)
          : Math.max(0, (measuredValue - start) / range);

        if (actualProgress >= expectedFraction + 0.1) newStatus = 'ahead';
        else if (actualProgress < expectedFraction - 0.1) newStatus = 'behind';
        else newStatus = 'on_track';
      }

      await supabase
        .from('wobuddy_goals')
        .update({ current_value: measuredValue, status: newStatus })
        .eq('id', goalId)
        .eq('user_id', user.id);
    }

    await fetchCheckpoints();
  }, [user, fetchCheckpoints]);

  const skipCheckpoint = useCallback(async (checkpointId: string) => {
    if (!user) return;
    await supabase
      .from('wobuddy_goal_checkpoints')
      .update({ status: 'skipped', measured_at: new Date().toISOString() })
      .eq('id', checkpointId)
      .eq('user_id', user.id);
    await fetchCheckpoints();
  }, [user, fetchCheckpoints]);

  // Helper: get the next pending checkpoint for a goal
  const getNextCheckpoint = useCallback((goalId: string): GoalCheckpoint | undefined => {
    return checkpoints
      .filter(c => c.goal_id === goalId && c.status === 'pending')
      .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for))[0];
  }, [checkpoints]);

  // Helper: checkpoints that are due (scheduled_for <= today and pending)
  const getDueCheckpoints = useCallback((): GoalCheckpoint[] => {
    const today = new Date().toISOString().split('T')[0];
    return checkpoints.filter(c => c.status === 'pending' && c.scheduled_for <= today);
  }, [checkpoints]);

  return {
    checkpoints,
    loading,
    logCheckpoint,
    skipCheckpoint,
    getNextCheckpoint,
    getDueCheckpoints,
    refetch: fetchCheckpoints,
  };
}
