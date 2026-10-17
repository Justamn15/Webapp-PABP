import React from 'react';
import { AcademicPeriod, StudentBTAIbadah } from '../types.ts';
import {
  X,
  User,
  History,
  BookOpen,
  Award,
  Sparkles,
  Calendar,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { getSortedPeriods } from '../utils/periodHelpers.ts';

interface StudentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  currentClass: string;
  periods: Record<string, AcademicPeriod>;
}

export const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  isOpen,
  onClose,
  studentName,
  currentClass,
  periods,
}) => {
  if (!isOpen || !studentName) return null;

  const sortedPeriods = getSortedPeriods(periods);

  // Compile student's records across all periods
  const historyData = sortedPeriods.map((period) => {
    // Find class of the student in this period
    const matchedClass = period.classes?.find((cls) =>
      cls.students?.includes(studentName)
    )?.name || currentClass;

    const btaKey = `${matchedClass}_${studentName}`;
    const btaRecord = period.btaIbadah ? period.btaIbadah[btaKey] : undefined;

    // Calculate attendance summary if any
    let hadir = 0, sakit = 0, izin = 0, alpa = 0;
    if (period.attendance) {
      Object.entries(period.attendance).forEach(([attKey, status]) => {
        if (attKey.startsWith(`${matchedClass}_`) && attKey.endsWith(`_${studentName}`)) {
          if (status === 'H') hadir++;
          if (status === 'S') sakit++;
          if (status === 'I') izin++;
          if (status === 'A') alpa++;
        }
      });
    }

    // Calculate average grade if any
    let totalGrade = 0, gradeCount = 0;
    if (period.nilai) {
      Object.entries(period.nilai).forEach(([scoreKey, val]) => {
        if (scoreKey.startsWith(`${matchedClass}_`) && scoreKey.endsWith(`_${studentName}`)) {
          totalGrade += val;
          gradeCount++;
        }
      });
    }
    const averageGrade = gradeCount > 0 ? Math.round(totalGrade / gradeCount) : null;

    return {
      periodId: period.id,
      label: period.label,
      academicYear: period.academicYear,
      semester: period.semester,
      className: matchedClass,
      btaRecord,
      attendance: { hadir, sakit, izin, alpa },
      averageGrade,
    };
  });

  const handlePrintStudentCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15">
              <History className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{studentName}</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md font-semibold">
                  {currentClass}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Rekam Jejak Perkembangan Belajar & Ibadah Lintas Semester
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintStudentCard}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white cursor-pointer"
              title="Cetak Rapor Riwayat Siswa"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>
                Total <strong>{historyData.length} Semester</strong> tercatat dalam arsip sekolah.
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              SDN 5 Kandangan Barat
            </span>
          </div>

          {/* Timeline Cards */}
          <div className="space-y-4">
            {historyData.map((item, idx) => {
              const bta = item.btaRecord;
              const hasBta = Boolean(bta);

              return (
                <div
                  key={item.periodId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {item.label}
                        </h4>
                        <span className="text-xs text-slate-500">
                          Kelas Terdaftar: <strong>{item.className}</strong>
                        </span>
                      </div>
                    </div>

                    {item.averageGrade !== null && (
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Rata-rata Nilai PAI</span>
                        <span className="font-extrabold text-sm text-indigo-700">
                          {item.averageGrade}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Detail Capaian Keagamaan */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
                    {/* BTA / Bacaan */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Batas Bacaan (BTA)</span>
                      </div>
                      {hasBta && bta?.readingType ? (
                        <div>
                          <div className="font-extrabold text-slate-800 text-sm">
                            {bta.readingType === 'Iqra' && `Iqra Jilid ${bta.iqraJilid || 1}`}
                            {bta.readingType === "Al-Qur'an" && `Al-Qur'an (Surah ${bta.surahName || '-'})`}
                            {bta.readingType === 'Juz Amma' && `Juz 'Amma (${bta.surahName || '-'})`}
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            {bta.ayat || bta.iqraHalaman || 'Halaman / Ayat awal'}
                          </p>
                          {bta.readingNotes && (
                            <p className="text-slate-500 text-[10px] italic mt-1 bg-white p-1.5 rounded-md border border-slate-200">
                              "{bta.readingNotes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Belum ada catatan membaca</p>
                      )}
                    </div>

                    {/* Praktik Wudhu */}
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Praktik Wudhu</span>
                      </div>
                      {hasBta && bta?.wudhuScore !== undefined ? (
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-emerald-900 text-base">
                              {bta.wudhuScore}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700">
                              ({bta.wudhuStatus || 'Lancar'})
                            </span>
                          </div>
                          {bta.wudhuAverage && (
                            <p className="text-[11px] text-emerald-700">
                              Rerata butir: <strong>{bta.wudhuAverage.toFixed(2)}</strong> / 4.00
                            </p>
                          )}
                          {bta.wudhuNotes && (
                            <p className="text-emerald-800 text-[10px] italic mt-1 bg-white/80 p-1.5 rounded-md border border-emerald-200">
                              "{bta.wudhuNotes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Belum dinilai pada semester ini</p>
                      )}
                    </div>

                    {/* Praktik Shalat */}
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-800 font-bold mb-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Praktik Shalat</span>
                      </div>
                      {hasBta && bta?.shalatScore !== undefined ? (
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-indigo-900 text-base">
                              {bta.shalatScore}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700">
                              ({bta.shalatStatus || 'Lancar'})
                            </span>
                          </div>
                          {bta.shalatAverage && (
                            <p className="text-[11px] text-indigo-700">
                              Rerata butir: <strong>{bta.shalatAverage.toFixed(2)}</strong> / 4.00
                            </p>
                          )}
                          {bta.shalatNotes && (
                            <p className="text-indigo-800 text-[10px] italic mt-1 bg-white/80 p-1.5 rounded-md border border-indigo-200">
                              "{bta.shalatNotes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Belum dinilai pada semester ini</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
