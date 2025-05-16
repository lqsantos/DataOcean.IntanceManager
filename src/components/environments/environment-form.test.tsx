import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import type { Environment } from '@/types/environment';

import { EnvironmentForm } from './environment-form';

describe('EnvironmentForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  const mockEnvironment: Environment = {
    id: '1',
    name: 'Production',
    slug: 'prod',
    order: 1,
    createdAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for create mode', () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Verificar formulário e campos usando data-testid
    expect(screen.getByTestId('environment-form')).toBeInTheDocument();
    expect(screen.getByTestId('env-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('env-slug-input')).toBeInTheDocument();
    expect(screen.getByTestId('env-order-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent(/criar/i);
  });

  it('renders correctly for update mode with prefilled values', () => {
    render(
      <EnvironmentForm
        environment={mockEnvironment}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Verificar valores preenchidos usando data-testid
    expect(screen.getByTestId('env-name-input')).toHaveValue('Production');
    expect(screen.getByTestId('env-slug-input')).toHaveValue('prod');
    expect(screen.getByTestId('env-order-input')).toHaveValue(1);
    expect(screen.getByTestId('submit-button')).toHaveTextContent(/atualizar/i);
  });

  it('auto-generates slug from name', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    const nameInput = screen.getByTestId('env-name-input');

    await userEvent.type(nameInput, 'Test Environment');

    // Verificar se o slug foi gerado automaticamente
    expect(screen.getByTestId('env-slug-input')).toHaveValue('test-environment');
  });

  it('does not auto-generate slug if user has modified it', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Primeiro, modificar o slug manualmente
    const slugInput = screen.getByTestId('env-slug-input');

    await userEvent.type(slugInput, 'custom-slug');

    // Depois, modificar o nome
    const nameInput = screen.getByTestId('env-name-input');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    // O slug não deve mudar
    expect(slugInput).toHaveValue('custom-slug');
  });

  it('validates required fields', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Tentar enviar sem preencher os campos obrigatórios
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.click(submitButton);

    // Verificar mensagens de erro
    expect(screen.getByTestId('name-error')).toBeInTheDocument();
    expect(screen.getByTestId('slug-error')).toBeInTheDocument();

    // Verificar que onSubmit não foi chamado
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates field formats', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Preencher com valores inválidos
    await userEvent.type(screen.getByTestId('env-name-input'), 'ab');
    await userEvent.type(screen.getByTestId('env-slug-input'), 'INVALID-SLUG!');
    await userEvent.type(screen.getByTestId('env-order-input'), '-1');

    // Tentar enviar
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.click(submitButton);

    // Verificar mensagens de erro específicas
    expect(screen.getByTestId('name-error')).toHaveTextContent(
      /nome deve ter pelo menos 3 caracteres/i
    );
    expect(screen.getByTestId('slug-error')).toHaveTextContent(
      /slug deve conter apenas letras minúsculas/i
    );
    expect(screen.getByTestId('order-error')).toHaveTextContent(
      /ordem deve ser um número positivo/i
    );

    // Verificar que onSubmit não foi chamado
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data correctly', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Preencher com valores válidos
    await userEvent.type(screen.getByTestId('env-name-input'), 'Test Environment');
    await userEvent.clear(screen.getByTestId('env-slug-input'));
    await userEvent.type(screen.getByTestId('env-slug-input'), 'test-env');
    await userEvent.type(screen.getByTestId('env-order-input'), '10');

    // Enviar formulário
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.click(submitButton);

    // Verificar que onSubmit foi chamado com os dados corretos
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Environment',
      slug: 'test-env',
      order: 10,
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    const cancelButton = screen.getByTestId('cancel-button');

    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form when isSubmitting is true', () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />);

    // Verificar que todos os inputs e botões estão desabilitados
    expect(screen.getByTestId('env-name-input')).toBeDisabled();
    expect(screen.getByTestId('env-slug-input')).toBeDisabled();
    expect(screen.getByTestId('env-order-input')).toBeDisabled();
    expect(screen.getByTestId('cancel-button')).toBeDisabled();

    // O botão de submit deve mostrar o loader
    const submitButton = screen.getByTestId('submit-button');

    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('submits without order if field is empty', async () => {
    render(
      <EnvironmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Preencher apenas campos obrigatórios
    await userEvent.type(screen.getByTestId('env-name-input'), 'Test Environment');
    await userEvent.clear(screen.getByTestId('env-slug-input'));
    await userEvent.type(screen.getByTestId('env-slug-input'), 'test-env');
    // Deixar ordem em branco

    // Enviar formulário
    const submitButton = screen.getByTestId('submit-button');

    await userEvent.click(submitButton);

    // Verificar que onSubmit foi chamado sem o campo order
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Environment',
      slug: 'test-env',
    });
  });
});
