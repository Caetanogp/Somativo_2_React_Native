import type { AuthUser } from '../../types';
import { generateId, generateSalt, hashPassword } from '../../utils/hash';
import { normalizeEmail } from '../../utils/validation';
import { asyncStore, readJson, secureStore, writeJson } from '../storage';
import type { KeyValueStore } from '../storage';
import { AuthError, assertValidCredentials } from './AuthService';
import type { AuthService } from './AuthService';

const USERS_KEY = 'digidex.users';
/** SecureStore só aceita letras, números, ".", "-" e "_" nas chaves. */
const SESSION_KEY = 'digidex.session';

interface StoredUser {
  id: string;
  email: string;
  salt: string;
  passwordHash: string;
}

type UsersTable = Record<string, StoredUser>;

export interface LocalAuthDeps {
  /** Onde ficam os cadastros (e-mail, sal e hash — nunca a senha). */
  users: KeyValueStore;
  /** Onde fica a sessão (id do usuário logado). */
  session: KeyValueStore;
}

/**
 * Login local: cadastros no AsyncStorage guardando apenas sal + hash SHA-256 da senha;
 * a sessão (id do usuário) fica no SecureStore.
 */
export class LocalAuthService implements AuthService {
  readonly mode = 'local' as const;

  constructor(private readonly deps: LocalAuthDeps = { users: asyncStore, session: secureStore }) {}

  async restoreSession(): Promise<AuthUser | null> {
    const userId = await this.deps.session.getItem(SESSION_KEY);
    if (!userId) return null;
    const users = await this.loadUsers();
    const stored = Object.values(users).find((user) => user.id === userId);
    if (!stored) {
      await this.deps.session.removeItem(SESSION_KEY);
      return null;
    }
    return toAuthUser(stored);
  }

  async register(email: string, password: string): Promise<AuthUser> {
    assertValidCredentials(email, password);
    const key = normalizeEmail(email);
    const users = await this.loadUsers();
    if (users[key]) {
      throw new AuthError('email-in-use', 'Já existe uma conta com este e-mail.');
    }

    const salt = generateSalt();
    const stored: StoredUser = {
      id: generateId(),
      email: key,
      salt,
      passwordHash: await hashPassword(password, salt),
    };
    await writeJson(this.deps.users, USERS_KEY, { ...users, [key]: stored });
    await this.deps.session.setItem(SESSION_KEY, stored.id);
    return toAuthUser(stored);
  }

  async login(email: string, password: string): Promise<AuthUser> {
    assertValidCredentials(email, password);
    const stored = (await this.loadUsers())[normalizeEmail(email)];
    if (!stored || (await hashPassword(password, stored.salt)) !== stored.passwordHash) {
      throw new AuthError('invalid-credentials', 'E-mail ou senha incorretos.');
    }
    await this.deps.session.setItem(SESSION_KEY, stored.id);
    return toAuthUser(stored);
  }

  async logout(): Promise<void> {
    await this.deps.session.removeItem(SESSION_KEY);
  }

  private loadUsers(): Promise<UsersTable> {
    return readJson<UsersTable>(this.deps.users, USERS_KEY, {});
  }
}

const toAuthUser = ({ id, email }: StoredUser): AuthUser => ({ id, email });
