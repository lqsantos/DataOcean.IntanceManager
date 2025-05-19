'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export interface EntityPageProps<T, CreateDto, UpdateDto> {
  // Dados e estado
  entities: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string | null;

  // Funções de ação
  refreshEntities: () => Promise<void>;
  createEntity: (data: CreateDto) => Promise<any>;
  updateEntity: (id: string, data: UpdateDto) => Promise<any>;
  deleteEntity: (id: string) => Promise<void>;

  // Componentes específicos da entidade
  EntityTable: React.ComponentType<any>;
  EntityForm: React.ComponentType<{
    entity?: T;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    [key: string]: any;
  }>;

  // Textos e tradução
  entityName: {
    singular: string;
    plural: string;
    description: string;
  };

  // IDs para testes
  testIdPrefix: string;

  // Props opcionais adicionais
  formProps?: Record<string, any>;
  tableProps?: Record<string, any>;

  // Nome da propriedade esperada pelo formulário específico
  entityPropName?: string;
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
}: EntityPageProps<T, CreateDto, UpdateDto>) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (data: CreateDto) => {
    setIsSubmitting(true);
    try {
      await createEntity(data);
      setIsCreateDialogOpen(false);
    } catch (_err) {
      // Error is already handled in the hook
      void _err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: UpdateDto) => {
    if (!entityToEdit) {
      return;
    }
    setIsSubmitting(true);
    try {
      await updateEntity(entityToEdit.id, data);
      setEntityToEdit(null);
    } catch (_err) {
      // Error is already handled in the hook
      void _err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cria as props específicas para o formulário de edição
  // Distribui a entidade sob múltiplos nomes de propriedade
  const entityTypeFormProps = entityToEdit
    ? {
        // Sempre fornece com o nome genérico 'entity' para compatibilidade
        entity: entityToEdit,
        // Se um nome específico for fornecido, também passa sob esse nome
        ...(entityPropName ? { [entityPropName]: entityToEdit } : {}),
      }
    : {};

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
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid={`${testIdPrefix}-page-add-button`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar {entityName.singular}
          </Button>
        </div>
      </div>

      {error && (
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
            entities={entities}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onEdit={setEntityToEdit}
            onDelete={deleteEntity}
            {...tableProps}
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
