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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-4">
      <div className="max-w-md w-full">
        {/* Logo / Shield */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Pulsing glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full animate-pulse opacity-30 blur-2xl"></div>

            {/* Badge container */}
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full mb-6 shadow-2xl">
              <Shield className="w-14 h-14 text-police-dark-900" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-badge-gold-600 text-lg font-medium">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="relative">
          {/* Card glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-badge-gold-600/20 to-badge-gold-400/20 rounded-2xl blur-xl"></div>

          <div className="relative bg-police-dark-700 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="space-y-6">
              {/* Info */}
              <div className="text-center">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Zaloguj się przez Discord, aby uzyskać dostęp do systemu szkoleniowego SASD
                </p>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLogging}
                className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                {isLogging ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
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
                <p className="text-badge-gold-600 text-xs text-center mb-4 font-bold uppercase tracking-wide">
                  System oferuje:
                </p>
                <ul className="space-y-3 text-gray-300 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-badge-gold-600 rounded-full"></div>
                    <span>Materiały szkoleniowe z edytorem WYSIWYG</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-badge-gold-600 rounded-full"></div>
                    <span>System egzaminacyjny (7 typów egzaminów)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-badge-gold-600 rounded-full"></div>
                    <span>Panel administratora i statystyki</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-badge-gold-600 rounded-full"></div>
                    <span>Integracja z Discord (powiadomienia)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">
            San Andreas Sheriff's Department © {new Date().getFullYear()}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Powered by Next.js 15 & Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
