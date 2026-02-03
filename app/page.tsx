'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import Login from '@/src/components/auth/Login';

export default function Home() {
  const { user, loading } = useAuth();

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

  // Logged in - show temporary dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Witaj w SASD Portal v2! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Jesteś zalogowany jako: <strong>{user.email}</strong>
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              ✅ FAZA 2 UKOŃCZONA: CORE & AUTH
            </h2>
            <ul className="space-y-2 text-green-800">
              <li>✓ TranslationContext (wielojęzyczność)</li>
              <li>✓ AuthContext (Supabase Auth + Discord OAuth)</li>
              <li>✓ Providers (wrapper contextów)</li>
              <li>✓ Login Screen (Discord integration)</li>
              <li>✓ Role system (dev/admin/user)</li>
              <li>✓ Force logout mechanism</li>
              <li>✓ MTA nick modal (TODO: implementacja UI)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              🚧 NASTĘPNY KROK: FAZA 3 - DASHBOARD & NAWIGACJA
            </h2>
            <ul className="space-y-2 text-blue-800">
              <li>• Dashboard z kafelkami (Materiały, Egzaminy, Admin)</li>
              <li>• Sidebar/Navbar nawigacja</li>
              <li>• Routing między sekcjami</li>
              <li>• User profile dropdown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
