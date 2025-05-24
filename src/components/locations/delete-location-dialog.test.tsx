import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';
import type { Location } from '@/types/location';

import { DeleteLocationDialog } from './delete-location-dialog';

describe('DeleteLocationDialog', () => {
  const mockLocation: Location = {
    id: '1',
    name: 'Test Location',
    slug: 'test-location',
    createdAt: new Date().toISOString(),
  };

  const renderComponent = (
    props: {
      location?: Location | null;
      isOpen?: boolean;
      isDeleting?: boolean;
      onDelete?: () => Promise<void>;
      onCancel?: () => void;
    } = {}
  ) => {
    const defaultProps = {
      location: mockLocation,
      isOpen: true,
      isDeleting: false,
      onDelete: vi.fn().mockResolvedValue(undefined),
      onCancel: vi.fn(),
    };

    return render(<DeleteLocationDialog {...defaultProps} {...props} />);
  };

  it('should not render when location is null', () => {
    const { container } = renderComponent({ location: null });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render correctly with location data', () => {
    renderComponent();
    expect(screen.getByTestId('delete-location-dialog')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    renderComponent({ onCancel });

    const cancelButton = screen.getByTestId('delete-location-cancel-button');

    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when confirm button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    renderComponent({ onDelete });

    const confirmButton = screen.getByTestId('delete-location-confirm-button');

    fireEvent.click(confirmButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Deletando...')).not.toBeInTheDocument());
  });

  it('should disable buttons and show loading state when isDeleting is true', () => {
    renderComponent({ isDeleting: true });

    const cancelButton = screen.getByTestId('delete-location-cancel-button');
    const confirmButton = screen.getByTestId('delete-location-confirm-button');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    expect(screen.getByTestId('delete-location-loading-indicator')).toBeInTheDocument();
    expect(confirmButton).toHaveTextContent('Deletando...');
  });

  it('should show "Excluir" text when isDeleting is false', () => {
    renderComponent({ isDeleting: false });

    const confirmButton = screen.getByTestId('delete-location-confirm-button');

    expect(confirmButton).toHaveTextContent('Excluir');
    expect(screen.queryByTestId('delete-location-loading-indicator')).not.toBeInTheDocument();
  });
});
