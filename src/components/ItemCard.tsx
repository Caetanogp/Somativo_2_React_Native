import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { DigimonSummary } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { RemoteImage } from './RemoteImage';

export const GRID_COLUMNS = 2;

interface ItemCardProps {
  item: DigimonSummary;
  isFavorite: boolean;
  onPress: (item: DigimonSummary) => void;
  onToggleFavorite: (item: DigimonSummary) => void;
}

/**
 * Card do catálogo em grade: recebe tudo por props (RF01). O coração fica FORA do botão do card
 * (irmão, não filho) para que leitores de tela e toques tratem as duas ações separadamente.
 */
function ItemCardBase({ item, isFavorite, onPress, onToggleFavorite }: ItemCardProps) {
  return (
    <View style={styles.cell}>
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.name}. Abrir detalhes`}
          onPress={() => onPress(item)}
          style={({ pressed }) => [styles.body, pressed && styles.pressed]}
        >
          <RemoteImage uri={item.imageUrl} label={`Imagem de ${item.name}`} style={styles.image} />
          <Text style={styles.name}>
            {item.name}
          </Text>
        </Pressable>
        <FavoriteButton
          name={item.name}
          isFavorite={isFavorite}
          onToggle={() => onToggleFavorite(item)}
          style={styles.heart}
        />
      </View>
    </View>
  );
}

export const ItemCard = memo(ItemCardBase);

const styles = StyleSheet.create({
  // Metade da largura mesmo quando a última linha tem um item só.
  cell: { flexBasis: `${100 / GRID_COLUMNS}%`, maxWidth: `${100 / GRID_COLUMNS}%`, padding: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  body: { padding: spacing.sm },
  pressed: { opacity: 0.75 },
  image: { width: '100%', aspectRatio: 1 },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  heart: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
  },
});
