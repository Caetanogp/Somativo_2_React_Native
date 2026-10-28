import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { DigimonRow } from '../../components/DigimonRow';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { ListFooter } from '../../components/ListFooter';
import { LoadingView } from '../../components/LoadingView';
import { useOpenDetails } from '../../hooks/useOpenDetails';
import type { UsePaginatedListResult } from '../../hooks/usePaginatedList';
import { spacing } from '../../theme';
import type { DigimonSummary } from '../../types';

interface SearchResultsProps {
  /** Resultado do `usePaginatedList` da busca. */
  list: UsePaginatedListResult<DigimonSummary>;
  /** Texto buscado, usado na mensagem de "nenhum resultado". */
  term: string;
}

/** Lista de resultados da busca (RF08) com carregando, erro, vazio e rolagem infinita. */
export function SearchResults({ list, term }: SearchResultsProps) {
  const openDetails = useOpenDetails();
  const renderItem = useCallback<ListRenderItem<DigimonSummary>>(
    ({ item }) => <DigimonRow item={item} onPress={openDetails} />,
    [openDetails],
  );

  if (list.initialLoading) return <LoadingView label="Buscando..." />;
  if (list.error && list.items.length === 0) {
    return <ErrorView message={list.error} onRetry={list.retry} />;
  }

  return (
    <FlatList
      data={list.items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      onEndReached={list.loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        <ListFooter
          loadingMore={list.loadingMore}
          loadMoreError={list.loadMoreError}
          hasMore={list.hasMore}
          hasItems={list.items.length > 0}
          onRetry={list.retry}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="sad-outline"
          title="Nenhum resultado"
          message={`Nenhum Digimon encontrado para "${term}". Tente outro nome.`}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
});
