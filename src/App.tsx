import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppData,
  MainTab,
  AssessmentType,
  AttendanceStatus,
  ToastMessage,
  SchoolInfo,
  ClassItem,
  JournalEntry,
  StudentBTAIbadah,
  AcademicPeriod,
} from './types.ts';
import { defaultAppData } from './defaultData.ts';
import {
  normalizeAppDataWithPeriods,
  createNewPeriod,
  DEFAULT_PERIOD_ID,
} from './utils/periodHelpers.ts';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { KehadiranTab } from './components/KehadiranTab.tsx';
import { JurnalMengajarTab } from './components/JurnalMengajarTab.tsx';
import { CapaianKeagamaanTab } from './components/CapaianKeagamaanTab.tsx';
import { NilaiTab } from './components/NilaiTab.tsx';
import { LeggerTab } from './components/LeggerTab.tsx';
import { RekapAbsenTab } from './components/RekapAbsenTab.tsx';
import { CetakTab } from './components/CetakTab.tsx';
import { BackupTab } from './components/BackupTab.tsx';
import { MasterDataModal } from './components/MasterDataModal.tsx';
import { AndroidAPKModal } from './components/AndroidAPKModal.tsx';
import { PeriodModal } from './components/PeriodModal.tsx';
import { LockedPeriodBanner } from './components/LockedPeriodBanner.tsx';
import { StudentHistoryModal } from './components/StudentHistoryModal.tsx';
import { Toast } from './components/Toast.tsx';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  saveWorkspaceToCloud,
  loadWorkspaceFromCloud,
  testConnection,
  User,
} from './firebase.ts';

const STORAGE_KEY = 'teacherApp_data';

