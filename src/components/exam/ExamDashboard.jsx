'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { Target, BarChart3, Settings, Archive, ArrowRight, CheckCircle, Clock, ChevronLeft } from 'lucide-react';

/**
 * ExamDashboard - Główny ekran wyboru sekcji egzaminacyjnych
 * 4 kafelki: Zacznij Egzamin, Moje Statystyki, Zarządzanie Pytaniami, Archiwum
 */
export default function ExamDashboard({ onNavigate, onBack }) {
  const { role, isAdmin } = useAuth();
  const { t } = useTranslation();

  const tiles = [
    {
      id: 'take-exam',
      title: t('exams.startExam'),
      description: 'Wybierz typ egzaminu i rozpocznij test wiedzy. 7 dostępnych kategorii z automatyczną oceną.',
      icon: Target,
      iconColor: 'from-green-500 to-green-600',
      glowColor: 'from-green-500 to-green-600',
      stats: [
        { icon: CheckCircle, label: '7 typów egzaminów' },
        { icon: Clock, label: 'Auto-timer' }
      ],
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'statistics',
      title: t('exams.myStatistics'),
      description: 'Przeglądaj wszystkie wyniki egzaminów, filtruj po typie i analizuj szczegółowe odpowiedzi.',
      icon: BarChart3,
      iconColor: 'from-blue-500 to-blue-600',
      glowColor: 'from-blue-500 to-blue-600',
      stats: [
        { icon: BarChart3, label: 'Wyniki w czasie' },
        { icon: CheckCircle, label: 'Filtrowanie' }
      ],
      roles: ['admin', 'dev'],
    },
    {
      id: 'questions',
      title: t('exams.manageQuestions'),
      description: 'Dodawaj, edytuj i usuwaj pytania egzaminacyjne. Obsługa pytań wielokrotnego wyboru.',
      icon: Settings,
      iconColor: 'from-purple-500 to-purple-600',
      glowColor: 'from-purple-500 to-purple-600',
      stats: [
        { icon: Settings, label: 'CRUD pytań' },
        { icon: CheckCircle, label: 'Multi-choice' }
      ],
      roles: ['admin', 'dev'],
    },
    {
      id: 'archive',
      title: t('exams.archive'),
      description: 'Przeglądaj zarchiwizowane egzaminy i zarządzaj historycznymi wynikami.',
      icon: Archive,
      iconColor: 'from-gray-500 to-gray-600',
      glowColor: 'from-gray-500 to-gray-600',
      stats: [
        { icon: Archive, label: 'Historia' },
        { icon: CheckCircle, label: 'Wyszukiwanie' }
      ],
      roles: ['admin', 'dev'],
    },
  ];

  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  // User widzi tylko "Zacznij Egzamin" (duży, centered)
  if (role === 'user') {
    const startExamTile = tiles[0];
    const Icon = startExamTile.icon;

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-8">
        <div className="max-w-2xl mx-auto pt-16">
          {/* Back Button */}
          {onBack && (
            <div className="mb-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Powrót do dashboard</span>
              </button>
            </div>
          )}

          {/* Main Card */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${startExamTile.glowColor} rounded-3xl opacity-20 blur-2xl`}></div>

            <button
              onClick={() => onNavigate && onNavigate(startExamTile.id)}
              className="relative w-full bg-police-dark-700 rounded-3xl border border-white/10 hover:border-green-500/50 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.01] overflow-hidden group"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-police-dark-600 to-police-dark-700 p-8 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${startExamTile.iconColor} rounded-3xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform`}>
                    <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {startExamTile.title}
                    </h1>
                    <span className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-xs font-bold uppercase tracking-wide">
                      Dostępne
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  {startExamTile.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {startExamTile.stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <StatIcon className="w-5 h-5 text-green-400" />
                          </div>
                          <span className="text-sm text-gray-400">{stat.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className={`w-full py-4 px-6 bg-gradient-to-r ${startExamTile.iconColor} rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-lg`}>
                  ROZPOCZNIJ EGZAMIN
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin/Dev widzi grid 4 kafelków
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Powrót do dashboard</span>
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            SYSTEM EGZAMINACYJNY
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 rounded-full mb-3"></div>
          <p className="text-gray-400 text-sm">
            Zarządzaj egzaminami, pytaniami i wynikami
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.id} className="group relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.glowColor} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>

                {/* Main Card */}
                <button
                  onClick={() => onNavigate && onNavigate(tile.id)}
                  className="relative w-full bg-police-dark-700 rounded-2xl p-6 border border-white/10 hover:border-badge-gold-600/50 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl text-left"
                >
                  {/* Icon Container */}
                  <div className="mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${tile.iconColor} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {tile.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {tile.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                    {tile.stats.map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <StatIcon className="w-4 h-4 text-badge-gold-600" />
                          <span className="text-xs text-gray-400">{stat.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className={`w-full py-3 px-4 bg-gradient-to-r ${tile.iconColor} hover:opacity-90 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg`}>
                    Otwórz
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
