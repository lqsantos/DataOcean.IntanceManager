import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { EnvironmentForm } from '../environment-form';

describe('EnvironmentForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with empty fields when no default values', () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-slug')).toBeInTheDocument();
    expect(screen.getByTestId('environment-form-submit-button')).toBeInTheDocument();
  });

  it('renders the form with default values when provided', () => {
    const defaultValues = {
      name: 'Test Environment',
      slug: 'test-env',
      description: 'This is a test environment',
    };

    render(<EnvironmentForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

    expect(screen.getByTestId('input-name')).toHaveAttribute('value', 'Test Environment');
    expect(screen.getByTestId('input-slug')).toHaveAttribute('value', 'test-env');
  });

  it('submits the form with entered values', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'New Environment');
    await user.type(screen.getByTestId('input-slug'), 'new-env');

    await user.click(screen.getByTestId('environment-form-submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Environment',
        slug: 'new-env',
      })
    );
  });

  it('auto-generates a slug when typing the name', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'Test Environment With Spaces');

    // Wait for slug to be auto-generated
    expect(await screen.findByTestId('input-slug')).toHaveValue('test-environment-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Try submitting the form without filling required fields
    await user.click(screen.getByTestId('environment-form-submit-button'));

    // Check for validation error message
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Type in the name field to trigger auto-generation
    await user.type(screen.getByTestId('input-name'), 'Test Environment');

    // Wait for slug to be auto-generated
    expect(await screen.findByTestId('input-slug')).toHaveValue('test-environment');

    // Clear the slug and type a custom one
    await user.clear(screen.getByTestId('input-slug'));
    await user.type(screen.getByTestId('input-slug'), 'custom-env-slug');

    await user.click(screen.getByTestId('environment-form-submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Environment',
        slug: 'custom-env-slug',
      })
    );
  });

  it('shows error when slug contains invalid characters', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'Test Environment');
    await user.clear(screen.getByTestId('input-slug'));
    await user.type(screen.getByTestId('input-slug'), 'invalid@slug');

    await user.click(screen.getByTestId('environment-form-submit-button'));

    expect(await screen.findByText(/slug can only contain/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
