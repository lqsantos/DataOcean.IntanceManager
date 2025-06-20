'use client';

import { PlusCircle, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityToEdit: any | null;
  onCreate: (data: any) => Promise<any>;
  onUpdate?: (id: string, data: any) => Promise<any>;
  onCreateSuccess?: (entity: any) => void;
  [key: string]: any;
}

interface EntityTableProps {
  entities: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  onEdit: (entity: any) => void;
  onDelete: (id: string) => Promise<void>;
  [key: string]: any;
}

interface GenericEntityPageProps {
  /**
   * Lista de entidades para exibir na tabela
   */
  entities: any[];

  /**
   * Estado de carregamento das entidades
   */
  isLoading: boolean;

  /**
   * Estado de atualização das entidades
   */
  isRefreshing: boolean;

  /**
   * Mensagem de erro, se houver
   */
  error: string | null;

  /**
   * Função para atualizar a lista de entidades
   */
  refreshEntities: () => Promise<void>;

  /**
   * Função para criar uma nova entidade
   */
  createEntity: (data: any) => Promise<any>;

  /**
   * Função para atualizar uma entidade existente
   */
  updateEntity?: (id: string, data: any) => Promise<any>;

  /**
   * Função para excluir uma entidade
   */
  deleteEntity: (id: string) => Promise<void>;

  /**
   * Componente de tabela para exibir as entidades
   */
  EntityTable: React.ComponentType<EntityTableProps>;

  /**
   * Componente de modal para criar/editar a entidade
   */
  EntityModal: React.ComponentType<EntityModalProps>;

  /**
   * Configurações específicas do modal
   */
  modalConfig?: {
    EntityForm: React.ComponentType<any>;
    entityName: {
      singular: string;
      createTitle?: string;
      editTitle?: string;
      createDescription?: string;
      editDescription?: string;
    };
    createIcon: any;
    editIcon?: any;
    testId?: string;
  };

  /**
   * Informações sobre o nome da entidade (singular e plural)
   */
  entityName: {
    singular: string;
    plural: string;
    description?: string;
  };

  /**
   * Estado do modal
   */
  modalState: {
    isOpen: boolean;
    entityToEdit: any | null;
    openModal: () => void;
    openEditModal: (entity: any) => void;
    closeModal: () => void;
  };

  /**
   * Prefixo para IDs de teste
   */
  testIdPrefix: string;

  /**
   * Propriedades adicionais para passar para o componente de tabela
   */
  tableProps?: Record<string, any>;

  /**
   * Propriedades adicionais para passar para o componente de modal
   */
  modalProps?: Record<string, any>;

  /**
   * Conteúdo de cabeçalho personalizado
   */
  customHeader?: ReactNode;
}

/**
 * Componente genérico para páginas de entidades
 * Reutiliza lógica comum entre diferentes páginas de entidades (Aplicações, Ambientes, Localidades, etc.)
 */
export function GenericEntityPage({
  entities,
  isLoading,
  isRefreshing,
  error,
  refreshEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  EntityTable,
  EntityModal,
  entityName,
  modalState,
  testIdPrefix,
  tableProps = {},
  modalProps = {},
  customHeader,
}: GenericEntityPageProps) {
  const { t } = useTranslation(['settings', 'common']);
  const pathname = usePathname();
  const isInSettings = pathname.includes('/settings');
  const { isOpen, entityToEdit, openModal, openEditModal, closeModal } = modalState;

  const handleEdit = (entity: any) => {
    openEditModal(entity);
  };

  return (
    <div className="flex flex-col gap-4" data-testid={`${testIdPrefix}-page`}>
      {/* Título e descrição da página */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium" data-testid={`${testIdPrefix}-page-title`}>
            {entityName.plural}
          </h2>
          {entityName.description && (
            <p
              className="text-xs text-muted-foreground"
              data-testid={`${testIdPrefix}-page-description`}
            >
              {entityName.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshEntities}
            disabled={isLoading || isRefreshing}
            data-testid={`${testIdPrefix}-page-refresh-button`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">{t('common:buttons.refresh')}</span>
          </Button>
          <Button
            onClick={openModal}
            className="gap-2"
            data-testid={`${testIdPrefix}-page-add-button`}
          >
            <PlusCircle className="h-4 w-4" />
            {t('common:buttons.add')}
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-md bg-destructive/10 p-4 text-destructive"
          data-testid={`${testIdPrefix}-page-error-alert`}
          data-error={error.toString()}
        >
          {error.toString()}
        </div>
      )}

      <div className="rounded-md border bg-card">
        <EntityTable
          entities={entities}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onEdit={handleEdit}
          onDelete={deleteEntity}
          data-testid={`${testIdPrefix}-table`}
          {...tableProps}
        />
      </div>

      <EntityModal
        isOpen={isOpen}
        onClose={closeModal}
        entityToEdit={entityToEdit}
        onCreate={createEntity}
        onUpdate={updateEntity}
        onCreateSuccess={refreshEntities}
        {...modalProps}
      />
    </div>
  );
}
