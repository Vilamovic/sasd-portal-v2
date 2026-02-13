'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/supabaseClient';
import { Shield, Calendar, Users } from 'lucide-react';

export default function Login() {
  const { signInWithDiscord } = useAuth();
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

  const [userCount, setUserCount] = useState<string>('...');

  useEffect(() => {
    supabase.from('users').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setUserCount(count ? String(count) : '0');
    });
  }, []);

  const features = [
    { icon: Calendar, label: 'OSTATNIA AKTUALIZACJA', stat: '13.02.2026' },
    { icon: Users, label: 'LICZNIK ZASTĘPCÓW', stat: userCount },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--mdt-sidebar)' }}>
      <div className="panel-raised flex flex-col w-full max-w-lg" style={{ backgroundColor: 'var(--mdt-sidebar)' }}>
        {/* MDT Header */}
        <header className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: 'var(--mdt-header)' }}>
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-amber-400" />
            <span className="font-[family-name:var(--font-vt323)] text-2xl tracking-wider" style={{ color: 'var(--mdt-header-text)' }}>
              SASD {'>>'}  LOGOWANIE
            </span>
          </div>
          <div className="flex gap-1">
            <div className="flex h-6 w-6 items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--mdt-blue-bar)', color: '#fff', border: '1px solid #555' }}>
              -
            </div>
            <div className="flex h-6 w-6 items-center justify-center text-xs font-bold" style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}>
              X
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6" style={{ backgroundColor: 'var(--mdt-content)' }}>
          {/* Blue title bar */}
          <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-lg tracking-widest uppercase text-white">
              PANEL LOGOWANIA - AUTORYZACJA
            </span>
          </div>

          {/* System info */}
          <div className="panel-inset p-5 mb-6" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="w-28 shrink-0 font-mono text-sm font-bold" style={{ color: 'var(--mdt-muted-text)' }}>SYSTEM:</span>
                <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>SASD Training Portal v1.0</span>
              </div>
              <div className="flex gap-2">
                <span className="w-28 shrink-0 font-mono text-sm font-bold" style={{ color: 'var(--mdt-muted-text)' }}>PROTOKÓŁ:</span>
                <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>OAuth 2.0 / SSL</span>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="mb-6">
            <div className="px-3 py-1.5 mb-3" style={{ backgroundColor: 'var(--mdt-header)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>INFORMACJE:</span>
            </div>
            <div className="space-y-1">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 font-mono text-sm"
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)', color: 'var(--mdt-content-text)' }}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--mdt-muted-text)' }} />
                    <span className="flex-1">{feature.label}</span>
                    <span className="font-bold" style={{ color: 'var(--mdt-blue-bar)' }}>{feature.stat}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={isLogging}
            className="btn-win95 w-full flex items-center justify-center gap-3 py-3"
            style={isLogging ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {isLogging ? (
              <span className="font-mono text-sm">LOGOWANIE...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="font-mono text-sm">ZALOGUJ PRZEZ DISCORD</span>
              </>
            )}
          </button>

          <p className="font-mono text-xs text-center mt-4" style={{ color: 'var(--mdt-subtle-text)' }}>
            Klikając powyżej, zostaniesz przekierowany do Discord
          </p>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: 'var(--mdt-header)' }}>
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-xs" style={{ color: '#aaa' }}>SERWER AUTORYZACJI: ONLINE</span>
          <span className="ml-auto font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            SASD PORTAL v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
