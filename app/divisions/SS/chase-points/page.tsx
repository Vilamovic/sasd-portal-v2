'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import BackButton from '@/src/components/shared/BackButton';
import AccessDenied from '@/src/components/shared/AccessDenied';
import ChasePointsPage from '@/src/components/divisions/ChasePoints/ChasePointsPage';

export default function ChasePointsRoute() {
  const { user, loading, division, isCS } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
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

  if (!isCS && division !== 'SS') {
    return (
      <>
        <Navbar />
        <AccessDenied onBack={() => router.push('/divisions/SS')} message="Brak uprawnień. Wymagany: SS lub CS+." />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/divisions/SS')} destination="SS" />
        <ChasePointsPage />
      </div>
    </div>
  );
}
