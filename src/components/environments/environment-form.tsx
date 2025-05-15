// components/environments/environment-form.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  // Gerar slug automaticamente a partir do nome
  useEffect(() => {
    if (name && !touched.slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  }, [name, touched.slug]);

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

    const formData: CreateEnvironmentDto | UpdateEnvironmentDto = {
      name,
      slug,
      ...(order ? { order: Number(order) } : {}),
    };

    await onSubmit(formData);
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setTouched((prev) => ({ ...prev, name: true }));
          }}
          onBlur={() => handleBlur('name')}
          placeholder="ex: Desenvolvimento"
          disabled={isSubmitting}
          className={errors.name && touched.name ? 'border-destructive' : ''}
        />
        {errors.name && touched.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value.toLowerCase());
            setTouched((prev) => ({ ...prev, slug: true }));
          }}
          onBlur={() => handleBlur('slug')}
          placeholder="ex: dev"
          disabled={isSubmitting}
          className={errors.slug && touched.slug ? 'border-destructive' : ''}
        />
        {errors.slug && touched.slug ? (
          <p className="text-destructive text-sm">{errors.slug}</p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Usado em URLs e requisições de API. Use apenas letras minúsculas, números e hífens.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Ordem</Label>
        <Input
          id="order"
          type="number"
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setTouched((prev) => ({ ...prev, order: true }));
          }}
          onBlur={() => handleBlur('order')}
          placeholder="ex: 1"
          disabled={isSubmitting}
          className={errors.order && touched.order ? 'border-destructive' : ''}
        />
        {errors.order && touched.order ? (
          <p className="text-destructive text-sm">{errors.order}</p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Determina a ordem de exibição dos ambientes.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {environment ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
