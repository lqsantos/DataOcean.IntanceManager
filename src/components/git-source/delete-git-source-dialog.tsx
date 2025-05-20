'use client';

import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { GitSource } from '@/types/git-source';

interface DeleteGitSourceDialogProps {
  gitSource: GitSource | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
}

export function DeleteGitSourceDialog({
  gitSource,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteGitSourceDialogProps) {
  if (!gitSource) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent data-testid="delete-git-source-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Fonte Git</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a fonte Git <strong>{gitSource.name}</strong>?
            <br />
            <span className="mt-2 block text-sm text-muted-foreground">
              Esta ação é irreversível e irá remover todos os dados associados.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isDeleting}
            data-testid="delete-git-source-cancel"
          >
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => onDelete(gitSource.id)}
            disabled={isDeleting}
            data-testid="delete-git-source-confirm"
          >
            {isDeleting && (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                data-testid="delete-git-source-loading"
              />
            )}
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
