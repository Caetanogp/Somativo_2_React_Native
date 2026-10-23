import { AxiosError } from 'axios';
import {
  NotFoundError,
  PAGE_SIZE,
  getDigimon,
  listDigimon,
  mapDetail,
  searchDigimon,
  toFriendlyError,
} from '../src/services/digimonService';

jest.mock('../src/services/api', () => ({ api: { get: jest.fn() } }));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const get = require('../src/services/api').api.get as jest.Mock;

const httpError = (status: number) =>
  new AxiosError('falhou', 'ERR_BAD_REQUEST', undefined, undefined, { status } as never);

describe('digimonService', () => {
  describe('listDigimon (RF01)', () => {
    it('pede a página com pageSize e mapeia os itens', async () => {
      get.mockResolvedValue({
        data: {
          content: [
            { id: 1, name: 'Agumon', image: 'https://img/agumon.png' },
            { id: 2, name: 'Sem imagem', image: '' },
          ],
          pageable: { currentPage: 3, totalPages: 10 },
        },
      });

      const page = await listDigimon(3);

      expect(get).toHaveBeenCalledWith('/digimon', {
        params: { page: 3, pageSize: PAGE_SIZE },
        signal: undefined,
      });
      expect(page.items).toEqual([
        { id: 1, name: 'Agumon', imageUrl: 'https://img/agumon.png' },
        { id: 2, name: 'Sem imagem', imageUrl: null },
      ]);
      expect(page.page).toBe(3);
      expect(page.hasMore).toBe(true);
    });

    it('detecta a última página (as páginas começam em 0)', async () => {
      get.mockResolvedValue({
        data: { content: [{ id: 9, name: 'Z' }], pageable: { currentPage: 9, totalPages: 10 } },
      });
      expect((await listDigimon(9)).hasMore).toBe(false);
    });

    it('repassa o AbortSignal ao Axios', async () => {
      get.mockResolvedValue({ data: { content: [], pageable: { currentPage: 0, totalPages: 1 } } });
      const controller = new AbortController();
      await listDigimon(0, controller.signal);
      expect(get.mock.calls[0][1].signal).toBe(controller.signal);
    });
  });

  describe('searchDigimon (RF08)', () => {
    it('envia nome e nível quando informados', async () => {
      get.mockResolvedValue({ data: { content: [], pageable: { currentPage: 0, totalPages: 0 } } });
      await searchDigimon({ name: '  agu ', level: 'Child' }, 0);
      expect(get.mock.calls[0][1].params).toEqual({ page: 0, pageSize: PAGE_SIZE, name: 'agu', level: 'Child' });
    });

    it('omite parâmetros vazios', async () => {
      get.mockResolvedValue({ data: { content: [], pageable: { currentPage: 0, totalPages: 0 } } });
      await searchDigimon({ name: '   ' }, 0);
      expect(get.mock.calls[0][1].params).toEqual({ page: 0, pageSize: PAGE_SIZE });
    });

    it('trata a resposta SEM a chave "content" (nenhum resultado) como lista vazia', async () => {
      get.mockResolvedValue({
        data: { pageable: { currentPage: 0, elementsOnPage: 0, totalElements: 0, totalPages: 0 } },
      });
      const page = await searchDigimon({ name: 'zzzz' }, 0);
      expect(page.items).toEqual([]);
      expect(page.hasMore).toBe(false);
    });
  });

  describe('getDigimon (RF03)', () => {
    const detail = {
      id: 1,
      name: 'Agumon',
      xAntibody: false,
      images: [{ href: 'https://img/agumon.png' }],
      levels: [{ id: 4, level: 'Child' }],
      types: [{ id: 1, type: 'Reptile' }],
      attributes: [{ id: 4, attribute: 'Vaccine' }],
      fields: [{ id: 8, field: 'Deep Savers' }],
      releaseDate: '1997',
      descriptions: [
        { language: 'jap', description: '日本語' },
        { language: 'en_us', description: 'A Reptile Digimon.' },
      ],
      skills: [{ skill: 'Baby Flame', description: 'Spits fire.' }],
      priorEvolutions: [],
      nextEvolutions: [{ id: 493, digimon: 'Agnimon', condition: 'with a spirit', image: 'https://img/a.png' }],
    };

    it('mapeia o detalhe completo, preferindo a descrição em inglês', async () => {
      get.mockResolvedValue({ data: detail });
      const result = await getDigimon(1);

      expect(get).toHaveBeenCalledWith('/digimon/1', { signal: undefined });
      expect(result).toMatchObject({
        id: 1,
        name: 'Agumon',
        imageUrl: 'https://img/agumon.png',
        levels: ['Child'],
        types: ['Reptile'],
        attributes: ['Vaccine'],
        fields: ['Deep Savers'],
        releaseDate: '1997',
        description: 'A Reptile Digimon.',
        skills: [{ name: 'Baby Flame', description: 'Spits fire.' }],
      });
      expect(result.nextEvolutions).toEqual([
        { id: 493, name: 'Agnimon', imageUrl: 'https://img/a.png', condition: 'with a spirit' },
      ]);
    });

    it('lida com campos ausentes sem quebrar', () => {
      const result = mapDetail({ id: 7, name: 'Vazio' });
      expect(result).toMatchObject({ imageUrl: null, levels: [], description: '', skills: [], releaseDate: null });
    });

    it('usa a primeira descrição quando não há inglês', () => {
      const result = mapDetail({ id: 7, name: 'X', descriptions: [{ language: 'jap', description: 'こんにちは' }] });
      expect(result.description).toBe('こんにちは');
    });

    it('converte HTTP 400 (id inexistente na Digi-API) em NotFoundError', async () => {
      get.mockRejectedValue(httpError(400));
      await expect(getDigimon(999999)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('propaga outros erros', async () => {
      const error = httpError(500);
      get.mockRejectedValue(error);
      await expect(getDigimon(1)).rejects.toBe(error);
    });
  });

  describe('toFriendlyError (RF09)', () => {
    it('explica falta de conexão', () => {
      const offline = new AxiosError('Network Error', 'ERR_NETWORK');
      expect(toFriendlyError(offline)).toContain('conectar');
    });

    it('explica timeout, erro de servidor, 404 e erros desconhecidos', () => {
      expect(toFriendlyError(new AxiosError('t', 'ECONNABORTED'))).toContain('demorou');
      expect(toFriendlyError(httpError(503))).toContain('instável');
      expect(toFriendlyError(httpError(404))).toContain('Não foi possível carregar');
      expect(toFriendlyError(new NotFoundError())).toBe('Digimon não encontrado.');
      expect(toFriendlyError(new Error('qualquer'))).toBe('Algo deu errado. Tente novamente.');
    });
  });
});
