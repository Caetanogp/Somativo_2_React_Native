import { StyleSheet, Text, View } from 'react-native';
import { FavoriteButton } from '../../components/FavoriteButton';
import { Pill } from '../../components/Pill';
import { RemoteImage } from '../../components/RemoteImage';
import { useFavorites } from '../../contexts/FavoritesContext';
import { colors, radius, spacing } from '../../theme';
import type { DigimonDetail } from '../../types';
import { runOrAlert } from '../../utils/runOrAlert';

/** Imagem grande, botão de favoritar (RF04), nome e etiquetas do Digimon. */
export function DetailsHeader({ digimon }: { digimon: DigimonDetail }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const pills = [
    ...digimon.levels.map((label) => ({ kind: 'Nível', label })),
    ...digimon.types.map((label) => ({ kind: 'Tipo', label })),
    ...digimon.attributes.map((label) => ({ kind: 'Atributo', label })),
    ...(digimon.releaseDate ? [{ kind: 'Lançamento', label: digimon.releaseDate }] : []),
    ...(digimon.xAntibody ? [{ kind: 'Variante', label: 'X-Antibody' }] : []),
  ];

  return (
    <>
      <View>
        <RemoteImage uri={digimon.imageUrl} label={`Imagem de ${digimon.name}`} style={styles.hero} />
        <FavoriteButton
          name={digimon.name}
          isFavorite={isFavorite(digimon.id)}
          onToggle={() => runOrAlert(() => toggleFavorite(digimon))}
          style={styles.heart}
        />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {digimon.name}
      </Text>

      <View style={styles.pills}>
        {pills.map(({ kind, label }) => (
          <Pill key={`${kind}-${label}`} kind={kind} label={label} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', aspectRatio: 1, backgroundColor: colors.surface, borderRadius: radius.lg },
  heart: { position: 'absolute', top: spacing.md, right: spacing.md, backgroundColor: colors.overlay },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
