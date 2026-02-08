'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Login from '@/src/components/auth/Login';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE SYSTEMU_
        </div>
      </div>
    );
  }

  // Not logged in - show Login screen
  if (!user) {
    return <Login />;
  }

  // Redirecting to dashboard
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
        PRZEKIEROWYWANIE_
      </div>
    </div>
  );
}
