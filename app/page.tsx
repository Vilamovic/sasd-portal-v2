'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import Login from '@/src/components/auth/Login';
import Dashboard from '@/src/components/dashboard/Dashboard';
import Exam from '@/src/components/exam/Exam';
import Materials from '@/src/components/materials/Materials';
import AdminPanel from '@/src/components/admin/AdminPanel';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show Login screen
  if (!user) {
    return <Login />;
  }

  // Handler nawigacji między sekcjami
  const handleNavigate = (section: string) => {
    setActiveSection(section);
    // TODO: Implementacja renderowania różnych sekcji
    console.log('Navigating to:', section);
  };

  // Logged in - show Dashboard
  return (
    <div>
      {activeSection === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} />
      )}

      {activeSection === 'materials' && (
        <Materials onBack={() => setActiveSection('dashboard')} />
      )}

      {activeSection === 'exams' && (
        <Exam onBack={() => setActiveSection('dashboard')} />
      )}

      {activeSection === 'admin' && (
        <AdminPanel onBack={() => setActiveSection('dashboard')} />
      )}
    </div>
  );
}
