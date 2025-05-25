import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';
import type { Application } from '@/types/application';

import { DeleteApplicationDialog } from './delete-application-dialog';

// Mock para o StyledDeleteDialog
vi.mock('@/components/ui/styled-delete-dialog', () => ({
  StyledDeleteDialog: ({
    open,
    onOpenChange,
    title,
    itemName,
    description,
    onConfirm,
    onCancel,
    isDeleting,
    confirmText,
    testId,
  }) =>
    open ? (
      <div data-testid={testId}>
        <h2>{title}</h2>
        <div data-testid={`${testId}-description`}>{description}</div>
        <button data-testid={`${testId}-cancel-button`} onClick={onCancel} disabled={isDeleting}>
          Cancelar
        </button>
        <button data-testid={`${testId}-confirm-button`} onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deletando...' : confirmText}
        </button>
        {isDeleting && <div data-testid={`${testId}-loading-indicator`}>Loading...</div>}
      </div>
    ) : null,
}));

describe('DeleteApplicationDialog', () => {
  const mockApplication: Application = {
    id: '1',
    name: 'Test Application',
    slug: 'test-app',
    description: 'This is a test application',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const renderComponent = (
    props: {
      application?: Application | null;
      isOpen?: boolean;
      isDeleting?: boolean;
      onDelete?: () => Promise<void>;
      onCancel?: () => void;
    } = {}
  ) => {
    const defaultProps = {
      application: mockApplication,
      isOpen: true,
      isDeleting: false,
      onDelete: vi.fn().mockResolvedValue(undefined),
      onCancel: vi.fn(),
    };

    return render(<DeleteApplicationDialog {...defaultProps} {...props} />);
  };

  it('should not render when application is null', () => {
    const { container } = renderComponent({ application: null });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render correctly with application data', () => {
    renderComponent();
    expect(screen.getByTestId('delete-application-dialog')).toBeInTheDocument();
    expect(screen.getByText('Excluir Aplicação')).toBeInTheDocument();
  });

  it('should display the application name in the description', () => {
    renderComponent();
    const dialogContent = screen.getByTestId('delete-application-dialog-description');

    expect(dialogContent).toHaveTextContent('Test Application');
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    renderComponent({ onCancel });
    const cancelButton = screen.getByTestId('delete-application-dialog-cancel-button');

    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when confirm button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    renderComponent({ onDelete });
    const confirmButton = screen.getByTestId('delete-application-dialog-confirm-button');

    await act(async () => {
      fireEvent.click(confirmButton);
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons and show loading state when isDeleting is true', () => {
    renderComponent({ isDeleting: true });
    const cancelButton = screen.getByTestId('delete-application-dialog-cancel-button');
    const confirmButton = screen.getByTestId('delete-application-dialog-confirm-button');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    expect(screen.getByTestId('delete-application-dialog-loading-indicator')).toBeInTheDocument();
    expect(confirmButton).toHaveTextContent('Deletando...');
  });

  it('should show "Excluir" text when isDeleting is false', () => {
    renderComponent({ isDeleting: false });
    const confirmButton = screen.getByTestId('delete-application-dialog-confirm-button');

    expect(confirmButton).toHaveTextContent('Excluir');
    expect(
      screen.queryByTestId('delete-application-dialog-loading-indicator')
    ).not.toBeInTheDocument();
  });

  it('should not show dialog when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });

    expect(container).toBeEmptyDOMElement();
  });
});
