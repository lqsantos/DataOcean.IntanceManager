// components/environments/environments-page.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEnvironments } from '@/hooks/use-environments';
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { EnvironmentForm } from './environment-form';
import { EnvironmentsTable } from './environments-table';

export function EnvironmentsPage() {
  const {
    environments,
    isLoading,
    isRefreshing,
    error,
    refreshEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useEnvironments();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [environmentToEdit, setEnvironmentToEdit] = useState<Environment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (data: CreateEnvironmentDto) => {
    setIsSubmitting(true);
    try {
      await createEnvironment(data);
      setIsCreateDialogOpen(false);
    } catch (err) {
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: UpdateEnvironmentDto) => {
    if (!environmentToEdit) return;

    setIsSubmitting(true);
    try {
      await updateEnvironment(environmentToEdit.id, data);
      setEnvironmentToEdit(null);
    } catch (err) {
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ambientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus ambientes de implantação</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshEnvironments}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Atualizar</span>
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Ambiente
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ambientes</CardTitle>
        </CardHeader>
        <CardContent>
          <EnvironmentsTable
            environments={environments}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onEdit={setEnvironmentToEdit}
            onDelete={deleteEnvironment}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Ambiente</DialogTitle>
          </DialogHeader>
          <EnvironmentForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!environmentToEdit}
        onOpenChange={(open) => !open && setEnvironmentToEdit(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Ambiente</DialogTitle>
          </DialogHeader>
          {environmentToEdit && (
            <EnvironmentForm
              environment={environmentToEdit}
              onSubmit={handleEditSubmit}
              onCancel={() => setEnvironmentToEdit(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
