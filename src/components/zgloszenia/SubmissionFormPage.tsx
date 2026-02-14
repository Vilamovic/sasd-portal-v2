'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { SUBMISSION_TYPES } from './types';
import type { SubmissionType } from './types';
import BugReportForm from './forms/BugReportForm';
import DivisionApplicationForm from './forms/DivisionApplicationForm';
import IdeaForm from './forms/IdeaForm';
import ExcuseForm from './forms/ExcuseForm';
import VacationForm from './forms/VacationForm';
import PlusExchangeForm from './forms/PlusExchangeForm';

const FORM_COMPONENTS: Partial<Record<SubmissionType, React.ComponentType<any>>> = {
  bug_report: BugReportForm,
  division_application: DivisionApplicationForm,
  idea: IdeaForm,
  excuse: ExcuseForm,
  vacation: VacationForm,
  plus_exchange: PlusExchangeForm,
};

export default function SubmissionFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const type = params.type as SubmissionType;
  const typeConfig = SUBMISSION_TYPES.find((t) => t.type === type);
  const FormComponent = FORM_COMPONENTS[type];

  if (!typeConfig || !FormComponent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <BackButton onClick={() => router.push('/reports')} destination="Zgłoszenia" />
          <div className="panel-raised p-6 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Nieznany typ zgłoszenia lub formularz niedostępny.
            </p>
            <button
              onClick={() => router.push('/reports')}
              className="btn-win95 font-mono text-xs mt-4"
            >
              POWRÓT DO ZGŁOSZEŃ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!typeConfig.enabled) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <BackButton onClick={() => router.push('/reports')} destination="Zgłoszenia" />
          <div className="panel-raised p-6 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Ten typ zgłoszenia będzie dostępny wkrótce.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/reports')} destination="Zgłoszenia" />
        <FormComponent
          userId={user?.id}
          onSuccess={() => router.push('/reports/mine')}
          onCancel={() => router.push('/reports')}
        />
      </div>
    </div>
  );
}
