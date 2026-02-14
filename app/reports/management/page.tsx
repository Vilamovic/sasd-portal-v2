'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import SubmissionsManagementPage from '@/src/components/zgloszenia/admin/SubmissionsManagementPage';

export default function SubmissionsManagementRoute() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) router.push('/');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
          <div className="panel-raised p-6" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Brak uprawnień. Wymagany dostęp CS+.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <SubmissionsManagementPage />
    </>
  );
}
