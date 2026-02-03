'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { BookOpen, FileText, Users, ArrowRight } from 'lucide-react';
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
      description: 'Materiały szkoleniowe z edytorem WYSIWYG',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      roles: ['user', 'admin', 'dev'], // Wszyscy mają dostęp
    },
    {
      id: 'exams',
      title: t('nav.exams'),
      description: 'System egzaminacyjny (7 typów egzaminów)',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      roles: ['user', 'admin', 'dev'], // Wszyscy mają dostęp
    },
    {
      id: 'admin',
      title: t('nav.admin'),
      description: 'Zarządzanie użytkownikami i uprawnieniami',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      roles: ['admin', 'dev'], // Tylko admin i dev
    },
  ];

  // Filtruj kafelki na podstawie roli
  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Message */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            BAZA WIEDZY
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
          <p className="text-gray-400 mt-4">
            Wybierz sekcję, aby rozpocząć pracę
          </p>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate && onNavigate(tile.id)}
                className="group relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} ${tile.hoverColor} transition-all duration-300`} />

                {/* Content */}
                <div className="relative p-6 text-left flex items-center">
                  {/* Icon */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {tile.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {tile.description}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0 ml-2">
                    <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Statystyki
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Twoja rola:</span>
                <span className="font-semibold text-gray-900">
                  {t(`admin.roles.${role}`)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dostępne sekcje:</span>
                <span className="font-semibold text-gray-900">
                  {visibleTiles.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Szybki start
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Materiały szkoleniowe - przeglądaj i edytuj treści</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Egzaminy - zdawaj testy i sprawdzaj wyniki</span>
              </li>
              {isAdmin && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Admin - zarządzaj użytkownikami i pytaniami</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
