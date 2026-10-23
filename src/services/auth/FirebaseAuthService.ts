import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { Auth, User, UserCredential } from 'firebase/auth';
import type { AuthUser } from '../../types';
import { normalizeEmail } from '../../utils/validation';
import { AuthError, assertValidCredentials } from './AuthService';
import type { AuthErrorCode, AuthService } from './AuthService';

const toAuthUser = (user: User): AuthUser => ({ id: user.uid, email: user.email ?? '' });

/** Código do Firebase → tipo de erro e mensagem amigável em português. */
const FIREBASE_ERRORS: Record<string, [AuthErrorCode, string]> = {
  'auth/email-already-in-use': ['email-in-use', 'Já existe uma conta com este e-mail.'],
  'auth/invalid-email': ['invalid-input', 'Informe um e-mail válido.'],
  'auth/weak-password': ['weak-password', 'A senha é muito fraca. Use pelo menos 6 caracteres.'],
  'auth/invalid-credential': ['invalid-credentials', 'E-mail ou senha incorretos.'],
  'auth/wrong-password': ['invalid-credentials', 'E-mail ou senha incorretos.'],
  'auth/user-not-found': ['invalid-credentials', 'E-mail ou senha incorretos.'],
  'auth/too-many-requests': ['too-many-requests', 'Muitas tentativas. Aguarde um pouco e tente de novo.'],
  'auth/network-request-failed': ['network', 'Sem conexão. Verifique sua internet e tente novamente.'],
};

const UNKNOWN_ERROR: [AuthErrorCode, string] = ['unknown', 'Não foi possível concluir. Tente novamente.'];

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  const code = error instanceof Error && 'code' in error ? String(error.code) : '';
  const [kind, message] = FIREBASE_ERRORS[code] ?? UNKNOWN_ERROR;
  return new AuthError(kind, message);
}

/** Autenticação real com Firebase Auth (e-mail e senha). A sessão persiste via AsyncStorage. */
export class FirebaseAuthService implements AuthService {
  readonly mode = 'firebase' as const;

  constructor(private readonly auth: Auth) {}

  /** O Firebase restaura a sessão de forma assíncrona: esperamos o primeiro estado conhecido. */
  restoreSession(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        (user) => {
          unsubscribe();
          resolve(user ? toAuthUser(user) : null);
        },
        () => {
          unsubscribe();
          resolve(null);
        },
      );
    });
  }

  async register(email: string, password: string): Promise<AuthUser> {
    assertValidCredentials(email, password);
    return this.authenticate(createUserWithEmailAndPassword(this.auth, normalizeEmail(email), password));
  }

  async login(email: string, password: string): Promise<AuthUser> {
    assertValidCredentials(email, password);
    return this.authenticate(signInWithEmailAndPassword(this.auth, normalizeEmail(email), password));
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  /** Espera o Firebase responder, traduzindo qualquer falha em um `AuthError` amigável. */
  private async authenticate(request: Promise<UserCredential>): Promise<AuthUser> {
    try {
      return toAuthUser((await request).user);
    } catch (error) {
      throw toAuthError(error);
    }
  }
}
