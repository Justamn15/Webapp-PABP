import React, { useState } from 'react';
import { AcademicPeriod } from '../types.ts';
import {
  X,
  Calendar,
  Plus,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  Copy,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { formatPeriodId, formatPeriodLabel, getSortedPeriods } from '../utils/periodHelpers.ts';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: Record<string, AcademicPeriod>;
  currentPeriodId: string;
  onSwitchPeriod: (periodId: string) => void;
  onCreatePeriod: (
    academicYear: string,
    semester: 'Ganjil' | 'Genap',
    autoLockPrevious: boolean,
    customLabel?: string
  ) => void;
  onToggleLock: (periodId: string, newLockedState: boolean) => void;
  onDeletePeriod: (periodId: string) => void;
  onRenamePeriod?: (
    periodId: string,
    newLabel: string,
    newAcademicYear?: string,
    newSemester?: 'Ganjil' | 'Genap'
  ) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
  isOpen,
  onClose,
  periods,
  currentPeriodId,
  onSwitchPeriod,
  onCreatePeriod,
  onToggleLock,
  onDeletePeriod,
  onRenamePeriod,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form states for creating a new period
  const currentPeriod = periods[currentPeriodId];
  
  // Predict next period default values
  const defaultYear = currentPeriod?.semester === 'Genap'
    ? (() => {
        const match = currentPeriod.academicYear.match(/^(\d{4})\/(\d{4})$/);
        if (match) {
          const y1 = parseInt(match[1], 10) + 1;
          const y2 = parseInt(match[2], 10) + 1;
          return `${y1}/${y2}`;
        }
        return '2026/2027';
      })()
    : (currentPeriod?.academicYear || '2025/2026');

  const defaultSemester: 'Ganjil' | 'Genap' = currentPeriod?.semester === 'Ganjil' ? 'Genap' : 'Ganjil';

  const [inputYear, setInputYear] = useState<string>(defaultYear);
  const [inputSemester, setInputSemester] = useState<'Ganjil' | 'Genap'>(defaultSemester);
  const [customLabel, setCustomLabel] = useState<string>(formatPeriodLabel(defaultYear, defaultSemester));
  const [isLabelCustomized, setIsLabelCustomized] = useState<boolean>(false);
  const [autoLockPrevious, setAutoLockPrevious] = useState<boolean>(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Rename states for managing periods
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState<string>('');
  const [editYearValue, setEditYearValue] = useState<string>('');
  const [editSemesterValue, setEditSemesterValue] = useState<'Ganjil' | 'Genap'>('Ganjil');

  const sortedList = getSortedPeriods(periods);
  const prospectiveId = formatPeriodId(inputYear, inputSemester);
  const isDuplicate = Boolean(periods[prospectiveId]);

  const handleYearChange = (year: string) => {
    setInputYear(year);
    if (!isLabelCustomized) {
      setCustomLabel(formatPeriodLabel(year, inputSemester));
    }
  };

  const handleSemesterChange = (sem: 'Ganjil' | 'Genap') => {
    setInputSemester(sem);
    if (!isLabelCustomized) {
      setCustomLabel(formatPeriodLabel(inputYear, sem));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputYear.trim()) {
      onShowToast('Tahun ajaran tidak boleh kosong!', 'error');
      return;
    }

    if (isDuplicate) {
      onShowToast(
        `Periode ${formatPeriodLabel(inputYear, inputSemester)} sudah ada di daftar. Silakan buka dari tab daftar periode.`,
        'warning'
      );
      return;
    }

    onCreatePeriod(inputYear.trim(), inputSemester, autoLockPrevious, customLabel.trim());
    onShowToast(`Periode ${customLabel.trim() || formatPeriodLabel(inputYear, inputSemester)} berhasil dibuat & diaktifkan!`, 'success');
    onClose();
  };

  const handleStartRename = (period: AcademicPeriod) => {
    setEditingPeriodId(period.id);
    setEditLabelValue(period.label);
    setEditYearValue(period.academicYear);
    setEditSemesterValue(period.semester);
    setDeleteConfirmId(null);
  };

  const handleCancelRename = () => {
    setEditingPeriodId(null);
  };

  const handleSaveRename = (periodId: string) => {
    if (!editLabelValue.trim()) {
      onShowToast('Nama semester / label periode tidak boleh kosong!', 'error');
      return;
    }
    if (onRenamePeriod) {
      onRenamePeriod(periodId, editLabelValue.trim(), editYearValue.trim(), editSemesterValue);
    }
    setEditingPeriodId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/15">
              <Calendar className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pengaturan Semester & Tahun Ajaran</h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Kelola riwayat data tahunan dan buat periode semester baru secara aman.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Semester / Tahun Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'list'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Daftar Riwayat Periode ({sortedList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 flex items-start gap-3">
                <Copy className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-950 block mb-1">
                    Salin Data Siswa Otomatis (Tanpa Nilai Lama)
                  </span>
                  <p className="text-indigo-800 leading-relaxed">
                    Saat periode baru dibuat, sistem otomatis menyalin daftar kelas dan nama siswa dari <strong>{currentPeriod?.label || 'periode aktif saat ini'}</strong>. Lembar nilai, rekap presensi, dan catatan tugas akan di-reset bersih agar siap digunakan mengajar di semester baru.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input Tahun Ajaran */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="yearSuggestions"
                    value={inputYear}
                    onChange={(e) => setInputYear(e.target.value)}
                    placeholder="Contoh: 2026/2027"
                    className="w-full text-sm font-semibold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    required
                  />
                  <datalist id="yearSuggestions">
                    <option value="2024/2025" />
                    <option value="2025/2026" />
                    <option value="2026/2027" />
                    <option value="2027/2028" />
                    <option value="2028/2029" />
                  </datalist>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan format empat digit bergaris miring (misal: 2026/2027)
                  </p>
                </div>

                {/* Pilihan Semester */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSemesterChange('Ganjil')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        inputSemester === 'Ganjil'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {inputSemester === 'Ganjil' && <Check className="w-3.5 h-3.5" />}
                      <span>Ganjil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSemesterChange('Genap')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        inputSemester === 'Genap'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {inputSemester === 'Genap' && <Check className="w-3.5 h-3.5" />}
                      <span>Genap</span>
                    </button>
                  </div>
                </div>

                {/* Input Nama / Label Periode Kustom */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Nama / Label Semester & Periode <span className="text-red-500">*</span>
                    </label>
                    {isLabelCustomized && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsLabelCustomized(false);
                          setCustomLabel(formatPeriodLabel(inputYear, inputSemester));
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset ke Default</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => {
                      setCustomLabel(e.target.value);
                      setIsLabelCustomized(true);
                    }}
                    placeholder={`Contoh: ${formatPeriodLabel(inputYear, inputSemester)}`}
                    className="w-full text-sm font-semibold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Anda dapat mengubah penamaan semester ini sesuai format sekolah (misal: "Semester 1 2026/2027" atau "Semester Ganjil 2026/2027").
                  </p>
                </div>
              </div>

              {/* Status Validasi Duplikasi */}
              {isDuplicate && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Periode <strong>{formatPeriodLabel(inputYear, inputSemester)}</strong> sudah ada di database. Silakan ganti tahun/semester atau buka dari tab daftar riwayat.
                  </span>
                </div>
              )}

              {/* Proteksi Otomatis Kunci Periode Lalu */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoLockPrevious}
                    onChange={(e) => setAutoLockPrevious(e.target.checked)}
                    className="mt-0.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Kunci Otomatis Periode Sebelumnya ({currentPeriod?.label})
                    </span>
                    <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                      Direkomendasikan agar data nilai dan presensi semester lalu terlindungi dari klik atau perubahan tidak sengaja saat Anda mengajar di semester baru.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isDuplicate || !inputYear.trim() || !customLabel.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat & Beralih ke Periode Baru</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Klik tombol <strong>Ubah Nama (Rename)</strong> untuk mengganti penamaan semester, atau klik salah satu periode untuk beralih tampilan.
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {sortedList.map((item) => {
                  const isActive = item.id === currentPeriodId;
                  const isEditingThis = editingPeriodId === item.id;
                  const totalStudents = item.classes?.reduce(
                    (sum, cls) => sum + (cls.students?.length || 0),
                    0
                  ) || 0;

                  if (isEditingThis) {
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 shadow-xs space-y-3 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Edit2 className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
                              Ubah Penamaan Semester / Periode
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">ID: {item.id}</span>
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nama / Label Semester Baru: <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editLabelValue}
                              onChange={(e) => setEditLabelValue(e.target.value)}
                              placeholder="Contoh: Semester Ganjil 2025/2026"
                              className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden text-slate-800"
                              autoFocus
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                                Tahun Ajaran:
                              </label>
                              <input
                                type="text"
                                value={editYearValue}
                                onChange={(e) => setEditYearValue(e.target.value)}
                                placeholder="2025/2026"
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                                Semester:
                              </label>
                              <select
                                value={editSemesterValue}
                                onChange={(e) => setEditSemesterValue(e.target.value as 'Ganjil' | 'Genap')}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                              >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100">
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveRename(item.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan Nama</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">
                            {item.label}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                              Sedang Aktif
                            </span>
                          )}
                          {item.isLocked ? (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Terkunci
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5" />
                              Terbuka (Dapat Diedit)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span>{item.classes?.length || 0} Kelas</span>
                          <span>&bull;</span>
                          <span>{totalStudents} Siswa Terdaftar</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Tombol Rename Periode */}
                        <button
                          type="button"
                          onClick={() => handleStartRename(item)}
                          className="p-2 rounded-xl text-xs font-semibold border bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 transition cursor-pointer"
                          title="Ubah / Rename Nama Semester"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Toggle Kunci */}
                        <button
                          type="button"
                          onClick={() => onToggleLock(item.id, !item.isLocked)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            item.isLocked
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                          title={item.isLocked ? 'Buka kunci periode' : 'Kunci periode agar aman'}
                        >
                          {item.isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>

                        {/* Tombol Hapus Periode (Hanya jika bukan aktif dan > 1 periode) */}
                        {sortedList.length > 1 && !isActive && (
                          deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeletePeriod(item.id);
                                  setDeleteConfirmId(null);
                                  onShowToast(`Periode ${item.label} telah dihapus.`, 'info');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="bg-slate-200 text-slate-700 text-[11px] px-2 py-1.5 rounded-lg font-bold cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-2 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer"
                              title="Hapus periode ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}

                        {/* Tombol Beralih */}
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSwitchPeriod(item.id);
                              onShowToast(`Beralih ke ${item.label}`, 'success');
                              onClose();
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <span>Buka</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-indigo-700 font-bold px-2 py-1">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
