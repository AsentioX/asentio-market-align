import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WOBuddyCompetition {
  id: string;
  title: string;
  description: string | null;
  type: string; // 'daily' | 'weekly' (free-form in DB)
  target: number;
  timeRemaining: string | null;
  imageUrl: string | null;
  joined: boolean;
  progress: number;
  participants: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

function initials(name: string | null | undefined): string {
  if (!name) return '··';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '··';
}

export function useWOBuddyCompetitions() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<WOBuddyCompetition[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: comps } = await supabase
      .from('wobuddy_competitions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const compIds = (comps || []).map(c => c.id);

    let parts: any[] = [];
    if (compIds.length > 0) {
      const { data } = await supabase
        .from('wobuddy_competition_participants')
        .select('id, competition_id, user_id, progress, joined_at')
        .in('competition_id', compIds);
      parts = data || [];
    }

    // Pull display names for everyone on the leaderboard.
    const userIds = Array.from(new Set(parts.map(p => p.user_id)));
    const nameByUser = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: us } = await supabase
        .from('wobuddy_users')
        .select('user_id, display_name, email')
        .in('user_id', userIds);
      (us || []).forEach(u => {
        nameByUser.set(u.user_id, u.display_name || u.email?.split('@')[0] || 'Athlete');
      });
    }

    const partsByComp = new Map<string, any[]>();
    parts.forEach(p => {
      const arr = partsByComp.get(p.competition_id) ?? [];
      arr.push(p);
      partsByComp.set(p.competition_id, arr);
    });

    const lbMap: Record<string, LeaderboardEntry[]> = {};
    const compRows: WOBuddyCompetition[] = (comps || []).map(c => {
      const list = (partsByComp.get(c.id) || []).slice().sort((a, b) => b.progress - a.progress);
      lbMap[c.id] = list.slice(0, 25).map((p, i) => {
        const name = nameByUser.get(p.user_id) || 'Athlete';
        return {
          rank: i + 1,
          name: user && p.user_id === user.id ? name : name,
          score: Number(p.progress) || 0,
          avatar: initials(name),
          isCurrentUser: !!user && p.user_id === user.id,
        };
      });
      const my = user ? list.find(p => p.user_id === user.id) : null;
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        target: Number(c.target) || 0,
        timeRemaining: c.time_remaining,
        imageUrl: c.image_url,
        joined: !!my,
        progress: Number(my?.progress) || 0,
        participants: list.length,
      };
    });

    setCompetitions(compRows);
    setLeaderboards(lbMap);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleJoin = useCallback(async (competitionId: string) => {
    if (!user) return;
    const cur = competitions.find(c => c.id === competitionId);
    if (!cur) return;

    if (cur.joined) {
      await supabase
        .from('wobuddy_competition_participants')
        .delete()
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('wobuddy_competition_participants')
        .insert({ competition_id: competitionId, user_id: user.id, progress: 0 });
    }
    await load();
  }, [user, competitions, load]);

  return { competitions, leaderboards, loading, isAuthenticated: !!user, toggleJoin, refresh: load };
}
