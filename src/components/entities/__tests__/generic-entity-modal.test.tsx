import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';

import { GenericEntityModal } from '../generic-entity-modal';

// Mock Radix UI Slot component
vi.mock('@radix-ui/react-slot', () => ({
  Slot: vi.fn(({ children }) => children),
  createSlot: vi.fn(() => ({
    slotName: 'mock-slot',
  })),
}));

// Mock toast for notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Complete mock for react-i18next with initReactI18next
vi.mock('react-i18next', () => ({
  // This mock makes t('messages.requiredField') actually return "This field is required"
  useTranslation: () => {
    return {
      t: (key) => {
        const translations = {
          'messages.requiredField': 'This field is required',
          'messages.error': 'An error occurred',
          'messages.success': 'Operation successful',
        };

        return translations[key] || key;
      },
    };
  },
  // Adding the missing initReactI18next export
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

describe('GenericEntityModal', () => {
  // Mock functions
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn().mockResolvedValue({ id: '1', name: 'New Entity' });
  const mockOnUpdate = vi.fn().mockResolvedValue({ id: '2', name: 'Updated Entity' });
  const mockOnCreateSuccess = vi.fn();

  // Mock Entity Form component that matches the actual implementation in GenericEntityModal
  function MockEntityForm({ entity, onSubmit, onCancel }) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();

          // When in edit mode, the GenericEntityModal provides entity prop (not defaultValues)
          if (entity && entity.id === '2') {
            onSubmit({ id: '2', name: 'Existing Entity' });
          } else {
            onSubmit({ name: 'New Entity' });
          }
        }}
        data-testid="entity-form"
      >
        <input defaultValue={entity?.name || ''} placeholder="Name" data-testid="name-input" />
        <button type="submit" data-testid="submit-button">
          Save
        </button>
        <button type="button" onClick={onCancel} data-testid="close-button">
          Close
        </button>
      </form>
    );
  }

  // Default props for tests
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    entityToEdit: null,
    onCreate: mockOnCreate,
    onUpdate: mockOnUpdate,
    onCreateSuccess: mockOnCreateSuccess,
    EntityForm: MockEntityForm,
    entityName: {
      singular: 'Entity',
      createTitle: 'Create Entity',
      editTitle: 'Edit Entity',
      createDescription: 'Create a new entity',
      editDescription: 'Edit existing entity',
    },
    createIcon: () => <span data-testid="main-create-icon" />,
    testId: 'test-entity-modal',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<GenericEntityModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('test-entity-modal')).not.toBeInTheDocument();
  });

  it('renders create modal when isOpen is true and entityToEdit is null', () => {
    render(<GenericEntityModal {...defaultProps} />);

    expect(screen.getByTestId('test-entity-modal')).toBeInTheDocument();
    expect(screen.getByTestId('entity-form')).toBeInTheDocument();
    expect(screen.getByText('Create Entity')).toBeInTheDocument();
    expect(screen.getByText('Create a new entity')).toBeInTheDocument();

    // Use getAllByTestId instead of getByTestId to handle multiple elements
    const createIcons = screen.getAllByTestId('main-create-icon');

    expect(createIcons.length).toBeGreaterThan(0);
  });

  it('renders edit modal when entityToEdit is provided', () => {
    const entityToEdit = { id: '2', name: 'Existing Entity' };

    render(<GenericEntityModal {...defaultProps} entityToEdit={entityToEdit} />);

    expect(screen.getByTestId('test-entity-modal')).toBeInTheDocument();
    expect(screen.getByTestId('entity-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Entity')).toBeInTheDocument();
    expect(screen.getByText('Edit existing entity')).toBeInTheDocument();
  });

  it('calls onCreate with form data when creating a new entity', async () => {
    render(<GenericEntityModal {...defaultProps} />);
    const user = userEvent.setup();

    const submitButton = screen.getByTestId('submit-button');

    await user.click(submitButton);

    expect(mockOnCreate).toHaveBeenCalledWith({ name: 'New Entity' });
    expect(mockOnCreateSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onUpdate with form data when editing an entity', async () => {
    const entityToEdit = { id: '2', name: 'Existing Entity' };

    render(<GenericEntityModal {...defaultProps} entityToEdit={entityToEdit} />);
    const user = userEvent.setup();

    const submitButton = screen.getByTestId('submit-button');

    await user.click(submitButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('2', { id: '2', name: 'Existing Entity' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when close button is clicked', async () => {
    render(<GenericEntityModal {...defaultProps} />);
    const user = userEvent.setup();

    const closeButton = screen.getByTestId('close-button');

    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles errors during form submission', async () => {
    const mockErrorCreate = vi.fn().mockRejectedValue(new Error('Create failed'));

    render(<GenericEntityModal {...defaultProps} onCreate={mockErrorCreate} />);
    const user = userEvent.setup();

    const submitButton = screen.getByTestId('submit-button');

    await user.click(submitButton);

    expect(mockErrorCreate).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled(); // Modal should stay open on error
  });

  it('handles errors during update', async () => {
    const mockErrorUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));
    const entityToEdit = { id: '2', name: 'Existing Entity' };

    render(
      <GenericEntityModal
        {...defaultProps}
        entityToEdit={entityToEdit}
        onUpdate={mockErrorUpdate}
      />
    );
    const user = userEvent.setup();

    const submitButton = screen.getByTestId('submit-button');

    await user.click(submitButton);

    expect(mockErrorUpdate).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled(); // Modal should stay open on error
  });
});
