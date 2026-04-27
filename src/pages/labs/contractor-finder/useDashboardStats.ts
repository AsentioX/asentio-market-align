import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  total: number;
  states: Array<[string, number]>;
  trades: Array<[string, number]>;
  verifiedLicensePct: number;
  websitePct: number;
  emailPct: number;
  phonePct: number;
  recentPct: number;
  loading: boolean;
  error: string | null;
}

const initial: DashboardStats = {
  total: 0,
  states: [],
  trades: [],
  verifiedLicensePct: 0,
  websitePct: 0,
  emailPct: 0,
  phonePct: 0,
  recentPct: 0,
  loading: true,
  error: null,
};

// Lightweight count helper — uses HEAD request, no rows pulled.
async function countWhere(builder: (q: any) => any): Promise<number> {
  const base = supabase.from('cf_contractors').select('*', { count: 'exact', head: true });
  const { count, error } = await builder(base);
  if (error) throw error;
  return count ?? 0;
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>(initial);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

        const [
          total,
          verified,
          withWebsite,
          withEmail,
          withPhone,
          recent,
          stateRows,
          tradeRows,
        ] = await Promise.all([
          countWhere((q) => q),
          countWhere((q) => q.eq('license_status', 'CLEAR')),
          countWhere((q) => q.not('website', 'is', null)),
          countWhere((q) => q.not('email', 'is', null)),
          countWhere((q) => q.not('phone', 'is', null)),
          countWhere((q) => q.gte('last_verified_date', fourteenDaysAgo)),
          // Pull just the columns needed for grouping. Capped to keep payload small.
          supabase.from('cf_contractors').select('state').limit(60000),
          supabase.from('cf_contractors').select('contractor_type').limit(60000),
        ]);

        if (cancelled) return;

        const groupCount = (rows: any[] | null, key: string): Array<[string, number]> => {
          const map: Record<string, number> = {};
          (rows ?? []).forEach((r) => {
            const v = r?.[key];
            if (!v) return;
            map[v] = (map[v] ?? 0) + 1;
          });
          return Object.entries(map).sort((a, b) => b[1] - a[1]);
        };

        const safePct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

        setStats({
          total,
          states: groupCount(stateRows.data as any[], 'state'),
          trades: groupCount(tradeRows.data as any[], 'contractor_type'),
          verifiedLicensePct: safePct(verified),
          websitePct: safePct(withWebsite),
          emailPct: safePct(withEmail),
          phonePct: safePct(withPhone),
          recentPct: safePct(recent),
          loading: false,
          error: null,
        });
      } catch (e: any) {
        if (cancelled) return;
        console.warn('[CF] dashboard stats failed', e);
        setStats((s) => ({ ...s, loading: false, error: e?.message ?? 'Failed to load stats' }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
