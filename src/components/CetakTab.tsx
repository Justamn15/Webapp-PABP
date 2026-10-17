import React, { useMemo, useState } from 'react';
import { SchoolInfo, ClassItem, AttendanceStatus } from '../types.ts';
import { Printer, Download, FileText, Upload } from 'lucide-react';

interface CetakTabProps {
  school: SchoolInfo;
  classes: ClassItem[];
  attendance: Record<string, AttendanceStatus>;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
}

export const CetakTab: React.FC<CetakTabProps> = ({
  school,
  classes,
  attendance,
  onShowToast,
  onOpenSettings,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const { year, month, daysInMonth, monthLabel } = useMemo(() => {
    if (!selectedMonth) {
      const now = new Date();
      return {
        year: now.getFullYear().toString(),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        daysInMonth: 30,
        monthLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      };
    }
    const [y, m] = selectedMonth.split('-');
    const mIdx = parseInt(m) - 1;
    const days = new Date(parseInt(y), parseInt(m), 0).getDate();
    return {
      year: y,
      month: m,
      daysInMonth: days,
      monthLabel: `${monthNames[mIdx]} ${y}`,
    };
  }, [selectedMonth]);

  const currentDateFormatted = useMemo(() => {
    const now = new Date();
    return `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  // Compute summary rows for all students across all classes
  const combinedRows = useMemo(() => {
    let globalIndex = 1;
    const rows: {
      index: number;
      className: string;
      student: string;
      sakit: number;
      izin: number;
      alpa: number;
      total: number;
    }[] = [];

    classes.forEach((c) => {
      c.students.forEach((student) => {
        let s = 0;
        let i = 0;
        let a = 0;

        for (let d = 1; d <= daysInMonth; d++) {
          const dayStr = String(d).padStart(2, '0');
          const dateStr = `${year}-${month}-${dayStr}`;
          const key = `${c.name}_${dateStr}_${student}`;
          const st = attendance[key];
          if (st === 'S') s++;
          else if (st === 'I') i++;
          else if (st === 'A') a++;
        }

        const total = s + i + a;
        rows.push({
          index: globalIndex++,
          className: c.name,
          student,
          sakit: s,
          izin: i,
          alpa: a,
          total,
        });
      });
    });

    return rows;
  }, [classes, daysInMonth, year, month, attendance]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'No,Nama Siswa,Sakit,Izin,Alpa,Jumlah,Keterangan (Kelas)\n';
    combinedRows.forEach((r) => {
      csvContent += `${r.index},"${r.student}",${r.sakit || 0},${r.izin || 0},${r.alpa || 0},${r.total || 0},"${r.className}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Absensi_All_Kelas_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`Dokumen Rekap All Kelas (${selectedMonth}) berhasil diekspor (CSV)`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Print Control Toolbar - Hidden on print */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Pusat Cetak & Rekapitulasi Dokumen Resmi</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi siap cetak untuk rekapitulasi absensi seluruh kelas (Kelas I s/d VI) lengkap dengan kop surat dan tanda tangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label htmlFor="input-bulan-cetak" className="font-semibold text-xs text-slate-600 whitespace-nowrap">
            Bulan:
          </label>
          <input
            id="input-bulan-cetak"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tabular-nums"
          />

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Upload Logo Kanan, Logo Kiri, TTD Guru, TTD Kepsek, dan Stempel Sekolah"
            >
              <Upload className="w-3.5 h-3.5 text-amber-700" />
              <span>Upload Logo, TTD & Stempel</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div
        id="printArea"
        className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 max-w-4xl mx-auto text-slate-900 transition-all font-sans"
      >
        {/* Header Kop Surat */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center justify-between gap-4">
          {/* Logo Left: Pemkab / Custom Logo */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            {school.logoKiriJurnal || school.logo ? (
              <img
                src={school.logoKiriJurnal || school.logo}
                alt="Logo Sekolah"
                className="max-h-20 max-w-20 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <img
                src="/logo_hss.svg"
                alt="Logo Pemkab HSS"
                className="max-h-20 max-w-20 object-contain"
              />
            )}
          </div>

          {/* Letterhead Text Center */}
          <div className="text-center flex-grow px-2">
            <h4 className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 uppercase">
              PEMERINTAH KABUPATEN HULU SUNGAI SELATAN
            </h4>
            <h3 className="text-base sm:text-xl font-extrabold uppercase tracking-wide text-slate-900 mt-0.5">
              {school.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-700 mt-1 max-w-xl mx-auto leading-relaxed">
              {school.address}
            </p>
          </div>

          {/* Logo Right: Tut Wuri / Custom Logo */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src={school.logoKananJurnal || '/logo_tutwuri.svg'}
              alt="Logo Tut Wuri"
              className="max-h-20 max-w-20 object-contain"
            />
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900">
            REKAPITULASI ABSENSI {school.subject.toUpperCase()}
          </h2>
          <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase text-slate-800">
            KELAS I s/d VI {school.name}
          </h3>
          <p className="text-xs font-semibold text-slate-700 pt-1">
            Bulan: <span className="underline font-bold text-slate-900">{monthLabel}</span>
          </p>
        </div>

        {/* Table of All Classes */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse border border-slate-800 text-xs">
            <thead>
              <tr className="bg-slate-100 text-center font-bold text-slate-900">
                <th className="border border-slate-800 p-2 w-12">No</th>
                <th className="border border-slate-800 p-2 text-left">Nama Siswa</th>
                <th className="border border-slate-800 p-2 w-16">Sakit</th>
                <th className="border border-slate-800 p-2 w-16">Izin</th>
                <th className="border border-slate-800 p-2 w-16">Alpa</th>
                <th className="border border-slate-800 p-2 w-16 font-extrabold">Jumlah</th>
                <th className="border border-slate-800 p-2 w-28 text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {combinedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-800 p-4 text-center text-slate-500">
                    Tidak ada data siswa.
                  </td>
                </tr>
              ) : (
                combinedRows.map((r) => (
                  <tr key={`${r.className}_${r.student}`} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-1.5 text-center font-medium tabular-nums">
                      {r.index}
                    </td>
                    <td className="border border-slate-800 p-1.5 font-medium text-slate-900">
                      {r.student}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center tabular-nums">
                      {r.sakit > 0 ? r.sakit : ''}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center tabular-nums">
                      {r.izin > 0 ? r.izin : ''}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center tabular-nums">
                      {r.alpa > 0 ? r.alpa : ''}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center font-bold tabular-nums">
                      {r.total > 0 ? r.total : ''}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center font-semibold text-slate-800">
                      {r.className}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Section */}
        <div className="flex justify-between items-start text-xs pt-4 page-break-inside-avoid">
          {/* Principal Signature & Stamp */}
          <div className="text-center min-w-[220px]">
            <p className="leading-snug">
              Mengetahui,<br />
              Kepala Sekolah
            </p>

            <div className="relative h-20 my-1 flex items-center justify-center">
              {school.stempelSekolah && (
                <img
                  src={school.stempelSekolah}
                  alt="Stempel Sekolah"
                  className="absolute left-2 -top-1 h-20 w-20 object-contain opacity-90 mix-blend-multiply pointer-events-none select-none z-20"
                />
              )}
              {school.ttdKepalaSekolah ? (
                <img
                  src={school.ttdKepalaSekolah}
                  alt="TTD Kepala Sekolah"
                  className="h-16 max-w-[150px] object-contain relative z-10"
                />
              ) : (
                <div className="h-16" />
              )}
            </div>

            <div>
              <p className="font-bold underline text-slate-900">{school.headName}</p>
              <p className="text-slate-700 text-[11px]">{school.headNip}</p>
            </div>
          </div>

          {/* Teacher Signature */}
          <div className="text-center min-w-[220px]">
            <p className="leading-snug">
              {school.place || 'Kandangan'}, {currentDateFormatted}<br />
              Guru Mata Pelajaran
            </p>

            <div className="h-20 my-1 flex items-center justify-center">
              {school.ttdGuru ? (
                <img
                  src={school.ttdGuru}
                  alt="TTD Guru"
                  className="h-16 max-w-[150px] object-contain"
                />
              ) : (
                <div className="h-16" />
              )}
            </div>

            <div>
              <p className="font-bold underline text-slate-900">{school.teacher}</p>
              <p className="text-slate-700 text-[11px]">{school.nip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
