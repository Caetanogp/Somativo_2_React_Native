import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/** Stack exibido enquanto NÃO há sessão. */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Catalog: undefined;
  Search: undefined;
  Favorites: undefined;
  Captured: undefined;
};

/** Stack exibido quando há sessão. */
export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** `id` viaja por `route.params`; `name` só serve para o título aparecer antes da requisição terminar. */
  Details: { id: number; name?: string };
};

export type AppNavigation = NativeStackNavigationProp<AppStackParamList>;
