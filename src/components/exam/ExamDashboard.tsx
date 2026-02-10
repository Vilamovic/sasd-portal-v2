'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { Target, BarChart3, Settings, Archive, ArrowRight, CheckCircle, Clock, ChevronLeft, Sparkles, Calendar } from 'lucide-react';

/**
 * ExamDashboard - MDT Terminal themed exam navigation
 * 4 tiles for admin, 1 centered card for users
 * Uses Next.js routing for stats/archive (fixes Invariants violations)
 */
export default function ExamDashboard({ onNavigate, onBack }: { onNavigate?: (view: string) => void; onBack?: () => void }) {
  const router = useRouter();
  const { role, isAdmin } = useAuth();
  const { t } = useTranslation();

  // Navigation handler - uses Next.js router for stats/archive
  const handleTileClick = (tileId: string) => {
    if (tileId === 'statistics') {
      router.push('/exams/stats');
    } else if (tileId === 'archive') {
      router.push('/exams/archive');
    } else if (tileId === 'practical') {
      router.push('/exams/practical');
    } else if (onNavigate) {
      onNavigate(tileId);
    }
  };
  // Guard: Wait for role to load
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="text-center panel-raised p-8" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie...</p>
        </div>
      </div>
    );
  }

  const tiles = [
    {
      id: 'take-exam',
      title: t('exams.startExam'),
      description: 'Wybierz typ egzaminu i rozpocznij test wiedzy. 7 dostępnych kategorii z automatyczną oceną.',
      icon: Target,
      stats: [
        { icon: CheckCircle, label: '7 typów egzaminów' },
        { icon: Clock, label: 'Auto-timer' }
      ],
      roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    },
    {
      id: 'statistics',
      title: t('exams.myStatistics'),
      description: 'Przeglądaj wszystkie wyniki egzaminów, filtruj po typie i analizuj szczegółowe odpowiedzi.',
      icon: BarChart3,
      stats: [
        { icon: BarChart3, label: 'Wyniki w czasie' },
        { icon: CheckCircle, label: 'Filtrowanie' }
      ],
      roles: ['cs', 'hcs', 'dev'],
    },
    {
      id: 'questions',
      title: t('exams.manageQuestions'),
      description: 'Dodawaj, edytuj i usuwaj pytania egzaminacyjne. Obsługa pytań wielokrotnego wyboru.',
      icon: Settings,
      stats: [
        { icon: Settings, label: 'CRUD pytań' },
        { icon: CheckCircle, label: 'Multi-choice' }
      ],
      roles: ['cs', 'hcs', 'dev'],
    },
    {
      id: 'archive',
      title: t('exams.archive'),
      description: 'Przeglądaj zarchiwizowane egzaminy i zarządzaj historycznymi wynikami.',
      icon: Archive,
      stats: [
        { icon: Archive, label: 'Historia' },
        { icon: CheckCircle, label: 'Wyszukiwanie' }
      ],
      roles: ['cs', 'hcs', 'dev'],
    },
    {
      id: 'practical',
      title: 'Egzaminy Praktyczne',
      description: 'Kalendarz egzaminów praktycznych. Rezerwuj termin lub zarządzaj slotami egzaminacyjnymi.',
      icon: Calendar,
      stats: [
        { icon: Calendar, label: 'Kalendarz' },
        { icon: Target, label: 'Rezerwacja' }
      ],
      roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    },
  ];

  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  // Trainee/Deputy view - 2 tiles (Start Exam + Practical)
  if (role === 'trainee' || role === 'deputy') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="btn-win95 mb-6 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-mono text-sm">Powrót do dashboard</span>
            </button>
          )}

          {/* Page Header */}
          <div className="mb-8 panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2 mb-3">
              <h1 className="text-2xl font-[family-name:var(--font-vt323)] text-white">
                System Egzaminacyjny
              </h1>
            </div>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Wybierz typ egzaminu
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  className="panel-raised text-left w-full"
                  style={{ backgroundColor: 'var(--mdt-btn-face)' }}
                >
                  <div className="px-4 py-2 flex items-center gap-3" style={{ backgroundColor: 'var(--mdt-header)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#ccc' }} />
                    <span className="font-[family-name:var(--font-vt323)] text-base" style={{ color: '#ccc' }}>{tile.title}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-xs mb-4" style={{ color: 'var(--mdt-content-text)' }}>
                      {tile.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tile.stats.map((stat, idx) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={idx} className="panel-inset px-2 py-1 flex items-center gap-1" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                            <StatIcon className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                            <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>{stat.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                      <span>Otwórz</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Admin/Dev view - grid of 4 tiles
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="btn-win95 mb-6 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Powrót do dashboard</span>
          </button>
        )}

        {/* Page Header */}
        <div className="mb-8 panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2 mb-3">
            <h1 className="text-2xl font-[family-name:var(--font-vt323)] text-white">
              System Egzaminacyjny
            </h1>
          </div>
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
            Zarządzaj egzaminami, pytaniami i wynikami
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                className="panel-raised text-left w-full"
                style={{ backgroundColor: 'var(--mdt-btn-face)' }}
              >
                {/* Tile Header */}
                <div className="px-4 py-2 flex items-center gap-3" style={{ backgroundColor: 'var(--mdt-header)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#ccc' }} />
                  <span className="font-[family-name:var(--font-vt323)] text-base" style={{ color: '#ccc' }}>{tile.title}</span>
                </div>

                {/* Tile Content */}
                <div className="p-4">
                  <p className="font-mono text-xs mb-4" style={{ color: 'var(--mdt-content-text)' }}>
                    {tile.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tile.stats.map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={idx} className="panel-inset px-2 py-1 flex items-center gap-1" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                          <StatIcon className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                          <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>{stat.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                    <span>Otwórz</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
