'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { Shield, LogIn } from 'lucide-react';

/**
 * Login - Ekran logowania przez Discord OAuth
 */
export default function Login() {
  const { signInWithDiscord } = useAuth();
  const { t } = useTranslation();
  const [isLogging, setIsLogging] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLogging(true);
      await signInWithDiscord();
    } catch (error) {
      console.error('Login error:', error);
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-md w-full">
        {/* Logo / Shield */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
            <Shield className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-blue-200 text-lg">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="space-y-6">
            {/* Info */}
            <div className="text-center">
              <p className="text-blue-100 text-sm">
                Zaloguj się przez Discord, aby uzyskać dostęp do systemu szkoleniowego
              </p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLogging}
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {isLogging ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('auth.loggingIn')}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{t('auth.loginWithDiscord')}</span>
                </>
              )}
            </button>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-blue-200 text-xs text-center mb-4 font-semibold">
                System oferuje:
              </p>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  <span>Materiały szkoleniowe z edytorem WYSIWYG</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  <span>System egzaminacyjny (7 typów egzaminów)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  <span>Panel administratora i statystyki</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  <span>Integracja z Discord (powiadomienia)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-300 text-xs">
            San Andreas Sheriff's Department © {new Date().getFullYear()}
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Powered by Next.js 15 & Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
