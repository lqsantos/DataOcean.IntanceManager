import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { ApplicationForm } from '../application-form';

describe('ApplicationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with empty fields when no default values', () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-slug')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
    expect(screen.getByTestId('application-form-submit-button')).toBeInTheDocument();
  });

  it('renders the form with default values when provided', () => {
    const defaultValues = {
      name: 'Test Application',
      slug: 'test-app',
      description: 'This is a test application',
    };

    render(<ApplicationForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

    expect(screen.getByTestId('input-name')).toHaveAttribute('value', 'Test Application');
    expect(screen.getByTestId('input-slug')).toHaveAttribute('value', 'test-app');
    expect(screen.getByTestId('textarea-description')).toHaveValue('This is a test application');
  });

  it('submits the form with entered values', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'New Application');
    await user.type(screen.getByTestId('input-slug'), 'new-app');
    await user.type(screen.getByTestId('textarea-description'), 'New application description');

    await user.click(screen.getByTestId('application-form-submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'New Application',
      slug: 'new-app',
      description: 'New application description',
    });
  });

  it('auto-generates a slug when typing the name', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'Test Application With Spaces');

    // Wait for slug to be auto-generated
    expect(await screen.findByTestId('input-slug')).toHaveValue('test-application-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Try submitting the form without filling required fields
    await user.click(screen.getByTestId('application-form-submit-button'));

    // Check for validation error message
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Type in the name field to trigger auto-generation
    await user.type(screen.getByTestId('input-name'), 'Test Application');

    // Wait for slug to be auto-generated
    expect(await screen.findByTestId('input-slug')).toHaveValue('test-application');

    // Clear the slug and type a custom one
    await user.clear(screen.getByTestId('input-slug'));
    await user.type(screen.getByTestId('input-slug'), 'custom-slug');

    await user.click(screen.getByTestId('application-form-submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Application',
        slug: 'custom-slug',
      })
    );
  });

  it('shows error when slug contains invalid characters', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('input-name'), 'Test Application');
    await user.clear(screen.getByTestId('input-slug'));
    await user.type(screen.getByTestId('input-slug'), 'invalid@slug');

    await user.click(screen.getByTestId('application-form-submit-button'));

    expect(await screen.findByText(/slug can only contain/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
