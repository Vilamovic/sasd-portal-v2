'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import Materials from '@/src/components/materials/Materials';

export default function MaterialsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore JSDoc types not recognized by TSC */}
      <Materials onBack={() => router.push('/dashboard')} />
    </>
  );
}
