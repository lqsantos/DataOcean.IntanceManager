// app/resources/blueprints/[id]/page.tsx
// Esta é uma Server Component por padrão (sem 'use client')

import { Suspense } from 'react';

import { BlueprintEditor } from '@/components/resources/blueprints/blueprint-editor';

interface EditBlueprintPageProps {
  params: {
    id: string;
  };
}

export default async function BlueprintEditPage({ params }: EditBlueprintPageProps) {
  // No Next.js 15, precisamos aguardar os parâmetros antes de acessá-los
  const resolvedParams = await params;

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <BlueprintEditor id={resolvedParams.id} />
    </Suspense>
  );
}
