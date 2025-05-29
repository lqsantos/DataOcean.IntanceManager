'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTemplateModal } from '@/contexts/create-template-modal-context';

// Define schema for form validation
const templateFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Nome deve ter pelo menos 3 caracteres',
  }),
  description: z.string().optional(),
  category: z.string().min(1, {
    message: 'Categoria é obrigatória',
  }),
  repositoryUrl: z.string().url({
    message: 'URL do repositório deve ser uma URL válida',
  }),
  chartPath: z.string().min(1, {
    message: 'Caminho do chart é obrigatório',
  }),
  version: z.string().optional(),
  isActive: z.boolean().default(true),
  valuesYaml: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export function CreateTemplateModal() {
  const { isOpen, isLoading, closeModal, createTemplate } = useCreateTemplateModal();

  // Initialize form
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      repositoryUrl: 'https://github.com/',
      chartPath: '',
      version: '1.0.0',
      isActive: true,
      valuesYaml: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: '',
        description: '',
        category: '',
        repositoryUrl: 'https://github.com/',
        chartPath: '',
        version: '1.0.0',
        isActive: true,
        valuesYaml: '',
      });
    }
  }, [isOpen, form]);

  // Form submission handler
  const handleSubmit = async (values: TemplateFormValues) => {
    await createTemplate(values);
  };

  // Predefined template categories
  const templateCategories = [
    'Application',
    'Infrastructure',
    'Database',
    'Monitoring',
    'Security',
    'Storage',
    'Other',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Template</DialogTitle>
          <DialogDescription>
            Crie um novo template Helm para padronização de implantações
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do template"
                        {...field}
                        data-testid="template-name-input"
                      />
                    </FormControl>
                    <FormDescription>Nome único para identificar este template.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templateCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Categoria para organização dos templates.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição detalhada do template" {...field} />
                  </FormControl>
                  <FormDescription>Informações adicionais sobre este template.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Repositório</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/organization/repo.git" {...field} />
                    </FormControl>
                    <FormDescription>URL do repositório Git contendo o chart Helm.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chartPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caminho do Chart</FormLabel>
                    <FormControl>
                      <Input placeholder="charts/my-chart" {...field} />
                    </FormControl>
                    <FormDescription>
                      Caminho relativo ao chart dentro do repositório.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>Versão do template.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                      <FormDescription>Ativar ou desativar este template.</FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-readonly={field.disabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="valuesYaml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Values YAML (Padrão)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="# Valores YAML padrão para o chart\nreplicas: 1\nimage:\n  repository: nginx\n  tag: latest"
                      className="h-[200px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Valores padrão do chart em formato YAML.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
