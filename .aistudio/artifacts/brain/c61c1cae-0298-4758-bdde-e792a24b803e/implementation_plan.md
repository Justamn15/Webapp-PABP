# Sistem Penyimpanan Data Multi-Semester & Tahun Ajaran

Arsitektur penyimpanan data historis per semester dan tahun ajaran yang memungkinkan guru beralih periode secara fleksibel, menyalin data siswa otomatis ke tahun ajaran baru tanpa menghapus riwayat nilai terdahulu, serta memproteksi data arsip dengan tombol buka kunci edit.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan desain telah diselaraskan berdasarkan klarifikasi dari Anda:
> 1. **Pemilihan Periode**: Dropdown pemilih Tahun Ajaran dan Semester disematkan langsung di bilah atas (Header) aplikasi agar selalu mudah diakses dari tab mana pun.
> 2. **Transisi Tahun / Semester Baru**: Sistem secara otomatis menyalin daftar kelas dan siswa yang ada ke periode baru dengan nilai dan presensi yang bersih (fresh) tanpa nilai lama.
> 3. **Pengamanan Data Lama**: Periode sebelumnya otomatis dikunci (arsip riwayat terlindungi) dan menyediakan tombol khusus **"Buka Kunci Edit"** jika sewaktu-waktu guru perlu melakukan revisi nilai lama.

---

### 1. Overview & Core Concept

- **Tujuan Utama**: Memastikan seluruh data presensi, jurnal mengajar, capaian keagamaan (BTA & praktik ibadah), serta nilai asesmen (TP, LM, STS, SAS) tersimpan utuh dan terpisah secara rapi per semester dan tahun ajaran.
- **Masalah yang Diselesaikan**: Guru tidak perlu takut kehilangan data saat memasuki tahun ajaran baru atau saat melakukan pembaruan berkala. Riwayat nilai siswa dari tahun-tahun sebelumnya tetap dapat dibuka, dicetak, dan ditinjau perkembangannya kapan saja.
- **Nilai Tambah**: Dilengkapi fitur **"Riwayat Perkembangan Siswa"** untuk memantau kemajuan membaca Al-Qur'an/Iqra serta kelancaran ibadah siswa dari semester ke semester selama bersekolah di SDN 5 Kandangan Barat.

---

### 2. User Experience & Visual Design

#### A. Alur Interaksi Pengguna (User Flow)
1. **Navigasi Bilah Atas (Header)**:
   - Di bilah atas (Header) terdapat tombol pemilih periode dengan ikon kalender: `Semester Ganjil 2025/2026`.
   - Mengklik tombol akan menampilkan menu dropdown berisi daftar tahun ajaran dan semester yang tersimpan, indikator status (Aktif / Terkunci), serta opsi aksi:
     - `+ Tambah Tahun / Semester Baru`
     - `Kelola Periode Akademik`
2. **Membuat Tahun Ajaran / Semester Baru**:
   - Guru membuka modal `Tambah Periode Baru`.
   - Guru memilih tahun ajaran (misal `2026/2027`) dan semester (`Ganjil` atau `Genap`).
   - Sistem secara cerdas menyalin daftar nama siswa per kelas dari semester sebelumnya, mereset presensi dan lembar nilai menjadi kosong siap pakai, serta secara otomatis mengunci periode sebelumnya.
   - Aplikasi langsung berpindah ke periode baru dengan notifikasi konfirmasi.
3. **Melihat dan Meninjau Nilai Tahun Sebelumnya**:
   - Guru cukup memilih periode lalu pada dropdown Header.
   - Seluruh tab (Presensi, Jurnal, Capaian Keagamaan, Nilai, Legger, Cetak) langsung menampilkan data arsip dari periode tersebut.
   - Muncul spanduk informatif: *"Periode ini terkunci sebagai arsip riwayat. Nilai dan presensi dilindungi agar tidak terubah tidak sengaja."*
   - Terdapat tombol **"Buka Kunci Edit"** bagi guru jika ingin membuka proteksi untuk merevisi data lama, dengan opsi **"Kunci Kembali"** setelah selesai.
4. **Analisis Perkembangan Siswa**:
   - Di tab Capaian Keagamaan dan Nilai, guru dapat mengklik tombol *"Riwayat Perkembangan"* pada baris siswa untuk melihat rekam jejak capaian siswa dari semester 1 hingga semester berjalan.

#### B. Identitas Visual & Bahasa Desain
- **Karakter Visual**: Profesional, akademis, rapi, dan menenangkan dengan palet khas Indigo dan aksen Emerald.
- **Top Bar Contract**: Dropdown periode terintegrasi rapi pada Header tanpa menambah baris ekstra (zero header bloat), tetap mempertahankan estetika bersih dan ergonomis di desktop maupun mobile.
- **Badge & Status**: Teks status arsip yang jelas (`Arsip Terkunci` / `Periode Aktif`) dengan warna kontras tanpa ornamen berlebihan.

---

### 3. Key Product Decisions & Trade-Offs

- **Struktur Penyimpanan Per-Periode (Scoped Period Storage)**:
  - *Pendekatan*: Setiap data presensi, nilai, jurnal, dan BTA disimpan dalam namespace ID periode (contoh: `2025-2026_ganjil`).
  - *Alasan*: Menjamin isolasi penuh antar semester sehingga mutasi data pada semester baru tidak akan pernah mengotori atau menghapus catatan semester sebelumnya.
  - *Alternatif yang Ditinggalkan*: Menyimpan satu objek tunggal dengan penambahan tag semester pada tiap baris; pendekatan ini rentan tabrakan data dan mempersulit proses reset kenaikan kelas.
