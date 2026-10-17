import React, { useState, useMemo } from 'react';
import { SchoolInfo, ClassItem, AttendanceStatus, JournalEntry } from '../types.ts';
import {
  Printer,
  Calendar,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Plus,
  BookOpen,
  Check,
  X,
  FileText,
  Upload
} from 'lucide-react';

interface JurnalMengajarTabProps {
  school: SchoolInfo;
  classes: ClassItem[];
  attendance: Record<string, AttendanceStatus>;
  journal: Record<string, JournalEntry>;
  onUpdateJournalEntry: (date: string, entry: JournalEntry) => void;
  onBatchUpdateJournal: (entries: Record<string, JournalEntry>) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
}

export const JurnalMengajarTab: React.FC<JurnalMengajarTabProps> = ({
  school,
  classes,
  attendance,
  journal,
  onUpdateJournalEntry,
  onBatchUpdateJournal,
  onShowToast,
  onOpenSettings,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNamesIndo = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const { year, month, daysInMonth, monthLabel } = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    const mIdx = parseInt(m, 10) - 1;
    const days = new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
    return {
      year: y,
      month: m,
      daysInMonth: days,
      monthLabel: `${monthNames[mIdx]} ${y}`,
    };
  }, [selectedMonth]);

  // Last day date formatted for signature
  const lastDateFormatted = useMemo(() => {
    const mIdx = parseInt(month, 10) - 1;
    return `${daysInMonth} ${monthNames[mIdx]} ${year}`;
  }, [daysInMonth, month, year]);

  // Generate date list for this month
  const monthDates = useMemo(() => {
    const dates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, '0');
      dates.push(`${year}-${month}-${dayStr}`);
    }
    return dates;
  }, [year, month, daysInMonth]);

  // Auto-fill template matching the teacher's schedule pattern
  const handleAutoFillTemplate = () => {
    const newEntries: Record<string, JournalEntry> = { ...journal };
    let filledCount = 0;

    monthDates.forEach((dateStr) => {
      const dateObj = new Date(dateStr);
      const dayOfWeek = dateObj.getDay();
      const dayName = dayNamesIndo[dayOfWeek];
      const dNum = dateObj.getDate();
      const mIdx = dateObj.getMonth();
      const hariTanggal = `${dayName}, ${dNum} ${monthNames[mIdx]} ${dateObj.getFullYear()}`;

      // Check if entry already has custom content
      const existing = journal[dateStr];

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sabtu atau Minggu
        newEntries[dateStr] = {
          date: dateStr,
          hariTanggal,
          kelas: '-',
          jam: '-',
          waktu: '-',
          uraianMateri: existing?.uraianMateri && existing.uraianMateri !== '-' ? existing.uraianMateri : '-',
          sumberBelajar: '-',
          keterangan: 'Libur Akhir Pekan',
          isHoliday: true,
        };
        filledCount++;
      } else if (dayOfWeek === 1) {
        // Senin: Kelas VI
        newEntries[dateStr] = {
          date: dateStr,
          hariTanggal,
          kelas: 'VI',
          jam: '1-4',
          waktu: '08.00 - 10.35',
          uraianMateri: existing?.uraianMateri || 'Bab 2 Allah Swt. Maha Segalanya',
          sumberBelajar: existing?.sumberBelajar || 'Buku Guru & Siswa PAI',
          keterangan: existing?.keterangan || 'Hadir / KBM Efektif',
          isHoliday: existing?.isHoliday || false,
        };
        filledCount++;
      } else if (dayOfWeek === 2) {
        // Selasa: Kelas IV
        newEntries[dateStr] = {
          date: dateStr,
          hariTanggal,
          kelas: 'IV',
          jam: '1-4',
          waktu: '08.00 - 10.35',
          uraianMateri: existing?.uraianMateri || 'Bab 2 Teladan Mulia Asmaulhusna',
          sumberBelajar: existing?.sumberBelajar || 'Buku PAI & Budi Pekerti Kurikulum Merdeka',
          keterangan: existing?.keterangan || 'Hadir / KBM Efektif',
          isHoliday: existing?.isHoliday || false,
        };
        filledCount++;
      } else if (dayOfWeek === 3) {
        // Rabu: Kelas III
        newEntries[dateStr] = {
          date: dateStr,
          hariTanggal,
          kelas: 'III',
          jam: '1-4',
          waktu: '08.00 - 10.35',
          uraianMateri: existing?.uraianMateri || 'Bab II Ayo Mengenal Tuhan Kita',
          sumberBelajar: existing?.sumberBelajar || 'Buku Guru & Siswa PAI | Proyektor',
          keterangan: existing?.keterangan || 'Hadir / KBM Efektif',
          isHoliday: existing?.isHoliday || false,
        };
        filledCount++;
      } else if (dayOfWeek === 4) {
        // Kamis: Kelas I & V
        newEntries[dateStr] = {
          date: dateStr,
          hariTanggal,
          kelas: 'I & V',
          jam: '1-4 / 5-8',
          waktu: '08.00 - 10.35 / 10.35 - 13.45',
          uraianMateri: existing?.uraianMateri || 'Kelas I: BAB 2 Mengenal Rukun Iman\nKelas V: Bab 2 Lebih dekat dengan nama-nama Allah',
          sumberBelajar: existing?.sumberBelajar || 'Buku PAI & Budi Pekerti Kurikulum Merdeka',
          keterangan: existing?.keterangan || 'Hadir / KBM Efektif',
          isHoliday: existing?.isHoliday || false,
        };
        filledCount++;
      } else if (dayOfWeek === 5) {
        // Jumat: Kelas II
        newEntries[dateStr] = {
          date: dateStr,
          hariTanggal,
          kelas: 'II',
          jam: '1-4',
          waktu: '08.00 - 10.35',
          uraianMateri: existing?.uraianMateri || 'Bab 2 Mari Mengenal Allah Swt',
          sumberBelajar: existing?.sumberBelajar || 'Buku PAI & Budi Pekerti Kurikulum Merdeka',
          keterangan: existing?.keterangan || 'Hadir / KBM Efektif',
          isHoliday: existing?.isHoliday || false,
        };
        filledCount++;
      }
    });

    onBatchUpdateJournal(newEntries);
    onShowToast(`Pola jadwal mingguan berhasil digenerate (${filledCount} hari).`, 'success');
  };

  // Helper to get attendance stats for a date and class
  const getAttendanceSummary = (dateStr: string, kelasStr: string) => {
    if (!kelasStr || kelasStr === '-') return null;

    // Resolve matching class objects
    const targetClasses: ClassItem[] = [];
    if (kelasStr.includes('VI') || kelasStr.includes('6')) {
      const c = classes.find(item => item.name.includes('6') || item.name.includes('VI'));
      if (c) targetClasses.push(c);
    }
    if (kelasStr.includes('IV') || kelasStr.includes('4')) {
      const c = classes.find(item => item.name.includes('4') || item.name.includes('IV'));
      if (c) targetClasses.push(c);
    }
    if (kelasStr.includes('III') || kelasStr.includes('3')) {
      const c = classes.find(item => item.name.includes('3') || item.name.includes('III'));
      if (c) targetClasses.push(c);
    }
    if (kelasStr.includes('II') && !kelasStr.includes('III') || kelasStr.includes('2')) {
      const c = classes.find(item => item.name.includes('2') || item.name.includes('II'));
      if (c) targetClasses.push(c);
    }
    if (kelasStr.includes('I') && !kelasStr.includes('II') && !kelasStr.includes('IV') && !kelasStr.includes('VI') || kelasStr.includes('1')) {
      const c = classes.find(item => item.name.includes('1') || item.name.includes('I'));
      if (c) targetClasses.push(c);
    }
    if (kelasStr.includes('V') && !kelasStr.includes('IV') && !kelasStr.includes('VI') || kelasStr.includes('5')) {
      const c = classes.find(item => item.name.includes('5') || item.name.includes('V'));
      if (c) targetClasses.push(c);
    }

    if (targetClasses.length === 0) return null;

    let totalStudents = 0;
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    targetClasses.forEach(c => {
      totalStudents += c.students.length;
      c.students.forEach(st => {
        const key = `${c.name}_${dateStr}_${st}`;
        const s = attendance[key];
        if (s === 'H') hadir++;
        else if (s === 'S') sakit++;
        else if (s === 'I') izin++;
        else if (s === 'A') alpa++;
      });
    });

    const isRecorded = (hadir + sakit + izin + alpa) > 0;
    return { totalStudents, hadir, sakit, izin, alpa, isRecorded };
  };

  // Open edit dialog
  const handleOpenEdit = (dateStr: string) => {
    const existing = journal[dateStr];
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    const dayName = dayNamesIndo[dayOfWeek];
    const hariTanggal = `${dayName}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    if (existing) {
      setEditingEntry({ ...existing });
    } else {
      setEditingEntry({
        date: dateStr,
        hariTanggal,
        kelas: dayOfWeek === 0 || dayOfWeek === 6 ? '-' : 'IV',
        jam: dayOfWeek === 0 || dayOfWeek === 6 ? '-' : '1-4',
        waktu: dayOfWeek === 0 || dayOfWeek === 6 ? '-' : '08.00 - 10.35',
        uraianMateri: '',
        sumberBelajar: 'Buku PAI & Budi Pekerti Kurikulum Merdeka',
        keterangan: dayOfWeek === 0 || dayOfWeek === 6 ? 'Libur Akhir Pekan' : 'Hadir / KBM Efektif',
        isHoliday: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    onUpdateJournalEntry(editingEntry.date, editingEntry);
    setEditModalOpen(false);
    onShowToast(`Jurnal untuk ${editingEntry.hariTanggal} berhasil disimpan.`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'NO,HARI / TANGGAL,KLS,JAM,WAKTU,URAIAN MATERI,SUMBER BELAJAR,KET\n';
    monthDates.forEach((dateStr, idx) => {
      const entry = journal[dateStr];
      const dObj = new Date(dateStr);
      const dayName = dayNamesIndo[dObj.getDay()];
      const hariTanggal = entry?.hariTanggal || `${dayName}, ${dObj.getDate()} ${monthNames[dObj.getMonth()]} ${dObj.getFullYear()}`;
      const kls = entry?.kelas || '-';
      const jam = entry?.jam || '-';
      const waktu = entry?.waktu || '-';
      const materi = (entry?.uraianMateri || '-').replace(/"/g, '""');
      const sumber = (entry?.sumberBelajar || '-').replace(/"/g, '""');
      const ket = (entry?.keterangan || '-').replace(/"/g, '""');

      csv += `${idx + 1},"${hariTanggal}","${kls}","${jam}","${waktu}","${materi}","${sumber}","${ket}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jurnal_Mengajar_${school.teacher.replace(/\s+/g, '_')}_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`File Jurnal (${selectedMonth}) berhasil diekspor ke CSV!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Toolbar - No Print */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Jurnal Mengajar Guru PAI & Budi Pekerti</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen rekaman pembelajaran harian bulanan terintegrasi data presensi dan siap cetak format PDF Landscape.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="select-bulan-jurnal" className="font-semibold text-xs text-slate-600 whitespace-nowrap">Bulan:</label>
            <input
              id="select-bulan-jurnal"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none tabular-nums"
            />
          </div>

          <button
            onClick={handleAutoFillTemplate}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Isi otomatis seluruh tanggal bulan ini dengan template jadwal mengajar mingguan"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Isi Pola Jadwal Bulanan</span>
          </button>

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
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Jurnal (PDF Landscape)</span>
          </button>
        </div>
      </div>

      {/* Editor & Interactive Grid - No Print */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden no-print">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-sm">
              Daftar Jurnal Pembelajaran: {monthLabel}
            </h4>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium ml-1">
              {daysInMonth} Hari
            </span>
          </div>
          <span className="text-xs text-slate-500 italic">
            Klik tombol Edit pada baris tanggal untuk mengubah uraian materi, jam, atau menandai hari libur.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 w-44">Hari / Tanggal</th>
                <th className="p-3 w-16 text-center">Kelas</th>
                <th className="p-3 w-20 text-center">Jam</th>
                <th className="p-3 w-28 text-center">Waktu</th>
                <th className="p-3 min-w-[200px]">Uraian Materi / TP</th>
                <th className="p-3 min-w-[160px]">Sumber Belajar</th>
                <th className="p-3 min-w-[140px]">Keterangan</th>
                <th className="p-3 w-28 text-center">Presensi</th>
                <th className="p-3 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthDates.map((dateStr, idx) => {
                const entry = journal[dateStr];
                const dObj = new Date(dateStr);
                const dayOfWeek = dObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const dayName = dayNamesIndo[dayOfWeek];
                const formattedDate = `${dayName}, ${dObj.getDate()} ${monthNames[dObj.getMonth()]} ${dObj.getFullYear()}`;

                const kls = entry?.kelas || (isWeekend ? '-' : '-');
                const jam = entry?.jam || (isWeekend ? '-' : '-');
                const waktu = entry?.waktu || (isWeekend ? '-' : '-');
                const materi = entry?.uraianMateri || (isWeekend ? '-' : '-');
                const sumber = entry?.sumberBelajar || (isWeekend ? '-' : '-');
                const ket = entry?.keterangan || (isWeekend ? 'Libur Akhir Pekan' : 'Hadir / KBM Efektif');
                const isHol = entry?.isHoliday ?? isWeekend;

                const attSummary = getAttendanceSummary(dateStr, kls);

                return (
                  <tr
                    key={dateStr}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isHol ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="p-2.5 text-center text-slate-400 font-semibold tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="p-2.5 text-center font-bold text-indigo-700 tabular-nums">
                      {kls}
                    </td>
                    <td className="p-2.5 text-center text-slate-600 font-medium tabular-nums">
                      {jam}
                    </td>
                    <td className="p-2.5 text-center text-slate-600 whitespace-nowrap tabular-nums">
                      {waktu}
                    </td>
                    <td className="p-2.5 text-slate-800 whitespace-pre-line font-medium leading-relaxed">
                      {materi}
                    </td>
                    <td className="p-2.5 text-slate-600 font-medium">
                      {sumber}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isHol
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {ket}
                      </span>
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      {attSummary ? (
                        attSummary.isRecorded ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200"
                            title={`Hadir: ${attSummary.hadir}, Sakit: ${attSummary.sakit}, Izin: ${attSummary.izin}, Alpa: ${attSummary.alpa}`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{attSummary.hadir}/{attSummary.totalStudents} Hadir</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Belum diabsen</span>
                        )
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleOpenEdit(dateStr)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition cursor-pointer"
                        title="Edit jurnal hari ini"
                      >
                        <Edit3 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL LANDSCAPE A4 DOCUMENT - VISIBLE IN PRINT & PREVIEW */}
      {/* ========================================================================= */}
      <div
        id="printJournalArea"
        className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 max-w-6xl mx-auto text-slate-900 font-sans print-journal-mode"
      >
        {/* Header Kop Surat with Dual Logos */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-900">
          {/* Logo Kiri: Pemkab Hulu Sungai Selatan / Custom Upload */}
          <div className="w-20 h-24 flex items-center justify-center shrink-0">
            <img
              src={school.logoKiriJurnal || school.logo || '/logo_hss.svg'}
              alt="Logo Samping Kiri Jurnal"
              className="max-h-20 max-w-20 object-contain"
            />
          </div>

          {/* Judul Dokumen Tengah */}
          <div className="text-center flex-grow px-4">
            <h2 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-slate-900">
              JURNAL MENGAJAR GURU PAI & BUDI PEKERTI
            </h2>
            <h3 className="font-extrabold text-base sm:text-lg tracking-wide uppercase text-slate-900 mt-0.5">
              {school.name}
            </h3>
            <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800 mt-0.5">
              BULAN {monthLabel.toUpperCase()}
            </p>
          </div>

          {/* Logo Kanan: Tut Wuri Handayani / Custom Upload */}
          <div className="w-20 h-24 flex items-center justify-center shrink-0">
            <img
              src={school.logoKananJurnal || '/logo_tutwuri.svg'}
              alt="Logo Samping Kanan Jurnal"
              className="max-h-20 max-w-20 object-contain"
            />
          </div>
        </div>

        {/* Informasi Guru & Satuan Pendidikan */}
        <div className="text-xs font-semibold space-y-1 mb-4 text-slate-900">
          <div className="flex">
            <span className="w-36">Nama Guru</span>
            <span className="mr-2">:</span>
            <span className="font-bold">{school.teacher.toUpperCase()}</span>
          </div>
          <div className="flex">
            <span className="w-36">NI PPPK</span>
            <span className="mr-2">:</span>
            <span>{school.nip.replace(/[^0-9]/g, '') || school.nip}</span>
          </div>
          <div className="flex">
            <span className="w-36">Satuan Pendidikan</span>
            <span className="mr-2">:</span>
            <span>{school.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Tabel Jurnal 8 Kolom Resmi */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse border border-slate-900 text-[11px] leading-tight">
            <thead>
              <tr className="bg-[#dcfce7] text-slate-900 text-center font-bold border-b border-slate-900">
                <th className="border border-slate-900 p-2 w-8">NO</th>
                <th className="border border-slate-900 p-2 w-44">HARI / TANGGAL</th>
                <th className="border border-slate-900 p-2 w-12">KLS</th>
                <th className="border border-slate-900 p-2 w-16">JAM</th>
                <th className="border border-slate-900 p-2 w-36">WAKTU</th>
                <th className="border border-slate-900 p-2 text-left">URAIAN MATERI</th>
                <th className="border border-slate-900 p-2 text-left w-64">SUMBER BELAJAR</th>
                <th className="border border-slate-900 p-2 w-36">KET</th>
              </tr>
            </thead>
            <tbody>
              {monthDates.map((dateStr, idx) => {
                const entry = journal[dateStr];
                const dObj = new Date(dateStr);
                const dayOfWeek = dObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const dayName = dayNamesIndo[dayOfWeek];
                const formattedDate = `${dayName}, ${dObj.getDate()} ${monthNames[dObj.getMonth()]} ${dObj.getFullYear()}`;

                const kls = entry?.kelas || (isWeekend ? '-' : '-');
                const jam = entry?.jam || (isWeekend ? '-' : '-');
                const waktu = entry?.waktu || (isWeekend ? '-' : '-');
                const materi = entry?.uraianMateri || (isWeekend ? '-' : '-');
                const sumber = entry?.sumberBelajar || (isWeekend ? '-' : '-');
                const ket = entry?.keterangan || (isWeekend ? 'Libur Akhir Pekan' : 'Hadir / KBM Efektif');
                const isHol = entry?.isHoliday ?? isWeekend;

                return (
                  <tr
                    key={dateStr}
                    className="border-b border-slate-900 hover:bg-slate-50"
                  >
                    <td className="border border-slate-900 p-1.5 text-center font-medium tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-900 p-1.5 font-medium whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="border border-slate-900 p-1.5 text-center font-bold">
                      {kls}
                    </td>
                    <td className="border border-slate-900 p-1.5 text-center whitespace-nowrap">
                      {jam}
                    </td>
                    <td className="border border-slate-900 p-1.5 text-center whitespace-nowrap">
                      {waktu}
                    </td>
                    <td className="border border-slate-900 p-1.5 font-medium whitespace-pre-line leading-relaxed">
                      {materi}
                    </td>
                    <td className="border border-slate-900 p-1.5 leading-relaxed">
                      {sumber}
                    </td>
                    <td className="border border-slate-900 p-1.5 text-center font-medium">
                      {ket}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Resmi - Landscape Footer */}
        <div className="flex justify-between items-start text-xs pt-4 page-break-inside-avoid">
          {/* Mengetahui Kepala Sekolah with Signature & Stamp */}
          <div className="text-center min-w-[280px]">
            <p className="leading-snug">
              Mengetahui,<br />
              Kepala Sekolah SDN 5 Kandangan Barat
            </p>

            {/* Signature & Stamp container */}
            <div className="relative h-20 my-1 flex items-center justify-center">
              {/* Stempel Sekolah (di sebelah kiri ttd kepala sekolah, semi transparan) */}
              {school.stempelSekolah && (
                <img
                  src={school.stempelSekolah}
                  alt="Stempel Sekolah"
                  className="absolute left-3 -top-1 h-20 w-20 object-contain opacity-90 mix-blend-multiply pointer-events-none select-none z-20"
                />
              )}
              {/* Tanda Tangan Kepala Sekolah */}
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

          {/* Guru Mapel PAI & Budi Pekerti with Signature */}
          <div className="text-center min-w-[280px]">
            <p className="leading-snug">
              {school.place || 'Kandangan'}, {lastDateFormatted}<br />
              Guru Mapel PAI & Budi Pekerti
            </p>

            {/* Signature container */}
            <div className="h-20 my-1 flex items-center justify-center">
              {school.ttdGuru ? (
                <img
                  src={school.ttdGuru}
                  alt="TTD Guru PABP"
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

      {/* ========================================================================= */}
      {/* EDIT ENTRY DIALOG MODAL */}
      {/* ========================================================================= */}
      {editModalOpen && editingEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-indigo-700 text-white">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-200" />
                <h4 className="font-bold text-base">
                  Edit Jurnal: {editingEntry.hariTanggal}
                </h4>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Kelas Mengajar:</label>
                  <input
                    type="text"
                    value={editingEntry.kelas}
                    onChange={(e) => setEditingEntry({ ...editingEntry, kelas: e.target.value })}
                    placeholder="Contoh: IV atau I & V atau -"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Jam Pelajaran:</label>
                  <input
                    type="text"
                    value={editingEntry.jam}
                    onChange={(e) => setEditingEntry({ ...editingEntry, jam: e.target.value })}
                    placeholder="Contoh: 1-4 atau 1-4 / 5-8"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Rentang Waktu:</label>
                <input
                  type="text"
                  value={editingEntry.waktu}
                  onChange={(e) => setEditingEntry({ ...editingEntry, waktu: e.target.value })}
                  placeholder="Contoh: 08.00 - 10.35"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Uraian Materi / TP:</label>
                <textarea
                  rows={3}
                  value={editingEntry.uraianMateri}
                  onChange={(e) => setEditingEntry({ ...editingEntry, uraianMateri: e.target.value })}
                  placeholder="Tulis uraian materi atau tujuan pembelajaran yang diajarkan..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sumber Belajar:</label>
                <input
                  type="text"
                  value={editingEntry.sumberBelajar}
                  onChange={(e) => setEditingEntry({ ...editingEntry, sumberBelajar: e.target.value })}
                  placeholder="Buku PAI & Budi Pekerti Kurikulum Merdeka, Proyektor, dsb."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Keterangan:</label>
                <input
                  type="text"
                  value={editingEntry.keterangan}
                  onChange={(e) => setEditingEntry({ ...editingEntry, keterangan: e.target.value })}
                  placeholder="Hadir / KBM Efektif, Libur Akhir Pekan, Maulid Nabi, dsb."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick toggle holiday */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Tandai sebagai Hari Libur / Acara Khusus:</span>
                <input
                  type="checkbox"
                  checked={!!editingEntry.isHoliday}
                  onChange={(e) => setEditingEntry({ ...editingEntry, isHoliday: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Simpan Jurnal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
