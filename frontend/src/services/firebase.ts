import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseStatus = {
  configured: Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.trim().length > 0),
};

export function initFirebaseAuth() {
  const configured = firebaseStatus.configured;

  if (!configured) {
    console.warn('AUTH DEBUG: Firebase initialized: false');
    return { auth: null, db: null, available: false, configured: false };
  }

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  console.info('AUTH DEBUG: Firebase initialized: true');
  return { auth: getAuth(), db: getFirestore(), available: true, configured: true };
}

export async function signUpEmail(email: string, password: string) {
  const { auth, available, configured } = initFirebaseAuth();
  if (!configured || !available || !auth) {
    throw new Error('Firebase authentication is not configured.');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.info('AUTH DEBUG: registration result: success');
    return result.user;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    console.error('AUTH DEBUG: registration result: error', { code, message });
    throw error;
  }
}

export async function signInEmail(email: string, password: string) {
  const { auth, available, configured } = initFirebaseAuth();
  if (!configured || !available || !auth) {
    throw new Error('Firebase authentication is not configured.');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.info('AUTH DEBUG: login result: success');
    return result.user;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    console.error('AUTH DEBUG: login result: error', { code, message });
    throw error;
  }
}

export async function signOutUser() {
  const { auth, available, configured } = initFirebaseAuth();
  if (!configured || !available || !auth) {
    return;
  }
  await signOut(auth);
}

export async function resetPassword(email: string) {
  const { auth, available, configured } = initFirebaseAuth();
  if (!configured || !available || !auth) {
    throw new Error('Firebase authentication is not configured.');
  }

  try {
    await sendPasswordResetEmail(auth, email);
    console.info('AUTH DEBUG: password reset email sent to:', email);
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    console.error('AUTH DEBUG: password reset error', { code, message });
    throw error;
  }
}

export async function getCurrentUserToken(): Promise<string | null> {
  const { auth, available, configured } = initFirebaseAuth();
  if (!configured || !available || !auth || !auth.currentUser) {
    console.info('AUTH DEBUG: currentUser exists: false');
    return null;
  }

  console.info('AUTH DEBUG: currentUser exists: true');
  const token = await auth.currentUser.getIdToken();
  console.info('AUTH DEBUG: ID token obtained: true');
  return token;
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  const { auth, available, configured } = initFirebaseAuth();
  if (!configured || !available || !auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}
