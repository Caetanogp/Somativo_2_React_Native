import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import { toFriendlyError } from '../services/digimonService';

/** Os três estados de uma requisição, tratados de forma explícita (RF09). */
export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

export interface UseFetchResult<T> {
  state: FetchState<T>;
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Refaz a requisição (botão "Tentar novamente"). */
  retry: () => void;
}

/**
 * Executa `fetcher` quando `deps` mudam e expõe loading / error / data.
 *
 * - O `AbortController` cancela a requisição anterior quando as dependências mudam ou o componente
 *   desmonta, evitando requisições duplicadas e `setState` depois do unmount.
 * - Uma resposta de uma execução antiga nunca sobrescreve a mais recente.
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setState({ status: 'loading' });

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (cancelled || axios.isCancel(error)) return;
        setState({ status: 'error', error: toFriendlyError(error) });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    state,
    data: state.status === 'success' ? state.data : null,
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    retry,
  };
}
