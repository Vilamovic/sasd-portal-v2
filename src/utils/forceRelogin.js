/**
 * Force Re-login Utility
 * Używane gdy schema bazy danych został zmieniony
 */

import { supabase } from '@/src/lib/supabase';

export async function forceRelogin() {
  try {
    console.log('🔄 Forcing re-login...');

    // 1. Wyloguj użytkownika
    await supabase.auth.signOut();

    // 2. Wyczyść wszystkie dane localStorage
    localStorage.clear();

    // 3. Wyczyść wszystkie dane sessionStorage
    sessionStorage.clear();

    // 4. Przeładuj stronę
    window.location.href = '/';

    console.log('✅ Re-login forced successfully');
  } catch (error) {
    console.error('❌ Force re-login error:', error);
    // Nawet jeśli wystąpił błąd, wyczyść storage i przeładuj
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}

// Export również jako default dla łatwiejszego importu
export default forceRelogin;
