import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { MIN_TOUCH, colors, radius, spacing } from '../theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
}

/** Campo de texto controlado (`value` + `onChangeText`) com rótulo visível e mensagem de erro. */
export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, Boolean(error) && styles.inputError]}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  input: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 14 },
});