- **Migrasi Otomatis Data yang Ada (Zero Data Loss Migration)**:
  - Data yang saat ini telah dibuat oleh pengguna akan secara otomatis diinisialisasi sebagai periode default (`Semester Ganjil 2025/2026`) tanpa perlu konfigurasi ulang.
- **Sinkronisasi Cloud Firestore & LocalStorage**:
  - Seluruh struktur periode didukung penuh pada penyimpanan lokal (`localStorage`), cadangan file JSON (`BackupTab`), serta sinkronisasi multi-device di Google Cloud Firestore.

---

### 4. Technical Architecture & Data Strategy

#### A. Diagram Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Bar (Header Navigation)                     │
│  [Logo SDN 5]  [Dropdown: Semester Ganjil 2025/2026 ▾]  [Cloud Status] │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Switch Period / Add Period
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          App State Controller                          │
│                                                                        │
│   activePeriodId: "2025-2026_ganjil"                                   │
│   periods: {                                                           │
│     "2024-2025_genap": { isLocked: true, classes, nilai, att, ... },   │
│     "2025-2026_ganjil": { isLocked: false, classes, nilai, att, ... }  │
│   }                                                                    │
│   schoolInfo: { name, logos, teacher, ttd, stempel }                   │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
        ┌───────────┴──────────┐        ┌───────────┴──────────┐
        ▼                      ▼        ▼                      ▼
┌───────────────┐      ┌─────────────┐┌───────────────┐ ┌────────────────┐
│ KehadiranTab  │      │ NilaiTab    ││ KeagamaanTab  │ │ Jurnal & Cetak │
│ (Presensi)    │      │ & Legger    ││ (BTA/Ibadah)  │ │ Laporan Resmi  │
└───────────────┘      └─────────────┘└───────────────┘ └────────────────┘
        │                      │               │               │
        └──────────────────────┼───────────────┴───────────────┘
                               ▼
        ┌──────────────────────────────────────────────┐
        │       Multi-Storage Persistence Layer        │
        │  • LocalStorage ('teacherApp_data')          │
        │  • Firebase Cloud Firestore (workspaces/uid) │
        │  • JSON Full Backup & Restore Engine         │
        └──────────────────────────────────────────────┘
```

#### B. Model Data (TypeScript Entities)

```typescript
export interface AcademicPeriod {
  id: string; // e.g. "2025-2026_ganjil"
  academicYear: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  label: string; // e.g. "Semester Ganjil 2025/2026"
  isLocked: boolean; // true jika diarsipkan / dikunci dari edit tidak sengaja
  createdAt: string;
  // Snapshot data independen per periode
  classes: ClassItem[];
  attendance: Record<string, AttendanceStatus>;
  nilai: Record<string, number>;
  keteranganTugas: Record<string, string>;
  journal: Record<string, JournalEntry>;
  btaIbadah: Record<string, StudentBTAIbadah>;
}

export interface AppData {
  school: SchoolInfo; // Profil sekolah global (logo, kepsek, guru, stempel)
  currentPeriodId: string;
  periods: Record<string, AcademicPeriod>;
  
  // Backward compatibility legacy accessors
  classes: ClassItem[];
  attendance: Record<string, AttendanceStatus>;
  nilai: Record<string, number>;
  keteranganTugas: Record<string, string>;
  journal: Record<string, JournalEntry>;
  btaIbadah?: Record<string, StudentBTAIbadah>;
}
```

#### C. Rencana Tahapan Eksekusi

1. **Pembaruan Tipe & Utilitas Periode (`src/types.ts` & `src/utils/periodHelpers.ts`)**:
   - Mendefinisikan struktur `AcademicPeriod` dan helper untuk pembuatan periode baru, migrasi data lama, serta penyalinan siswa otomatis.
2. **Penyempurnaan Komponen Header (`src/components/Header.tsx`)**:
   - Menambahkan dropdown pemilih tahun ajaran dan semester aktif.
   - Menyediakan modal dialog pembuatan semester/tahun ajaran baru dengan formulir validasi yang ramah pengguna.
3. **Penyempurnaan Pengendali Utama (`src/App.tsx`)**:
   - Mengelola pergantian periode aktif secara reaktif.
   - Menampilkan spanduk status jika periode yang dibuka dalam keadaan terkunci (dengan tombol buka kunci edit).
   - Memastikan sinkronisasi Cloud Firestore dan LocalStorage menyimpan seluruh rekam jejak periode.
4. **Pembaruan Backup & Restore (`src/components/BackupTab.tsx`)**:
   - Mendukung pencadangan berkas JSON yang memuat seluruh riwayat multi-tahun, serta pemulihan arsip lengkap.
5. **Fitur Riwayat Perkembangan Siswa (`src/components/StudentHistoryModal.tsx`)**:
   - Dialog visual untuk melihat perkembangan nilai dan capaian ibadah siswa dari semester ke semester sebelumnya.
6. **Verifikasi & Build Test**:
   - Memastikan seluruh modul lulus uji linting dan kompilasi Vite tanpa error.
