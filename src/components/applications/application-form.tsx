// components/applications/application-form.tsx
'use client';

import { useTranslation } from 'react-i18next';

import { InputAdapter, TextareaAdapter } from '@/components/form/form-adapters';
import { FormBuilder } from '@/components/form/form-builder';
import type { FormErrors } from '@/hooks/use-form-state';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

interface ApplicationFormProps {
  application?: Application;
  entity?: Application; // Adicionar suporte para a prop genérica
  onSubmit: (data: CreateApplicationDto | UpdateApplicationDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ApplicationForm({
  application,
  entity,
  onSubmit,
  onCancel,
  isSubmitting,
}: ApplicationFormProps) {
  const { t } = useTranslation(['settings', 'common']);

  // Usar entity se fornecido, senão usar application (compatibilidade com código existente)
  const currentApplication = entity || application;

  // Validação de formulário
  const validateForm = (values: Partial<Application>): FormErrors<Partial<Application>> => {
    const errors: FormErrors<Partial<Application>> = {};

    if (!values.name?.trim()) {
      errors.name = t('common:messages.requiredField');
    } else if (values.name.length < 2) {
      errors.name = t('common:messages.minLength', { count: 2 });
    }

    if (!values.slug?.trim()) {
      errors.slug = t('common:messages.requiredField');
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = t('common:form.errors.invalidSlug');
    }

    if (values.description && values.description.length > 500) {
      errors.description = t('common:messages.maxLength', { count: 500 });
    }

    return errors;
  };

  // Valor inicial do formulário
  const initialValues = {
    name: currentApplication?.name || '',
    slug: currentApplication?.slug || '',
    description: currentApplication?.description || '',
  };

  // Campos do formulário
  const fields = [
    {
      name: 'name' as const,
      label: t('applications.modal.form.name.label'),
      required: true,
      component: InputAdapter,
      placeholder: t('applications.modal.form.name.placeholder'),
    },
    {
      name: 'slug' as const,
      label: t('common:form.fields.slug.label'),
      required: true,
      component: InputAdapter,
      placeholder: t('common:form.fields.slug.placeholder'),
      helpText: t('common:form.fields.slug.helpText'),
    },
    {
      name: 'description' as const,
      label: t('applications.modal.form.description.label'),
      component: TextareaAdapter,
      placeholder: t('applications.modal.form.description.placeholder'),
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
      submitLabel={currentApplication ? t('common:buttons.save') : t('common:buttons.create')}
      cancelLabel={t('common:buttons.cancel')}
      testId="application-form"
      transform={{
        slug: (value) => value?.toLowerCase() || '',
      }}
      derivedFields={{
        slug: {
          dependsOn: ['name'],
          compute: (values) => {
            return (values.name || '')
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
