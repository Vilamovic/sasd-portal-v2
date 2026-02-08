'use client';

import { TranslationProvider } from './TranslationContext';
import { AuthProvider } from './AuthContext';

/**
 * Providers - Główny wrapper dla wszystkich Context Providers
 * Łączy TranslationProvider i AuthProvider w jednym miejscu
 *
 * Kolejność ma znaczenie:
 * 1. TranslationProvider (może być używany w AuthContext)
 * 2. AuthProvider (wymaga tłumaczeń)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TranslationProvider>
  );
}
