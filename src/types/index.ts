/** Resumo de um Digimon, como aparece nas listas. */
export interface DigimonSummary {
  id: number;
  name: string;
  imageUrl: string | null;
}

export interface Skill {
  name: string;
  description: string;
}

export interface Evolution {
  id: number;
  name: string;
  imageUrl: string | null;
  condition: string;
}

/** Dados completos de um Digimon, como aparecem na tela de detalhes. */
export interface DigimonDetail extends DigimonSummary {
  levels: string[];
  types: string[];
  attributes: string[];
  fields: string[];
  releaseDate: string | null;
  xAntibody: boolean;
  description: string;
  skills: Skill[];
  priorEvolutions: Evolution[];
  nextEvolutions: Evolution[];
}

/** Uma página de resultados. `page` começa em 0, como na API. */
export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}

export interface FavoriteEntry extends DigimonSummary {
  addedAt: number;
}

export interface CapturedEntry extends DigimonSummary {
  /** Nota pessoal, de 1 a 5 estrelas. */
  rating: number;
  capturedAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
}

export type BackendMode = 'local' | 'firebase';
