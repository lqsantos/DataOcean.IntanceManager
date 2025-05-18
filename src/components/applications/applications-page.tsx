// components/applications/applications-page.tsx
'use client';

import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApplications } from '@/hooks/use-applications';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

import { ApplicationForm } from './application-form';
import { ApplicationsTable } from './applications-table';

export function ApplicationsPage() {
  const {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [applicationToEdit, setApplicationToEdit] = useState<Application | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (data: CreateApplicationDto) => {
    setIsSubmitting(true);

    try {
      await createApplication(data);
      setIsCreateDialogOpen(false);
    } catch (_err) {
      // Explicitly mark the error as handled
      void _err;
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: UpdateApplicationDto) => {
    if (!applicationToEdit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateApplication(applicationToEdit.id, data);
      setApplicationToEdit(null);
    } catch (_err) {
      // Explicitly mark the error as handled
      void _err;
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in" data-testid="applications-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aplicações</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas aplicações</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshApplications}
            disabled={isRefreshing || isLoading}
            data-testid="applications-page-refresh-button"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Atualizar</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="applications-page-add-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Aplicação
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" data-testid="applications-page-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card data-testid="applications-page-card">
        <CardHeader>
          <CardTitle>Aplicações</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationsTable
            applications={applications}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onEdit={setApplicationToEdit}
            onDelete={deleteApplication}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="applications-page-create-dialog">
          <DialogHeader>
            <DialogTitle>Criar Aplicação</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!applicationToEdit}
        onOpenChange={(open) => !open && setApplicationToEdit(null)}
      >
        <DialogContent className="sm:max-w-[500px]" data-testid="applications-page-edit-dialog">
          <DialogHeader>
            <DialogTitle>Editar Aplicação</DialogTitle>
          </DialogHeader>
          {applicationToEdit && (
            <ApplicationForm
              application={applicationToEdit}
              onSubmit={handleEditSubmit}
              onCancel={() => setApplicationToEdit(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
