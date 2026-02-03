'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { LogOut, User, ChevronDown, Badge } from 'lucide-react';

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
    <nav className="bg-gradient-to-r from-[#1a2332] to-[#1e2836] shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Tytuł */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
              <Badge className="w-6 h-6 text-gray-900" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              SAN ANDREAS SHERIFF'S DEPARTMENT
            </span>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-gray-900 font-semibold text-sm shadow-md">
                {displayName.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-white">
                  {displayName}
                </div>
                <div className="text-xs text-gray-400">
                  {t(`admin.roles.${role}`)}
                </div>
              </div>

              {/* Dropdown Icon */}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1e2836] rounded-xl shadow-2xl border border-white/10 py-2 z-50 animate-fadeIn">
                {/* User Info (mobile) */}
                <div className="px-4 py-3 border-b border-white/10 sm:hidden">
                  <div className="text-sm font-semibold text-white">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {user?.email}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Profil</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white font-medium truncate ml-2 max-w-[150px]">
                        {user?.email}
                      </span>
                    </div>
                    {mtaNick && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">MTA Nick:</span>
                        <span className="text-white font-medium">
                          {mtaNick}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rola:</span>
                      <span
                        className={`font-semibold ${
                          isDev
                            ? 'text-red-400'
                            : isAdmin
                            ? 'text-purple-400'
                            : 'text-blue-400'
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
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-500/20 transition-colors duration-200 text-red-400"
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
