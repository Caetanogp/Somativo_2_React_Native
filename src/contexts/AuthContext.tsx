import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthService } from '../services/auth/AuthService';
import type { AuthUser, BackendMode } from '../types';

interface AuthContextValue {
  /** Usuário logado, ou `null`. É isso que o RootNavigator usa para escolher o Stack. */
  user: AuthUser | null;
  /** Verdadeiro enquanto a sessão salva ainda está sendo restaurada ao abrir o app. */
  isRestoring: boolean;
  mode: BackendMode;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  service: AuthService;
  children: ReactNode;
}

/**
 * Estado global de sessão. Login/cadastro/logout apenas atualizam `user`; quem decide qual Stack
 * aparece é o RootNavigator, observando este estado (navegação condicional).
 */
export function AuthProvider({ service, children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let cancelled = false;
    service
      .restoreSession()
      .then((restored) => {
        if (!cancelled) setUser(restored);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const login = useCallback(
    async (email: string, password: string) => setUser(await service.login(email, password)),
    [service],
  );

  const register = useCallback(
    async (email: string, password: string) => setUser(await service.register(email, password)),
    [service],
  );

  const logout = useCallback(async () => {
    try {
      await service.logout();
    } finally {
      setUser(null);
    }
  }, [service]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isRestoring, mode: service.mode, login, register, logout }),
    [user, isRestoring, service.mode, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um <AuthProvider>.');
  return context;
}
