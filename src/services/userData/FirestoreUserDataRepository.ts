import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { CapturedEntry, FavoriteEntry } from '../../types';
import type { UserDataRepository } from './UserDataRepository';

/**
 * Persistência em nuvem no Firestore, isolada por usuário:
 *   users/{uid}/favorites/{digimonId}
 *   users/{uid}/captured/{digimonId}
 * As regras de segurança (firestore.rules) só permitem que cada usuário acesse o próprio `users/{uid}`.
 */
export class FirestoreUserDataRepository implements UserDataRepository {
  constructor(private readonly db: Firestore) {}

  loadFavorites(userId: string): Promise<FavoriteEntry[]> {
    return this.loadAll<FavoriteEntry>(userId, 'favorites');
  }

  saveFavorite(userId: string, entry: FavoriteEntry): Promise<void> {
    return this.save(userId, 'favorites', entry);
  }

  removeFavorite(userId: string, digimonId: number): Promise<void> {
    return this.remove(userId, 'favorites', digimonId);
  }

  loadCaptured(userId: string): Promise<CapturedEntry[]> {
    return this.loadAll<CapturedEntry>(userId, 'captured');
  }

  saveCaptured(userId: string, entry: CapturedEntry): Promise<void> {
    return this.save(userId, 'captured', entry);
  }

  removeCaptured(userId: string, digimonId: number): Promise<void> {
    return this.remove(userId, 'captured', digimonId);
  }

  private async loadAll<T>(userId: string, name: 'favorites' | 'captured'): Promise<T[]> {
    const snapshot = await getDocs(collection(this.db, 'users', userId, name));
    return snapshot.docs.map((document) => document.data() as T);
  }

  private async save<T extends { id: number }>(
    userId: string,
    name: 'favorites' | 'captured',
    entry: T,
  ): Promise<void> {
    await setDoc(doc(this.db, 'users', userId, name, String(entry.id)), entry);
  }

  private async remove(userId: string, name: 'favorites' | 'captured', digimonId: number): Promise<void> {
    await deleteDoc(doc(this.db, 'users', userId, name, String(digimonId)));
  }
}
