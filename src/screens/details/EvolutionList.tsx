import { StyleSheet, Text } from 'react-native';
import { DigimonRow } from '../../components/DigimonRow';
import { Section } from '../../components/Section';
import { colors } from '../../theme';
import type { DigimonSummary, Evolution } from '../../types';

interface EvolutionListProps {
  title: string;
  items: Evolution[];
  onOpen: (item: DigimonSummary) => void;
}

/** Evoluções anteriores ou seguintes; tocar em uma abre os detalhes dela. */
export function EvolutionList({ title, items, onOpen }: EvolutionListProps) {
  if (items.length === 0) return null;
  return (
    <Section title={title}>
      {items.map((evolution) => (
        <DigimonRow
          key={evolution.id}
          item={evolution}
          onPress={onOpen}
          accessibilityDetail={evolution.condition || undefined}
        >
          {evolution.condition ? <Text style={styles.condition}>{evolution.condition}</Text> : null}
        </DigimonRow>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  condition: { color: colors.textMuted, fontSize: 14 },
});
