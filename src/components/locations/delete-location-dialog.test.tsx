import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
    expect(screen.getByTestId('delete-location-dialog-title')).toHaveTextContent(
      'Excluir Localidade'
    );
    expect(screen.getByTestId('delete-location-dialog-description')).toBeInTheDocument();
    expect(screen.getByTestId('delete-location-dialog-name')).toHaveTextContent(mockLocation.name);
    expect(screen.getByTestId('delete-location-dialog-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('delete-location-dialog-confirm')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    renderComponent({ onCancel });

    fireEvent.click(screen.getByTestId('delete-location-dialog-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when dialog is closed by changing open state', () => {
    const onCancel = vi.fn();

    renderComponent({ onCancel });

    const dialogContent = screen.getByTestId('delete-location-dialog');

    fireEvent.keyDown(dialogContent, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when confirm button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    renderComponent({ onDelete });

    fireEvent.click(screen.getByTestId('delete-location-dialog-confirm'));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable buttons and show loading state when isDeleting is true', () => {
    renderComponent({ isDeleting: true });

    expect(screen.getByTestId('delete-location-dialog-cancel')).toBeDisabled();
    expect(screen.getByTestId('delete-location-dialog-confirm')).toBeDisabled();
    expect(screen.getByTestId('delete-location-dialog-loading')).toBeInTheDocument();
  });

  it('should not show loading indicator when isDeleting is false', () => {
    renderComponent({ isDeleting: false });

    expect(screen.queryByTestId('delete-location-dialog-loading')).not.toBeInTheDocument();
  });
});
