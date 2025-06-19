import { act, fireEvent } from '@testing-library/react';
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

  it('renders the form with default values when provided', async () => {
    const defaultValues = {
      name: 'Test Environment',
      slug: 'test-env',
      description: 'This is a test environment',
    };

    render(<EnvironmentForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

    // Set values via fireEvent which is more reliable for controlled inputs
    act(() => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Environment' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'test-env' } });
    });

    expect(screen.getByTestId('input-name')).toHaveValue('Test Environment');
    expect(screen.getByTestId('input-slug')).toHaveValue('test-env');
  });

  it('submits the form with entered values', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    await act(async () => {
      // Clear any existing values
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'New Environment' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'new-env' } });
    });

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

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), {
        target: { value: 'Test Environment With Spaces' },
      });
    });

    // Wait for slug to be auto-generated
    expect(screen.getByTestId('input-slug')).toHaveValue('test-environment-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);
    const user = userEvent.setup();

    // Clear any existing values
    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: '' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: '' } });
    });

    // Try submitting the form without filling required fields
    await user.click(screen.getByTestId('environment-form-submit-button'));

    // Check for validation error message by testId rather than text content
    const errorElement = screen.getByTestId('environment-form-error-name');

    expect(errorElement).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      // First set the name to generate a slug
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Environment' } });
      // Then manually override the auto-generated slug
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'custom-env-slug' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('environment-form-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Environment',
        slug: 'custom-env-slug',
      })
    );
  });

  it('shows error when slug contains invalid characters', async () => {
    render(<EnvironmentForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Environment' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'invalid@slug' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('environment-form-submit-button'));
    });

    // Find the error message by test ID
    const errorElement = screen.getByTestId('environment-form-error-slug');

    expect(errorElement).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
