import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

interface RemoteImageProps {
  /** URL da imagem. `null`/vazio ou falha de carregamento mostram o placeholder, sem quebrar o layout. */
  uri: string | null | undefined;
  /** Descrição lida por leitores de tela (TalkBack/VoiceOver). */
  label: string;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain';
}

/** Imagem remota com placeholder para itens sem imagem ou com erro de carregamento (RF01). */
export function RemoteImage({ uri, label, style, resizeMode = 'contain' }: RemoteImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = Boolean(uri) && failedUri !== uri;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={showImage ? label : `${label} (imagem indisponível)`}
      style={[styles.frame, style]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={styles.image}
          resizeMode={resizeMode}
          onError={() => setFailedUri(uri ?? null)}
        />
      ) : (
        <Ionicons name="image-outline" size={40} color={colors.textMuted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});
