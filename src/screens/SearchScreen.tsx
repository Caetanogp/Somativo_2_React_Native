import { useCallback, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { LevelChips } from '../components/LevelChips';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { searchDigimon } from '../services/digimonService';
import type { Level } from '../services/digimonService';
import { colors, spacing } from '../theme';
import type { DigimonSummary } from '../types';
import { SearchResults } from './search/SearchResults';

interface SubmittedSearch {
  name: string;
  level: Level | null;
  /** Faz buscar de novo mesmo com os mesmos termos. */
  nonce: number;
}

/**
 * RF08: `TextInput` controlado + botão "Buscar". Os resultados aparecem em uma LISTA (não abre o
 * primeiro item direto); tocar em um resultado abre os detalhes.
 */
export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState<SubmittedSearch | null>(null);

  // Só busca depois de apertar "Buscar" (`submitted`); mudar o texto digitado não dispara nada.
  const list = usePaginatedList<DigimonSummary>(
    (page, signal) =>
      searchDigimon({ name: submitted?.name, level: submitted?.level ?? undefined }, page, signal),
    [submitted],
    { enabled: submitted !== null },
  );

  const handleSearch = useCallback(() => {
    const name = query.trim();
    if (!name && !level) {
      setFormError('Digite um nome ou escolha um nível para buscar.');
      return;
    }
    setFormError(undefined);
    Keyboard.dismiss();
    setSubmitted({ name, level, nonce: Date.now() });
  }, [level, query]);

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextField
          label="Nome do Digimon"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Ex.: Agumon"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          error={formError}
        />
        <LevelChips selected={level} onChange={setLevel} />
        <PrimaryButton title="Buscar" onPress={handleSearch} hint="Busca Digimon pelo nome e nível" />
      </View>

      <View style={styles.results}>
        {submitted ? (
          <SearchResults list={list} term={submitted.name || submitted.level || ''} />
        ) : (
          <EmptyState
            icon="search-outline"
            title="Encontre um Digimon"
            message="Digite o nome (ou parte dele) e, se quiser, escolha um nível."
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { gap: spacing.md, padding: spacing.lg },
  results: { flex: 1 },
});
