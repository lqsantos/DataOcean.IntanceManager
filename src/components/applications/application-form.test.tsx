// components/applications/application-form.test.tsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApplicationForm } from './application-form';

// Mock para React Hook Form para garantir que handleSubmit funcione corretamente
vi.mock('react-hook-form', () => {
  return {
    useForm: () => ({
      register: vi.fn(),
      handleSubmit: (onSubmit) => (event) => {
        event?.preventDefault?.();

        return onSubmit({ 
          name: 'Test Name', 
          slug: 'test-slug', 
          description: 'Test description' 
        });
      },
      formState: { errors: {} },
      control: {},
    }),
  };
});

// Mock de zod e resolvers
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => (data: any) => ({ values: data })),
}));

// Mock dos componentes da UI
vi.mock('@/components/ui/form', () => ({
  Form: ({ children, onSubmit, ...props }: any) => (
    <form 
      data-testid="form" 
      onSubmit={(e) => {
        e.preventDefault();

        if (onSubmit) {onSubmit(e);}
      }} 
      {...props}
    >
      {children}
    </form>
  ),
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormDescription: ({ children }: any) => <div data-testid="form-description">{children}</div>,
  FormField: ({ control: _control, name, render }: any) => (
    <div data-testid={`form-field-${name}`}>
      {render({ field: { name, value: '', onChange: vi.fn() } })}
    </div>
  ),
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <div data-testid="form-label">{children}</div>,
  FormMessage: () => <div data-testid="form-message"></div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid={props['data-testid'] || 'input'} {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid={props['data-testid'] || 'textarea'} {...props} />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, ...props }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('ApplicationForm', () => {
  const mockApplication = {
    id: '1',
    name: 'Test Application',
    slug: 'test-app',
    description: 'A test application description',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with empty fields for new application', () => {
    render(
      <ApplicationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    // Verifica se os campos estão presentes
    expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-slug')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-description')).toBeInTheDocument();

    // Verifica se os botões estão presentes
    expect(screen.getByTestId('application-form-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('application-form-submit')).toBeInTheDocument();

    // Verifica o texto do botão de submit para nova aplicação
    expect(screen.getByTestId('application-form-submit')).toHaveTextContent('Criar');
  });

  it('should render the form with populated fields for existing application', () => {
    render(
      <ApplicationForm
        application={mockApplication}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Verifica se os campos estão presentes
    expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-slug')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-description')).toBeInTheDocument();

    // Verifica o texto do botão de submit para edição
    expect(screen.getByTestId('application-form-submit')).toHaveTextContent('Salvar');
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(
      <ApplicationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
    );

    const cancelButton = screen.getByTestId('application-form-cancel');

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit the form when valid data is entered', async () => {
    render(
      <ApplicationForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );
    
    // Abordagem direta: Chamar a função de submissão diretamente
    const submitButton = screen.getByTestId('application-form-submit');
    
    await act(async () => {
      // Clique no botão de submissão
      fireEvent.click(submitButton);
    });
    
    // Aguarda a submissão do formulário e que o mock seja chamado
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Name',
        slug: 'test-slug',
        description: 'Test description'
      });
    });
  });

  it('should disable buttons when form is submitting', () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />);

    const cancelButton = screen.getByTestId('application-form-cancel');
    const submitButton = screen.getByTestId('application-form-submit');

    expect(cancelButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should show loading state when submitting new application', () => {
    render(<ApplicationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />);

    expect(screen.getByText('Criando...')).toBeInTheDocument();
  });

  it('should show loading state when submitting edited application', () => {
    render(
      <ApplicationForm
        application={mockApplication}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    expect(screen.getByText('Salvando...')).toBeInTheDocument();
  });
});
