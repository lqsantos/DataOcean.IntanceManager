'use client';

import { BlueprintEditor } from '@/components/blueprints/shared/BlueprintEditor';

/**
 * BlueprintCreationPage - The main component for the blueprint creation workflow
 * Provides a tabbed interface for the different sections of the blueprint creation process
 */
export function BlueprintCreationPage() {
  // Use o componente compartilhado BlueprintEditor com o modo 'create'
  return (
    <BlueprintEditor
      mode="create"
      baseUrl="/blueprints/create"
      onSave={async () => {
        // Implementar lógica específica para criação de blueprints (quando necessário)
        // Por exemplo, integração com APIs específicas para criação
        console.log('Blueprint creation logic executed');
      }}
    />
  );
}
