import { fireEvent, render, screen } from '@testing-library/react-native';
import { EmptyState } from '../src/components/EmptyState';
import { ErrorView } from '../src/components/ErrorView';
import { FavoriteButton } from '../src/components/FavoriteButton';
import { IconButton } from '../src/components/IconButton';
import { ItemCard } from '../src/components/ItemCard';
import { LevelChips } from '../src/components/LevelChips';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { RemoteImage } from '../src/components/RemoteImage';
import { StarRating } from '../src/components/StarRating';
import { MIN_TOUCH } from '../src/theme';

const agumon = { id: 1, name: 'Agumon', imageUrl: 'https://img/agumon.png' };

describe('ItemCard (RF01, RF04, RF10)', () => {
  it('exibe o nome e abre os detalhes ao tocar no card', async () => {
    const onPress = jest.fn();
    await render(<ItemCard item={agumon} isFavorite={false} onPress={onPress} onToggleFavorite={jest.fn()} />);

    expect(screen.getByText('Agumon')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Agumon. Abrir detalhes'));
    expect(onPress).toHaveBeenCalledWith(agumon);
  });

  it('o coração do card reflete o estado de favorito (mesmo estado do Context)', async () => {
    const onToggle = jest.fn();
    const { rerender } = await render(
      <ItemCard item={agumon} isFavorite={false} onPress={jest.fn()} onToggleFavorite={onToggle} />,
    );

    const add = screen.getByLabelText('Adicionar Agumon aos favoritos');
    expect(add).not.toBeSelected();
    await fireEvent.press(add);
    expect(onToggle).toHaveBeenCalledWith(agumon);

    await rerender(<ItemCard item={agumon} isFavorite onPress={jest.fn()} onToggleFavorite={onToggle} />);
    expect(screen.getByLabelText('Remover Agumon dos favoritos')).toBeSelected();
  });

  it('item sem imagem mostra o placeholder, sem quebrar o card', async () => {
    await render(
      <ItemCard
        item={{ id: 2, name: 'Sem Foto', imageUrl: null }}
        isFavorite={false}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Imagem de Sem Foto (imagem indisponível)')).toBeOnTheScreen();
    expect(screen.getByText('Sem Foto')).toBeOnTheScreen();
  });
});

describe('RemoteImage (RF01, RF10)', () => {
  it('descreve a imagem para leitores de tela', async () => {
    await render(<RemoteImage uri="https://img/a.png" label="Imagem de Agumon" />);
    expect(screen.getByRole('image', { name: 'Imagem de Agumon' })).toBeOnTheScreen();
  });

  it('cai para o placeholder quando a imagem falha ao carregar', async () => {
    await render(<RemoteImage uri="https://img/quebrada.png" label="Imagem de Agumon" />);
    const frame = screen.getByRole('image', { name: 'Imagem de Agumon' });
    const picture = frame.children.find((child) => typeof child !== 'string');
    expect(picture).toBeDefined();

    // O <Image> nativo dispara onError quando a URL não carrega.
    await fireEvent(picture as NonNullable<typeof picture>, 'error');

    expect(screen.getByRole('image', { name: 'Imagem de Agumon (imagem indisponível)' })).toBeOnTheScreen();
  });
});

describe('botões de estado (RF10)', () => {
  it('FavoriteButton muda rótulo e estado "selected"', async () => {
    const { rerender } = await render(<FavoriteButton name="Agumon" isFavorite={false} onToggle={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Adicionar Agumon aos favoritos' })).not.toBeSelected();

    await rerender(<FavoriteButton name="Agumon" isFavorite onToggle={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Remover Agumon dos favoritos' })).toBeSelected();
  });

  it('PrimaryButton informa estado selecionado, desabilitado e ocupado', async () => {
    const { rerender } = await render(<PrimaryButton title="Capturado ✓" selected onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Capturado ✓' })).toBeSelected();

    await rerender(<PrimaryButton title="Entrar" loading onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });

  it('IconButton exige rótulo e tem área de toque mínima de 44×44', async () => {
    const onPress = jest.fn();
    await render(<IconButton icon="heart" label="Curtir" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Curtir' });
    expect(button).toHaveStyle({ minWidth: MIN_TOUCH, minHeight: MIN_TOUCH });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('PrimaryButton cresce com a fonte (altura mínima, nunca fixa)', async () => {
    await render(<PrimaryButton title="Buscar" onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toHaveStyle({ minHeight: MIN_TOUCH });
    expect(button).not.toHaveStyle({ height: MIN_TOUCH });
  });
});

describe('StarRating (RF07, RF10)', () => {
  it('editável: cada estrela é um botão e a nota atual fica selecionada', async () => {
    const onChange = jest.fn();
    await render(<StarRating value={3} onChange={onChange} />);

    expect(screen.getByLabelText('Dar nota 3 de 5')).toBeSelected();
    expect(screen.getByLabelText('Dar nota 5 de 5')).not.toBeSelected();
    expect(screen.getAllByRole('button')).toHaveLength(5);

    await fireEvent.press(screen.getByLabelText('Dar nota 5 de 5'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('somente leitura: anuncia a nota por extenso', async () => {
    await render(<StarRating value={4} />);
    expect(screen.getByLabelText('Nota 4 de 5 estrelas')).toBeOnTheScreen();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('LevelChips (RF08)', () => {
  it('seleciona e limpa o filtro de nível, informando o estado', async () => {
    const onChange = jest.fn();
    const { rerender } = await render(<LevelChips selected={null} onChange={onChange} />);

    await fireEvent.press(screen.getByLabelText('Nível Child'));
    expect(onChange).toHaveBeenCalledWith('Child');

    await rerender(<LevelChips selected="Child" onChange={onChange} />);
    expect(screen.getByLabelText('Nível Child')).toBeSelected();
    await fireEvent.press(screen.getByLabelText('Nível Child'));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('feedback de UI (RF09)', () => {
  it('ErrorView mostra a mensagem e o botão "Tentar novamente"', async () => {
    const onRetry = jest.fn();
    await render(<ErrorView message="Sem conexão." onRetry={onRetry} />);

    expect(screen.getByText('Sem conexão.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('EmptyState anuncia título e mensagem', async () => {
    await render(<EmptyState icon="heart-outline" title="Nenhum favorito ainda" message="Toque no coração." />);
    expect(screen.getByLabelText('Nenhum favorito ainda. Toque no coração.')).toBeOnTheScreen();
  });
});
