'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import DivisionPage from '@/src/components/divisions/DivisionPage/DivisionPage';

/**
 * Division Materials Page - Routing wrapper
 * - Redirect to login if not authenticated
 * - Redirect to divisions if no access
 * - SWAT public, others require division/Commander/Admin
 */
export default function DivisionMaterialsPageRoute() {
  const { user, loading, division, isAdmin, isDev } = useAuth();
  const router = useRouter();
  const params = useParams();
  const divisionId = params.divisionId as string;

  // Access control
  const hasAccess = divisionId === 'SWAT' || division === divisionId || isAdmin || isDev;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Redirect to divisions if no access
  useEffect(() => {
    if (!loading && user && !hasAccess) {
      router.push('/divisions');
    }
  }, [hasAccess, loading, user, router]);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8fb5a0] text-lg">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // No access (redirecting)
  if (!hasAccess) {
    return null;
  }

  return (
    <>
      <Navbar />
      <DivisionPage divisionId={divisionId} onBack={() => router.push('/divisions')} />
    </>
  );
}
