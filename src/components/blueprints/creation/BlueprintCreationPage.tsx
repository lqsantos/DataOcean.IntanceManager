'use client';

import {
  MetadataSection,
  TemplatesSection,
  ValuesSection,
  VariablesSection,
} from '@/components/blueprints/sections';
import { BlueprintEditor } from '@/components/blueprints/shared/BlueprintEditor';

/**
 * BlueprintCreationPage - The main component for the blueprint creation workflow
 * Provides a tabbed interface for the different sections of the blueprint creation process
 */
export function BlueprintCreationPage() {
  // Use o componente compartilhado BlueprintEditor com o modo 'create'
  // E forneça os componentes de seção
  return (
    <BlueprintEditor
      mode="create"
      baseUrl="/blueprints/create"
      testId="blueprint-creation-page"
      sectionContent={{
        metadata: <MetadataSection />,
        templates: <TemplatesSection />,
        variables: <VariablesSection />,
        values: <ValuesSection />,
      }}
      onSave={async () => {
        // Implementar lógica específica para criação de blueprints (quando necessário)
        // Por exemplo, integração com APIs específicas para criação
        // console.log('Blueprint creation logic executed');
      }}
    />
  );
}
