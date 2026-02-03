'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { BookOpen, FileText, Users, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import Navbar from './Navbar';

/**
 * Dashboard - Główny ekran z kafelkami nawigacyjnymi
 * Role-based access: user widzi tylko Materiały i Egzaminy
 */
export default function Dashboard({ onNavigate }) {
  const { user, role, isDev, isAdmin } = useAuth();
  const { t } = useTranslation();

  // Definicja kafelków z kontrolą dostępu
  const tiles = [
    {
      id: 'materials',
      title: t('nav.materials'),
      description: 'Przeglądaj kompletną bazę wiedzy SASD. Regulaminy, procedury i wytyczne operacyjne.',
      icon: BookOpen,
      iconColor: 'from-badge-gold-600 to-badge-gold-400',
      glowColor: 'from-badge-gold-600 to-badge-gold-400',
      stats: [
        { icon: FileText, label: '12 dokumentów' },
        { icon: Clock, label: 'Aktualizacja: dzisiaj' }
      ],
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'exams',
      title: t('nav.exams'),
      description: 'Testuj swoją wiedzę i zdobywaj kwalifikacje. 7 typów egzaminów z automatyczną oceną.',
      icon: CheckCircle,
      iconColor: 'from-blue-500 to-blue-600',
      glowColor: 'from-blue-500 to-blue-600',
      stats: [
        { icon: FileText, label: '7 typów egzaminów' },
        { icon: CheckCircle, label: 'Auto-ocena' }
      ],
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'admin',
      title: t('nav.admin'),
      description: 'Zarządzaj użytkownikami, uprawnieniami i monitoruj aktywność w systemie.',
      icon: Users,
      iconColor: 'from-purple-500 to-purple-600',
      glowColor: 'from-purple-500 to-purple-600',
      stats: [
        { icon: Users, label: 'Zarządzanie użytkownikami' },
        { icon: CheckCircle, label: 'Force logout system' }
      ],
      roles: ['admin', 'dev'],
    },
  ];

  // Filtruj kafelki na podstawie roli
  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            BAZA WIEDZY
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 rounded-full mb-3"></div>
          <p className="text-gray-400 text-sm">
            Portal szkoleniowy San Andreas Sheriff's Department
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.id} className="group relative">
                {/* Glow effect on hover */}
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
                    Przejdź
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
