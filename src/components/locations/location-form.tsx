'use client';

import { useTranslation } from 'react-i18next';

import { InputAdapter } from '@/components/form/form-adapters';
import { FormBuilder } from '@/components/form/form-builder';
import type { FormErrors } from '@/hooks/use-form-state';
import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: CreateLocationDto | UpdateLocationDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function LocationForm({ location, onSubmit, onCancel, isSubmitting }: LocationFormProps) {
  const { t } = useTranslation(['settings', 'common']);

  // Validação de formulário
  const validateForm = (values: Partial<Location>): FormErrors<Partial<Location>> => {
    const errors: FormErrors<Partial<Location>> = {};

    if (!values.name?.trim()) {
      errors.name = t('common:messages.requiredField');
    }

    if (!values.slug?.trim()) {
      errors.slug = t('common:messages.requiredField');
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    return errors;
  };

  // Valor inicial do formulário
  const initialValues = {
    name: location?.name || '',
    slug: location?.slug || '',
  };

  // Campos do formulário
  const fields = [
    {
      name: 'name' as const,
      label: t('locations.modal.form.name.label'),
      required: true,
      component: InputAdapter,
      placeholder: t('locations.modal.form.name.placeholder'),
    },
    {
      name: 'slug' as const,
      label: 'Slug',
      required: true,
      component: InputAdapter,
      placeholder: 'identificador-unico',
      helpText: 'Identificador único usado em URLs. Apenas letras minúsculas, números e hífens.',
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
      submitLabel={location ? t('common:buttons.save') : t('common:buttons.create')}
      cancelLabel={t('common:buttons.cancel')}
      testId="location-form"
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
