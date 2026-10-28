import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { MIN_TOUCH, colors, radius, spacing } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  /** Para botões de liga/desliga (ex.: "Capturado"): informa o estado atual ao leitor de tela. */
  selected?: boolean;
  hint?: string;
  style?: StyleProp<ViewStyle>;
}

/** Botão de texto. Altura mínima de 44 pt, mas cresce com a fonte do sistema (sem altura fixa). */
export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  selected,
  hint,
  style,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={hint}
      accessibilityState={{ disabled: inactive, busy: loading, selected }}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.onPrimary : colors.text} />
      ) : (
        <Text style={[styles.text, primary ? styles.textPrimary : styles.textSecondary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
  inactive: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  text: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  textPrimary: { color: colors.onPrimary },
  textSecondary: { color: colors.text },
});
