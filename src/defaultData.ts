import { AppData } from './types.ts';

export const defaultAppData: AppData = {
  school: {
    name: "SD NEGERI 5 KANDANGAN BARAT",
    address: "Jalan Harapan Kelurahan Kandangan Barat Kecamatan Kandangan 71213",
    subject: "Pendidikan Agama Islam dan Budi Pekerti",
    teacher: "Muhammad Amin, S.Pd",
    nip: "NI PPPK. 199709152025211027",
    headName: "Nor Ainah, S. Pd. SD",
    headNip: "NIP. 19681007 199103 2 011",
    kkm: 75,
    place: "Kandangan",
    logo: "",
    semester: "Semester Ganjil 2025/2026",
    logoKiriJurnal: "",
    logoKananJurnal: "",
    ttdGuru: "",
    ttdKepalaSekolah: "",
    stempelSekolah: ""
  },
  classes: [
    {
      name: "Kelas 1",
      students: [
        "Muhammad Amin Lutfi",
        "Fatimah",
        "Muhammad Dzaki Alfarizqi",
        "Ahmad Ardi Saputra",
        "Destiara Salvina",
        "Misbatul Khadijah",
        "Intan Keyla Soraya",
        "Rezky Adena Nor Hikmah",
        "Muhammad Yudhi Al-rahim",
        "Muhammad Yudha Al-Rahman",
        "Maulida Rahmah",
        "Muhammad Firdaus"
      ]
    },
    {
      name: "Kelas 2",
      students: [
        "Alya Rosyadi Putri",
        "Arya Rosyadi Putra",
        "Azmi Fadillah",
        "M. Danis Dilan",
        "Muhammad Kamil",
        "Muhammad Alif Nur Rezky",
        "Muhammad Faiq Rafandha",
        "Muhammad Ilmi"
      ]
    },
    {
      name: "Kelas 3",
      students: [
        "Amelia",
        "Halimatus Sa’diyah",
        "Nor Ajla Anisah",
        "Ahmad Syafiqa Raihan",
        "Rezky Adzkia Adelia",
        "M. Yazid Ilmi",
        "Muhammad Nabawi",
        "Muhammad Yudha"
      ]
    },
    {
      name: "Kelas 4",
      students: [
        "Muhammad Husien",
        "Muhammad Evan",
        "Najla Helya Anggraini",
        "Sarah",
        "Zacky Ahmada Rezky",
        "M. Arya Zaidan",
        "M. Nor Ikhsan",
        "Muhammad Zaini"
      ]
    },
    {
      name: "Kelas 5",
      students: [
        "Novi Arianti",
        "Abdurrahman",
        "Dafina Haura Nor Paujiah",
        "Mutia Azzahra",
        "M. Ragib Azhari",
        "M. Hendri Maulana",
        "Rahmatul Adawiyah"
      ]
    },
    {
      name: "Kelas 6",
      students: [
        "Daffa Raihan Al-Faro",
        "Muhammad Ridhuan",
        "Putri Aisya Rahmi",
        "Ruhama Afifa Humaira",
        "Sani"
      ]
    }
  ],
  attendance: {},
  nilai: {},
  keteranganTugas: {},
  journal: {
    "2026-09-01": {
      date: "2026-09-01",
      hariTanggal: "Selasa, 1 September 2026",
      kelas: "IV",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 2 Teladan Mulia Asmaulhusna",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-02": {
      date: "2026-09-02",
      hariTanggal: "Rabu, 2 September 2026",
      kelas: "III",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab II Ayo Mengenal Tuhan Kita",
      sumberBelajar: "Buku Guru & Siswa PAI | Proyektor",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-03": {
      date: "2026-09-03",
      hariTanggal: "Kamis, 3 September 2026",
      kelas: "I & V",
      jam: "1-4 / 5-8",
      waktu: "08.00 - 10.35 / 10.35 - 13.45",
      uraianMateri: "Kelas I: BAB 2 Mengenal Rukun Iman\nKelas V: Bab 2 Lebih dekat dengan nama-nama Allah",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-04": {
      date: "2026-09-04",
      hariTanggal: "Jumat, 4 September 2026",
      kelas: "II",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 2 Mari Mengenal Allah Swt",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-05": {
      date: "2026-09-05",
      hariTanggal: "Sabtu, 5 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-06": {
      date: "2026-09-06",
      hariTanggal: "Minggu, 6 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-07": {
      date: "2026-09-07",
      hariTanggal: "Senin, 7 September 2026",
      kelas: "VI",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 2 Allah Swt. Maha Segalanya",
      sumberBelajar: "Buku Guru & Siswa PAI",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-08": {
      date: "2026-09-08",
      hariTanggal: "Selasa, 8 September 2026",
      kelas: "IV",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 2 Teladan Mulia Asmaulhusna",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-09": {
      date: "2026-09-09",
      hariTanggal: "Rabu, 9 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "Perayaan Maulid Nabi Muhammad Saw",
      sumberBelajar: "-",
      keterangan: "Perayaan Maulid Nabi Muhammad Saw",
      isHoliday: true
    },
    "2026-09-10": {
      date: "2026-09-10",
      hariTanggal: "Kamis, 10 September 2026",
      kelas: "I & V",
      jam: "1-4 / 5-8",
      waktu: "08.00 - 10.35 / 10.35 - 13.45",
      uraianMateri: "Kelas I: BAB 2 Mengenal Rukun Iman\nKelas V: Bab 2 Lebih dekat dengan nama-nama Allah",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-11": {
      date: "2026-09-11",
      hariTanggal: "Jumat, 11 September 2026",
      kelas: "II",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 2 Mari Mengenal Allah Swt",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-12": {
      date: "2026-09-12",
      hariTanggal: "Sabtu, 12 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-13": {
      date: "2026-09-13",
      hariTanggal: "Minggu, 13 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-14": {
      date: "2026-09-14",
      hariTanggal: "Senin, 14 September 2026",
      kelas: "VI",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 2 Allah Swt. Maha Segalanya",
      sumberBelajar: "Buku Guru & Siswa PAI",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-15": {
      date: "2026-09-15",
      hariTanggal: "Selasa, 15 September 2026",
      kelas: "IV",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Indahnya Saling Menghargai dalam Keragaman",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-16": {
      date: "2026-09-16",
      hariTanggal: "Rabu, 16 September 2026",
      kelas: "III",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab III — Perilaku Terpuji Adalah Kepribadianku",
      sumberBelajar: "Buku Guru & Siswa PAI | Proyektor",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-17": {
      date: "2026-09-17",
      hariTanggal: "Kamis, 17 September 2026",
      kelas: "I & V",
      jam: "1-4 / 5-8",
      waktu: "08.00 - 10.35 / 10.35 - 13.45",
      uraianMateri: "Kelas I: BAB 2 Mengenal Rukun Iman\nKelas V: Bab 2 Lebih dekat dengan nama-nama Allah",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-18": {
      date: "2026-09-18",
      hariTanggal: "Jumat, 18 September 2026",
      kelas: "II",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Ayo Berperilaku Terpuji",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-19": {
      date: "2026-09-19",
      hariTanggal: "Sabtu, 19 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-20": {
      date: "2026-09-20",
      hariTanggal: "Minggu, 20 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-21": {
      date: "2026-09-21",
      hariTanggal: "Senin, 21 September 2026",
      kelas: "VI",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Hidup Damai dengan Saling Memaafkan",
      sumberBelajar: "Buku Guru & Siswa PAI",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-22": {
      date: "2026-09-22",
      hariTanggal: "Selasa, 22 September 2026",
      kelas: "IV",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Indahnya Saling Menghargai dalam Keragaman",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-23": {
      date: "2026-09-23",
      hariTanggal: "Rabu, 23 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "Pembukaan Porseni PGRI",
      sumberBelajar: "-",
      keterangan: "Pembukaan Porseni PGRI",
      isHoliday: true
    },
    "2026-09-24": {
      date: "2026-09-24",
      hariTanggal: "Kamis, 24 September 2026",
      kelas: "I & V",
      jam: "1-4 / 5-8",
      waktu: "08.00 - 10.35 / 10.35 - 13.45",
      uraianMateri: "Kelas I: Bab 3 — Aku Suka Membaca Basmalah dan Hamdalah\nKelas V: Bab 3 — Aku Anak Saleh",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-25": {
      date: "2026-09-25",
      hariTanggal: "Jumat, 25 September 2026",
      kelas: "II",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Ayo Berperilaku Terpuji",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-26": {
      date: "2026-09-26",
      hariTanggal: "Sabtu, 26 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-27": {
      date: "2026-09-27",
      hariTanggal: "Minggu, 27 September 2026",
      kelas: "-",
      jam: "-",
      waktu: "-",
      uraianMateri: "-",
      sumberBelajar: "-",
      keterangan: "Libur Akhir Pekan",
      isHoliday: true
    },
    "2026-09-28": {
      date: "2026-09-28",
      hariTanggal: "Senin, 28 September 2026",
      kelas: "VI",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Hidup Damai dengan Saling Memaafkan",
      sumberBelajar: "Buku Guru & Siswa PAI",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-29": {
      date: "2026-09-29",
      hariTanggal: "Selasa, 29 September 2026",
      kelas: "IV",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab 3 — Indahnya Saling Menghargai dalam Keragaman",
      sumberBelajar: "Buku PAI & Budi Pekerti Kurikulum Merdeka",
      keterangan: "Hadir / KBM Efektif"
    },
    "2026-09-30": {
      date: "2026-09-30",
      hariTanggal: "Rabu, 30 September 2026",
      kelas: "III",
      jam: "1-4",
      waktu: "08.00 - 10.35",
      uraianMateri: "Bab III — Perilaku Terpuji Adalah Kepribadianku",
      sumberBelajar: "Buku Guru & Siswa PAI | Proyektor",
      keterangan: "Hadir / KBM Efektif"
    }
  },
  btaIbadah: {
    "Kelas 1_Muhammad Amin Lutfi": {
      studentName: "Muhammad Amin Lutfi",
      className: "Kelas 1",
      readingType: "Iqra",
      iqraJilid: 2,
      iqraHalaman: "Halaman 14",
      wudhuStatus: "Lancar",
      wudhuScore: 83,
      wudhuAverage: 3.32,
      wudhuNotes: "Tertib rukun wudhu baik dan mandiri",
      shalatStatus: "Cukup",
      shalatScore: 71,
      shalatAverage: 2.85,
      shalatNotes: "Gerakan sudah baik, bacaan ruku perlu diulang",
      lastUpdated: "2026-09-28"
    },
    "Kelas 1_Fatimah": {
      studentName: "Fatimah",
      className: "Kelas 1",
      readingType: "Iqra",
      iqraJilid: 3,
      iqraHalaman: "Halaman 5",
      wudhuStatus: "Sangat Baik",
      wudhuScore: 94,
      wudhuAverage: 3.78,
      wudhuNotes: "Hafal doa sesudah wudhu dan tertib sunnahnya",
      shalatStatus: "Lancar",
      shalatScore: 85,
      shalatAverage: 3.38,
      shalatNotes: "Shalat tertib dan tuma'ninah baik",
      lastUpdated: "2026-09-29"
    },
    "Kelas 1_Muhammad Dzaki Alfarizqi": {
      studentName: "Muhammad Dzaki Alfarizqi",
      className: "Kelas 1",
      readingType: "Iqra",
      iqraJilid: 1,
      iqraHalaman: "Halaman 20",
      wudhuStatus: "Cukup",
      wudhuScore: 68,
      wudhuAverage: 2.72,
      wudhuNotes: "Membasuh kaki perlu sampai mata kaki",
      shalatStatus: "Kurang Lancar",
      shalatScore: 54,
      shalatAverage: 2.15,
      shalatNotes: "Masih dipandu bacaan takbir dan sujud",
      lastUpdated: "2026-09-25"
    },
    "Kelas 4_Muhammad Husien": {
      studentName: "Muhammad Husien",
      className: "Kelas 4",
      readingType: "Al-Qur'an",
      surahNumber: 18,
      surahName: "Al-Kahf",
      ayat: "Ayat 1 - 10",
      readingNotes: "Makharijul huruf dan mad thabi'i sangat fasih",
      wudhuStatus: "Sangat Baik",
      wudhuScore: 97,
      wudhuAverage: 3.89,
      wudhuNotes: "Lengkap dengan rukun dan sunnah-sunnahnya",
      shalatStatus: "Sangat Baik",
      shalatScore: 96,
      shalatAverage: 3.85,
      shalatNotes: "Tertib, tuma'ninah sempurna, dan bacaan tasyahhud fasih",
      lastUpdated: "2026-09-29"
    },
    "Kelas 4_Najla Helya Anggraini": {
      studentName: "Najla Helya Anggraini",
      className: "Kelas 4",
      readingType: "Al-Qur'an",
      surahNumber: 36,
      surahName: "Ya Sin",
      ayat: "Ayat 1 - 25",
      readingNotes: "Kelancaran membaca baik, perlu perhatikan tajwid idgham",
      wudhuStatus: "Lancar",
      wudhuScore: 85,
      wudhuAverage: 3.38,
      wudhuNotes: "Rukun dan tertib wudhu benar",
      shalatStatus: "Lancar",
      shalatScore: 83,
      shalatAverage: 3.31,
      shalatNotes: "Gerakan dan bacaan shalat fardhu lancar mandiri",
      lastUpdated: "2026-09-27"
    },
    "Kelas 4_Muhammad Evan": {
      studentName: "Muhammad Evan",
      className: "Kelas 4",
      readingType: "Iqra",
      iqraJilid: 6,
      iqraHalaman: "Halaman 18",
      readingNotes: "Persiapan transisi tadarus mushaf Al-Qur'an",
      wudhuStatus: "Lancar",
      wudhuScore: 78,
      wudhuAverage: 3.11,
      wudhuNotes: "Bagus dan tertib",
      shalatStatus: "Cukup",
      shalatScore: 69,
      shalatAverage: 2.77,
      shalatNotes: "Perlu bimbingan hafalan iftitah dan tasyahud",
      lastUpdated: "2026-09-29"
    }
  },
  currentPeriodId: "2025-2026_ganjil",
  periods: {
    "2025-2026_ganjil": {
      id: "2025-2026_ganjil",
      academicYear: "2025/2026",
      semester: "Ganjil",
      label: "Semester Ganjil 2025/2026",
      isLocked: false,
      createdAt: "2025-07-15T00:00:00.000Z",
      classes: [], // Will be populated or referenced
      attendance: {},
      nilai: {},
      keteranganTugas: {},
      journal: {},
      btaIbadah: {}
    }
  }
};

// Hubungkan data awal ke periode default
if (defaultAppData.periods && defaultAppData.periods["2025-2026_ganjil"]) {
  defaultAppData.periods["2025-2026_ganjil"].classes = defaultAppData.classes;
  defaultAppData.periods["2025-2026_ganjil"].attendance = defaultAppData.attendance;
  defaultAppData.periods["2025-2026_ganjil"].nilai = defaultAppData.nilai;
  defaultAppData.periods["2025-2026_ganjil"].keteranganTugas = defaultAppData.keteranganTugas;
  defaultAppData.periods["2025-2026_ganjil"].journal = defaultAppData.journal;
  defaultAppData.periods["2025-2026_ganjil"].btaIbadah = defaultAppData.btaIbadah || {};
}

