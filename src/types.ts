export interface SchoolInfo {
  name: string;
  address: string;
  subject: string;
  teacher: string;
  nip: string;
  headName: string;
  headNip: string;
  kkm: number;
  place: string;
  logo: string;
  semester: string;
  logoKiriJurnal?: string;
  logoKananJurnal?: string;
  ttdGuru?: string;
  ttdKepalaSekolah?: string;
  stempelSekolah?: string;
}

export interface ClassItem {
  name: string;
  students: string[];
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  hariTanggal: string; // e.g. "Selasa, 1 September 2026"
  kelas: string; // e.g. "IV" or "I & V" or "-"
  jam: string; // e.g. "1-4" or "1-4 / 5-8" or "-"
  waktu: string; // e.g. "08.00 - 10.35" or "-"
  uraianMateri: string; // Materi Pokok / TP
  sumberBelajar: string; // e.g. "Buku PAI & Budi Pekerti Kurikulum Merdeka"
  keterangan: string; // e.g. "Hadir / KBM Efektif" or "Libur Akhir Pekan"
  isHoliday?: boolean;
}

export type ReadingLevelType = 'Iqra' | 'Al-Qur\'an' | 'Juz Amma';

export type IbadahFluency = 'Belum Bisa' | 'Kurang Lancar' | 'Cukup' | 'Lancar' | 'Sangat Baik';

export interface WudhuAssessmentDetails {
  mode: 'rukun_dan_sunnah' | 'rukun_saja';
  scores: Record<string, number>; // key: item id (misal: wudhu_r1..6, wudhu_s1..12), value: 1-4
  rukunScore: number;
  sunnahScore: number;
  totalScore: number;
  maxScore: number;
  finalScore: number; // 0 - 100
  averageScore?: number; // Rata-rata skor butir skala 1.00 - 4.00
  notes?: string;
}

export interface ShalatAssessmentDetails {
  scores: Record<string, number>; // key: item id (misal: shalat_1..13), value: 1-4
  totalScore: number;
  maxScore: number;
  finalScore: number; // 0 - 100
  averageScore?: number; // Rata-rata skor butir skala 1.00 - 4.00
  notes?: string;
}

export interface StudentBTAIbadah {
  studentName: string;
  className: string;
  // BTA / Batas Membaca
  readingType: ReadingLevelType;
  iqraJilid?: number; // 1 - 6
  iqraHalaman?: string;
  surahNumber?: number; // 1 - 114
  surahName?: string;
  ayat?: string; // e.g. "Ayat 1-10" or "Halaman 45"
  readingNotes?: string;
  // Kemampuan Praktik Ibadah
  wudhuStatus: IbadahFluency;
  wudhuScore?: number; // Nilai akhir skala 100
  wudhuAverage?: number; // Rata-rata butir skala 1.00 - 4.00
  wudhuNotes?: string;
  wudhuDetails?: WudhuAssessmentDetails;
  shalatStatus: IbadahFluency;
  shalatScore?: number; // Nilai akhir skala 100
  shalatAverage?: number; // Rata-rata butir skala 1.00 - 4.00
  shalatNotes?: string;
  shalatDetails?: ShalatAssessmentDetails;
  // Tanggal & Catatan Umum
  lastUpdated: string;
}

export interface AcademicPeriod {
  id: string; // e.g. "2025-2026_ganjil"
  academicYear: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  label: string; // e.g. "Semester Ganjil 2025/2026"
  isLocked: boolean; // true jika diarsipkan / dikunci dari edit tidak sengaja
  createdAt: string;
  classes: ClassItem[];
  attendance: Record<string, AttendanceStatus>;
  nilai: Record<string, number>;
  keteranganTugas: Record<string, string>;
  journal: Record<string, JournalEntry>;
  btaIbadah: Record<string, StudentBTAIbadah>;
}

export interface AppData {
  school: SchoolInfo;
  currentPeriodId?: string;
  periods?: Record<string, AcademicPeriod>;
  // Active period mirrors (for high performance and backward compatibility)
  classes: ClassItem[];
  attendance: Record<string, AttendanceStatus>;
  nilai: Record<string, number>;
  keteranganTugas: Record<string, string>;
  journal: Record<string, JournalEntry>;
  btaIbadah?: Record<string, StudentBTAIbadah>;
}

export type AssessmentType = 'TP' | 'LM' | 'STS' | 'SAS';

export type MainTab = 'kehadiran' | 'jurnal' | 'keagamaan' | 'nilai' | 'rekapNilai' | 'rekapAbsen' | 'cetak' | 'backup';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

