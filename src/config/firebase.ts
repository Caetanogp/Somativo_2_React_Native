import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { firebaseConfig } from './env';

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | undefined;

/**
 * Inicializa o Firebase uma única vez (também sobrevive ao Fast Refresh). A persistência do Auth
 * usa o AsyncStorage, então a sessão continua válida depois de fechar o app.
 *
 * Só deve ser chamado quando `isFirebaseConfigured` é verdadeiro.
 */
export function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (cached) return cached;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Já inicializado (ex.: recarga rápida em desenvolvimento).
    auth = getAuth(app);
  }
  cached = { app, auth, db: getFirestore(app) };
  return cached;
}
