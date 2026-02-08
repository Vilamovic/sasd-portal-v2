'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import PersonnelPage from '@/src/components/personnel/PersonnelList/PersonnelPage';

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
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

  return <PersonnelPage />;
}
