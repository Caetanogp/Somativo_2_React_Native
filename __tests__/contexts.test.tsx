import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CapturedProvider, useCaptured } from '../src/contexts/CapturedContext';
import { FavoritesProvider, useFavorites } from '../src/contexts/FavoritesContext';
import { LocalAuthService } from '../src/services/auth/LocalAuthService';
import { createMemoryStore } from '../src/services/storage';
import { LocalUserDataRepository } from '../src/services/userData/LocalUserDataRepository';
import type { UserDataRepository } from '../src/services/userData/UserDataRepository';
import type { AuthUser, FavoriteEntry } from '../src/types';
import { deferred } from './deferred';

const agumon = { id: 1, name: 'Agumon', imageUrl: null };
const gabumon = { id: 2, name: 'Gabumon', imageUrl: null };

function dataWrapper(repository: UserDataRepository, userId = 'u1') {
  return ({ children }: { children: ReactNode }) => (
    <FavoritesProvider userId={userId} repository={repository}>
      <CapturedProvider userId={userId} repository={repository}>
        {children}
      </CapturedProvider>
    </FavoritesProvider>
  );
}

describe('FavoritesContext (RF04, RF05, RF06)', () => {
  it('só fica "hidratado" depois de carregar os dados salvos (nunca mostra lista zerada antes)', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    const stored = deferred<FavoriteEntry[]>();
    jest.spyOn(repository, 'loadFavorites').mockReturnValue(stored.promise);

    const { result } = await renderHook(() => useFavorites(), { wrapper: dataWrapper(repository) });
    expect(result.current.isHydrated).toBe(false);
    expect(result.current.favorites).toEqual([]);

    await act(async () => stored.resolve([{ ...agumon, addedAt: 1 }]));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.favorites.map((f) => f.id)).toEqual([1]);
    expect(result.current.isFavorite(1)).toBe(true);
  });

  it('favorita e desfavorita, persistindo cada mudança', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    const { result } = await renderHook(() => useFavorites(), { wrapper: dataWrapper(repository) });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => result.current.toggleFavorite(agumon));
    expect(result.current.isFavorite(1)).toBe(true);
    expect((await repository.loadFavorites('u1')).map((f) => f.id)).toEqual([1]);

    await act(async () => result.current.toggleFavorite(agumon));
    expect(result.current.isFavorite(1)).toBe(false);
    expect(await repository.loadFavorites('u1')).toEqual([]);
  });

  it('lista mais recentes primeiro', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    const { result } = await renderHook(() => useFavorites(), { wrapper: dataWrapper(repository) });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    jest.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValueOnce(200);
    await act(async () => result.current.toggleFavorite(agumon));
    await act(async () => result.current.toggleFavorite(gabumon));
    jest.restoreAllMocks();

    expect(result.current.favorites.map((f) => f.id)).toEqual([2, 1]);
  });

  it('reverte o estado e lança quando salvar falha', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    jest.spyOn(repository, 'saveFavorite').mockRejectedValue(new Error('offline'));
    const { result } = await renderHook(() => useFavorites(), { wrapper: dataWrapper(repository) });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => {
      await expect(result.current.toggleFavorite(agumon)).rejects.toThrow('offline');
    });
    expect(result.current.isFavorite(1)).toBe(false);
  });

  it('sinaliza erro de carga e permite recarregar', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    const load = jest.spyOn(repository, 'loadFavorites').mockRejectedValueOnce(new Error('sem rede'));
    const { result } = await renderHook(() => useFavorites(), { wrapper: dataWrapper(repository) });

    await waitFor(() => expect(result.current.loadError).not.toBeNull());
    await act(async () => result.current.reload());
    await waitFor(() => expect(result.current.loadError).toBeNull());
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('os dados de cada usuário ficam separados', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    await repository.saveFavorite('u1', { ...agumon, addedAt: 1 });

    const { result } = await renderHook(() => useFavorites(), { wrapper: dataWrapper(repository, 'u2') });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.favorites).toEqual([]);
  });

  it('o hook exige o Provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useFavorites())).rejects.toThrow('FavoritesProvider');
    jest.restoreAllMocks();
  });
});

