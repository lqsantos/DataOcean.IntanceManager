'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteBlueprintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  blueprintId: string;
  blueprintName: string;
}

export function DeleteBlueprintDialog({
  isOpen,
  onClose,
  onDelete,
  blueprintId,
  blueprintName,
}: DeleteBlueprintDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Blueprint</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o blueprint <strong>{blueprintName}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Este blueprint não poderá mais ser usado para criar
            instâncias.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
