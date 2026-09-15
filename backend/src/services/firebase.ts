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

export async function saveInvestigation(record: Record<string, unknown>) {
  if (!firebaseEnabled) {
    return {
      stored: false,
      mode: 'dev-fallback',
      record,
    };
  }

  const db = admin.firestore();
  const ref = db.collection('investigations').doc();
  await ref.set({
    ...record,
    createdAt: new Date().toISOString(),
  });

  return {
    stored: true,
    id: ref.id,
    mode: 'firebase',
  };
}

export async function saveFinding(record: Record<string, unknown>) {
  if (!firebaseEnabled) {
    return { stored: false, mode: 'dev-fallback', record };
  }

  const db = admin.firestore();
  await db.collection('findings').add({
    ...record,
    createdAt: new Date().toISOString(),
  });

  return { stored: true, mode: 'firebase' };
}

export function isFirebaseAvailable() {
  return firebaseEnabled;
}
