'use client';

import { Plus, RotateCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateBlueprintProvider, useCreateBlueprint } from '@/contexts/create-blueprint-context';
import { useApplications } from '@/hooks/use-applications';
import { useBlueprintStore } from '@/hooks/use-blueprints';

import { BlueprintCard } from './blueprint-card';
import { CreateBlueprintModal } from './create-blueprint-modal';
import { DeleteBlueprintDialog } from './delete-blueprint-dialog';

interface DeleteDialogState {
  isOpen: boolean;
  blueprintId: string | null;
}

const GridIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="7" x="3" y="3" />
    <rect width="7" height="7" x="14" y="3" />
    <rect width="7" height="7" x="14" y="14" />
    <rect width="7" height="7" x="3" y="14" />
  </svg>
);

const ListIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export function ResourceBlueprintsPage(): ReactElement {
  return (
    <CreateBlueprintProvider>
      <BlueprintsPageContent />
    </CreateBlueprintProvider>
  );
}

function BlueprintsPageContent(): ReactElement {
  const { t } = useTranslation(['entityTable', 'blueprints']);
  const router = useRouter();
  const {
    blueprints,
    isLoading,
    error,
    deleteBlueprint,
    duplicateBlueprint,
    refreshBlueprints: refreshBlueprintsFromStore,
  } = useBlueprintStore();
  const { openModal, closeModal } = useCreateBlueprint();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({
    isOpen: false,
    blueprintId: null,
  });

  // Use o hook de aplicações para obter a lista de aplicações e force o refresh
  const { applications, refreshApplications } = useApplications();

  // Certifica-se de carregar as aplicações quando a página é montada
  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  // Filter blueprints based on search query and application
  const filteredBlueprints = blueprints.filter((blueprint) => {
    const matchesSearch =
      blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blueprint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesApplication =
      applicationFilter === 'all' || blueprint.applicationId === applicationFilter;

    return matchesSearch && matchesApplication;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Atualizar tanto a lista de blueprints quanto a de aplicações
      await Promise.all([refreshBlueprintsFromStore(), refreshApplications()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateBlueprint = () => {
    openModal();
  };

  const handleEditBlueprint = (blueprintId: string) => {
    router.push(`/resources/blueprints/${blueprintId}`);
  };

  const handleDuplicateBlueprint = async (blueprintId: string) => {
    try {
      await duplicateBlueprint(blueprintId);
      await refreshBlueprintsFromStore();
    } catch (err) {
      console.error('Error duplicating blueprint:', err);
    }
  };

  const handleDeleteBlueprint = async () => {
    if (deleteDialogState.blueprintId) {
      try {
        await deleteBlueprint(deleteDialogState.blueprintId);
        setDeleteDialogState({ isOpen: false, blueprintId: null });
        await refreshBlueprintsFromStore();
      } catch (err) {
        console.error('Error deleting blueprint:', err);
      }
    }
  };

  const openDeleteDialog = (blueprintId: string) => {
    setDeleteDialogState({ isOpen: true, blueprintId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialogState({ isOpen: false, blueprintId: null });
  };

  const handleCreateInstance = (blueprintId: string) => {
    router.push(`/instances/new?blueprint=${blueprintId}`);
  };

  const renderSkeletonLoading = () => (
    <div
      className={
        viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
      }
    >
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="h-[200px] rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderBlueprints = () => (
    <div
      className={
        viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
      }
    >
      {filteredBlueprints.map((blueprint) => (
        <BlueprintCard
          key={blueprint.id}
          blueprint={blueprint}
          viewMode={viewMode}
          onEdit={() => handleEditBlueprint(blueprint.id)}
          onDuplicate={() => handleDuplicateBlueprint(blueprint.id)}
          onDelete={() => openDeleteDialog(blueprint.id)}
          onCreateInstance={() => handleCreateInstance(blueprint.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4" data-testid="blueprints-page">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('pageTitle', { ns: 'blueprints' })}
        </h1>
        <p className="text-muted-foreground">{t('description', { ns: 'blueprints' })}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2 md:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder', { ns: 'entityTable' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
              data-testid="blueprints-search"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={applicationFilter} onValueChange={setApplicationFilter}>
            <SelectTrigger className="w-[180px]" data-testid="application-filter-select">
              <SelectValue
                placeholder={t('createBlueprint.fields.applicationId.label', { ns: 'blueprints' })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('createBlueprint.fields.applicationId.all', { ns: 'blueprints' })}
              </SelectItem>
              {applications.map((application) => (
                <SelectItem key={application.id} value={application.id}>
                  {application.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
            <TabsList>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="grid" aria-label={t('viewMode.grid', { ns: 'blueprints' })}>
                      <GridIcon />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t('viewMode.grid', { ns: 'blueprints' })}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="list" aria-label={t('viewMode.list', { ns: 'blueprints' })}>
                      <ListIcon />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t('viewMode.list', { ns: 'blueprints' })}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>
          </Tabs>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  data-testid="reload-blueprints-button"
                  aria-label={t('actions.refresh', { ns: 'blueprints' })}
                >
                  <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('actions.refresh', { ns: 'blueprints' })}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            onClick={handleCreateBlueprint}
            className="gap-2"
            data-testid="create-blueprint-button"
          >
            <Plus className="h-4 w-4" />
            {t('createBlueprint.title', { ns: 'blueprints' })}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && renderSkeletonLoading()}
        {error && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="text-destructive">{t('emptyMessage', { ns: 'entityTable' })}</div>
            <p className="text-sm text-muted-foreground">
              {t('emptySearchMessage', { ns: 'entityTable' })}
            </p>
          </div>
        )}
        {!isLoading && !error && filteredBlueprints.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="text-muted-foreground">{t('emptyMessage', { ns: 'entityTable' })}</div>
            <p className="text-sm text-muted-foreground">
              {searchQuery || applicationFilter !== 'all'
                ? t('emptySearchMessage', { ns: 'entityTable' })
                : t('emptyMessage', { ns: 'entityTable' })}
            </p>
          </div>
        )}
        {!isLoading && !error && filteredBlueprints.length > 0 && renderBlueprints()}
      </div>

      {deleteDialogState.isOpen && (
        <DeleteBlueprintDialog
          isOpen={deleteDialogState.isOpen}
          onClose={closeDeleteDialog}
          onDelete={handleDeleteBlueprint}
          blueprintId={deleteDialogState.blueprintId || ''}
          blueprintName={
            blueprints.find((b) => b.id === deleteDialogState.blueprintId)?.name || 'Blueprint'
          }
        />
      )}

      <CreateBlueprintModal
        isOpen={false}
        onClose={closeModal}
        onCreate={async (blueprint) => {
          // Atualizar a lista de blueprints
          await refreshBlueprintsFromStore();
          // Atualizar a lista de aplicações para garantir que os nomes sejam exibidos corretamente
          await refreshApplications();
        }}
      />
    </div>
  );
}
