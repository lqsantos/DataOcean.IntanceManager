import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocationForm } from '../location-form';

describe('LocationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with empty fields when no default values', () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-slug')).toBeInTheDocument();
    expect(screen.getByTestId('location-form-submit-button')).toBeInTheDocument();
  });

  it('renders the form with default values when provided', () => {
    const defaultValues = {
      name: 'Test Location',
      slug: 'test-loc',
      description: 'This is a test location',
    };

    render(<LocationForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

    expect(screen.getByTestId('input-name')).toHaveAttribute('value', 'Test Location');
    expect(screen.getByTestId('input-slug')).toHaveAttribute('value', 'test-loc');
  });

  it('submits the form with entered values', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'New Location');
    await user.type(screen.getByTestId('input-slug'), 'new-loc');

    await user.click(screen.getByTestId('location-form-submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Location',
      slug: 'new-loc',
    }));
  });

  it('auto-generates a slug when typing the name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'Test Location With Spaces');

    // Wait for slug to be auto-generated
    expect(await screen.findByTestId('input-slug')).toHaveValue('test-location-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Try submitting the form without filling required fields
    await user.click(screen.getByTestId('location-form-submit-button'));

    // Check for validation error message
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Type in the name field to trigger auto-generation
    await user.type(screen.getByTestId('input-name'), 'Test Location');

    // Wait for slug to be auto-generated
    expect(await screen.findByTestId('input-slug')).toHaveValue('test-location');

    // Clear the slug and type a custom one
    await user.clear(screen.getByTestId('input-slug'));
    await user.type(screen.getByTestId('input-slug'), 'custom-loc-slug');

    await user.click(screen.getByTestId('location-form-submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Location',
        slug: 'custom-loc-slug',
      })
    );
  });

  it('shows error when slug contains invalid characters', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'Test Location');
    await user.clear(screen.getByTestId('input-slug'));
    await user.type(screen.getByTestId('input-slug'), 'invalid@slug');

    await user.click(screen.getByTestId('location-form-submit-button'));

    expect(await screen.findByText(/slug can only contain/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
