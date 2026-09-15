import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const rootEnvPath = fileURLToPath(new URL('../../.env', import.meta.url));
const cwdEnvPath = resolve(process.cwd(), '.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: cwdEnvPath });
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
  firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
  isFirebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
};

export const isGeminiConfigured = Boolean(config.geminiApiKey);
