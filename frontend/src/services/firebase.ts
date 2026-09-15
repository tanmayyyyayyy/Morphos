import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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

export function initFirebaseAuth(): { auth: Auth | null; available: boolean } {
  const hasConfig = Object.values(firebaseConfig).every((value) => Boolean(value));
  if (!hasConfig) {
    return { auth: null, available: false };
  }

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  return { auth: getAuth(), available: true };
}

export async function signUpEmail(email: string, password: string) {
  const { auth, available } = initFirebaseAuth();
  if (!available || !auth) {
    throw new Error('Firebase authentication is not configured.');
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signInEmail(email: string, password: string) {
  const { auth, available } = initFirebaseAuth();
  if (!available || !auth) {
    throw new Error('Firebase authentication is not configured.');
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOutUser() {
  const { auth, available } = initFirebaseAuth();
  if (!available || !auth) {
    return;
  }
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  const { auth, available } = initFirebaseAuth();
  if (!available || !auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}
