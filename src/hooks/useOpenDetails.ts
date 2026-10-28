import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import type { AppNavigation } from '../navigation/types';
import type { DigimonSummary } from '../types';

/** Abre a tela de Detalhes de um item, passando o `id` por `route.params` (RF02). */
export function useOpenDetails() {
  const navigation = useNavigation<AppNavigation>();
  return useCallback(
    (item: DigimonSummary) => navigation.navigate('Details', { id: item.id, name: item.name }),
    [navigation],
  );
}
