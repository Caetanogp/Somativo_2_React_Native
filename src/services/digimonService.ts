import axios from 'axios';
import type { DigimonDetail, DigimonSummary, Evolution, Page } from '../types';
import { api } from './api';

export const PAGE_SIZE = 20;

/** Níveis de evolução aceitos pelo filtro `level` da API (todos verificados com resultados). */
export const LEVELS = [
  'Baby I',
  'Baby II',
  'Child',
  'Adult',
  'Perfect',
  'Ultimate',
  'Armor',
  'Hybrid',
] as const;
export type Level = (typeof LEVELS)[number];

export class NotFoundError extends Error {
  constructor(message = 'Digimon não encontrado.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Formatos devolvidos pela API (apenas os campos que usamos). */
interface ListItemDto {
  id: number;
  name: string;
  image?: string | null;
}
interface ListResponseDto {
  /** Ausente quando a busca não encontra nada. */
  content?: ListItemDto[];
  pageable?: { currentPage: number; totalPages: number };
}
interface NamedDto {
  id?: number;
  level?: string;
  type?: string;
  attribute?: string;
  field?: string;
}
interface EvolutionDto {
  id: number;
  digimon: string;
  condition?: string;
  image?: string | null;
}
interface DetailResponseDto {
  id: number;
  name: string;
  xAntibody?: boolean;
  images?: { href: string }[];
  levels?: NamedDto[];
  types?: NamedDto[];
  attributes?: NamedDto[];
  fields?: NamedDto[];
  releaseDate?: string;
  descriptions?: { language: string; description: string }[];
  skills?: { skill: string; description?: string }[];
  priorEvolutions?: EvolutionDto[];
  nextEvolutions?: EvolutionDto[];
}

const toSummary = (dto: ListItemDto): DigimonSummary => ({
  id: dto.id,
  name: dto.name,
  imageUrl: dto.image || null,
});

const toEvolution = (dto: EvolutionDto): Evolution => ({
  id: dto.id,
  name: dto.digimon,
  imageUrl: dto.image || null,
  condition: dto.condition ?? '',
});

/** Uma descrição em inglês, se houver; senão a primeira disponível. */
function pickDescription(descriptions: DetailResponseDto['descriptions'] = []): string {
  const english = descriptions.find((d) => d.language === 'en_us');
  return (english ?? descriptions[0])?.description ?? '';
}

/** Pega um texto de cada item de uma lista opcional, ignorando os vazios. */
const labels = <T>(list: T[] | undefined, pick: (item: T) => string | undefined): string[] =>
  (list ?? []).map(pick).filter((label): label is string => Boolean(label));

export function mapDetail(dto: DetailResponseDto): DigimonDetail {
  return {
    id: dto.id,
    name: dto.name,
    imageUrl: dto.images?.[0]?.href || null,
    levels: labels(dto.levels, (item) => item.level),
    types: labels(dto.types, (item) => item.type),
    attributes: labels(dto.attributes, (item) => item.attribute),
    fields: labels(dto.fields, (item) => item.field),
    releaseDate: dto.releaseDate || null,
    xAntibody: dto.xAntibody ?? false,
    description: pickDescription(dto.descriptions),
    skills: (dto.skills ?? []).map((s) => ({ name: s.skill, description: s.description ?? '' })),
    priorEvolutions: (dto.priorEvolutions ?? []).map(toEvolution),
    nextEvolutions: (dto.nextEvolutions ?? []).map(toEvolution),
  };
}

function toPage(data: ListResponseDto, requestedPage: number): Page<DigimonSummary> {
  const pageable = data.pageable;
  const current = pageable?.currentPage ?? requestedPage;
  return {
    items: (data.content ?? []).map(toSummary),
    page: current,
    hasMore: pageable ? current < pageable.totalPages - 1 : false,
  };
}

/** Lista paginada (rolagem infinita). `page` começa em 0. */
export async function listDigimon(page: number, signal?: AbortSignal): Promise<Page<DigimonSummary>> {
  const { data } = await api.get<ListResponseDto>('/digimon', {
    params: { page, pageSize: PAGE_SIZE },
    signal,
  });
  return toPage(data, page);
}

export interface SearchParams {
  name?: string;
  level?: Level;
}

/** Busca por nome (parcial) e/ou nível. Sem resultados devolve uma página vazia. */
export async function searchDigimon(
  { name, level }: SearchParams,
  page: number,
  signal?: AbortSignal,
): Promise<Page<DigimonSummary>> {
  const { data } = await api.get<ListResponseDto>('/digimon', {
    params: {
      page,
      pageSize: PAGE_SIZE,
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(level ? { level } : {}),
    },
    signal,
  });
  return toPage(data, page);
}

/** Segunda requisição: dados completos pelo id. A API responde 400 para ids inexistentes. */
export async function getDigimon(id: number, signal?: AbortSignal): Promise<DigimonDetail> {
  try {
    const { data } = await api.get<DetailResponseDto>(`/digimon/${id}`, { signal });
    return mapDetail(data);
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 404)) {
      throw new NotFoundError();
    }
    throw error;
  }
}

/** Traduz qualquer falha de rede/API em uma mensagem amigável para o usuário. */
export function toFriendlyError(error: unknown): string {
  if (error instanceof NotFoundError) return error.message;
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'A conexão demorou demais para responder. Tente novamente.';
    }
    if (!error.response) {
      return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
    }
    if (error.response.status >= 500) {
      return 'O servidor da Digi-API está instável no momento. Tente novamente em instantes.';
    }
    return 'Não foi possível carregar os dados. Tente novamente.';
  }
  return 'Algo deu errado. Tente novamente.';
}
