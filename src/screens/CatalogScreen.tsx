import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { GRID_COLUMNS, ItemCard } from '../components/ItemCard';
import { ListFooter } from '../components/ListFooter';
import { LoadingView } from '../components/LoadingView';
import { useCardActions } from '../hooks/useCardActions';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { listDigimon } from '../services/digimonService';
import { colors, spacing } from '../theme';
import type { DigimonSummary } from '../types';

const fetchCatalogPage = (page: number, signal: AbortSignal) => listDigimon(page, signal);

/** RF01: catálogo em grade com rolagem infinita, pull-to-refresh e placeholders. */
export function CatalogScreen() {
  const list = usePaginatedList<DigimonSummary>(fetchCatalogPage, []);
  const { favoriteIds, openDetails, toggle } = useCardActions();

  const renderItem = useCallback<ListRenderItem<DigimonSummary>>(
    ({ item }) => (
      <ItemCard
        item={item}
        isFavorite={favoriteIds.has(item.id)}
        onPress={openDetails}
        onToggleFavorite={toggle}
      />
    ),
    [favoriteIds, openDetails, toggle],
  );

  if (list.initialLoading && list.items.length === 0) {
    return <LoadingView label="Carregando Digimon..." />;
  }
  if (list.error && list.items.length === 0) {
    return <ErrorView message={list.error} onRetry={list.retry} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={list.items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        extraData={favoriteIds}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.content}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={
          list.error ? <ErrorView compact message={list.error} onRetry={list.retry} /> : undefined
        }
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
          <EmptyState icon="search-outline" title="Nenhum Digimon encontrado" message="Puxe para atualizar." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.sm, flexGrow: 1 },
});
