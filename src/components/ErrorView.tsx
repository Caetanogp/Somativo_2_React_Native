import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  /** Versão curta para o rodapé de listas (falha ao carregar a próxima página). */
  compact?: boolean;
}

/** Mensagem de erro amigável com botão "Tentar novamente" (RF09). */
export function ErrorView({ message, onRetry, compact = false }: ErrorViewProps) {
  return (
    <View style={[styles.container, compact && styles.compact]} accessibilityLiveRegion="polite">
      {!compact && <Ionicons name="cloud-offline-outline" size={56} color={colors.danger} />}
      <Text style={styles.message} accessibilityRole="alert">
        {message}
      </Text>
      <PrimaryButton title="Tentar novamente" onPress={onRetry} hint="Repete a última tentativa" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  compact: { flex: 0, padding: spacing.lg, gap: spacing.md },
  message: { color: colors.text, fontSize: 16, textAlign: 'center' },
});
