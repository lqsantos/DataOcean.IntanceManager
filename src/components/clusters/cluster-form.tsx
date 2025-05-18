// components/clusters/cluster-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocations } from '@/hooks/use-locations';
import type { Cluster, CreateClusterDto, UpdateClusterDto } from '@/types/cluster';

// Schema for form validation
const clusterFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  slug: z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(100, 'Slug deve ter no máximo 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  locationIds: z.array(z.string()).min(1, 'Selecione pelo menos uma localidade'),
});

interface ClusterFormProps {
  cluster?: Cluster;
  onSubmit: (data: CreateClusterDto | UpdateClusterDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ClusterForm({ cluster, onSubmit, onCancel, isSubmitting }: ClusterFormProps) {
  const { locations, isLoading: isLoadingLocations } = useLocations();

  // Set up form with default values
  const form = useForm<z.infer<typeof clusterFormSchema>>({
    resolver: zodResolver(clusterFormSchema),
    defaultValues: {
      name: cluster?.name || '',
      slug: cluster?.slug || '',
      locationIds: cluster?.locationIds || [],
    },
  });

  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof clusterFormSchema>) => {
    await onSubmit(data);
  };

  // Toggle a location selection
  const toggleLocation = (locationId: string, currentSelectedIds: string[]) => {
    if (currentSelectedIds.includes(locationId)) {
      return currentSelectedIds.filter((id) => id !== locationId);
    } else {
      return [...currentSelectedIds, locationId];
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid="cluster-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Meu Cluster" {...field} data-testid="cluster-form-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="meu-cluster" {...field} data-testid="cluster-form-slug" />
              </FormControl>
              <FormDescription>
                Identificador único para o cluster, usado em URLs e integrações
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localidades</FormLabel>
              <FormDescription className="mb-2">
                Selecione as localidades onde este cluster está disponível
              </FormDescription>
              <div className="mt-2">
                <ScrollArea className="h-[200px] rounded-md border px-1">
                  {isLoadingLocations ? (
                    <div className="flex h-24 items-center justify-center">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      Nenhuma localidade disponível
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {locations.map((location) => (
                        <div 
                          key={location.id} 
                          className="flex items-center space-x-2 rounded-md border border-transparent p-2 hover:border-muted-foreground/20 hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`location-${location.id}`}
                            checked={field.value.includes(location.id)}
                            onCheckedChange={() => {
                              const updatedIds = toggleLocation(location.id, field.value);

                              field.onChange(updatedIds);
                            }}
                            data-testid={`location-checkbox-${location.id}`}
                            className="h-5 w-5"
                          />
                          <label
                            htmlFor={`location-${location.id}`}
                            className="flex flex-1 cursor-pointer items-center justify-between"
                          >
                            <span className="text-base">{location.name}</span>
                            {location.region && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                {location.region}
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="cluster-form-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingLocations}
            data-testid="cluster-form-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {cluster ? 'Salvando...' : 'Criando...'}
              </>
            ) : cluster ? (
              'Salvar'
            ) : (
              'Criar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
