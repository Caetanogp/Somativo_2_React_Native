import type { BackendMode } from '../types';

/**
 * As variáveis `EXPO_PUBLIC_*` são embutidas no bundle pelo Expo, e só funcionam acessadas de
 * forma literal (`process.env.EXPO_PUBLIC_X`). Elas ficam no `.env` (nunca commitado).
 */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** Firebase só é usado quando as chaves mínimas estão presentes; caso contrário o app roda local. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

export const backendMode: BackendMode = isFirebaseConfigured ? 'firebase' : 'local';
