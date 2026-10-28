import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AxiosError } from 'axios';
import { useFetch } from '../src/hooks/useFetch';
import { deferred } from './deferred';

describe('useFetch (RF09: loading / error / data explícitos)', () => {
  it('passa de loading para success', async () => {
    const request = deferred<{ name: string }>();
    const fetcher = jest.fn().mockReturnValue(request.promise);
    const { result } = await renderHook(() => useFetch(fetcher, []));

    expect(result.current.state.status).toBe('loading');
    expect(result.current.loading).toBe(true);

    await act(async () => request.resolve({ name: 'Agumon' }));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(result.current.data).toEqual({ name: 'Agumon' });
    expect(result.current.error).toBeNull();
  });

  it('passa para error com mensagem amigável e permite tentar novamente', async () => {
    const fetcher = jest
      .fn()
      .mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
      .mockResolvedValueOnce('ok');
    const { result } = await renderHook(() => useFetch(fetcher, []));

    await waitFor(() => expect(result.current.state.status).toBe('error'));
    expect(result.current.error).toContain('conectar');
    expect(result.current.data).toBeNull();

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.data).toBe('ok'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('aborta a requisição ao desmontar (cleanup) e não atualiza estado depois', async () => {
    let signal: AbortSignal | undefined;
    const fetcher = jest.fn((s: AbortSignal) => {
      signal = s;
      return new Promise<string>(() => undefined);
    });
    const { unmount } = await renderHook(() => useFetch(fetcher, []));

    expect(signal?.aborted).toBe(false);
    await unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('refaz a requisição quando as dependências mudam, abortando a anterior', async () => {
    const signals: AbortSignal[] = [];
    const fetcher = jest.fn((s: AbortSignal) => {
      signals.push(s);
      return Promise.resolve(signals.length);
    });
    const { result, rerender } = await renderHook(({ id }: { id: number }) => useFetch(fetcher, [id]), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.data).toBe(1));

    await rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe(2));
    expect(signals[0]?.aborted).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
