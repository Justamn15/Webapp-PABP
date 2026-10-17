import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppData } from './types.ts';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Enum and Structure as required by guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  const testPath = 'workspaces/test_connection';
  try {
    await getDocFromServer(doc(db, 'workspaces', 'test_connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or unreachable.');
    }
    // Expected to not exist or be denied for unauth, but indicates network connectivity
    return false;
  }
}

// Cloud Persistence helpers
export async function saveWorkspaceToCloud(userId: string, userEmail: string | null, data: AppData): Promise<void> {
  const docPath = `workspaces/${userId}`;
  try {
    const payload = {
      ownerId: userId,
      ownerEmail: userEmail || '',
      school: data.school,
      currentPeriodId: data.currentPeriodId || '2025-2026_ganjil',
      periods: data.periods || {},
      classes: data.classes,
      attendance: data.attendance || {},
      nilai: data.nilai || {},
      keteranganTugas: data.keteranganTugas || {},
      journal: data.journal || {},
      btaIbadah: data.btaIbadah || {},
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'workspaces', userId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function loadWorkspaceFromCloud(userId: string): Promise<AppData | null> {
  const docPath = `workspaces/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', userId));
    if (snap.exists()) {
      const d = snap.data();
      return {
        school: d.school,
        currentPeriodId: d.currentPeriodId,
        periods: d.periods,
        classes: d.classes || [],
        attendance: d.attendance || {},
        nilai: d.nilai || {},
        keteranganTugas: d.keteranganTugas || {},
        journal: d.journal || {},
        btaIbadah: d.btaIbadah || {},
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export function subscribeWorkspaceToCloud(
  userId: string,
  onData: (data: AppData, updatedAt: string) => void,
  onError?: (err: Error) => void
) {
  const docPath = `workspaces/${userId}`;
  return onSnapshot(
    doc(db, 'workspaces', userId),
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onData(
          {
            school: d.school,
            classes: d.classes || [],
            attendance: d.attendance || {},
            nilai: d.nilai || {},
            keteranganTugas: d.keteranganTugas || {},
            journal: d.journal || {},
            btaIbadah: d.btaIbadah || {},
          },
          d.updatedAt || ''
        );
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
}

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
