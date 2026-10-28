import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { BackendMode } from '../types';

const MODE_TEXT: Record<BackendMode, { badge: string; spoken: string }> = {
  firebase: { badge: 'Modo: Nuvem (Firebase)', spoken: 'nuvem, Firebase' },
  local: { badge: 'Modo: Local (neste aparelho)', spoken: 'local, neste aparelho' },
};

/** Logo, slogan e o selo que mostra onde os dados são salvos (local ou nuvem). */
export function AuthBrand({ mode }: { mode: BackendMode }) {
  const { badge, spoken } = MODE_TEXT[mode];
  return (
    <View style={styles.brand}>
      <Text style={styles.logo} accessibilityRole="header">
        DigiDex
      </Text>
      <Text style={styles.tagline}>Seu catálogo de Digimon</Text>
      <View style={styles.badge} accessible accessibilityLabel={`Modo de armazenamento: ${spoken}`}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  logo: { color: colors.primary, fontSize: 40, fontWeight: '900' },
  tagline: { color: colors.textMuted, fontSize: 16 },
  badge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
