import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface PillProps {
  label: string;
  /** Categoria lida antes do valor pelo leitor de tela (ex.: "Nível"). */
  kind: string;
}

/** Etiqueta informativa (não interativa), ex.: nível, tipo, atributo. */
export function Pill({ label, kind }: PillProps) {
  return (
    <View style={styles.pill} accessible accessibilityLabel={`${kind}: ${label}`}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
