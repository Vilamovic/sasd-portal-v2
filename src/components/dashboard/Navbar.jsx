'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { LogOut, User, Shield, ChevronDown } from 'lucide-react';

/**
 * Navbar - Górna belka nawigacyjna z user profile i logout
 */
export default function Navbar() {
  const { user, role, isDev, isAdmin, signOut, mtaNick } = useAuth();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  // Nazwa wyświetlana (nick MTA > email > "Użytkownik")
  const displayName = mtaNick || user?.email?.split('@')[0] || 'Użytkownik';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Tytuł */}
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SASD Portal</span>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500">
                  {t(`admin.roles.${role}`)}
                </div>
              </div>

              {/* Dropdown Icon */}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
                {/* User Info (mobile) */}
                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                  <div className="text-sm font-semibold text-gray-900">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {user?.email}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Profil</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900 font-medium truncate ml-2 max-w-[150px]">
                        {user?.email}
                      </span>
                    </div>
                    {mtaNick && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">MTA Nick:</span>
                        <span className="text-gray-900 font-medium">
                          {mtaNick}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rola:</span>
                      <span
                        className={`font-semibold ${
                          isDev
                            ? 'text-red-600'
                            : isAdmin
                            ? 'text-purple-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {t(`admin.roles.${role}`)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition-colors duration-200 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('nav.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}
