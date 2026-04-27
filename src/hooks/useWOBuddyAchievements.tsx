import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WOBuddyAchievement {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

function fmtDate(iso: string | null): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function useWOBuddyAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<WOBuddyAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setAchievements([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('wobuddy_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked', { ascending: false })
      .order('created_at', { ascending: true });
    setAchievements((data || []).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      unlocked: a.unlocked,
      unlockedAt: a.unlocked_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    achievements,
    loading,
    isAuthenticated: !!user,
    refresh,
    formatUnlockDate: fmtDate,
  };
}
