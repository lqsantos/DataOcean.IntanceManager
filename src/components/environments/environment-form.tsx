// components/environments/environment-form.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';

interface EnvironmentFormProps {
  environment?: Environment;
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
  order?: string;
}

export function EnvironmentForm({
  environment,
  onSubmit,
  onCancel,
  isSubmitting,
}: EnvironmentFormProps) {
  const [name, setName] = useState(environment?.name || '');
  const [slug, setSlug] = useState(environment?.slug || '');
  const [order, setOrder] = useState(environment?.order?.toString() || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // Gerar slug automaticamente a partir do nome
  useEffect(() => {
    if (name && !touched.slug && !environment?.slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  }, [name, touched.slug, environment?.slug]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (name.length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    } else if (slug.length < 2) {
      newErrors.slug = 'Slug deve ter pelo menos 2 caracteres';
    } else if (slug.length > 30) {
      newErrors.slug = 'Slug deve ter no máximo 30 caracteres';
    }

    if (order && isNaN(Number(order))) {
      newErrors.order = 'Ordem deve ser um número';
    } else if (order && Number(order) < 0) {
      newErrors.order = 'Ordem deve ser um número positivo';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos os campos como tocados para mostrar todos os erros
    const allTouched = Object.keys({ name, slug, order }).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );

    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmittingLocal(true);
    const formData: CreateEnvironmentDto | UpdateEnvironmentDto = {
      name,
      slug,
      ...(order ? { order: Number(order) } : {}),
    };

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting environment form:', error);
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  // Combinação de estado local e prop para evitar problemas de sincronização
  const isFormSubmitting = isSubmitting || isSubmittingLocal;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="environment-form">
      <div className="space-y-2">
        <Label htmlFor="env-name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="env-name"
          data-testid="env-name-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setTouched((prev) => ({ ...prev, name: true }));
          }}
          onBlur={() => handleBlur('name')}
          placeholder="ex: Desenvolvimento"
          disabled={isFormSubmitting}
          className={errors.name && touched.name ? 'border-destructive' : ''}
        />
        {errors.name && touched.name && (
          <p className="text-sm text-destructive" data-testid="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="env-slug">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="env-slug"
          data-testid="env-slug-input"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value.toLowerCase());
            setTouched((prev) => ({ ...prev, slug: true }));
          }}
          onBlur={() => handleBlur('slug')}
          placeholder="ex: dev"
          disabled={isFormSubmitting}
          className={errors.slug && touched.slug ? 'border-destructive' : ''}
        />
        {errors.slug && touched.slug ? (
          <p className="text-sm text-destructive" data-testid="slug-error">
            {errors.slug}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground" data-testid="slug-help">
            Usado em URLs e requisições de API. Use apenas letras minúsculas, números e hífens.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="env-order">Ordem</Label>
        <Input
          id="env-order"
          data-testid="env-order-input"
          type="number"
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setTouched((prev) => ({ ...prev, order: true }));
          }}
          onBlur={() => handleBlur('order')}
          placeholder="ex: 1"
          disabled={isFormSubmitting}
          className={errors.order && touched.order ? 'border-destructive' : ''}
        />
        {errors.order && touched.order ? (
          <p className="text-sm text-destructive" data-testid="order-error">
            {errors.order}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground" data-testid="order-help">
            Determina a ordem de exibição dos ambientes.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isFormSubmitting}
          data-testid="cancel-button"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isFormSubmitting} data-testid="submit-button">
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
          )}
          {environment ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
