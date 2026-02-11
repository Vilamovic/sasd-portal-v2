'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import BackButton from '@/src/components/shared/BackButton';
import GangsPage from '@/src/components/divisions/GangsPage/GangsPage';

/**
 * Division Gangs Page (GU only)
 * /divisions/[divisionId]/gangs
 */
export default function DivisionGangsRoute() {
  const { user, loading, division, isAdmin, isDev } = useAuth();
  const router = useRouter();
  const params = useParams();
  const divisionId = params.divisionId as string;

  const hasAccess = division === 'GU' || isAdmin || isDev;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && (!hasAccess || divisionId !== 'GU')) {
      router.push('/divisions');
    }
  }, [hasAccess, loading, user, divisionId, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!hasAccess || divisionId !== 'GU') return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <BackButton onClick={() => router.push(`/divisions/GU`)} destination="Gang Unit" />
          <GangsPage onBack={() => router.push('/divisions/GU')} />
        </div>
      </div>
    </>
  );
}
