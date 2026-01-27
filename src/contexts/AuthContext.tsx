import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
  return data;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    let isMounted = true;

    // 1) Initial session load (only once)
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!isMounted) return;

      if (error) console.error('getSession error:', error);

      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        const p = await getProfile(u.id);
        if (isMounted) setProfile(p);
      } else {
        setProfile(null);
      }

      if (isMounted) setLoading(false);
    });

    // 2) Listen for auth changes (keep subscription alive)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      const u = session?.user ?? null;
      setUser(u);

      // If signed out, clear profile immediately
      if (!u) {
        setProfile(null);
        return;
      }

      // IMPORTANT: avoid fetching profile on TOKEN_REFRESHED
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        getProfile(u.id).then(p => {
          if (isMounted) setProfile(p);
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      // optional: validate username
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, digits, and underscore');
      }

      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('SignIn Error:', error);
      return { error: error as Error };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, digits, and underscore');
      }

      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('SignUp Error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithUsername,
        signUpWithUsername,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
