import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface WOBuddyUser {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

interface WOBuddyAuthContextType {
  user: User | null;
  session: Session | null;
  wobuddyUser: WOBuddyUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const WOBuddyAuthContext = createContext<WOBuddyAuthContextType | undefined>(undefined);

export const WOBuddyAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [wobuddyUser, setWobuddyUser] = useState<WOBuddyUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateWOBuddyUser = useCallback(async (authUser: User) => {
    // Try to fetch existing wobuddy_users record
    const { data, error } = await supabase
      .from('wobuddy_users')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (data) {
      setWobuddyUser(data as WOBuddyUser);
      // Update last_active_at
      await supabase
        .from('wobuddy_users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', authUser.id);
    } else if (error?.code === 'PGRST116') {
      // No record found, create one
      const { data: newUser, error: insertError } = await supabase
        .from('wobuddy_users')
        .insert({
          user_id: authUser.id,
          email: authUser.email,
          display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (newUser) {
        setWobuddyUser(newUser as WOBuddyUser);
      } else {
        console.error('Failed to create WO.Buddy user:', insertError);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchOrCreateWOBuddyUser(session.user), 0);
        } else {
          setWobuddyUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchOrCreateWOBuddyUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchOrCreateWOBuddyUser]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/labs/wo-buddy',
        data: { full_name: displayName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setWobuddyUser(null);
  };

  return (
    <WOBuddyAuthContext.Provider
      value={{
        user,
        session,
        wobuddyUser,
        isAdmin: wobuddyUser?.is_admin ?? false,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </WOBuddyAuthContext.Provider>
  );
};

export const useWOBuddyAuth = () => {
  const context = useContext(WOBuddyAuthContext);
  if (context === undefined) {
    throw new Error('useWOBuddyAuth must be used within a WOBuddyAuthProvider');
  }
  return context;
};
