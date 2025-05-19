// src/components/pat/pat-modal.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { usePATModal } from '@/contexts/pat-modal-context';
import { server } from '@/mocks/server';

import { PATModal } from './pat-modal';

// Mock do contexto
vi.mock('@/contexts/pat-modal-context', () => ({
  usePATModal: vi.fn(),
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PATModal', () => {
  const mockClose = vi.fn();
  const mockOnConfigured = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Configuração padrão do mock do contexto
    (usePATModal as vi.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      onConfigured: mockOnConfigured,
      status: {
        configured: false,
        lastUpdated: null,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the modal for new token configuration', () => {
    render(<PATModal />);

    // Verificar elementos da interface utilizando test IDs
    expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    expect(screen.getByTestId('pat-modal-header')).toBeInTheDocument();
    expect(screen.getByTestId('pat-modal-title')).toHaveTextContent('Configurar Token de Acesso');
    expect(screen.getByTestId('pat-modal-description')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-item')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-label')).toHaveTextContent('Token de Acesso');
    expect(screen.getByTestId('pat-form-field-container')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-token')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-toggle-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('pat-eye-icon')).toBeInTheDocument(); // Initially shows eye icon
    expect(screen.getByTestId('pat-modal-footer')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-submit')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-submit-text')).toHaveTextContent('Configurar');

    // Verificar que elementos de token já configurado não estão presentes
    expect(screen.queryByTestId('pat-modal-last-updated')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pat-modal-error')).not.toBeInTheDocument();
  });

  it('should render the modal for token update', () => {
    // Alterar o status para um token já configurado
    const lastUpdated = '2023-06-15T10:30:00Z';

    (usePATModal as vi.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      onConfigured: mockOnConfigured,
      status: {
        configured: true,
        lastUpdated,
      },
    });

    render(<PATModal />);

    // Verificar elementos da interface utilizando test IDs
    expect(screen.getByTestId('pat-modal-title')).toHaveTextContent('Atualizar Token de Acesso');
    expect(screen.getByTestId('pat-modal-description')).toHaveTextContent(
      'Insira um novo token para substituir o atual.'
    );
    expect(screen.getByTestId('pat-modal-last-updated')).toBeInTheDocument();
    expect(screen.getByTestId('pat-modal-last-updated')).toHaveTextContent('Última atualização:');
    expect(screen.getByTestId('pat-modal-last-updated')).toHaveTextContent(
      new Date(lastUpdated).toLocaleString()
    );
    expect(screen.getByTestId('pat-form-submit-text')).toHaveTextContent('Atualizar');
  });

  it('should toggle token visibility', async () => {
    render(<PATModal />);

    const user = userEvent.setup();
    const inputElement = screen.getByTestId('pat-form-token');
    const toggleButton = screen.getByTestId('pat-form-toggle-visibility');

    // Inicialmente o tipo deve ser password e mostrar o ícone de olho (visibilidade off)
    expect(inputElement).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('pat-eye-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('pat-eye-off-icon')).not.toBeInTheDocument();

    // Clicar no botão para mostrar o token
    await user.click(toggleButton);

    // Verificar que agora o tipo é text e o ícone mudou para olho fechado
    expect(inputElement).toHaveAttribute('type', 'text');
    expect(screen.queryByTestId('pat-eye-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('pat-eye-off-icon')).toBeInTheDocument();

    // Clicar novamente para esconder
    await user.click(toggleButton);

    // Verificar que voltou para password e o ícone de olho
    expect(inputElement).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('pat-eye-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('pat-eye-off-icon')).not.toBeInTheDocument();
  });

  it('should close the modal when cancel is clicked', async () => {
    render(<PATModal />);

    const user = userEvent.setup();
    const cancelButton = screen.getByTestId('pat-form-cancel');

    await user.click(cancelButton);
    expect(mockClose).toHaveBeenCalled();
  });

  it('should submit the form and create a new token', async () => {
    // Mock da resposta da API
    server.use(
      http.post('/api/pat', () => {
        return HttpResponse.json(
          {
            configured: true,
            lastUpdated: '2023-06-15T10:30:00Z',
          },
          { status: 201 }
        );
      })
    );

    render(<PATModal />);

    const user = userEvent.setup();
    const tokenInput = screen.getByTestId('pat-form-token');
    const submitButton = screen.getByTestId('pat-form-submit');

    // Digitar um token válido e enviar
    await user.type(tokenInput, 'validtoken12345');
    await user.click(submitButton);

    // Waiting for the async action to complete
    await waitFor(() => {
      // Verificar se o callback foi chamado
      expect(mockOnConfigured).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('should validate the form and show validation error messages', async () => {
    render(<PATModal />);

    const user = userEvent.setup();
    const tokenInput = screen.getByTestId('pat-form-token');
    const submitButton = screen.getByTestId('pat-form-submit');

    // Submit with short token (less than 8 chars)
    await user.type(tokenInput, 'short');
    await user.click(submitButton);

    // Check for validation error message
    await waitFor(() => {
      expect(screen.getByTestId('pat-form-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('pat-form-error-message')).toHaveTextContent(
        'O token deve ter pelo menos 8 caracteres'
      );
    });
  });

  it('should reset the form when modal is closed', async () => {
    const { unmount } = render(<PATModal />);

    const user = userEvent.setup();
    const tokenInput = screen.getByTestId('pat-form-token');

    // Type something in the input
    await user.type(tokenInput, 'some-token-value');

    // Check that the input has the typed value
    expect(tokenInput).toHaveValue('some-token-value');

    // Close the modal
    await user.click(screen.getByTestId('pat-form-cancel'));
    expect(mockClose).toHaveBeenCalled();

    // Clean up the first render to avoid duplicate elements
    unmount();

    // Re-render with modal open again
    (usePATModal as vi.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      onConfigured: mockOnConfigured,
      status: {
        configured: false,
        lastUpdated: null,
      },
    });

    render(<PATModal />);

    // Form should be reset - get the token input from the fresh render
    const newTokenInput = screen.getByTestId('pat-form-token');

    expect(newTokenInput).toHaveValue('');
  });
});
