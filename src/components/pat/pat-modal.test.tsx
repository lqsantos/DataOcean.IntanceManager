// src/components/pat/pat-modal.test.tsx
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { render as renderWithWrapper } from '@/tests/test-utils';

import { PATModal } from './pat-modal';

// Mock hooks
vi.mock('@/hooks/use-pat', () => ({
  usePAT: vi.fn(() => ({
    createToken: vi.fn().mockResolvedValue({
      token: 'new-token-12345',
      expiresAt: '2023-12-31T23:59:59Z',
    }),
    updateToken: vi.fn().mockResolvedValue({
      token: 'updated-token-67890',
      expiresAt: '2024-06-30T23:59:59Z',
    }),
    isLoading: false,
    error: null,
  })),
}));

// Mock dos componentes UI
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="pat-modal" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="pat-modal-header">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="pat-modal-footer">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="pat-modal-title">{children}</div>,
  DialogDescription: ({ children }: any) => (
    <div data-testid="pat-modal-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => (
    <form data-testid="pat-form" {...props}>
      {children}
    </form>
  ),
  FormControl: ({ children }: any) => <div data-testid="pat-form-control">{children}</div>,
  FormDescription: ({ children }: any) => <div data-testid="pat-form-description">{children}</div>,
  FormField: ({ children, control, name, render }: any) => (
    <div data-testid={`pat-form-field-${name}`}>
      {render({
        field: {
          value: '',
          onChange: vi.fn(),
          name,
        },
      })}
    </div>
  ),
  FormItem: ({ children }: any) => <div data-testid="pat-form-item">{children}</div>,
  FormLabel: ({ children }: any) => <div data-testid="pat-form-label">{children}</div>,
  FormMessage: () => <div data-testid="pat-form-message"></div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'pat-button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => (
    <input data-testid={props['data-testid'] || 'pat-form-token'} {...props} />
  ),
}));

vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="pat-alert-icon" />,
  Eye: () => <span data-testid="pat-eye-icon" />,
  EyeOff: () => <span data-testid="pat-eye-off-icon" />,
  Copy: () => <span data-testid="pat-copy-icon" />,
  Check: () => <span data-testid="pat-check-icon" />,
  Loader2: () => <span data-testid="pat-loader-icon" />,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PATModal', () => {
  // Mock das funções usadas no componente
  const mockClose = vi.fn();
  const mockOnSuccess = vi.fn();
  let mockCreateToken = vi.fn().mockResolvedValue({
    token: 'new-token-12345',
    expiresAt: '2023-12-31T23:59:59Z',
  });

  const mockUpdateToken = vi.fn().mockResolvedValue({
    token: 'updated-token-67890',
    expiresAt: '2024-06-30T23:59:59Z',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const { usePAT } = require('@/hooks/use-pat');

    usePAT.mockImplementation(() => ({
      createToken: mockCreateToken,
      updateToken: mockUpdateToken,
      isLoading: false,
      error: null,
    }));
  });

  it('should render the modal for new token configuration', () => {
    renderWithWrapper(
      <PATModal isOpen={true} onClose={mockClose} onSuccess={mockOnSuccess} patStatus={null} />
    );

    expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    expect(screen.getByTestId('pat-modal-title')).toHaveTextContent('Configurar Token de Acesso');
    expect(screen.getByTestId('pat-form')).toBeInTheDocument();

    // Verify form field is present
    expect(screen.getByTestId('pat-form-token')).toBeInTheDocument();

    // Verify buttons
    expect(screen.getByTestId('pat-form-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-submit')).toBeInTheDocument();
    expect(screen.getByTestId('pat-form-submit-text')).toHaveTextContent('Configurar');
  });

  it('should render the modal for token update', () => {
    renderWithWrapper(
      <PATModal
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockOnSuccess}
        patStatus={{
          configured: true,
          lastUpdated: '2023-06-15T10:30:00Z',
        }}
      />
    );

    expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    expect(screen.getByTestId('pat-modal-title')).toHaveTextContent('Atualizar Token de Acesso');

    // Verify submit button has appropriate text for update
    expect(screen.getByTestId('pat-form-submit-text')).toHaveTextContent('Atualizar');
  });

  it('should toggle token visibility when eye icon is clicked', async () => {
    renderWithWrapper(
      <PATModal isOpen={true} onClose={mockClose} onSuccess={mockOnSuccess} patStatus={null} />
    );

    // Get the token input and visibility toggle
    const tokenInput = screen.getByTestId('pat-form-token');

    expect(tokenInput).toHaveAttribute('type', 'password');

    // Find the toggle button and click it
    const visibilityToggle = screen.getByTestId('pat-visibility-toggle');

    fireEvent.click(visibilityToggle);

    // Token should now be visible
    expect(tokenInput).toHaveAttribute('type', 'text');

    // Click again to hide
    fireEvent.click(visibilityToggle);

    // Token should be hidden again
    expect(tokenInput).toHaveAttribute('type', 'password');
  });

  it('should close the modal when cancel is clicked', () => {
    renderWithWrapper(
      <PATModal isOpen={true} onClose={mockClose} onSuccess={mockOnSuccess} patStatus={null} />
    );

    const cancelButton = screen.getByTestId('pat-form-cancel');

    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should call createToken when form is submitted for new configuration', async () => {
    const user = userEvent.setup();

    renderWithWrapper(
      <PATModal isOpen={true} onClose={mockClose} onSuccess={mockOnSuccess} patStatus={null} />
    );

    // Type in the token field
    const tokenInput = screen.getByTestId('pat-form-token');

    await user.type(tokenInput, 'new-personal-access-token');

    // Submit the form
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.click(submitButton);

    // Check if createToken was called with the right data
    expect(mockCreateToken).toHaveBeenCalledWith({ token: 'new-personal-access-token' });

    // Check if the success callback was triggered
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    // Check if modal was closed
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should call updateToken when form is submitted for token update', async () => {
    const user = userEvent.setup();

    renderWithWrapper(
      <PATModal
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockOnSuccess}
        patStatus={{
          configured: true,
          lastUpdated: '2023-06-15T10:30:00Z',
        }}
      />
    );

    // Type in the token field
    const tokenInput = screen.getByTestId('pat-form-token');

    await user.type(tokenInput, 'updated-personal-access-token');

    // Submit the form
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.click(submitButton);

    // Check if updateToken was called with the right data
    expect(mockUpdateToken).toHaveBeenCalledWith({ token: 'updated-personal-access-token' });

    // Check if the success callback was triggered
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    // Check if modal was closed
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should show loading state during form submission', async () => {
    // Make the token creation take some time
    mockCreateToken = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'new-token-12345',
            expiresAt: '2023-12-31T23:59:59Z',
          });
        }, 100);
      });
    });

    // Update the mock
    const { usePAT } = require('@/hooks/use-pat');

    usePAT.mockImplementation(() => ({
      createToken: mockCreateToken,
      updateToken: mockUpdateToken,
      isLoading: false,
      error: null,
    }));

    const user = userEvent.setup();

    renderWithWrapper(
      <PATModal isOpen={true} onClose={mockClose} onSuccess={mockOnSuccess} patStatus={null} />
    );

    // Type in the token field
    const tokenInput = screen.getByTestId('pat-form-token');

    await user.type(tokenInput, 'new-personal-access-token');

    // Submit the form
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.click(submitButton);

    // Verify loading state
    expect(screen.getByTestId('pat-loader-icon')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle errors during form submission', async () => {
    // Mock the token creation to fail
    mockCreateToken = vi.fn().mockRejectedValue(new Error('Invalid token format'));

    // Update the mock
    const { usePAT } = require('@/hooks/use-pat');

    usePAT.mockImplementation(() => ({
      createToken: mockCreateToken,
      updateToken: mockUpdateToken,
      isLoading: false,
      error: null,
    }));

    const { toast } = require('sonner');
    const user = userEvent.setup();

    renderWithWrapper(
      <PATModal isOpen={true} onClose={mockClose} onSuccess={mockOnSuccess} patStatus={null} />
    );

    // Type in the token field
    const tokenInput = screen.getByTestId('pat-form-token');

    await user.type(tokenInput, 'invalid-token');

    // Submit the form
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Modal should not be closed on error
    expect(mockClose).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
