import { AcademicPeriod, AppData, ClassItem, StudentBTAIbadah } from '../types.ts';

export const DEFAULT_PERIOD_ID = '2025-2026_ganjil';
export const DEFAULT_ACADEMIC_YEAR = '2025/2026';
export const DEFAULT_SEMESTER: 'Ganjil' | 'Genap' = 'Ganjil';

/**
 * Format ID standar untuk periode akademik
 * Contoh: "2025/2026", "Ganjil" => "2025-2026_ganjil"
 */
export function formatPeriodId(academicYear: string, semester: 'Ganjil' | 'Genap'): string {
  const cleanYear = academicYear.replace(/\//g, '-').trim();
  return `${cleanYear}_${semester.toLowerCase()}`;
}

/**
 * Format label tampilan periode
 * Contoh: "2025/2026", "Ganjil" => "Semester Ganjil 2025/2026"
 */
export function formatPeriodLabel(academicYear: string, semester: 'Ganjil' | 'Genap'): string {
  return `Semester ${semester} ${academicYear}`;
}

/**
 * Membuat data periode awal (default) dari data yang ada
 */
export function createDefaultPeriod(data: Partial<AppData>): AcademicPeriod {
  return {
    id: DEFAULT_PERIOD_ID,
    academicYear: DEFAULT_ACADEMIC_YEAR,
    semester: DEFAULT_SEMESTER,
    label: formatPeriodLabel(DEFAULT_ACADEMIC_YEAR, DEFAULT_SEMESTER),
    isLocked: false,
    createdAt: new Date().toISOString(),
    classes: (data.classes || []).map((c) => ({
      name: c.name,
      students: [...c.students],
    })),
    attendance: { ...(data.attendance || {}) },
    nilai: { ...(data.nilai || {}) },
    keteranganTugas: { ...(data.keteranganTugas || {}) },
    journal: { ...(data.journal || {}) },
    btaIbadah: { ...(data.btaIbadah || {}) },
  };
}

/**
 * Membuat periode baru dengan menyalin daftar siswa otomatis tanpa nilai sebelumnya
 * Sesuai jawaban klarifikasi pengguna: "Salin data siswa otomatis tanpa nilai sebelumnya"
 */
export function createNewPeriod(
  sourcePeriod: AcademicPeriod,
  academicYear: string,
  semester: 'Ganjil' | 'Genap',
  customLabel?: string
): AcademicPeriod {
  const newId = formatPeriodId(academicYear, semester);
  const newLabel = customLabel?.trim() || formatPeriodLabel(academicYear, semester);

  // Salin daftar kelas dan nama siswa dari periode sumber
  const clonedClasses: ClassItem[] = sourcePeriod.classes.map((cls) => ({
    name: cls.name,
    students: [...cls.students],
  }));

  // Jika diperlukan mempertahankan batas bacaan terakhir siswa sebagai titik awal tanpa nilai/skor baru:
  // Nilai wudhu dan shalat di-reset bersih untuk semester baru
  const resetBtaIbadah: Record<string, StudentBTAIbadah> = {};
  if (sourcePeriod.btaIbadah) {
    Object.entries(sourcePeriod.btaIbadah).forEach(([key, prevItem]) => {
      resetBtaIbadah[key] = {
        studentName: prevItem.studentName,
        className: prevItem.className,
        readingType: prevItem.readingType || 'Iqra',
        iqraJilid: prevItem.iqraJilid,
        iqraHalaman: prevItem.iqraHalaman,
        surahNumber: prevItem.surahNumber,
        surahName: prevItem.surahName,
        ayat: prevItem.ayat,
        readingNotes: '', // dikosongkan untuk catatan baru semester ini
        wudhuStatus: 'Belum Bisa',
        wudhuScore: undefined,
        wudhuAverage: undefined,
        wudhuDetails: undefined,
        wudhuNotes: '',
        shalatStatus: 'Belum Bisa',
        shalatScore: undefined,
        shalatAverage: undefined,
        shalatDetails: undefined,
        shalatNotes: '',
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    });
  }

  return {
    id: newId,
    academicYear,
    semester,
    label: newLabel,
    isLocked: false,
    createdAt: new Date().toISOString(),
    classes: clonedClasses,
    attendance: {}, // Nilai & presensi direset bersih untuk periode baru
    nilai: {},
    keteranganTugas: {},
    journal: {},
    btaIbadah: resetBtaIbadah,
  };
}

/**
 * Memastikan AppData memiliki periods dan currentPeriodId yang valid (Backward Compatibility)
 */
export function normalizeAppDataWithPeriods(raw: AppData): AppData {
  const result: AppData = { ...raw };

  if (!result.periods || Object.keys(result.periods).length === 0) {
    const initialPeriod = createDefaultPeriod(raw);
    result.periods = {
      [initialPeriod.id]: initialPeriod,
    };
    result.currentPeriodId = initialPeriod.id;
  }

  // Pastikan currentPeriodId ada dalam periods
  if (!result.currentPeriodId || !result.periods[result.currentPeriodId]) {
    const firstPeriodId = Object.keys(result.periods)[0];
    result.currentPeriodId = firstPeriodId || DEFAULT_PERIOD_ID;
  }

  // Sinkronkan data aktif root dengan currentPeriodId
  const activePeriod = result.periods[result.currentPeriodId];
  if (activePeriod) {
    result.classes = activePeriod.classes || result.classes || [];
    result.attendance = activePeriod.attendance || {};
    result.nilai = activePeriod.nilai || {};
    result.keteranganTugas = activePeriod.keteranganTugas || {};
    result.journal = activePeriod.journal || {};
    result.btaIbadah = activePeriod.btaIbadah || {};

    // Selaraskan semester pada profil sekolah
    if (result.school) {
      result.school.semester = activePeriod.label;
    }
  }

  return result;
}

/**
 * Mengurutkan periode secara kronologis (dari tahun terlama ke tahun terbaru)
 */
export function getSortedPeriods(periods: Record<string, AcademicPeriod>): AcademicPeriod[] {
  return Object.values(periods).sort((a, b) => {
    // Ekstrak tahun awal dari "2025/2026"
    const getStartYear = (y: string) => {
      const match = y.match(/^(\d{4})/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const yearA = getStartYear(a.academicYear);
    const yearB = getStartYear(b.academicYear);

    if (yearA !== yearB) {
      return yearA - yearB;
    }

    // Jika tahun sama, Ganjil lebih dulu dari Genap
    if (a.semester === 'Ganjil' && b.semester === 'Genap') return -1;
    if (a.semester === 'Genap' && b.semester === 'Ganjil') return 1;

    return a.id.localeCompare(b.id);
  });
}
