'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import Exam from '@/src/components/exam/Exam';

export default function ExamsPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-[#020a06]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8fb5a0] text-lg">Ładowanie...</p>
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
      <Exam onBack={() => router.push('/dashboard')} />
    </>
  );
}
