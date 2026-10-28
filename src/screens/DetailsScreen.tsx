import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ErrorView } from '../components/ErrorView';
import { LoadingView } from '../components/LoadingView';
import { Section } from '../components/Section';
import { useFetch } from '../hooks/useFetch';
import type { AppStackParamList } from '../navigation/types';
import { getDigimon } from '../services/digimonService';
import { bodyText, colors, spacing } from '../theme';
import type { DigimonSummary } from '../types';
import { stripHtml } from '../utils/stripHtml';
import { CaptureControls } from './details/CaptureControls';
import { DetailsHeader } from './details/DetailsHeader';
import { EvolutionList } from './details/EvolutionList';
import { SkillList } from './details/SkillList';

type Props = NativeStackScreenProps<AppStackParamList, 'Details'>;

/** RF02/RF03: detalhes por segunda requisição Axios, com favoritar (RF04) e capturar com nota (RF07). */
export function DetailsScreen({ route, navigation }: Props) {
  const { id, name: nameFromList } = route.params;
  const { data, loading, error, retry } = useFetch((signal) => getDigimon(id, signal), [id]);

  // RF02: o título do header é definido dinamicamente com o nome do item.
  const title = data?.name ?? nameFromList ?? 'Detalhes';
  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  if (loading) return <LoadingView label="Carregando detalhes..." />;
  if (!data) return <ErrorView message={error ?? 'Não foi possível carregar.'} onRetry={retry} />;

  const openEvolution = (item: DigimonSummary) =>
    navigation.push('Details', { id: item.id, name: item.name });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <DetailsHeader digimon={data} />
      <Section title="Meu registro">
        <CaptureControls digimon={data} />
      </Section>
      <Section title="Descrição">
        {/* A API pode devolver HTML: exibimos só o texto, sem tags (RF03). */}
        <Text style={bodyText}>{stripHtml(data.description) || 'Sem descrição disponível.'}</Text>
      </Section>
      <SkillList skills={data.skills} />
      <EvolutionList title="Evolui de" items={data.priorEvolutions} onOpen={openEvolution} />
      <EvolutionList title="Evolui para" items={data.nextEvolutions} onOpen={openEvolution} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
});
