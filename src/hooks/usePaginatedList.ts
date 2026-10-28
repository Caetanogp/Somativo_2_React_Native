import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import { toFriendlyError } from '../services/digimonService';
import type { Page } from '../types';

export interface UsePaginatedListOptions {
  /** Quando falso, nada é buscado e a lista fica vazia (ex.: busca ainda não enviada). */
  enabled?: boolean;
}

export interface UsePaginatedListResult<T> {
  items: T[];
  /** Primeira página em andamento (tela inteira). */
  initialLoading: boolean;
  /** Próxima página em andamento (rodapé da lista). */
  loadingMore: boolean;
  /** Pull-to-refresh em andamento. */
  refreshing: boolean;
  /** Falha ao carregar a primeira página ou ao atualizar. */
  error: string | null;
  /** Falha ao carregar a próxima página (os itens já carregados continuam visíveis). */
  loadMoreError: string | null;
  hasMore: boolean;
  /** Para `onEndReached`: ignorado enquanto houver requisição, erro pendente ou fim da lista. */
  loadMore: () => void;
  /** Para `onRefresh`: recarrega a primeira página. */
  refresh: () => void;
  /** Repete a operação que falhou (primeira página, atualização ou próxima página). */
  retry: () => void;
}

/** O que a lista está fazendo agora. */
type Phase = 'idle' | 'initial' | 'refresh' | 'more';
type LoadPhase = Exclude<Phase, 'idle'>;

interface ListState<T> {
  items: T[];
  phase: Phase;
  hasMore: boolean;
  nextPage: number;
  /** Última falha e qual operação falhou (para o "Tentar novamente" repetir a mesma). */
  error: { message: string; phase: LoadPhase } | null;
}

const initialState = <T>(enabled: boolean): ListState<T> => ({
  items: [],
  phase: enabled ? 'initial' : 'idle',
  hasMore: true,
  nextPage: 0,
  error: null,
});

const mergeById = <T extends { id: number }>(current: T[], incoming: T[]): T[] => {
  const known = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !known.has(item.id))];
};

/**
 * Lista paginada com rolagem infinita (RF01). A primeira página é a 0, como na Digi-API.
 *
 * Como evita problemas comuns:
 * - requisições duplicadas: `current` espelha o estado de forma síncrona, então duas chamadas
 *   seguidas de `loadMore` enxergam a mesma fase e só a primeira dispara;
 * - respostas atrasadas: cada requisição tem um número (`request.id`); se uma nova começou (ou o
 *   componente desmontou), a resposta antiga é descartada e a requisição é abortada;
 * - chaves repetidas no `keyExtractor`: os itens são deduplicados por `id`.
 */
export function usePaginatedList<T extends { id: number }>(
  fetchPage: (page: number, signal: AbortSignal) => Promise<Page<T>>,
  deps: DependencyList,
  { enabled = true }: UsePaginatedListOptions = {},
): UsePaginatedListResult<T> {
  const [state, setState] = useState<ListState<T>>(() => initialState<T>(enabled));
  const current = useRef(state);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const request = useRef({ id: 0, controller: new AbortController() });

  const update = useCallback((patch: Partial<ListState<T>>) => {
    current.current = { ...current.current, ...patch };
    setState(current.current);
  }, []);

  /** Invalida a requisição em andamento: ela é abortada e a resposta, se chegar, é ignorada. */
  const cancel = useCallback(() => {
    request.current.id += 1;
    request.current.controller.abort();
  }, []);

  const load = useCallback(
    async (phase: LoadPhase) => {
      cancel();
      const controller = new AbortController();
      request.current.controller = controller;
      const requestId = request.current.id;
      const page = phase === 'more' ? current.current.nextPage : 0;

      update({ phase, error: null });
      try {
        const result = await fetchRef.current(page, controller.signal);
        if (requestId !== request.current.id) return;
        update({
          items: phase === 'more' ? mergeById(current.current.items, result.items) : result.items,
          hasMore: result.hasMore,
          nextPage: page + 1,
          phase: 'idle',
        });
      } catch (caught) {
        if (requestId !== request.current.id || axios.isCancel(caught)) return;
        update({ phase: 'idle', error: { message: toFriendlyError(caught), phase } });
      }
    },
    [cancel, update],
  );

  // Reinicia sempre que as dependências mudam (ex.: nova busca) e cancela ao desmontar.
  useEffect(() => {
    cancel();
    update(initialState<T>(enabled));
    if (enabled) void load('initial');
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, cancel, update, load]);

  const loadMore = useCallback(() => {
    const { phase, hasMore, error } = current.current;
    if (enabled && phase === 'idle' && hasMore && !error) void load('more');
  }, [enabled, load]);

  const refresh = useCallback(() => {
    if (enabled) void load('refresh');
  }, [enabled, load]);

  const retry = useCallback(() => {
    if (enabled) void load(current.current.error?.phase ?? 'initial');
  }, [enabled, load]);

  const { error } = state;
  return {
    items: state.items,
    initialLoading: state.phase === 'initial',
    loadingMore: state.phase === 'more',
    refreshing: state.phase === 'refresh',
    error: error && error.phase !== 'more' ? error.message : null,
    loadMoreError: error?.phase === 'more' ? error.message : null,
    hasMore: state.hasMore,
    loadMore,
    refresh,
    retry,
  };
}
