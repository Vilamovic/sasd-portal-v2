'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import Login from '@/src/components/auth/Login';
import Dashboard from '@/src/components/dashboard/Dashboard';

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
  const handleNavigate = (section) => {
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
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Materiały Szkoleniowe</h1>
            <p className="text-gray-600">Sekcja w budowie - FAZA 5</p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ← Powrót do Dashboard
            </button>
          </div>
        </div>
      )}

      {activeSection === 'exams' && (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">System Egzaminacyjny</h1>
            <p className="text-gray-600">Sekcja w budowie - FAZA 4</p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ← Powrót do Dashboard
            </button>
          </div>
        </div>
      )}

      {activeSection === 'admin' && (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Panel Administratora</h1>
            <p className="text-gray-600">Sekcja w budowie - FAZA 5</p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ← Powrót do Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
