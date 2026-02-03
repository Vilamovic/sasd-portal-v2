'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { BookOpen, FileText, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Witaj w systemie szkoleniowym
          </h2>
          <p className="text-gray-600">
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
                className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} ${tile.hoverColor} transition-all duration-300`} />

                {/* Content */}
                <div className="relative p-8 text-left">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-all duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tile.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 text-sm leading-relaxed">
                    {tile.description}
                  </p>

                  {/* Hover Arrow */}
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
