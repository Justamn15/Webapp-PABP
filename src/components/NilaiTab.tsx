import React, { useMemo } from 'react';
import { ClassItem, AssessmentType, SchoolInfo } from '../types.ts';
import {
  SquarePen,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award
} from 'lucide-react';

interface NilaiTabProps {
  school: SchoolInfo;
  classes: ClassItem[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  selectedJenis: AssessmentType;
  onSelectJenis: (jenis: AssessmentType) => void;
  selectedSubIndex: number;
  onSelectSubIndex: (subIndex: number) => void;
  nilai: Record<string, number>;
  onUpdateNilai: (className: string, jenis: AssessmentType, subIndex: number, student: string, score: number | null) => void;
  keteranganTugas: Record<string, string>;
  onUpdateKeteranganTugas: (className: string, jenis: AssessmentType, subIndex: number, text: string) => void;
  onClearColumn: (className: string, jenis: AssessmentType, subIndex: number) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  isPeriodLocked?: boolean;
}

export const NilaiTab: React.FC<NilaiTabProps> = ({
  school,
  classes,
  selectedClass,
  onSelectClass,
  selectedJenis,
  onSelectJenis,
  selectedSubIndex,
  onSelectSubIndex,
  nilai,
  onUpdateNilai,
  keteranganTugas,
  onUpdateKeteranganTugas,
  onClearColumn,
  onShowToast,
  isPeriodLocked = false,
}) => {
  const currentClassObj = classes.find((c) => c.name === selectedClass) || classes[0];

  const maxSubOptions = useMemo(() => {
    if (selectedJenis === 'TP') return 50;
    if (selectedJenis === 'LM') return 15;
    return 1;
  }, [selectedJenis]);

  const subOptions = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= maxSubOptions; i++) {
      list.push(i);
    }
    return list;
  }, [maxSubOptions]);

  const ketKey = `${currentClassObj?.name}_${selectedJenis}_${selectedSubIndex}`;
  const currentKeterangan = keteranganTugas[ketKey] || '';

  const getSubLabel = () => {
    if (selectedJenis === 'TP') return 'Tujuan Pembelajaran (TP):';
    if (selectedJenis === 'LM') return 'Lingkup Materi (LM):';
    if (selectedJenis === 'STS') return 'Sumatif Tengah Semester:';
    return 'Sumatif Akhir Semester:';
  };

  const handleClearCurrentColumn = () => {
    if (!currentClassObj) return;
    if (window.confirm(`Yakin ingin mengosongkan nilai ${selectedJenis} ke-${selectedSubIndex} untuk ${currentClassObj.name}?`)) {
      onClearColumn(currentClassObj.name, selectedJenis, selectedSubIndex);
      onShowToast(`Nilai kolom ${selectedJenis} ke-${selectedSubIndex} berhasil dibersihkan`, 'info');
    }
  };

  const handleSetAllToKkm = () => {
    if (!currentClassObj) return;
    currentClassObj.students.forEach((student) => {
      onUpdateNilai(currentClassObj.name, selectedJenis, selectedSubIndex, student, school.kkm);
    });
    onShowToast(`Semua siswa diisi dengan nilai KKM (${school.kkm})`, 'success');
  };

  // Column statistics
  const columnStats = useMemo(() => {
    if (!currentClassObj) return { filled: 0, total: 0, avg: 0, tuntas: 0, belum: 0 };
    let filled = 0;
    let sum = 0;
    let tuntas = 0;
    let belum = 0;

    currentClassObj.students.forEach((student) => {
      const scoreKey = `${currentClassObj.name}_${selectedJenis}_${selectedSubIndex}_${student}`;
      const val = nilai[scoreKey];
      if (val !== undefined && val !== null) {
        filled++;
        sum += val;
        if (val >= school.kkm) tuntas++;
        else belum++;
      }
    });

    const avg = filled > 0 ? (sum / filled).toFixed(1) : '0';
    return { filled, total: currentClassObj.students.length, avg, tuntas, belum };
  }, [currentClassObj, selectedJenis, selectedSubIndex, nilai, school.kkm]);

  return (
    <div className="space-y-6">
      {/* Selector Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        {/* Class */}
        <div className="flex items-center gap-3">
          <label htmlFor="select-kelas-nilai" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Pilih Kelas:
          </label>
          <select
            id="select-kelas-nilai"
            value={currentClassObj ? currentClassObj.name : ''}
            onChange={(e) => onSelectClass(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.students.length} Siswa)
              </option>
            ))}
          </select>
        </div>

        {/* Assessment Type */}
        <div className="flex items-center gap-3">
          <label htmlFor="select-jenis-nilai" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Jenis Penilaian:
          </label>
          <select
            id="select-jenis-nilai"
            value={selectedJenis}
            onChange={(e) => {
              const val = e.target.value as AssessmentType;
              onSelectJenis(val);
              onSelectSubIndex(1);
            }}
            className="border border-indigo-200 bg-indigo-50/50 text-indigo-900 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="TP">TP (Tujuan Pembelajaran)</option>
            <option value="LM">LM (Lingkup Materi)</option>
            <option value="STS">STS (Sumatif Tengah Semester)</option>
            <option value="SAS">SAS (Sumatif Akhir Semester)</option>
          </select>
        </div>

        {/* Sub index */}
        <div className="flex items-center gap-3">
          <label htmlFor="select-sub-nilai" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            {getSubLabel()}
          </label>
          <select
            id="select-sub-nilai"
            value={selectedSubIndex}
            onChange={(e) => onSelectSubIndex(parseInt(e.target.value) || 1)}
            disabled={maxSubOptions <= 1}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
          >
            {subOptions.map((opt) => (
              <option key={opt} value={opt}>
                Nomor / Pertemuan {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description & Quick Tools Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-grow max-w-xl">
          <label htmlFor="input-keterangan-tugas" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Keterangan / Deskripsi Tugas ({selectedJenis} #{selectedSubIndex}):
          </label>
          <input
            id="input-keterangan-tugas"
            type="text"
            value={currentKeterangan}
            onChange={(e) => {
              if (currentClassObj) {
                onUpdateKeteranganTugas(currentClassObj.name, selectedJenis, selectedSubIndex, e.target.value);
              }
            }}
            placeholder="Contoh: Menghafal Surah Al-Fatihah, Hukum Tajwid, dsb."
            className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSetAllToKkm}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title={`Isi semua siswa yang belum dinilai dengan nilai KKM (${school.kkm})`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Isi Semua KKM ({school.kkm})</span>
          </button>

          <button
            onClick={handleClearCurrentColumn}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Bersihkan Kolom Ini</span>
          </button>
        </div>
      </div>

      {/* Quick Stats on this column */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Terisi</span>
          <span className="text-base font-bold text-slate-800 tabular-nums">
            {columnStats.filled} / {columnStats.total}
          </span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-700">Tuntas (≥{school.kkm})</span>
          <span className="text-base font-bold text-emerald-600 tabular-nums">{columnStats.tuntas}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-rose-700">Belum Tuntas</span>
          <span className="text-base font-bold text-rose-600 tabular-nums">{columnStats.belum}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-amber-700">Rata-rata</span>
          <span className="text-base font-bold text-amber-600 tabular-nums">{columnStats.avg}</span>
        </div>
      </div>

      {/* Scores Input Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SquarePen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Form Nilai: {currentClassObj?.name} · {selectedJenis} #{selectedSubIndex}
            </h3>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-semibold tabular-nums">
            KKM: {school.kkm}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3 w-14 text-center">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3 text-center w-40">Nilai (0-100)</th>
                <th className="p-3 w-48">Status Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {!currentClassObj || currentClassObj.students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                    Belum ada siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                currentClassObj.students.map((student, idx) => {
                  const scoreKey = `${currentClassObj.name}_${selectedJenis}_${selectedSubIndex}_${student}`;
                  const currentScore = nilai[scoreKey];
                  const hasScore = currentScore !== undefined && currentScore !== null;
                  const isTuntas = hasScore && currentScore >= school.kkm;

                  return (
                    <tr key={student} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-semibold text-xs tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {student}
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hasScore ? currentScore : ''}
                          disabled={isPeriodLocked}
                          onChange={(e) => {
                            if (isPeriodLocked) {
                              onShowToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
                              return;
                            }
                            const valStr = e.target.value;
                            if (valStr === '') {
                              onUpdateNilai(currentClassObj.name, selectedJenis, selectedSubIndex, student, null);
                            } else {
                              let num = parseFloat(valStr);
                              if (isNaN(num)) num = 0;
                              if (num < 0) num = 0;
                              if (num > 100) num = 100;
                              onUpdateNilai(currentClassObj.name, selectedJenis, selectedSubIndex, student, num);
                            }
                          }}
                          placeholder="-"
                          className="w-24 sm:w-28 border border-slate-300 rounded-xl px-3 py-1.5 text-center font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tabular-nums disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="p-3">
                        {!hasScore ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                            <span>Belum diisi</span>
                          </div>
                        ) : isTuntas ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tuntas (≥{school.kkm})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-lg w-fit">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Belum Tuntas</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
