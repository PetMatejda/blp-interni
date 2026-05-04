'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  type: string;
  comment: string | null;
}

export function useAttendance() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .is('check_out', null)
      .eq('user_id', user.id)
      .order('check_in', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active session:', error);
    } else {
      setActiveSession(data);
    }
    setLoading(false);
  }, [user]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data || []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchActiveSession();
      fetchHistory();
    }
  }, [user, fetchActiveSession, fetchHistory]);

  const startSession = async (type: string, comment: string = '') => {
    if (!user) return { error: 'Not authenticated' };

    // End any existing active sessions first (safety)
    if (activeSession) {
      await endSession();
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert([
        { 
          user_id: user.id, 
          check_in: new Date().toISOString(), 
          type, 
          comment 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return { error };
    }

    setActiveSession(data);
    fetchHistory();
    return { data };
  };

  const endSession = async () => {
    if (!activeSession) return { error: 'No active session' };

    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', activeSession.id)
      .select()
      .single();

    if (error) {
      console.error('Error ending session:', error);
      return { error };
    }

    setActiveSession(null);
    fetchHistory();
    return { data };
  };

  return {
    activeSession,
    loading,
    history,
    startSession,
    endSession,
    refresh: () => {
      fetchActiveSession();
      fetchHistory();
    }
  };
}
