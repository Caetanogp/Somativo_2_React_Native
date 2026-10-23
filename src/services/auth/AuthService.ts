import type { AuthUser, BackendMode } from '../../types';
import { hasErrors, validateCredentials } from '../../utils/validation';

export type AuthErrorCode =
  | 'invalid-input'
  | 'email-in-use'
  | 'invalid-credentials'
  | 'weak-password'
  | 'network'
  | 'too-many-requests'
  | 'unknown';

/** Erro de autenticação com mensagem já pronta para exibir ao usuário. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Valida e-mail e senha antes de falar com qualquer backend (usado por todas as implementações). */
export function assertValidCredentials(email: string, password: string): void {
  const errors = validateCredentials(email, password);
  if (hasErrors(errors)) {
    throw new AuthError('invalid-input', errors.email ?? errors.password ?? 'Dados inválidos.');
  }
}

/**
 * Contrato de autenticação. O `AuthContext` só conhece esta interface, então o login local e o
 * Firebase Auth são intercambiáveis.
 */
export interface AuthService {
  readonly mode: BackendMode;
  /** Sessão salva de um uso anterior (ou `null`). Chamado uma vez ao abrir o app. */
  restoreSession(): Promise<AuthUser | null>;
  register(email: string, password: string): Promise<AuthUser>;
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
}
