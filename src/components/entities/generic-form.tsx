'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Form } from '@/components/ui/form';

interface GenericFormProps<TFormSchema extends z.ZodType> {
  schema: TFormSchema;
  defaultValues: z.infer<TFormSchema>;
  onSubmit: (values: z.infer<TFormSchema>) => void;
  children: ReactNode | ((form: ReturnType<typeof useForm>) => ReactNode);
  className?: string;
}

export function GenericForm<TFormSchema extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: GenericFormProps<TFormSchema>) {
  const form = useForm<z.infer<TFormSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function handleSubmit(values: z.infer<TFormSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={className}
        data-testid="generic-form"
      >
        {typeof children === 'function' ? children(form) : children}
      </form>
    </Form>
  );
}
