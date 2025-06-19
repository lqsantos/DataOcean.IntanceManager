'use client';

import { useTranslation } from 'react-i18next';

import { BlueprintEditPage } from '@/components/blueprints';

interface BlueprintEditPageProps {
  params: {
    id: string;
  };
}

export default function EditBlueprintPage({ params }: BlueprintEditPageProps) {
  const { id } = params;
  const { t } = useTranslation('blueprints');

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t('edit.title', 'Edit Blueprint')}</h1>
      <BlueprintEditPage blueprintId={id} />
    </div>
  );
}
