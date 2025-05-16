import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { DeleteEnvironmentDialog } from '@/components/environments/delete-environment-dialog';
import type { Environment } from '@/types/environment';

// Sample environment for testing
const mockEnvironment: Environment = {
  id: '1',
  name: 'Production',
  slug: 'prod',
  order: 1,
  createdAt: '2023-01-01T00:00:00Z',
};

describe('DeleteEnvironmentDialog', () => {
  // Mock functions
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when environment is null', () => {
    const { container } = render(
      <DeleteEnvironmentDialog
        environment={null}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog content when open with environment', () => {
    render(
      <DeleteEnvironmentDialog
        environment={mockEnvironment}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Check if the title and description are rendered
    expect(screen.getByText('Delete Environment')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the/i)).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('does not render dialog when isOpen is false', () => {
    render(
      <DeleteEnvironmentDialog
        environment={mockEnvironment}
        isOpen={false}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Dialog content should not be present
    expect(screen.queryByText('Delete Environment')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <DeleteEnvironmentDialog
        environment={mockEnvironment}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(cancelButton);

    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <DeleteEnvironmentDialog
        environment={mockEnvironment}
        isOpen={true}
        isDeleting={false}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete$/i });

    fireEvent.click(deleteButton);

    // Check if onDelete was called
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('shows loading indicator when isDeleting is true', () => {
    render(
      <DeleteEnvironmentDialog
        environment={mockEnvironment}
        isOpen={true}
        isDeleting={true}
        onDelete={mockOnDelete}
        onCancel={mockOnCancel}
      />
    );

    // Check if the loading indicator is visible
    const loadingSpinner = document.querySelector('.animate-spin');

    expect(loadingSpinner).toBeInTheDocument();

    // Buttons should be disabled when deleting
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const deleteButton = screen.getByRole('button', { name: /delete$/i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
