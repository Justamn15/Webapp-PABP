import { IbadahFluency } from '../types.ts';

export interface RubrikItem {
  id: string;
  name: string;
  category?: 'rukun' | 'sunnah';
  description?: string;
}

// 13 Butir Rukun Shalat sesuai spesifikasi pengguna
export const RUKUN_SHALAT_LIST: RubrikItem[] = [
  { id: 'shalat_1', name: 'Niat', description: 'Niat ikhlas karena Allah sesuai shalat fardhu yang dikerjakan' },
  { id: 'shalat_2', name: 'Berdiri bagi yang mampu', description: 'Posisi berdiri tegak lurus menghadap kiblat bagi yang mampu' },
  { id: 'shalat_3', name: 'Takbiratul Ihram', description: 'Mengucapkan Allahu Akbar bersamaan niat di dalam hati' },
  { id: 'shalat_4', name: 'Al-Fatihah', description: 'Membaca surah Al-Fatihah secara lengkap, fasih, dan tartil' },
  { id: 'shalat_5', name: "Ruku' dengan tuma'ninah", description: 'Membungkuk punggung lurus mendatar disertai tuma\'ninah' },
  { id: 'shalat_6', name: "Iktidal dengan tuma'ninah", description: 'Bangkit berdiri tegak dari ruku\' disertai tuma\'ninah' },
  { id: 'shalat_7', name: "Sujud dengan tuma'ninah", description: 'Meletakkan 7 anggota sujud menempel di tempat sujud disertai tuma\'ninah' },
  { id: 'shalat_8', name: "Duduk di antara dua sujud dengan tuma'ninah", description: 'Duduk iftirasy tenang di antara dua sujud disertai tuma\'ninah' },
  { id: 'shalat_9', name: 'Duduk tasyahud Akhir', description: 'Duduk tawarruk pada rakaat terakhir' },
  { id: 'shalat_10', name: 'Membaca Tasyahud Akhir', description: 'Membaca lafal tasyahud akhir dengan benar dan tertib' },
  { id: 'shalat_11', name: 'Membaca Shalawat Ibrahimiyah', description: 'Membaca shalawat atas Nabi Muhammad SAW dan keluarga' },
  { id: 'shalat_12', name: 'Membaca salam pertama', description: 'Menoleh ke kanan sambil mengucapkan Assalamu\'alaikum warahmatullah' },
  { id: 'shalat_13', name: 'Tertib', description: 'Melakukan seluruh rukun shalat secara urut dan berurutan' },
];

// 6 Butir Rukun Wudhu sesuai spesifikasi pengguna
export const RUKUN_WUDHU_LIST: RubrikItem[] = [
  { id: 'wudhu_r1', name: 'Niat', category: 'rukun', description: 'Niat menghilangkan hadats kecil saat awal membasuh muka' },
  { id: 'wudhu_r2', name: 'Membasuh Wajah', category: 'rukun', description: 'Membasuh seluruh batas wajah dari dahi hingga dagu dan telinga' },
  { id: 'wudhu_r3', name: 'Membasuh Tangan sampai Siku', category: 'rukun', description: 'Membasuh kedua tangan merata hingga melewati kedua siku' },
  { id: 'wudhu_r4', name: 'Mengusap rambut kepala / ubun-ubun', category: 'rukun', description: 'Mengusap sebagian rambut kepala atau ubun-ubun dengan air' },
  { id: 'wudhu_r5', name: 'Membasuh kedua kaki sampai mata kaki', category: 'rukun', description: 'Membasuh kedua belah kaki secara merata hingga melewati mata kaki' },
  { id: 'wudhu_r6', name: 'Tertib', category: 'rukun', description: 'Mengerjakan seluruh rukun wudhu secara berurutan tanpa mendahului' },
];

// 12 Butir Sunnah Wudhu sesuai spesifikasi pengguna
export const SUNNAH_WUDHU_LIST: RubrikItem[] = [
  { id: 'wudhu_s1', name: 'Membaca Basmalah', category: 'sunnah', description: 'Mengucapkan Bismillahirrahmanirrahim di awal wudhu' },
  { id: 'wudhu_s2', name: 'Mencuci Kedua Telapak Tangan', category: 'sunnah', description: 'Mencuci kedua telapak tangan hingga pergelangan' },
  { id: 'wudhu_s3', name: 'Bersiwak atau Menggosok Gigi', category: 'sunnah', description: 'Membersihkan gigi dengan siwak atau sikat gigi' },
  { id: 'wudhu_s4', name: 'Madhmadhah (berkumur)', category: 'sunnah', description: 'Berkumur-kumur membersihkan rongga mulut' },
  { id: 'wudhu_s5', name: 'Istinsyaq (Menyerap Air ke Hidung lalu mengeluarkannya)', category: 'sunnah', description: 'Memasukkan air ke rongga hidung dan menghembuskannya keluar' },
  { id: 'wudhu_s6', name: 'Mendahulukan Anggota Badan Bagian Kanan dibanding bagian kiri', category: 'sunnah', description: 'Memulai dari sisi kanan sebelum membasuh sisi kiri' },
  { id: 'wudhu_s7', name: 'Mengusap Seluruh Kepala', category: 'sunnah', description: 'Mengusapkan air ke seluruh bagian kepala' },
  { id: 'wudhu_s8', name: 'Mengusap Kedua Telinga', category: 'sunnah', description: 'Mengusap bagian luar dan dalam kedua telinga dengan air baru' },
  { id: 'wudhu_s9', name: 'Menyela-nyela Jari tangan', category: 'sunnah', description: 'Menyela jari jemari tangan dan kaki agar air merata' },
  { id: 'wudhu_s10', name: 'Mengulang Setiap Usapan/Basuhan Sebanyak 3 Kali', category: 'sunnah', description: 'Membasuh dan mengusap masing-masing anggota wudhu sebanyak 3 kali' },
  { id: 'wudhu_s11', name: 'Muwalat (Sambung-menyambung)', category: 'sunnah', description: 'Membasuh anggota berikutnya sebelum anggota sebelumnya mengering' },
  { id: 'wudhu_s12', name: 'Membaca Doa Setelah Wudhu', category: 'sunnah', description: 'Membaca doa asyhadu alla ilaha illallah... menghadap kiblat' },
];

