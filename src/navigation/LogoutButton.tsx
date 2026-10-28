import { Alert } from 'react-native';
import { IconButton } from '../components/IconButton';
import { useAuth } from '../contexts/AuthContext';

/** Botão "Sair" do cabeçalho (RF07). Pede confirmação e então encerra a sessão. */
export function LogoutButton() {
  const { logout, user } = useAuth();

  const confirm = () =>
    Alert.alert('Sair da conta', `Deseja sair${user ? ` de ${user.email}` : ''}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        // Não há navigation.navigate('Login'): ao limpar a sessão, o RootNavigator troca de Stack.
        onPress: () => void logout(),
      },
    ]);

  return <IconButton icon="log-out-outline" label="Sair da conta" hint="Encerra a sessão" onPress={confirm} />;
}
