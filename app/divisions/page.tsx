'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { Shield, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-[#c9a227]">Ładowanie...</div>
      </div>
    );
  }

  if (!user) return null;

  const divisions = [
    {
      id: 'SWAT',
      name: 'Special Weapon And Tactics (SWAT)',
      description: 'Jednostka specjalna do zadań wysokiego ryzyka. Materiały dostępne dla wszystkich.',
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-400',
      accessible: true, // SWAT zawsze dostępny
    },
    {
      id: 'SS',
      name: 'Supervisory Staff (SS)',
      description: 'Kadra nadzorcza odpowiedzialna za koordynację operacji i szkolenia.',
      color: 'from-[#ff8c00] to-[#ff7700]',
      textColor: 'text-[#ff8c00]',
      accessible: division === 'SS' || isAdmin || isDev,
    },
    {
      id: 'DTU',
      name: 'Detective Task Unit (DTU)',
      description: 'Jednostka detektywów prowadząca śledztwa i operacje wywiadowcze.',
      color: 'from-[#1e3a8a] to-[#1e40af]',
      textColor: 'text-[#1e3a8a]',
      accessible: division === 'DTU' || isAdmin || isDev,
    },
    {
      id: 'GU',
      name: 'Gang Unit (GU)',
      description: 'Oddział do walki z przestępczością zorganizowaną i gangami.',
      color: 'from-[#10b981] to-[#059669]',
      textColor: 'text-[#10b981]',
      accessible: division === 'GU' || isAdmin || isDev,
    },
    {
      id: 'FTO',
      name: 'Training Staff (FTO)',
      description: 'Kadra szkoleniowa odpowiedzialna za przygotowanie nowych rekrutów.',
      color: 'from-[#c9a227] to-[#e6b830]',
      textColor: 'text-[#c9a227]',
      accessible: division === 'FTO' || isAdmin || isDev,
    },
  ];

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-gold-gradient">Dywizje</span> SASD
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4 mx-auto" />
          <p className="text-[#8fb5a0] text-lg">
            Materiały specjalistyczne dla jednostek SASD
          </p>
        </div>

        {/* Divisions List */}
        <div className="space-y-4">
          {divisions.map((div) => (
            <div
              key={div.id}
              className={`group relative glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 transition-all duration-300 ${
                div.accessible
                  ? 'hover:scale-[1.02] hover:border-[#c9a227]/50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (div.accessible) {
                  router.push(`/divisions/${div.id}`);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${div.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${div.accessible ? 'text-white' : 'text-gray-500'}`}>
                      {div.name}
                    </h3>
                    <p className={`text-sm ${div.accessible ? 'text-[#8fb5a0]' : 'text-gray-600'}`}>
                      {div.description}
                    </p>
                  </div>
                </div>

                {div.accessible ? (
                  <ArrowRight className="w-6 h-6 text-[#c9a227] group-hover:translate-x-2 transition-transform" />
                ) : (
                  <div className="text-gray-600 text-sm font-medium">Brak dostępu</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info message */}
        {!division && !isAdmin && !isDev && (
          <div className="mt-8 p-4 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 text-center">
            <p className="text-[#c9a227] text-sm">
              Materiały SWAT są dostępne dla wszystkich. Inne dywizje wymagają przypisania przez administratora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