export const ALL_WUDHU_LIST: RubrikItem[] = [
  ...RUKUN_WUDHU_LIST,
  ...SUNNAH_WUDHU_LIST,
];

export const RUBRIC_SCORE_LABELS: Record<number, { label: string; desc: string; badgeColor: string }> = {
  4: {
    label: 'Sangat Baik (4)',
    desc: 'Gerakan/bacaan sangat tepat, tertib, fasih, dan mandiri',
    badgeColor: 'bg-emerald-600 text-white',
  },
  3: {
    label: 'Baik (3)',
    desc: 'Gerakan/bacaan tepat dan lancar mandiri',
    badgeColor: 'bg-teal-600 text-white',
  },
  2: {
    label: 'Cukup (2)',
    desc: 'Bisa melakukan tapi masih terbata-bata atau butuh sedikit arahan',
    badgeColor: 'bg-amber-500 text-white',
  },
  1: {
    label: 'Perlu Bimbingan (1)',
    desc: 'Belum menguasai atau memerlukan bimbingan penuh',
    badgeColor: 'bg-rose-500 text-white',
  },
};

/**
 * Penentuan Predikat Kelancaran berdasarkan Rata-rata Skor Butir Penilaian (Skala 1.00 - 4.00)
 * Sesuai panduan rubrik asesmen autentik PABP:
 * - 3.50 - 4.00 : Sangat Baik (Setara 88 - 100)
 * - 3.00 - 3.49 : Lancar (Setara 75 - 87)
 * - 2.40 - 2.99 : Cukup (Setara 60 - 74)
 * - 1.60 - 2.39 : Kurang Lancar (Setara 40 - 59)
 * - < 1.60      : Belum Bisa (Setara < 40)
 */
export function getPredicateFromAverage(averageScore: number): IbadahFluency {
  if (averageScore >= 3.5) return 'Sangat Baik';
  if (averageScore >= 3.0) return 'Lancar';
  if (averageScore >= 2.4) return 'Cukup';
  if (averageScore >= 1.6) return 'Kurang Lancar';
  return 'Belum Bisa';
}

/**
 * Konversi nilai akhir (0-100) menjadi Predikat Ibadah
 */
export function getPredicateFromScore(finalScore: number): IbadahFluency {
  if (finalScore >= 88) return 'Sangat Baik';
  if (finalScore >= 75) return 'Lancar';
  if (finalScore >= 60) return 'Cukup';
  if (finalScore >= 40) return 'Kurang Lancar';
  return 'Belum Bisa';
}

/**
 * Hitung kalkulasi nilai shalat otomatis berdasarkan 13 butir rukun:
 * - Menghitung total skor rukun shalat (skor 1-4 per butir, max 52)
 * - Menghitung rata-rata skor per butir (skala 1.00 - 4.00)
 * - Melakukan konversi otomatis ke skala 0 - 100
 * - Menentukan predikat kelancaran berdasarkan rata-rata skor butir penilaian
 */
export function calculateShalatScore(scores: Record<string, number>): {
  totalScore: number;
  maxScore: number;
  averageScore: number;
  finalScore: number;
  predicate: IbadahFluency;
  completedItemsCount: number;
} {
  let totalScore = 0;
  let completedItemsCount = 0;

  RUKUN_SHALAT_LIST.forEach((item) => {
    const val = scores[item.id];
    if (val && val >= 1 && val <= 4) {
      totalScore += val;
      completedItemsCount++;
    }
  });

  const totalItems = RUKUN_SHALAT_LIST.length; // 13 rukun
  const maxScore = totalItems * 4; // 13 * 4 = 52

  // Rata-rata butir penilaian (skala 1.00 - 4.00)
  const averageScore =
    completedItemsCount > 0 ? Number((totalScore / completedItemsCount).toFixed(2)) : 0;

  // Konversi otomatis ke skala 0-100: (totalScore / maxScore) * 100 = (averageScore / 4) * 100
  const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Penentuan predikat kelancaran berdasarkan rata-rata skor butir penilaian
  const predicate = getPredicateFromAverage(averageScore);

  return {
    totalScore,
    maxScore,
    averageScore,
    finalScore,
    predicate,
    completedItemsCount,
  };
}

