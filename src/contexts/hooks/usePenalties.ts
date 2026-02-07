import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';

export interface Penalty {
  id: number;
  type: string;
  description?: string;
  created_at: string;
  expires_at?: string;
  remaining_seconds?: number;
}

/**
 * usePenalties - Hook dla aktywnych kar użytkownika
 *
 * Features:
 * - fetchActivePenalties (RPC call do get_active_penalties)
 * - Auto-polling co 30s
 * - Cleanup on unmount
 *
 * Returns:
 * - activePenalties: Penalty[]
 * - fetchActivePenalties: (userId: string) => Promise<void>
 * - loading: boolean
 */
export function usePenalties(userId: string | undefined) {
  const [activePenalties, setActivePenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const penaltiesIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Pobiera aktywne kary użytkownika
   */
  const fetchActivePenalties = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_active_penalties', {
        p_user_id: targetUserId,
      });

      if (error) {
        console.error('fetchActivePenalties error:', error);
        return;
      }

      if (data) {
        setActivePenalties(data);
      }
    } catch (error) {
      console.error('fetchActivePenalties error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Effect: Auto-polling co 30s
   */
  useEffect(() => {
    if (!userId) {
      setActivePenalties([]);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchActivePenalties(userId);

    // Wyczyść poprzedni interval
    if (penaltiesIntervalRef.current) {
      clearInterval(penaltiesIntervalRef.current);
    }

    // Startuj polling co 30s
    penaltiesIntervalRef.current = setInterval(() => {
      fetchActivePenalties(userId);
    }, 30000);

    // Cleanup
    return () => {
      if (penaltiesIntervalRef.current) {
        clearInterval(penaltiesIntervalRef.current);
      }
    };
  }, [userId, fetchActivePenalties]);

  return {
    activePenalties,
    fetchActivePenalties,
    loading,
  };
}
