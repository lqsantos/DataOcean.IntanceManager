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
import type { Location } from '@/types/location';

interface DeleteLocationDialogProps {
  location: Location | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteLocationDialog({
  location,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteLocationDialogProps) {
  if (!location) {return null;}

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Localidade</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a localidade{' '}
            <span className="font-semibold">{location.name}</span>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
