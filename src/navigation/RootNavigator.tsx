import type { ReactNode } from 'react';
import { ErrorView } from '../components/ErrorView';
import { LoadingView } from '../components/LoadingView';
import { CapturedProvider, useCaptured } from '../contexts/CapturedContext';
import { useAuth } from '../contexts/AuthContext';
import { FavoritesProvider, useFavorites } from '../contexts/FavoritesContext';
import type { UserDataRepository } from '../services/userData/UserDataRepository';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

interface RootNavigatorProps {
  repository: UserDataRepository;
}

/**
 * Navegação condicional (RF07): o estado de sessão do AuthContext decide qual Stack é renderizado.
 * Login e logout só mudam `user`; ninguém chama `navigation.navigate('Login')`, o que também
 * impede voltar para as telas protegidas pelo botão "voltar" depois de sair.
 */
export function RootNavigator({ repository }: RootNavigatorProps) {
  const { user, isRestoring } = useAuth();

  if (isRestoring) return <LoadingView label="Restaurando sessão..." />;
  if (!user) return <AuthStack />;

  return (
    // `key` recria os providers (e descarta o estado) se a conta mudar.
    <FavoritesProvider key={user.id} userId={user.id} repository={repository}>
      <CapturedProvider userId={user.id} repository={repository}>
        <HydrationGate>
          <AppStack />
        </HydrationGate>
      </CapturedProvider>
    </FavoritesProvider>
  );
}

/** RF06: o app nunca mostra listas "zeradas" enquanto os dados salvos ainda estão carregando. */
function HydrationGate({ children }: { children: ReactNode }) {
  const favorites = useFavorites();
  const captured = useCaptured();

  if (favorites.loadError || captured.loadError) {
    return (
      <ErrorView
        message="Não foi possível carregar seus dados salvos."
        onRetry={() => {
          favorites.reload();
          captured.reload();
        }}
      />
    );
  }
  if (!favorites.isHydrated || !captured.isHydrated) {
    return <LoadingView label="Carregando seus dados..." />;
  }
  return <>{children}</>;
}
