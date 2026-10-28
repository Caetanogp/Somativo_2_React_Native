import { useCallback, useRef } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import type { DigimonSummary } from '../types';
import { runOrAlert } from '../utils/runOrAlert';
import { useOpenDetails } from './useOpenDetails';

/**
 * Ações dos cards de Digimon (abrir detalhes e favoritar), compartilhadas por Catálogo e Favoritos.
 * `openDetails` e `toggle` têm identidade estável para o `memo` do `ItemCard` evitar re-renderizar
 * todos os cards quando um único favorito muda.
 */
export function useCardActions() {
  const openDetails = useOpenDetails();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const toggleRef = useRef(toggleFavorite);
  toggleRef.current = toggleFavorite;

  const toggle = useCallback(
    (item: DigimonSummary) => runOrAlert(() => toggleRef.current(item)),
    [],
  );

  return { favoriteIds, openDetails, toggle };
}
