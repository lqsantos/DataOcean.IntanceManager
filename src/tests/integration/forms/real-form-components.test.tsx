/**
 * Teste de integração para os componentes reais de formulários com EntityPage
 *
 * Este teste verifica se os componentes reais de formulários recebem corretamente
 * suas respectivas propriedades de entidade quando usados com o EntityPage.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Importações de componentes reais
import { ApplicationForm } from '@/components/applications/application-form';
import { EnvironmentForm } from '@/components/environments/environment-form';
import { LocationForm } from '@/components/locations/location-form';
import { EntityPage } from '@/components/ui/entity-page';

// Mock hooks e componentes relacionados para isolar os testes
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: (cb: any) => (e: any) => {
      e?.preventDefault?.();

      return cb({});
    },
    formState: { errors: {} },
    control: {},
    reset: vi.fn(),
    watch: vi.fn(),
    setValue: vi.fn(),
  }),
  FormProvider: ({ children }: any) => <div>{children}</div>,
  Controller: ({ render }: any) => render({ field: { onChange: vi.fn(), value: '', name: '' } }),
  useFormContext: () => ({}),
  useFormState: () => ({}),
}));

// Mocks adicionais para UI components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div data-testid="form">{children}</div>,
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ render, name }: any) => render({ field: { name, value: '' } }),
  FormLabel: ({ children }: any) => <div data-testid="form-label">{children}</div>,
  FormMessage: () => <div data-testid="form-message"></div>,
  FormDescription: ({ children }: any) => <div data-testid="form-description">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid']}>{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => (
    <input
      data-testid={props['data-testid'] || `input-${props.id || 'default'}`}
      data-value={props.value || ''}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => (
    <textarea
      data-testid={props['data-testid'] || `textarea-${props.id || 'default'}`}
      data-value={props.value || ''}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid={props['data-testid']} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Plus: () => <div>PlusIcon</div>,
  RefreshCw: () => <div>RefreshIcon</div>,
  AlertCircle: () => <div>AlertIcon</div>,
  Loader2: () => <div>LoaderIcon</div>,
}));

// Mock para o componente EntityTable simplificado
const MockEntityTable = ({ entities, onEdit }: any) => (
  <div data-testid="entity-table">
    <button data-testid="edit-button" onClick={() => onEdit(entities[0])}>
      Edit Entity
    </button>
  </div>
);

describe('Real Form Component Integration Tests', () => {
  // Dados de teste compartilhados
  const testEntity = {
    id: '1',
    name: 'Test Entity',
    slug: 'test-entity',
    description: 'Test description',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  // Funções mock
  const mockRefreshFn = vi.fn().mockResolvedValue(undefined);
  const mockCreateFn = vi.fn().mockResolvedValue(undefined);
  const mockUpdateFn = vi.fn().mockResolvedValue(undefined);
  const mockDeleteFn = vi.fn().mockResolvedValue(undefined);

  describe('ApplicationForm integration', () => {
    it('should receive the correct props when editing', async () => {
      // Espionamos o componente ApplicationForm para verificar quais props ele recebe
      const spyApplicationForm = vi.fn().mockImplementation(ApplicationForm);

      const user = userEvent.setup();

      render(
        <EntityPage
          entities={[testEntity]}
          isLoading={false}
          isRefreshing={false}
          error={null}
          refreshEntities={mockRefreshFn}
          createEntity={mockCreateFn}
          updateEntity={mockUpdateFn}
          deleteEntity={mockDeleteFn}
          EntityTable={MockEntityTable}
          EntityForm={spyApplicationForm}
          entityName={{
            singular: 'Aplicação',
            plural: 'Aplicações',
            description: 'Descrição',
          }}
          testIdPrefix="app"
          entityPropName="application"
        />
      );

      // Clica no botão de edição para abrir o diálogo
      await user.click(screen.getByTestId('edit-button'));

      // Verifica se o diálogo foi aberto
      expect(screen.getByTestId('app-page-edit-dialog')).toBeInTheDocument();

      // Verifica que o componente recebeu as props corretas
      const lastCall = spyApplicationForm.mock.calls[spyApplicationForm.mock.calls.length - 1];

      expect(lastCall[0].application).toBeDefined();
      expect(lastCall[0].application.id).toBe('1');
      expect(lastCall[0].application.name).toBe('Test Entity');
      expect(lastCall[0].application.slug).toBe('test-entity');
      expect(lastCall[0].application.description).toBe('Test description');
    });
  });

  describe('LocationForm integration', () => {
    // Para o LocationForm que usa um código diferente sem react-hook-form
    const locationEntity = {
      id: '1',
      name: 'Test Location',
      slug: 'test-location',
      createdAt: '2023-01-01T00:00:00.000Z',
    };

    it('should receive the correct props when editing', async () => {
      // Espionamos o componente LocationForm para verificar quais props ele recebe
      const spyLocationForm = vi.fn().mockImplementation(LocationForm);

      const user = userEvent.setup();

      render(
        <EntityPage
          entities={[locationEntity]}
          isLoading={false}
          isRefreshing={false}
          error={null}
          refreshEntities={mockRefreshFn}
          createEntity={mockCreateFn}
          updateEntity={mockUpdateFn}
          deleteEntity={mockDeleteFn}
          EntityTable={MockEntityTable}
          EntityForm={spyLocationForm}
          entityName={{
            singular: 'Localidade',
            plural: 'Localidades',
            description: 'Descrição',
          }}
          testIdPrefix="loc"
          entityPropName="location"
        />
      );

      // Clica no botão de edição para abrir o diálogo
      await user.click(screen.getByTestId('edit-button'));

      // Verifica se o componente recebeu a propriedade location corretamente
      const lastCall = spyLocationForm.mock.calls[spyLocationForm.mock.calls.length - 1];

      expect(lastCall[0].location).toBeDefined();
      expect(lastCall[0].location.id).toBe('1');
      expect(lastCall[0].location.name).toBe('Test Location');
      expect(lastCall[0].location.slug).toBe('test-location');
    });
  });

  describe('EnvironmentForm integration', () => {
    const environmentEntity = {
      id: '1',
      name: 'Test Environment',
      slug: 'test-env',
      order: 1,
      createdAt: '2023-01-01T00:00:00.000Z',
    };

    it('should receive the correct props when editing', async () => {
      // Espionamos o componente EnvironmentForm para verificar quais props ele recebe
      const spyEnvironmentForm = vi.fn().mockImplementation(EnvironmentForm);

      const user = userEvent.setup();

      render(
        <EntityPage
          entities={[environmentEntity]}
          isLoading={false}
          isRefreshing={false}
          error={null}
          refreshEntities={mockRefreshFn}
          createEntity={mockCreateFn}
          updateEntity={mockUpdateFn}
          deleteEntity={mockDeleteFn}
          EntityTable={MockEntityTable}
          EntityForm={spyEnvironmentForm}
          entityName={{
            singular: 'Ambiente',
            plural: 'Ambientes',
            description: 'Descrição',
          }}
          testIdPrefix="env"
          entityPropName="environment"
        />
      );

      // Clica no botão de edição para abrir o diálogo
      await user.click(screen.getByTestId('edit-button'));

      // Verifica se o componente recebeu a propriedade environment corretamente
      const lastCall = spyEnvironmentForm.mock.calls[spyEnvironmentForm.mock.calls.length - 1];

      expect(lastCall[0].environment).toBeDefined();
      expect(lastCall[0].environment.id).toBe('1');
      expect(lastCall[0].environment.name).toBe('Test Environment');
      expect(lastCall[0].environment.slug).toBe('test-env');
      expect(lastCall[0].environment.order).toBe(1);
    });
  });

  describe('Missing entityPropName scenario', () => {
    it('should fail to populate form without entityPropName', async () => {
      // Espionamos o componente ApplicationForm para verificar quais props ele recebe
      const spyApplicationForm = vi.fn().mockImplementation(ApplicationForm);

      const user = userEvent.setup();

      render(
        <EntityPage
          entities={[testEntity]}
          isLoading={false}
          isRefreshing={false}
          error={null}
          refreshEntities={mockRefreshFn}
          createEntity={mockCreateFn}
          updateEntity={mockUpdateFn}
          deleteEntity={mockDeleteFn}
          EntityTable={MockEntityTable}
          EntityForm={spyApplicationForm}
          entityName={{
            singular: 'Aplicação',
            plural: 'Aplicações',
            description: 'Descrição',
          }}
          testIdPrefix="app"
          // entityPropName não é fornecido propositalmente
        />
      );

      // Clica no botão de edição para abrir o diálogo
      await user.click(screen.getByTestId('edit-button'));

      // Verifica que o componente recebeu entity, mas não application
      const lastCall = spyApplicationForm.mock.calls[spyApplicationForm.mock.calls.length - 1];

      expect(lastCall[0].entity).toBeDefined();
      expect(lastCall[0].application).toBeUndefined();
    });
  });
});
