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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
        <button
          onClick={() => onNavigate && onNavigate(startExamTile.id)}
          className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] max-w-md w-full"
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            SYSTEM EGZAMINACYJNY
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
          <p className="text-gray-400 mt-4">
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
                className="group relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} ${tile.hoverColor} transition-all duration-300`} />

                <div className="relative p-6 text-left flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {tile.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {tile.description}
                    </p>
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
