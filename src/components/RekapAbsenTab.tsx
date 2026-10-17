import React, { useMemo, useState } from 'react';
import { ClassItem, AttendanceStatus } from '../types.ts';
import {
  CalendarDays,
  Download,
  Info
} from 'lucide-react';

interface RekapAbsenTabProps {
  classes: ClassItem[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  attendance: Record<string, AttendanceStatus>;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const RekapAbsenTab: React.FC<RekapAbsenTabProps> = ({
  classes,
  selectedClass,
  onSelectClass,
  attendance,
  onShowToast,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const currentClassObj = classes.find((c) => c.name === selectedClass) || classes[0];

  const { year, month, daysInMonth } = useMemo(() => {
    if (!selectedMonth) {
      const now = new Date();
      return {
        year: now.getFullYear().toString(),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        daysInMonth: 30,
      };
    }
    const [y, m] = selectedMonth.split('-');
    const days = new Date(parseInt(y), parseInt(m), 0).getDate();
    return { year: y, month: m, daysInMonth: days };
  }, [selectedMonth]);

  // Compute student attendance matrix
  const studentRecords = useMemo(() => {
    if (!currentClassObj) {
      return {
        list: [],
        totals: { h: 0, s: 0, i: 0, a: 0, percentage: 0 },
      };
    }

    let totalH = 0;
    let totalS = 0;
    let totalI = 0;
    let totalA = 0;

    const list = currentClassObj.students.map((student, idx) => {
      let sH = 0;
      let sS = 0;
      let sI = 0;
      let sA = 0;
      const dailyStatuses: Record<number, AttendanceStatus | ''> = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        const key = `${currentClassObj.name}_${dateStr}_${student}`;
        const st = attendance[key] || '';
        dailyStatuses[d] = st;

        if (st === 'H') {
          sH++;
          totalH++;
        } else if (st === 'S') {
          sS++;
          totalS++;
        } else if (st === 'I') {
          sI++;
          totalI++;
        } else if (st === 'A') {
          sA++;
          totalA++;
        }
      }

      return {
        index: idx + 1,
        student,
        dailyStatuses,
        sH,
        sS,
        sI,
        sA,
      };
    });

    const totalRecords = totalH + totalS + totalI + totalA;
    const percentage = totalRecords > 0 ? Math.round((totalH / totalRecords) * 100) : 0;

    return {
      list,
      totals: { h: totalH, s: totalS, i: totalI, a: totalA, percentage },
    };
  }, [currentClassObj, daysInMonth, year, month, attendance]);

  const handleExportCSV = () => {
    if (!currentClassObj) return;

    let csvContent = `No,Nama Siswa,${Array.from({ length: daysInMonth }, (_, i) => i + 1).join(',')},Hadir (H),Sakit (S),Izin (I),Alpa (A)\n`;

    studentRecords.list.forEach((item) => {
      const daysPart = Array.from({ length: daysInMonth }, (_, i) => item.dailyStatuses[i + 1] || '-').join(',');
      csvContent += `${item.index},"${item.student}",${daysPart},${item.sH},${item.sS},${item.sI},${item.sA}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Kehadiran_${currentClassObj.name.replace(/\s+/g, '_')}_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`Rekap Kehadiran ${currentClassObj.name} bulan ${selectedMonth} berhasil diunduh (CSV)`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Filter and Month Picker Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        {/* Class Selection */}
        <div className="flex items-center gap-3">
          <label htmlFor="select-kelas-rekap" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Pilih Kelas:
          </label>
          <select
            id="select-kelas-rekap"
            value={currentClassObj ? currentClassObj.name : ''}
            onChange={(e) => onSelectClass(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.students.length} Siswa)
              </option>
            ))}
          </select>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-3">
          <label htmlFor="input-bulan-rekap" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Bulan Laporan:
          </label>
          <input
            id="input-bulan-rekap"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tabular-nums"
          />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hadir (H)</p>
          <h4 className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            {studentRecords.totals?.h || 0}
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sakit (S)</p>
          <h4 className="text-2xl font-extrabold text-amber-500 mt-1 tabular-nums">
            {studentRecords.totals?.s || 0}
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Izin (I)</p>
          <h4 className="text-2xl font-extrabold text-blue-500 mt-1 tabular-nums">
            {studentRecords.totals?.i || 0}
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Alpa (A)</p>
          <h4 className="text-2xl font-extrabold text-rose-600 mt-1 tabular-nums">
            {studentRecords.totals?.a || 0}
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Persentase Hadir</p>
          <h4 className="text-2xl font-extrabold text-indigo-600 mt-1 tabular-nums">
            {studentRecords.totals?.percentage || 0}%
          </h4>
        </div>
      </div>

      {/* Monthly Attendance Grid Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Rekapitulasi Bulanan Presensi: {currentClassObj?.name} ({selectedMonth})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>H: Hadir · S: Sakit · I: Izin · A: Alpa</span>
            </span>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <th className="p-2.5 w-12 text-center border-r border-slate-200">No</th>
                <th className="p-2.5 min-w-[170px] border-r border-slate-200">Nama Siswa</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <th key={d} className="p-1 text-center w-7 border-r border-slate-200 tabular-nums text-[11px]">
                    {d}
                  </th>
                ))}
                <th className="p-2 text-center w-9 text-emerald-700 bg-emerald-50/60 font-extrabold border-r border-slate-200">
                  H
                </th>
                <th className="p-2 text-center w-9 text-amber-700 bg-amber-50/60 font-extrabold border-r border-slate-200">
                  S
                </th>
                <th className="p-2 text-center w-9 text-blue-700 bg-blue-50/60 font-extrabold border-r border-slate-200">
                  I
                </th>
                <th className="p-2 text-center w-9 text-rose-700 bg-rose-50/60 font-extrabold">
                  A
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.list.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 6} className="p-8 text-center text-slate-400 text-sm">
                    Belum ada siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                studentRecords.list.map((item) => (
                  <tr key={item.student} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-2 text-center text-slate-400 font-semibold border-r border-slate-100 tabular-nums">
                      {item.index}
                    </td>
                    <td className="p-2 font-semibold text-slate-800 border-r border-slate-100 truncate max-w-[200px]">
                      {item.student}
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const st = item.dailyStatuses[d];
                      let cellClass = 'text-slate-300';
                      if (st === 'H') cellClass = 'bg-emerald-100 text-emerald-800 font-bold';
                      else if (st === 'S') cellClass = 'bg-amber-100 text-amber-800 font-bold';
                      else if (st === 'I') cellClass = 'bg-blue-100 text-blue-800 font-bold';
                      else if (st === 'A') cellClass = 'bg-rose-100 text-rose-800 font-bold';

                      return (
                        <td
                          key={d}
                          className={`p-0.5 text-center border-r border-slate-100 tabular-nums text-[10px] ${cellClass}`}
                        >
                          {st || '·'}
                        </td>
                      );
                    })}

                    <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100 tabular-nums">
                      {item.sH}
                    </td>
                    <td className="p-2 text-center font-bold text-amber-700 bg-amber-50/30 border-r border-slate-100 tabular-nums">
                      {item.sS}
                    </td>
                    <td className="p-2 text-center font-bold text-blue-700 bg-blue-50/30 border-r border-slate-100 tabular-nums">
                      {item.sI}
                    </td>
                    <td className="p-2 text-center font-bold text-rose-700 bg-rose-50/30 tabular-nums">
                      {item.sA}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
