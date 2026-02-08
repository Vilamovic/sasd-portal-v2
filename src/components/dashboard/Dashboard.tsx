'use client';

import Link from 'next/link';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { BookOpen, FileText, Users, CheckCircle, Shield, Briefcase, UserCog, ClipboardList } from 'lucide-react';
import Navbar from './Navbar';
import MtaNickModal from './MtaNickModal';

export default function Dashboard() {
  const { user, role, isDev, isAdmin, showMtaNickModal, handleMtaNickComplete } = useAuth();
  const { t } = useTranslation();

  const tiles = [
    {
      id: 'materials',
      title: t('nav.materials'),
      description: 'Przeglądaj kompletną bazę wiedzy SASD. Regulaminy, procedury i wytyczne operacyjne.',
      icon: BookOpen,
      stats: [
        { icon: FileText, label: '12 dokumentów', value: '12' },
      ],
      roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    },
    {
      id: 'exams',
      title: t('nav.exams'),
      description: 'Testuj swoją wiedzę i zdobywaj kwalifikacje. 7 typów egzaminów z automatyczną oceną.',
      icon: CheckCircle,
      stats: [
        { icon: FileText, label: '7 typów egzaminów', value: '7' },
      ],
      roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    },
    {
      id: 'divisions',
      title: 'Dywizje',
      description: 'Przeglądaj materiały specjalistyczne dla swojej dywizji. SWAT, SS, DTU, GU, FTO.',
      icon: Briefcase,
      stats: [
        { icon: Shield, label: '5 dywizji' },
      ],
      roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    },
    {
      id: 'zgloszenia',
      title: 'Zgłoszenia',
      description: 'Składaj wnioski, zgłaszaj błędy i propozycje. System wniosków SASD.',
      icon: ClipboardList,
      stats: [
        { icon: FileText, label: '7 typów zgłoszeń' },
      ],
      roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    },
    {
      id: 'personnel',
      title: 'Kartoteka',
      description: 'Zarządzaj personelem, nadawaj kary i uprawnienia. Pełny dostęp do danych wszystkich użytkowników.',
      icon: UserCog,
      stats: [
        { icon: Users, label: 'Zarządzanie użytkownikami' },
      ],
      roles: ['cs', 'hcs', 'dev'],
    },
    {
      id: 'admin',
      title: t('nav.admin'),
      description: 'Zarządzaj użytkownikami, uprawnieniami i monitoruj aktywność w systemie.',
      icon: Users,
      stats: [
        { icon: Users, label: 'Zarządzanie użytkownikami' },
      ],
      roles: ['cs', 'hcs', 'dev'],
    },
  ];

  const visibleTiles = tiles.filter((tile) => tile.roles.includes(role));

  return (
    <>
      {showMtaNickModal && (
        <MtaNickModal user={user} onComplete={handleMtaNickComplete} />
      )}

      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header - MDT blue bar */}
          <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
              BAZA WIEDZY - SASD PORTAL
            </span>
          </div>

          <p className="font-mono text-sm mb-8" style={{ color: 'var(--mdt-muted-text)' }}>
            Portal szkoleniowy San Andreas Sheriff&apos;s Department
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.id}
                  href={`/${tile.id}`}
                  className="block panel-raised p-0 hover:brightness-105 transition-all"
                  style={{ backgroundColor: 'var(--mdt-btn-face)' }}
                >
                  {/* Blue header */}
                  <div className="px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
                    <Icon className="w-4 h-4 text-white" />
                    <span className="font-[family-name:var(--font-vt323)] text-base tracking-wider uppercase text-white">
                      {tile.title}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="font-mono text-sm mb-4" style={{ color: 'var(--mdt-content-text)' }}>
                      {tile.description}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tile.stats.map((stat, idx) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={idx} className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                            <StatIcon className="w-3 h-3" />
                            <span>{stat.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Button */}
                    <button className="btn-win95 w-full text-sm">
                      PRZEJDŹ
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <div className="px-3 py-1.5 mb-3" style={{ backgroundColor: 'var(--mdt-header)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
                STATYSTYKI SYSTEMU
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {[
                { label: 'DOKUMENTY', value: '50+', icon: FileText },
                { label: 'TYPY EGZAMINÓW', value: '7', icon: CheckCircle },
                { label: 'UŻYTKOWNICY', value: '120+', icon: Users },
                { label: 'UPTIME', value: '99.9%', icon: Shield },
              ].map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2"
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                  >
                    <StatIcon className="w-4 h-4" style={{ color: 'var(--mdt-blue-bar)' }} />
                    <div>
                      <div className="font-[family-name:var(--font-vt323)] text-lg" style={{ color: 'var(--mdt-content-text)' }}>{stat.value}</div>
                      <div className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-2 px-4 py-1.5 z-50" style={{ backgroundColor: 'var(--mdt-header)' }}>
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-xs" style={{ color: '#aaa' }}>POŁĄCZONO Z BAZĄ SASD</span>
          <span className="ml-auto font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>SASD PORTAL v2.0</span>
        </div>
      </div>
    </>
  );
}
