import React, { useState } from 'react';
import { SchoolInfo, ClassItem } from '../types.ts';
import {
  X,
  School,
  Layers,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  Image as ImageIcon,
  PenTool,
  Stamp,
  Eye,
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolInfo;
  classes: ClassItem[];
  onSave: (updatedSchool: SchoolInfo, updatedClasses: ClassItem[]) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

// Helper to optimize and resize uploaded images (PNG transparency preserved, compressed data URL)
const processImageUpload = (
  file: File,
  maxDimension = 800,
  quality = 0.88
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berformat gambar (PNG, JPG, JPEG, WebP, atau SVG).'));
      return;
    }

    // If SVG, read text directly as data URL or text
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG if original is PNG to keep transparent background
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  isOpen,
  onClose,
  school,
  classes,
  onSave,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'school' | 'uploads' | 'classes' | 'students'>('uploads');

  // Form local state
  const [formSchool, setFormSchool] = useState<SchoolInfo>({
    ...school,
    logoKiriJurnal: school.logoKiriJurnal || '',
    logoKananJurnal: school.logoKananJurnal || '',
    ttdGuru: school.ttdGuru || '',
    ttdKepalaSekolah: school.ttdKepalaSekolah || '',
    stempelSekolah: school.stempelSekolah || '',
  });

  const [classList, setClassList] = useState<ClassItem[]>(
    classes.map((c) => ({ name: c.name, students: [...c.students] }))
  );

  // Class & Student sub-states
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassForStudent, setSelectedClassForStudent] = useState<string>(
    classes[0]?.name || ''
  );
  const [newStudentName, setNewStudentName] = useState('');
  const [batchStudentText, setBatchStudentText] = useState('');
  const [showBatchAdd, setShowBatchAdd] = useState(false);

  // Edit single student inline
  const [editingStudentIdx, setEditingStudentIdx] = useState<number | null>(null);
  const [editingStudentVal, setEditingStudentVal] = useState('');

  // Count uploaded files
  const uploadedCount = [
    Boolean(formSchool.logoKiriJurnal),
    Boolean(formSchool.logoKananJurnal),
    Boolean(formSchool.ttdGuru),
    Boolean(formSchool.ttdKepalaSekolah),
    Boolean(formSchool.stempelSekolah),
  ].filter(Boolean).length;

  // Handle specialized uploads for the 5 files + general logo
  const handleGenericFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: keyof SchoolInfo,
    labelSuccess: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageUpload(file);
      setFormSchool((prev) => ({ ...prev, [fieldKey]: dataUrl }));
      onShowToast(`${labelSuccess} berhasil diunggah! Jangan lupa klik 'Simpan Perubahan'.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses gambar.';
      onShowToast(msg, 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveField = (fieldKey: keyof SchoolInfo, label: string) => {
    setFormSchool((prev) => ({ ...prev, [fieldKey]: '' }));
    onShowToast(`${label} telah dihapus.`, 'info');
  };

  // Class management handlers
  const handleAddClass = () => {
    const trimmed = newClassName.trim();
    if (!trimmed) return;
    if (classList.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      onShowToast('Nama kelas sudah ada!', 'warning');
      return;
    }
    setClassList((prev) => [...prev, { name: trimmed, students: [] }]);
    setNewClassName('');
    if (!selectedClassForStudent) {
      setSelectedClassForStudent(trimmed);
    }
    onShowToast(`Kelas "${trimmed}" berhasil ditambahkan.`, 'success');
  };

  const handleDeleteClass = (idx: number) => {
    if (classList.length <= 1) {
      onShowToast('Minimal harus ada 1 kelas terdaftar.', 'error');
      return;
    }
    const target = classList[idx];
    if (window.confirm(`Yakin ingin menghapus ${target.name} beserta seluruh daftar siswanya?`)) {
      const updated = classList.filter((_, i) => i !== idx);
      setClassList(updated);
      if (selectedClassForStudent === target.name) {
        setSelectedClassForStudent(updated[0]?.name || '');
      }
      onShowToast(`Kelas ${target.name} dihapus.`, 'info');
    }
  };

  // Student management handlers
  const activeClassObj = classList.find((c) => c.name === selectedClassForStudent) || classList[0];

  const handleAddSingleStudent = () => {
    const trimmed = newStudentName.trim();
    if (!trimmed || !activeClassObj) return;

    setClassList((prev) =>
      prev.map((c) => {
        if (c.name === activeClassObj.name) {
          return { ...c, students: [...c.students, trimmed] };
        }
        return c;
      })
    );
    setNewStudentName('');
    onShowToast(`Siswa "${trimmed}" berhasil ditambahkan ke ${activeClassObj.name}.`, 'success');
  };

  const handleBatchAddStudents = () => {
    if (!batchStudentText.trim() || !activeClassObj) return;

    const names = batchStudentText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    setClassList((prev) =>
      prev.map((c) => {
        if (c.name === activeClassObj.name) {
          return { ...c, students: [...c.students, ...names] };
        }
        return c;
      })
    );
    setBatchStudentText('');
    setShowBatchAdd(false);
    onShowToast(`${names.length} siswa berhasil ditambahkan ke ${activeClassObj.name}.`, 'success');
  };

  const handleDeleteStudent = (studentIdx: number) => {
    if (!activeClassObj) return;
    const studentName = activeClassObj.students[studentIdx];
    if (window.confirm(`Yakin ingin menghapus siswa "${studentName}" dari ${activeClassObj.name}?`)) {
      setClassList((prev) =>
        prev.map((c) => {
          if (c.name === activeClassObj.name) {
            return {
              ...c,
              students: c.students.filter((_, idx) => idx !== studentIdx),
            };
          }
          return c;
        })
      );
      onShowToast(`Siswa "${studentName}" dihapus.`, 'info');
    }
  };

  const handleStartEditStudent = (idx: number, currentName: string) => {
    setEditingStudentIdx(idx);
    setEditingStudentVal(currentName);
  };

  const handleSaveEditStudent = () => {
    if (!activeClassObj || editingStudentIdx === null) return;
    const trimmed = editingStudentVal.trim();
    if (!trimmed) return;

    setClassList((prev) =>
      prev.map((c) => {
        if (c.name === activeClassObj.name) {
          const updated = [...c.students];
          updated[editingStudentIdx] = trimmed;
          return { ...c, students: updated };
        }
        return c;
      })
    );
    setEditingStudentIdx(null);
    setEditingStudentVal('');
    onShowToast('Nama siswa diperbarui.', 'success');
  };

  const handleSaveAll = () => {
    onSave(formSchool, classList);
    onShowToast('Pengaturan dan berkas berhasil disimpan!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-800">
              Pengaturan Master Data & Berkas Cetak
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="px-6 flex border-b border-slate-200 bg-white text-xs sm:text-sm font-semibold gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('uploads')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'uploads'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Logo, TTD & Stempel</span>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold ml-1">
              {uploadedCount}/5
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('school')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'school'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Profil Sekolah & Guru</span>
          </button>

          <button
            onClick={() => setActiveSubTab('classes')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'classes'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kelola Kelas ({classList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('students')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'students'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Daftar Siswa</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: UPLOAD LOGO KANAN, LOGO KIRI, TTD GURU, TTD KEPSEK, STEMPEL SEKOLAH */}
          {/* ========================================================================= */}
          {activeSubTab === 'uploads' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <p className="font-bold text-sm text-indigo-950 mb-0.5">
                    Unggah Logo, Tanda Tangan Digital & Stempel Sekolah
                  </p>
                  <p>
                    Format yang disarankan adalah <strong>PNG transparan</strong> agar tanda tangan dan cap stempel terlihat bersih, elegan, dan menempel natural di lembar cetak Jurnal Pembelajaran dan Rekap Absensi.
                  </p>
                </div>
              </div>

              {/* Grid 5 Berkas Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. LOGO SAMPING KIRI JURNAL */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          1
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">
                          Logo Samping Kiri Jurnal
                        </h4>
                      </div>
                      {formSchool.logoKiriJurnal ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Kustom
                        </span>
                      ) : (
                        <span className="text-[11px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                          Default Kab. HSS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Logo di sisi kiri atas Kop Surat Jurnal (misal lambang Kabupaten / Kementerian Agama / Tut Wuri Handayani).
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                    <div className="w-16 h-16 border border-slate-300 rounded-xl flex items-center justify-center bg-white p-1 shrink-0 overflow-hidden shadow-xs">
                      <img
                        src={formSchool.logoKiriJurnal || formSchool.logo || '/logo_hss.svg'}
                        alt="Logo Kiri"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formSchool.logoKiriJurnal ? 'Ganti Logo Kiri' : 'Upload Logo Kiri'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGenericFileUpload(e, 'logoKiriJurnal', 'Logo Samping Kiri')}
                          className="hidden"
                        />
                      </label>
                      {formSchool.logoKiriJurnal && (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField('logoKiriJurnal', 'Logo Samping Kiri')}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                          >
                            Reset ke Default
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. LOGO SAMPING KANAN JURNAL */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          2
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">
                          Logo Samping Kanan Jurnal
                        </h4>
                      </div>
                      {formSchool.logoKananJurnal ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Kustom
                        </span>
                      ) : (
                        <span className="text-[11px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                          Default Tut Wuri
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Logo di sisi kanan atas Kop Surat Jurnal (misal lambang Tut Wuri Handayani atau logo khusus sekolah).
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                    <div className="w-16 h-16 border border-slate-300 rounded-xl flex items-center justify-center bg-white p-1 shrink-0 overflow-hidden shadow-xs">
                      <img
                        src={formSchool.logoKananJurnal || '/logo_tutwuri.svg'}
                        alt="Logo Kanan"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formSchool.logoKananJurnal ? 'Ganti Logo Kanan' : 'Upload Logo Kanan'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGenericFileUpload(e, 'logoKananJurnal', 'Logo Samping Kanan')}
                          className="hidden"
                        />
                      </label>
                      {formSchool.logoKananJurnal && (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField('logoKananJurnal', 'Logo Samping Kanan')}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                          >
                            Reset ke Default
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. FILE TTD GURU PABP */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          3
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">
                          File TTD Guru PABP
                        </h4>
                      </div>
                      {formSchool.ttdGuru ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ada
                        </span>
                      ) : (
                        <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Tanda tangan digital Guru ({formSchool.teacher}). Ditampilkan tepat di atas nama guru saat dicetak.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                    <div className="w-20 h-16 border border-slate-300 rounded-xl flex items-center justify-center bg-white p-1 shrink-0 overflow-hidden shadow-xs relative">
                      {formSchool.ttdGuru ? (
                        <img
                          src={formSchool.ttdGuru}
                          alt="TTD Guru"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <PenTool className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formSchool.ttdGuru ? 'Ganti TTD Guru' : 'Upload TTD Guru'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGenericFileUpload(e, 'ttdGuru', 'TTD Guru PABP')}
                          className="hidden"
                        />
                      </label>
                      {formSchool.ttdGuru && (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField('ttdGuru', 'TTD Guru')}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                          >
                            Hapus TTD
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. FILE TTD KEPALA SEKOLAH */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          4
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">
                          File TTD Kepala Sekolah
                        </h4>
                      </div>
                      {formSchool.ttdKepalaSekolah ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ada
                        </span>
                      ) : (
                        <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Tanda tangan digital Kepala Sekolah ({formSchool.headName}). Ditampilkan di kolom pengesahan sebelah kiri.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                    <div className="w-20 h-16 border border-slate-300 rounded-xl flex items-center justify-center bg-white p-1 shrink-0 overflow-hidden shadow-xs relative">
                      {formSchool.ttdKepalaSekolah ? (
                        <img
                          src={formSchool.ttdKepalaSekolah}
                          alt="TTD Kepsek"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <PenTool className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formSchool.ttdKepalaSekolah ? 'Ganti TTD Kepsek' : 'Upload TTD Kepsek'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGenericFileUpload(e, 'ttdKepalaSekolah', 'TTD Kepala Sekolah')}
                          className="hidden"
                        />
                      </label>
                      {formSchool.ttdKepalaSekolah && (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField('ttdKepalaSekolah', 'TTD Kepala Sekolah')}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                          >
                            Hapus TTD
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. FILE STEMPEL SEKOLAH */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between md:col-span-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          5
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">
                          File Stempel Sekolah (Cap Basah)
                        </h4>
                      </div>
                      {formSchool.stempelSekolah ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ada
                        </span>
                      ) : (
                        <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Cap stempel resmi sekolah (disarankan berlatar belakang transparan). Otomatis diletakkan menumpuk / di samping tanda tangan Kepala Sekolah secara rapi dan proporsional.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-slate-200/80">
                    <div className="w-20 h-20 border border-slate-300 rounded-xl flex items-center justify-center bg-white p-1 shrink-0 overflow-hidden shadow-xs">
                      {formSchool.stempelSekolah ? (
                        <img
                          src={formSchool.stempelSekolah}
                          alt="Stempel Sekolah"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Stamp className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formSchool.stempelSekolah ? 'Ganti File Stempel' : 'Upload File Stempel Sekolah'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGenericFileUpload(e, 'stempelSekolah', 'Stempel Sekolah')}
                          className="hidden"
                        />
                      </label>
                      {formSchool.stempelSekolah && (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField('stempelSekolah', 'Stempel Sekolah')}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                          >
                            Hapus Stempel
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400">
                        Disarankan file format .PNG transparan bulat/lingkaran warna biru/ungu stempel resmi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW BOX OF SIGNATURES & STAMP */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Pratinjau Hasil Tanda Tangan & Stempel Pada Dokumen Cetak</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
                  {/* Preview Kepala Sekolah */}
                  <div className="text-center">
                    <p className="font-semibold text-slate-700">
                      Mengetahui,<br />Kepala Sekolah {formSchool.name}
                    </p>
                    <div className="relative h-20 my-1 flex items-center justify-center">
                      {formSchool.stempelSekolah && (
                        <img
                          src={formSchool.stempelSekolah}
                          alt="Stempel"
                          className="absolute left-4 top-0 h-20 w-20 object-contain opacity-85 mix-blend-multiply pointer-events-none z-20"
                        />
                      )}
                      {formSchool.ttdKepalaSekolah ? (
                        <img
                          src={formSchool.ttdKepalaSekolah}
                          alt="TTD Kepsek"
                          className="h-16 max-w-[150px] object-contain relative z-10"
                        />
                      ) : (
                        <div className="h-16 flex items-center justify-center text-[11px] text-slate-400 italic">
                          (TTD Kepsek belum diunggah)
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold underline text-slate-900">{formSchool.headName}</p>
                      <p className="text-slate-600 text-[11px]">{formSchool.headNip}</p>
                    </div>
                  </div>

                  {/* Preview Guru PABP */}
                  <div className="text-center">
                    <p className="font-semibold text-slate-700">
                      {formSchool.place || 'Kandangan'}, 30 September 2026<br />
                      Guru Mapel PAI & Budi Pekerti
                    </p>
                    <div className="h-20 my-1 flex items-center justify-center">
                      {formSchool.ttdGuru ? (
                        <img
                          src={formSchool.ttdGuru}
                          alt="TTD Guru"
                          className="h-16 max-w-[150px] object-contain"
                        />
                      ) : (
                        <div className="h-16 flex items-center justify-center text-[11px] text-slate-400 italic">
                          (TTD Guru belum diunggah)
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold underline text-slate-900">{formSchool.teacher}</p>
                      <p className="text-slate-600 text-[11px]">{formSchool.nip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROFIL SEKOLAH */}
          {/* ========================================================================= */}
          {activeSubTab === 'school' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={formSchool.name}
                    onChange={(e) => setFormSchool({ ...formSchool, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Alamat Lengkap Sekolah (Untuk Kop Surat)
                  </label>
                  <input
                    type="text"
                    value={formSchool.address}
                    onChange={(e) => setFormSchool({ ...formSchool, address: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formSchool.subject}
                    onChange={(e) => setFormSchool({ ...formSchool, subject: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Semester & Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={formSchool.semester}
                    onChange={(e) => setFormSchool({ ...formSchool, semester: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Nama Guru & Gelar
                  </label>
                  <input
                    type="text"
                    value={formSchool.teacher}
                    onChange={(e) => setFormSchool({ ...formSchool, teacher: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    NIP / NI PPPK Guru
                  </label>
                  <input
                    type="text"
                    value={formSchool.nip}
                    onChange={(e) => setFormSchool({ ...formSchool, nip: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formSchool.headName}
                    onChange={(e) => setFormSchool({ ...formSchool, headName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formSchool.headNip}
                    onChange={(e) => setFormSchool({ ...formSchool, headNip: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Kota / Tempat Tanggal Surat
                  </label>
                  <input
                    type="text"
                    value={formSchool.place}
                    onChange={(e) => setFormSchool({ ...formSchool, place: e.target.value })}
                    placeholder="Contoh: Kandangan"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    KKM (Kriteria Ketuntasan Minimal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSchool.kkm}
                    onChange={(e) => setFormSchool({ ...formSchool, kkm: parseInt(e.target.value) || 75 })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tabular-nums font-bold"
                  />
                </div>

                {/* Logo Utama Sekolah (Bilah atas aplikasi) */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Logo Utama Lembaga / Sekolah (Bilah Atas Aplikasi)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-16 h-16 border border-slate-300 rounded-xl flex items-center justify-center bg-white p-1 overflow-hidden shrink-0 shadow-xs">
                      {formSchool.logo ? (
                        <img
                          src={formSchool.logo}
                          alt="Preview Logo"
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Pilih Gambar Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGenericFileUpload(e, 'logo', 'Logo Utama')}
                            className="hidden"
                          />
                        </label>

                        {formSchool.logo && (
                          <button
                            type="button"
                            onClick={() => handleRemoveField('logo', 'Logo Utama')}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded cursor-pointer"
                          >
                            Hapus Logo
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Logo ini ditampilkan di bilah atas aplikasi samping nama sekolah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: KELOLA KELAS */}
          {/* ========================================================================= */}
          {activeSubTab === 'classes' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">Daftar Kelas Terdaftar:</h4>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {classList.map((c, idx) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {c.students.length} Siswa
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteClass(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Class Form */}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Nama kelas baru (misal: Kelas 1 B, Kelas Unggulan)..."
                  className="flex-grow border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddClass();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddClass}
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kelas</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: KELOLA SISWA */}
          {/* ========================================================================= */}
          {activeSubTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <label htmlFor="select-class-student" className="font-bold text-xs text-slate-700">
                    Pilih Kelas:
                  </label>
                  <select
                    id="select-class-student"
                    value={selectedClassForStudent}
                    onChange={(e) => setSelectedClassForStudent(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm bg-white font-semibold text-slate-800 outline-none"
                  >
                    {classList.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.students.length} Siswa)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBatchAdd(!showBatchAdd)}
                  className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline cursor-pointer"
                >
                  {showBatchAdd ? 'Tutup Input Banyak' : '+ Tambah Banyak Siswa Sekaligus'}
                </button>
              </div>

              {/* Batch Add Textarea */}
              {showBatchAdd && (
                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2">
                  <label className="block text-xs font-bold text-indigo-900">
                    Tempel daftar nama siswa (1 nama per baris):
                  </label>
                  <textarea
                    rows={4}
                    value={batchStudentText}
                    onChange={(e) => setBatchStudentText(e.target.value)}
                    placeholder="Muhammad Ali&#10;Siti Fatimah&#10;Ahmad Fauzan"
                    className="w-full border border-indigo-200 bg-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBatchAdd(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchAddStudents}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold"
                    >
                      Simpan Daftar Nama
                    </button>
                  </div>
                </div>
              )}

              {/* Student List */}
              <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50/40">
                {!activeClassObj || activeClassObj.students.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Belum ada siswa di kelas ini. Masukkan nama siswa di bawah.
                  </p>
                ) : (
                  activeClassObj.students.map((student, idx) => (
                    <div
                      key={`${student}_${idx}`}
                      className="flex items-center justify-between bg-white border border-slate-200/80 px-3 py-2 rounded-xl text-xs hover:border-slate-300 transition"
                    >
                      {editingStudentIdx === idx ? (
                        <div className="flex items-center gap-2 flex-grow mr-2">
                          <input
                            type="text"
                            value={editingStudentVal}
                            onChange={(e) => setEditingStudentVal(e.target.value)}
                            className="flex-grow border border-indigo-300 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditStudent();
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditStudent}
                            className="bg-emerald-600 text-white p-1 rounded-md hover:bg-emerald-500"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudentIdx(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {idx + 1}. {student}
                        </span>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        {editingStudentIdx !== idx && (
                          <button
                            type="button"
                            onClick={() => handleStartEditStudent(idx, student)}
                            className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                            title="Edit nama siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                          title="Hapus siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Single Student Input */}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nama lengkap siswa baru..."
                  className="flex-grow border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSingleStudent();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSingleStudent}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex justify-between items-center">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadedCount} dari 5 berkas cetak terpasang</span>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
