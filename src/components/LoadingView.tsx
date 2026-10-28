import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface LoadingViewProps {
  label?: string;
}

/** Indicador de carregamento de tela cheia (RF09). */
export function LoadingView({ label = 'Carregando...' }: LoadingViewProps) {
  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  label: { color: colors.textMuted, fontSize: 16, marginTop: spacing.md, textAlign: 'center' },
});
