'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

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

import { GoTemplateEditor } from './go-template-editor';
import type { ExpressionVariable } from './types';
import { expressionVariableSchema } from './types';
import { VariableModal } from './variable-modal';

interface ExpressionVariableModalProps {
  /** Initial variable data for editing */
  initialData?: ExpressionVariable;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when form is submitted */
  onSubmit: (data: ExpressionVariable) => void;
  /** Function to check if variable name is duplicate */
  isVariableNameDuplicate: (name: string, currentVariable?: ExpressionVariable) => boolean;
}

const defaultValues: ExpressionVariable = {
  name: '',
  type: 'expression',
  expression: '',
};

/**
 * Modal component for adding/editing Go Template expression variables
 */
export function ExpressionVariableModal({
  initialData,
  open,
  onOpenChange,
  onSubmit,
  isVariableNameDuplicate,
}: ExpressionVariableModalProps) {
  // Form
  const form = useForm<ExpressionVariable>({
    resolver: zodResolver(expressionVariableSchema),
    defaultValues,
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset(defaultValues);
    }
  }, [form, initialData]);

  // Form submission
  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>, data: ExpressionVariable) => {
    formEvent.preventDefault();
    formEvent.stopPropagation();
    onSubmit(data);
    onOpenChange(false);
    form.reset(defaultValues);
  };

  return (
    <VariableModal
      title={initialData ? 'Editar Expressão' : 'Nova Expressão'}
      description="Adicione uma variável com expressão Go Template ao seu blueprint."
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset(defaultValues);
        }
        onOpenChange(isOpen);
      }}
    >
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit((data) => handleSubmit(e, data))(e);
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (!isVariableNameDuplicate(value, initialData)) {
                        field.onChange(value);
                      }
                    }}
                    placeholder="vars_nome_expressao"
                  />
                </FormControl>
                <FormDescription>
                  Nome pode começar com &quot;vars_&quot; seguido por letras, números, _ ou -.
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
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>Uma breve descrição da variável.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expressão Go Template</FormLabel>
                <FormControl>
                  <GoTemplateEditor value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  Insira uma expressão Go Template. Use a documentação oficial do Go Template para
                  referência.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(defaultValues);
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Form>
    </VariableModal>
  );
}
