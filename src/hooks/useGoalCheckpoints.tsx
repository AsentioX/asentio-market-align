// Compatibility shim: the old wobuddy_goal_checkpoints table was removed in the v2
// schema migration. The new equivalent is wobuddy_goal_progress_logs, which records
// arbitrary progress measurements without a fixed schedule.
//
// This hook now derives "virtual" checkpoints from the progress log + goal target
// date so legacy UI (GoalCheckpointPanel) continues to render and accept logs.
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GoalCheckpoint {
  id: string;
  goal_id: string;
  scheduled_for: string;
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
    if (!user) { setCheckpoints([]); setLoading(false); return; }

    // Pull goals + recent progress logs and synthesize checkpoint objects
    const { data: goals } = await supabase
      .from('wobuddy_goals')
      .select('id, target_date, start_date')
      .eq('user_id', user.id);
    const { data: logs } = await supabase
      .from('wobuddy_goal_progress_logs')
      .select('id, goal_id, value, logged_at')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true });

    const synthesized: GoalCheckpoint[] = [];
    (goals || []).forEach(g => {
      const goalLogs = (logs || []).filter(l => l.goal_id === g.id);
      goalLogs.forEach((l, i) => {
        synthesized.push({
          id: l.id,
          goal_id: g.id,
          scheduled_for: l.logged_at.split('T')[0],
          measured_value: Number(l.value),
          measured_at: l.logged_at,
          note: null,
          status: 'logged',
          sequence_number: i + 1,
        });
      });
      // Add one virtual pending checkpoint at target_date if no recent log
      if (g.target_date) {
        synthesized.push({
          id: `pending-${g.id}`,
          goal_id: g.id,
          scheduled_for: g.target_date,
          measured_value: null,
          measured_at: null,
          note: null,
          status: 'pending',
          sequence_number: goalLogs.length + 1,
        });
      }
    });

    setCheckpoints(synthesized);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCheckpoints(); }, [fetchCheckpoints]);

  const logCheckpoint = useCallback(async (
    _checkpointId: string,
    goalId: string,
    measuredValue: number,
    note?: string,
  ) => {
    if (!user) return;
    await supabase.from('wobuddy_goal_progress_logs').insert({
      user_id: user.id,
      goal_id: goalId,
      metric_name: 'progress',
      value: measuredValue,
      source: 'manual',
    });
    await supabase.from('wobuddy_goals').update({ current_value: measuredValue }).eq('id', goalId).eq('user_id', user.id);
    await fetchCheckpoints();
  }, [user, fetchCheckpoints]);

  const skipCheckpoint = useCallback(async (_checkpointId: string) => {
    // No-op: virtual pending checkpoints can simply be ignored.
    return;
  }, []);

  const getNextCheckpoint = useCallback((goalId: string): GoalCheckpoint | undefined => {
    return checkpoints
      .filter(c => c.goal_id === goalId && c.status === 'pending')
      .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for))[0];
  }, [checkpoints]);

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
