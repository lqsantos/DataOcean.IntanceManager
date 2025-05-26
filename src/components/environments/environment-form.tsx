// components/environments/environment-form.tsx
'use client';

import { useTranslation } from 'react-i18next';

import { InputAdapter } from '@/components/form/form-adapters';
import { FormBuilder } from '@/components/form/form-builder';
import type { FormErrors } from '@/hooks/use-form-state';
import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

interface EnvironmentFormProps {
  environment?: Environment;
  entity?: Environment; // Adicionar suporte para a prop genérica
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Tipo para os valores do formulário (compatível com FormBuilder)
interface EnvironmentFormValues {
  name: string;
  slug: string;
  order: string;
}

export function EnvironmentForm({
  environment,
  entity,
  onSubmit,
  onCancel,
  isSubmitting,
}: EnvironmentFormProps) {
  const { t } = useTranslation(['settings', 'common']);

  // Usar entity se fornecido, senão usar environment (compatibilidade com código existente)
  const currentEnvironment = entity || environment;

  // Log para debug - vamos ver o que está sendo passado
  console.warn('[EnvironmentForm] Renderizando com:', {
    environment,
    entity,
    currentEnvironment,
    isSubmitting,
  });

  // Validação de formulário
  const validateForm = (values: EnvironmentFormValues): FormErrors<EnvironmentFormValues> => {
    const errors: FormErrors<EnvironmentFormValues> = {};

    if (!values.name?.trim()) {
      errors.name = t('common:messages.requiredField');
    } else if (values.name.length < 3) {
      errors.name = t('common:messages.minLength', { count: 3 });
    } else if (values.name.length > 50) {
      errors.name = t('common:messages.maxLength', { count: 50 });
    }

    if (!values.slug?.trim()) {
      errors.slug = t('common:messages.requiredField');
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug = t('common:form.errors.invalidSlug');
    } else if (values.slug.length < 2) {
      errors.slug = t('common:messages.minLength', { count: 2 });
    } else if (values.slug.length > 30) {
      errors.slug = t('common:messages.maxLength', { count: 30 });
    }

    if (values.order) {
      const orderValue = Number(values.order);

      if (isNaN(orderValue)) {
        errors.order = t('common:form.errors.invalidNumber');
      } else if (orderValue < 0) {
        errors.order = t('common:form.errors.positiveNumberRequired');
      }
    }

    console.warn('[EnvironmentForm] Erros de validação:', errors);

    return errors;
  };

  // Valor inicial do formulário
  const initialValues: EnvironmentFormValues = {
    name: currentEnvironment?.name || '',
    slug: currentEnvironment?.slug || '',
    order: currentEnvironment?.order?.toString() || '',
  };

  // Log para debug dos valores iniciais
  console.warn('[EnvironmentForm] Valores iniciais calculados:', initialValues);

  // Campos do formulário
  const fields = [
    {
      name: 'name' as keyof EnvironmentFormValues,
      label: t('environments.modal.form.name.label'),
      required: true,
      component: InputAdapter,
      placeholder: t('environments.modal.form.name.placeholder'),
    },
    {
      name: 'slug' as keyof EnvironmentFormValues,
      label: t('common:form.fields.slug.label'),
      required: true,
      component: InputAdapter,
      placeholder: t('common:form.fields.slug.placeholder'),
      helpText: t('common:form.fields.slug.helpText'),
    },
    {
      name: 'order' as keyof EnvironmentFormValues,
      label: t('environments.modal.form.order.label'),
      component: (props: React.ComponentProps<typeof InputAdapter>) =>
        InputAdapter({ ...props, type: 'number' }),
      placeholder: t('environments.modal.form.order.placeholder'),
      helpText: t('environments.modal.form.order.helpText'),
    },
  ];

  console.warn('[EnvironmentForm] Campos do formulário:', fields);

  // Função wrapper para converter os valores do formulário
  const handleSubmit = async (values: EnvironmentFormValues) => {
    const convertedData = {
      name: values.name,
      slug: values.slug,
      order: values.order ? Number(values.order) : undefined,
    };

    await onSubmit(convertedData);
  };

  return (
    <FormBuilder
      initialValues={initialValues}
      fields={fields}
      validator={validateForm}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isSubmitting}
      submitLabel={currentEnvironment ? t('common:buttons.save') : t('common:buttons.create')}
      cancelLabel={t('common:buttons.cancel')}
      testId="environment-form"
      debug={true}
      transform={{
        slug: (value?: string) => value?.toLowerCase() || '',
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
