import React, { useMemo, useState } from 'react';
import { ClassItem, SchoolInfo } from '../types.ts';
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  TableCellsMerge,
  Filter
} from 'lucide-react';

interface LeggerTabProps {
  school: SchoolInfo;
  classes: ClassItem[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  nilai: Record<string, number>;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

interface StudentLeggerRow {
  index: number;
  student: string;
  avgTP: number;
  tpCount: number;
  avgLM: number;
  lmCount: number;
  sts: number;
  sas: number;
  finalScore: number;
  hasAnyScore: boolean;
  isTuntas: boolean;
}

export const LeggerTab: React.FC<LeggerTabProps> = ({
  school,
  classes,
  selectedClass,
  onSelectClass,
  nilai,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'tuntas' | 'belum'>('all');

  const currentClassObj = classes.find((c) => c.name === selectedClass) || classes[0];

  // Calculate legger rows for all students in the selected class
  const leggerRows = useMemo<StudentLeggerRow[]>(() => {
    if (!currentClassObj) return [];

    return currentClassObj.students.map((student, idx) => {
      let tpSum = 0;
      let tpCount = 0;
      for (let i = 1; i <= 50; i++) {
        const val = nilai[`${currentClassObj.name}_TP_${i}_${student}`];
        if (val !== undefined && val !== null) {
          tpSum += val;
          tpCount++;
        }
      }
      const avgTP = tpCount > 0 ? tpSum / tpCount : 0;

      let lmSum = 0;
      let lmCount = 0;
      for (let i = 1; i <= 15; i++) {
        const val = nilai[`${currentClassObj.name}_LM_${i}_${student}`];
        if (val !== undefined && val !== null) {
          lmSum += val;
          lmCount++;
        }
      }
      const avgLM = lmCount > 0 ? lmSum / lmCount : 0;

      const sts = nilai[`${currentClassObj.name}_STS_1_${student}`] || 0;
      const sas = nilai[`${currentClassObj.name}_SAS_1_${student}`] || 0;

      const hasAnyScore = tpCount > 0 || lmCount > 0 || sts > 0 || sas > 0;
      const finalScore = avgTP * 0.3 + avgLM * 0.3 + sts * 0.2 + sas * 0.2;
      const isTuntas = finalScore >= school.kkm;

      return {
        index: idx + 1,
        student,
        avgTP,
        tpCount,
        avgLM,
        lmCount,
        sts,
        sas,
        finalScore,
        hasAnyScore,
        isTuntas,
      };
    });
  }, [currentClassObj, nilai, school.kkm]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!currentClassObj || currentClassObj.students.length === 0) {
      return { total: 0, tuntas: 0, belum: 0, tuntasPct: 0, belumPct: 0, avgClass: '0.0' };
    }

    let tuntas = 0;
    let belum = 0;
    let activeScoreSum = 0;
    let activeScoreCount = 0;

    leggerRows.forEach((r) => {
      if (r.hasAnyScore) {
        activeScoreSum += r.finalScore;
        activeScoreCount++;
        if (r.isTuntas) tuntas++;
        else belum++;
      } else {
        belum++;
      }
    });

    const total = currentClassObj.students.length;
    const tuntasPct = total > 0 ? Math.round((tuntas / total) * 100) : 0;
    const belumPct = 100 - tuntasPct;
    const avgClass = activeScoreCount > 0 ? (activeScoreSum / activeScoreCount).toFixed(1) : '0.0';

    return { total, tuntas, belum, tuntasPct, belumPct, avgClass };
  }, [currentClassObj, leggerRows]);

  // Filtered rows for display
  const displayRows = useMemo(() => {
    return leggerRows.filter((r) => {
      if (filterStatus === 'tuntas') return r.isTuntas && r.hasAnyScore;
      if (filterStatus === 'belum') return !r.isTuntas || !r.hasAnyScore;
      return true;
    });
  }, [leggerRows, filterStatus]);

  // Export CSV
  const handleExportCSV = () => {
    if (!currentClassObj) return;

    let csvContent = 'No,Nama Siswa,Rata-rata TP (30%),Rata-rata LM (30%),STS (20%),SAS (20%),Nilai Akhir,Status KKM\n';

    leggerRows.forEach((r) => {
      const avgTPStr = r.tpCount > 0 ? r.avgTP.toFixed(1) : '-';
      const avgLMStr = r.lmCount > 0 ? r.avgLM.toFixed(1) : '-';
      const stsStr = r.sts > 0 ? r.sts.toString() : '-';
      const sasStr = r.sas > 0 ? r.sas.toString() : '-';
      const finalStr = r.hasAnyScore ? r.finalScore.toFixed(1) : '-';
      const statusStr = r.hasAnyScore ? (r.isTuntas ? 'Tuntas' : 'Belum Tuntas') : 'Belum Ada Nilai';

      csvContent += `${r.index},"${r.student}",${avgTPStr},${avgLMStr},${stsStr},${sasStr},${finalStr},${statusStr}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legger_Nilai_${currentClassObj.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`File Legger ${currentClassObj.name} berhasil diunduh (CSV)`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        {/* Class Selection */}
        <div className="flex items-center gap-3">
          <label htmlFor="select-kelas-legger" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Pilih Kelas:
          </label>
          <select
            id="select-kelas-legger"
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

        {/* Filter Status */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <label htmlFor="filter-status-legger" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Filter Status:
          </label>
          <select
            id="filter-status-legger"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'tuntas' | 'belum')}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="all">Semua Siswa</option>
            <option value="tuntas">Tuntas KKM (≥{school.kkm})</option>
            <option value="belum">Belum Tuntas (&lt;{school.kkm})</option>
          </select>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Siswa</p>
            <h4 className="text-xl font-extrabold text-slate-800 tabular-nums">{summaryStats.total}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Tuntas KKM</p>
            <h4 className="text-xl font-extrabold text-emerald-600 tabular-nums">
              {summaryStats.tuntas} <span className="text-xs font-semibold opacity-75">({summaryStats.tuntasPct}%)</span>
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Belum Tuntas</p>
            <h4 className="text-xl font-extrabold text-rose-600 tabular-nums">
              {summaryStats.belum} <span className="text-xs font-semibold opacity-75">({summaryStats.belumPct}%)</span>
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Rata-rata Kelas</p>
            <h4 className="text-xl font-extrabold text-amber-600 tabular-nums">{summaryStats.avgClass}</h4>
          </div>
        </div>
      </div>

      {/* Legger Comprehensive Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <TableCellsMerge className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Legger Nilai Komprehensif: {currentClassObj?.name}
            </h3>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3 w-14 text-center">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3 text-center">Rata-rata TP (30%)</th>
                <th className="p-3 text-center">Rata-rata LM (30%)</th>
                <th className="p-3 text-center">STS (20%)</th>
                <th className="p-3 text-center">SAS (20%)</th>
                <th className="p-3 text-center text-indigo-700 bg-indigo-50/40">Nilai Akhir</th>
                <th className="p-3 text-center">Status (KKM {school.kkm})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                    Tidak ada siswa yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                displayRows.map((r) => (
                  <tr key={r.student} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-semibold text-xs tabular-nums">
                      {r.index}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {r.student}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 tabular-nums">
                      {r.tpCount > 0 ? r.avgTP.toFixed(1) : '-'}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 tabular-nums">
                      {r.lmCount > 0 ? r.avgLM.toFixed(1) : '-'}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 tabular-nums">
                      {r.sts > 0 ? r.sts : '-'}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 tabular-nums">
                      {r.sas > 0 ? r.sas : '-'}
                    </td>
                    <td className="p-3 text-center font-extrabold text-indigo-700 bg-indigo-50/20 tabular-nums text-base">
                      {r.hasAnyScore ? r.finalScore.toFixed(1) : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {!r.hasAnyScore ? (
                        <span className="text-slate-400 text-xs">Belum ada nilai</span>
                      ) : r.isTuntas ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Tuntas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Belum Tuntas
                        </span>
                      )}
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
