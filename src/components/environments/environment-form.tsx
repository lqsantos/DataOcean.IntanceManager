'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

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
  const [name, setName] = useState(environment?.name || '');
  const [slug, setSlug] = useState(environment?.slug || '');
  const [order, setOrder] = useState(environment?.order?.toString() || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (order && isNaN(Number(order))) {
      newErrors.order = 'Order must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Development"
          disabled={isSubmitting}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. dev"
          disabled={isSubmitting}
          className={errors.slug ? 'border-destructive' : ''}
        />
        {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
        {!errors.slug && (
          <p className="text-muted-foreground text-xs">
            Used in URLs and API requests. Use lowercase letters, numbers, and hyphens only.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Order (optional)</Label>
        <Input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="e.g. 1"
          disabled={isSubmitting}
          className={errors.order ? 'border-destructive' : ''}
        />
        {errors.order && <p className="text-destructive text-sm">{errors.order}</p>}
        {!errors.order && (
          <p className="text-muted-foreground text-xs">
            Determines the display order of environments. Lower numbers appear first.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {environment ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
