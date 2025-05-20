'use client';

import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePATModal } from '@/contexts/pat-modal-context';
import { useGitSource } from '@/hooks/use-git-source';
import type { CreateGitSourceDto, GitSource, UpdateGitSourceDto } from '@/types/git-source';

import { DeleteGitSourceDialog } from './delete-git-source-dialog';
import { GitSourceCard } from './git-source-card';
import { GitSourceForm } from './git-source-form';

export function GitSourcePage() {
  const {
    gitSource,
    isLoading,
    isRefreshing,
    error,
    refreshGitSource,
    createGitSource,
    updateGitSource,
    activateGitSource,
    deactivateGitSource,
    deleteGitSource,
  } = useGitSource();

  // Obter acesso ao modal de PAT
  const { status: patStatus, open: openPatModal } = usePATModal();

  // Estados locais para controle da UI
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentGitSource, setCurrentGitSource] = useState<GitSource | null>(null);

  // Manipuladores para abrir diálogos
  const openCreateDialog = () => {
    // Abrir o diálogo de criação diretamente, sem verificar o PAT
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => setIsCreateDialogOpen(false);

  const openEditDialog = (source: GitSource) => {
    setCurrentGitSource(source);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentGitSource(null);
  };

  const openDeleteDialog = (source: GitSource) => {
    setCurrentGitSource(source);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => setIsDeleteDialogOpen(false);

  // Manipulador para criar uma nova fonte Git
  const handleCreate = async (data: CreateGitSourceDto) => {
    try {
      setIsSubmitting(true);
      await createGitSource(data);
      toast.success('Fonte Git criada com sucesso!');
      closeCreateDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar fonte Git');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador para editar uma fonte Git existente
  const handleEdit = async (data: UpdateGitSourceDto) => {
    if (!currentGitSource) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateGitSource(currentGitSource.id, data);
      toast.success('Fonte Git atualizada com sucesso!');
      closeEditDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar fonte Git');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador para alternar o status de uma fonte Git
  const handleToggleStatus = async (source: GitSource) => {
    try {
      if (source.status === 'active') {
        await deactivateGitSource(source.id);
        toast.success('Fonte Git desativada com sucesso!');
      } else {
        await activateGitSource(source.id);
        toast.success('Fonte Git ativada com sucesso!');
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Erro ao ${source.status === 'active' ? 'desativar' : 'ativar'} fonte Git`
      );
    }
  };

  // Manipulador para excluir uma fonte Git
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteGitSource(id);
      toast.success('Fonte Git excluída com sucesso!');
      closeDeleteDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir fonte Git');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-6" data-testid="git-source-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fontes Git</h1>
          <p className="text-muted-foreground">
            Gerencie suas fontes de código para integração com repositórios Git
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshGitSource}
            disabled={isLoading || isRefreshing}
            data-testid="git-source-refresh-button"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            onClick={openCreateDialog}
            disabled={!!gitSource || isLoading}
            data-testid="git-source-create-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Fonte Git
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-center text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Carregando fonte Git...</p>
          </div>
        </div>
      ) : gitSource ? (
        <GitSourceCard
          gitSource={gitSource}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <h3 className="mb-1 text-lg font-medium">Nenhuma fonte Git configurada</h3>
          <p className="mb-4 text-muted-foreground">
            Adicione uma fonte Git para começar a integrar seus repositórios.
          </p>
          <Button onClick={openCreateDialog} data-testid="git-source-empty-create-button">
            <Plus className="mr-2 h-4 w-4" />
            Nova Fonte Git
          </Button>
        </div>
      )}

      {/* Diálogo de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
          data-testid="git-source-create-dialog"
        >
          <DialogHeader>
            <DialogTitle>Nova Fonte Git</DialogTitle>
            <DialogDescription>
              Configure uma nova fonte Git para integrar com repositórios.
              <br />
              <span className="text-yellow-500">
                Nota: Apenas uma fonte Git pode existir ao mesmo tempo.
              </span>
            </DialogDescription>
          </DialogHeader>

          <GitSourceForm
            onSubmit={handleCreate}
            onCancel={closeCreateDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
          data-testid="git-source-edit-dialog"
        >
          <DialogHeader>
            <DialogTitle>Editar Fonte Git</DialogTitle>
            <DialogDescription>Atualize as configurações da sua fonte Git.</DialogDescription>
          </DialogHeader>

          <GitSourceForm
            gitSource={currentGitSource}
            onSubmit={handleEdit}
            onCancel={closeEditDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de Exclusão */}
      <DeleteGitSourceDialog
        gitSource={currentGitSource}
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
