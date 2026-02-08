import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';
import { getUserById } from '@/src/lib/db/users';
import { determineRole } from './useRoleCheck';

export interface ForceLogoutCallbacks {
  onRoleChange: (role: string) => void;
  onUserDataUpdate: (userData: any) => void;
  onForceLogout: () => Promise<void>;
}

/**
 * useForceLogout - Hook dla realtime + fallback polling + force logout check
 *
 * Features:
 * - Supabase Realtime subscription (instant updates)
 * - Fallback polling co 30s
 * - Force logout detection (force_logout_after > loginTimestamp)
 * - Role change detection
 * - Kartoteka data update (division, permissions, ±, is_commander)
 *
 * Returns:
 * - startRolePolling: (userId: string) => void
 * - stopRolePolling: () => void
 */
export function useForceLogout(
  userId: string | undefined,
  loginTimestampRef: React.MutableRefObject<number | null>,
  currentRole: string | null,
  callbacks: ForceLogoutCallbacks
) {
  const roleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeCleanupRef = useRef<(() => void) | null>(null);
  const roleRef = useRef<string | null>(currentRole);

  const { onRoleChange, onUserDataUpdate, onForceLogout } = callbacks;

  // Synchronize roleRef with external role state
  useEffect(() => {
    roleRef.current = currentRole;
  }, [currentRole]);

  /**
   * Funkcja sprawdzająca user data (role + force logout + kartoteka)
   */
  const checkUserData = useCallback(
    async (targetUserId: string) => {
      try {
        const { data: userData } = await getUserById(targetUserId);

        if (userData) {
          const newRole = determineRole(targetUserId, userData);

          // Sprawdź force logout
          if (userData.force_logout_after && loginTimestampRef.current) {
            const forceLogoutTime = new Date(userData.force_logout_after).getTime();
            const loginTime = loginTimestampRef.current;

            if (forceLogoutTime > loginTime) {
              // Wymuszono wylogowanie
              if (typeof window !== 'undefined') {
                alert('Zostałeś wylogowany przez administratora.');
                await onForceLogout();
                window.location.reload();
              }
              return;
            }
          }

          // Sprawdź zmianę roli
          if (newRole !== roleRef.current) {
            roleRef.current = newRole;
            onRoleChange(newRole);
            // Opcjonalnie: reload przy zmianie roli
            // window.location.reload();
          }

          // Aktualizuj pola Kartoteki
          onUserDataUpdate(userData);
        }
      } catch (error) {
        console.error('Role check error:', error);
      }
    },
    [loginTimestampRef, onRoleChange, onUserDataUpdate, onForceLogout]
  );

  /**
   * Startuj realtime + polling dla danego userId
   */
  const startRolePolling = useCallback(
    (targetUserId: string) => {
      // Wyczyść poprzedni interval
      if (roleCheckIntervalRef.current) {
        clearInterval(roleCheckIntervalRef.current);
      }

      // Wyczyść poprzedni realtime
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current();
      }

      // Supabase Realtime subscription (instant updates)
      const realtimeChannel = supabase
        .channel(`user-${targetUserId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${targetUserId}`,
          },
          () => {
            checkUserData(targetUserId);
          }
        )
        .subscribe();

      // Zapisz cleanup function do ref
      realtimeCleanupRef.current = () => {
        supabase.removeChannel(realtimeChannel);
      };

      // Fallback polling co 30s (zamiast 5s)
      roleCheckIntervalRef.current = setInterval(() => {
        checkUserData(targetUserId);
      }, 30000);
    },
    [checkUserData]
  );

  /**
   * Stop polling + realtime
   */
  const stopRolePolling = useCallback(() => {
    if (roleCheckIntervalRef.current) {
      clearInterval(roleCheckIntervalRef.current);
      roleCheckIntervalRef.current = null;
    }
    if (realtimeCleanupRef.current) {
      realtimeCleanupRef.current();
      realtimeCleanupRef.current = null;
    }
  }, []);

  /**
   * Effect: Auto-start polling when userId changes
   */
  useEffect(() => {
    if (userId) {
      startRolePolling(userId);
    }

    return () => {
      stopRolePolling();
    };
  }, [userId, startRolePolling, stopRolePolling]);

  return {
    startRolePolling,
    stopRolePolling,
  };
}
