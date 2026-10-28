import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from '../theme';

/** Cabeçalho escuro compartilhado por todos os navegadores. */
export const headerOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.background },
};
