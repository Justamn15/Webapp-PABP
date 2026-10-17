import React, { useState } from 'react';
import {
  StudentBTAIbadah,
  SchoolInfo,
} from '../types.ts';
import {
  RUKUN_SHALAT_LIST,
  RUKUN_WUDHU_LIST,
  SUNNAH_WUDHU_LIST,
  RUBRIC_SCORE_LABELS,
  recomputeStudentIbadah,
} from '../data/ibadahRubrik.ts';
import {
  X,
  Printer,
  Edit3,
  Sparkles,
  Droplets,
  BookOpen,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface StudentRubrikDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  className: string;
  record?: StudentBTAIbadah;
  school: SchoolInfo;
  onOpenEdit: (studentName: string) => void;
}

export const StudentRubrikDetailModal: React.FC<StudentRubrikDetailModalProps> = ({
  isOpen,
  onClose,
  studentName,
  className,
  record: initialRecord,
  school,
  onOpenEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'wudhu' | 'shalat' | 'bta'>('wudhu');

  if (!isOpen) return null;

  const record = initialRecord ? recomputeStudentIbadah(initialRecord) : undefined;
  const wScores = record?.wudhuDetails?.scores || {};
  const sScores = record?.shalatDetails?.scores || {};

  const handlePrintIndividual = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Rincian Capaian: {studentName}
                </h3>
                <span className="text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 text-white">
                  {className}
                </span>
              </div>
              <p className="text-xs text-teal-200/90 mt-0.5">
                Nilai Wudhu: <span className="font-bold text-white">{record?.wudhuScore ?? '-'} ({record?.wudhuStatus || 'Belum dinilai'})</span> &bull; Nilai Shalat: <span className="font-bold text-white">{record?.shalatScore ?? '-'} ({record?.shalatStatus || 'Belum dinilai'})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(studentName);
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Edit Capaian"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handlePrintIndividual}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="Cetak Lembar Portofolio Siswa"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={() => setActiveTab('wudhu')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer border-t border-x ${
              activeTab === 'wudhu'
                ? 'bg-white text-cyan-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4 text-cyan-600" />
            <span>Rubrik Wudhu</span>
          </button>
          <button
            onClick={() => setActiveTab('shalat')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer border-t border-x ${
              activeTab === 'shalat'
                ? 'bg-white text-indigo-900 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Rubrik Shalat</span>
          </button>
          <button
            onClick={() => setActiveTab('bta')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer border-t border-x ${
              activeTab === 'bta'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Batas Membaca (BTA)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB WUDHU */}
          {activeTab === 'wudhu' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-cyan-50/80 rounded-xl border border-cyan-200">
                <div>
                  <div className="text-xs text-cyan-900 font-bold">Hasil Penilaian Praktik Wudhu</div>
                  <div className="text-[11px] text-cyan-700">
                    Mode: {record?.wudhuDetails?.mode === 'rukun_saja' ? 'Hanya Rukun (6 Butir)' : 'Rukun & Sunnah (18 Butir)'}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-center px-2 py-1 bg-white rounded-lg border border-cyan-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Skor</span>
                    <span className="text-sm font-bold text-slate-800">
                      {record?.wudhuDetails?.totalScore ?? '-'}
                      <span className="text-[10px] text-slate-400 font-normal"> / {record?.wudhuDetails?.maxScore ?? '-'}</span>
                    </span>
                  </div>
                  <div className="text-center px-2 py-1 bg-white rounded-lg border border-cyan-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Rerata Butir</span>
                    <span className="text-sm font-bold text-cyan-900">
                      {record?.wudhuAverage !== undefined ? record.wudhuAverage.toFixed(2) : '-'}
                      <span className="text-[10px] text-slate-400 font-normal"> / 4.0</span>
                    </span>
                  </div>
                  <div className="text-center px-2 py-1 bg-white rounded-lg border border-cyan-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Nilai 0-100</span>
                    <span className="text-base font-extrabold text-cyan-950">{record?.wudhuScore ?? '-'}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-700 text-white shadow-2xs">
                    {record?.wudhuStatus || 'Belum dinilai'}
                  </span>
                </div>
              </div>

              {/* Rukun Wudhu Table */}
              <div className="border border-cyan-200 rounded-xl overflow-hidden">
                <div className="bg-cyan-100/70 px-4 py-2 text-xs font-bold text-cyan-900 flex justify-between">
                  <span>RUKUN WUDHU (6 BUTIR WAJIB)</span>
                  <span>Skor (1-4)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {RUKUN_WUDHU_LIST.map((item, idx) => {
                    const sc = wScores[item.id] || 0;
                    return (
                      <div key={item.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                          <div>
                            <div className="font-bold text-slate-800">{item.name}</div>
                            {item.description && <div className="text-[11px] text-slate-500">{item.description}</div>}
                          </div>
                        </div>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          sc > 0 ? RUBRIC_SCORE_LABELS[sc]?.badgeColor : 'bg-slate-200 text-slate-600'
                        }`}>
                          {sc > 0 ? sc : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sunnah Wudhu Table */}
              {record?.wudhuDetails?.mode !== 'rukun_saja' && (
                <div className="border border-teal-200 rounded-xl overflow-hidden">
                  <div className="bg-teal-100/70 px-4 py-2 text-xs font-bold text-teal-900 flex justify-between">
                    <span>SUNNAH-SUNNAH WUDHU (12 BUTIR SUNNAH)</span>
                    <span>Skor (1-4)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {SUNNAH_WUDHU_LIST.map((item, idx) => {
                      const sc = wScores[item.id] || 0;
                      return (
                        <div key={item.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                            <div>
                              <div className="font-semibold text-slate-800">{item.name}</div>
                              {item.description && <div className="text-[11px] text-slate-500">{item.description}</div>}
                            </div>
                          </div>
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            sc > 0 ? RUBRIC_SCORE_LABELS[sc]?.badgeColor : 'bg-slate-200 text-slate-600'
                          }`}>
                            {sc > 0 ? sc : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {record?.wudhuNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Catatan Evaluasi Wudhu:</span>
                  <p className="text-slate-600 italic">"{record.wudhuNotes}"</p>
                </div>
              )}
            </div>
          )}

          {/* TAB SHALAT */}
          {activeTab === 'shalat' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/80 rounded-xl border border-indigo-200">
                <div>
                  <div className="text-xs text-indigo-950 font-bold">Hasil Penilaian Praktik Shalat</div>
                  <div className="text-[11px] text-indigo-700">13 Rukun Shalat Fardhu (Gerakan, Bacaan & Tuma'ninah)</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-center px-2 py-1 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Skor</span>
                    <span className="text-sm font-bold text-slate-800">
                      {record?.shalatDetails?.totalScore ?? '-'}
                      <span className="text-[10px] text-slate-400 font-normal"> / 52</span>
                    </span>
                  </div>
                  <div className="text-center px-2 py-1 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Rerata Butir</span>
                    <span className="text-sm font-bold text-indigo-950">
                      {record?.shalatAverage !== undefined ? record.shalatAverage.toFixed(2) : '-'}
                      <span className="text-[10px] text-slate-400 font-normal"> / 4.0</span>
                    </span>
                  </div>
                  <div className="text-center px-2 py-1 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Nilai 0-100</span>
                    <span className="text-base font-extrabold text-indigo-950">{record?.shalatScore ?? '-'}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-700 text-white shadow-2xs">
                    {record?.shalatStatus || 'Belum dinilai'}
                  </span>
                </div>
              </div>

              {/* Shalat Table */}
              <div className="border border-indigo-200 rounded-xl overflow-hidden">
                <div className="bg-indigo-100/70 px-4 py-2 text-xs font-bold text-indigo-950 flex justify-between">
                  <span>13 RUKUN SHALAT</span>
                  <span>Skor (1-4)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {RUKUN_SHALAT_LIST.map((item, idx) => {
                    const sc = sScores[item.id] || 0;
                    return (
                      <div key={item.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-indigo-400 w-4">{idx + 1}.</span>
                          <div>
                            <div className="font-bold text-slate-800">{item.name}</div>
                            {item.description && <div className="text-[11px] text-slate-500">{item.description}</div>}
                          </div>
                        </div>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          sc > 0 ? RUBRIC_SCORE_LABELS[sc]?.badgeColor : 'bg-slate-200 text-slate-600'
                        }`}>
                          {sc > 0 ? sc : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {record?.shalatNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Catatan Evaluasi Shalat:</span>
                  <p className="text-slate-600 italic">"{record.shalatNotes}"</p>
                </div>
              )}
            </div>
          )}

          {/* TAB BTA */}
          {activeTab === 'bta' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Batas Capaian Membaca Al-Qur'an & Iqra</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block mb-0.5">Jenis Kitab / Bacaan:</span>
                    <span className="font-bold text-emerald-900 text-sm">{record?.readingType || 'Belum diisi'}</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block mb-0.5">Capaian Terakhir:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {record?.readingType === 'Iqra'
                        ? `Iqra Jilid ${record.iqraJilid || 1} • ${record.iqraHalaman || '-'}`
                        : `Surah ${record?.surahName || '-'} • ${record?.ayat || '-'}`}
                    </span>
                  </div>
                </div>

                {record?.readingNotes && (
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                    <span className="text-slate-500 font-semibold block mb-0.5">Catatan Tajwid / Kelancaran:</span>
                    <p className="text-slate-800 italic">"{record.readingNotes}"</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Pembaruan: {record?.lastUpdated || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>SD Negeri 5 Kandangan Barat</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
