'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';

const AuthContext = createContext();

// UUID developera (hardcoded - nietykalne)
const DEV_UUID = 'c254fb57-72d4-450c-87b7-cd7ffad5b715';

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

  // Refs dla uniknięcia stale closures
  const userRef = useRef(null);
  const roleRef = useRef(null);
  const loginTimestampRef = useRef(null);
  const hasNotifiedLogin = useRef(false);
  const roleCheckIntervalRef = useRef(null);

  /**
   * Pomocnicza funkcja - pobiera dane użytkownika z bazy
   */
  const getUserFromDatabase = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user from database:', error);
      return null;
    }
  }, []);

  /**
   * Pomocnicza funkcja - upsert użytkownika do bazy
   */
  const upsertUserToDatabase = useCallback(async (userId, userMetadata) => {
    try {
      const userData = {
        id: userId,
        username: userMetadata.full_name || userMetadata.name || 'Unknown',
        email: userMetadata.email || null,
        avatar_url: userMetadata.avatar_url || null,
        last_seen: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user:', error);
      return null;
    }
  }, []);

  /**
   * Sprawdza czy użytkownik ma ustawiony MTA nick
   */
  const checkMtaNick = useCallback(async (userId) => {
    const userData = await getUserFromDatabase(userId);
    if (userData && !userData.mta_nick) {
      setShowMtaNickModal(true);
      return false;
    }
    if (userData && userData.mta_nick) {
      setMtaNick(userData.mta_nick);
    }
    return true;
  }, [getUserFromDatabase]);

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
    // Role z bazy danych
    return dbUser?.role || 'user';
  }, []);

  /**
   * Polling roli z bazy (co 5s) + sprawdzanie force logout
   */
  const startRolePolling = useCallback((userId) => {
    // Wyczyść poprzedni interval
    if (roleCheckIntervalRef.current) {
      clearInterval(roleCheckIntervalRef.current);
    }

    roleCheckIntervalRef.current = setInterval(async () => {
      try {
        const userData = await getUserFromDatabase(userId);

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
        }
      } catch (error) {
        console.error('Role polling error:', error);
      }
    }, 5000); // Co 5 sekund
  }, [getUserFromDatabase, determineRole]);

  /**
   * Wylogowanie
   */
  const signOut = useCallback(async () => {
    try {
      // Wyczyść interval pollingu
      if (roleCheckIntervalRef.current) {
        clearInterval(roleCheckIntervalRef.current);
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
      userRef.current = null;
      roleRef.current = null;
      loginTimestampRef.current = null;
      hasNotifiedLogin.current = false;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

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
          const dbUser = await getUserFromDatabase(userId);
          if (dbUser) {
            const userRole = determineRole(userId, dbUser);
            setRole(userRole);
            roleRef.current = userRole;
            setMtaNick(dbUser.mta_nick);

            // Rozpocznij polling roli
            startRolePolling(userId);
          } else {
            // User nie istnieje w bazie - utwórz rekord
            const newUser = await upsertUserToDatabase(userId, session.user.user_metadata);
            if (newUser) {
              const userRole = determineRole(userId, newUser);
              setRole(userRole);
              roleRef.current = userRole;
              startRolePolling(userId);
            }
          }
        } catch (error) {
          console.error('Error loading user role:', error);
          // Fallback: ustaw rolę 'user'
          setRole('user');
          roleRef.current = 'user';
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
        upsertUserToDatabase(userId, session.user.user_metadata)
          .then((dbUser) => {
            if (dbUser) {
              // Określ rolę
              const userRole = determineRole(userId, dbUser);
              setRole(userRole);
              roleRef.current = userRole;

              // Sprawdź MTA nick
              checkMtaNick(userId).catch(console.error);

              // Rozpocznij polling roli
              startRolePolling(userId);

              // Discord notification tylko dla rejestracji (timeDiff < 60s)
              const createdAt = new Date(dbUser.created_at).getTime();
              const now = Date.now();
              const timeDiff = (now - createdAt) / 1000; // sekundy

              if (timeDiff < 60 && !hasNotifiedLogin.current) {
                // Nowa rejestracja - wyślij webhook (TODO: implementacja discord.js)
                hasNotifiedLogin.current = true;
                console.log('New user registration detected:', dbUser);
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
        roleRef.current = null;
        loginTimestampRef.current = null;
        hasNotifiedLogin.current = false;

        // Wyczyść interval
        if (roleCheckIntervalRef.current) {
          clearInterval(roleCheckIntervalRef.current);
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
    };
  }, [upsertUserToDatabase, determineRole, checkMtaNick, startRolePolling]);

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
    // Dodatkowo dla kompatybilności
    isAuthenticated: !!user,
    isDev: role === 'dev',
    isAdmin: role === 'admin' || role === 'dev',
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
