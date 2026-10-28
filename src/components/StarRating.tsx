import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MIN_TOUCH, colors, spacing } from '../theme';

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  /** Nota atual, de 1 a 5. */
  value: number;
  /** Sem `onChange` as estrelas são apenas exibidas (lista de capturados). */
  onChange?: (rating: number) => void;
  size?: number;
}

/** Nota de 1 a 5 estrelas: editável quando recebe `onChange`, somente leitura caso contrário. */
export function StarRating({ value, onChange, size = 28 }: StarRatingProps) {
  return onChange ? (
    <StarInput value={value} onChange={onChange} size={size} />
  ) : (
    <StarDisplay value={value} size={size} />
  );
}

const starIcon = (star: number, value: number) => (star <= value ? 'star' : 'star-outline');
const starColor = (star: number, value: number) => (star <= value ? colors.star : colors.starEmpty);

/** Somente leitura: um único elemento acessível que anuncia "Nota X de 5 estrelas". */
function StarDisplay({ value, size }: { value: number; size: number }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Nota ${value} de 5 estrelas`}
    >
      {STARS.map((star) => (
        <Ionicons key={star} name={starIcon(star, value)} size={size * 0.7} color={starColor(star, value)} />
      ))}
      <Text style={styles.valueText}>{value}/5</Text>
    </View>
  );
}

/** Editável: cada estrela é um botão de 44×44 pt, e a nota atual fica marcada como selecionada. */
function StarInput({ value, onChange, size }: { value: number; onChange: (n: number) => void; size: number }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Sua nota de 1 a 5 estrelas">
      {STARS.map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessibilityRole="button"
          accessibilityLabel={`Dar nota ${star} de 5`}
          accessibilityState={{ selected: star === value }}
          style={styles.starButton}
        >
          <Ionicons name={starIcon(star, value)} size={size} color={starColor(star, value)} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  starButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { color: colors.textMuted, fontSize: 14, marginLeft: spacing.sm },
});
