'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { Shield, ArrowRight, ChevronLeft } from 'lucide-react';

/**
 * Divisions Page - Lista dywizji SASD
 * SWAT dostępny dla wszystkich, inne tylko dla użytkowników z dywizją
 */
export default function DivisionsPage() {
  const { user, loading, division, isAdmin, isDev } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!user) return null;

  const divisions = [
    {
      id: 'SWAT',
      name: 'Special Weapon And Tactics (SWAT)',
      description: 'Jednostka specjalna do zadań wysokiego ryzyka. Materiały dostępne dla wszystkich.',
      color: '#c41e1e',
      accessible: true, // SWAT zawsze dostępny
    },
    {
      id: 'SS',
      name: 'Supervisory Staff (SS)',
      description: 'Kadra nadzorcza odpowiedzialna za koordynację operacji i szkolenia.',
      color: '#ff8c00',
      accessible: division === 'SS' || isAdmin || isDev,
    },
    {
      id: 'DTU',
      name: 'Detective Task Unit (DTU)',
      description: 'Jednostka detektywów prowadząca śledztwa i operacje wywiadowcze.',
      color: '#60a5fa',
      accessible: division === 'DTU' || isAdmin || isDev,
    },
    {
      id: 'GU',
      name: 'Gang Unit (GU)',
      description: 'Oddział do walki z przestępczością zorganizowaną i gangami.',
      color: '#10b981',
      accessible: division === 'GU' || isAdmin || isDev,
    },
    {
      id: 'FTO',
      name: 'Training Staff (FTO)',
      description: 'Kadra szkoleniowa odpowiedzialna za przygotowanie nowych rekrutów.',
      color: '#c9a227',
      accessible: division === 'FTO' || isAdmin || isDev,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-win95 mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Powrót do Dashboard</span>
        </button>

        {/* Header */}
        <div className="panel-raised mb-6" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              DYWIZJE SASD
            </span>
          </div>
          <div className="p-4">
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
              Materiały specjalistyczne dla jednostek SASD
            </p>
          </div>
        </div>

        {/* Divisions List */}
        <div className="space-y-3">
          {divisions.map((div) => (
            <div
              key={div.id}
              className="panel-raised"
              style={{
                backgroundColor: 'var(--mdt-btn-face)',
                opacity: div.accessible ? 1 : 0.5,
                cursor: div.accessible ? 'pointer' : 'not-allowed',
              }}
              onClick={() => {
                if (div.accessible) {
                  router.push(`/divisions/${div.id}`);
                }
              }}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ backgroundColor: div.color }}
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold" style={{ color: div.accessible ? 'var(--mdt-content-text)' : 'var(--mdt-subtle-text)' }}>
                      {div.name}
                    </h3>
                    <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                      {div.description}
                    </p>
                  </div>
                </div>

                {div.accessible ? (
                  <ArrowRight className="w-5 h-5" style={{ color: 'var(--mdt-content-text)' }} />
                ) : (
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-subtle-text)' }}>Brak dostępu</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info message */}
        {!division && !isAdmin && !isDev && (
          <div className="mt-6 panel-inset p-4" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Materiały SWAT są dostępne dla wszystkich. Inne dywizje wymagają przypisania przez administratora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
