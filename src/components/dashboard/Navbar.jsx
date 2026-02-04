'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { LogOut, User, ChevronDown, Shield, Mail, Gamepad2 } from 'lucide-react';

/**
 * Navbar - Premium Sheriff-themed navigation bar
 * With user profile dropdown and logout functionality
 */
export default function Navbar() {
  const { user, role, isDev, isAdmin, signOut, mtaNick } = useAuth();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const displayName = mtaNick || user?.email?.split('@')[0] || 'Użytkownik';

  return (
    <nav className="h-16 bg-gradient-to-r from-[#020a06] via-[#051a0f] to-[#0a2818] border-b border-[#1a4d32]/50 shadow-2xl relative overflow-hidden">
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#c9a227]/5 via-transparent to-[#c9a227]/5 opacity-50" />

      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative z-10">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full animate-pulse-glow opacity-30 blur-md scale-125" />

            {/* Main badge icon */}
            <div className="relative w-11 h-11 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full flex items-center justify-center shadow-lg shadow-[#c9a227]/20 group-hover:shadow-[#c9a227]/40 transition-all duration-300">
              <Shield className="w-6 h-6 text-[#020a06]" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">
              SAN ANDREAS SHERIFF&apos;S DEPARTMENT
            </span>
            <span className="text-white font-bold text-lg tracking-wide sm:hidden">
              SASD
            </span>
            <span className="text-[#c9a227] text-xs font-semibold tracking-widest uppercase">
              Training Portal
            </span>
          </div>
        </div>

        {/* User Menu Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 group"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-[#c9a227]/30 transition-shadow">
                <User className="w-5 h-5 text-[#020a06]" strokeWidth={2.5} />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#051a0f]" />
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-white font-semibold text-sm">{displayName}</span>
              <span className="text-[#c9a227] text-xs font-medium">{t(`admin.roles.${role}`)}</span>
            </div>

            {/* Chevron */}
            <ChevronDown
              className={`w-4 h-4 text-[#8fb5a0] group-hover:text-white transition-all duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#051a0f] rounded-2xl shadow-2xl border border-[#1a4d32] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Decorative top border */}
              <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

              {/* Header */}
              <div className="p-4 border-b border-[#1a4d32]/50 bg-gradient-to-br from-[#0a2818]/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-[#020a06]" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-base">{displayName}</span>
                    <span className="text-[#8fb5a0] text-sm">{user?.user_metadata?.badge || 'Deputy'}</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                {/* Role Badge */}
                <div className="px-3 py-3 flex items-center gap-3 rounded-xl bg-[#0a2818]/30">
                  <Shield className={`w-5 h-5 ${isDev ? 'text-red-400' : isAdmin ? 'text-purple-400' : 'text-[#22693f]'}`} />
                  <div className="flex flex-col flex-1">
                    <span className="text-xs text-[#8fb5a0] uppercase tracking-wide">Rola</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          isDev
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            : isAdmin
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-[#22693f] to-[#1a4d32] text-white'
                        }`}
                      >
                        {t(`admin.roles.${role}`).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MTA Nick */}
                {mtaNick && (
                  <div className="px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-[#0a2818]/50 transition-colors cursor-default">
                    <Gamepad2 className="w-5 h-5 text-[#c9a227]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#8fb5a0] uppercase tracking-wide">MTA Nick</span>
                      <span className="text-white font-medium text-sm">{mtaNick}</span>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-[#0a2818]/50 transition-colors cursor-default">
                  <Mail className="w-5 h-5 text-[#14b8a6]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8fb5a0] uppercase tracking-wide">Email</span>
                    <span className="text-white font-medium text-sm truncate max-w-[200px]">{user?.email}</span>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#1a4d32] to-transparent my-2" />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
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
    </nav>
  );
}
