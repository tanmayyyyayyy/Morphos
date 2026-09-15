import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
  firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
  isFirebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
};

export const isGeminiConfigured = Boolean(config.geminiApiKey);
