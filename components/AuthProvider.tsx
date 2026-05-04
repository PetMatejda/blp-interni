'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'employee';
  email: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await ensureProfile(session.user);
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          await ensureProfile(session.user);
          if (pathname === '/login') {
            router.push('/');
          }
        } else {
          setProfile(null);
          if (pathname !== '/login' && !pathname.includes('/auth/callback')) {
            router.push('/login');
          }
        }
      } catch (err) {
        console.error("Error in onAuthStateChange:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  const ensureProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (!data && !error) {
        // Create profile
        const newProfile = { 
          id: user.id, 
          full_name: user.user_metadata?.full_name || user.email,
          email: user.email,
          role: user.email === 'petmatejda@gmail.com' ? 'admin' : 'employee'
        };
        const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
        if (insertError) {
          console.error("Error inserting profile:", insertError);
        }
        setProfile(newProfile as Profile);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Unexpected error in ensureProfile:", err);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
