import type { CapturedEntry, FavoriteEntry } from '../../types';
import { asyncStore, readJson, writeJson } from '../storage';
import type { KeyValueStore } from '../storage';
import type { UserDataRepository } from './UserDataRepository';

const favoritesKey = (userId: string) => `digidex.favorites.${userId}`;
const capturedKey = (userId: string) => `digidex.captured.${userId}`;

/** Persistência local em AsyncStorage, uma lista JSON por usuário e por tipo. */
export class LocalUserDataRepository implements UserDataRepository {
  /** Fila que serializa as escritas: evita que duas gravações seguidas se sobrescrevam. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly store: KeyValueStore = asyncStore) {}

  loadFavorites(userId: string): Promise<FavoriteEntry[]> {
    return this.enqueue(() => readJson<FavoriteEntry[]>(this.store, favoritesKey(userId), []));
  }

  saveFavorite(userId: string, entry: FavoriteEntry): Promise<void> {
    return this.upsert(favoritesKey(userId), entry);
  }

  removeFavorite(userId: string, digimonId: number): Promise<void> {
    return this.remove(favoritesKey(userId), digimonId);
  }

  loadCaptured(userId: string): Promise<CapturedEntry[]> {
    return this.enqueue(() => readJson<CapturedEntry[]>(this.store, capturedKey(userId), []));
  }

  saveCaptured(userId: string, entry: CapturedEntry): Promise<void> {
    return this.upsert(capturedKey(userId), entry);
  }

  removeCaptured(userId: string, digimonId: number): Promise<void> {
    return this.remove(capturedKey(userId), digimonId);
  }

  private upsert<T extends { id: number }>(key: string, entry: T): Promise<void> {
    return this.enqueue(async () => {
      const list = await readJson<T[]>(this.store, key, []);
      await writeJson(this.store, key, [entry, ...list.filter((item) => item.id !== entry.id)]);
    });
  }

  private remove(key: string, digimonId: number): Promise<void> {
    return this.enqueue(async () => {
      const list = await readJson<{ id: number }[]>(this.store, key, []);
      await writeJson(
        this.store,
        key,
        list.filter((item) => item.id !== digimonId),
      );
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }
}
