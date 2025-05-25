// components/applications/application-form.tsx
'use client';

import { InputAdapter, TextareaAdapter } from '@/components/form/form-adapters';
import { FormBuilder } from '@/components/form/form-builder';
import type { FormErrors } from '@/hooks/use-form-state';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

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
  // Validação de formulário
  const validateForm = (values: Partial<Application>): FormErrors<Partial<Application>> => {
    const errors: FormErrors<Partial<Application>> = {};

    if (!values.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (values.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!values.slug?.trim()) {
      errors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    if (values.description && values.description.length > 500) {
      errors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    return errors;
  };

  // Valor inicial do formulário
  const initialValues = {
    name: application?.name || '',
    slug: application?.slug || '',
    description: application?.description || '',
  };

  // Campos do formulário
  const fields = [
    {
      name: 'name' as const,
      label: 'Nome',
      required: true,
      component: InputAdapter,
      placeholder: 'Nome da aplicação',
    },
    {
      name: 'slug' as const,
      label: 'Slug',
      required: true,
      component: InputAdapter,
      placeholder: 'identificador-único',
      helpText: 'Identificador único usado em URLs. Apenas letras minúsculas, números e hífens.',
    },
    {
      name: 'description' as const,
      label: 'Descrição',
      component: TextareaAdapter,
      placeholder: 'Descrição da aplicação (opcional)',
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
      submitLabel={application ? 'Salvar' : 'Criar'}
      cancelLabel="Cancelar"
      testId="application-form"
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
