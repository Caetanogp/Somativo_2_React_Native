import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { IconButton } from './IconButton';

interface FavoriteButtonProps {
  name: string;
  isFavorite: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Coração de favoritar. O rótulo muda conforme o estado, e `selected` informa o estado atual (RF10). */
export function FavoriteButton({ name, isFavorite, onToggle, style }: FavoriteButtonProps) {
  return (
    <IconButton
      icon={isFavorite ? 'heart' : 'heart-outline'}
      color={isFavorite ? colors.heart : colors.text}
      selected={isFavorite}
      label={isFavorite ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
      onPress={onToggle}
      style={style}
    />
  );
}
