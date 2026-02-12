'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import AccessDenied from '@/src/components/shared/AccessDenied';
import GangMembersPage from '@/src/components/divisions/GangsPage/GangMembers/GangMembersPage';

export default function GangMembersRoute() {
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

  if (!isCS && division !== 'GU') {
    return (
      <>
        <Navbar />
        <AccessDenied onBack={() => router.push('/divisions/GU')} message="Brak uprawnień. Wymagany: GU lub CS+." />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <Navbar />
      <GangMembersPage />
    </div>
  );
}
