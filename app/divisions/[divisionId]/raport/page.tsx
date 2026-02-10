'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import BackButton from '@/src/components/shared/BackButton';
import { Construction } from 'lucide-react';

/**
 * Division Raport Page - placeholder
 * /divisions/[divisionId]/raport
 */
export default function DivisionRaportRoute() {
  const { user, loading, division, isAdmin, isDev } = useAuth();
  const router = useRouter();
  const params = useParams();
  const divisionId = params.divisionId as string;

  const hasAccess = divisionId === 'SWAT' || division === divisionId || isAdmin || isDev;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !hasAccess) {
      router.push('/divisions');
    }
  }, [hasAccess, loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <BackButton onClick={() => router.push(`/divisions/${divisionId}`)} destination="Dywizji" />

          <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
                Raport - {divisionId}
              </span>
            </div>
            <div className="p-8 flex flex-col items-center justify-center gap-4">
              <Construction className="w-12 h-12" style={{ color: 'var(--mdt-muted-text)' }} />
              <p className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase" style={{ color: 'var(--mdt-content-text)' }}>
                Wkrótce dostępne
              </p>
              <p className="font-mono text-sm text-center" style={{ color: 'var(--mdt-muted-text)' }}>
                System raportów dywizji jest w trakcie przygotowania.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