export default function App() {
  // App state with local storage hydration
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppData;
        if (parsed && parsed.school && parsed.classes) {
          if (!parsed.school.place) parsed.school.place = 'Kandangan';
          if (parsed.school.logo === undefined) parsed.school.logo = '';
          if (!parsed.school.semester) parsed.school.semester = 'Semester Ganjil 2025/2026';
          if (parsed.school.logoKiriJurnal === undefined) parsed.school.logoKiriJurnal = '';
          if (parsed.school.logoKananJurnal === undefined) parsed.school.logoKananJurnal = '';
          if (parsed.school.ttdGuru === undefined) parsed.school.ttdGuru = '';
          if (parsed.school.ttdKepalaSekolah === undefined) parsed.school.ttdKepalaSekolah = '';
          if (parsed.school.stempelSekolah === undefined) parsed.school.stempelSekolah = '';
          if (!parsed.attendance) parsed.attendance = {};
          if (!parsed.nilai) parsed.nilai = {};
          if (!parsed.keteranganTugas) parsed.keteranganTugas = {};
          if (!parsed.journal || Object.keys(parsed.journal).length === 0) {
            parsed.journal = defaultAppData.journal || {};
          }
          if (!parsed.btaIbadah || Object.keys(parsed.btaIbadah).length === 0) {
            parsed.btaIbadah = defaultAppData.btaIbadah || {};
          }
          return normalizeAppDataWithPeriods(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load data from localStorage', err);
    }
    return normalizeAppDataWithPeriods(defaultAppData);
  });

  // UI state
  const [activeTab, setActiveTab] = useState<MainTab>('kehadiran');
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return appData.classes[0]?.name || 'Kelas 1';
  });
  const [selectedJenis, setSelectedJenis] = useState<AssessmentType>('TP');
  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [studentHistoryTarget, setStudentHistoryTarget] = useState<{
    studentName: string;
    className: string;
  } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Active period derived state
  const currentPeriodId = appData.currentPeriodId || DEFAULT_PERIOD_ID;
  const currentPeriod = (appData.periods && appData.periods[currentPeriodId]) || {
    id: currentPeriodId,
    academicYear: '2025/2026',
    semester: 'Ganjil' as const,
    label: appData.school?.semester || 'Semester Ganjil 2025/2026',
    isLocked: false,
    createdAt: new Date().toISOString(),
    classes: appData.classes,
    attendance: appData.attendance,
    nilai: appData.nilai,
    keteranganTugas: appData.keteranganTugas,
    journal: appData.journal,
    btaIbadah: appData.btaIbadah || {},
  };
  const isPeriodLocked = currentPeriod.isLocked;

  // Cloud & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);

  // Ref to prevent circular sync overwrite on initial fetch
  const isHydratingFromCloud = useRef(false);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (err) {
      console.error('Error saving to localStorage', err);
    }
  }, [appData]);

  // Keep selectedClass valid if classes are modified/deleted
  useEffect(() => {
    if (!appData.classes.some((c) => c.name === selectedClass)) {
      if (appData.classes[0]) {
        setSelectedClass(appData.classes[0].name);
      }
    }
  }, [appData.classes, selectedClass]);

  // Toast helper
  const showToast = useCallback(
    (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial connection test & auth state listener
  useEffect(() => {
    testConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Terhubung sebagai ${user.displayName || user.email}`, 'info');

        // Check cloud data
        try {
          setIsSyncing(true);
          const cloudData = await loadWorkspaceFromCloud(user.uid);
          if (cloudData) {
            isHydratingFromCloud.current = true;
            if (!cloudData.journal || Object.keys(cloudData.journal).length === 0) {
              cloudData.journal = defaultAppData.journal || {};
            }
            if (!cloudData.btaIbadah) {
              cloudData.btaIbadah = defaultAppData.btaIbadah || {};
            }
            setAppData(normalizeAppDataWithPeriods(cloudData));
            setLastCloudSync(new Date().toISOString());
            showToast('Data berhasil diselaraskan dari Cloud Firestore', 'success');
            setTimeout(() => {
              isHydratingFromCloud.current = false;
            }, 500);
          } else {
            // No cloud data yet, initial backup
            await saveWorkspaceToCloud(user.uid, user.email, appData);
            setLastCloudSync(new Date().toISOString());
            showToast('Data awal berhasil disimpan ke Cloud Firestore', 'success');
          }
        } catch (err) {
          console.error('Failed to sync with cloud on auth change', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []); // Run on mount

  // Auto-sync to Cloud whenever appData changes (with 2-second debounce)
  useEffect(() => {
    if (!currentUser || isHydratingFromCloud.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveWorkspaceToCloud(currentUser.uid, currentUser.email, appData);
        setLastCloudSync(new Date().toISOString());
      } catch (err) {
        console.error('Auto cloud sync failed', err);
        showToast('Gagal sinkronisasi otomatis ke cloud. Cek koneksi.', 'warning');
      } finally {
        setIsSyncing(false);
      }
    }, 2000);

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [appData, currentUser, showToast]);

  // Auth actions
  const handleLoginGoogle = async () => {
    try {
      setIsSyncing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign In failed', err);
      showToast('Gagal login Google. Pastikan pop-up diizinkan di browser.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogoutGoogle = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      showToast('Berhasil keluar dari akun Google.', 'info');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Manual Cloud Actions
  const handleManualSaveToCloud = async () => {
    if (!currentUser) {
      showToast('Silakan masuk dengan Google terlebih dahulu!', 'warning');
      await handleLoginGoogle();
      return;
    }

    try {
      setIsSyncing(true);
      await saveWorkspaceToCloud(currentUser.uid, currentUser.email, appData);
      setLastCloudSync(new Date().toISOString());
      showToast('Seluruh data berhasil disimpan ke Cloud Firestore!', 'success');
    } catch (err) {
      console.error('Manual save failed', err);
      showToast('Gagal menyimpan ke cloud.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualLoadFromCloud = async () => {
    if (!currentUser) {
      showToast('Silakan masuk dengan Google terlebih dahulu!', 'warning');
      await handleLoginGoogle();
      return;
    }

    try {
      setIsSyncing(true);
      const cloudData = await loadWorkspaceFromCloud(currentUser.uid);
      if (cloudData) {
        isHydratingFromCloud.current = true;
        if (!cloudData.journal || Object.keys(cloudData.journal).length === 0) {
          cloudData.journal = defaultAppData.journal || {};
        }
        setAppData(cloudData);
        setLastCloudSync(new Date().toISOString());
        showToast('Data terbaru dari Cloud Firestore berhasil dimuat!', 'success');
        setTimeout(() => {
          isHydratingFromCloud.current = false;
        }, 500);
      } else {
        showToast('Belum ada data tersimpan di akun Cloud Anda.', 'info');
      }
    } catch (err) {
      console.error('Manual load failed', err);
      showToast('Gagal memuat data dari cloud.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Period Management Handlers
  const handleSwitchPeriod = (targetPeriodId: string) => {
    setAppData((prev) => {
      const normalized = normalizeAppDataWithPeriods(prev);
      if (!normalized.periods || !normalized.periods[targetPeriodId]) return prev;

      // 1. Snapshot current active buffers to current period
      const currentId = normalized.currentPeriodId || DEFAULT_PERIOD_ID;
      const updatedPeriods = { ...normalized.periods };
      if (updatedPeriods[currentId]) {
        updatedPeriods[currentId] = {
          ...updatedPeriods[currentId],
          classes: prev.classes,
          attendance: prev.attendance,
          nilai: prev.nilai,
          keteranganTugas: prev.keteranganTugas,
          journal: prev.journal,
          btaIbadah: prev.btaIbadah || {},
        };
      }

      // 2. Load target period
      const targetPeriod = updatedPeriods[targetPeriodId];
      return {
        ...prev,
        currentPeriodId: targetPeriodId,
        periods: updatedPeriods,
        classes: targetPeriod.classes || [],
        attendance: targetPeriod.attendance || {},
        nilai: targetPeriod.nilai || {},
        keteranganTugas: targetPeriod.keteranganTugas || {},
        journal: targetPeriod.journal || {},
        btaIbadah: targetPeriod.btaIbadah || {},
        school: {
          ...prev.school,
          semester: targetPeriod.label,
        },
      };
    });
  };

  const handleCreatePeriod = (
    academicYear: string,
    semester: 'Ganjil' | 'Genap',
    autoLockPrevious: boolean,
    customLabel?: string
  ) => {
    setAppData((prev) => {
      const normalized = normalizeAppDataWithPeriods(prev);
      const currentId = normalized.currentPeriodId || DEFAULT_PERIOD_ID;
      const currentPeriodObj = normalized.periods![currentId];

      const newPeriod = createNewPeriod(currentPeriodObj, academicYear, semester, customLabel);
      const updatedPeriods = { ...normalized.periods };

      // Snapshot current data into current period
      if (updatedPeriods[currentId]) {
        updatedPeriods[currentId] = {
          ...updatedPeriods[currentId],
          classes: prev.classes,
          attendance: prev.attendance,
          nilai: prev.nilai,
          keteranganTugas: prev.keteranganTugas,
          journal: prev.journal,
          btaIbadah: prev.btaIbadah || {},
          isLocked: autoLockPrevious ? true : updatedPeriods[currentId].isLocked,
        };
      }

      updatedPeriods[newPeriod.id] = newPeriod;

      return {
        ...prev,
        currentPeriodId: newPeriod.id,
        periods: updatedPeriods,
        classes: newPeriod.classes,
        attendance: newPeriod.attendance,
        nilai: newPeriod.nilai,
        keteranganTugas: newPeriod.keteranganTugas,
        journal: newPeriod.journal,
        btaIbadah: newPeriod.btaIbadah,
        school: {
          ...prev.school,
          semester: newPeriod.label,
        },
      };
    });
  };

  const handleRenamePeriod = (
    periodId: string,
    newLabel: string,
    newAcademicYear?: string,
    newSemester?: 'Ganjil' | 'Genap'
  ) => {
    setAppData((prev) => {
      const normalized = normalizeAppDataWithPeriods(prev);
      if (!normalized.periods || !normalized.periods[periodId]) return prev;

      const target = normalized.periods[periodId];
      const updatedPeriod: AcademicPeriod = {
        ...target,
        label: newLabel.trim() || target.label,
        academicYear: newAcademicYear ? newAcademicYear.trim() : target.academicYear,
        semester: newSemester || target.semester,
      };

      const updatedPeriods = {
        ...normalized.periods,
        [periodId]: updatedPeriod,
      };

      const isCurrent = (prev.currentPeriodId || DEFAULT_PERIOD_ID) === periodId;

      return {
        ...prev,
        periods: updatedPeriods,
        school: isCurrent
          ? {
              ...prev.school,
              semester: updatedPeriod.label,
            }
          : prev.school,
      };
    });

    showToast(`Nama periode berhasil diubah menjadi "${newLabel}"`, 'success');
  };

  const handleToggleLockPeriod = (periodId: string, newLockedState: boolean) => {
    setAppData((prev) => {
      const normalized = normalizeAppDataWithPeriods(prev);
      if (!normalized.periods || !normalized.periods[periodId]) return prev;

      const updatedPeriods = {
        ...normalized.periods,
        [periodId]: {
          ...normalized.periods[periodId],
          isLocked: newLockedState,
        },
      };

      return {
        ...prev,
        periods: updatedPeriods,
      };
    });

    showToast(
      newLockedState
        ? 'Periode telah dikunci. Data dilindungi dari perubahan tidak sengaja.'
        : 'Kunci periode dibuka. Anda dapat mengedit nilai dan data.',
      'info'
    );
  };

  const handleDeletePeriod = (periodId: string) => {
    setAppData((prev) => {
      const normalized = normalizeAppDataWithPeriods(prev);
      if (!normalized.periods || normalized.currentPeriodId === periodId) return prev;
      const updatedPeriods = { ...normalized.periods };
      delete updatedPeriods[periodId];
      return {
        ...prev,
        periods: updatedPeriods,
      };
    });
  };

  // Attendance handlers
  const handleUpdateAttendance = (
    className: string,
    dateStr: string,
    student: string,
    status: AttendanceStatus | null
  ) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    const key = `${className}_${dateStr}_${student}`;
    setAppData((prev) => {
      const nextAtt = { ...prev.attendance };
      if (status) {
        nextAtt[key] = status;
      } else {
        delete nextAtt[key];
      }
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          attendance: nextAtt,
        }
      } : prev.periods;

      return { ...prev, attendance: nextAtt, periods: nextPeriods };
    });
  };

  const handleMarkAllAttendance = (
    className: string,
    dateStr: string,
    status: AttendanceStatus | null
  ) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    const targetClass = appData.classes.find((c) => c.name === className);
    if (!targetClass) return;

    setAppData((prev) => {
      const nextAtt = { ...prev.attendance };
      targetClass.students.forEach((student) => {
        const key = `${className}_${dateStr}_${student}`;
        if (status) {
          nextAtt[key] = status;
        } else {
          delete nextAtt[key];
        }
      });
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          attendance: nextAtt,
        }
      } : prev.periods;

      return { ...prev, attendance: nextAtt, periods: nextPeriods };
    });
  };

  // Grade handlers
  const handleUpdateNilai = (
    className: string,
    jenis: AssessmentType,
    subIndex: number,
    student: string,
    score: number | null
  ) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    const scoreKey = `${className}_${jenis}_${subIndex}_${student}`;
    setAppData((prev) => {
      const nextNilai = { ...prev.nilai };
      if (score === null || isNaN(score)) {
        delete nextNilai[scoreKey];
      } else {
        nextNilai[scoreKey] = score;
      }
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          nilai: nextNilai,
        }
      } : prev.periods;

      return { ...prev, nilai: nextNilai, periods: nextPeriods };
    });
  };

  const handleUpdateKeteranganTugas = (
    className: string,
    jenis: AssessmentType,
    subIndex: number,
    text: string
  ) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    const key = `${className}_${jenis}_${subIndex}`;
    setAppData((prev) => {
      const nextKet = { ...prev.keteranganTugas };
      if (text.trim() === '') {
        delete nextKet[key];
      } else {
        nextKet[key] = text;
      }
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          keteranganTugas: nextKet,
        }
      } : prev.periods;

      return { ...prev, keteranganTugas: nextKet, periods: nextPeriods };
    });
  };

  const handleClearColumn = (
    className: string,
    jenis: AssessmentType,
    subIndex: number
  ) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    const targetClass = appData.classes.find((c) => c.name === className);
    if (!targetClass) return;

    setAppData((prev) => {
      const nextNilai = { ...prev.nilai };
      targetClass.students.forEach((student) => {
        const scoreKey = `${className}_${jenis}_${subIndex}_${student}`;
        delete nextNilai[scoreKey];
      });
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          nilai: nextNilai,
        }
      } : prev.periods;

      return { ...prev, nilai: nextNilai, periods: nextPeriods };
    });
  };

  // Journal handlers
  const handleUpdateJournalEntry = (date: string, entry: JournalEntry) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    setAppData((prev) => {
      const nextJournal = {
        ...prev.journal,
        [date]: entry,
      };
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          journal: nextJournal,
        }
      } : prev.periods;

      return {
        ...prev,
        journal: nextJournal,
        periods: nextPeriods,
      };
    });
  };

  const handleBatchUpdateJournal = (entries: Record<string, JournalEntry>) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    setAppData((prev) => {
      const nextJournal = {
        ...prev.journal,
        ...entries,
      };
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          journal: nextJournal,
        }
      } : prev.periods;

      return {
        ...prev,
        journal: nextJournal,
        periods: nextPeriods,
      };
    });
  };

  // Capaian Keagamaan & BTA handler
  const handleUpdateBTAIbadah = (item: StudentBTAIbadah) => {
    if (isPeriodLocked) {
      showToast('Periode ini terkunci (Arsip). Buka kunci edit pada spanduk atas terlebih dahulu.', 'warning');
      return;
    }
    const key = `${item.className}_${item.studentName}`;
    setAppData((prev) => {
      const nextBta = {
        ...(prev.btaIbadah || {}),
        [key]: item,
      };
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          btaIbadah: nextBta,
        }
      } : prev.periods;

      return {
        ...prev,
        btaIbadah: nextBta,
        periods: nextPeriods,
      };
    });
  };

  // Master Data save handler
  const handleSaveMasterData = (
    updatedSchool: SchoolInfo,
    updatedClasses: ClassItem[]
  ) => {
    setAppData((prev) => {
      const curId = prev.currentPeriodId || DEFAULT_PERIOD_ID;
      const nextPeriods = prev.periods && prev.periods[curId] ? {
        ...prev.periods,
        [curId]: {
          ...prev.periods[curId],
          classes: updatedClasses,
        }
      } : prev.periods;

      return {
        ...prev,
        school: updatedSchool,
        classes: updatedClasses,
        periods: nextPeriods,
      };
    });
  };

  // Restore backup handler
  const handleRestoreData = (restored: AppData) => {
    const normalized = normalizeAppDataWithPeriods(restored);
    if (!normalized.btaIbadah) {
      normalized.btaIbadah = defaultAppData.btaIbadah || {};
    }
    setAppData(normalized);
    if (normalized.classes[0]) {
      setSelectedClass(normalized.classes[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Application Header */}
      <Header
        school={appData.school}
        user={currentUser}
        isSyncing={isSyncing}
        isCloudConnected={isCloudConnected}
        periods={appData.periods || {}}
        currentPeriodId={currentPeriodId}
        onSwitchPeriod={handleSwitchPeriod}
        onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
        onLoginGoogle={handleLoginGoogle}
        onLogoutGoogle={handleLogoutGoogle}
        onManualSync={handleManualSaveToCloud}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Sub Navbar Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-grow w-full">
        {/* Spanduk Proteksi Arsip Periode Terkunci */}
        <LockedPeriodBanner
          currentPeriod={currentPeriod}
          onToggleLock={handleToggleLockPeriod}
        />

        {activeTab === 'kehadiran' && (
          <KehadiranTab
            classes={appData.classes}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            attendance={appData.attendance}
            onUpdateAttendance={handleUpdateAttendance}
            onMarkAllAttendance={handleMarkAllAttendance}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'jurnal' && (
          <JurnalMengajarTab
            school={appData.school}
            classes={appData.classes}
            attendance={appData.attendance}
            journal={appData.journal}
            onUpdateJournalEntry={handleUpdateJournalEntry}
            onBatchUpdateJournal={handleBatchUpdateJournal}
            onShowToast={showToast}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'keagamaan' && (
          <CapaianKeagamaanTab
            school={appData.school}
            classes={appData.classes}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            btaIbadah={appData.btaIbadah || {}}
            onUpdateBTAIbadah={handleUpdateBTAIbadah}
            onShowToast={showToast}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onViewStudentHistory={(name, cls) =>
              setStudentHistoryTarget({ studentName: name, className: cls })
            }
            isPeriodLocked={isPeriodLocked}
          />
        )}

        {activeTab === 'nilai' && (
          <NilaiTab
            school={appData.school}
            classes={appData.classes}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            selectedJenis={selectedJenis}
            onSelectJenis={setSelectedJenis}
            selectedSubIndex={selectedSubIndex}
            onSelectSubIndex={setSelectedSubIndex}
            nilai={appData.nilai}
            onUpdateNilai={handleUpdateNilai}
            keteranganTugas={appData.keteranganTugas}
            onUpdateKeteranganTugas={handleUpdateKeteranganTugas}
            onClearColumn={handleClearColumn}
            onShowToast={showToast}
            isPeriodLocked={isPeriodLocked}
          />
        )}

        {activeTab === 'rekapNilai' && (
          <LeggerTab
            school={appData.school}
            classes={appData.classes}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            nilai={appData.nilai}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'rekapAbsen' && (
          <RekapAbsenTab
            classes={appData.classes}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            attendance={appData.attendance}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'cetak' && (
          <CetakTab
            school={appData.school}
            classes={appData.classes}
            attendance={appData.attendance}
            onShowToast={showToast}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'backup' && (
          <BackupTab
            appData={appData}
            user={currentUser}
            isSyncing={isSyncing}
            lastCloudSync={lastCloudSync}
            onLoginGoogle={handleLoginGoogle}
            onSaveToCloud={handleManualSaveToCloud}
            onLoadFromCloud={handleManualLoadFromCloud}
            onRestoreData={handleRestoreData}
            onShowToast={showToast}
            onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>
            {appData.school.name} &bull; {appData.school.teacher} &bull; {appData.school.subject}
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Sistem Kehadiran & Penilaian Guru</span>
            <span>&bull;</span>
            <span className="text-emerald-600 font-medium">Cloud Enabled</span>
          </div>
        </div>
      </footer>

      {/* Master Data & Student Management Modal */}
      <MasterDataModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        school={appData.school}
        classes={appData.classes}
        onSave={handleSaveMasterData}
        onShowToast={showToast}
      />

      {/* Android & APK Guide Modal */}
      <AndroidAPKModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Period & Academic Year Management Modal */}
      <PeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        periods={appData.periods || {}}
        currentPeriodId={currentPeriodId}
        onSwitchPeriod={handleSwitchPeriod}
        onCreatePeriod={handleCreatePeriod}
        onToggleLock={handleToggleLockPeriod}
        onDeletePeriod={handleDeletePeriod}
        onRenamePeriod={handleRenamePeriod}
        onShowToast={showToast}
      />

      {/* Student Progress History Across Semesters Modal */}
      <StudentHistoryModal
        isOpen={Boolean(studentHistoryTarget)}
        onClose={() => setStudentHistoryTarget(null)}
        studentName={studentHistoryTarget?.studentName || ''}
        currentClass={studentHistoryTarget?.className || selectedClass}
        periods={appData.periods || {}}
      />
    </div>
  );
}
