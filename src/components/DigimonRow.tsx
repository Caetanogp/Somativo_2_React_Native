import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MIN_TOUCH, colors, radius, spacing } from '../theme';
import type { DigimonSummary } from '../types';
import { RemoteImage } from './RemoteImage';

interface DigimonRowProps {
  item: DigimonSummary;
  onPress: (item: DigimonSummary) => void;
  /** Conteúdo extra abaixo do nome (ex.: estrelas da nota). */
  children?: ReactNode;
  /** Texto adicional lido pelo leitor de tela depois do nome (ex.: "nota 4 de 5"). */
  accessibilityDetail?: string;
}

/** Linha de lista com miniatura e nome; usada nos resultados da busca e nos capturados. */
function DigimonRowBase({ item, onPress, children, accessibilityDetail }: DigimonRowProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={[item.name, accessibilityDetail, 'Abrir detalhes'].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <RemoteImage uri={item.imageUrl} label={`Imagem de ${item.name}`} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {children}
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

export const DigimonRow = memo(DigimonRowBase);

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  pressed: { opacity: 0.75 },
  thumb: { width: 64, height: 64 },
  info: { flex: 1, gap: spacing.xs },
  name: { color: colors.text, fontSize: 17, fontWeight: '600' },
});
