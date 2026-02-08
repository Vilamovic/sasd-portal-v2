'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import ExamManagementPage from '@/src/components/zgloszenia/exam/ExamManagementPage';

export default function ExamManagementRoute() {
  const { user, loading, isCS } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isCS)) router.push('/');
  }, [user, loading, isCS, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
      </div>
    );
  }

  if (!user || !isCS) return null;

  return (
    <>
      <Navbar />
      <ExamManagementPage />
    </>
  );
}
