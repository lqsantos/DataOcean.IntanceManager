import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import type { Location } from '@/types/location';

import { LocationForm } from './location-form';

// Mock das props do componente
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

// Mock de localização para testes de edição
const mockLocation: Location = {
  id: '1',
  name: 'Test Location',
  slug: 'test-location',
  createdAt: '2023-01-01T00:00:00.000Z',
};

describe('LocationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly for creating a new location', () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    // Verifica se elementos principais estão presentes
    expect(screen.getByTestId('location-form')).toBeInTheDocument();
    expect(screen.getByTestId('location-form-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('location-form-slug-input')).toBeInTheDocument();
    expect(screen.getByTestId('location-form-submit-button')).toHaveTextContent('Criar');
    expect(screen.getByTestId('location-form-cancel-button')).toHaveTextContent('Cancelar');
  });

  it('should render correctly for editing an existing location', () => {
    render(
      <LocationForm
        location={mockLocation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Verifica se os campos são preenchidos com os valores da localização
    expect(screen.getByTestId('location-form-name-input')).toHaveValue('Test Location');
    expect(screen.getByTestId('location-form-slug-input')).toHaveValue('test-location');
    expect(screen.getByTestId('location-form-submit-button')).toHaveTextContent('Salvar');
  });

  it('should show a loading state when submitting', () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />);

    // Verifica se os botões estão desabilitados durante o envio
    expect(screen.getByTestId('location-form-submit-button')).toBeDisabled();
    expect(screen.getByTestId('location-form-cancel-button')).toBeDisabled();
  });

  it('should automatically generate slug from name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    const nameInput = screen.getByTestId('location-form-name-input');

    // Digita um nome com caracteres especiais e espaços
    await userEvent.type(nameInput, 'São Paulo Brasil');

    // Verifica se o slug foi gerado automaticamente
    expect(screen.getByTestId('location-form-slug-input')).toHaveValue('so-paulo-brasil');
  });

  it('should not override the slug if it has been manually edited', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    const nameInput = screen.getByTestId('location-form-name-input');
    const slugInput = screen.getByTestId('location-form-slug-input');

    // Primeiro, define o nome
    await userEvent.type(nameInput, 'São Paulo');

    // Verifica se o slug foi gerado automaticamente
    expect(slugInput).toHaveValue('so-paulo');

    // Agora edita manualmente o slug
    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, 'custom-slug');

    // Altera o nome novamente
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Rio de Janeiro');

    // Verifica se o slug não mudou
    expect(slugInput).toHaveValue('custom-slug');
  });

  it('should validate form fields and show errors', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    // Tenta submeter o formulário vazio
    fireEvent.submit(screen.getByTestId('location-form'));

    // Verifica se mensagens de erro aparecem
    await waitFor(() => {
      expect(screen.getByTestId('location-form-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('location-form-slug-error')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate slug format and show specific error', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    // Preenche o nome corretamente
    await userEvent.type(screen.getByTestId('location-form-name-input'), 'Valid Name');

    // Preenche o slug com formato inválido
    await userEvent.clear(screen.getByTestId('location-form-slug-input'));
    await userEvent.type(screen.getByTestId('location-form-slug-input'), 'Invalid SLUG!');

    // Tenta submeter o formulário
    fireEvent.submit(screen.getByTestId('location-form'));

    // Verifica se apenas o erro de slug aparece
    await waitFor(() => {
      expect(screen.queryByTestId('location-form-name-error')).not.toBeInTheDocument();
      expect(screen.getByTestId('location-form-slug-error')).toBeInTheDocument();
      expect(screen.getByTestId('location-form-slug-error')).toHaveTextContent(
        'Slug deve conter apenas letras minúsculas, números e hífens'
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    // Preenche o formulário com dados válidos
    await userEvent.type(screen.getByTestId('location-form-name-input'), 'New Location');

    // O slug deve ser gerado automaticamente
    expect(screen.getByTestId('location-form-slug-input')).toHaveValue('new-location');

    // Submete o formulário
    fireEvent.submit(screen.getByTestId('location-form'));

    // Verifica se a função onSubmit foi chamada com os dados corretos
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Location',
        slug: 'new-location',
      });
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    // Clica no botão de cancelar
    await userEvent.click(screen.getByTestId('location-form-cancel-button'));

    // Verifica se a função onCancel foi chamada
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
