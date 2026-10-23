import { useCallback, useEffect, useRef, useState } from 'react';

export interface UserCollectionConfig<T extends { id: number }> {
  /** Muda quando o usuário muda: a coleção é recarregada do zero. */
  userId: string;
  load: () => Promise<T[]>;
  save: (entry: T) => Promise<void>;
  remove: (id: number) => Promise<void>;
  sort: (a: T, b: T) => number;
}

export interface UserCollection<T extends { id: number }> {
  items: T[];
  /** Falso até a primeira carga terminar: a UI nunca deve mostrar uma lista "zerada" antes disso. */
  isHydrated: boolean;
  loadError: string | null;
  reload: () => void;
  /** Insere ou atualiza (otimista). Lança se a persistência falhar, após reverter o estado. */
  upsert: (entry: T) => Promise<void>;
  /** Remove (otimista). Lança se a persistência falhar, após reverter o estado. */
  removeById: (id: number) => Promise<void>;
}

/**
 * Coleção de itens do usuário, persistida por um repositório (local ou nuvem).
 *
 * - A carga inicial acontece em um `useEffect`, com flag `cancelled` no cleanup para não atualizar
 *   estado depois do unmount nem aplicar a resposta de um usuário anterior.
 * - Escritas são otimistas: a UI muda na hora e volta atrás se salvar falhar.
 */
export function useUserCollection<T extends { id: number }>(
  config: UserCollectionConfig<T>,
): UserCollection<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Sempre a configuração e a lista mais recentes, sem recriar os callbacks a cada render.
  const configRef = useRef(config);
  configRef.current = config;
  const itemsRef = useRef<T[]>([]);

  const commit = useCallback((next: T[]) => {
    itemsRef.current = [...next].sort(configRef.current.sort);
    setItems(itemsRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsHydrated(false);
    setLoadError(null);
    commit([]);

    configRef.current
      .load()
      .then((loaded) => {
        if (!cancelled) commit(loaded);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Não foi possível carregar seus dados salvos.');
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [config.userId, attempt, commit]);

  /** Aplica a mudança na tela na hora e a salva; se salvar falhar, volta ao estado anterior. */
  const mutate = useCallback(
    async (next: T[], persist: () => Promise<void>) => {
      const previous = itemsRef.current;
      commit(next);
      try {
        await persist();
      } catch (error) {
        commit(previous);
        throw error;
      }
    },
    [commit],
  );

  const upsert = useCallback(
    (entry: T) =>
      mutate([entry, ...itemsRef.current.filter((item) => item.id !== entry.id)], () =>
        configRef.current.save(entry),
      ),
    [mutate],
  );

  const removeById = useCallback(
    (id: number) =>
      mutate(
        itemsRef.current.filter((item) => item.id !== id),
        () => configRef.current.remove(id),
      ),
    [mutate],
  );

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { items, isHydrated, loadError, reload, upsert, removeById };
}
