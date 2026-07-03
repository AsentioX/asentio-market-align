import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface Ctx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isMember: boolean;
  role: string | null;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function ScrmAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const check = async (u: User | null) => {
      if (!u) { setRole(null); setIsMember(false); setLoading(false); return; }
      const { data } = await supabase.from('scrm_user_roles' as any).select('role').eq('user_id', u.id).limit(1);
      const r = (data as any)?.[0]?.role ?? null;
      if (!r) {
        // bootstrap: if no roles exist at all, self-assign chair
        const { count } = await supabase.from('scrm_user_roles' as any).select('id', { count: 'exact', head: true });
        if ((count ?? 0) === 0) {
          await supabase.from('scrm_user_roles' as any).insert({ user_id: u.id, role: 'chair', email: u.email });
          setRole('chair'); setIsMember(true);
        } else {
          setRole(null); setIsMember(false);
        }
      } else {
        setRole(r); setIsMember(true);
      }
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null);
      setTimeout(() => check(s?.user ?? null), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setUser(data.session?.user ?? null);
      check(data.session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, session, loading, isMember, role, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useScrmAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useScrmAuth must be used within ScrmAuthProvider');
  return ctx;
}