describe('CapturedContext (RF07: consumidos com nota 1–5)', () => {
  it('captura com nota, atualiza a nota e remove', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    const { result } = await renderHook(() => useCaptured(), { wrapper: dataWrapper(repository) });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => result.current.capture(agumon, 4));
    expect(result.current.getCaptured(1)?.rating).toBe(4);

    await act(async () => result.current.capture(agumon, 2));
    expect(result.current.captured).toHaveLength(1);
    expect(result.current.getCaptured(1)?.rating).toBe(2);
    expect((await repository.loadCaptured('u1'))[0]?.rating).toBe(2);

    await act(async () => result.current.release(1));
    expect(result.current.getCaptured(1)).toBeUndefined();
  });

  it('mantém a data de captura original ao mudar a nota e limita a nota entre 1 e 5', async () => {
    const repository = new LocalUserDataRepository(createMemoryStore());
    const { result } = await renderHook(() => useCaptured(), { wrapper: dataWrapper(repository) });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => result.current.capture(agumon, 99));
    const first = result.current.getCaptured(1);
    expect(first?.rating).toBe(5);

    await act(async () => result.current.capture(agumon, 0));
    expect(result.current.getCaptured(1)?.rating).toBe(1);
    expect(result.current.getCaptured(1)?.capturedAt).toBe(first?.capturedAt);
  });
});

describe('AuthContext (RF07)', () => {
  function authWrapper(service: LocalAuthService) {
    return ({ children }: { children: ReactNode }) => <AuthProvider service={service}>{children}</AuthProvider>;
  }
  const newService = () => new LocalAuthService({ users: createMemoryStore(), session: createMemoryStore() });

  it('restaura a sessão salva ao abrir o app', async () => {
    const service = newService();
    const saved = deferred<AuthUser | null>();
    jest.spyOn(service, 'restoreSession').mockReturnValue(saved.promise);

    const { result } = await renderHook(() => useAuth(), { wrapper: authWrapper(service) });
    expect(result.current.isRestoring).toBe(true);
    expect(result.current.user).toBeNull();

    await act(async () => saved.resolve({ id: 'u1', email: 'ana@exemplo.com' }));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.user?.email).toBe('ana@exemplo.com');
    expect(result.current.mode).toBe('local');
  });

  it('sem sessão salva, o usuário é nulo (RootNavigator mostra o Stack de login)', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper: authWrapper(newService()) });
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('cadastro e login definem o usuário; logout o limpa', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper: authWrapper(newService()) });
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    await act(async () => result.current.register('ana@exemplo.com', 'segredo123'));
    expect(result.current.user?.email).toBe('ana@exemplo.com');

    await act(async () => result.current.logout());
    expect(result.current.user).toBeNull();

    await act(async () => result.current.login('ana@exemplo.com', 'segredo123'));
    expect(result.current.user?.email).toBe('ana@exemplo.com');
  });

  it('login com senha errada lança AuthError e mantém o usuário nulo', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper: authWrapper(newService()) });
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    await act(async () => {
      await expect(result.current.login('x@y.com', 'errada123')).rejects.toMatchObject({
        code: 'invalid-credentials',
      });
    });
    expect(result.current.user).toBeNull();
  });

  it('logout limpa o usuário mesmo se encerrar a sessão falhar', async () => {
    const service = newService();
    const { result } = await renderHook(() => useAuth(), { wrapper: authWrapper(service) });
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    await act(async () => result.current.register('ana@exemplo.com', 'segredo123'));

    jest.spyOn(service, 'logout').mockRejectedValue(new Error('falhou'));
    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow('falhou');
    });
    expect(result.current.user).toBeNull();
  });
});
