'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { EditBlueprintForm } from '@/components/resources/blueprints/edit-blueprint-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateBlueprintProvider } from '@/contexts/create-blueprint-context';
import { useBlueprintStore } from '@/hooks/use-blueprints';
import type { Blueprint } from '@/types/blueprint';

export default function BlueprintEditPage() {
  return (
    <CreateBlueprintProvider>
      <BlueprintEditPageContent />
    </CreateBlueprintProvider>
  );
}

function BlueprintEditPageContent() {
  const params = useParams();
  const router = useRouter();
  const { blueprints, isLoading: isLoadingBlueprints, updateBlueprint } = useBlueprintStore();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blueprintId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  useEffect(() => {
    if (!isLoadingBlueprints) {
      const foundBlueprint = blueprints.find((b) => b.id === blueprintId);

      if (foundBlueprint) {
        setBlueprint(foundBlueprint);
      } else {
        setError(`Blueprint com ID ${blueprintId} não encontrado.`);
      }
      setIsLoading(false);
    }
  }, [blueprintId, blueprints, isLoadingBlueprints]);

  const handleGoBack = () => {
    router.push('/resources/blueprints');
  };

  const handleSave = async (updatedData: Partial<Blueprint>) => {
    if (!blueprint) {
      return;
    }

    try {
      await updateBlueprint({
        id: blueprint.id,
        ...updatedData,
      });

      // Atualiza o estado local com as alterações
      setBlueprint((prev) => {
        if (!prev) {
          return null;
        }

        return {
          ...prev,
          ...updatedData,
        };
      });

      router.push('/resources/blueprints');
    } catch (err) {
      console.error('Erro ao atualizar blueprint:', err);
      setError('Falha ao salvar alterações no blueprint.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Erro</h1>
          </div>
        </div>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error || 'Blueprint não encontrado'}</p>
          <Button onClick={handleGoBack} variant="outline" className="mt-4">
            Voltar para Blueprints
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleGoBack} data-testid="go-back-button">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <h1 className="text-2xl font-semibold" data-testid="edit-blueprint-title">
            Editar Blueprint: {blueprint.name}
          </h1>
        </div>
      </div>

      <EditBlueprintForm blueprint={blueprint} onSave={handleSave} />
    </div>
  );
}
