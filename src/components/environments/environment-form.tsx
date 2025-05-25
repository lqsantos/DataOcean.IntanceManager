// components/environments/environment-form.tsx
'use client';

import { InputAdapter } from '@/components/form/form-adapters';
import { FormBuilder } from '@/components/form/form-builder';
import type { FormErrors } from '@/hooks/use-form-state';
import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

interface EnvironmentFormProps {
  environment?: Environment;
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EnvironmentForm({
  environment,
  onSubmit,
  onCancel,
  isSubmitting,
}: EnvironmentFormProps) {
  // Validação de formulário
  const validateForm = (values: Partial<Environment>): FormErrors<Partial<Environment>> => {
    const errors: FormErrors<Partial<Environment>> = {};

    if (!values.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (values.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (values.name.length > 50) {
      errors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    if (!values.slug?.trim()) {
      errors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    } else if (values.slug.length < 2) {
      errors.slug = 'Slug deve ter pelo menos 2 caracteres';
    } else if (values.slug.length > 30) {
      errors.slug = 'Slug deve ter no máximo 30 caracteres';
    }

    if (values.order !== undefined) {
      const orderValue = Number(values.order);

      if (isNaN(orderValue)) {
        errors.order = 'Ordem deve ser um número';
      } else if (orderValue < 0) {
        errors.order = 'Ordem deve ser um número positivo';
      }
    }

    return errors;
  };

  // Valor inicial do formulário
  const initialValues = {
    name: environment?.name || '',
    slug: environment?.slug || '',
    order: environment?.order?.toString() || '',
  };

  // Campos do formulário
  const fields = [
    {
      name: 'name' as const,
      label: 'Nome',
      required: true,
      component: InputAdapter,
      placeholder: 'ex: Desenvolvimento',
    },
    {
      name: 'slug' as const,
      label: 'Slug',
      required: true,
      component: InputAdapter,
      placeholder: 'ex: dev',
      helpText:
        'Usado em URLs e requisições de API. Use apenas letras minúsculas, números e hífens.',
    },
    {
      name: 'order' as const,
      label: 'Ordem',
      component: (props: any) => InputAdapter({ ...props, type: 'number' }),
      placeholder: 'ex: 1',
      helpText: 'Determina a ordem de exibição dos ambientes.',
    },
  ];

  return (
    <FormBuilder
      initialValues={initialValues}
      fields={fields}
      validator={validateForm}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isSubmitting}
      submitLabel={environment ? 'Atualizar' : 'Criar'}
      cancelLabel="Cancelar"
      testId="environment-form"
      transform={{
        slug: (value) => value.toLowerCase(),
      }}
      derivedFields={{
        slug: {
          dependsOn: ['name'],
          compute: (values) => {
            return values.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
          },
          skipIfTouched: true,
        },
      }}
    />
  );
}
