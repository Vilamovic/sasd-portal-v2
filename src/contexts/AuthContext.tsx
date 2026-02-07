'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';
import { getUserById } from '@/src/lib/db/users';

// Custom hooks
import { useRoleCheck, getRoleHelpers } from './hooks/useRoleCheck';
import { usePenalties } from './hooks/usePenalties';
import { useAuthSession } from './hooks/useAuthSession';
import { useForceLogout } from './hooks/useForceLogout';

const AuthContext = createContext<any>(null);

/**
 * AuthProvider - Orchestrator dla systemu autentykacji
 *
 * Odpowiedzialności:
 * - State management (role, kartoteka: division, permissions, ±, is_commander)
 * - Łączenie 4 custom hooków (useAuthSession, useForceLogout, usePenalties, useRoleCheck)
 * - Business logic (signOut, forceRelogin, refreshUserData)
 * - Context value object (wszystkie dane + role helpers)
 *
 * Custom hooks:
 * - useAuthSession: Discord OAuth + session + MTA nick
 * - useForceLogout: realtime + polling + force logout detection
 * - usePenalties: fetchActivePenalties + polling 30s
 * - useRoleCheck: role hierarchy helpers (isDev, isHCS, isCS...)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ==================== STATE ====================
  const [role, setRole] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [plusCount, setPlusCount] = useState(0);
  const [minusCount, setMinusCount] = useState(0);
  const [isCommander, setIsCommander] = useState(false);

  // ==================== CUSTOM HOOKS ====================

  /**
   * useAuthSession - Discord OAuth + session init + MTA nick
   */
  const {
    user,
    session,
    loading,
    mtaNick,
    showMtaNickModal,
    handleMtaNickComplete,
    signInWithDiscord,
    checkMtaNick,
    userRef,
    loginTimestampRef,
  } = useAuthSession({
    onRoleChange: (newRole) => setRole(newRole),
    onUserDataLoaded: (userData) => {
      setDivision(userData.division || null);
      setPermissions(userData.permissions || []);
      setPlusCount(userData.plus_count || 0);
      setMinusCount(userData.minus_count || 0);
      setIsCommander(userData.is_commander || false);
    },
    onStartRolePolling: (userId) => {
      // Will be handled by useForceLogout
    },
    onFetchPenalties: (userId) => {
      // Will be handled by usePenalties
    },
  });

  /**
   * usePenalties - aktywne kary + polling 30s
   */
  const { activePenalties, fetchActivePenalties } = usePenalties(user?.id);

  /**
   * Sign out - wylogowanie + cleanup
   */
  const signOut = useCallback(async () => {
    try {
      // Wyczyść localStorage
      if (typeof window !== 'undefined') {
        const userId = userRef.current?.id;
        if (userId) {
          localStorage.removeItem(`login_timestamp_${userId}`);
        }
        localStorage.clear();
      }

      // Wyloguj z Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Wyczyść state
      setRole(null);
      setDivision(null);
      setPermissions([]);
      setPlusCount(0);
      setMinusCount(0);
      setIsCommander(false);
      userRef.current = null;
      loginTimestampRef.current = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [userRef, loginTimestampRef]);

  /**
   * useForceLogout - realtime + polling + force logout
   */
  useForceLogout(user?.id, loginTimestampRef, {
    onRoleChange: (newRole) => setRole(newRole),
    onUserDataUpdate: (userData) => {
      setDivision(userData.division || null);
      setPermissions(userData.permissions || []);
      setPlusCount(userData.plus_count || 0);
      setMinusCount(userData.minus_count || 0);
      setIsCommander(userData.is_commander || false);
    },
    onForceLogout: signOut,
  });

  /**
   * Force re-login (używane po zmianie schematu DB)
   */
  const forceRelogin = useCallback(async () => {
    try {
      console.log('🔄 Forcing re-login...');

      // Wyloguj i wyczyść wszystko
      await signOut();

      // Wyczyść sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();

        // Przeładuj stronę
        window.location.href = '/';
      }

      console.log('✅ Re-login forced successfully');
    } catch (error) {
      console.error('❌ Force re-login error:', error);
      // Nawet jeśli wystąpił błąd, wyczyść i przeładuj
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    }
  }, [signOut]);

  /**
   * Odświeża dane użytkownika (plus_count, minus_count, aktywne kary)
   * Wywołaj po operacjach CRUD w user profile
   */
  const refreshUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: userData } = await getUserById(user.id);

      if (userData) {
        setPlusCount(userData.plus_count || 0);
        setMinusCount(userData.minus_count || 0);
        setDivision(userData.division || null);
        setPermissions(userData.permissions || []);
        setIsCommander(userData.is_commander || false);
      }

      // Odśwież aktywne kary
      await fetchActivePenalties(user.id);
    } catch (error) {
      console.error('refreshUserData error:', error);
    }
  }, [user?.id, fetchActivePenalties]);

  // ==================== ROLE HELPERS ====================
  const roleHelpers = getRoleHelpers(role);

  // ==================== CONTEXT VALUE ====================
  const value = {
    user,
    session,
    loading,
    role,
    mtaNick,
    showMtaNickModal,
    handleMtaNickComplete,
    signInWithDiscord,
    signOut,
    forceRelogin,
    refreshUserData,
    // Kartoteka & Dywizje
    division,
    permissions,
    plusCount,
    minusCount,
    activePenalties,
    isCommander,
    // Role helpers (spread)
    ...roleHelpers,
    // Dodatkowo dla kompatybilności
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook do używania auth context w komponentach
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
