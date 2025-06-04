'use client';

import { Plus, RotateCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useState } from 'react';
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
import { useBlueprintStore } from '@/hooks/use-blueprints';

import { BlueprintCard } from './blueprint-card';
import { CreateBlueprintModal } from './create-blueprint-modal';
import { DeleteBlueprintDialog } from './delete-blueprint-dialog';

export function ResourceBlueprintsPage(): ReactElement {
  return (
    <CreateBlueprintProvider>
      <BlueprintsPageContent />
    </CreateBlueprintProvider>
  );
}

function BlueprintsPageContent(): ReactElement {
  const { t } = useTranslation('entityTable');
  const router = useRouter();
  const {
    blueprints,
    isLoading,
    error,
    deleteBlueprint,
    duplicateBlueprint,
    refreshBlueprints: refreshBlueprintsFromStore,
  } = useBlueprintStore();
  const { openModal } = useCreateBlueprint();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    blueprintId: string | null;
  }>({
    isOpen: false,
    blueprintId: null,
  });

  // Get unique categories from blueprints
  const categories = Array.from(
    new Set(
      blueprints
        .map((blueprint) => blueprint.category)
        .filter((category): category is string => category !== undefined)
    )
  );

  // Filter blueprints based on search query and category
  const filteredBlueprints = blueprints.filter((blueprint) => {
    const matchesSearch =
      blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blueprint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesCategory = categoryFilter === 'all' || blueprint.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const refreshBlueprints = async () => {
    setIsRefreshing(true);

    try {
      await refreshBlueprintsFromStore();
    } catch (err) {
      console.error('Error refreshing blueprints:', err);
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
    } catch (err) {
      console.error('Error duplicating blueprint:', err);
    }
  };

  const handleDeleteBlueprint = async () => {
    if (deleteDialogState.blueprintId) {
      try {
        await deleteBlueprint(deleteDialogState.blueprintId);
        setDeleteDialogState({ isOpen: false, blueprintId: null });
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
    <div data-testid="blueprints-page-container">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2 md:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
              data-testid="blueprints-search"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('searchPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('actions.view')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid" aria-label={t('actions.view')}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </TabsTrigger>
              <TabsTrigger value="list" aria-label={t('actions.view')}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={refreshBlueprints}
                  variant="outline"
                  size="icon"
                  disabled={isRefreshing || isLoading}
                  data-testid="reload-blueprints-button"
                  aria-label={t('actions.view')}
                >
                  <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('actions.view')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            onClick={handleCreateBlueprint}
            className="gap-2"
            data-testid="create-blueprint-button"
          >
            <Plus className="h-4 w-4" />
            {t('actions.view')}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[220px] rounded-lg border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted"></div>
                      <div className="mt-4 space-y-2">
                        <div className="h-3 w-full animate-pulse rounded-md bg-muted"></div>
                        <div className="h-3 w-full animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (error) {
            return (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="text-destructive">{t('emptyMessage')}</div>
                <p className="text-sm text-muted-foreground">{t('emptySearchMessage')}</p>
              </div>
            );
          }

          if (filteredBlueprints.length === 0) {
            return (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="text-muted-foreground">{t('emptyMessage')}</div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== 'all'
                    ? t('emptySearchMessage')
                    : t('emptyMessage')}
                </p>
              </div>
            );
          }

          return renderBlueprints();
        })()}
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
        onClose={closeDeleteDialog}
        onCreate={async () => {
          await refreshBlueprints();
        }}
      />
    </div>
  );
}
