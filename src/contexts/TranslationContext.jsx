'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '@/src/data/translations';

const TranslationContext = createContext();

/**
 * TranslationProvider - Provider dla systemu wielojęzyczności
 * @param {object} props - Props
 * @param {React.ReactNode} props.children - Komponenty potomne
 */
export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState('pl'); // Domyślnie polski

  /**
   * Funkcja tłumaczenia - pobiera tekst z obiektu translations
   * @param {string} key - Klucz tłumaczenia (np. 'auth.loginTitle', 'common.loading')
   * @param {object} variables - Zmienne do interpolacji (opcjonalne)
   * @returns {string} Przetłumaczony tekst
   *
   * Przykłady użycia:
   * t('auth.loginTitle') → 'Witaj w SASD Portal'
   * t('common.loading') → 'Ładowanie...'
   * t('exams.examTypes.trainee') → 'Egzamin Trainee'
   */
  const t = useCallback(
    (key, variables = {}) => {
      // Rozdziel klucz na segmenty (np. 'auth.loginTitle' → ['auth', 'loginTitle'])
      const keys = key.split('.');

      // Nawiguj przez obiekt translations
      let value = translations[language];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Jeśli klucz nie istnieje, zwróć sam klucz jako fallback
          console.warn(`Translation key "${key}" not found for language "${language}"`);
          return key;
        }
      }

      // Jeśli wartość to string, interpoluj zmienne
      if (typeof value === 'string') {
        return Object.keys(variables).reduce(
          (str, varKey) => str.replace(new RegExp(`{${varKey}}`, 'g'), variables[varKey]),
          value
        );
      }

      // Jeśli wartość to obiekt (błąd w użyciu), zwróć klucz
      console.warn(`Translation key "${key}" resolved to object, not string`);
      return key;
    },
    [language]
  );

  /**
   * Zmiana języka aplikacji
   * @param {string} newLanguage - Kod języka ('pl' | 'en')
   */
  const changeLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      // Opcjonalnie: zapisz w localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sasd-portal-language', newLanguage);
      }
    } else {
      console.warn(`Language "${newLanguage}" not available`);
    }
  }, []);

  // Załaduj język z localStorage przy pierwszym renderze (jeśli dostępny)
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('sasd-portal-language');
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const value = {
    language,
    t,
    changeLanguage,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook do używania tłumaczeń w komponentach
 * @returns {{ t: function, language: string, changeLanguage: function }}
 *
 * Przykład użycia:
 * ```jsx
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <h1>{t('auth.loginTitle')}</h1>;
 * }
 * ```
 */
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
}
