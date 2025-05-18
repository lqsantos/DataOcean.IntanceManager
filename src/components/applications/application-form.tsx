// components/applications/application-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

// Schema for form validation
const applicationFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  slug: z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(100, 'Slug deve ter no máximo 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
});

interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: CreateApplicationDto | UpdateApplicationDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ApplicationForm({
  application,
  onSubmit,
  onCancel,
  isSubmitting,
}: ApplicationFormProps) {
  // Set up form with default values
  const form = useForm<z.infer<typeof applicationFormSchema>>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: application?.name || '',
      slug: application?.slug || '',
      description: application?.description || '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof applicationFormSchema>) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        data-testid="application-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Minha Aplicação"
                  {...field}
                  data-testid="application-form-name"
                />
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
                <Input
                  placeholder="minha-aplicacao"
                  {...field}
                  data-testid="application-form-slug"
                />
              </FormControl>
              <FormDescription>
                Identificador único para a aplicação, usado em URLs e integrações
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição da aplicação"
                  className="resize-none"
                  {...field}
                  data-testid="application-form-description"
                />
              </FormControl>
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
            data-testid="application-form-cancel"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="application-form-submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {application ? 'Salvando...' : 'Criando...'}
              </>
            ) : application ? (
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
