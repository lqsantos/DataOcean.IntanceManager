import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';
import type { Environment } from '@/types/environment';

import { DeleteEnvironmentDialog } from './delete-environment-dialog';

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
        <p data-testid={`${testId}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
        <button
          data-testid={`${testId}-cancel`}
          onClick={onCancel}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          data-testid={`${testId}-confirm`}
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium"
        >
          {isDeleting ? (
            <>
              <span data-testid="loader" className="mr-2 h-4 w-4 animate-spin" />
              <span>Excluindo...</span>
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    ) : null,
}));

describe('DeleteEnvironmentDialog', () => {
  const mockEnvironment: Environment = {
    id: '1',
    name: 'Test Environment',
    slug: 'test-env',
    order: 1,
    createdAt: '2023-01-01T00:00:00Z',
  };

  const renderComponent = (
    props: {
      environment?: Environment | null;
      isOpen?: boolean;
      isDeleting?: boolean;
      onDelete?: () => Promise<void>;
      onCancel?: () => void;
    } = {}
  ) => {
    const defaultProps = {
      environment: mockEnvironment,
      isOpen: true,
      isDeleting: false,
      onDelete: vi.fn().mockResolvedValue(undefined),
      onCancel: vi.fn(),
    };

    return render(<DeleteEnvironmentDialog {...defaultProps} {...props} />);
  };

  it('should not render when environment is null', () => {
    const { container } = renderComponent({ environment: null });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render correctly with environment data', () => {
    renderComponent();
    expect(screen.getByTestId('delete-environment-dialog')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    renderComponent({ onCancel });

    const cancelButton = screen.getByTestId('delete-environment-dialog-cancel');

    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when confirm button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    renderComponent({ onDelete });

    const confirmButton = screen.getByTestId('delete-environment-dialog-confirm');

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons and show loading state when isDeleting is true', () => {
    renderComponent({ isDeleting: true });

    const cancelButton = screen.getByTestId('delete-environment-dialog-cancel');
    const confirmButton = screen.getByTestId('delete-environment-dialog-confirm');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(confirmButton).toHaveTextContent('Excluindo...');
  });

  it('should show environment name in the dialog content', () => {
    renderComponent();

    const element = screen.getByText(/Test Environment/);

    expect(element).toBeInTheDocument();
  });

  it('should show "Excluir" text when isDeleting is false', () => {
    renderComponent({ isDeleting: false });

    const confirmButton = screen.getByTestId('delete-environment-dialog-confirm');

    expect(confirmButton).toHaveTextContent('Excluir');
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });
});
