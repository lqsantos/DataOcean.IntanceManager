'use client';

import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useGitSourceModal, usePATModal } from '@/contexts/modal-manager-context';
import { useGitSource } from '@/hooks/use-git-source';
import type { GitSource } from '@/types/git-source';

import { CreateGitSourceModal } from './create-git-source-modal';
import { DeleteGitSourceDialog } from './delete-git-source-dialog';
import { GitSourceCard } from './git-source-card';

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

  const { status: patStatus, open: openPatModal } = usePATModal();
  const { isOpen, gitSourceToEdit, openModal, openEditModal, closeModal } = useGitSourceModal();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentGitSource, setCurrentGitSource] = useState<GitSource | null>(null);

  const openDeleteDialog = (source: GitSource) => {
    setCurrentGitSource(source);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => setIsDeleteDialogOpen(false);

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

  const handleEdit = (source: GitSource) => {
    openEditModal(source);
  };

  return (
    <div className="container mx-auto py-6" data-testid="git-source-page">
      <div className="mb-6 flex items-center justify-end">
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
            onClick={openModal}
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
          onEdit={handleEdit}
          onDelete={openDeleteDialog}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <Button onClick={openModal} data-testid="git-source-empty-create-button">
            <Plus className="mr-2 h-4 w-4" />
            Nova Fonte Git
          </Button>
        </div>
      )}

      <CreateGitSourceModal
        isOpen={isOpen}
        onClose={closeModal}
        createGitSource={createGitSource}
        updateGitSource={updateGitSource}
        gitSourceToEdit={gitSourceToEdit}
        onCreateSuccess={refreshGitSource}
      />

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
