'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { ChevronLeft, BookOpen, Monitor, FileText, ArrowRight } from 'lucide-react';

/**
 * Division Categories Page - shows category tiles for a division
 * /divisions/[divisionId]
 * Each division: "Materiały" tile
 * DTU only: + "MDT" tile
 */

const divisionConfig: Record<string, { name: string; fullName: string; color: string }> = {
  SWAT: { name: 'SWAT', fullName: 'Special Weapon And Tactics', color: '#c41e1e' },
  SS: { name: 'SS', fullName: 'Supervisory Staff', color: '#ff8c00' },
  DTU: { name: 'DTU', fullName: 'Detective Task Unit', color: '#60a5fa' },
  GU: { name: 'GU', fullName: 'Gang Unit', color: '#10b981' },
  FTO: { name: 'FTO', fullName: 'Training Staff', color: '#c9a227' },
};

export default function DivisionCategoriesPage() {
  const { user, loading, division, isAdmin, isDev } = useAuth();
  const router = useRouter();
  const params = useParams();
  const divisionId = params.divisionId as string;

  const config = divisionConfig[divisionId];
  const hasAccess = divisionId === 'SWAT' || division === divisionId || isAdmin || isDev;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !hasAccess) {
      router.push('/divisions');
    }
  }, [hasAccess, loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!hasAccess || !config) return null;

  // Categories available for this division
  const categories = [
    {
      id: 'materials',
      name: 'Materiały',
      description: 'Materiały szkoleniowe i dokumentacja dywizji.',
      icon: BookOpen,
      href: `/divisions/${divisionId}/materials`,
    },
    {
      id: 'raport',
      name: 'Raport',
      description: 'Składaj raporty z działań operacyjnych dywizji.',
      icon: FileText,
      href: `/divisions/${divisionId}/raport`,
    },
    ...(divisionId === 'DTU'
      ? [
          {
            id: 'mdt',
            name: 'MDT - Mobile Data Terminal',
            description: 'System kartoteki kryminalnej i baza danych.',
            icon: Monitor,
            href: '/divisions/dtu/mdt',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/divisions')}
          className="btn-win95 mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Powrót do Dywizji</span>
        </button>

        {/* Header */}
        <div className="panel-raised mb-6" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2" style={{ backgroundColor: config.color }}>
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              {config.fullName} [{config.name}]
            </span>
          </div>
          <div className="p-4">
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
              Wybierz kategorię poniżej
            </p>
          </div>
        </div>

        {/* Category Tiles */}
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="panel-raised cursor-pointer"
              style={{ backgroundColor: 'var(--mdt-btn-face)' }}
              onClick={() => router.push(cat.href)}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>
                      {cat.name}
                    </h3>
                    <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                      {cat.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" style={{ color: 'var(--mdt-content-text)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
