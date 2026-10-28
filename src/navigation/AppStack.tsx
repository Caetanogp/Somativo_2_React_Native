import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DetailsScreen } from '../screens/DetailsScreen';
import { AppTabs } from './AppTabs';
import { headerOptions } from './screenOptions';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Stack do app logado (RF02): abas + Detalhes, que recebe o `id` por `route.params`. */
export function AppStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}
