'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import BackButton from '@/src/components/shared/BackButton';
import ArchivedReportsPage from '@/src/components/divisions/Reports/ArchivedReportsPage';
import AccessDenied from '@/src/components/shared/AccessDenied';

/**
 * Archived Division Reports Page
 * /divisions/[divisionId]/raport/archived
 * CS+ only
 */
export default function ArchivedReportsRoute() {
  const { user, loading, isCS, isDev } = useAuth();
  const router = useRouter();
  const params = useParams();
  const divisionId = params.divisionId as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!isCS && !isDev) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <AccessDenied onBack={() => router.push(`/divisions/${divisionId}/raport`)} message="Brak uprawnień. Archiwum raportów jest dostępne tylko dla CS+." />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <BackButton onClick={() => router.push(`/divisions/${divisionId}/raport`)} destination="Raporty" />
          <ArchivedReportsPage divisionId={divisionId} />
        </div>
      </div>
    </>
  );
}
