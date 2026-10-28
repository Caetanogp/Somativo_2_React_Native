import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { LEVELS } from '../services/digimonService';
import type { Level } from '../services/digimonService';
import { MIN_TOUCH, colors, radius, spacing } from '../theme';

interface LevelChipsProps {
  selected: Level | null;
  /** Tocar na chip selecionada limpa o filtro. */
  onChange: (level: Level | null) => void;
}

/** Filtro por nível de evolução (RF08). */
export function LevelChips({ selected, onChange }: LevelChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="Filtrar por nível de evolução"
    >
      {LEVELS.map((level) => {
        const isSelected = level === selected;
        return (
          <Pressable
            key={level}
            onPress={() => onChange(isSelected ? null : level)}
            accessibilityRole="button"
            accessibilityLabel={`Nível ${level}`}
            accessibilityHint={isSelected ? 'Toque para remover o filtro' : 'Toque para filtrar'}
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>{level}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontSize: 14, fontWeight: '600' },
  textSelected: { color: colors.onPrimary },
});
