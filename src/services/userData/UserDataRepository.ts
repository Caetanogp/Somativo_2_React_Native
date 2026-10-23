import type { CapturedEntry, FavoriteEntry } from '../../types';

/**
 * Persistência dos dados do usuário (favoritos e capturados). Os contexts só conhecem esta
 * interface: AsyncStorage (local) e Firestore (nuvem) são intercambiáveis.
 */
export interface UserDataRepository {
  loadFavorites(userId: string): Promise<FavoriteEntry[]>;
  saveFavorite(userId: string, entry: FavoriteEntry): Promise<void>;
  removeFavorite(userId: string, digimonId: number): Promise<void>;

  loadCaptured(userId: string): Promise<CapturedEntry[]>;
  saveCaptured(userId: string, entry: CapturedEntry): Promise<void>;
  removeCaptured(userId: string, digimonId: number): Promise<void>;
}
