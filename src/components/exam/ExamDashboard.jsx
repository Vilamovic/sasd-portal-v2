'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { Target, BarChart3, Settings, Archive, ArrowRight, CheckCircle, Clock, ChevronLeft, Sparkles } from 'lucide-react';

/**
 * ExamDashboard - Premium Sheriff-themed exam navigation
 * 4 tiles for admin, 1 centered card for users
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
      iconColor: 'from-[#22c55e] to-[#16a34a]',
      glowColor: 'rgba(34, 197, 94, 0.3)',
      borderHover: 'hover:border-[#22c55e]/50',
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
      iconColor: 'from-[#14b8a6] to-[#0d9488]',
      glowColor: 'rgba(20, 184, 166, 0.3)',
      borderHover: 'hover:border-[#14b8a6]/50',
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
      iconColor: 'from-purple-500 to-purple-600',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      borderHover: 'hover:border-purple-500/50',
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
      iconColor: 'from-[#c9a227] to-[#e6b830]',
      glowColor: 'rgba(201, 162, 39, 0.3)',
      borderHover: 'hover:border-[#c9a227]/50',
      stats: [
        { icon: Archive, label: 'Historia' },
        { icon: CheckCircle, label: 'Wyszukiwanie' }
      ],
      roles: ['cs', 'hcs', 'dev'],
    },
  ];

  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  // Trainee/Deputy view - single centered card (only "Take Exam")
  if (role === 'trainee' || role === 'deputy') {
    const startExamTile = tiles[0];
    const Icon = startExamTile.icon;

    return (
      <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Powrót do dashboard</span>
            </button>
          )}

          {/* Main Card */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl animate-pulse-glow"
              style={{ background: startExamTile.glowColor }}
            />

            <button
              onClick={() => onNavigate && onNavigate(startExamTile.id)}
              className="relative w-full glass-strong rounded-3xl border border-[#22c55e]/30 hover:border-[#22c55e]/60 shadow-2xl hover:shadow-[#22c55e]/20 transition-all duration-300 hover:scale-[1.01] overflow-hidden group"
            >
              {/* Decorative accents */}
              <div className="absolute top-0 left-8 w-32 h-[2px] bg-gradient-to-r from-[#22c55e] to-transparent" />
              <div className="absolute top-0 right-8 w-32 h-[2px] bg-gradient-to-l from-[#22c55e] to-transparent" />

              {/* Header */}
              <div className="bg-gradient-to-br from-[#051a0f] to-[#0a2818]/50 p-8 border-b border-[#1a4d32]/50">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${startExamTile.iconColor} rounded-3xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform`}>
                    <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {startExamTile.title}
                    </h1>
                    <span className="px-3 py-1 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-full text-[#22c55e] text-xs font-bold uppercase tracking-wide">
                      Dostępne
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-[#8fb5a0] text-lg leading-relaxed mb-8">
                  {startExamTile.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {startExamTile.stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={idx} className="bg-[#051a0f]/50 rounded-2xl p-4 border border-[#1a4d32]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#22c55e]/20 rounded-xl flex items-center justify-center">
                            <StatIcon className="w-5 h-5 text-[#22c55e]" />
                          </div>
                          <span className="text-sm text-[#8fb5a0]">{stat.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className={`w-full py-4 px-6 bg-gradient-to-r ${startExamTile.iconColor} rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-lg shadow-[#22c55e]/30`}>
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

  // Admin/Dev view - grid of 4 tiles
  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(201, 162, 39, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Powrót do dashboard</span>
          </button>
        )}

        {/* Page Header */}
        <div className="mb-12 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>System egzaminacyjny</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            System <span className="text-gold-gradient">Egzaminacyjny</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4 mx-auto lg:mx-0" />
          <p className="text-[#8fb5a0] text-lg max-w-xl mx-auto lg:mx-0">
            Zarządzaj egzaminami, pytaniami i wynikami
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleTiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect */}
                <div
                  className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                  style={{ background: tile.glowColor }}
                />

                {/* Main Card */}
                <button
                  onClick={() => onNavigate && onNavigate(tile.id)}
                  className={`relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 ${tile.borderHover} transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl text-left overflow-hidden`}
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 left-6 w-16 h-[2px] bg-gradient-to-r from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-0 w-[2px] h-16 bg-gradient-to-b from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Icon Container */}
                  <div className="mb-5">
                    <div className={`w-14 h-14 bg-gradient-to-br ${tile.iconColor} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-[#8fb5a0] text-sm mb-6 leading-relaxed">
                    {tile.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-[#1a4d32]/50">
                    {tile.stats.map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a2818]/50">
                          <StatIcon className="w-4 h-4 text-[#c9a227]" />
                          <span className="text-xs text-[#8fb5a0]">{stat.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className={`w-full py-3.5 px-4 bg-gradient-to-r ${tile.iconColor} hover:opacity-90 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                    <span>Otwórz</span>
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
