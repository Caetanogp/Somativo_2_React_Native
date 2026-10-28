import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { DigimonRow } from '../components/DigimonRow';
import { EmptyState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { useCaptured } from '../contexts/CapturedContext';
import { useOpenDetails } from '../hooks/useOpenDetails';
import { colors, spacing } from '../theme';
import type { CapturedEntry } from '../types';

/** RF07: itens "consumidos" (capturados) com a nota pessoal de cada um. */
export function CapturedScreen() {
  const { captured } = useCaptured();
  const openDetails = useOpenDetails();

  const renderItem = useCallback<ListRenderItem<CapturedEntry>>(
    ({ item }) => (
      <DigimonRow item={item} onPress={openDetails} accessibilityDetail={`Sua nota: ${item.rating} de 5`}>
        <StarRating value={item.rating} />
      </DigimonRow>
    ),
    [openDetails],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={captured}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.content, captured.length === 0 && styles.centered]}
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            title="Nenhum Digimon capturado"
            message="Abra um Digimon, marque como capturado e dê a sua nota."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, flexGrow: 1 },
  centered: { justifyContent: 'center' },
});
