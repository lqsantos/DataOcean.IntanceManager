/**
 * Teste de integração para verificar se os formulários recebem corretamente as entidades para edição
 *
 * Este teste foi criado após um problema onde os formulários apareciam em branco no modo de edição
 * porque a propriedade entity estava sendo passada, mas os formulários específicos esperavam
 * propriedades com nomes diferentes (application, location, environment, etc.)
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EntityPage } from '@/components/ui/entity-page';

// Criamos interfaces de teste simulando as entidades reais
interface TestEntity {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  description?: string;
}

// Simulamos props de criação e atualização
type CreateTestDto = Omit<TestEntity, 'id' | 'createdAt'>;
type UpdateTestDto = Partial<CreateTestDto>;

describe('Entity Form Integration Tests', () => {
  // Dados de teste
  const testEntity: TestEntity = {
    id: '1',
    name: 'Test Entity',
    slug: 'test-entity',
    createdAt: '2023-01-01T00:00:00.000Z',
    description: 'This is a test entity',
  };

  // Funções mock
  const mockRefreshFn = vi.fn().mockResolvedValue(undefined);
  const mockCreateFn = vi.fn().mockResolvedValue(undefined);
  const mockUpdateFn = vi.fn().mockResolvedValue(undefined);
  const mockDeleteFn = vi.fn().mockResolvedValue(undefined);

  // Mock do componente de tabela simplificado
  const MockEntityTable = ({ entities, onEdit }: any) => (
    <div data-testid="mock-entity-table">
      <button data-testid="edit-button" onClick={() => onEdit(entities[0])}>
        Edit Entity
      </button>
    </div>
  );

  describe('Generic form with entity prop', () => {
    // Form mock que só aceita 'entity'
    const GenericForm = ({ entity, onSubmit, onCancel, isSubmitting }: any) => (
      <div data-testid="generic-form">
        {entity ? (
          <>
            <div data-testid="entity-name">{entity.name}</div>
            <div data-testid="entity-id">{entity.id}</div>
          </>
        ) : (
          <div data-testid="no-entity">No entity provided</div>
        )}
        <button data-testid="submit-button" onClick={() => onSubmit({})}>
          Submit
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );

    it('should work with generic form that uses entity prop', async () => {
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
          EntityForm={GenericForm}
          entityName={{
            singular: 'Test',
            plural: 'Tests',
            description: 'Test description',
          }}
          testIdPrefix="test"
        />
      );

      // Simula clicar no botão de edição
      const editButton = screen.getByTestId('edit-button');

      await editButton.click();

      // Verifica se o diálogo de edição foi aberto
      expect(screen.getByTestId('test-page-edit-dialog')).toBeInTheDocument();

      // Verifica se o formulário recebeu a entidade corretamente
      expect(screen.getByTestId('entity-name')).toHaveTextContent('Test Entity');
      expect(screen.getByTestId('entity-id')).toHaveTextContent('1');
    });
  });

  describe('Specific form with custom prop name', () => {
    // Form mock que espera uma prop específica 'application'
    const SpecificForm = ({ application, onSubmit, onCancel, isSubmitting }: any) => (
      <div data-testid="specific-form">
        {application ? (
          <>
            <div data-testid="application-name">{application.name}</div>
            <div data-testid="application-id">{application.id}</div>
          </>
        ) : (
          <div data-testid="no-application">No application provided</div>
        )}
        <button data-testid="submit-button" onClick={() => onSubmit({})}>
          Submit
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );

    it('should fail without entityPropName', async () => {
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
          EntityForm={SpecificForm}
          entityName={{
            singular: 'Test',
            plural: 'Tests',
            description: 'Test description',
          }}
          testIdPrefix="test"
        />
      );

      // Simula clicar no botão de edição
      const editButton = screen.getByTestId('edit-button');

      await editButton.click();

      // Verifica se o diálogo de edição foi aberto
      expect(screen.getByTestId('test-page-edit-dialog')).toBeInTheDocument();

      // Sem o entityPropName correto, o componente não recebe a prop específica esperada
      expect(screen.getByTestId('no-application')).toBeInTheDocument();
    });

    it('should work with correct entityPropName', async () => {
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
          EntityForm={SpecificForm}
          entityName={{
            singular: 'Test',
            plural: 'Tests',
            description: 'Test description',
          }}
          testIdPrefix="test"
          entityPropName="application"
        />
      );

      // Simula clicar no botão de edição
      const editButton = screen.getByTestId('edit-button');

      await editButton.click();

      // Verifica se o diálogo de edição foi aberto
      expect(screen.getByTestId('test-page-edit-dialog')).toBeInTheDocument();

      // Com entityPropName correto, o componente recebe a prop específica esperada
      expect(screen.getByTestId('application-name')).toHaveTextContent('Test Entity');
      expect(screen.getByTestId('application-id')).toHaveTextContent('1');
    });
  });

  describe('Multiple forms with different prop conventions', () => {
    // Form mock para aplicações
    const ApplicationForm = ({ application, onSubmit, onCancel, isSubmitting }: any) => (
      <div data-testid="application-form">
        {application ? (
          <div data-testid="application-data">{application.name}</div>
        ) : (
          <div data-testid="no-application">No application data</div>
        )}
      </div>
    );

    // Form mock para ambientes
    const EnvironmentForm = ({ environment, onSubmit, onCancel, isSubmitting }: any) => (
      <div data-testid="environment-form">
        {environment ? (
          <div data-testid="environment-data">{environment.name}</div>
        ) : (
          <div data-testid="no-environment">No environment data</div>
        )}
      </div>
    );

    it('should handle application form correctly', async () => {
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
          EntityForm={ApplicationForm}
          entityName={{
            singular: 'Aplicação',
            plural: 'Aplicações',
            description: 'Descrição',
          }}
          testIdPrefix="app"
          entityPropName="application"
        />
      );

      // Simula clicar no botão de edição
      const editButton = screen.getByTestId('edit-button');

      await editButton.click();

      // Verifica se os dados foram passados corretamente
      expect(screen.getByTestId('application-data')).toHaveTextContent('Test Entity');
    });

    it('should handle environment form correctly', async () => {
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
          EntityForm={EnvironmentForm}
          entityName={{
            singular: 'Ambiente',
            plural: 'Ambientes',
            description: 'Descrição',
          }}
          testIdPrefix="env"
          entityPropName="environment"
        />
      );

      // Simula clicar no botão de edição
      const editButton = screen.getByTestId('edit-button');

      await editButton.click();

      // Verifica se os dados foram passados corretamente
      expect(screen.getByTestId('environment-data')).toHaveTextContent('Test Entity');
    });
  });
});
