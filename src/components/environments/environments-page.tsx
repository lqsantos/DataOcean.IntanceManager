'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEnvironments } from '@/hooks/use-environments';
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { AlertCircle, BarChart, Cloud, Plus, Server } from 'lucide-react';
import { useState } from 'react';
import { EnvironmentForm } from './environment-form';
import { EnvironmentsTable } from './environments-table';

export function EnvironmentsPage() {
  const {
    environments,
    isLoading,
    error,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Environments</h1>
          <p className="text-muted-foreground mt-1">Manage your deployment environments</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Environment
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Environments</CardTitle>
            <Server className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : environments.length}</div>
            <p className="text-muted-foreground text-xs">Across all regions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Instances</CardTitle>
            <Cloud className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-muted-foreground text-xs">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
            <BarChart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-muted-foreground text-xs">+2% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Environments</CardTitle>
          <CardDescription>Configure and organize your deployment environments.</CardDescription>
        </CardHeader>
        <CardContent>
          <EnvironmentsTable
            environments={environments}
            isLoading={isLoading}
            onEdit={setEnvironmentToEdit}
            onDelete={deleteEnvironment}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Environment</DialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Environment</DialogTitle>
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