/**
 * Hitung kalkulasi nilai wudhu otomatis berdasarkan pilihan mode:
 * - 'rukun_dan_sunnah': 18 butir (6 rukun + 12 sunnah, max 72)
 * - 'rukun_saja': 6 butir (6 rukun saja, max 24)
 * Menghasilkan:
 * - Total skor rukun & sunnah wudhu
 * - Rata-rata skor per butir (skala 1.00 - 4.00)
 * - Konversi otomatis ke skala 0 - 100
 * - Penentuan predikat kelancaran berdasarkan rata-rata skor butir
 */
export function calculateWudhuScore(
  scores: Record<string, number>,
  mode: 'rukun_dan_sunnah' | 'rukun_saja' = 'rukun_dan_sunnah'
): {
  totalScore: number;
  maxScore: number;
  averageScore: number;
  finalScore: number;
  predicate: IbadahFluency;
  rukunScore: number;
  sunnahScore: number;
  completedItemsCount: number;
} {
  let rukunScore = 0;
  let sunnahScore = 0;
  let completedItemsCount = 0;

  RUKUN_WUDHU_LIST.forEach((item) => {
    const val = scores[item.id];
    if (val && val >= 1 && val <= 4) {
      rukunScore += val;
      completedItemsCount++;
    }
  });

  if (mode === 'rukun_dan_sunnah') {
    SUNNAH_WUDHU_LIST.forEach((item) => {
      const val = scores[item.id];
      if (val && val >= 1 && val <= 4) {
        sunnahScore += val;
        completedItemsCount++;
      }
    });
  }

  const totalScore = rukunScore + sunnahScore;
  const maxScore = mode === 'rukun_dan_sunnah' ? 72 : 24; // 18*4=72 vs 6*4=24

  // Rata-rata butir penilaian (skala 1.00 - 4.00)
  const averageScore =
    completedItemsCount > 0 ? Number((totalScore / completedItemsCount).toFixed(2)) : 0;

  // Konversi otomatis ke skala 0 - 100
  const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Penentuan predikat kelancaran berdasarkan rata-rata skor butir penilaian
  const predicate = getPredicateFromAverage(averageScore);

  return {
    totalScore,
    maxScore,
    averageScore,
    finalScore,
    predicate,
    rukunScore,
    sunnahScore,
    completedItemsCount,
  };
}

/**
 * Utility untuk menghitung ulang atau menyelaraskan data capaian ibadah siswa:
 * Memastikan total skor, konversi skala 0-100, rata-rata butir, dan predikat
 * selalu tersinkronisasi secara otomatis.
 */
export function recomputeStudentIbadah(rec: import('../types.ts').StudentBTAIbadah): import('../types.ts').StudentBTAIbadah {
  let updatedRec = { ...rec };

  // Hitung ulang wudhu jika memiliki data rincian atau rubrik
  if (updatedRec.wudhuDetails && updatedRec.wudhuDetails.scores) {
    const wCalc = calculateWudhuScore(
      updatedRec.wudhuDetails.scores,
      updatedRec.wudhuDetails.mode || 'rukun_dan_sunnah'
    );
    updatedRec = {
      ...updatedRec,
      wudhuStatus: wCalc.predicate,
      wudhuScore: wCalc.finalScore,
      wudhuAverage: wCalc.averageScore,
      wudhuDetails: {
        ...updatedRec.wudhuDetails,
        rukunScore: wCalc.rukunScore,
        sunnahScore: wCalc.sunnahScore,
        totalScore: wCalc.totalScore,
        maxScore: wCalc.maxScore,
        averageScore: wCalc.averageScore,
        finalScore: wCalc.finalScore,
      },
    };
  } else if (updatedRec.wudhuScore !== undefined && updatedRec.wudhuAverage === undefined) {
    // Estimasi rata-rata dari nilai skala 100
    updatedRec.wudhuAverage = Number(((updatedRec.wudhuScore / 100) * 4).toFixed(2));
  }

  // Hitung ulang shalat jika memiliki data rincian atau rubrik
  if (updatedRec.shalatDetails && updatedRec.shalatDetails.scores) {
    const sCalc = calculateShalatScore(updatedRec.shalatDetails.scores);
    updatedRec = {
      ...updatedRec,
      shalatStatus: sCalc.predicate,
      shalatScore: sCalc.finalScore,
      shalatAverage: sCalc.averageScore,
      shalatDetails: {
        ...updatedRec.shalatDetails,
        totalScore: sCalc.totalScore,
        maxScore: sCalc.maxScore,
        averageScore: sCalc.averageScore,
        finalScore: sCalc.finalScore,
      },
    };
  } else if (updatedRec.shalatScore !== undefined && updatedRec.shalatAverage === undefined) {
    // Estimasi rata-rata dari nilai skala 100
    updatedRec.shalatAverage = Number(((updatedRec.shalatScore / 100) * 4).toFixed(2));
  }

  return updatedRec;
}
