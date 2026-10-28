import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { MIN_TOUCH, colors, hitSlop } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  /** Obrigatório: ícone sozinho não tem texto para o leitor de tela. */
  label: string;
  hint?: string;
  /** Para botões de liga/desliga: informa o estado atual ao leitor de tela. */
  selected?: boolean;
  disabled?: boolean;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Botão de ícone com área de toque de no mínimo 44×44 pt e `hitSlop` extra (RF10). */
export function IconButton({
  icon,
  onPress,
  label,
  hint,
  selected,
  disabled,
  color = colors.text,
  size = 26,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MIN_TOUCH / 2,
  },
  pressed: { opacity: 0.6 },
});
