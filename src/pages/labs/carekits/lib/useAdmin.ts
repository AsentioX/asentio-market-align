import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    return () => { sub.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!userId) { setIsAdmin(false); setLoading(false); return; }
      const { data } = await (supabase as any).from('profiles').select('role').eq('id', userId).maybeSingle();
      if (!cancelled) {
        setIsAdmin(data?.role === 'admin');
        setLoading(false);
      }
    }
    setLoading(true);
    check();
    return () => { cancelled = true; };
  }, [userId]);

  return { loading, isAdmin, userId };
}
