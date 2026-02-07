'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';
import { getUserById, upsertUser } from '@/src/lib/db/users';
import { notifyUserAuth } from '@/src/lib/webhooks/auth';

const AuthContext = createContext();

// UUID developera (hardcoded - nietykalne)
const DEV_UUID = '2ab9b7ad-a32f-4219-b1fd-3c0e79628d75';

/**
 * AuthProvider - Provider dla systemu autentykacji
 * Zarządza sesją, rolami, force logout, MTA nick, etc.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [mtaNick, setMtaNick] = useState(null);
  const [showMtaNickModal, setShowMtaNickModal] = useState(false);

  // Kartoteka & Dywizje
  const [division, setDivision] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [plusCount, setPlusCount] = useState(0);
  const [minusCount, setMinusCount] = useState(0);
  const [activePenalties, setActivePenalties] = useState([]);
  const [isCommander, setIsCommander] = useState(false);

  // Refs dla uniknięcia stale closures
  const userRef = useRef(null);
  const roleRef = useRef(null);
  const loginTimestampRef = useRef(null);
  const hasNotifiedLogin = useRef(false);
  const roleCheckIntervalRef = useRef(null);
  const realtimeCleanupRef = useRef(null);
  const penaltiesIntervalRef = useRef(null);

  // getUserById i upsertUser są teraz importowane z supabaseHelpers.js

  /**
   * Pobiera aktywne kary użytkownika
   */
  const fetchActivePenalties = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_active_penalties', {
        p_user_id: userId,
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
    }
  }, []);

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

  /**
   * Sprawdza czy użytkownik ma ustawiony MTA nick
   */
  const checkMtaNick = useCallback(async (userId) => {
    const { data: userData } = await getUserById(userId);
    if (userData && !userData.mta_nick) {
      setShowMtaNickModal(true);
      return false;
    }
    if (userData && userData.mta_nick) {
      setMtaNick(userData.mta_nick);
      // Aktualizuj nowe pola
      setDivision(userData.division || null);
      setPermissions(userData.permissions || []);
      setPlusCount(userData.plus_count || 0);
      setMinusCount(userData.minus_count || 0);
      setIsCommander(userData.is_commander || false);
    }
    return true;
  }, []);

  /**
   * Zamknięcie modala MTA nick po zapisaniu
   */
  const handleMtaNickComplete = useCallback((nick) => {
    setMtaNick(nick);
    setShowMtaNickModal(false);
  }, []);

  /**
   * Określa rolę użytkownika (dev hardcoded, reszta z bazy)
   */
  const determineRole = useCallback((userId, dbUser) => {
    // Dev role hardcoded
    if (userId === DEV_UUID) {
      return 'dev';
    }
    // Role z bazy danych (domyślnie trainee)
    return dbUser?.role || 'trainee';
  }, []);

  /**
   * Wylogowanie - MOVED BEFORE startRolePolling to fix initialization order
   */
  const signOut = useCallback(async () => {
    try {
      // Wyczyść interval pollingu
      if (roleCheckIntervalRef.current) {
        clearInterval(roleCheckIntervalRef.current);
      }

      // Wyczyść interval kar
      if (penaltiesIntervalRef.current) {
        clearInterval(penaltiesIntervalRef.current);
      }

      // Wyczyść realtime subscription
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current();
      }

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
      setUser(null);
      setSession(null);
      setRole(null);
      setMtaNick(null);
      setDivision(null);
      setPermissions([]);
      setPlusCount(0);
      setMinusCount(0);
      setActivePenalties([]);
      setIsCommander(false);
      userRef.current = null;
      roleRef.current = null;
      loginTimestampRef.current = null;
      hasNotifiedLogin.current = false;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  /**
   * Realtime subscription + fallback polling (co 30s) dla roli i force logout
   * OPTYMALIZACJA: 720 zapytań/h → 120 zapytań/h (83% redukcja)
   */
  const startRolePolling = useCallback((userId) => {
    // Wyczyść poprzedni interval
    if (roleCheckIntervalRef.current) {
      clearInterval(roleCheckIntervalRef.current);
    }

    // Funkcja sprawdzająca user data
    const checkUserData = async () => {
      try {
        const { data: userData } = await getUserById(userId);

        if (userData) {
          const newRole = determineRole(userId, userData);

          // Sprawdź force logout
          if (userData.force_logout_after && loginTimestampRef.current) {
            const forceLogoutTime = new Date(userData.force_logout_after).getTime();
            const loginTime = loginTimestampRef.current;

            if (forceLogoutTime > loginTime) {
              // Wymuszono wylogowanie
              alert('Zostałeś wylogowany przez administratora.');
              await signOut();
              window.location.reload();
              return;
            }
          }

          // Sprawdź zmianę roli
          if (newRole !== roleRef.current) {
            roleRef.current = newRole;
            setRole(newRole);
            // Opcjonalnie: reload przy zmianie roli
            // window.location.reload();
          }

          // Aktualizuj pola Kartoteki
          setDivision(userData.division || null);
          setPermissions(userData.permissions || []);
          setPlusCount(userData.plus_count || 0);
          setMinusCount(userData.minus_count || 0);
          setIsCommander(userData.is_commander || false);
        }
      } catch (error) {
        console.error('Role check error:', error);
      }
    };

    // Supabase Realtime subscription (instant updates)
    const realtimeChannel = supabase
      .channel(`user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Realtime update detected:', payload);
          checkUserData();
        }
      )
      .subscribe();

    // Zapisz cleanup function do ref
    realtimeCleanupRef.current = () => {
      supabase.removeChannel(realtimeChannel);
    };

    // Fallback polling co 30s (zamiast 5s)
    roleCheckIntervalRef.current = setInterval(checkUserData, 30000);
  }, [determineRole, signOut]);

  /**
   * Inicjalizacja sesji i listenera auth state
   */
  useEffect(() => {
    // Pobierz aktualną sesję
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      userRef.current = session?.user || null;

      // Jeśli user jest zalogowany, ustaw jego rolę
      if (session?.user) {
        const userId = session.user.id;

        // Zapisz login timestamp z localStorage lub utwórz nowy
        const storedTimestamp = typeof window !== 'undefined'
          ? localStorage.getItem(`login_timestamp_${userId}`)
          : null;
        loginTimestampRef.current = storedTimestamp
          ? parseInt(storedTimestamp, 10)
          : Date.now();

        try {
          const { data: dbUser, error: fetchError } = await getUserById(userId);

          if (fetchError) {
            console.error('Error fetching user:', fetchError);
          }

          if (dbUser) {
            const userRole = determineRole(userId, dbUser);
            setRole(userRole);
            roleRef.current = userRole;
            setMtaNick(dbUser.mta_nick);

            // Ustaw pola Kartoteki
            setDivision(dbUser.division || null);
            setPermissions(dbUser.permissions || []);
            setPlusCount(dbUser.plus_count || 0);
            setMinusCount(dbUser.minus_count || 0);
            setIsCommander(dbUser.is_commander || false);

            // Rozpocznij polling roli
            startRolePolling(userId);

            // Pobierz aktywne kary
            fetchActivePenalties(userId);
          } else {
            // User nie istnieje w bazie - utwórz rekord
            const userData = {
              id: userId,
              username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Unknown',
              email: session.user.email || session.user.user_metadata?.email || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              last_seen: new Date().toISOString(),
            };

            const { data: newUser, error: upsertError } = await upsertUser(userData);

            if (upsertError) {
              console.error('Error creating user:', upsertError);
            }

            if (newUser) {
              const userRole = determineRole(userId, newUser);
              setRole(userRole);
              roleRef.current = userRole;
              startRolePolling(userId);
            } else {
              // Fallback: ustaw rolę 'trainee' jeśli nie udało się utworzyć
              console.warn('Failed to create user, using default role');
              setRole('trainee');
              roleRef.current = 'trainee';
            }
          }
        } catch (error) {
          console.error('Error loading user role:', error);
          // Fallback: ustaw rolę 'trainee'
          setRole('trainee');
          roleRef.current = 'trainee';
        }
      }

      setLoading(false);
    });

    // Listener zmian auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      userRef.current = session?.user || null;

      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;

        // Zapisz timestamp logowania
        const loginTimestamp = Date.now();
        loginTimestampRef.current = loginTimestamp;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`login_timestamp_${userId}`, loginTimestamp.toString());
        }

        // Upsert user do bazy (non-blocking)
        const userData = {
          id: userId,
          username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Unknown',
          email: session.user.email || session.user.user_metadata?.email || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          last_seen: new Date().toISOString(),
        };

        upsertUser(userData)
          .then(({ data: dbUser, error: upsertError }) => {
            if (upsertError) {
              console.error('Error upserting user:', upsertError);
              return;
            }

            if (dbUser) {
              // Określ rolę
              const userRole = determineRole(userId, dbUser);
              setRole(userRole);
              roleRef.current = userRole;

              // Sprawdź MTA nick
              checkMtaNick(userId).catch(console.error);

              // Rozpocznij polling roli
              startRolePolling(userId);

              // Pobierz aktywne kary
              fetchActivePenalties(userId);

              // Discord notification tylko dla rejestracji (timeDiff < 60s)
              const createdAt = new Date(dbUser.created_at).getTime();
              const now = Date.now();
              const timeDiff = (now - createdAt) / 1000; // sekundy

              if (timeDiff < 60 && !hasNotifiedLogin.current) {
                // Nowa rejestracja - wyślij webhook do Discord
                hasNotifiedLogin.current = true;
                notifyUserAuth(dbUser, timeDiff).catch(console.error);
              }
            }
          })
          .catch((error) => {
            console.error('Error in SIGNED_IN handler:', error);
          });
      }

      if (event === 'SIGNED_OUT') {
        setRole(null);
        setMtaNick(null);
        setDivision(null);
        setPermissions([]);
        setPlusCount(0);
        setMinusCount(0);
        setActivePenalties([]);
        setIsCommander(false);
        roleRef.current = null;
        loginTimestampRef.current = null;
        hasNotifiedLogin.current = false;

        // Wyczyść interval
        if (roleCheckIntervalRef.current) {
          clearInterval(roleCheckIntervalRef.current);
        }
        if (penaltiesIntervalRef.current) {
          clearInterval(penaltiesIntervalRef.current);
        }
      }

      // setLoading(false) wykonuje się zawsze (nie w blocking await)
      setLoading(false);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (roleCheckIntervalRef.current) {
        clearInterval(roleCheckIntervalRef.current);
      }
      if (penaltiesIntervalRef.current) {
        clearInterval(penaltiesIntervalRef.current);
      }
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current();
      }
    };
  }, [determineRole, checkMtaNick, startRolePolling, fetchActivePenalties]);

  /**
   * Polling aktywnych kar (co 30s)
   */
  useEffect(() => {
    if (!user?.id) return;

    // Wyczyść poprzedni interval
    if (penaltiesIntervalRef.current) {
      clearInterval(penaltiesIntervalRef.current);
    }

    // Startuj polling
    penaltiesIntervalRef.current = setInterval(() => {
      fetchActivePenalties(user.id);
    }, 30000); // 30 sekund

    // Cleanup
    return () => {
      if (penaltiesIntervalRef.current) {
        clearInterval(penaltiesIntervalRef.current);
      }
    };
  }, [user?.id, fetchActivePenalties]);

  /**
   * Logowanie przez Discord OAuth
   */
  const signInWithDiscord = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        // Supabase automatycznie użyje prawidłowego redirect URL
      });

      if (error) throw error;
    } catch (error) {
      console.error('Discord login error:', error);
      throw error;
    }
  }, []);

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
    refreshUserData, // Nowa funkcja do odświeżania danych navbara
    // Kartoteka & Dywizje
    division,
    permissions,
    plusCount,
    minusCount,
    activePenalties,
    isCommander,
    // Dodatkowo dla kompatybilności
    isAuthenticated: !!user,
    // Nowa hierarchia ról
    isDev: role === 'dev',
    isHCS: role === 'hcs' || role === 'dev',
    isCS: role === 'cs' || role === 'hcs' || role === 'dev',
    isDeputy: role === 'deputy' || role === 'cs' || role === 'hcs' || role === 'dev',
    isTrainee: !!role, // Każdy zalogowany użytkownik ma co najmniej dostęp trainee
    // Backward compatibility - admin obejmuje CS i wyżej
    isAdmin: role === 'cs' || role === 'hcs' || role === 'dev',
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
