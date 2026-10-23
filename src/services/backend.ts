import { isFirebaseConfigured } from '../config/env';
import type { BackendMode } from '../types';
import { LocalAuthService } from './auth/LocalAuthService';
import type { AuthService } from './auth/AuthService';
import { LocalUserDataRepository } from './userData/LocalUserDataRepository';
import type { UserDataRepository } from './userData/UserDataRepository';

export interface Backend {
  mode: BackendMode;
  auth: AuthService;
  userData: UserDataRepository;
}

/**
 * Único ponto do app que decide entre persistência/login local e nuvem (Firebase), conforme o
 * `.env`. O restante do código só enxerga as interfaces `AuthService` e `UserDataRepository`.
 */
export function createBackend(): Backend {
  if (isFirebaseConfigured) {
    // `require` tardio: o SDK do Firebase só é carregado/inicializado quando há chaves configuradas.
    const { getFirebase } = require('../config/firebase') as typeof import('../config/firebase');
    const { FirebaseAuthService } =
      require('./auth/FirebaseAuthService') as typeof import('./auth/FirebaseAuthService');
    const { FirestoreUserDataRepository } =
      require('./userData/FirestoreUserDataRepository') as typeof import('./userData/FirestoreUserDataRepository');
    const { auth, db } = getFirebase();
    return {
      mode: 'firebase',
      auth: new FirebaseAuthService(auth),
      userData: new FirestoreUserDataRepository(db),
    };
  }
  return { mode: 'local', auth: new LocalAuthService(), userData: new LocalUserDataRepository() };
}
