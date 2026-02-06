'use client';

import Link from 'next/link';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { BookOpen, FileText, Users, ArrowRight, Clock, CheckCircle, Shield, Sparkles, Briefcase, UserCog } from 'lucide-react';
import Navbar from './Navbar';
import MtaNickModal from './MtaNickModal';

/**
 * Dashboard - Premium Sheriff-themed main dashboard
 * Role-based navigation tiles with glassmorphism design (Next.js routing)
 */
export default function Dashboard() {
  const { user, role, isDev, isAdmin, showMtaNickModal, handleMtaNickComplete } = useAuth();
  const { t } = useTranslation();

  const tiles = [
    {
      id: 'materials',
      title: t('nav.materials'),
      description: 'Przeglądaj kompletną bazę wiedzy SASD. Regulaminy, procedury i wytyczne operacyjne.',
      icon: BookOpen,
      iconColor: 'from-[#c9a227] to-[#e6b830]',
      glowColor: 'rgba(201, 162, 39, 0.3)',
      borderHover: 'hover:border-[#c9a227]/50',
      stats: [
        { icon: FileText, label: '12 dokumentów', value: '12' },
        { icon: Clock, label: 'Aktualizacja: dzisiaj' }
      ],
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'exams',
      title: t('nav.exams'),
      description: 'Testuj swoją wiedzę i zdobywaj kwalifikacje. 7 typów egzaminów z automatyczną oceną.',
      icon: CheckCircle,
      iconColor: 'from-[#14b8a6] to-[#0d9488]',
      glowColor: 'rgba(20, 184, 166, 0.3)',
      borderHover: 'hover:border-[#14b8a6]/50',
      stats: [
        { icon: FileText, label: '7 typów egzaminów', value: '7' },
        { icon: CheckCircle, label: 'Auto-ocena' }
      ],
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'divisions',
      title: 'Dywizje',
      description: 'Przeglądaj materiały specjalistyczne dla swojej dywizji. SWAT, SS, DTU, GU, FTO.',
      icon: Briefcase,
      iconColor: 'from-[#1e3a8a] to-[#1e40af]',
      glowColor: 'rgba(30, 58, 138, 0.3)',
      borderHover: 'hover:border-[#1e3a8a]/50',
      stats: [
        { icon: Shield, label: '5 dywizji' },
        { icon: FileText, label: 'Materiały specjalistyczne' }
      ],
      roles: ['user', 'admin', 'dev'],
    },
    {
      id: 'personnel',
      title: 'Personnel',
      description: 'Zarządzaj personelem, nadawaj kary i uprawnienia. Pełny dostęp do danych wszystkich użytkowników.',
      icon: UserCog,
      iconColor: 'from-[#c9a227] to-[#e6b830]',
      glowColor: 'rgba(201, 162, 39, 0.3)',
      borderHover: 'hover:border-[#c9a227]/50',
      stats: [
        { icon: Users, label: 'Zarządzanie użytkownikami' },
        { icon: Shield, label: 'Kary i uprawnienia' }
      ],
      roles: ['admin', 'dev'],
    },
    {
      id: 'admin',
      title: t('nav.admin'),
      description: 'Zarządzaj użytkownikami, uprawnieniami i monitoruj aktywność w systemie.',
      icon: Users,
      iconColor: 'from-purple-500 to-purple-600',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      borderHover: 'hover:border-purple-500/50',
      stats: [
        { icon: Users, label: 'Zarządzanie użytkownikami' },
        { icon: Shield, label: 'Force logout system' }
      ],
      roles: ['admin', 'dev'],
    },
  ];

  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  return (
    <>
      {/* MTA Nick Modal - shown on first login */}
      {showMtaNickModal && (
        <MtaNickModal
          user={user}
          onComplete={handleMtaNickComplete}
        />
      )}

      <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(201, 162, 39, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Panel główny</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Baza <span className="text-gold-gradient">Wiedzy</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4 mx-auto lg:mx-0" />
          <p className="text-[#8fb5a0] text-lg max-w-xl mx-auto lg:mx-0">
            Portal szkoleniowy San Andreas Sheriff&apos;s Department
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                  style={{ background: tile.glowColor }}
                />

                {/* Main Card */}
                <Link
                  href={`/${tile.id}`}
                  className={`block relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 ${tile.borderHover} transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl text-left overflow-hidden`}
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
                    <span>Przejdź</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Dokumenty', value: '50+', icon: FileText },
            { label: 'Typy egzaminów', value: '7', icon: CheckCircle },
            { label: 'Użytkownicy', value: '120+', icon: Users },
            { label: 'Uptime', value: '99.9%', icon: Shield },
          ].map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-4 text-center hover:bg-[#051a0f]/80 transition-colors"
              >
                <StatIcon className="w-6 h-6 text-[#c9a227] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-[#8fb5a0]">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
