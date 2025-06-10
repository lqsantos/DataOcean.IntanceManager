'use client';

import { BlueprintCreationPage } from '@/components/blueprints';

export default function CreateBlueprintPage() {
  // Não precisamos mais da tradução nesta página
  return (
    <div className="container mx-auto py-6">
      <BlueprintCreationPage />
    </div>
  );
}
