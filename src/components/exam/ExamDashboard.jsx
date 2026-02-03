'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { FileText, BarChart3, Settings, Archive } from 'lucide-react';

/**
 * ExamDashboard - Główny ekran wyboru sekcji egzaminacyjnych
 * 4 kafelki: Zacznij Egzamin, Moje Statystyki, Zarządzanie Pytaniami, Archiwum
 */
export default function ExamDashboard({ onNavigate }) {
  const { role, isAdmin } = useAuth();
  const { t } = useTranslation();

  const tiles = [
    {
      id: 'take-exam',
      title: t('exams.startExam'),
      description: 'Rozpocznij egzamin z wybranego zakresu',
      icon: FileText,
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-600 hover:to-emerald-700',
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'statistics',
      title: t('exams.myStatistics'),
      description: 'Przeglądaj wyniki egzaminów i statystyki',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      roles: ['admin', 'dev'], // User nie ma dostępu
    },
    {
      id: 'questions',
      title: t('exams.manageQuestions'),
      description: 'Zarządzanie pytaniami egzaminacyjnymi',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      roles: ['admin', 'dev'], // Tylko admin/dev
    },
    {
      id: 'archive',
      title: t('exams.archive'),
      description: 'Archiwum zarchiwizowanych egzaminów',
      icon: Archive,
      color: 'from-gray-500 to-gray-600',
      hoverColor: 'hover:from-gray-600 hover:to-gray-700',
      roles: ['admin', 'dev'], // Tylko admin/dev
    },
  ];

  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  // User widzi tylko "Zacznij Egzamin" (duży, centered)
  if (role === 'user') {
    const startExamTile = tiles[0];
    const Icon = startExamTile.icon;

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <button
          onClick={() => onNavigate && onNavigate(startExamTile.id)}
          className="group relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl max-w-md w-full"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${startExamTile.color} ${startExamTile.hoverColor} transition-all duration-300`} />

          <div className="relative p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-all duration-300">
                <Icon className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-4xl font-bold text-white mb-4">
              {startExamTile.title}
            </h3>

            <p className="text-white/90 text-lg leading-relaxed">
              {startExamTile.description}
            </p>

            <div className="mt-8">
              <svg
                className="w-8 h-8 text-white mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Admin/Dev widzi grid 4 kafelków
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('exams.title')}
          </h2>
          <p className="text-gray-600">
            Wybierz sekcję aby kontynuować
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate && onNavigate(tile.id)}
                className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} ${tile.hoverColor} transition-all duration-300`} />

                <div className="relative p-8 text-left">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-all duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tile.title}
                  </h3>

                  <p className="text-white/90 text-sm leading-relaxed">
                    {tile.description}
                  </p>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
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
