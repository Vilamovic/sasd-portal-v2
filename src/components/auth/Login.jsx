'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { Shield, LogIn, BookOpen, GraduationCap, Users, Bell } from 'lucide-react';

/**
 * Login - Ekran logowania przez Discord OAuth
 * Redesigned with premium police dark theme
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

  const features = [
    {
      icon: BookOpen,
      title: 'Materiały szkoleniowe',
      description: 'Edytor WYSIWYG z pełnym wsparciem formatowania'
    },
    {
      icon: GraduationCap,
      title: 'System egzaminacyjny',
      description: '7 typów egzaminów z automatyczną oceną'
    },
    {
      icon: Users,
      title: 'Panel administracyjny',
      description: 'Zarządzanie użytkownikami i statystyki'
    },
    {
      icon: Bell,
      title: 'Integracja Discord',
      description: 'Powiadomienia w czasie rzeczywistym'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-4 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-badge-gold-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-police-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="text-center md:text-left space-y-6">
            {/* Logo with enhanced effects */}
            <div className="relative inline-block">
              {/* Multiple glow layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full animate-pulse opacity-20 blur-3xl scale-150"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full opacity-30 blur-2xl"></div>

              {/* Badge container with inner glow */}
              <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full shadow-2xl group hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-2 bg-police-dark-900 rounded-full"></div>
                <Shield className="relative w-16 h-16 text-badge-gold-400" strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                SASD
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-badge-gold-600 to-badge-gold-400">
                  Portal
                </span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 rounded-full mb-4"></div>
              <p className="text-gray-400 text-lg">
                System szkoleniowy San Andreas Sheriff's Department
              </p>
            </div>

            {/* Features grid - desktop only */}
            <div className="hidden md:grid grid-cols-2 gap-4 mt-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-badge-gold-400/50 transition-all duration-300 group"
                  >
                    <Icon className="w-6 h-6 text-badge-gold-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white text-sm font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-xs">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side - Login Card */}
          <div className="relative">
            {/* Enhanced card glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-badge-gold-600/20 to-badge-gold-400/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-police-dark-700/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center pb-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Witaj w systemie
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Zaloguj się, aby kontynuować
                  </p>
                </div>

                {/* Login Button with enhanced styling */}
                <button
                  onClick={handleLogin}
                  disabled={isLogging}
                  className="group relative w-full overflow-hidden bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:hover:scale-100"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <div className="relative flex items-center justify-center gap-3">
                    {isLogging ? (
                      <>
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Logowanie...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Zaloguj przez Discord</span>
                      </>
                    )}
                  </div>
                </button>

                {/* Info text */}
                <div className="text-center">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Klikając powyżej, zostaniesz przekierowany do Discord w celu autoryzacji
                  </p>
                </div>

                {/* Features list - mobile */}
                <div className="md:hidden pt-6 border-t border-white/10">
                  <p className="text-badge-gold-400 text-xs text-center mb-4 font-bold uppercase tracking-wide">
                    Co oferujemy:
                  </p>
                  <div className="space-y-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Icon className="w-4 h-4 text-badge-gold-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{feature.title}</p>
                            <p className="text-gray-400 text-xs">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10">
                  <Shield className="w-4 h-4 text-badge-gold-400" />
                  <p className="text-gray-400 text-xs">
                    Bezpieczne logowanie przez Discord OAuth 2.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-1">
            San Andreas Sheriff's Department © {new Date().getFullYear()}
          </p>
          <p className="text-gray-500 text-xs">
            Powered by Next.js 15 & Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
