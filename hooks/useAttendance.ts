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
  hasOverlap?: boolean;
}

export function useAttendance() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const checkOverlaps = (records: AttendanceRecord[]) => {
    return records.map(record => {
      if (!record.check_out || record.type === 'Volno M' || record.type === 'Pauza') return { ...record, hasOverlap: false };
      
      const start = new Date(record.check_in).getTime();
      const end = new Date(record.check_out).getTime();
      
      const hasOverlap = records.some(other => {
        if (other.id === record.id || !other.check_out || other.type === 'Volno M' || other.type === 'Pauza') return false;
        const otherStart = new Date(other.check_in).getTime();
        const otherEnd = new Date(other.check_out).getTime();
        
        return start < otherEnd && otherStart < end;
      });
      
      return { ...record, hasOverlap };
    });
  };

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
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      const historyWithOverlaps = checkOverlaps(data || []);
      setHistory(historyWithOverlaps);
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
    if (!activeSession) {
      console.warn('No active session to end');
      return { error: 'No active session' };
    }

    try {
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
      await fetchHistory();
      return { data };
    } catch (err) {
      console.error('Exception in endSession:', err);
      return { error: err };
    }
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting record:', error);
      return { error };
    }

    if (activeSession?.id === id) {
      setActiveSession(null);
    }
    
    await fetchHistory();
    return { success: true };
  };

  const updateRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      return { error };
    }

    if (activeSession?.id === id) {
      setActiveSession(data);
    }

    await fetchHistory();
    return { data };
  };

  return {
    activeSession,
    loading,
    history,
    startSession,
    endSession,
    deleteRecord,
    updateRecord,
    refresh: () => {
      fetchActiveSession();
      fetchHistory();
    }
  };
}
