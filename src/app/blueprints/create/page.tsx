'use client';

import { useTranslation } from 'react-i18next';

import { BlueprintCreationPage } from '@/components/blueprints';

export default function CreateBlueprintPage() {
  const { t } = useTranslation('blueprints');

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t('create.title', 'Create Blueprint')}</h1>
      <BlueprintCreationPage />
    </div>
  );
}
