import React from 'react';
import { MainTab } from '../types.ts';
import { UserCheck, BookOpen, BookMarked, SquarePen, TableCellsMerge, CalendarDays, Printer, HardDriveDownload } from 'lucide-react';

interface NavigationProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'kehadiran', label: 'Kehadiran', icon: UserCheck },
    { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookOpen },
    { id: 'keagamaan', label: 'Capaian BTA & Ibadah', icon: BookMarked },
    { id: 'nilai', label: 'Input Nilai', icon: SquarePen },
    { id: 'rekapNilai', label: 'Legger & Rekap Nilai', icon: TableCellsMerge },
    { id: 'rekapAbsen', label: 'Rekap Kehadiran', icon: CalendarDays },
    { id: 'cetak', label: 'Cetak & Rekap All Kelas', icon: Printer },
    { id: 'backup', label: 'Backup & Restore', icon: HardDriveDownload },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-xs sticky top-[57px] z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar space-x-1 sm:space-x-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
