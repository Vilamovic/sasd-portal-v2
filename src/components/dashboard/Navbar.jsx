'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { LogOut, User, ChevronDown, Shield, Gamepad2, Award, Clock } from 'lucide-react';

/**
 * Navbar - Premium Sheriff-themed navigation bar
 * With user profile dropdown and logout functionality
 * OPTIMIZED: React.memo to prevent unnecessary re-renders
 */
export default function Navbar() {
  const {
    user,
    role,
    isDev,
    isAdmin,
    signOut,
    mtaNick,
    division,
    permissions,
    plusCount,
    minusCount,
    activePenalties,
    isCommander,
  } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Countdown timer state for penalties
  const [penaltyTimers, setPenaltyTimers] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update penalty timers every second
  useEffect(() => {
    if (!activePenalties || activePenalties.length === 0) {
      setPenaltyTimers({});
      return;
    }

    const updateTimers = () => {
      const newTimers = {};
      activePenalties.forEach((penalty) => {
        if (penalty.remaining_seconds && penalty.remaining_seconds > 0) {
          newTimers[penalty.id] = penalty.remaining_seconds;
        }
      });
      setPenaltyTimers(newTimers);
    };

    // Initial update
    updateTimers();

    // Update every second
    const interval = setInterval(() => {
      setPenaltyTimers((prev) => {
        const updated = {};
        Object.keys(prev).forEach((id) => {
          const remaining = prev[id] - 1;
          if (remaining > 0) {
            updated[id] = remaining;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePenalties]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get division display name with Commander suffix
  const getDivisionDisplay = () => {
    if (!division) return null;
    return isCommander ? `${division} Commander` : division;
  };

  // Get division color
  const getDivisionColor = () => {
    const colors = {
      FTO: 'text-[#c9a227]', // Yellow (gold theme)
      SS: 'text-[#ff8c00]', // Orange
      DTU: 'text-[#1e3a8a]', // Navy blue
      GU: 'text-[#10b981]', // Green
    };
    return colors[division] || 'text-white';
  };

  // Get penalty type display name
  const getPenaltyDisplayName = (type) => {
    const names = {
      zawieszenie_sluzba: 'Zawieszenie: Służba',
      zawieszenie_dywizja: 'Zawieszenie: Dywizja',
      zawieszenie_uprawnienie: 'Zawieszenie: Uprawnienia',
    };
    return names[type] || type;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to reload if router fails
      window.location.href = '/';
    }
  };

  // Discord username
  const discordUsername = user?.user_metadata?.global_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Użytkownik';
  // Avatar URL z Discorda
  const avatarUrl = user?.user_metadata?.avatar_url;
  // Główna nazwa do wyświetlenia
  const displayName = mtaNick || discordUsername;

  return (
    <nav className="h-16 bg-gradient-to-r from-[#020a06] via-[#051a0f] to-[#0a2818] border-b border-[#1a4d32]/50 shadow-2xl relative z-50">
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
        <div className="relative z-[60]" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 group"
          >
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full shadow-lg group-hover:shadow-[#c9a227]/30 transition-shadow object-cover border-2 border-[#c9a227]/30"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-[#c9a227]/30 transition-shadow">
                  <User className="w-5 h-5 text-[#020a06]" strokeWidth={2.5} />
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#051a0f]" />
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-white font-semibold text-sm">{mtaNick || discordUsername}</span>
              <span className="text-[#c9a227] text-xs font-medium">@{discordUsername}</span>
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
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#051a0f] rounded-2xl shadow-2xl border border-[#1a4d32] z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Decorative top border */}
              <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

              {/* Header */}
              <div className="p-4 border-b border-[#1a4d32]/50 bg-gradient-to-br from-[#0a2818]/50 to-transparent">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-14 h-14 rounded-full shadow-lg object-cover border-2 border-[#c9a227]/30"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-[#020a06]" strokeWidth={2.5} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-base">{discordUsername}</span>
                    {mtaNick && (
                      <span className="text-[#c9a227] text-sm font-medium">@{mtaNick}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                {/* Division & Permissions */}
                {(division || (permissions && permissions.length > 0)) && (
                  <div className="px-3 py-3 flex items-center gap-3 rounded-xl bg-[#0a2818]/30">
                    <Shield className={getDivisionColor()} />
                    <div className="flex flex-col flex-1">
                      <span className="text-xs text-[#8fb5a0] uppercase tracking-wide">
                        {division ? 'Dywizja' : 'Uprawnienia'}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {division && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getDivisionColor()} bg-white/10`}>
                            {getDivisionDisplay()}
                          </span>
                        )}
                        {permissions && permissions.length > 0 && (
                          <>
                            {division && <span className="text-white/50 text-xs">|</span>}
                            {permissions.map((perm, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-white/10"
                              >
                                {perm}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Plus/Minus Counter */}
                {(plusCount > 0 || minusCount > 0) && (
                  <div className="px-3 py-3 flex items-center gap-3 rounded-xl bg-[#0a2818]/30">
                    <Award className="w-5 h-5 text-[#c9a227]" />
                    <div className="flex flex-col flex-1">
                      <span className="text-xs text-[#8fb5a0] uppercase tracking-wide">Bilans</span>
                      <div className="mt-1 flex gap-3">
                        <span className="text-[#22c55e] font-bold text-sm">+{plusCount}</span>
                        <span className="text-white/50">|</span>
                        <span className="text-[#ef4444] font-bold text-sm">-{minusCount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Penalties (Suspensions) */}
                {activePenalties && activePenalties.length > 0 && (
                  <div className="px-3 py-3 flex flex-col gap-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400 uppercase tracking-wide font-semibold">
                        Aktywne Zawieszenia
                      </span>
                    </div>
                    {activePenalties.map((penalty) => (
                      <div key={penalty.id} className="flex flex-col gap-1 pl-6">
                        <span className="text-white text-xs font-medium">
                          {getPenaltyDisplayName(penalty.type)}
                        </span>
                        <span className="text-red-400 text-xs font-mono">
                          {formatTime(penaltyTimers[penalty.id] || penalty.remaining_seconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

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

