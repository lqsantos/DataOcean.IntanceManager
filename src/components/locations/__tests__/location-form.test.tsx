import { act, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use the centralized mock for react-i18next before importing test-utils
import reactI18nextMock from '@/tests/mocks/i18next';
vi.mock('react-i18next', () => reactI18nextMock);

// Now import render and screen from test-utils
import { render, screen } from '@/tests/test-utils';

import { LocationForm } from '../location-form';

describe('LocationForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with empty fields when no default values', () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-slug')).toBeInTheDocument();
    expect(screen.getByTestId('location-form-submit-button')).toBeInTheDocument();
  });

  it('renders the form with default values when provided', async () => {
    const defaultValues = {
      name: 'Test Location',
      slug: 'test-location',
    };

    render(
      <LocationForm
        location={defaultValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Set values using fireEvent for controlled inputs
    act(() => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Location' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'test-location' } });
    });

    expect(screen.getByTestId('input-name')).toHaveValue('Test Location');
    expect(screen.getByTestId('input-slug')).toHaveValue('test-location');
  });

  it('submits the form with entered values', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'New Location' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'new-location' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('location-form-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Location',
        slug: 'new-location',
      })
    );
  });

  it('auto-generates a slug when typing the name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), {
        target: { value: 'Test Location With Spaces' },
      });
    });

    // Wait for slug to be auto-generated
    expect(screen.getByTestId('input-slug')).toHaveValue('test-location-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: '' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: '' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('location-form-submit-button'));
    });

    // Check for validation error message
    const errorElement = screen.getByTestId('location-form-error-name');

    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent('This field is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Location' } });
    });

    // Wait for slug to be auto-generated
    expect(screen.getByTestId('input-slug')).toHaveValue('test-location');

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'custom-slug' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('location-form-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Location',
        slug: 'custom-slug',
      })
    );
  });

  it('shows error when slug contains invalid characters', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Location' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'invalid@slug' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('location-form-submit-button'));
    });

    // Find the error message by test ID
    const errorElement = screen.getByTestId('location-form-error-slug');

    expect(errorElement).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
