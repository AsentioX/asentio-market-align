import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface PerkPathUser {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

interface PerkPathAuthContextType {
  user: User | null;
  session: Session | null;
  perkpathUser: PerkPathUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const PerkPathAuthContext = createContext<PerkPathAuthContextType | undefined>(undefined);

export const PerkPathAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perkpathUser, setPerkpathUser] = useState<PerkPathUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreatePerkPathUser = useCallback(async (authUser: User) => {
    const { data, error } = await supabase
      .from('pp_users')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (data) {
      setPerkpathUser(data as PerkPathUser);
      await supabase.from('pp_users').update({ last_active_at: new Date().toISOString() }).eq('user_id', authUser.id);
    } else if (!error) {
      // Insert triggers seeding of demo memberships
      const { data: newUser } = await supabase
        .from('pp_users')
        .insert({
          user_id: authUser.id,
          email: authUser.email,
          display_name:
            (authUser.user_metadata?.full_name as string | undefined) ||
            (authUser.user_metadata?.name as string | undefined) ||
            authUser.email?.split('@')[0] ||
            null,
          avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
        })
        .select()
        .single();
      if (newUser) setPerkpathUser(newUser as PerkPathUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchOrCreatePerkPathUser(sess.user), 0);
      } else {
        setPerkpathUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchOrCreatePerkPathUser(sess.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchOrCreatePerkPathUser]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/labs/perkpath',
        data: { full_name: displayName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPerkpathUser(null);
  };

  return (
    <PerkPathAuthContext.Provider
      value={{
        user,
        session,
        perkpathUser,
        isAdmin: perkpathUser?.is_admin ?? false,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </PerkPathAuthContext.Provider>
  );
};

export const usePerkPathAuth = () => {
  const ctx = useContext(PerkPathAuthContext);
  if (!ctx) throw new Error('usePerkPathAuth must be used within PerkPathAuthProvider');
  return ctx;
};
