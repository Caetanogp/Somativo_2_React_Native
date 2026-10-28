import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StarRating } from '../../components/StarRating';
import { DEFAULT_RATING, useCaptured } from '../../contexts/CapturedContext';
import { bodyText, spacing } from '../../theme';
import type { DigimonDetail } from '../../types';
import { runOrAlert } from '../../utils/runOrAlert';

/** RF07: marcar como "consumido" (capturado) e dar uma nota de 1 a 5. */
export function CaptureControls({ digimon }: { digimon: DigimonDetail }) {
  const { getCaptured, capture, release } = useCaptured();
  const captured = getCaptured(digimon.id);

  const toggleCaptured = () =>
    runOrAlert(() => (captured ? release(digimon.id) : capture(digimon, DEFAULT_RATING)));

  return (
    <>
      <PrimaryButton
        title={captured ? 'Capturado ✓' : 'Marcar como capturado'}
        variant={captured ? 'secondary' : 'primary'}
        selected={Boolean(captured)}
        hint={captured ? 'Toque para remover dos capturados' : 'Toque para marcar como capturado'}
        onPress={toggleCaptured}
      />
      {captured ? (
        <View style={styles.rating}>
          <Text style={bodyText}>Sua nota: {captured.rating} de 5</Text>
          <StarRating
            value={captured.rating}
            onChange={(rating) => runOrAlert(() => capture(digimon, rating))}
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  rating: { gap: spacing.xs },
});
