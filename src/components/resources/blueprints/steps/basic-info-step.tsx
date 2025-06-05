'use client';

import { Code, FileText } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApplications } from '@/hooks/use-applications';

import type { FormValues } from '../types';

interface BasicInfoStepProps {
  /** Form object from useForm */
  form: UseFormReturn<FormValues>;
}

/**
 * First step in blueprint form to collect basic info
 */
export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const { applications } = useApplications();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Informações Gerais</h2>
        <p className="text-sm text-muted-foreground">Defina as informações básicas do blueprint.</p>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required-field">Nome do Blueprint</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: E-commerce Platform"
                {...field}
                data-testid="blueprint-name-input"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required-field">Aplicação</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Adicionar log para debug
                console.warn('Application selected:', value);
              }}
              defaultValue={field.value}
              value={field.value} // Adicionar o value explicitamente
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma aplicação" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {applications?.map((app: { id: string; name: string }) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Selecione a aplicação à qual este blueprint pertence.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="required-field">Descrição</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                  className="h-7 gap-1 text-xs"
                >
                  {showMarkdownPreview ? (
                    <Code className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  {showMarkdownPreview ? 'Editar' : 'Preview'}
                </Button>
              </div>
              <FormControl>
                {showMarkdownPreview ? (
                  <div className="min-h-[150px] rounded-md border bg-muted/30 p-3">
                    <MarkdownPreview content={field.value || '*Sem descrição*'} />
                  </div>
                ) : (
                  <Textarea
                    placeholder="Descrição detalhada do blueprint (suporta markdown)"
                    {...field}
                    rows={5}
                    data-testid="blueprint-description-input"
                  />
                )}
              </FormControl>
              <FormDescription>
                Descreva o propósito e uso deste blueprint. Suporta formatação Markdown.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
