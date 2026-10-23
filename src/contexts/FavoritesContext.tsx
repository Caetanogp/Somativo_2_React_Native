import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useUserCollection } from '../hooks/useUserCollection';
import type { UserDataRepository } from '../services/userData/UserDataRepository';
import type { DigimonSummary, FavoriteEntry } from '../types';

interface FavoritesContextValue {
  /** Mais recentes primeiro. */
  favorites: FavoriteEntry[];
  /** `Set` dos ids favoritos: consulta O(1) para os cards do catálogo e dos detalhes. */
  favoriteIds: ReadonlySet<number>;
  isHydrated: boolean;
  loadError: string | null;
  reload: () => void;
  isFavorite: (id: number) => boolean;
  /** Favorita ou desfavorita. Lança se não conseguir salvar (o estado já foi revertido). */
  toggleFavorite: (item: DigimonSummary) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

interface FavoritesProviderProps {
  userId: string;
  repository: UserDataRepository;
  children: ReactNode;
}

/**
 * Estado global dos favoritos (RF04). Está acima das telas de catálogo, detalhes e favoritos,
 * então o coração do card e o do detalhe sempre mostram o mesmo estado.
 */
export function FavoritesProvider({ userId, repository, children }: FavoritesProviderProps) {
  const collection = useUserCollection<FavoriteEntry>({
    userId,
    load: () => repository.loadFavorites(userId),
    save: (entry) => repository.saveFavorite(userId, entry),
    remove: (id) => repository.removeFavorite(userId, id),
    sort: (a, b) => b.addedAt - a.addedAt,
  });
  const { items, upsert, removeById } = collection;

  const favoriteIds = useMemo<ReadonlySet<number>>(
    () => new Set(items.map((item) => item.id)),
    [items],
  );

  const toggleFavorite = useCallback(
    async (item: DigimonSummary) => {
      if (favoriteIds.has(item.id)) {
        await removeById(item.id);
      } else {
        await upsert({ id: item.id, name: item.name, imageUrl: item.imageUrl, addedAt: Date.now() });
      }
    },
    [favoriteIds, removeById, upsert],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites: items,
      favoriteIds,
      isHydrated: collection.isHydrated,
      loadError: collection.loadError,
      reload: collection.reload,
      isFavorite: (id) => favoriteIds.has(id),
      toggleFavorite,
    }),
    [items, favoriteIds, collection.isHydrated, collection.loadError, collection.reload, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites deve ser usado dentro de um <FavoritesProvider>.');
  return context;
}
