import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** Bloco de conteúdo com título (lido como cabeçalho por leitores de tela). */
export function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
});
