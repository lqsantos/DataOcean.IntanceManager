// components/applications/application-form.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  // Form state
  const [name, setName] = useState(application?.name || '');
  const [slug, setSlug] = useState(application?.slug || '');
  const [description, setDescription] = useState(application?.description || '');

  // Form validation
  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    description?: string;
  }>({});

  const [touched, setTouched] = useState<{
    name?: boolean;
    slug?: boolean;
    description?: boolean;
  }>({});

  const formRef = useRef<HTMLFormElement>(null);

  // Debug logs for monitoring state
  useEffect(() => {
    console.log('[DIAGNOSTIC] ApplicationForm mounted/updated', {
      name,
      slug,
      description,
      isSubmitting,
      hasErrors: Object.keys(errors).length > 0,
      touched,
    });
  }, [name, slug, description, isSubmitting, errors, touched]);

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !touched.slug && !application?.slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  }, [name, touched.slug, application?.slug]);

  const validateForm = () => {
    console.log('[DIAGNOSTIC] Validating form', { name, slug, description });
    const newErrors: {
      name?: string;
      slug?: string;
      description?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (
    field: 'name' | 'slug' | 'description',
    value: string,
    markAsTouched = true
  ) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'slug':
        setSlug(value.toLowerCase());
        break;
      case 'description':
        setDescription(value);
        break;
    }

    if (markAsTouched) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleBlur = (field: 'name' | 'slug' | 'description') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[DIAGNOSTIC] Form submit triggered');

    // Mark all fields as touched to show validation errors
    setTouched({
      name: true,
      slug: true,
      description: true,
    });

    if (!validateForm()) {
      console.log('[DIAGNOSTIC] Form validation failed', errors);

      return;
    }

    console.log('[DIAGNOSTIC] Form validation passed, submitting data', {
      name,
      slug,
      description,
    });

    const data: CreateApplicationDto | UpdateApplicationDto = {
      name,
      slug,
      ...(description ? { description } : {}),
    };

    try {
      await onSubmit(data);
      console.log('[DIAGNOSTIC] Form submission completed successfully');
    } catch (error) {
      console.error('[DIAGNOSTIC] Error in form submission:', error);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleFormSubmit}
      className="space-y-4"
      data-testid="application-form"
      id="application-form"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="required">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="Nome da aplicação"
          disabled={isSubmitting}
          className={errors.name && touched.name ? 'border-destructive' : ''}
          data-testid="application-name-input"
          required
        />
        {errors.name && touched.name && (
          <p className="text-sm text-destructive" data-testid="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="required">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => handleFieldChange('slug', e.target.value.toLowerCase())}
          onBlur={() => handleBlur('slug')}
          placeholder="identificador-único"
          disabled={isSubmitting}
          className={errors.slug && touched.slug ? 'border-destructive' : ''}
          data-testid="application-slug-input"
          required
        />
        {errors.slug && touched.slug ? (
          <p className="text-sm text-destructive" data-testid="slug-error">
            {errors.slug}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground" data-testid="slug-help">
            Identificador único usado em URLs. Apenas letras minúsculas, números e hífens.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Descrição da aplicação (opcional)"
          disabled={isSubmitting}
          className={errors.description && touched.description ? 'border-destructive' : ''}
          data-testid="application-description-input"
          rows={4}
        />
        {errors.description && touched.description && (
          <p className="text-sm text-destructive" data-testid="description-error">
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            console.log('[DIAGNOSTIC] Cancel button clicked');
            onCancel();
          }}
          disabled={isSubmitting}
          data-testid="application-cancel-button"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          data-testid="application-submit-button"
          className="relative"
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
          )}
          <span>{application ? 'Salvar' : 'Criar'}</span>
        </Button>
      </div>
    </form>
  );
}
