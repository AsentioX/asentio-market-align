import { useEffect, useState, useRef, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface Ctx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isMember: boolean;
  role: string | null;
  mustChangePassword: boolean;
  refreshMembership: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function ScrmAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const checkRef = useRef<((u: User | null) => Promise<void>) | null>(null);

  useEffect(() => {
    const check = async (u: User | null) => {
      if (!u) { setRole(null); setIsMember(false); setMustChangePassword(false); setLoading(false); return; }
      let { data } = await supabase.from('scrm_user_roles' as any).select('role, must_change_password').eq('user_id', u.id).limit(1);
      let r = (data as any)?.[0]?.role ?? null;
      setMustChangePassword(!!(data as any)?.[0]?.must_change_password);
      if (!r) {
        // claim a pending invite created by an admin with this email
        const { data: claimed } = await supabase.rpc('scrm_claim_pending_membership' as any);
        if (claimed) {
          const res = await supabase.from('scrm_user_roles' as any).select('role, must_change_password').eq('user_id', u.id).limit(1);
          r = (res.data as any)?.[0]?.role ?? null;
          setMustChangePassword(!!(res.data as any)?.[0]?.must_change_password);
        }
      }
      if (!r) {
        // bootstrap: if no roles exist at all, self-assign admin
        const { count } = await supabase.from('scrm_user_roles' as any).select('id', { count: 'exact', head: true });
        if ((count ?? 0) === 0) {
          await supabase.from('scrm_user_roles' as any).insert({ user_id: u.id, role: 'admin', email: u.email });
          setRole('admin'); setIsMember(true);
        } else {
          setRole(null); setIsMember(false);
        }
      } else {
        setRole(r); setIsMember(true);
      }
      setLoading(false);
    };
    checkRef.current = check;
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
    <AuthCtx.Provider value={{ user, session, loading, isMember, role, mustChangePassword,
      refreshMembership: async () => { await checkRef.current?.(user); }, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useScrmAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useScrmAuth must be used within ScrmAuthProvider');
  return ctx;
}
