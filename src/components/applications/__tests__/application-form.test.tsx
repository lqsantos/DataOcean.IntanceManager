import { act, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { ApplicationForm } from '../application-form';

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

  it('renders the form with default values when provided', async () => {
    const defaultValues = {
      name: 'Test Application',
      slug: 'test-app',
      description: 'This is a test application',
    };

    render(<ApplicationForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

    // Set values using fireEvent for controlled inputs
    act(() => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Application' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'test-app' } });
      fireEvent.change(screen.getByTestId('textarea-description'), {
        target: { value: 'This is a test application' },
      });
    });

    expect(screen.getByTestId('input-name')).toHaveValue('Test Application');
    expect(screen.getByTestId('input-slug')).toHaveValue('test-app');
    expect(screen.getByTestId('textarea-description')).toHaveValue('This is a test application');
  });

  it('submits the form with entered values', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'New Application' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'new-app' } });
      fireEvent.change(screen.getByTestId('textarea-description'), {
        target: { value: 'New application description' },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('application-form-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Application',
        slug: 'new-app',
        description: 'New application description',
      })
    );
  });

  it('auto-generates a slug when typing the name', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), {
        target: { value: 'Test Application With Spaces' },
      });
    });

    // Wait for slug to be auto-generated
    expect(screen.getByTestId('input-slug')).toHaveValue('test-application-with-spaces');
  });

  it('displays validation errors when form is submitted with empty name', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: '' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: '' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('application-form-submit-button'));
    });

    // Check for validation error message
    const errorElement = screen.getByTestId('application-form-error-name');

    expect(errorElement).toBeInTheDocument();
    expect(errorElement.textContent).toContain('This field is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows manual editing of the slug after auto-generation', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Application' } });
    });

    // Wait for slug to be auto-generated
    expect(screen.getByTestId('input-slug')).toHaveValue('test-application');

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'custom-slug' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('application-form-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Application',
        slug: 'custom-slug',
      })
    );
  });

  it('shows error when slug contains invalid characters', async () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Application' } });
      fireEvent.change(screen.getByTestId('input-slug'), { target: { value: 'invalid@slug' } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('application-form-submit-button'));
    });

    // Find the error message by test ID
    const errorElement = screen.getByTestId('application-form-error-slug');

    expect(errorElement).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
