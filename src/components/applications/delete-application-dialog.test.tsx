// components/applications/delete-application-dialog.test.tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DeleteApplicationDialog } from './delete-application-dialog';

// Mock do Dialog usando uma implementação mais completa
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="delete-application-dialog" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
}));

// Mock do Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('DeleteApplicationDialog', () => {
  const mockApplication = {
    id: '1',
    name: 'Test Application',
    slug: 'test-app',
    description: 'A test application',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockOnDelete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render if application is null', () => {
    render(
      <DeleteApplicationDialog
        application={null}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId('delete-application-dialog')).not.toBeInTheDocument();
  });

  it('should render dialog with application name when open', () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Testando a presença dos elementos do diálogo usando o data-testid correto
    expect(screen.getByTestId('delete-application-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Excluir Aplicação');
    expect(screen.getByTestId('dialog-description')).toContainHTML(
      'Tem certeza que deseja excluir a aplicação <strong>Test Application</strong>?'
    );
  });

  it('should not render dialog when closed', () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={false}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId('delete-application-dialog')).not.toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByTestId('delete-application-cancel-button');

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', async () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    const deleteButton = screen.getByTestId('delete-application-confirm-button');

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should disable buttons when deleting', () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={true}
        isDeleting={true}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByTestId('delete-application-cancel-button');
    const deleteButton = screen.getByTestId('delete-application-confirm-button');

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should show loading state when deleting', () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={true}
        isDeleting={true}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Excluindo...')).toBeInTheDocument();
  });

  it('should show normal text when not deleting', () => {
    render(
      <DeleteApplicationDialog
        application={mockApplication}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });
});
