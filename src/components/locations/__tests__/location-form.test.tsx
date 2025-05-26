import { act, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { LocationForm } from '../location-form';

// Mock the i18n translation
vi.mock('react-i18next', () => ({
  // This mock makes t('messages.requiredField') actually return "This field is required"
  useTranslation: () => {
    return {
      t: (key) => {
        const translations = {
          'messages.requiredField': 'This field is required',
          'messages.invalidSlug': 'Invalid slug format',
        };

        return translations[key] || key;
      },
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  // Adding the missing initReactI18next export
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

describe('LocationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with empty fields when no default values', () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-slug')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
    expect(screen.getByTestId('location-form-submit-button')).toBeInTheDocument();
  });

  it('renders the form with default values when provided', async () => {
    const defaultValues = {
      name: 'Test Location',
      slug: 'test-loc',
      description: 'This is a test location',
    };

    render(<LocationForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

    act(() => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Location' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'test-loc' } });
      fireEvent.change(screen.getByTestId('textarea-description'), {
        target: { value: 'This is a test location' },
      });
    });

    expect(screen.getByTestId('input-name')).toHaveValue('Test Location');
    expect(screen.getByTestId('input-slug')).toHaveValue('test-loc');
    expect(screen.getByTestId('textarea-description')).toHaveValue('This is a test location');
  });

  it('submits the form with entered values', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'New Location' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'new-loc' } });
      fireEvent.change(screen.getByTestId('textarea-description'), {
        target: { value: 'New location description' },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('location-form-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Location',
        slug: 'new-loc',
        description: 'New location description',
      })
    );
  });

  it('auto-generates a slug when typing the name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), {
        target: { value: 'Test Location With Spaces' },
      });
    });

    // Check that the slug was auto-generated correctly
    expect(screen.getByTestId('input-slug')).toHaveValue('test-location-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);

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
    expect(errorElement.textContent).toContain('This field is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<LocationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Location' } });
    });

    // Check that the slug was auto-generated correctly
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
    render(<LocationForm onSubmit={mockOnSubmit} />);

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
