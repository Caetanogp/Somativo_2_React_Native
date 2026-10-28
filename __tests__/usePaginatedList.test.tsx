import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AxiosError } from 'axios';
import { usePaginatedList } from '../src/hooks/usePaginatedList';
import type { Page } from '../src/types';
import { deferred } from './deferred';

interface Item {
  id: number;
}

const page = (ids: number[], pageNumber: number, hasMore: boolean): Page<Item> => ({
  items: ids.map((id) => ({ id })),
  page: pageNumber,
  hasMore,
});

const networkError = () => new AxiosError('Network Error', 'ERR_NETWORK');

describe('usePaginatedList (RF01, RF09)', () => {
  it('carrega a primeira página e informa o estado de loading', async () => {
    const request = deferred<Page<Item>>();
    const fetchPage = jest.fn().mockReturnValue(request.promise);
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));

    expect(result.current.initialLoading).toBe(true);
    await act(async () => request.resolve(page([1, 2], 0, true)));
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    expect(result.current.items.map((i) => i.id)).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);
    expect(fetchPage).toHaveBeenCalledWith(0, expect.any(AbortSignal));
  });

  it('rolagem infinita: anexa a próxima página à lista existente', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page([1, 2], 0, true))
      .mockResolvedValueOnce(page([3, 4], 1, false));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(4));

    expect(result.current.items.map((i) => i.id)).toEqual([1, 2, 3, 4]);
    expect(fetchPage).toHaveBeenLastCalledWith(1, expect.any(AbortSignal));
    expect(result.current.hasMore).toBe(false);

    // Sem mais páginas: o gatilho de fim de lista não faz nova requisição.
    await act(async () => result.current.loadMore());
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('ignora "carregar mais" enquanto já há uma requisição em andamento', async () => {
    let resolveSecond: (value: Page<Item>) => void = () => undefined;
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page([1], 0, true))
      .mockImplementationOnce(() => new Promise<Page<Item>>((resolve) => (resolveSecond = resolve)));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(result.current.loadingMore).toBe(true);

    await act(async () => resolveSecond(page([2], 1, false)));
    await waitFor(() => expect(result.current.items).toHaveLength(2));
  });

  it('deduplica itens repetidos entre páginas (keyExtractor continua único)', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page([1, 2], 0, true))
      .mockResolvedValueOnce(page([2, 3], 1, false));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(3));
    expect(result.current.items.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('pull-to-refresh recarrega a primeira página e substitui a lista', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page([1, 2], 0, true))
      .mockResolvedValueOnce(page([9], 0, false));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.refreshing).toBe(false));

    expect(result.current.items.map((i) => i.id)).toEqual([9]);
    expect(fetchPage).toHaveBeenLastCalledWith(0, expect.any(AbortSignal));
  });

  it('falha na primeira página: expõe erro amigável e "tentar novamente" funciona', async () => {
    const fetchPage = jest
      .fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce(page([1], 0, false));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));

    await waitFor(() => expect(result.current.error).toContain('conectar'));
    expect(result.current.items).toEqual([]);

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });

  it('API cai durante a rolagem: mantém os itens, mostra erro no rodapé e tenta de novo a mesma página', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page([1, 2], 0, true))
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce(page([3], 1, false));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, []));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.loadMoreError).not.toBeNull());
    expect(result.current.items).toHaveLength(2);
    expect(result.current.error).toBeNull();

    // Com erro pendente, onEndReached não dispara requisições em loop.
    await act(async () => result.current.loadMore());
    expect(fetchPage).toHaveBeenCalledTimes(2);

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(3));
    expect(fetchPage).toHaveBeenLastCalledWith(1, expect.any(AbortSignal));
    expect(result.current.loadMoreError).toBeNull();
  });

  it('reinicia quando as dependências mudam (nova busca) e descarta a resposta antiga', async () => {
    let resolveOld: (value: Page<Item>) => void = () => undefined;
    const fetchPage = jest.fn((_page: number) => Promise.resolve(page([2], 0, false)));
    fetchPage.mockImplementationOnce(() => new Promise<Page<Item>>((resolve) => (resolveOld = resolve)));

    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => usePaginatedList<Item>(fetchPage, [term]),
      { initialProps: { term: 'a' } },
    );
    await rerender({ term: 'b' });
    await waitFor(() => expect(result.current.items.map((i) => i.id)).toEqual([2]));

    // A resposta da busca antiga chega tarde e não pode sobrescrever a nova.
    await act(async () => resolveOld(page([1], 0, false)));
    expect(result.current.items.map((i) => i.id)).toEqual([2]);
  });

  it('não busca nada quando está desabilitado', async () => {
    const fetchPage = jest.fn().mockResolvedValue(page([1], 0, false));
    const { result } = await renderHook(() => usePaginatedList<Item>(fetchPage, [], { enabled: false }));

    expect(fetchPage).not.toHaveBeenCalled();
    expect(result.current.initialLoading).toBe(false);
    expect(result.current.items).toEqual([]);
  });
});
