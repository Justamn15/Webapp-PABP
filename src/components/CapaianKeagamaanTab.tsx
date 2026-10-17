import React, { useState, useMemo } from 'react';
import {
  SchoolInfo,
  ClassItem,
  StudentBTAIbadah,
  IbadahFluency,
} from '../types.ts';
import { StudentBTAIbadahModal } from './StudentBTAIbadahModal.tsx';
import { StudentRubrikDetailModal } from './StudentRubrikDetailModal.tsx';
import {
  RUKUN_SHALAT_LIST,
  RUKUN_WUDHU_LIST,
  recomputeStudentIbadah,
} from '../data/ibadahRubrik.ts';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Edit3,
  Printer,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Award,
  ChevronRight,
  BookmarkCheck,
  Layers,
  FileText,
  ChevronDown,
  Check,
  History,
} from 'lucide-react';

interface CapaianKeagamaanTabProps {
  school: SchoolInfo;
  classes: ClassItem[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  btaIbadah: Record<string, StudentBTAIbadah>;
  onUpdateBTAIbadah: (data: StudentBTAIbadah) => void;
  onBatchUpdateBTAIbadah?: (list: StudentBTAIbadah[]) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
  onViewStudentHistory?: (studentName: string, className: string) => void;
  isPeriodLocked?: boolean;
}

export const CapaianKeagamaanTab: React.FC<CapaianKeagamaanTabProps> = ({
  school,
  classes,
  selectedClass,
  onSelectClass,
  btaIbadah,
  onUpdateBTAIbadah,
  onShowToast,
  onOpenSettings,
  onViewStudentHistory,
  isPeriodLocked = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReading, setFilterReading] = useState<string>('all');
  const [filterFluency, setFilterFluency] = useState<string>('all');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [printClassScope, setPrintClassScope] = useState<'all' | 'single'>('all');
  const [printFormatMode, setPrintFormatMode] = useState<'ringkasan' | 'rubrik_lengkap'>('ringkasan');
  const [separatePagePerClass, setSeparatePagePerClass] = useState<boolean>(true);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Modals State
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [viewingDetailStudent, setViewingDetailStudent] = useState<string | null>(null);

  // Active class students
  const currentClassObj = useMemo(() => {
    return classes.find((c) => c.name === selectedClass) || classes[0];
  }, [classes, selectedClass]);

  const studentList = useMemo(() => {
    return currentClassObj ? currentClassObj.students : [];
  }, [currentClassObj]);

  // Statistics calculation for the active class
  const stats = useMemo(() => {
    const total = studentList.length;
    let countIqra = 0;
    let countQuran = 0;
    let countJuzAmma = 0;
    let countNotSetReading = 0;

    let countWudhuLancar = 0;
    let countShalatLancar = 0;
    let sumWudhuScore = 0;
    let sumWudhuItem = 0;
    let countWudhuScored = 0;
    let sumShalatScore = 0;
    let sumShalatItem = 0;
    let countShalatScored = 0;

    studentList.forEach((s) => {
      const key = `${selectedClass}_${s}`;
      const rawRec = btaIbadah[key];
      if (rawRec) {
        const rec = recomputeStudentIbadah(rawRec);
        if (rec.readingType === 'Iqra') countIqra++;
        else if (rec.readingType === "Al-Qur'an") countQuran++;
        else if (rec.readingType === 'Juz Amma') countJuzAmma++;

        if (rec.wudhuStatus === 'Lancar' || rec.wudhuStatus === 'Sangat Baik') {
          countWudhuLancar++;
        }
        if (rec.shalatStatus === 'Lancar' || rec.shalatStatus === 'Sangat Baik') {
          countShalatLancar++;
        }

        if (rec.wudhuScore !== undefined) {
          sumWudhuScore += rec.wudhuScore;
          sumWudhuItem += rec.wudhuAverage ?? Number(((rec.wudhuScore / 100) * 4).toFixed(2));
          countWudhuScored++;
        }
        if (rec.shalatScore !== undefined) {
          sumShalatScore += rec.shalatScore;
          sumShalatItem += rec.shalatAverage ?? Number(((rec.shalatScore / 100) * 4).toFixed(2));
          countShalatScored++;
        }
      } else {
        countNotSetReading++;
      }
    });

    const avgWudhu = countWudhuScored > 0 ? Math.round(sumWudhuScore / countWudhuScored) : 0;
    const avgWudhuItem = countWudhuScored > 0 ? Number((sumWudhuItem / countWudhuScored).toFixed(2)) : 0;
    const avgShalat = countShalatScored > 0 ? Math.round(sumShalatScore / countShalatScored) : 0;
    const avgShalatItem = countShalatScored > 0 ? Number((sumShalatItem / countShalatScored).toFixed(2)) : 0;

    return {
      total,
      countIqra,
      countQuran,
      countJuzAmma,
      countNotSetReading,
      countWudhuLancar,
      countShalatLancar,
      avgWudhu,
      avgWudhuItem,
      avgShalat,
      avgShalatItem,
      pctQuran: total ? Math.round(((countQuran + countJuzAmma) / total) * 100) : 0,
      pctWudhu: total ? Math.round((countWudhuLancar / total) * 100) : 0,
      pctShalat: total ? Math.round((countShalatLancar / total) * 100) : 0,
    };
  }, [studentList, selectedClass, btaIbadah]);

  // Helper untuk menghitung statistik per kelas (digunakan saat mencetak per kelas / semua kelas)
  const getClassStats = (className: string, students: string[]) => {
    const total = students.length;
    let countIqra = 0;
    let countQuran = 0;
    let countJuzAmma = 0;
    let countWudhuLancar = 0;
    let countShalatLancar = 0;
    let sumWudhuScore = 0;
    let sumWudhuItem = 0;
    let countWudhuScored = 0;
    let sumShalatScore = 0;
    let sumShalatItem = 0;
    let countShalatScored = 0;

    students.forEach((s) => {
      const key = `${className}_${s}`;
      const rawRec = btaIbadah[key];
      if (rawRec) {
        const rec = recomputeStudentIbadah(rawRec);
        if (rec.readingType === 'Iqra') countIqra++;
        else if (rec.readingType === "Al-Qur'an") countQuran++;
        else if (rec.readingType === 'Juz Amma') countJuzAmma++;

        if (rec.wudhuStatus === 'Lancar' || rec.wudhuStatus === 'Sangat Baik') {
          countWudhuLancar++;
        }
        if (rec.shalatStatus === 'Lancar' || rec.shalatStatus === 'Sangat Baik') {
          countShalatLancar++;
        }

        if (rec.wudhuScore !== undefined) {
          sumWudhuScore += rec.wudhuScore;
          sumWudhuItem += rec.wudhuAverage ?? Number(((rec.wudhuScore / 100) * 4).toFixed(2));
          countWudhuScored++;
        }
        if (rec.shalatScore !== undefined) {
          sumShalatScore += rec.shalatScore;
          sumShalatItem += rec.shalatAverage ?? Number(((rec.shalatScore / 100) * 4).toFixed(2));
          countShalatScored++;
        }
      }
    });

    const avgWudhu = countWudhuScored > 0 ? Math.round(sumWudhuScore / countWudhuScored) : 0;
    const avgWudhuItem = countWudhuScored > 0 ? Number((sumWudhuItem / countWudhuScored).toFixed(2)) : 0;
    const avgShalat = countShalatScored > 0 ? Math.round(sumShalatScore / countShalatScored) : 0;
    const avgShalatItem = countShalatScored > 0 ? Number((sumShalatItem / countShalatScored).toFixed(2)) : 0;

    return {
      total,
      countIqra,
      countQuran,
      countJuzAmma,
      countWudhuLancar,
      countShalatLancar,
      avgWudhu,
      avgWudhuItem,
      avgShalat,
      avgShalatItem,
      pctQuran: total ? Math.round(((countQuran + countJuzAmma) / total) * 100) : 0,
      pctWudhu: total ? Math.round((countWudhuLancar / total) * 100) : 0,
      pctShalat: total ? Math.round((countShalatLancar / total) * 100) : 0,
    };
  };

  // Daftar kelas yang akan dicetak (sesuai cakupan single atau all kelas 1-6)
  const classesToPrint = useMemo(() => {
    if (printClassScope === 'all') {
      return classes;
    }
    const cur = classes.find((c) => c.name === selectedClass) || classes[0];
    return cur ? [cur] : [];
  }, [classes, selectedClass, printClassScope]);

  // Statistik gabungan seluruh sekolah (Kelas 1 s/d Kelas 6)
  const overallStats = useMemo(() => {
    let totalStudents = 0;
    let countWudhuLancar = 0;
    let countShalatLancar = 0;
    let sumWudhuScore = 0;
    let sumWudhuItem = 0;
    let countWudhuScored = 0;
    let sumShalatScore = 0;
    let sumShalatItem = 0;
    let countShalatScored = 0;

    classes.forEach((cls) => {
      cls.students.forEach((s) => {
        totalStudents++;
        const key = `${cls.name}_${s}`;
        const rawRec = btaIbadah[key];
        if (rawRec) {
          const rec = recomputeStudentIbadah(rawRec);
          if (rec.wudhuStatus === 'Lancar' || rec.wudhuStatus === 'Sangat Baik') countWudhuLancar++;
          if (rec.shalatStatus === 'Lancar' || rec.shalatStatus === 'Sangat Baik') countShalatLancar++;
          if (rec.wudhuScore !== undefined) {
            sumWudhuScore += rec.wudhuScore;
            sumWudhuItem += rec.wudhuAverage ?? Number(((rec.wudhuScore / 100) * 4).toFixed(2));
            countWudhuScored++;
          }
          if (rec.shalatScore !== undefined) {
            sumShalatScore += rec.shalatScore;
            sumShalatItem += rec.shalatAverage ?? Number(((rec.shalatScore / 100) * 4).toFixed(2));
            countShalatScored++;
          }
        }
      });
    });

    return {
      totalStudents,
      avgWudhu: countWudhuScored > 0 ? Math.round(sumWudhuScore / countWudhuScored) : 0,
      avgWudhuItem: countWudhuScored > 0 ? Number((sumWudhuItem / countWudhuScored).toFixed(2)) : 0,
      avgShalat: countShalatScored > 0 ? Math.round(sumShalatScore / countShalatScored) : 0,
      avgShalatItem: countShalatScored > 0 ? Number((sumShalatItem / countShalatScored).toFixed(2)) : 0,
      pctWudhu: totalStudents ? Math.round((countWudhuLancar / totalStudents) * 100) : 0,
      pctShalat: totalStudents ? Math.round((countShalatLancar / totalStudents) * 100) : 0,
    };
  }, [classes, btaIbadah]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return studentList.filter((student) => {
      const key = `${selectedClass}_${student}`;
      const rawRec = btaIbadah[key];
      const rec = rawRec ? recomputeStudentIbadah(rawRec) : undefined;

      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!student.toLowerCase().includes(q)) return false;
      }

      // Reading filter
      if (filterReading !== 'all') {
        if (filterReading === 'notset') {
          if (rec) return false;
        } else if (!rec || rec.readingType !== filterReading) {
          return false;
        }
      }

      // Fluency filter
      if (filterFluency !== 'all') {
        if (!rec) return false;
        if (filterFluency === 'lancar') {
          if (
            !(
              (rec.wudhuStatus === 'Lancar' || rec.wudhuStatus === 'Sangat Baik') &&
              (rec.shalatStatus === 'Lancar' || rec.shalatStatus === 'Sangat Baik')
            )
          ) {
            return false;
          }
        } else if (filterFluency === 'perlu_bimbingan') {
          if (
            !(
              rec.wudhuStatus === 'Belum Bisa' ||
              rec.wudhuStatus === 'Kurang Lancar' ||
              rec.shalatStatus === 'Belum Bisa' ||
              rec.shalatStatus === 'Kurang Lancar'
            )
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [studentList, selectedClass, btaIbadah, searchQuery, filterReading, filterFluency]);

  // Handle edit & next student index
  const editingStudentIndex = useMemo(() => {
    if (!editingStudent) return -1;
    return studentList.indexOf(editingStudent);
  }, [editingStudent, studentList]);

  const hasNextStudent = editingStudentIndex !== -1 && editingStudentIndex < studentList.length - 1;
  const nextStudentName = hasNextStudent ? studentList[editingStudentIndex + 1] : undefined;

  const handleOpenEdit = (studentName: string) => {
    setEditingStudent(studentName);
  };

  const handleOpenDetail = (studentName: string) => {
    setViewingDetailStudent(studentName);
  };

  const handleSaveModal = (data: StudentBTAIbadah) => {
    onUpdateBTAIbadah(data);
    onShowToast(`Capaian ${data.studentName} berhasil diperbarui`, 'success');
    setEditingStudent(null);
  };

  const handleSaveAndNext = (data: StudentBTAIbadah) => {
    onUpdateBTAIbadah(data);
    onShowToast(`Capaian ${data.studentName} tersimpan`, 'success');
    if (hasNextStudent && nextStudentName) {
      setEditingStudent(nextStudentName);
    } else {
      setEditingStudent(null);
    }
  };

  // Export to CSV (Mendukung kelas aktif atau keseluruhan kelas 1 s/d kelas 6)
  const handleExportCSV = (scope: 'single' | 'all' = 'single') => {
    const headers = [
      'No',
      'Kelas',
      'Nama Siswa',
      'Jenis Bacaan',
      'Batas Bacaan',
      'Catatan Membaca / Tajwid',
      'Total Skor Wudhu',
      'Rerata Butir Wudhu (1-4)',
      'Nilai Wudhu (0-100)',
      'Predikat Wudhu',
      'Catatan Wudhu',
      'Total Skor Shalat (Max 52)',
      'Rerata Butir Shalat (1-4)',
      'Nilai Shalat (0-100)',
      'Predikat Shalat',
      'Catatan Shalat',
      'Tanggal Pembaruan',
    ];

    const targetClasses = scope === 'all' ? classes : [currentClassObj].filter(Boolean);
    let rowIdx = 1;
    const rows: string[] = [];

    targetClasses.forEach((cls) => {
      cls.students.forEach((student) => {
        const key = `${cls.name}_${student}`;
        const rawRec = btaIbadah[key];
        const rec = rawRec ? recomputeStudentIbadah(rawRec) : undefined;
        let readingDesc = '-';
        if (rec) {
          if (rec.readingType === 'Iqra') {
            readingDesc = `Iqra Jilid ${rec.iqraJilid || 1} ${rec.iqraHalaman || ''}`.trim();
          } else if (rec.readingType) {
            readingDesc = `${rec.readingType} Surah ${rec.surahName || ''} (${rec.ayat || ''})`.trim();
          }
        }

        rows.push([
          rowIdx++,
          `"${cls.name}"`,
          `"${student}"`,
          `"${rec?.readingType || 'Belum diisi'}"`,
          `"${readingDesc}"`,
          `"${rec?.readingNotes || '-'}"`,
          rec?.wudhuDetails?.totalScore ?? '-',
          rec?.wudhuAverage !== undefined
            ? rec.wudhuAverage.toFixed(2)
            : (rec?.wudhuScore !== undefined ? ((rec.wudhuScore / 100) * 4).toFixed(2) : '-'),
          rec?.wudhuScore !== undefined ? rec.wudhuScore : '-',
          `"${rec?.wudhuStatus || '-'}"`,
          `"${rec?.wudhuNotes || '-'}"`,
          rec?.shalatDetails?.totalScore ?? '-',
          rec?.shalatAverage !== undefined
            ? rec.shalatAverage.toFixed(2)
            : (rec?.shalatScore !== undefined ? ((rec.shalatScore / 100) * 4).toFixed(2) : '-'),
          rec?.shalatScore !== undefined ? rec.shalatScore : '-',
          `"${rec?.shalatStatus || '-'}"`,
          `"${rec?.shalatNotes || '-'}"`,
          `"${rec?.lastUpdated || '-'}"`,
        ].join(','));
      });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filenameLabel = scope === 'all' ? 'Semua_Kelas_1_sampai_6' : selectedClass.replace(/\s+/g, '_');
    link.setAttribute(
      'download',
      `Capaian_BTA_Ibadah_Rubrik_${filenameLabel}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(
      scope === 'all'
        ? `Data capaian seluruh kelas (Kelas 1 - Kelas 6) berhasil diekspor ke CSV`
        : `Data capaian ${selectedClass} berhasil diekspor ke CSV`,
      'success'
    );
  };

  // Buka dialog / format pratinjau cetak
  const handleOpenPrintPreview = (scope: 'single' | 'all' = 'all') => {
    setPrintClassScope(scope);
    setIsPrintPreview(true);
    // Smooth scroll ke dokumen cetak
    setTimeout(() => {
      const el = document.getElementById('printAreaKeagamaan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Memicu print window langsung dengan style cetak resmi
  const handlePrintNow = (scope?: 'single' | 'all') => {
    if (scope) {
      setPrintClassScope(scope);
    }
    setIsPrintPreview(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const getFluencyBadge = (status?: IbadahFluency, score?: number, average?: number) => {
    if (!status && score === undefined) {
      return (
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          Belum dinilai
        </span>
      );
    }

    const scoreTag = score !== undefined ? (
      <span className="font-extrabold text-xs px-1.5 py-0.5 rounded bg-black/10">
        {score}
      </span>
    ) : null;

    const avgTag = average !== undefined ? (
      <span className="text-[10px] opacity-80 font-normal">
        ({average.toFixed(2)})
      </span>
    ) : null;

    switch (status) {
      case 'Sangat Baik':
        return (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
            {scoreTag}
            <span>Sangat Baik</span>
            {avgTag}
          </span>
        );
      case 'Lancar':
        return (
          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
            {scoreTag}
            <span>Lancar</span>
            {avgTag}
          </span>
        );
      case 'Cukup':
        return (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
            {scoreTag}
            <span>Cukup</span>
            {avgTag}
          </span>
        );
      case 'Kurang Lancar':
        return (
          <span className="text-[11px] font-semibold text-orange-800 bg-orange-50 border border-orange-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
            {scoreTag}
            <span>Kurang Lancar</span>
            {avgTag}
          </span>
        );
      case 'Belum Bisa':
        return (
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
            {scoreTag}
            <span>Belum Bisa</span>
            {avgTag}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const currentDateFormatted = useMemo(() => {
    const now = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Class Selector Tabs & Toolbar */}
      <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 no-print flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {classes.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectClass(c.name)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                selectedClass === c.name
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Upload Logo Jurnal (Kiri & Kanan), TTD Guru & Kepala Sekolah, dan Stempel"
            >
              <Upload className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Logo, TTD & Stempel</span>
            </button>
          )}

          {/* Tombol Cetak Laporan Keagamaan Utama */}
          <div className="relative">
            <div className="inline-flex rounded-xl shadow-xs border border-emerald-600 bg-emerald-700 overflow-hidden">
              <button
                onClick={() => handleOpenPrintPreview(printClassScope)}
                className="hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Cetak Laporan Keagamaan Resmi"
              >
                <Printer className="w-4 h-4 text-emerald-100" />
                <span>{isPrintPreview ? 'Dokumen Cetak Aktif' : 'Cetak Laporan Keagamaan'}</span>
              </button>
              <button
                onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                className="hover:bg-emerald-800 text-emerald-100 px-2 py-1.5 border-l border-emerald-600/60 transition cursor-pointer"
                title="Pilih Cakupan Cetak"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Pilihan Cakupan Cetak */}
            {isPrintMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 text-xs font-sans animate-in fade-in slide-in-from-top-1"
                onClick={() => setIsPrintMenuOpen(false)}
              >
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Pilih Cakupan Cetak
                </div>
                <button
                  onClick={() => handleOpenPrintPreview('all')}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 flex items-center justify-between font-medium cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Semua Kelas (1 s/d 6)</div>
                      <div className="text-[10px] text-slate-500">Cetak rekap menyeluruh {classes.length} kelas</div>
                    </div>
                  </div>
                  {printClassScope === 'all' && isPrintPreview && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
                <button
                  onClick={() => handleOpenPrintPreview('single')}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 flex items-center justify-between font-medium cursor-pointer transition border-t border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Hanya {selectedClass}</div>
                      <div className="text-[10px] text-slate-500">Cetak rekap kelas yang aktif</div>
                    </div>
                  </div>
                  {printClassScope === 'single' && isPrintPreview && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1.5 px-2">
                  <button
                    onClick={() => handlePrintNow('all')}
                    className="w-full text-center py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cetak Langsung (Kelas 1-6)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 no-print">
        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Siswa</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">{stats.total}</span>
            <span className="text-[11px] font-bold text-slate-400">{selectedClass}</span>
          </div>
        </div>

        {/* Membaca Al-Qur'an */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold">Membaca Al-Qur'an</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-900">
              {stats.countQuran + stats.countJuzAmma}
            </span>
            <span className="text-xs font-bold text-emerald-700">{stats.pctQuran}%</span>
          </div>
        </div>

        {/* Membaca Iqra */}
        <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-800">
            <span className="text-xs font-bold">Tahap Iqra (1-6)</span>
            <BookmarkCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-900">{stats.countIqra}</span>
            <span className="text-xs font-medium text-teal-700">siswa</span>
          </div>
        </div>

        {/* Rerata Nilai Wudhu */}
        <div className="bg-cyan-50/70 p-4 rounded-2xl border border-cyan-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-900">
            <span className="text-xs font-bold">Rerata Nilai Wudhu</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-cyan-950">
                {stats.avgWudhu} <span className="text-xs font-normal text-cyan-700">/ 100</span>
              </span>
              <div className="text-[11px] text-cyan-800 font-semibold mt-0.5">
                Rerata Butir: <span className="font-extrabold text-cyan-950">{stats.avgWudhuItem}</span> / 4.00
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-700">{stats.pctWudhu}% Lancar</span>
          </div>
        </div>

        {/* Rerata Nilai Shalat */}
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/80 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-indigo-950">
            <span className="text-xs font-bold">Rerata Nilai Shalat</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-indigo-950">
                {stats.avgShalat} <span className="text-xs font-normal text-indigo-700">/ 100</span>
              </span>
              <div className="text-[11px] text-indigo-800 font-semibold mt-0.5">
                Rerata Butir: <span className="font-extrabold text-indigo-950">{stats.avgShalatItem}</span> / 4.00
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700">{stats.pctShalat}% Lancar</span>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterReading}
              onChange={(e) => setFilterReading(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Bacaan</option>
              <option value="Iqra">Iqra (1 - 6)</option>
              <option value="Al-Qur'an">Al-Qur'an</option>
              <option value="Juz Amma">Juz 'Amma</option>
              <option value="notset">Belum Tercatat</option>
            </select>
          </div>

          <select
            value={filterFluency}
            onChange={(e) => setFilterFluency(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Predikat</option>
            <option value="lancar">Lancar / Sangat Baik</option>
            <option value="perlu_bimbingan">Perlu Bimbingan (Kurang/Belum)</option>
          </select>

          {/* Dropdown Ekspor CSV */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
              title="Download Rekap Lengkap CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Rubrik</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {isExportMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-xs font-sans"
                onClick={() => setIsExportMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pilih Ekspor CSV
                </div>
                <button
                  onClick={() => handleExportCSV('single')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Hanya {selectedClass}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Kelas Aktif</span>
                </button>
                <button
                  onClick={() => handleExportCSV('all')}
                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between cursor-pointer border-t border-slate-100"
                >
                  <span>Semua Kelas (Kelas 1 - 6)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">Lengkap</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleOpenPrintPreview(printClassScope)}
            className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Cetak Laporan Keagamaan (PDF / Kertas)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan Keagamaan</span>
          </button>
        </div>
      </div>

      {/* Main Student Records Table (Interactive View) */}
      {!isPrintPreview && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Batas Membaca (BTA)</th>
                  <th className="py-3 px-4">Praktik Wudhu (Skor 1-4)</th>
                  <th className="py-3 px-4">Praktik Shalat (13 Rukun)</th>
                  <th className="py-3 px-3 text-center">Pembaruan</th>
                  <th className="py-3 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const key = `${selectedClass}_${student}`;
                    const rawRec = btaIbadah[key];
                    const rec = rawRec ? recomputeStudentIbadah(rawRec) : undefined;

                    return (
                      <tr
                        key={student}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => handleOpenEdit(student)}
                      >
                        <td className="py-3 px-3 text-center font-semibold text-slate-400 text-xs">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {student}
                          </div>
                          <div className="text-[11px] text-slate-400">{selectedClass}</div>
                        </td>

                        {/* Batas Membaca */}
                        <td className="py-3 px-4">
                          {rec ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                    rec.readingType === "Al-Qur'an"
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : rec.readingType === 'Juz Amma'
                                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {rec.readingType}
                                </span>
                                <span className="font-bold text-slate-800 text-xs">
                                  {rec.readingType === 'Iqra'
                                    ? `Jilid ${rec.iqraJilid || 1} ${rec.iqraHalaman ? `• ${rec.iqraHalaman}` : ''}`
                                    : `Surah ${rec.surahName || ''} ${rec.ayat ? `(${rec.ayat})` : ''}`}
                                </span>
                              </div>
                              {rec.readingNotes && (
                                <p className="text-[11px] text-slate-500 italic line-clamp-1">
                                  "{rec.readingNotes}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Klik untuk isi capaian...
                            </span>
                          )}
                        </td>

                        {/* Praktik Wudhu */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getFluencyBadge(rec?.wudhuStatus, rec?.wudhuScore, rec?.wudhuAverage)}
                              {rec?.wudhuDetails && (
                                <span className="text-[10px] text-cyan-800 font-semibold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200" title={`Rerata: ${rec.wudhuAverage?.toFixed(2) || '-'} / 4.00`}>
                                  Skor {rec.wudhuDetails.totalScore}/{rec.wudhuDetails.maxScore}
                                </span>
                              )}
                            </div>
                            {rec?.wudhuNotes && (
                              <p className="text-[11px] text-slate-500 italic line-clamp-1">
                                {rec.wudhuNotes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Praktik Shalat */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getFluencyBadge(rec?.shalatStatus, rec?.shalatScore, rec?.shalatAverage)}
                              {rec?.shalatDetails && (
                                <span className="text-[10px] text-indigo-800 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200" title={`Rerata: ${rec.shalatAverage?.toFixed(2) || '-'} / 4.00`}>
                                  Skor {rec.shalatDetails.totalScore}/52
                                </span>
                              )}
                            </div>
                            {rec?.shalatNotes && (
                              <p className="text-[11px] text-slate-500 italic line-clamp-1">
                                {rec.shalatNotes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Tanggal Pembaruan */}
                        <td className="py-3 px-3 text-center text-xs text-slate-500 whitespace-nowrap">
                          {rec?.lastUpdated ? (
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{rec.lastUpdated}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Aksi Button */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {onViewStudentHistory && (
                              <button
                                onClick={() => onViewStudentHistory(student, selectedClass)}
                                className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition cursor-pointer"
                                title="Lihat Rekam Jejak Perkembangan Siswa Lintas Semester"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenDetail(student)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition cursor-pointer"
                              title="Lihat Rincian Rukun & Skor Rubrik"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (isPeriodLocked) {
                                  onShowToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
                                }
                                handleOpenEdit(student);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                              title={isPeriodLocked ? "Periode Terkunci (Arsip)" : "Input / Edit Skor Rubrik"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Menampilkan {filteredStudents.length} dari {studentList.length} siswa di {selectedClass}
            </span>
            <span className="text-[11px] text-slate-500">
              *Klik icon mata (<Eye className="w-3 h-3 inline text-indigo-600" />) untuk melihat rincian 13 rukun shalat & 18 butir wudhu per siswa.
            </span>
          </div>
        </div>
      )}

      {/* Official Print Layout (Always rendered, styled for clean print / preview) */}
      <div
        id="printAreaKeagamaan"
        className={`bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 max-w-5xl mx-auto text-slate-900 font-serif transition-all ${
          !isPrintPreview ? 'hidden print:block' : 'block'
        }`}
      >
        {/* Floating / Sticky Control Bar (No Print) */}
        <div className="no-print mb-6 p-4 bg-slate-50 border border-slate-300 rounded-2xl font-sans text-xs space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Pengaturan Dokumen Cetak Laporan Keagamaan</h4>
                <p className="text-[11px] text-slate-500">
                  Pratinjau format resmi ber-kop sekolah, tanda tangan, stempel, dan rincian skor ibadah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleExportCSV(printClassScope)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 flex items-center gap-1.5 cursor-pointer transition"
                title="Ekspor CSV Sesuai Cakupan Terpilih"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh CSV ({printClassScope === 'all' ? 'Semua Kelas' : selectedClass})</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang (Print / PDF)</span>
              </button>
              <button
                onClick={() => setIsPrintPreview(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* 1. Cakupan Kelas */}
            <div>
              <span className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">
                1. Cakupan Kelas:
              </span>
              <div className="flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setPrintClassScope('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    printClassScope === 'all'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Semua Kelas (1 s/d 6)</span>
                </button>
                <button
                  onClick={() => setPrintClassScope('single')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    printClassScope === 'single'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Hanya {selectedClass}</span>
                </button>
              </div>
            </div>

            {/* 2. Format Tampilan Tabel */}
            <div>
              <span className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">
                2. Format Tabel:
              </span>
              <div className="flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setPrintFormatMode('ringkasan')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                    printFormatMode === 'ringkasan'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rekap Capaian & Nilai
                </button>
                <button
                  onClick={() => setPrintFormatMode('rubrik_lengkap')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                    printFormatMode === 'rubrik_lengkap'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rincian Rubrik Butir
                </button>
              </div>
            </div>

            {/* 3. Pengaturan Halaman */}
            <div>
              <span className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">
                3. Tata Letak Cetak:
              </span>
              {printClassScope === 'all' ? (
                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer shadow-2xs select-none">
                  <input
                    type="checkbox"
                    checked={separatePagePerClass}
                    onChange={(e) => setSeparatePagePerClass(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Pisahkan Halaman Tiap Kelas (A4 Per Kelas)
                  </span>
                </label>
              ) : (
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Siap cetak dokumen lembar {selectedClass}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ISI DOKUMEN CETAK RESMI --- */}
        {(() => {
          // 1. Kop Surat Resmi
          const renderKopSurat = () => (
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-5 flex items-center justify-between gap-4 font-sans">
              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                {school.logoKiriJurnal || school.logo ? (
                  <img
                    src={school.logoKiriJurnal || school.logo}
                    alt="Logo Sekolah Kiri"
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

              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                <img
                  src={school.logoKananJurnal || '/logo_tutwuri.svg'}
                  alt="Logo Tut Wuri / Kanan"
                  className="max-h-20 max-w-20 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          );

          // 2. Legenda Rubrik & Formula Konversi
          const renderRubricLegend = () => (
            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[10px] text-slate-700 font-sans print-page-break-inside-avoid break-inside-avoid">
              <div className="font-bold text-slate-900 mb-0.5">Panduan & Keterangan Konversi Nilai Ibadah:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                <div>&bull; <strong>Skala Skor Butir:</strong> 4 = Sangat Baik (Fasih/Mandiri) &bull; 3 = Baik &bull; 2 = Cukup &bull; 1 = Perlu Bimbingan</div>
                <div>&bull; <strong>Formula Konversi:</strong> Nilai Akhir (0-100) = (Total Skor Diperoleh / Total Skor Maksimal) &times; 100</div>
                <div>&bull; <strong>Predikat:</strong> Sangat Baik (3.50-4.00 / 88-100) &bull; Lancar (3.00-3.49 / 75-87) &bull; Cukup (2.40-2.99 / 60-74)</div>
                <div>&bull; <strong>Bimbingan:</strong> Kurang Lancar (1.60-2.39 / 40-59) &bull; Belum Bisa (&lt;1.60 / &lt;40)</div>
              </div>
            </div>
          );

          // 3. Tanda Tangan & Stempel Resmi
          const renderSignatures = () => (
            <div className="grid grid-cols-2 gap-8 text-xs font-sans mt-8 pt-4 print-page-break-inside-avoid break-inside-avoid">
              <div className="text-center relative">
                <p className="font-medium text-slate-800">Mengetahui,</p>
                <p className="font-semibold text-slate-900">Kepala Sekolah</p>
                <div className="h-24 flex items-center justify-center my-1 relative">
                  {school.ttdKepalaSekolah ? (
                    <img
                      src={school.ttdKepalaSekolah}
                      alt="TTD Kepala Sekolah"
                      className="max-h-20 object-contain z-10"
                    />
                  ) : (
                    <div className="h-20" />
                  )}
                  {school.stempelSekolah && (
                    <img
                      src={school.stempelSekolah}
                      alt="Stempel Sekolah"
                      className="max-h-24 object-contain opacity-75 absolute -left-2 top-0 pointer-events-none"
                    />
                  )}
                </div>
                <p className="font-bold underline text-slate-900 uppercase">{school.headName}</p>
                <p className="text-slate-700 text-[11px]">{school.headNip}</p>
              </div>

              <div className="text-center">
                <p className="font-medium text-slate-800">
                  {school.place}, {currentDateFormatted}
                </p>
                <p className="font-semibold text-slate-900">Guru Pendidikan Agama Islam & BP</p>
                <div className="h-24 flex items-center justify-center my-1">
                  {school.ttdGuru ? (
                    <img
                      src={school.ttdGuru}
                      alt="TTD Guru"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <div className="h-20" />
                  )}
                </div>
                <p className="font-bold underline text-slate-900 uppercase">{school.teacher}</p>
                <p className="text-slate-700 text-[11px]">{school.nip}</p>
              </div>
            </div>
          );

          // 4. Tabel Siswa
          const renderClassTable = (clsName: string, students: string[]) => {
            if (printFormatMode === 'ringkasan') {
              return (
                <table className="w-full border-collapse border border-slate-900 text-xs mb-4">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-900 py-2 px-2 text-center w-8">No</th>
                      <th className="border border-slate-900 py-2 px-3 text-left">Nama Siswa</th>
                      <th className="border border-slate-900 py-2 px-3 text-left">Batas Membaca (BTA)</th>
                      <th className="border border-slate-900 py-2 px-3 text-left">Catatan Tajwid</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-28">Praktik Wudhu</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-28">Praktik Shalat</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-20">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-slate-900 py-3 text-center text-slate-500 italic">
                          Belum ada siswa terdaftar di {clsName}.
                        </td>
                      </tr>
                    ) : (
                      students.map((student, idx) => {
                        const key = `${clsName}_${student}`;
                        const rawRec = btaIbadah[key];
                        const rec = rawRec ? recomputeStudentIbadah(rawRec) : undefined;
                        let bacaan = '-';
                        if (rec) {
                          if (rec.readingType === 'Iqra') {
                            bacaan = `Iqra Jilid ${rec.iqraJilid || 1} ${rec.iqraHalaman || ''}`.trim();
                          } else if (rec.readingType) {
                            bacaan = `${rec.readingType} Surah ${rec.surahName || ''} (${rec.ayat || ''})`.trim();
                          }
                        }

                        return (
                          <tr key={student} className="border-b border-slate-800">
                            <td className="border border-slate-900 py-1.5 px-2 text-center">{idx + 1}</td>
                            <td className="border border-slate-900 py-1.5 px-3 font-semibold text-slate-900">
                              {student}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-3 font-medium">{bacaan}</td>
                            <td className="border border-slate-900 py-1.5 px-3 text-[11px] text-slate-700">
                              {rec?.readingNotes || '-'}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center">
                              <div className="font-extrabold text-slate-900 text-xs">
                                {rec?.wudhuScore !== undefined ? rec.wudhuScore : '-'}
                              </div>
                              <div className="text-[10px] text-slate-700 font-semibold">
                                {rec?.wudhuStatus || '-'}
                              </div>
                              {rec?.wudhuAverage !== undefined && (
                                <div className="text-[9px] text-slate-500 font-sans">
                                  Rerata: <span className="font-bold">{rec.wudhuAverage.toFixed(2)}</span> / 4.00
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center">
                              <div className="font-extrabold text-slate-900 text-xs">
                                {rec?.shalatScore !== undefined ? rec.shalatScore : '-'}
                              </div>
                              <div className="text-[10px] text-slate-700 font-semibold">
                                {rec?.shalatStatus || '-'}
                              </div>
                              {rec?.shalatAverage !== undefined && (
                                <div className="text-[9px] text-slate-500 font-sans">
                                  Rerata: <span className="font-bold">{rec.shalatAverage.toFixed(2)}</span> / 4.00
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center text-[10px] text-slate-600">
                              {rec?.lastUpdated || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              );
            } else {
              // Mode Rubrik Lengkap Matrix
              return (
                <table className="w-full border-collapse border border-slate-900 text-[11px] mb-4">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-900 py-2 px-2 text-center w-8">No</th>
                      <th className="border border-slate-900 py-2 px-2 text-left">Nama Siswa</th>
                      <th className="border border-slate-900 py-2 px-2 text-center">Batas BTA</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-24">Wudhu (0-100)</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-24">Predikat Wudhu</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-24">Shalat (0-100)</th>
                      <th className="border border-slate-900 py-2 px-2 text-center w-24">Predikat Shalat</th>
                      <th className="border border-slate-900 py-2 px-2 text-left">Catatan Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="border border-slate-900 py-3 text-center text-slate-500 italic">
                          Belum ada siswa terdaftar di {clsName}.
                        </td>
                      </tr>
                    ) : (
                      students.map((student, idx) => {
                        const key = `${clsName}_${student}`;
                        const rawRec = btaIbadah[key];
                        const rec = rawRec ? recomputeStudentIbadah(rawRec) : undefined;
                        return (
                          <tr key={student}>
                            <td className="border border-slate-900 py-1.5 px-2 text-center">{idx + 1}</td>
                            <td className="border border-slate-900 py-1.5 px-2 font-bold text-slate-900">{student}</td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center">
                              {rec?.readingType === 'Iqra'
                                ? `Iqra ${rec.iqraJilid || 1}`
                                : rec?.surahName || '-'}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center">
                              <span className="font-bold text-slate-900">{rec?.wudhuScore ?? '-'}</span>
                              {rec?.wudhuAverage !== undefined && (
                                <div className="text-[9px] text-slate-500 font-sans">
                                  ({rec.wudhuAverage.toFixed(2)})
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center font-medium">
                              {rec?.wudhuStatus || '-'}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center">
                              <span className="font-bold text-slate-900">{rec?.shalatScore ?? '-'}</span>
                              {rec?.shalatAverage !== undefined && (
                                <div className="text-[9px] text-slate-500 font-sans">
                                  ({rec.shalatAverage.toFixed(2)})
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-center font-medium">
                              {rec?.shalatStatus || '-'}
                            </td>
                            <td className="border border-slate-900 py-1.5 px-2 text-[10px]">
                              {[rec?.wudhuNotes, rec?.shalatNotes].filter(Boolean).join(' • ') || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              );
            }
          };

          // KASUS A: CETAK SEMUA KELAS DENGAN PEMISAHAN HALAMAN TIAP KELAS (DEFAULT & SANGAT RAPI)
          if (printClassScope === 'all' && separatePagePerClass) {
            return (
              <div>
                {classes.map((cls, cIdx) => {
                  const clsStats = getClassStats(cls.name, cls.students);
                  const isLastClass = cIdx === classes.length - 1;

                  return (
                    <div
                      key={cls.name}
                      className={`mb-10 print:mb-0 ${!isLastClass ? 'print-page-break' : ''}`}
                    >
                      {/* Kop Surat Resmi di Setiap Halaman Kelas */}
                      {renderKopSurat()}

                      {/* Judul & Metadata Kelas */}
                      <div className="text-center mb-4">
                        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
                          LAPORAN ASESMEN CAPAIAN BACA TULIS AL-QUR'AN (BTA) & PRAKTIK IBADAH
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium font-sans">
                          Mata Pelajaran: {school.subject} &bull; <strong className="text-slate-900 underline">Kelas: {cls.name}</strong> &bull; {school.semester}
                        </p>
                      </div>

                      {/* Baris Ringkasan Kelas */}
                      <div className="mb-3 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-sans flex flex-wrap items-center justify-between gap-2 text-slate-700">
                        <span>Jumlah Siswa: <strong>{cls.students.length}</strong> siswa</span>
                        <span>Rerata Nilai Wudhu: <strong>{clsStats.avgWudhu}</strong>/100 (Butir: {clsStats.avgWudhuItem})</span>
                        <span>Rerata Nilai Shalat: <strong>{clsStats.avgShalat}</strong>/100 (Butir: {clsStats.avgShalatItem})</span>
                        <span>Tingkat Kelancaran: <strong>{clsStats.pctShalat}%</strong> siswa</span>
                      </div>

                      {/* Tabel Siswa Kelas Ini */}
                      {renderClassTable(cls.name, cls.students)}

                      {/* Legenda Rubrik & Konversi */}
                      {renderRubricLegend()}

                      {/* Tanda Tangan & Stempel Resmi */}
                      {renderSignatures()}
                    </div>
                  );
                })}
              </div>
            );
          }

          // KASUS B: CETAK SEMUA KELAS TAMPILAN GABUNGAN BERURUTAN (KONTINU)
          if (printClassScope === 'all' && !separatePagePerClass) {
            return (
              <div>
                {/* Kop Surat Satu Kali di Atas */}
                {renderKopSurat()}

                {/* Judul Laporan Keseluruhan Kelas 1-6 */}
                <div className="text-center mb-5">
                  <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
                    LAPORAN ASESMEN CAPAIAN BACA TULIS AL-QUR'AN (BTA) & PRAKTIK IBADAH
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium font-sans">
                    Mata Pelajaran: {school.subject} &bull; <strong className="text-slate-900">Rekap Keseluruhan Kelas 1 s/d Kelas 6</strong> &bull; {school.semester}
                  </p>
                </div>

                {/* Ringkasan Keseluruhan Sekolah */}
                <div className="mb-5 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-sans grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 text-center">
                  <div>Total Siswa (Kelas 1-6): <strong>{overallStats.totalStudents}</strong> siswa</div>
                  <div>Rerata Wudhu Sekolah: <strong>{overallStats.avgWudhu}</strong> / 100 ({overallStats.avgWudhuItem}/4.00)</div>
                  <div>Rerata Shalat Sekolah: <strong>{overallStats.avgShalat}</strong> / 100 ({overallStats.avgShalatItem}/4.00)</div>
                  <div>Persentase Kelancaran: <strong>{overallStats.pctShalat}%</strong> siswa</div>
                </div>

                {/* Loop Tiap Kelas */}
                {classes.map((cls) => (
                  <div key={cls.name} className="mb-6">
                    <div className="font-bold text-xs uppercase bg-slate-100 px-3 py-1.5 border border-slate-900 border-b-0 font-sans flex items-center justify-between text-slate-900">
                      <span>DAFTAR CAPAIAN & SKOR IBADAH: {cls.name}</span>
                      <span className="text-[11px] font-normal text-slate-600">{cls.students.length} Siswa Terdaftar</span>
                    </div>
                    {renderClassTable(cls.name, cls.students)}
                  </div>
                ))}

                {/* Legenda Rubrik & Konversi */}
                {renderRubricLegend()}

                {/* Tanda Tangan & Stempel Resmi */}
                {renderSignatures()}
              </div>
            );
          }

          // KASUS C: CETAK SATU KELAS SAJA (KELAS AKTIF)
          return (
            <div>
              {renderKopSurat()}

              {/* Judul & Info Kelas Aktif */}
              <div className="text-center mb-5">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
                  LAPORAN ASESMEN CAPAIAN BACA TULIS AL-QUR'AN (BTA) & PRAKTIK IBADAH
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium font-sans">
                  Mata Pelajaran: {school.subject} &bull; <strong className="text-slate-900 underline">Kelas: {selectedClass}</strong> &bull; {school.semester}
                </p>
              </div>

              {/* Ringkasan Singkat Kelas */}
              <div className="mb-3 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-sans flex flex-wrap items-center justify-between gap-2 text-slate-700">
                <span>Jumlah Siswa: <strong>{studentList.length}</strong> siswa</span>
                <span>Rerata Nilai Wudhu: <strong>{stats.avgWudhu}</strong>/100 (Butir: {stats.avgWudhuItem})</span>
                <span>Rerata Nilai Shalat: <strong>{stats.avgShalat}</strong>/100 (Butir: {stats.avgShalatItem})</span>
                <span>Tingkat Kelancaran: <strong>{stats.pctShalat}%</strong> siswa</span>
              </div>

              {/* Tabel Siswa Kelas Aktif */}
              {renderClassTable(selectedClass, studentList)}

              {/* Legenda Rubrik & Konversi */}
              {renderRubricLegend()}

              {/* Tanda Tangan & Stempel Resmi */}
              {renderSignatures()}
            </div>
          );
        })()}
      </div>

      {/* Student Update Modal */}
      {editingStudent && (
        <StudentBTAIbadahModal
          isOpen={true}
          onClose={() => setEditingStudent(null)}
          studentName={editingStudent}
          className={selectedClass}
          initialData={btaIbadah[`${selectedClass}_${editingStudent}`]}
          onSave={handleSaveModal}
          onSaveAndNext={handleSaveAndNext}
          hasNextStudent={hasNextStudent}
          nextStudentName={nextStudentName}
        />
      )}

      {/* Student Rubrik Detail Modal */}
      {viewingDetailStudent && (
        <StudentRubrikDetailModal
          isOpen={true}
          onClose={() => setViewingDetailStudent(null)}
          studentName={viewingDetailStudent}
          className={selectedClass}
          record={btaIbadah[`${selectedClass}_${viewingDetailStudent}`]}
          school={school}
          onOpenEdit={handleOpenEdit}
        />
      )}
    </div>
  );
};
