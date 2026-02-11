'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/contexts/TranslationContext';
import { LogOut, User, ChevronDown, Shield, Award, Clock, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const {
    user,
    signOut,
    mtaNick,
    division,
    permissions,
    plusCount,
    minusCount,
    activePenalties,
    isCommander,
    badge,
    role,
  } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Countdown timer state for penalties
  const [penaltyTimers, setPenaltyTimers] = useState<Record<string, number>>({});

  // Theme toggle: read from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sasd-theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sasd-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('sasd-theme', 'light');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      const newTimers: Record<string, number> = {};
      activePenalties.forEach((penalty: any) => {
        if (penalty.remaining_seconds && penalty.remaining_seconds > 0) {
          newTimers[penalty.id] = penalty.remaining_seconds;
        }
      });
      setPenaltyTimers(newTimers);
    };

    updateTimers();

    const interval = setInterval(() => {
      setPenaltyTimers((prev) => {
        const updated: Record<string, number> = {};
        Object.keys(prev).forEach((id: string) => {
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

  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDivisionDisplay = () => {
    if (!division) return null;
    return isCommander ? `${division} Commander` : division;
  };

  const getDivisionColor = () => {
    const colors = { FTO: '#c9a227', SS: '#ff8c00', DTU: '#60a5fa', GU: '#10b981' };
    return colors[division as keyof typeof colors] || '#d4d4d4';
  };

  const getPenaltyDisplayName = (type: string) => {
    const names: Record<string, string> = {
      zawieszenie_sluzba: 'Zawieszenie: Frakcyjne',
      zawieszenie_dywizja: 'Zawieszenie: Dywizyjne',
      zawieszenie_uprawnienia: 'Zawieszenie: Uprawnieniowe',
      zawieszenie_poscigowe: 'Zawieszenie: Pościgowe',
    };
    return names[type] || type;
  };

  const getRoleDisplay = () => {
    const roleNames: Record<string, string> = {
      dev: 'Developer', hcs: 'High Command', cs: 'Command Staff', deputy: 'Deputy', trainee: 'Trainee',
    };
    return role ? roleNames[role] || role : '';
  };

  const getRoleColor = () => {
    const colors: Record<string, string> = {
      dev: '#ff6b6b', hcs: '#ffc107', cs: '#60a5fa', deputy: '#4ade80', trainee: '#999',
    };
    return role ? colors[role] || '#999' : '#999';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const discordUsername = user?.user_metadata?.global_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Użytkownik';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = mtaNick || discordUsername;

  return (
    <nav className="flex items-center justify-between px-5 py-2 relative z-[60]" style={{ backgroundColor: 'var(--mdt-header)' }}>
      {/* Left: Logo + Penalty Timer */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Shield className="h-7 w-7 text-amber-400" />
          <span className="font-[family-name:var(--font-vt323)] text-2xl tracking-wider hidden sm:block" style={{ color: 'var(--mdt-header-text)' }}>
            SASD
          </span>
          <span className="font-[family-name:var(--font-vt323)] text-2xl hidden sm:block" style={{ color: 'var(--mdt-subtle-text)' }}>
            {'>>'}
          </span>
          <span className="font-[family-name:var(--font-vt323)] text-2xl tracking-wider" style={{ color: 'var(--mdt-header-text)' }}>
            PORTAL
          </span>
        </button>

        {/* Active Penalties Timer */}
        {activePenalties && activePenalties.length > 0 && (
          <div className="hidden md:flex items-center gap-2 panel-inset px-3 py-1" style={{ backgroundColor: '#4a1a1a' }}>
            <Clock className="w-4 h-4 text-red-400" />
            <div className="flex flex-col">
              {activePenalties.map((penalty: any) => (
                <span key={penalty.id} className="text-red-400 text-xs font-mono font-bold">
                  {formatTime(penaltyTimers[penalty.id] || penalty.remaining_seconds)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle + User Menu */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-win95 flex items-center justify-center p-1.5"
          title={darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" style={{ color: '#ffc107' }} />
          ) : (
            <Moon className="w-5 h-5" style={{ color: 'var(--mdt-muted-text)' }} />
          )}
        </button>

        {/* User dropdown */}
        <div className="relative z-[60]" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn-win95 flex items-center gap-3 py-1 px-3 cursor-pointer"
          >
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover"
                  style={{ border: '1px solid var(--mdt-muted-text)' }}
                />
              ) : (
                <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-blue-bar)', color: '#fff' }}>
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full" style={{ border: '1px solid var(--mdt-btn-face)' }} />
            </div>

            {/* User Info */}
            <div className="hidden md:flex flex-col items-start">
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-btn-text)' }}>{displayName}</span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>@{discordUsername}</span>
            </div>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--mdt-muted-text)' }}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 panel-raised z-[9999] overflow-hidden" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
              {/* Blue title bar with profile */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} width={40} height={40} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full" style={{ border: '2px solid var(--mdt-blue-bar)' }} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-vt323)] text-base text-white tracking-wider truncate">{displayName}</span>
                    {badge && (
                      <span
                        className="font-mono text-[10px] font-bold px-1.5 py-px shrink-0"
                        style={{ color: '#ffc107', backgroundColor: 'rgba(0,0,0,0.3)' }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-blue-200">@{discordUsername}</span>
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-px"
                      style={{ color: getRoleColor(), backgroundColor: 'rgba(0,0,0,0.3)' }}
                    >
                      {getRoleDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content sections */}
              <div className="p-2.5 space-y-2">
                {/* Division & Permissions */}
                {(division || (permissions && permissions.length > 0)) && (
                  <div className="panel-inset p-2.5" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield className="w-4 h-4" style={{ color: getDivisionColor() }} />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mdt-muted-text)' }}>
                        Dywizja & Uprawnienia
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {division && (
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5"
                          style={{ color: getDivisionColor(), backgroundColor: '#1a1a1a', border: `1px solid ${getDivisionColor()}33` }}
                        >
                          {getDivisionDisplay()}
                        </span>
                      )}
                      {permissions && permissions.length > 0 && permissions.map((perm: string, idx: number) => (
                        <span key={idx} className="font-mono text-[11px] px-2 py-0.5" style={{ color: '#d4d4d4', backgroundColor: '#333' }}>
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plus/Minus Balance */}
                {(plusCount > 0 || minusCount > 0) && (
                  <div className="panel-inset p-2.5 flex items-center gap-3" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                    <Award className="w-4 h-4 shrink-0" style={{ color: 'var(--mdt-blue-bar)' }} />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mdt-muted-text)' }}>Bilans:</span>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>+{plusCount}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>|</span>
                      <span className="font-mono text-sm font-bold" style={{ color: '#ef4444' }}>-{minusCount}</span>
                    </div>
                  </div>
                )}

                {/* Active Penalties */}
                {activePenalties && activePenalties.length > 0 && (
                  <div className="panel-inset p-2.5 glow-red" style={{ backgroundColor: '#4a1a1a' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider">Aktywne Zawieszenia</span>
                    </div>
                    {activePenalties.map((penalty: any) => (
                      <div key={penalty.id} className="flex items-center justify-between pl-6 py-0.5">
                        <span className="font-mono text-[10px] text-red-300">{getPenaltyDisplayName(penalty.type)}</span>
                        <span className="font-mono text-xs font-bold text-red-400">
                          {formatTime(penaltyTimers[penalty.id] || penalty.remaining_seconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Separator */}
                <div className="h-px" style={{ backgroundColor: 'var(--mdt-border-mid)' }} />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn-win95 w-full flex items-center justify-center gap-2 py-2 cursor-pointer"
                  style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-mono text-xs font-bold">{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
