'use client';

import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface EntityPageProps<T, CreateDto, UpdateDto> {
  // Dados e estado
  entities: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string | null;

  // Funções de ação
  refreshEntities: () => Promise<void>;
  createEntity: (data: CreateDto) => Promise<T>;
  updateEntity: (id: string, data: UpdateDto) => Promise<T>;
  deleteEntity: (id: string) => Promise<void>;

  // Componentes específicos da entidade
  EntityTable: React.ComponentType<{
    entities: T[];
    isLoading: boolean;
    isRefreshing: boolean;
    onEdit: (id: string) => T | undefined;
    onDelete: (id: string) => Promise<void>;
    [key: string]: unknown;
  }>;
  EntityForm: React.ComponentType<{
    onSubmit: (data: CreateDto | UpdateDto) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    [key: string]: unknown;
  }>;

  // Textos e tradução
  entityName: {
    singular: string;
    plural: string;
    description: string;
  };

  // IDs para testes
  testIdPrefix: string;

  // Props opcionais
  formProps?: Record<string, unknown>;
  tableProps?: Record<string, unknown>;

  // Nome da propriedade esperada pelo formulário específico
  entityPropName?: string;

  // Ação personalizada para o cabeçalho
  customHeaderAction?: React.ReactNode;

  // Esconder o botão de criação padrão
  hideCreateButton?: boolean;
}

export function EntityPage<T extends { id: string }, CreateDto, UpdateDto>({
  // Dados e estado
  entities,
  isLoading,
  isRefreshing,
  error,

  // Funções de ação
  refreshEntities,
  createEntity,
  updateEntity,
  deleteEntity,

  // Componentes específicos da entidade
  EntityTable,
  EntityForm,

  // Textos e tradução
  entityName,

  // IDs para testes
  testIdPrefix,

  // Props opcionais
  formProps = {},
  tableProps = {},

  // Nome da propriedade do formulário (ex: 'application', 'environment', etc.)
  // Se não for fornecido, usa 'entity' como padrão
  entityPropName,

  // Ação personalizada para o cabeçalho
  customHeaderAction,

  // Esconder o botão de criação padrão
  hideCreateButton = false,
}: EntityPageProps<T, CreateDto, UpdateDto>) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log para debug
  console.warn('🔍 EntityPage - Render', {
    entityToEditId: entityToEdit?.id,
    entityToEditObject: entityToEdit,
    entityPropName,
  });

  const handleCreateSubmit = useCallback(
    async (data: CreateDto | UpdateDto) => {
      setIsSubmitting(true);

      try {
        await createEntity(data as CreateDto);
        setIsCreateDialogOpen(false);
      } catch (_err) {
        // Error is already handled in the hook
        void _err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createEntity]
  );

  const handleEditSubmit = useCallback(
    async (data: CreateDto | UpdateDto) => {
      if (!entityToEdit) {
        return;
      }

      setIsSubmitting(true);

      try {
        await updateEntity(entityToEdit.id, data as UpdateDto);
        setEntityToEdit(null);
      } catch (_err) {
        // Error is already handled in the hook
        void _err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityToEdit, updateEntity]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const entity = entities.find((e) => e.id === id);

      setEntityToEdit(entity || null);

      return entity;
    },
    [entities]
  );

  // Cria as props específicas para o formulário de edição
  const entityTypeFormProps = entityToEdit
    ? {
        // Sempre fornece com o nome genérico 'entity' para compatibilidade
        entity: entityToEdit,
        // Se um nome específico for fornecido, também passa sob esse nome
        ...(entityPropName ? { [entityPropName]: entityToEdit } : {}),
      }
    : {};

  console.warn('🔍 Form props:', { entityTypeFormProps, formProps });

  return (
    <div className="space-y-6 animate-in" data-testid={`${testIdPrefix}-page`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{entityName.plural}</h1>
          <p className="mt-1 text-muted-foreground">{entityName.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshEntities}
            disabled={isRefreshing || isLoading}
            data-testid={`${testIdPrefix}-page-refresh-button`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Atualizar</span>
          </Button>
          {customHeaderAction ||
            (!hideCreateButton && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                data-testid={`${testIdPrefix}-page-add-button`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar {entityName.singular}
              </Button>
            ))}
        </div>
      </div>

      {error && error.trim() !== '' && (
        <Alert variant="destructive" data-testid={`${testIdPrefix}-page-error-alert`}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card data-testid={`${testIdPrefix}-page-card`}>
        <CardHeader>
          <CardTitle>{entityName.plural}</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityTable
            {...tableProps}
            entities={entities}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onEdit={handleEdit}
            onDelete={deleteEntity}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent
          className="sm:max-w-[500px]"
          data-testid={`${testIdPrefix}-page-create-dialog`}
        >
          <DialogHeader>
            <DialogTitle>Criar {entityName.singular}</DialogTitle>
          </DialogHeader>
          <EntityForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
            {...formProps}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!entityToEdit} onOpenChange={(open) => !open && setEntityToEdit(null)}>
        <DialogContent
          className="sm:max-w-[500px]"
          data-testid={`${testIdPrefix}-page-edit-dialog`}
        >
          <DialogHeader>
            <DialogTitle>Editar {entityName.singular}</DialogTitle>
          </DialogHeader>
          {entityToEdit && (
            <EntityForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEntityToEdit(null)}
              isSubmitting={isSubmitting}
              {...entityTypeFormProps}
              {...formProps}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
