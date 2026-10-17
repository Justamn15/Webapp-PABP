import React, { useState, useMemo } from 'react';
import { ClassItem, AttendanceStatus } from '../types.ts';
import {
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  RotateCcw,
  AlertTriangle,
  LockOpen,
  Search,
  CheckCircle2
} from 'lucide-react';

interface KehadiranTabProps {
  classes: ClassItem[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  attendance: Record<string, AttendanceStatus>;
  onUpdateAttendance: (className: string, dateStr: string, student: string, status: AttendanceStatus | null) => void;
  onMarkAllAttendance: (className: string, dateStr: string, status: AttendanceStatus | null) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const KehadiranTab: React.FC<KehadiranTabProps> = ({
  classes,
  selectedClass,
  onSelectClass,
  attendance,
  onUpdateAttendance,
  onMarkAllAttendance,
  onShowToast,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [holidayOverride, setHolidayOverride] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentClassObj = classes.find((c) => c.name === selectedClass) || classes[0];

  // Check if chosen date is weekend (Sunday = 0, Saturday = 6)
  const isWeekend = useMemo(() => {
    if (!selectedDate) return false;
    const dateObj = new Date(selectedDate);
    const day = dateObj.getDay();
    return day === 0 || day === 6;
  }, [selectedDate]);

  const isInputLocked = isWeekend && !holidayOverride;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setHolidayOverride(false);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setHolidayOverride(false);
  };

  const handleMarkAllHadir = () => {
    if (isInputLocked) {
      onShowToast('Tidak dapat mengubah data pada hari libur! Buka kunci input terlebih dahulu.', 'error');
      return;
    }
    if (!currentClassObj) return;
    onMarkAllAttendance(currentClassObj.name, selectedDate, 'H');
    onShowToast(`Semua siswa di ${currentClassObj.name} ditandai Hadir (H)`, 'success');
  };

  const handleClearAll = () => {
    if (isInputLocked) {
      onShowToast('Tidak dapat mengubah data pada hari libur! Buka kunci input terlebih dahulu.', 'error');
      return;
    }
    if (!currentClassObj) return;
    onMarkAllAttendance(currentClassObj.name, selectedDate, null);
    onShowToast(`Kehadiran untuk ${currentClassObj.name} tanggal ${selectedDate} dikosongkan`, 'info');
  };

  const filteredStudents = useMemo(() => {
    if (!currentClassObj) return [];
    if (!searchQuery.trim()) return currentClassObj.students;
    return currentClassObj.students.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [currentClassObj, searchQuery]);

  // Stats for today in this class
  const classStats = useMemo(() => {
    if (!currentClassObj) return { h: 0, s: 0, i: 0, a: 0, unset: 0 };
    let h = 0, s = 0, i = 0, a = 0, unset = 0;
    currentClassObj.students.forEach((student) => {
      const key = `${currentClassObj.name}_${selectedDate}_${student}`;
      const status = attendance[key];
      if (status === 'H') h++;
      else if (status === 'S') s++;
      else if (status === 'I') i++;
      else if (status === 'A') a++;
      else unset++;
    });
    return { h, s, i, a, unset };
  }, [currentClassObj, selectedDate, attendance]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Date Selector Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        {/* Class Selection */}
        <div className="flex items-center gap-3">
          <label htmlFor="select-kelas" className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
            Pilih Kelas:
          </label>
          <select
            id="select-kelas"
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

        {/* Date Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition active:scale-95 cursor-pointer"
            title="Hari Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setHolidayOverride(false);
            }}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-medium bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tabular-nums"
          />
          <button
            onClick={handleNextDay}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition active:scale-95 cursor-pointer"
            title="Hari Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllHadir}
            disabled={isInputLocked}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Hadir Semua</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={isInputLocked}
            className="bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-xs px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Kosongkan</span>
          </button>
        </div>
      </div>

      {/* Weekend / Holiday Alert Banner */}
      {isWeekend && (
        <div
          className={`border px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm transition-all ${
            isInputLocked
              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${isInputLocked ? 'text-amber-600' : 'text-emerald-600'}`}
            />
            <div>
              <span className="font-bold">
                {isInputLocked ? 'Akhir Pekan (Sabtu/Minggu): ' : 'Kunci Input Dibuka Sementara: '}
              </span>
              <span className="text-xs sm:text-sm">
                {isInputLocked
                  ? 'Input kehadiran otomatis dikunci untuk mencegah salah absen di hari libur.'
                  : 'Anda dapat mengedit kehadiran pada tanggal ini.'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setHolidayOverride(!holidayOverride);
              onShowToast(
                !holidayOverride ? 'Kunci input kehadiran dibuka sementara.' : 'Kunci input diaktifkan kembali.',
                'warning'
              );
            }}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              isInputLocked
                ? 'bg-amber-200/80 hover:bg-amber-300 text-amber-950'
                : 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950'
            }`}
          >
            <LockOpen className="w-3.5 h-3.5" />
            <span>{isInputLocked ? 'Buka Kunci Input' : 'Kunci Kembali'}</span>
          </button>
        </div>
      )}

      {/* Daily Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">Hadir (H)</span>
          <span className="text-lg font-bold text-emerald-600 tabular-nums">{classStats.h}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700">Sakit (S)</span>
          <span className="text-lg font-bold text-amber-600 tabular-nums">{classStats.s}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700">Izin (I)</span>
          <span className="text-lg font-bold text-blue-600 tabular-nums">{classStats.i}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700">Alpa (A)</span>
          <span className="text-lg font-bold text-rose-600 tabular-nums">{classStats.a}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500">Belum Diisi</span>
          <span className="text-lg font-bold text-slate-500 tabular-nums">{classStats.unset}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Presensi Siswa: {currentClassObj?.name}
            </h3>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium ml-1">
              {currentClassObj?.students.length || 0} Siswa
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3 w-14 text-center">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3 text-center w-28 text-emerald-700 bg-emerald-50/40">Hadir (H)</th>
                <th className="p-3 text-center w-28 text-amber-700 bg-amber-50/40">Sakit (S)</th>
                <th className="p-3 text-center w-28 text-blue-700 bg-blue-50/40">Izin (I)</th>
                <th className="p-3 text-center w-28 text-rose-700 bg-rose-50/40">Alpa (A)</th>
                <th className="p-3 text-center w-24 text-slate-500">Reset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                    {searchQuery ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa di kelas ini.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const key = `${currentClassObj?.name}_${selectedDate}_${student}`;
                  const currentStatus = attendance[key];

                  return (
                    <tr
                      key={student}
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        currentStatus === 'H'
                          ? 'bg-emerald-50/15'
                          : currentStatus === 'S'
                          ? 'bg-amber-50/15'
                          : currentStatus === 'I'
                          ? 'bg-blue-50/15'
                          : currentStatus === 'A'
                          ? 'bg-rose-50/15'
                          : ''
                      }`}
                    >
                      <td className="p-3 text-center text-slate-400 font-semibold text-xs tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {student}
                      </td>

                      {/* Hadir Radio / Button */}
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer p-1">
                          <input
                            type="radio"
                            name={`att_${student}`}
                            checked={currentStatus === 'H'}
                            disabled={isInputLocked}
                            onChange={() =>
                              currentClassObj &&
                              onUpdateAttendance(currentClassObj.name, selectedDate, student, 'H')
                            }
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </label>
                      </td>

                      {/* Sakit Radio / Button */}
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer p-1">
                          <input
                            type="radio"
                            name={`att_${student}`}
                            checked={currentStatus === 'S'}
                            disabled={isInputLocked}
                            onChange={() =>
                              currentClassObj &&
                              onUpdateAttendance(currentClassObj.name, selectedDate, student, 'S')
                            }
                            className="w-4 h-4 text-amber-500 focus:ring-amber-400 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </label>
                      </td>

                      {/* Izin Radio / Button */}
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer p-1">
                          <input
                            type="radio"
                            name={`att_${student}`}
                            checked={currentStatus === 'I'}
                            disabled={isInputLocked}
                            onChange={() =>
                              currentClassObj &&
                              onUpdateAttendance(currentClassObj.name, selectedDate, student, 'I')
                            }
                            className="w-4 h-4 text-blue-500 focus:ring-blue-400 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </label>
                      </td>

                      {/* Alpa Radio / Button */}
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer p-1">
                          <input
                            type="radio"
                            name={`att_${student}`}
                            checked={currentStatus === 'A'}
                            disabled={isInputLocked}
                            onChange={() =>
                              currentClassObj &&
                              onUpdateAttendance(currentClassObj.name, selectedDate, student, 'A')
                            }
                            className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </label>
                      </td>

                      {/* Reset single */}
                      <td className="p-3 text-center">
                        {currentStatus && (
                          <button
                            type="button"
                            disabled={isInputLocked}
                            onClick={() =>
                              currentClassObj &&
                              onUpdateAttendance(currentClassObj.name, selectedDate, student, null)
                            }
                            className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer p-1 rounded hover:bg-slate-100"
                            title="Kosongkan status presensi"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mx-auto" />
                          </button>
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
