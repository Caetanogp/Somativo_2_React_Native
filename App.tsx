import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { createBackend } from './src/services/backend';
import { colors } from './src/theme';

/** Login e persistência locais, ou Firebase se o `.env` estiver configurado. */
const backend = createBackend();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.divider,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider service={backend.auth}>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator repository={backend.userData} />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
