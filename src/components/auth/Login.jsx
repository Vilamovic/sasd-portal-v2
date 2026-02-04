'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Shield, BookOpen, GraduationCap, Users, Bell, Lock, Sparkles, ChevronRight } from 'lucide-react';

// Generate particles ONCE outside component to prevent re-render crashes
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * 10,
}));

/**
 * Login - Premium Police Portal Landing Page
 * SASD Training System with Discord OAuth
 */
export default function Login() {
  const { signInWithDiscord } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Throttled mouse tracking (~30fps) - no requestAnimationFrame to prevent lag
  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - (handleMouseMove.lastCall || 0) < 33) return; // ~30fps throttle
      handleMouseMove.lastCall = now;

      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    handleMouseMove.lastCall = 0;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      description: 'Edytor WYSIWYG z pełnym wsparciem formatowania',
      stat: '50+',
      statLabel: 'dokumentów'
    },
    {
      icon: GraduationCap,
      title: 'System egzaminacyjny',
      description: '7 typów egzaminów z automatyczną oceną',
      stat: '7',
      statLabel: 'typów testów'
    },
    {
      icon: Users,
      title: 'Panel administracyjny',
      description: 'Zarządzanie użytkownikami i statystyki',
      stat: '100%',
      statLabel: 'kontroli'
    },
    {
      icon: Bell,
      title: 'Integracja Discord',
      description: 'Powiadomienia w czasie rzeczywistym',
      stat: '24/7',
      statLabel: 'online'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020a06] text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 162, 39, 0.15) 0%, rgba(34, 105, 63, 0.1) 30%, transparent 60%)`,
          transition: 'background 0.5s ease-out',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(201, 162, 39, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#c9a227] rounded-full opacity-20"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `particle-float ${particle.duration}s linear infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#c9a227] rounded-full blur-lg opacity-50 animate-pulse-glow" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#020a06]" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight">
              SASD <span className="text-gold-gradient">Portal</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8fb5a0]">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Bezpieczne logowanie</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left column - Branding & Features */}
              <div className="space-y-8 text-center lg:text-left">
                {/* Badge */}
                <div className="relative inline-block mx-auto lg:mx-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full blur-3xl opacity-20 scale-150 animate-pulse-glow" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full blur-xl opacity-30 scale-125" />

                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c9a227] via-[#e6b830] to-[#c9a227] p-[2px] animate-gradient-shift">
                      <div className="w-full h-full rounded-full bg-[#020a06]" />
                    </div>

                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#051a0f] to-[#0a2818] flex items-center justify-center border border-[#c9a227]/20">
                      <Shield className="w-16 h-16 md:w-20 md:h-20 text-[#c9a227] drop-shadow-[0_0_20px_rgba(201,162,39,0.5)]" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                    <span className="block text-white">SASD</span>
                    <span className="block text-gold-gradient animate-text-glow">Portal</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-[#8fb5a0] font-light max-w-lg mx-auto lg:mx-0">
                    System szkoleniowy San Andreas Sheriff&apos;s Department
                  </p>
                </div>

                {/* Features Grid - Desktop */}
                <div className="hidden lg:grid grid-cols-2 gap-4 pt-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className="group relative p-5 rounded-2xl bg-[#051a0f]/50 border border-[#1a4d32]/50 hover:border-[#c9a227]/30 transition-all duration-500 hover:bg-[#051a0f]/80 cursor-default"
                      >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#c9a227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[#c9a227]/10 flex items-center justify-center group-hover:bg-[#c9a227]/20 transition-colors">
                              <Icon className="w-5 h-5 text-[#c9a227]" />
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[#c9a227]">{feature.stat}</div>
                              <div className="text-xs text-[#8fb5a0]">{feature.statLabel}</div>
                            </div>
                          </div>
                          <h3 className="text-white font-semibold mb-1 group-hover:text-[#c9a227] transition-colors">{feature.title}</h3>
                          <p className="text-sm text-[#8fb5a0] leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right column - Login Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#c9a227]/20 via-transparent to-[#22693f]/20 rounded-3xl blur-2xl opacity-50 animate-pulse-glow" />

                <div className="relative glass-strong rounded-3xl p-8 md:p-10 animate-border-glow">
                  {/* Full connected gold border frame */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none">
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#c9a227]/60" />
                    <div className="absolute inset-[1px] rounded-3xl border border-[#c9a227]/20" />
                    <div className="absolute -inset-[1px] rounded-3xl border border-[#c9a227]/10" />
                  </div>

                  <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Zaloguj się do systemu</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Witaj w systemie
                      </h2>
                      <p className="text-[#8fb5a0]">
                        Zaloguj się przez Discord, aby kontynuować
                      </p>
                    </div>

                    {/* Login Button */}
                    <button
                      onClick={handleLogin}
                      disabled={isLogging}
                      className="group relative w-full overflow-hidden bg-[#5865F2] hover:bg-[#4752c4] disabled:bg-[#133524] disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 disabled:shadow-none disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="relative flex items-center justify-center gap-3">
                        {isLogging ? (
                          <>
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-lg">Logowanie...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span className="text-lg">Zaloguj przez Discord</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Info */}
                    <p className="text-center text-sm text-[#8fb5a0]">
                      Klikając powyżej, zostaniesz przekierowany do Discord w celu autoryzacji
                    </p>

                    {/* Mobile Features */}
                    <div className="lg:hidden pt-6 border-t border-[#1a4d32]/50">
                      <p className="text-[#c9a227] text-xs text-center mb-4 font-bold uppercase tracking-widest">
                        Co oferujemy
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[#051a0f]/50">
                              <Icon className="w-5 h-5 text-[#c9a227] shrink-0" />
                              <span className="text-sm text-white">{feature.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#1a4d32]/50">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051a0f] border border-[#1a4d32]">
                        <Shield className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-sm text-[#8fb5a0]">Discord OAuth 2.0</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051a0f] border border-[#1a4d32]">
                        <Lock className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-sm text-[#8fb5a0]">SSL/TLS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-[#1a4d32]/30">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#8fb5a0] text-sm">
              San Andreas Sheriff&apos;s Department © {new Date().getFullYear()}
            </p>
            <p className="text-[#5a8a6d] text-xs">
              Powered by Next.js 15 & Supabase
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
