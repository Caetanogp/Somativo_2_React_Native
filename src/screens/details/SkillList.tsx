import { StyleSheet, Text, View } from 'react-native';
import { Section } from '../../components/Section';
import { bodyText, colors, radius, spacing } from '../../theme';
import type { Skill } from '../../types';

/** Golpes do Digimon. Não mostra nada se ele não tiver golpes cadastrados. */
export function SkillList({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null;
  return (
    <Section title="Golpes">
      {skills.map((skill) => (
        <View
          key={skill.name}
          style={styles.skill}
          accessible
          accessibilityLabel={`${skill.name}. ${skill.description}`}
        >
          <Text style={styles.name}>{skill.name}</Text>
          {skill.description ? <Text style={bodyText}>{skill.description}</Text> : null}
        </View>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  skill: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
