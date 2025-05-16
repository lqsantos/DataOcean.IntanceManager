import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import type { Location } from '@/types/location';

import { LocationsTable } from './locations-table';

// Mock do componente DeleteLocationDialog
vi.mock('./delete-location-dialog', () => ({
  DeleteLocationDialog: ({ location, isOpen, isDeleting, onDelete, onCancel }) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div data-testid="mock-delete-location-dialog">
        <div>Excluindo: {location?.name}</div>
        <button onClick={onDelete} disabled={isDeleting} data-testid="mock-delete-location-confirm">
          {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
        </button>
        <button onClick={onCancel} data-testid="mock-delete-location-cancel">
          Cancelar
        </button>
      </div>
    );
  },
}));

// Mock do formatDistanceToNow para controlar as datas no teste
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => 'há 2 dias'),
}));

// Mock da configuração de locale
vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

describe('LocationsTable', () => {
  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'São Paulo',
      slug: 'sao-paulo',
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Rio de Janeiro',
      slug: 'rio-de-janeiro',
      createdAt: '2023-02-01T00:00:00Z',
    },
    {
      id: '3',
      name: 'Brasília',
      slug: 'brasilia',
      createdAt: '2023-03-01T00:00:00Z',
    },
  ];

  const mockProps = {
    locations: mockLocations,
    isLoading: false,
    _isRefreshing: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza a tabela com dados corretamente', () => {
    render(<LocationsTable {...mockProps} />);

    expect(screen.getByTestId('locations-table-container')).toBeInTheDocument();
    expect(screen.getByTestId('locations-table')).toBeInTheDocument();
    expect(screen.getByTestId('locations-table-search')).toBeInTheDocument();

    // Verifica cada linha da tabela
    mockLocations.forEach((location) => {
      expect(screen.getByTestId(`locations-table-row-${location.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`locations-table-name-${location.id}`)).toHaveTextContent(
        location.name
      );
      expect(screen.getByTestId(`locations-table-slug-${location.id}`)).toHaveTextContent(
        location.slug
      );
    });
  });

  it('mostra estado de carregamento com skeletons', () => {
    render(<LocationsTable {...mockProps} isLoading={true} />);

    // Verifica se os skeletons estão sendo exibidos
    const skeletonRows = screen.getAllByTestId('locations-table-loading-row');

    expect(skeletonRows.length).toBe(5);
  });

  it('mostra mensagem quando não há localidades', () => {
    render(<LocationsTable {...mockProps} locations={[]} />);

    expect(screen.getByTestId('locations-table-empty-message')).toHaveTextContent(
      'Nenhuma localidade encontrada.'
    );
    expect(screen.getByTestId('locations-table-empty-message')).toHaveTextContent(
      'Crie sua primeira localidade para começar.'
    );
  });

  it('mostra mensagem personalizada quando a busca não retorna resultados', async () => {
    render(<LocationsTable {...mockProps} />);

    const searchInput = screen.getByTestId('locations-table-search');

    await userEvent.type(searchInput, 'localidade inexistente');

    expect(screen.getByTestId('locations-table-empty-message')).toHaveTextContent(
      'Nenhuma localidade encontrada para "localidade inexistente"'
    );
    expect(screen.getByTestId('locations-table-empty-message')).toHaveTextContent(
      'Tente outro termo de busca.'
    );
  });

  it('filtra localidades corretamente ao buscar por nome', async () => {
    render(<LocationsTable {...mockProps} />);

    // Verifica se todas as localidades estão sendo exibidas inicialmente
    expect(screen.getAllByTestId(/^locations-table-row-/).length).toBe(3);

    // Realiza uma busca por "são paulo"
    const searchInput = screen.getByTestId('locations-table-search');

    await userEvent.type(searchInput, 'são paulo');

    // Verifica se apenas a localidade "São Paulo" está sendo exibida
    expect(screen.getAllByTestId(/^locations-table-row-/).length).toBe(1);
    expect(screen.getByTestId('locations-table-name-1')).toHaveTextContent('São Paulo');
  });

  it('filtra localidades corretamente ao buscar por slug', async () => {
    render(<LocationsTable {...mockProps} />);

    // Verifica se todas as localidades estão sendo exibidas inicialmente
    expect(screen.getAllByTestId(/^locations-table-row-/).length).toBe(3);

    // Realiza uma busca por "brasilia"
    const searchInput = screen.getByTestId('locations-table-search');

    await userEvent.type(searchInput, 'brasilia');

    // Verifica se apenas a localidade "Brasília" está sendo exibida
    expect(screen.getAllByTestId(/^locations-table-row-/).length).toBe(1);
    expect(screen.getByTestId('locations-table-name-3')).toHaveTextContent('Brasília');
  });

  it('ordena as localidades por nome', async () => {
    render(<LocationsTable {...mockProps} />);

    // Clica no botão de ordenação por nome (que já é o padrão em ordem ascendente)
    const nameSortButton = screen.getByTestId('locations-table-sort-name');

    // Clica para inverter a ordem (descendente)
    await userEvent.click(nameSortButton);

    // Obtém todas as linhas da tabela
    const rows = screen.getAllByTestId(/^locations-table-row-/);

    // Obtém os nomes exibidos na ordem atual
    const names = rows.map((row) => {
      const rowId = row.getAttribute('data-testid')?.split('-').pop();

      return screen.getByTestId(`locations-table-name-${rowId}`).textContent;
    });

    // Na ordem descendente por nome, a ordem esperada é: São Paulo, Rio de Janeiro, Brasília (ordem alfabética inversa)
    const expectedOrder = ['São Paulo', 'Rio de Janeiro', 'Brasília'].sort().reverse();

    expect(names).toEqual(expectedOrder);
  });

  it('ordena as localidades por slug', async () => {
    render(<LocationsTable {...mockProps} />);

    // Clica no botão de ordenação por slug
    const slugSortButton = screen.getByTestId('locations-table-sort-slug');

    await userEvent.click(slugSortButton);

    // Obtém todas as linhas da tabela
    const rows = screen.getAllByTestId(/^locations-table-row-/);

    // Obtém os slugs exibidos na ordem atual
    const slugs = rows.map((row) => {
      const rowId = row.getAttribute('data-testid')?.split('-').pop();

      return screen.getByTestId(`locations-table-slug-${rowId}`).textContent;
    });

    // Na ordem ascendente por slug, a ordem esperada é: brasilia, rio-de-janeiro, sao-paulo
    const expectedOrder = ['brasilia', 'rio-de-janeiro', 'sao-paulo'].sort();

    expect(slugs).toEqual(expectedOrder);
  });

  it('ordena as localidades por data de criação', async () => {
    render(<LocationsTable {...mockProps} />);

    // Clica no botão de ordenação por data de criação
    const createdAtSortButton = screen.getByTestId('locations-table-sort-created-at');

    await userEvent.click(createdAtSortButton);

    // Verifica a ordem das células por id após ordenação ascendente por data
    const rowsAfterSort = screen.getAllByTestId(/^locations-table-row-/);
    const idsAsc = rowsAfterSort.map((row) => row.getAttribute('data-testid')?.split('-').pop());

    // Na ordem ascendente de data, a ordem esperada é: '1' (2023-01-01), '2' (2023-02-01), '3' (2023-03-01)
    expect(idsAsc).toEqual(['1', '2', '3']);

    // Inverte a ordem (descendente)
    await userEvent.click(createdAtSortButton);

    // Verifica a ordem das células por id após ordenação descendente por data
    const rowsAfterSecondSort = screen.getAllByTestId(/^locations-table-row-/);
    const idsDesc = rowsAfterSecondSort.map((row) =>
      row.getAttribute('data-testid')?.split('-').pop()
    );

    // Na ordem descendente de data, a ordem esperada é: '3' (2023-03-01), '2' (2023-02-01), '1' (2023-01-01)
    expect(idsDesc).toEqual(['3', '2', '1']);
  });

  it('aciona a função onEdit ao clicar no botão de editar', async () => {
    render(<LocationsTable {...mockProps} />);

    // Clica no botão de ações para exibir o menu
    const actionsButton = screen.getByTestId('locations-table-actions-1');

    await userEvent.click(actionsButton);

    // Clica no botão de editar
    const editButton = await screen.findByTestId('locations-table-edit-1');

    await userEvent.click(editButton);

    // Verifica se a função onEdit foi chamada com a localidade correta
    expect(mockProps.onEdit).toHaveBeenCalledTimes(1);
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockLocations[0]);
  });

  it('abre o diálogo de exclusão ao clicar no botão de excluir', async () => {
    render(<LocationsTable {...mockProps} />);

    // Clica no botão de ações para exibir o menu
    const actionsButton = screen.getByTestId('locations-table-actions-1');

    await userEvent.click(actionsButton);

    // Clica no botão de excluir
    const deleteButton = await screen.findByTestId('locations-table-delete-1');

    await userEvent.click(deleteButton);

    // Verifica se o diálogo de exclusão foi aberto
    expect(screen.getByTestId('mock-delete-location-dialog')).toBeInTheDocument();
    expect(screen.getByText('Excluindo: São Paulo')).toBeInTheDocument();
  });

  it('cancela a exclusão ao clicar no botão cancelar', async () => {
    render(<LocationsTable {...mockProps} />);

    // Abre o diálogo de exclusão
    const actionsButton = screen.getByTestId('locations-table-actions-1');

    await userEvent.click(actionsButton);

    const deleteButton = await screen.findByTestId('locations-table-delete-1');

    await userEvent.click(deleteButton);

    // Clica no botão cancelar
    const cancelButton = screen.getByTestId('mock-delete-location-cancel');

    await userEvent.click(cancelButton);

    // Verifica se o diálogo foi fechado
    expect(screen.queryByTestId('mock-delete-location-dialog')).not.toBeInTheDocument();

    // Verifica se a função onDelete não foi chamada
    expect(mockProps.onDelete).not.toHaveBeenCalled();
  });

  it('executa a exclusão ao confirmar no diálogo', async () => {
    render(<LocationsTable {...mockProps} />);

    // Abre o diálogo de exclusão
    const actionsButton = screen.getByTestId('locations-table-actions-1');

    await userEvent.click(actionsButton);

    const deleteButton = await screen.findByTestId('locations-table-delete-1');

    await userEvent.click(deleteButton);

    // Confirma a exclusão
    const confirmButton = screen.getByTestId('mock-delete-location-confirm');

    await userEvent.click(confirmButton);

    // Verifica se a função onDelete foi chamada com o ID correto
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');

    // O componente mocka uma exclusão bem-sucedida, então o diálogo deve ser fechado
    await waitFor(() => {
      expect(screen.queryByTestId('mock-delete-location-dialog')).not.toBeInTheDocument();
    });
  });
});
