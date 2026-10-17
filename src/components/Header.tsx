import React, { useState, useRef, useEffect } from 'react';
import { SchoolInfo, AcademicPeriod } from '../types.ts';
import {
  GraduationCap,
  Settings,
  Cloud,
  CloudCheck,
  Loader2,
  LogIn,
  LogOut,
  User as UserIcon,
  Smartphone,
  Calendar,
  ChevronDown,
  Check,
  Lock,
  Plus,
  Layers,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { getSortedPeriods } from '../utils/periodHelpers.ts';

interface HeaderProps {
  school: SchoolInfo;
  user: User | null;
  isSyncing: boolean;
  isCloudConnected: boolean;
  periods?: Record<string, AcademicPeriod>;
  currentPeriodId?: string;
  onSwitchPeriod?: (periodId: string) => void;
  onOpenPeriodModal?: () => void;
  onLoginGoogle: () => void;
  onLogoutGoogle: () => void;
  onManualSync: () => void;
  onOpenSettings: () => void;
  onOpenAndroidModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  school,
  user,
  isSyncing,
  isCloudConnected,
  periods = {},
  currentPeriodId = '2025-2026_ganjil',
  onSwitchPeriod,
  onOpenPeriodModal,
  onLoginGoogle,
  onLogoutGoogle,
  onManualSync,
  onOpenSettings,
  onOpenAndroidModal,
}) => {
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortedPeriods = getSortedPeriods(periods);
  const currentPeriod = periods[currentPeriodId] || sortedPeriods[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-indigo-700 text-white shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap justify-between items-center gap-3">
        {/* Left: School Logo & Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="bg-white/10 p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 overflow-hidden border border-white/15">
            {school.logo ? (
              <img
                src={school.logo}
                alt="Logo Sekolah"
                className="max-h-8 max-w-8 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <GraduationCap className="w-6 h-6 text-indigo-100" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg leading-tight truncate tracking-tight">
              {school.name}
            </h1>
            <p className="text-xs text-indigo-200 truncate">
              <span className="font-medium text-white">{school.teacher}</span>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{school.subject}</span>
            </p>
          </div>
        </div>

        {/* Center / Actions: Period Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs border cursor-pointer ${
              currentPeriod?.isLocked
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 hover:bg-amber-500/30'
                : 'bg-indigo-800/90 text-white border-indigo-600 hover:bg-indigo-800'
            }`}
            title="Pilih atau ubah Semester dan Tahun Ajaran"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-200" />
            <span className="truncate max-w-[170px] sm:max-w-xs">
              {currentPeriod?.label || school.semester || 'Semester Ganjil 2025/2026'}
            </span>
            {currentPeriod?.isLocked && (
              <span title="Arsip Terkunci" className="flex items-center">
                <Lock className="w-3 h-3 text-amber-300 shrink-0" />
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-indigo-300 transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isPeriodDropdownOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Pilih Semester & Tahun Ajaran
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto px-1.5 space-y-1">
                {sortedPeriods.map((period) => {
                  const isSelected = period.id === currentPeriodId;
                  return (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => {
                        if (onSwitchPeriod) onSwitchPeriod(period.id);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{period.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {period.isLocked ? (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            Kunci
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            Aktif
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPeriodDropdownOpen(false);
                    if (onOpenPeriodModal) onOpenPeriodModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tambah / Kelola Periode Baru...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Cloud Sync Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
          {/* Cloud Sync Status Indicator */}
          <div
            onClick={user ? onManualSync : onLoginGoogle}
            title={user ? 'Klik untuk sinkronisasi manual ke Cloud Firestore' : 'Klik untuk masuk dengan akun Google'}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-800/80 border border-indigo-600/70 cursor-pointer hover:bg-indigo-800 transition"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
                <span className="text-indigo-200 font-medium">Menyimpan ke Cloud...</span>
              </>
            ) : user ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium hidden sm:inline">Tersimpan di Cloud</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-200 font-medium hidden sm:inline">Cloud Offline</span>
              </>
            )}
          </div>

          {/* User Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-indigo-900/60 pl-2 pr-1.5 py-1 rounded-lg border border-indigo-700/60 text-xs">
              <div className="flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-[160px]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-indigo-300" />
                )}
                <span className="truncate font-medium text-indigo-100">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={onLogoutGoogle}
                title="Keluar dari akun Google"
                className="p-1 hover:bg-indigo-800 rounded transition text-indigo-300 hover:text-white cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginGoogle}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 border border-indigo-500 shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Google</span>
            </button>
          )}

          {/* Pasang di HP / APK Button */}
          <button
            onClick={onOpenAndroidModal}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-emerald-500"
            title="Panduan memasang di Android dan membuat file APK"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pasang di HP / APK</span>
          </button>

          {/* Master Settings Button */}
          <button
            onClick={onOpenSettings}
            className="bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 text-xs sm:text-sm px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
