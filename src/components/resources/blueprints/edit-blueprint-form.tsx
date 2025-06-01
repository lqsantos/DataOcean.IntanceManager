'use client';

import { useRouter } from 'next/navigation';

import type { Blueprint } from '@/types/blueprint';

import { BlueprintForm } from './blueprint-form';

interface EditBlueprintFormProps {
  blueprint: Blueprint;
  onSave: (data: Partial<Blueprint>) => Promise<void>;
}

export function EditBlueprintForm({ blueprint, onSave }: EditBlueprintFormProps) {
  const router = useRouter();

  // Função para lidar com o cancelamento da edição
  const handleCancel = () => {
    router.push('/resources/blueprints');
  };

  // Repassa os dados para o BlueprintForm compartilhado
  return (
    <BlueprintForm blueprint={blueprint} onSave={onSave} onCancel={handleCancel} mode="edit" />
  );
}
