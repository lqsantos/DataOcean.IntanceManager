'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateLocationDto, Location, UpdateLocationDto } from '@/types/location';

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: CreateLocationDto | UpdateLocationDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
}

export function LocationForm({ location, onSubmit, onCancel, isSubmitting }: LocationFormProps) {
  const [name, setName] = useState(location?.name || '');
  const [slug, setSlug] = useState(location?.slug || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Gerar slug automaticamente a partir do nome
  useEffect(() => {
    if (name && !touched.slug && !location?.slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  }, [name, touched.slug, location?.slug]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: CreateLocationDto | UpdateLocationDto = {
      name,
      slug,
    };

    await onSubmit(formData);
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="location-form">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          disabled={isSubmitting}
          className={errors.name ? 'border-destructive' : ''}
          data-testid="location-form-name-input"
        />
        {errors.name && (
          <p className="text-sm text-destructive" data-testid="location-form-name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={() => handleBlur('slug')}
          disabled={isSubmitting}
          className={errors.slug ? 'border-destructive' : ''}
          data-testid="location-form-slug-input"
        />
        {errors.slug && (
          <p className="text-sm text-destructive" data-testid="location-form-slug-error">
            {errors.slug}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Identificador único usado em URLs. Apenas letras minúsculas, números e hífens.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          data-testid="location-form-cancel-button"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          data-testid="location-form-submit-button"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {location ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
