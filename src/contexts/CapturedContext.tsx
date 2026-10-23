import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useUserCollection } from '../hooks/useUserCollection';
import type { UserDataRepository } from '../services/userData/UserDataRepository';
import type { CapturedEntry, DigimonSummary } from '../types';

export const MIN_RATING = 1;
export const MAX_RATING = 5;
/** Nota inicial ao marcar como capturado (o usuário ajusta depois). */
export const DEFAULT_RATING = 3;

interface CapturedContextValue {
  /** Mais recentes primeiro. */
  captured: CapturedEntry[];
  isHydrated: boolean;
  loadError: string | null;
  reload: () => void;
  getCaptured: (id: number) => CapturedEntry | undefined;
  /** Marca como capturado com nota de 1 a 5 (ou atualiza a nota se já estava capturado). */
  capture: (item: DigimonSummary, rating: number) => Promise<void>;
  release: (id: number) => Promise<void>;
}

const CapturedContext = createContext<CapturedContextValue | undefined>(undefined);

interface CapturedProviderProps {
  userId: string;
  repository: UserDataRepository;
  children: ReactNode;
}

const clampRating = (rating: number): number =>
  Math.min(MAX_RATING, Math.max(MIN_RATING, Math.round(rating)));

/** Estado global dos itens "consumidos" do catálogo: aqui, Digimon capturados com nota pessoal. */
export function CapturedProvider({ userId, repository, children }: CapturedProviderProps) {
  const collection = useUserCollection<CapturedEntry>({
    userId,
    load: () => repository.loadCaptured(userId),
    save: (entry) => repository.saveCaptured(userId, entry),
    remove: (id) => repository.removeCaptured(userId, id),
    sort: (a, b) => b.capturedAt - a.capturedAt,
  });
  const { items, upsert, removeById } = collection;

  const capture = useCallback(
    async (item: DigimonSummary, rating: number) => {
      const existing = items.find((entry) => entry.id === item.id);
      await upsert({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        rating: clampRating(rating),
        capturedAt: existing?.capturedAt ?? Date.now(),
      });
    },
    [items, upsert],
  );

  const value = useMemo<CapturedContextValue>(
    () => ({
      captured: items,
      isHydrated: collection.isHydrated,
      loadError: collection.loadError,
      reload: collection.reload,
      getCaptured: (id) => items.find((entry) => entry.id === id),
      capture,
      release: removeById,
    }),
    [items, collection.isHydrated, collection.loadError, collection.reload, capture, removeById],
  );

  return <CapturedContext.Provider value={value}>{children}</CapturedContext.Provider>;
}

export function useCaptured(): CapturedContextValue {
  const context = useContext(CapturedContext);
  if (!context) throw new Error('useCaptured deve ser usado dentro de um <CapturedProvider>.');
  return context;
}
