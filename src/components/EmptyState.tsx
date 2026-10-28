import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
}

/** Estado vazio amigável (`ListEmptyComponent`). */
export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container} accessible accessibilityLabel={message ? `${title}. ${message}` : title}>
      <Ionicons name={icon} size={64} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  message: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
});
