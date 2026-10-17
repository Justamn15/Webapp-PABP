import React from 'react';
import { Lock, Unlock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AcademicPeriod } from '../types.ts';

interface LockedPeriodBannerProps {
  currentPeriod: AcademicPeriod;
  onToggleLock: (periodId: string, newLockedState: boolean) => void;
}

export const LockedPeriodBanner: React.FC<LockedPeriodBannerProps> = ({
  currentPeriod,
  onToggleLock,
}) => {
  if (!currentPeriod.isLocked) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4 mb-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 no-print transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 border border-amber-200">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-amber-950">
              Arsip Riwayat Terkunci: {currentPeriod.label}
            </span>
            <span className="text-[11px] font-semibold bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-md">
              Hanya Baca (Read-Only)
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-0.5">
            Nilai dan presensi pada periode ini dilindungi agar tidak terubah secara tidak sengaja. Anda dapat membuka kunci jika ingin merevisi.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <button
          onClick={() => onToggleLock(currentPeriod.id, false)}
          className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          title="Buka kunci untuk mengizinkan perubahan data pada semester ini"
        >
          <Unlock className="w-4 h-4 text-amber-700" />
          <span>Buka Kunci Edit</span>
        </button>
      </div>
    </div>
  );
};
