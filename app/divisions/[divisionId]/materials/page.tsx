'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import DivisionPage from '@/src/components/divisions/DivisionPage/DivisionPage';

/**
 * Division Materials Page - sub-route for materials
 * /divisions/[divisionId]/materials
 */
export default function DivisionMaterialsRoute() {
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
      <DivisionPage divisionId={divisionId} onBack={() => router.push(`/divisions/${divisionId}`)} />
    </>
  );
}
