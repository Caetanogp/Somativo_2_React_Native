import { Alert } from 'react-native';

/**
 * Executa uma ação de salvar (favoritar, capturar...) e avisa o usuário se ela falhar.
 * Quando chega aqui o estado da tela já foi revertido pelo hook de coleção.
 */
export async function runOrAlert(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch {
    Alert.alert('Não foi possível salvar', 'Verifique sua conexão e tente novamente.');
  }
}
