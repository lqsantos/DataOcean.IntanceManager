import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';
import type { Environment } from '@/types/environment';

import { DeleteEnvironmentDialog } from './delete-environment-dialog';

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

    const cancelButton = screen.getByTestId('delete-environment-cancel-button');

    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when confirm button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    renderComponent({ onDelete });

    const confirmButton = screen.getByTestId('delete-environment-confirm-button');

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons and show loading state when isDeleting is true', () => {
    renderComponent({ isDeleting: true });

    const cancelButton = screen.getByTestId('delete-environment-cancel-button');
    const confirmButton = screen.getByTestId('delete-environment-confirm-button');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    expect(screen.getByTestId('delete-environment-loading-indicator')).toBeInTheDocument();
    expect(confirmButton).toHaveTextContent('Deletando...');
  });

  it('should show environment name in the dialog content', () => {
    renderComponent();

    const dialogContent = screen.getByTestId('delete-environment-dialog-description');

    expect(dialogContent).toHaveTextContent('Test Environment');
  });

  it('should show "Excluir" text when isDeleting is false', () => {
    renderComponent({ isDeleting: false });

    const confirmButton = screen.getByTestId('delete-environment-confirm-button');

    expect(confirmButton).toHaveTextContent('Excluir');
    expect(screen.queryByTestId('delete-environment-loading-indicator')).not.toBeInTheDocument();
  });
});
