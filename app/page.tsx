'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import Login from '@/src/components/auth/Login';
import Dashboard from '@/src/components/dashboard/Dashboard';
import Exam from '@/src/components/exam/Exam';

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

      {/* TODO: Dodać komponenty dla innych sekcji */}
      {activeSection === 'materials' && (
        <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
            <h1 className="text-3xl font-bold mb-4 text-white">Materiały Szkoleniowe</h1>
            <p className="text-gray-300">Sekcja w budowie - FAZA 5</p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              ← Powrót do Dashboard
            </button>
          </div>
        </div>
      )}

      {activeSection === 'exams' && (
        <Exam onBack={() => setActiveSection('dashboard')} />
      )}

      {activeSection === 'admin' && (
        <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
            <h1 className="text-3xl font-bold mb-4 text-white">Panel Administratora</h1>
            <p className="text-gray-300">Sekcja w budowie - FAZA 5</p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              ← Powrót do Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
