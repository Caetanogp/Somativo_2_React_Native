import { createMemoryStore } from '../src/services/storage';
import { LocalUserDataRepository } from '../src/services/userData/LocalUserDataRepository';
import type { CapturedEntry, FavoriteEntry } from '../src/types';

const favorite = (id: number, addedAt = id): FavoriteEntry => ({ id, name: `D${id}`, imageUrl: null, addedAt });
const captured = (id: number, rating = 3): CapturedEntry => ({
  id,
  name: `D${id}`,
  imageUrl: null,
  rating,
  capturedAt: id,
});

describe('LocalUserDataRepository (RF06)', () => {
  it('começa vazio', async () => {
    const repo = new LocalUserDataRepository(createMemoryStore());
    await expect(repo.loadFavorites('u1')).resolves.toEqual([]);
    await expect(repo.loadCaptured('u1')).resolves.toEqual([]);
  });

  it('salva, atualiza e remove favoritos', async () => {
    const repo = new LocalUserDataRepository(createMemoryStore());
    await repo.saveFavorite('u1', favorite(1));
    await repo.saveFavorite('u1', favorite(2));
    await repo.saveFavorite('u1', { ...favorite(1), name: 'Renomeado' });

    expect((await repo.loadFavorites('u1')).map((f) => f.name).sort()).toEqual(['D2', 'Renomeado']);

    await repo.removeFavorite('u1', 2);
    expect((await repo.loadFavorites('u1')).map((f) => f.id)).toEqual([1]);
  });

  it('salva e atualiza a nota dos capturados', async () => {
    const repo = new LocalUserDataRepository(createMemoryStore());
    await repo.saveCaptured('u1', captured(5, 3));
    await repo.saveCaptured('u1', captured(5, 5));

    const list = await repo.loadCaptured('u1');
    expect(list).toHaveLength(1);
    expect(list[0]?.rating).toBe(5);

    await repo.removeCaptured('u1', 5);
    await expect(repo.loadCaptured('u1')).resolves.toEqual([]);
  });

  it('isola os dados de cada usuário', async () => {
    const repo = new LocalUserDataRepository(createMemoryStore());
    await repo.saveFavorite('u1', favorite(1));
    await repo.saveFavorite('u2', favorite(2));

    expect((await repo.loadFavorites('u1')).map((f) => f.id)).toEqual([1]);
    expect((await repo.loadFavorites('u2')).map((f) => f.id)).toEqual([2]);
  });

  it('persiste entre "reinícios": outra instância sobre o mesmo armazenamento enxerga os dados', async () => {
    const store = createMemoryStore();
    await new LocalUserDataRepository(store).saveFavorite('u1', favorite(7));
    await new LocalUserDataRepository(store).saveCaptured('u1', captured(7, 4));

    const reopened = new LocalUserDataRepository(store);
    expect((await reopened.loadFavorites('u1')).map((f) => f.id)).toEqual([7]);
    expect((await reopened.loadCaptured('u1'))[0]?.rating).toBe(4);
  });

  it('gravações simultâneas não se sobrescrevem', async () => {
    const repo = new LocalUserDataRepository(createMemoryStore());
    await Promise.all([1, 2, 3, 4, 5].map((id) => repo.saveFavorite('u1', favorite(id))));
    expect((await repo.loadFavorites('u1')).map((f) => f.id).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('ignora JSON corrompido em vez de quebrar', async () => {
    const store = createMemoryStore();
    await store.setItem('digidex.favorites.u1', '{não é json');
    await expect(new LocalUserDataRepository(store).loadFavorites('u1')).resolves.toEqual([]);
  });
});
