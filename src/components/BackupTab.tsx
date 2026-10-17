import React, { useRef, useState } from 'react';
import { AppData } from '../types.ts';
import { defaultAppData } from '../defaultData.ts';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  FileJson,
  AlertCircle,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogIn,
  CheckCircle2,
  Loader2,
  Smartphone
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface BackupTabProps {
  appData: AppData;
  user: User | null;
  isSyncing: boolean;
  lastCloudSync: string | null;
  onLoginGoogle: () => void;
  onSaveToCloud: () => Promise<void>;
  onLoadFromCloud: () => Promise<void>;
  onRestoreData: (restored: AppData) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onOpenAndroidModal?: () => void;
}

export const BackupTab: React.FC<BackupTabProps> = ({
  appData,
  user,
  isSyncing,
  lastCloudSync,
  onLoginGoogle,
  onSaveToCloud,
  onLoadFromCloud,
  onRestoreData,
  onShowToast,
  onOpenAndroidModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDownloadBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Backup_Data_Guru_SDN5_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      onShowToast('File backup JSON berhasil diunduh ke perangkat Anda.', 'success');
    } catch {
      onShowToast('Gagal membuat file backup.', 'error');
    }
  };

  const handleRestoreBackup = () => {
    if (!selectedFile) {
      onShowToast('Pilih file backup (.json) terlebih dahulu!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AppData;

        // Validation check
        if (parsed.school && parsed.classes && Array.isArray(parsed.classes)) {
          if (!parsed.school.place) parsed.school.place = 'Kandangan';
          if (parsed.school.logo === undefined) parsed.school.logo = '';
          if (!parsed.attendance) parsed.attendance = {};
          if (!parsed.nilai) parsed.nilai = {};
          if (!parsed.keteranganTugas) parsed.keteranganTugas = {};
          if (!parsed.journal) parsed.journal = {};

          onRestoreData(parsed);
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onShowToast('Data aplikasi berhasil dipulihkan dari file backup!', 'success');
        } else {
          onShowToast('Format file backup tidak valid. Periksa isi file JSON.', 'error');
        }
      } catch {
        onShowToast('Gagal memproses file JSON. Pastikan file tidak rusak.', 'error');
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Peringatan: Seluruh data perubahan (presensi, nilai, dan penambahan siswa) akan direset ke data awal bawaan sekolah. Lanjutkan?'
      )
    ) {
      onRestoreData(defaultAppData);
      onShowToast('Data aplikasi telah dikembalikan ke data awal standar.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloud Firestore Storage Hub Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-indigo-700/80">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-700/60">
          <div className="flex items-center gap-3.5">
            <div className="bg-white/10 p-3 rounded-2xl text-white backdrop-blur-xs border border-white/15">
              <Cloud className="w-7 h-7 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Penyimpanan Cloud (Firestore)</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Aktif & Terhubung
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Data presensi, nilai, dan profil sekolah tersimpan secara aman di Firebase Cloud Firestore.
              </p>
            </div>
          </div>

          {!user ? (
            <button
              onClick={onLoginGoogle}
              className="bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-indigo-600" />
              <span>Masuk dengan Google</span>
            </button>
          ) : (
            <div className="text-right text-xs">
              <span className="text-indigo-300">Akun Terhubung:</span>
              <p className="font-bold text-white truncate max-w-[220px]">{user.email}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 items-center">
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs text-indigo-200 leading-relaxed">
              {user ? (
                <>
                  Setiap kali Anda mengisi nilai atau kehadiran, sistem secara otomatis mensinkronkan perubahan ke Cloud database di bawah akun <strong>{user.email}</strong>. Anda dapat membuka webapp ini dari perangkat lain (laptop/smartphone) dan data akan selalu up-to-date.
                </>
              ) : (
                <>
                  Silakan masuk dengan akun Google Anda untuk mengaktifkan sinkronisasi otomatis ke akun pribadi Anda. Data saat ini tersimpan di memori browser lokal.
                </>
              )}
            </p>
            {lastCloudSync && (
              <p className="text-[11px] text-emerald-300 font-mono">
                Terakhir disinkronkan ke Cloud: {new Date(lastCloudSync).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={onSaveToCloud}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/40 shadow-xs"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              <span>Simpan ke Cloud Sekarang</span>
            </button>

            <button
              onClick={onLoadFromCloud}
              disabled={isSyncing}
              className="bg-white/10 hover:bg-white/15 active:scale-95 disabled:opacity-50 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <CloudDownload className="w-4 h-4 text-indigo-200" />
              <span>Muat Data dari Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Local JSON Backup & Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl text-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Backup File JSON Lokal</h3>
                <p className="text-xs text-slate-500">Unduh salinan data fisik ke laptop / HP</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              File cadangan memuat seluruh rekam jejak penilaian, presensi, jurnal, serta capaian keagamaan untuk seluruh periode (<strong className="font-bold text-slate-800">{Object.keys(appData.periods || {}).length || 1} Semester / Tahun Ajaran</strong>) secara komprehensif.
            </p>

            <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Semua data arsip tahun-tahun sebelumnya terlindungi dalam satu berkas.</span>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File Backup (JSON)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl text-xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Restore dari File JSON</h3>
                <p className="text-xs text-slate-500">Unggah file backup JSON dari komputer</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Pilih file backup JSON sebelumnya untuk menimpa data saat ini dan menyinkronkannya kembali ke cloud.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih File JSON:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer border border-slate-200 rounded-xl p-1"
              />
            </div>
          </div>

          <button
            onClick={handleRestoreBackup}
            disabled={!selectedFile}
            className="w-full bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileJson className="w-4 h-4" />
            <span>Upload & Pulihkan Data Sekarang</span>
          </button>
        </div>
      </div>

      {/* Android APK & PWA Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Jalankan di Android / Unduh File APK</h4>
            <p className="text-xs text-emerald-800">
              Pasang aplikasi langsung di smartphone Android atau konversi menjadi file APK mandiri.
            </p>
          </div>
        </div>

        {onOpenAndroidModal && (
          <button
            onClick={onOpenAndroidModal}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Buka Panduan APK & Android</span>
          </button>
        )}
      </div>

      {/* Factory Reset / Standard Initial State Card */}
      <div className="bg-rose-50/60 border border-rose-200 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold text-rose-900 text-sm">Kembalikan ke Data Bawaan Sistem</h4>
            <p className="text-xs text-rose-700">
              Reset seluruh pengaturan, kelas, dan presensi ke data bawaan SD Negeri 5 Kandangan Barat.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetToDefault}
          className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Data Bawaan</span>
        </button>
      </div>
    </div>
  );
};
