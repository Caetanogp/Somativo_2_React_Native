import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthProvider } from '../src/contexts/AuthContext';
import { RootNavigator } from '../src/navigation/RootNavigator';
import { LocalAuthService } from '../src/services/auth/LocalAuthService';
import { listDigimon, getDigimon, searchDigimon } from '../src/services/digimonService';
import { createMemoryStore } from '../src/services/storage';
import { LocalUserDataRepository } from '../src/services/userData/LocalUserDataRepository';
import type { DigimonDetail } from '../src/types';

jest.mock('../src/services/digimonService', () => ({
  ...jest.requireActual('../src/services/digimonService'),
  listDigimon: jest.fn(),
  searchDigimon: jest.fn(),
  getDigimon: jest.fn(),
}));

const mockedList = listDigimon as jest.Mock;
const mockedSearch = searchDigimon as jest.Mock;
const mockedDetail = getDigimon as jest.Mock;

const agumon = { id: 1, name: 'Agumon', imageUrl: 'https://img/agumon.png' };
const gabumon = { id: 2, name: 'Gabumon', imageUrl: null };

const agumonDetail: DigimonDetail = {
  ...agumon,
  levels: ['Child'],
  types: ['Reptile'],
  attributes: ['Vaccine'],
  fields: [],
  releaseDate: '1997',
  xAntibody: false,
  description: '<p>Um <b>Digimon</b> réptil &amp; corajoso.</p>',
  skills: [{ name: 'Baby Flame', description: 'Cospe fogo.' }],
  priorEvolutions: [],
  nextEvolutions: [],
};

/** "App" completo sobre armazenamento em memória, que pode ser "reaberto" com os mesmos dados. */
function createApp() {
  const users = createMemoryStore();
  const session = createMemoryStore();
  const data = createMemoryStore();
  const tree = () => (
    <AuthProvider service={new LocalAuthService({ users, session })}>
      <NavigationContainer>
        <RootNavigator repository={new LocalUserDataRepository(data)} />
      </NavigationContainer>
    </AuthProvider>
  );
  return { tree };
}

async function signUp(email = 'ana@exemplo.com', password = 'segredo123') {
  await fireEvent.changeText(await screen.findByLabelText('E-mail'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), password);
  await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
}

describe('app completo (navegação condicional, RF01–RF08)', () => {
  beforeEach(() => {
    mockedList.mockResolvedValue({ items: [agumon, gabumon], page: 0, hasMore: false });
    mockedSearch.mockImplementation(async ({ name }: { name?: string }) => ({
      items: name === 'agu' ? [agumon] : [],
      page: 0,
      hasMore: false,
    }));
    mockedDetail.mockResolvedValue(agumonDetail);
  });

  it('sem sessão mostra o Stack de login; depois de cadastrar, o catálogo', async () => {
    const { tree } = createApp();
    await render(tree());

    expect(await screen.findByText('Modo: Local (neste aparelho)')).toBeOnTheScreen();
    expect(screen.queryByText('Catálogo')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    await signUp();

    expect(await screen.findByText('Agumon')).toBeOnTheScreen();
    expect(screen.getByText('Gabumon')).toBeOnTheScreen();
    expect(screen.queryByLabelText('E-mail')).not.toBeOnTheScreen();
  });

  it('valida o formulário e mostra erro de credenciais inválidas', async () => {
    const { tree } = createApp();
    await render(tree());

    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Informe o e-mail.')).toBeOnTheScreen();
    expect(screen.getByText('Informe a senha.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ninguem@exemplo.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
  });

  it('favoritar no catálogo aparece na aba Favoritos e some ao desfavoritar', async () => {
    const { tree } = createApp();
    await render(tree());
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    await signUp();
    await screen.findByText('Agumon');

    await fireEvent.press(screen.getByLabelText('Adicionar Agumon aos favoritos'));
    expect(await screen.findByLabelText('Remover Agumon dos favoritos')).toBeSelected();

    await fireEvent.press(screen.getByText('Favoritos'));
    expect(await screen.findByLabelText('Agumon. Abrir detalhes')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Gabumon. Abrir detalhes')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText('Remover Agumon dos favoritos'));
    expect(await screen.findByText('Nenhum favorito ainda')).toBeOnTheScreen();
  });

  it('abre os detalhes (id por route.params), limpa o HTML e captura com nota', async () => {
    const { tree } = createApp();
    await render(tree());
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    await signUp();

    await fireEvent.press(await screen.findByLabelText('Agumon. Abrir detalhes'));

    expect(mockedDetail).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    expect(await screen.findByText('Um Digimon réptil & corajoso.')).toBeOnTheScreen();
    expect(screen.queryByText(/<p>/)).not.toBeOnTheScreen();
    expect(screen.getByText('Baby Flame')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Marcar como capturado' }));
    expect(await screen.findByText('Sua nota: 3 de 5')).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText('Dar nota 5 de 5'));
    expect(await screen.findByText('Sua nota: 5 de 5')).toBeOnTheScreen();
  });

  it('busca mostra uma LISTA de resultados e uma mensagem clara quando não há nenhum', async () => {
    const { tree } = createApp();
    await render(tree());
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    await signUp();
    await screen.findByText('Agumon');

    await fireEvent.press(screen.getByText('Buscar'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('Digite um nome ou escolha um nível para buscar.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Nome do Digimon'), 'agu');
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByLabelText('Agumon. Abrir detalhes')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Nome do Digimon'), 'zzz');
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('Nenhum Digimon encontrado para "zzz". Tente outro nome.')).toBeOnTheScreen();
  });

  it('erro de rede no catálogo mostra mensagem amigável e "Tentar novamente" recarrega', async () => {
    mockedList.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce({
      items: [agumon],
      page: 0,
      hasMore: false,
    });
    const { tree } = createApp();
    await render(tree());
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    await signUp();

    expect(await screen.findByText('Algo deu errado. Tente novamente.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Agumon')).toBeOnTheScreen();
  });

  it('persistência: ao "reabrir o app" a sessão e os dados continuam lá', async () => {
    const { tree } = createApp();
    const first = await render(tree());
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    await signUp();
    await screen.findByText('Agumon');
    await fireEvent.press(screen.getByLabelText('Adicionar Agumon aos favoritos'));
    await screen.findByLabelText('Remover Agumon dos favoritos');
    await first.unmount();

    // Mesmo armazenamento, componentes novos = app reaberto: vai direto ao catálogo, já logado.
    await render(tree());
    expect(await screen.findByLabelText('Remover Agumon dos favoritos')).toBeSelected();
    expect(screen.queryByLabelText('E-mail')).not.toBeOnTheScreen();
  });

  it('logout volta ao Stack de login sem navigation.navigate', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Sair')?.onPress?.();
    });
    const { tree } = createApp();
    await render(tree());
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    await signUp();
    await screen.findByText('Agumon');

    await fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

    await waitFor(() => expect(screen.getByText('Modo: Local (neste aparelho)')).toBeOnTheScreen());
    expect(screen.queryByText('Agumon')).not.toBeOnTheScreen();
    alert.mockRestore();
  });
});
