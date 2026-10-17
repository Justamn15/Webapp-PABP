import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentBTAIbadah,
  ReadingLevelType,
  IbadahFluency,
  WudhuAssessmentDetails,
  ShalatAssessmentDetails,
} from '../types.ts';
import { SURAH_LIST } from '../data/surahList.ts';
import {
  RUKUN_SHALAT_LIST,
  RUKUN_WUDHU_LIST,
  SUNNAH_WUDHU_LIST,
  RUBRIC_SCORE_LABELS,
  calculateShalatScore,
  calculateWudhuScore,
  getPredicateFromScore,
} from '../data/ibadahRubrik.ts';
import {
  X,
  Check,
  ArrowRight,
  BookOpen,
  Sparkles,
  User,
  Calendar,
  Droplets,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';

interface StudentBTAIbadahModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  className: string;
  initialData?: StudentBTAIbadah;
  onSave: (data: StudentBTAIbadah) => void;
  onSaveAndNext?: (data: StudentBTAIbadah) => void;
  hasNextStudent?: boolean;
  nextStudentName?: string;
}

type ModalTab = 'bta' | 'wudhu' | 'shalat';

const PREDICATE_COLORS: Record<IbadahFluency, { badge: string; text: string; bg: string }> = {
  'Sangat Baik': { badge: 'bg-emerald-600 text-white', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'Lancar': { badge: 'bg-teal-600 text-white', text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  'Cukup': { badge: 'bg-amber-500 text-white', text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  'Kurang Lancar': { badge: 'bg-orange-500 text-white', text: 'text-orange-800', bg: 'bg-orange-50 border-orange-200' },
  'Belum Bisa': { badge: 'bg-rose-500 text-white', text: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
};

export const StudentBTAIbadahModal: React.FC<StudentBTAIbadahModalProps> = ({
  isOpen,
  onClose,
  studentName,
  className,
  initialData,
  onSave,
  onSaveAndNext,
  hasNextStudent,
  nextStudentName,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('bta');

  // BTA State
  const [readingType, setReadingType] = useState<ReadingLevelType>('Iqra');
  const [iqraJilid, setIqraJilid] = useState<number>(1);
  const [iqraHalaman, setIqraHalaman] = useState<string>('Halaman 1');
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [ayat, setAyat] = useState<string>('');
  const [readingNotes, setReadingNotes] = useState<string>('');

  // Wudhu State
  const [wudhuMode, setWudhuMode] = useState<'rukun_dan_sunnah' | 'rukun_saja'>('rukun_dan_sunnah');
  const [wudhuScores, setWudhuScores] = useState<Record<string, number>>({});
  const [wudhuNotes, setWudhuNotes] = useState<string>('');

  // Shalat State
  const [shalatScores, setShalatScores] = useState<Record<string, number>>({});
  const [shalatNotes, setShalatNotes] = useState<string>('');

  // Date
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Populate data when opening
  useEffect(() => {
    if (initialData) {
      setReadingType(initialData.readingType || 'Iqra');
      setIqraJilid(initialData.iqraJilid || 1);
      setIqraHalaman(initialData.iqraHalaman || '');
      setSurahNumber(initialData.surahNumber || 1);
      setAyat(initialData.ayat || '');
      setReadingNotes(initialData.readingNotes || '');

      // Wudhu details or fallback
      if (initialData.wudhuDetails) {
        setWudhuMode(initialData.wudhuDetails.mode || 'rukun_dan_sunnah');
        setWudhuScores(initialData.wudhuDetails.scores || {});
      } else {
        // Fallback default from legacy fluency
        const defaultScore =
          initialData.wudhuStatus === 'Sangat Baik' ? 4 :
          initialData.wudhuStatus === 'Lancar' ? 3 :
          initialData.wudhuStatus === 'Cukup' ? 2 : 1;
        const initialMap: Record<string, number> = {};
        RUKUN_WUDHU_LIST.forEach((item) => { initialMap[item.id] = defaultScore; });
        SUNNAH_WUDHU_LIST.forEach((item) => { initialMap[item.id] = defaultScore; });
        setWudhuScores(initialMap);
        setWudhuMode('rukun_dan_sunnah');
      }
      setWudhuNotes(initialData.wudhuNotes || '');

      // Shalat details or fallback
      if (initialData.shalatDetails) {
        setShalatScores(initialData.shalatDetails.scores || {});
      } else {
        const defaultScore =
          initialData.shalatStatus === 'Sangat Baik' ? 4 :
          initialData.shalatStatus === 'Lancar' ? 3 :
          initialData.shalatStatus === 'Cukup' ? 2 : 1;
        const initialMap: Record<string, number> = {};
        RUKUN_SHALAT_LIST.forEach((item) => { initialMap[item.id] = defaultScore; });
        setShalatScores(initialMap);
      }
      setShalatNotes(initialData.shalatNotes || '');

      setLastUpdated(initialData.lastUpdated || new Date().toISOString().slice(0, 10));
    } else {
      // Default reset for new student
      setReadingType('Iqra');
      setIqraJilid(1);
      setIqraHalaman('Halaman 1');
      setSurahNumber(1);
      setAyat('Ayat 1 - 7');
      setReadingNotes('');

      // Default scores: 3 (Baik)
      const wMap: Record<string, number> = {};
      RUKUN_WUDHU_LIST.forEach((item) => { wMap[item.id] = 3; });
      SUNNAH_WUDHU_LIST.forEach((item) => { wMap[item.id] = 3; });
      setWudhuScores(wMap);
      setWudhuMode('rukun_dan_sunnah');
      setWudhuNotes('');

      const sMap: Record<string, number> = {};
      RUKUN_SHALAT_LIST.forEach((item) => { sMap[item.id] = 3; });
      setShalatScores(sMap);
      setShalatNotes('');

      setLastUpdated(new Date().toISOString().slice(0, 10));
    }
  }, [initialData, studentName, className, isOpen]);

  const selectedSurah = useMemo(() => {
    return SURAH_LIST.find((s) => s.number === surahNumber) || SURAH_LIST[0];
  }, [surahNumber]);

  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return SURAH_LIST;
    const q = surahSearch.toLowerCase();
    return SURAH_LIST.filter(
      (s) => s.name.toLowerCase().includes(q) || String(s.number).includes(q)
    );
  }, [surahSearch]);

  // Real-time calculations
  const wudhuCalc = useMemo(() => {
    return calculateWudhuScore(wudhuScores, wudhuMode);
  }, [wudhuScores, wudhuMode]);

  const shalatCalc = useMemo(() => {
    return calculateShalatScore(shalatScores);
  }, [shalatScores]);

  if (!isOpen) return null;

  // Handlers for score button clicks
  const handleSetWudhuScore = (itemId: string, score: number) => {
    setWudhuScores((prev) => ({ ...prev, [itemId]: score }));
  };

  const handleSetAllWudhuScores = (score: number, rukunOnly: boolean = false) => {
    setWudhuScores((prev) => {
      const next = { ...prev };
      RUKUN_WUDHU_LIST.forEach((item) => {
        next[item.id] = score;
      });
      if (!rukunOnly) {
        SUNNAH_WUDHU_LIST.forEach((item) => {
          next[item.id] = score;
        });
      }
      return next;
    });
  };

  const handleSetShalatScore = (itemId: string, score: number) => {
    setShalatScores((prev) => ({ ...prev, [itemId]: score }));
  };

  const handleSetAllShalatScores = (score: number) => {
    setShalatScores(() => {
      const next: Record<string, number> = {};
      RUKUN_SHALAT_LIST.forEach((item) => {
        next[item.id] = score;
      });
      return next;
    });
  };

  const buildPayload = (): StudentBTAIbadah => {
    const wudhuDetails: WudhuAssessmentDetails = {
      mode: wudhuMode,
      scores: wudhuScores,
      rukunScore: wudhuCalc.rukunScore,
      sunnahScore: wudhuCalc.sunnahScore,
      totalScore: wudhuCalc.totalScore,
      maxScore: wudhuCalc.maxScore,
      finalScore: wudhuCalc.finalScore,
      averageScore: wudhuCalc.averageScore,
      notes: wudhuNotes,
    };

    const shalatDetails: ShalatAssessmentDetails = {
      scores: shalatScores,
      totalScore: shalatCalc.totalScore,
      maxScore: shalatCalc.maxScore,
      finalScore: shalatCalc.finalScore,
      averageScore: shalatCalc.averageScore,
      notes: shalatNotes,
    };

    return {
      studentName,
      className,
      readingType,
      iqraJilid: readingType === 'Iqra' ? iqraJilid : undefined,
      iqraHalaman: readingType === 'Iqra' ? iqraHalaman : undefined,
      surahNumber: readingType !== 'Iqra' ? surahNumber : undefined,
      surahName: readingType !== 'Iqra' ? selectedSurah.name : undefined,
      ayat: readingType !== 'Iqra' ? ayat : undefined,
      readingNotes,
      wudhuStatus: wudhuCalc.predicate,
      wudhuScore: wudhuCalc.finalScore,
      wudhuAverage: wudhuCalc.averageScore,
      wudhuNotes,
      wudhuDetails,
      shalatStatus: shalatCalc.predicate,
      shalatScore: shalatCalc.finalScore,
      shalatAverage: shalatCalc.averageScore,
      shalatNotes,
      shalatDetails,
      lastUpdated: lastUpdated || new Date().toISOString().slice(0, 10),
    };
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(buildPayload());
  };

  const handleSaveAndNextStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveAndNext) {
      onSaveAndNext(buildPayload());
    } else {
      onSave(buildPayload());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs border border-white/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg leading-tight text-white">
                  {studentName}
                </h3>
                <span className="text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 text-white">
                  {className}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Instrumen Asesmen Capaian BTA & Rubrik Penilaian Praktik Ibadah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('bta')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-t border-x ${
              activeTab === 'bta'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>1. Batas Membaca (BTA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wudhu')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-t border-x ${
              activeTab === 'wudhu'
                ? 'bg-white text-cyan-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Droplets className="w-4 h-4 text-cyan-600" />
            <span>2. Praktik Wudhu (6 Rukun + 12 Sunnah)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${PREDICATE_COLORS[wudhuCalc.predicate].badge}`}>
              {wudhuCalc.finalScore}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shalat')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-t border-x ${
              activeTab === 'shalat'
                ? 'bg-white text-indigo-900 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>3. Praktik Shalat (13 Rukun)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${PREDICATE_COLORS[shalatCalc.predicate].badge}`}>
              {shalatCalc.finalScore}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSaveOnly} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: BTA */}
          {activeTab === 'bta' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Batas Capaian Membaca Al-Qur'an & Iqra</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Target Literasi Al-Qur'an Siswa
                  </span>
                </div>

                {/* Reading Type selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Jenis Kitab/Buku Bacaan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Iqra', "Al-Qur'an", 'Juz Amma'] as ReadingLevelType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setReadingType(type)}
                        className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border text-center transition cursor-pointer ${
                          readingType === type
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* If Iqra */}
                {readingType === 'Iqra' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Tingkat Jilid Iqra (1 - 6):
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((jilid) => (
                          <button
                            type="button"
                            key={jilid}
                            onClick={() => setIqraJilid(jilid)}
                            className={`py-2 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer ${
                              iqraJilid === jilid
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Jilid {jilid}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Batas Halaman / Baris:
                      </label>
                      <input
                        type="text"
                        value={iqraHalaman}
                        onChange={(e) => setIqraHalaman(e.target.value)}
                        placeholder="Contoh: Halaman 15 baris ke-4"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* If Al-Qur'an or Juz Amma */}
                {readingType !== 'Iqra' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nama Surah:
                        </label>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={surahSearch}
                            onChange={(e) => setSurahSearch(e.target.value)}
                            placeholder="Cari nama atau nomor surah..."
                            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <select
                            value={surahNumber}
                            onChange={(e) => setSurahNumber(Number(e.target.value))}
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                          >
                            {filteredSurahs.map((s) => (
                              <option key={s.number} value={s.number}>
                                {s.number}. {s.name} ({s.totalAyat} ayat)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Batas Ayat / Halaman:
                        </label>
                        <input
                          type="text"
                          value={ayat}
                          onChange={(e) => setAyat(e.target.value)}
                          placeholder="Contoh: Ayat 1 - 25 atau Halaman 124"
                          className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Surah {selectedSurah.name} terdiri dari {selectedSurah.totalAyat} ayat.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reading Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Makharijul Huruf, Kelancaran, atau Tajwid:
                  </label>
                  <input
                    type="text"
                    value={readingNotes}
                    onChange={(e) => setReadingNotes(e.target.value)}
                    placeholder="Contoh: Makhraj huruf sudah tepat, dengung ikhfa dan mad thabi'i perlu ditingkatkan"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Quick Jump buttons to other tabs */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600">Lanjutkan mengisi instrumen ibadah:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('wudhu')}
                    className="px-3 py-1.5 bg-cyan-700 text-white rounded-lg text-xs font-semibold hover:bg-cyan-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ke Rubrik Wudhu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('shalat')}
                    className="px-3 py-1.5 bg-indigo-700 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ke Rubrik Shalat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WUDHU */}
          {activeTab === 'wudhu' && (
            <div className="space-y-4">
              {/* Header Action Bar & Calculator */}
              <div className="bg-gradient-to-r from-cyan-900 to-teal-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-cyan-300" />
                      <h4 className="font-bold text-sm sm:text-base text-white">
                        Rubrik Penilaian Praktik Wudhu
                      </h4>
                    </div>
                    <p className="text-xs text-cyan-200 mt-0.5">
                      6 Butir Rukun Wajib & 12 Butir Sunnah Wudhu (Skala Skor 1 – 4)
                    </p>
                  </div>

                  {/* Summary badges */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/15">
                    <div className="text-center px-1.5 sm:px-2 border-r border-white/20">
                      <div className="text-[10px] text-cyan-200 font-semibold uppercase">Total Skor</div>
                      <div className="text-sm sm:text-base font-extrabold text-white">
                        {wudhuCalc.totalScore} <span className="text-[11px] text-cyan-300 font-normal">/ {wudhuCalc.maxScore}</span>
                      </div>
                    </div>
                    <div className="text-center px-1.5 sm:px-2 border-r border-white/20">
                      <div className="text-[10px] text-cyan-200 font-semibold uppercase">Rerata Butir</div>
                      <div className="text-sm sm:text-base font-extrabold text-cyan-200">
                        {wudhuCalc.averageScore} <span className="text-[11px] text-cyan-300 font-normal">/ 4.0</span>
                      </div>
                    </div>
                    <div className="text-center px-1.5 sm:px-2 border-r border-white/20">
                      <div className="text-[10px] text-cyan-200 font-semibold uppercase">Skala 0-100</div>
                      <div className="text-sm sm:text-base font-extrabold text-amber-300">
                        {wudhuCalc.finalScore}
                      </div>
                    </div>
                    <div className="text-center px-1.5 sm:px-2">
                      <div className="text-[10px] text-cyan-200 font-semibold uppercase">Predikat</div>
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-0.5 ${PREDICATE_COLORS[wudhuCalc.predicate].badge}`}>
                        {wudhuCalc.predicate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls & Quick Set */}
                <div className="pt-2 border-t border-cyan-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-cyan-200 font-medium">Mode Cakupan:</span>
                    <button
                      type="button"
                      onClick={() => setWudhuMode('rukun_dan_sunnah')}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                        wudhuMode === 'rukun_dan_sunnah'
                          ? 'bg-cyan-500 text-slate-900 shadow-xs'
                          : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900'
                      }`}
                    >
                      Rukun + Sunnah (18 Butir)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWudhuMode('rukun_saja')}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                        wudhuMode === 'rukun_saja'
                          ? 'bg-cyan-500 text-slate-900 shadow-xs'
                          : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900'
                      }`}
                    >
                      Hanya Rukun (6 Butir)
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-cyan-200 font-medium mr-1 hidden sm:inline">Set Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllWudhuScores(4)}
                      className="px-2 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Set semua butir menjadi skor 4 (Sangat Baik)"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Semua 4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllWudhuScores(3)}
                      className="px-2 py-1 bg-teal-600/90 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Set semua butir menjadi skor 3 (Baik)"
                    >
                      <span>Semua 3</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllWudhuScores(4, true)}
                      className="px-2 py-1 bg-blue-600/90 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                      title="Set hanya butir rukun menjadi skor 4"
                    >
                      <span>Rukun 4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllWudhuScores(1)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Reset semua skor ke 1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rubric Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                {([4, 3, 2, 1] as const).map((skor) => (
                  <div key={skor} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${RUBRIC_SCORE_LABELS[skor].badgeColor}`}>
                      {skor}
                    </span>
                    <div className="leading-tight truncate">
                      <div className="font-semibold text-slate-800 text-[11px]">{RUBRIC_SCORE_LABELS[skor].label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{RUBRIC_SCORE_LABELS[skor].desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bagian 1: Rukun Wudhu (6 Butir) */}
              <div className="border border-cyan-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="bg-cyan-50 px-4 py-2.5 border-b border-cyan-200 flex items-center justify-between">
                  <div className="font-bold text-xs sm:text-sm text-cyan-950 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-[11px] font-extrabold flex items-center justify-center">A</span>
                    <span>Rukun Wudhu (6 Butir Wajib)</span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-800">
                    Subtotal: {wudhuCalc.rukunScore} / 24
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {RUKUN_WUDHU_LIST.map((item, idx) => {
                    const currentVal = wudhuScores[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start gap-2.5 sm:max-w-md">
                          <span className="text-xs font-bold text-slate-400 mt-0.5 w-4">{idx + 1}.</span>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-800">{item.name}</div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 leading-tight">{item.description}</div>
                            )}
                          </div>
                        </div>

                        {/* 4 Score Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {([1, 2, 3, 4] as const).map((sc) => {
                            const isSelected = currentVal === sc;
                            return (
                              <button
                                key={sc}
                                type="button"
                                onClick={() => handleSetWudhuScore(item.id, sc)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                                  isSelected
                                    ? `${RUBRIC_SCORE_LABELS[sc].badgeColor} border-transparent shadow-xs scale-105 ring-2 ring-cyan-500/30`
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                                title={`Skor ${sc}: ${RUBRIC_SCORE_LABELS[sc].desc}`}
                              >
                                {sc}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bagian 2: Sunnah-Sunnah Wudhu (12 Butir) */}
              {wudhuMode === 'rukun_dan_sunnah' && (
                <div className="border border-teal-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-teal-50 px-4 py-2.5 border-b border-teal-200 flex items-center justify-between">
                    <div className="font-bold text-xs sm:text-sm text-teal-950 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-extrabold flex items-center justify-center">B</span>
                      <span>Sunnah-Sunnah Wudhu (12 Butir Sunnah)</span>
                    </div>
                    <span className="text-xs font-semibold text-teal-800">
                      Subtotal: {wudhuCalc.sunnahScore} / 48
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {SUNNAH_WUDHU_LIST.map((item, idx) => {
                      const currentVal = wudhuScores[item.id] || 0;
                      return (
                        <div key={item.id} className="p-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-2.5 sm:max-w-md">
                            <span className="text-xs font-bold text-slate-400 mt-0.5 w-4">{idx + 1}.</span>
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-slate-800">{item.name}</div>
                              {item.description && (
                                <div className="text-[11px] text-slate-500 leading-tight">{item.description}</div>
                              )}
                            </div>
                          </div>

                          {/* 4 Score Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {([1, 2, 3, 4] as const).map((sc) => {
                              const isSelected = currentVal === sc;
                              return (
                                <button
                                  key={sc}
                                  type="button"
                                  onClick={() => handleSetWudhuScore(item.id, sc)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                                    isSelected
                                      ? `${RUBRIC_SCORE_LABELS[sc].badgeColor} border-transparent shadow-xs scale-105 ring-2 ring-teal-500/30`
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                  title={`Skor ${sc}: ${RUBRIC_SCORE_LABELS[sc].desc}`}
                                >
                                  {sc}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Catatan Wudhu */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Catatan Evaluasi / Rekomendasi Khusus Wudhu:
                </label>
                <input
                  type="text"
                  value={wudhuNotes}
                  onChange={(e) => setWudhuNotes(e.target.value)}
                  placeholder="Contoh: Rukun wudhu sudah sangat tertib, basuhan kaki sampai mata kaki perlu lebih teliti"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SHALAT */}
          {activeTab === 'shalat' && (
            <div className="space-y-4">
              {/* Header Action Bar & Calculator */}
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-300" />
                      <h4 className="font-bold text-sm sm:text-base text-white">
                        Rubrik Penilaian Praktik Shalat
                      </h4>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      13 Butir Rukun Gerakan, Bacaan & Tuma'ninah Shalat Fardhu (Skor 1 – 4)
                    </p>
                  </div>

                  {/* Summary badges */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/15">
                    <div className="text-center px-1.5 sm:px-2 border-r border-white/20">
                      <div className="text-[10px] text-indigo-200 font-semibold uppercase">Total Skor</div>
                      <div className="text-sm sm:text-base font-extrabold text-white">
                        {shalatCalc.totalScore} <span className="text-[11px] text-indigo-300 font-normal">/ {shalatCalc.maxScore}</span>
                      </div>
                    </div>
                    <div className="text-center px-1.5 sm:px-2 border-r border-white/20">
                      <div className="text-[10px] text-indigo-200 font-semibold uppercase">Rerata Butir</div>
                      <div className="text-sm sm:text-base font-extrabold text-indigo-200">
                        {shalatCalc.averageScore} <span className="text-[11px] text-indigo-300 font-normal">/ 4.0</span>
                      </div>
                    </div>
                    <div className="text-center px-1.5 sm:px-2 border-r border-white/20">
                      <div className="text-[10px] text-indigo-200 font-semibold uppercase">Skala 0-100</div>
                      <div className="text-sm sm:text-base font-extrabold text-amber-300">
                        {shalatCalc.finalScore}
                      </div>
                    </div>
                    <div className="text-center px-1.5 sm:px-2">
                      <div className="text-[10px] text-indigo-200 font-semibold uppercase">Predikat</div>
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-0.5 ${PREDICATE_COLORS[shalatCalc.predicate].badge}`}>
                        {shalatCalc.predicate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls & Quick Set */}
                <div className="pt-2 border-t border-indigo-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-indigo-200 font-medium">
                    Kriteria: 13 Rukun Shalat Fardhu
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-indigo-200 font-medium mr-1 hidden sm:inline">Set Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllShalatScores(4)}
                      className="px-2 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Set semua 13 butir menjadi skor 4 (Sangat Baik)"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Semua 4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllShalatScores(3)}
                      className="px-2 py-1 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Set semua 13 butir menjadi skor 3 (Baik)"
                    >
                      <span>Semua 3</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllShalatScores(1)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Reset semua skor ke 1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rubric Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                {([4, 3, 2, 1] as const).map((skor) => (
                  <div key={skor} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${RUBRIC_SCORE_LABELS[skor].badgeColor}`}>
                      {skor}
                    </span>
                    <div className="leading-tight truncate">
                      <div className="font-semibold text-slate-800 text-[11px]">{RUBRIC_SCORE_LABELS[skor].label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{RUBRIC_SCORE_LABELS[skor].desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 13 Butir Rukun Shalat */}
              <div className="border border-indigo-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="bg-indigo-50 px-4 py-2.5 border-b border-indigo-200 flex items-center justify-between">
                  <div className="font-bold text-xs sm:text-sm text-indigo-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Daftar 13 Rukun Shalat</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-800">
                    Total: {shalatCalc.totalScore} / 52
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {RUKUN_SHALAT_LIST.map((item, idx) => {
                    const currentVal = shalatScores[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start gap-2.5 sm:max-w-md">
                          <span className="text-xs font-bold text-indigo-400 mt-0.5 w-5">{idx + 1}.</span>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-800">{item.name}</div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 leading-tight">{item.description}</div>
                            )}
                          </div>
                        </div>

                        {/* 4 Score Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {([1, 2, 3, 4] as const).map((sc) => {
                            const isSelected = currentVal === sc;
                            return (
                              <button
                                key={sc}
                                type="button"
                                onClick={() => handleSetShalatScore(item.id, sc)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                                  isSelected
                                    ? `${RUBRIC_SCORE_LABELS[sc].badgeColor} border-transparent shadow-xs scale-105 ring-2 ring-indigo-500/30`
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                                title={`Skor ${sc}: ${RUBRIC_SCORE_LABELS[sc].desc}`}
                              >
                                {sc}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Shalat */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Catatan Evaluasi / Bimbingan Shalat:
                </label>
                <input
                  type="text"
                  value={shalatNotes}
                  onChange={(e) => setShalatNotes(e.target.value)}
                  placeholder="Contoh: Gerakan ruku' dan sujud sudah tuma'ninah, hafalan tasyahud akhir perlu diulang lancar"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tanggal Penilaian */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex items-center justify-between w-full">
              <label htmlFor="tanggal-update-bta" className="text-xs font-semibold text-slate-700">
                Tanggal Penilaian Terakhir:
              </label>
              <input
                id="tanggal-update-bta"
                type="date"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-white font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
              {hasNextStudent && onSaveAndNext && (
                <button
                  type="button"
                  onClick={handleSaveAndNextStudent}
                  className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title={`Simpan & lanjut nilai siswa berikutnya: ${nextStudentName || ''}`}
                >
                  <span>Simpan & Lanjut Siswa Berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Seluruh Capaian</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
