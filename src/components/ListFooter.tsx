import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { ErrorView } from './ErrorView';

interface ListFooterProps {
  loadingMore: boolean;
  loadMoreError: string | null;
  hasMore: boolean;
  hasItems: boolean;
  onRetry: () => void;
}

/** `ListFooterComponent` das listas paginadas: carregando, erro com retry, ou fim da lista (RF09). */
export function ListFooter({ loadingMore, loadMoreError, hasMore, hasItems, onRetry }: ListFooterProps) {
  if (loadingMore) {
    return (
      <View style={styles.footer} accessible accessibilityLabel="Carregando mais itens" accessibilityRole="progressbar">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (loadMoreError) return <ErrorView compact message={loadMoreError} onRetry={onRetry} />;
  if (!hasMore && hasItems) {
    return (
      <View style={styles.footer}>
        <Text style={styles.end}>Você chegou ao fim da lista.</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  footer: { padding: spacing.xl, alignItems: 'center' },
  end: { color: colors.textMuted, fontSize: 14 },
});
