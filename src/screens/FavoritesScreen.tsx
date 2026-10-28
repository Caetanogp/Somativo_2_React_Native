import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { GRID_COLUMNS, ItemCard } from '../components/ItemCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCardActions } from '../hooks/useCardActions';
import { colors, spacing } from '../theme';
import type { FavoriteEntry } from '../types';

/** RF05: lista os favoritos a partir do Context; some da lista assim que é desfavoritado. */
export function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { favoriteIds, openDetails, toggle } = useCardActions();

  const renderItem = useCallback<ListRenderItem<FavoriteEntry>>(
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

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        extraData={favoriteIds}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={[styles.content, favorites.length === 0 && styles.centered]}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Nenhum favorito ainda"
            message="Toque no coração de um Digimon para guardá-lo aqui."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.sm, flexGrow: 1 },
  centered: { justifyContent: 'center' },
});
