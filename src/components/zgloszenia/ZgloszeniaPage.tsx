'use client';

import { useRouter } from 'next/navigation';
import { Bug, Shield, Lightbulb, Calendar, FileText, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { SUBMISSION_TYPES } from './types';
import type { SubmissionTypeConfig } from './types';

const ICON_MAP: Record<string, any> = {
  Bug, Shield, Lightbulb, Calendar, FileText, ArrowLeftRight,
};

export default function ZgloszeniaPage() {
  const router = useRouter();
  const { role, isAdmin } = useAuth();

  const visibleTypes = SUBMISSION_TYPES.filter(
    (t) => t.roles.includes(role) && (t.enabled || isAdmin)
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/dashboard')} destination="Dashboard" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            SYSTEM ZGŁOSZEŃ - SASD
          </span>
        </div>

        <p className="font-mono text-sm mb-6" style={{ color: 'var(--mdt-muted-text)' }}>
          Wybierz typ zgłoszenia, które chcesz złożyć
        </p>

        {/* Quick links */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => router.push('/reports/mine')}
            className="btn-win95 font-mono text-xs"
          >
            MOJE ZGŁOSZENIA
          </button>
          {isAdmin && (
            <button
              onClick={() => router.push('/reports/management')}
              className="btn-win95 font-mono text-xs"
            >
              ZARZĄDZANIE
            </button>
          )}
        </div>

        {/* Submission Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTypes.map((typeConfig) => (
            <SubmissionTypeCard
              key={typeConfig.type}
              config={typeConfig}
              onClick={() => {
                router.push(`/reports/${typeConfig.type}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmissionTypeCard({ config, onClick }: { config: SubmissionTypeConfig; onClick: () => void }) {
  const Icon = ICON_MAP[config.icon] || FileText;
  const isDisabled = !config.enabled;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex flex-col w-full h-full text-left panel-raised p-0 transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'}`}
      style={{ backgroundColor: 'var(--mdt-btn-face)' }}
    >
      {/* Blue header */}
      <div className="px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: isDisabled ? 'var(--mdt-header)' : 'var(--mdt-blue-bar)' }}>
        <Icon className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-wider uppercase text-white">
          {config.label}
        </span>
        {isDisabled && (
          <span className="ml-auto font-mono text-[10px] text-white opacity-60">WKRÓTCE</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="font-mono text-sm mb-4 flex-1" style={{ color: 'var(--mdt-content-text)' }}>
          {config.description}
        </p>

        <div className="btn-win95 w-full text-sm text-center">
          {isDisabled ? 'NIEDOSTĘPNE' : 'ZŁÓŻ WNIOSEK'}
        </div>
      </div>
    </button>
  );
}
