import admin from 'firebase-admin';
import { config } from '../config.js';

let firebaseEnabled = false;

try {
  if (config.isFirebaseConfigured) {
    admin.initializeApp({
      projectId: config.firebaseProjectId,
      credential: admin.credential.applicationDefault(),
    });
    firebaseEnabled = true;
  }
} catch (error) {
  firebaseEnabled = false;
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nested]) => nested !== undefined)
        .map(([key, nested]) => [key, stripUndefined(nested)]),
    );
  }

  return value;
}

function normalizeInvestigation(record: Record<string, unknown>) {
  const cleanRecord = stripUndefined(record) as Record<string, unknown>;
  return {
    ...cleanRecord,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function saveInvestigation(record: Record<string, unknown>) {
  if (!firebaseEnabled) {
    return {
      stored: false,
      mode: 'dev-fallback',
      record,
    };
  }

  try {
    const db = admin.firestore();
    const ref = db.collection('investigations').doc();
    const payload = normalizeInvestigation(record);
    await ref.set(payload);

    return {
      stored: true,
      id: ref.id,
      mode: 'firebase',
    };
  } catch (error) {
    console.warn('Firebase persistence unavailable; switching to local fallback.', error);
    return {
      stored: false,
      mode: 'dev-fallback',
      record,
    };
  }
}

export async function getInvestigationsForUser(userId?: string) {
  if (!firebaseEnabled || !userId) {
    return [];
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection('investigations').where('userId', '==', userId).orderBy('updatedAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn('Firestore history unavailable in this environment.', error);
    return [];
  }
}

export async function getInvestigationById(id: string) {
  if (!firebaseEnabled) {
    return null;
  }

  try {
    const db = admin.firestore();
    const doc = await db.collection('investigations').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.warn('Firestore detail lookup unavailable in this environment.', error);
    return null;
  }
}

export async function saveFinding(record: Record<string, unknown>) {
  if (!firebaseEnabled) {
    return { stored: false, mode: 'dev-fallback', record };
  }

  try {
    const db = admin.firestore();
    await db.collection('findings').add({
      ...record,
      createdAt: new Date().toISOString(),
    });

    return { stored: true, mode: 'firebase' };
  } catch (error) {
    console.warn('Firebase findings persistence unavailable; using local fallback.', error);
    return { stored: false, mode: 'dev-fallback', record };
  }
}

export function isFirebaseAvailable() {
  return firebaseEnabled;
}
