import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/supabaseClient';
import { getUserById, upsertUser } from '@/src/lib/db/users';
import { notifyUserAuth } from '@/src/lib/webhooks/auth';
import { determineRole } from './useRoleCheck';

export interface AuthSessionCallbacks {
  onRoleChange: (role: string) => void;
  onUserDataLoaded: (userData: any) => void;
  onStartRolePolling: (userId: string) => void;
  onFetchPenalties: (userId: string) => void;
}

/**
 * useAuthSession - Hook dla Discord OAuth + session management
 *
 * Features:
 * - Discord OAuth (signInWithDiscord)
 * - Session init (getSession + onAuthStateChange)
 * - MTA nick check + modal
 * - User upsert on SIGNED_IN
 * - Login timestamp tracking (localStorage)
 * - Discord webhook na rejestrację (<60s)
 *
 * Returns:
 * - user, session, loading
 * - mtaNick, showMtaNickModal, handleMtaNickComplete
 * - signInWithDiscord, checkMtaNick
 * - userRef, loginTimestampRef (for useForceLogout)
 */
export function useAuthSession(callbacks: AuthSessionCallbacks) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mtaNick, setMtaNick] = useState<string | null>(null);
  const [showMtaNickModal, setShowMtaNickModal] = useState(false);

  // Refs dla uniknięcia stale closures
  const userRef = useRef<any>(null);
  const loginTimestampRef = useRef<number | null>(null);
  const hasNotifiedLogin = useRef(false);
  const isInitializing = useRef(false);

  const { onRoleChange, onUserDataLoaded, onStartRolePolling, onFetchPenalties } = callbacks;

  /**
   * Sprawdza czy użytkownik ma ustawiony MTA nick
   */
  const checkMtaNick = useCallback(async (userId: string) => {
    const { data: userData } = await getUserById(userId);
    if (userData && !userData.mta_nick) {
      setShowMtaNickModal(true);
      return false;
    }
    if (userData && userData.mta_nick) {
      setMtaNick(userData.mta_nick);
      // Notify orchestrator about user data
      onUserDataLoaded(userData);
    }
    return true;
  }, [onUserDataLoaded]);

  /**
   * Zamknięcie modala MTA nick po zapisaniu
   */
  const handleMtaNickComplete = useCallback((nick: string) => {
    setMtaNick(nick);
    setShowMtaNickModal(false);
  }, []);

  /**
   * Logowanie przez Discord OAuth
   */
  const signInWithDiscord = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Discord login error:', error);
      throw error;
    }
  }, []);

  /**
   * Inicjalizacja sesji i listener auth state
   */
  useEffect(() => {
    // Pobierz aktualną sesję
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      userRef.current = currentSession?.user || null;

      // Jeśli user jest zalogowany, ustaw jego rolę
      if (currentSession?.user) {
        const userId = currentSession.user.id;

        // Zapisz login timestamp z localStorage lub utwórz nowy
        const storedTimestamp =
          typeof window !== 'undefined'
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
            onRoleChange(userRole);
            setMtaNick(dbUser.mta_nick);

            // Notify orchestrator about user data
            onUserDataLoaded(dbUser);

            // Rozpocznij polling roli
            onStartRolePolling(userId);

            // Pobierz aktywne kary
            onFetchPenalties(userId);
          } else {
            // User nie istnieje w bazie - utwórz rekord
            const userData = {
              id: userId,
              username:
                currentSession.user.user_metadata?.full_name ||
                currentSession.user.user_metadata?.name ||
                'Unknown',
              email:
                currentSession.user.email || currentSession.user.user_metadata?.email || null,
              avatar_url: currentSession.user.user_metadata?.avatar_url || null,
              role: 'trainee', // Default role for new users
              last_seen: new Date().toISOString(),
            };

            const { data: newUser, error: upsertError } = await upsertUser(userData);

            if (upsertError) {
              console.error('Error creating user:', upsertError);
            }

            if (newUser) {
              const userRole = determineRole(userId, newUser);
              onRoleChange(userRole);
              onStartRolePolling(userId);
            } else {
              // Fallback: ustaw rolę 'trainee' jeśli nie udało się utworzyć
              console.warn('Failed to create user, using default role');
              onRoleChange('trainee');
            }
          }
        } catch (error) {
          console.error('Error loading user role:', error);
          // Fallback: ustaw rolę 'trainee'
          onRoleChange('trainee');
        }
      }

      setLoading(false);
    });

    // Listener zmian auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      userRef.current = newSession?.user || null;

      if (event === 'SIGNED_IN' && newSession?.user) {
        const userId = newSession.user.id;

        // Zapisz timestamp logowania
        const loginTimestamp = Date.now();
        loginTimestampRef.current = loginTimestamp;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`login_timestamp_${userId}`, loginTimestamp.toString());
        }

        // Upsert user do bazy (non-blocking)
        const userData = {
          id: userId,
          username:
            newSession.user.user_metadata?.full_name ||
            newSession.user.user_metadata?.name ||
            'Unknown',
          email: newSession.user.email || newSession.user.user_metadata?.email || null,
          avatar_url: newSession.user.user_metadata?.avatar_url || null,
          role: 'trainee', // Default role for new users
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
              onRoleChange(userRole);

              // Sprawdź MTA nick
              checkMtaNick(userId).catch(console.error);

              // Rozpocznij polling roli
              onStartRolePolling(userId);

              // Pobierz aktywne kary
              onFetchPenalties(userId);

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
        loginTimestampRef.current = null;
        hasNotifiedLogin.current = false;
        setMtaNick(null);
      }

      setLoading(false);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [onRoleChange, onUserDataLoaded, onStartRolePolling, onFetchPenalties, checkMtaNick]);

  return {
    user,
    session,
    loading,
    mtaNick,
    showMtaNickModal,
    handleMtaNickComplete,
    signInWithDiscord,
    checkMtaNick,
    // Refs for useForceLogout
    userRef,
    loginTimestampRef,
  };
}
