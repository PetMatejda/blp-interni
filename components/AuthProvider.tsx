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
  signInWithPassword: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
        // We don't await ensureProfile to avoid blocking the initial UI load
        if (session?.user) ensureProfile(session.user);
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Safety timeout: If auth decision takes too long, unblock the UI anyway
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          // We don't await ensureProfile to avoid blocking the UI
          ensureProfile(session.user);
          if (pathname === '/login') {
            router.push('/');
          }
        } else {
          setProfile(null);
          if (pathname !== '/login' && !pathname.includes('/auth/callback') && pathname !== '/reset-password') {
            router.push('/login');
          }
        }
      } catch (err) {
        console.error("Error in onAuthStateChange:", err);
      } finally {
        // Ensure loading is false once we have an auth state decision
        setLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
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

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, signInWithGoogle, signInWithPassword, resetPassword }}>
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
