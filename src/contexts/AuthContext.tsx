'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
  const [userData, setUserData] = useState({
    division: null as string | null,
    permissions: [] as string[],
    plusCount: 0,
    minusCount: 0,
    isCommander: false,
    isSwatCommander: false,
    isSwatOperator: false,
    badge: null as string | null,
  });

  // ==================== CALLBACKS (stable references) ====================

  const handleRoleChange = useCallback((newRole: string) => {
    setRole(newRole);
  }, []);

  const updateUserData = useCallback((data: any) => {
    setUserData({
      division: data.division || null,
      permissions: data.permissions || [],
      plusCount: data.plus_count || 0,
      minusCount: data.minus_count || 0,
      isCommander: data.is_commander || false,
      isSwatCommander: data.is_swat_commander || false,
      isSwatOperator: data.is_swat_operator || false,
      badge: data.badge || null,
    });
  }, []);

  const handleUserDataLoaded = updateUserData;

  const handleStartRolePolling = useCallback((userId: string) => {
    // Will be handled by useForceLogout
  }, []);

  const handleFetchPenalties = useCallback((userId: string) => {
    // Will be handled by usePenalties
  }, []);

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
    onRoleChange: handleRoleChange,
    onUserDataLoaded: handleUserDataLoaded,
    onStartRolePolling: handleStartRolePolling,
    onFetchPenalties: handleFetchPenalties,
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
      // Wyczyść localStorage (selective - zachowaj preferencje użytkownika)
      if (typeof window !== 'undefined') {
        const userId = userRef.current?.id;
        if (userId) {
          localStorage.removeItem(`login_timestamp_${userId}`);
          localStorage.removeItem(`exam_state_${userId}`);
        }
        localStorage.removeItem('materials_cache');
      }

      // Wyloguj z Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Wyczyść state
      setRole(null);
      setUserData({
        division: null, permissions: [], plusCount: 0, minusCount: 0,
        isCommander: false, isSwatCommander: false, isSwatOperator: false, badge: null,
      });
      userRef.current = null;
      loginTimestampRef.current = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [userRef, loginTimestampRef]);

  /**
   * useForceLogout - realtime + polling + force logout
   */
  useForceLogout(user?.id, loginTimestampRef, role, {
    onRoleChange: (newRole) => setRole(newRole),
    onUserDataUpdate: updateUserData,
    onForceLogout: signOut,
  });

  /**
   * Force re-login (używane po zmianie schematu DB)
   */
  const forceRelogin = useCallback(async () => {
    try {
      // Wyloguj i wyczyść wszystko
      await signOut();

      // Wyczyść sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();

        // Przeładuj stronę
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Force re-login error:', error);
      // Nawet jeśli wystąpił błąd, wyczyść session-related keys i przeładuj
      if (typeof window !== 'undefined') {
        localStorage.removeItem('materials_cache');
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
      const { data: freshData } = await getUserById(user.id);

      if (freshData) {
        updateUserData(freshData);
      }

      // Odśwież aktywne kary
      await fetchActivePenalties(user.id);
    } catch (error) {
      console.error('refreshUserData error:', error);
    }
  }, [user?.id, fetchActivePenalties, updateUserData]);

  // ==================== ROLE HELPERS ====================
  const roleHelpers = getRoleHelpers(role);

  // ==================== CONTEXT VALUE ====================
  const value = useMemo(() => ({
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
    division: userData.division,
    permissions: userData.permissions,
    plusCount: userData.plusCount,
    minusCount: userData.minusCount,
    activePenalties,
    isCommander: userData.isCommander,
    isSwatCommander: userData.isSwatCommander,
    isSwatOperator: userData.isSwatOperator,
    badge: userData.badge,
    // Role helpers (spread)
    ...roleHelpers,
    // Dodatkowo dla kompatybilności
    isAuthenticated: !!user,
  }), [user, session, loading, role, mtaNick, showMtaNickModal,
    handleMtaNickComplete, signInWithDiscord, signOut, forceRelogin,
    refreshUserData, userData, activePenalties, roleHelpers]);

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
