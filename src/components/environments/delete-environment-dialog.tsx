// components/environments/delete-environment-dialog.tsx
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
import { Environment } from '@/types/environment';
import { Loader2 } from 'lucide-react';

interface DeleteEnvironmentDialogProps {
  environment: Environment | null;
  isOpen: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteEnvironmentDialog({
  environment,
  isOpen,
  isDeleting,
  onDelete,
  onCancel,
}: DeleteEnvironmentDialogProps) {
  if (!environment) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Environment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the{' '}
            <span className="font-semibold">{environment.name}</span> environment? This action
            cannot be undone and may affect instances deployed to this environment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
