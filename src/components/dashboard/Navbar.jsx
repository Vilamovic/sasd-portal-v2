'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { LogOut, User, ChevronDown, Shield, Mail, Gamepad2 } from 'lucide-react';

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
    <nav className="h-16 bg-gradient-to-r from-[#0a0f1a] via-[#151c28] to-[#1a2332] border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo Section - Złota Odznaka SASD */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Złoty pierścień pulsujący */}
            <div className="absolute inset-0 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full animate-pulse opacity-20 blur-md"></div>

            {/* Główna ikona odznaki */}
            <div className="relative w-10 h-10 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-police-dark-900" strokeWidth={2.5} />
            </div>
          </div>

          {/* Tytuł - Inter Bold */}
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-wide">
              SAN ANDREAS SHERIFF'S DEPARTMENT
            </span>
            <span className="text-badge-gold-600 text-xs font-medium tracking-wider">
              TRAINING PORTAL
            </span>
          </div>
        </div>

        {/* User Menu Section */}
        <div className="relative" ref={dropdownRef}>
          {/* User Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-badge-gold-600/50 transition-all duration-300"
          >
            {/* Avatar z złotym borderkiem */}
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-police-dark-900" strokeWidth={2.5} />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#151c28]"></div>
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-white font-semibold text-sm">{displayName}</span>
              <span className="text-badge-gold-600 text-xs font-medium">{t(`admin.roles.${role}`)}</span>
            </div>

            {/* Chevron */}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 hover:text-white transition-all duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu - POPRAWIONY */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-police-dark-600 rounded-2xl shadow-2xl border border-white/10 opacity-100 visible transition-all duration-300 transform origin-top-right z-50 animate-slideDown">
              {/* Header z Avatar i Nickiem */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-police-dark-900" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-base">{displayName}</span>
                    <span className="text-gray-400 text-sm">{user?.user_metadata?.badge || 'Officer'}</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                {/* Role Badge */}
                <div className="px-3 py-2 flex items-center gap-3">
                  <Shield className={`w-5 h-5 ${isDev ? 'text-red-400' : isAdmin ? 'text-purple-400' : 'text-blue-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Rola</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg ${
                          isDev
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            : isAdmin
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        }`}
                      >
                        {t(`admin.roles.${role}`).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MTA Nick */}
                {mtaNick && (
                  <div className="px-3 py-2 flex items-center gap-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Gamepad2 className="w-5 h-5 text-badge-gold-600" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">MTA Nick</span>
                      <span className="text-white font-medium text-sm">{mtaNick}</span>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="px-3 py-2 flex items-center gap-3 rounded-lg hover:bg-white/5 transition-colors">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Email</span>
                    <span className="text-white font-medium text-sm truncate max-w-[200px]">{user?.email}</span>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-white/10 my-2"></div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 flex items-center gap-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                  <span className="text-red-400 group-hover:text-red-300 font-semibold text-sm">
                    {t('nav.logout')}
                  </span>
                </button>
              </div>
            </div>
          )}
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
