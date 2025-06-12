import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';

import { getMockFieldsByType } from './template-fields';

// Helper para determinar o tipo do template
function determineTemplateType(
  templateId: string
): 'database' | 'application' | 'network' | 'generic' {
  const idLower = templateId.toLowerCase();

  if (idLower.includes('database') || idLower.includes('db')) {
    return 'database';
  }

  if (idLower.includes('application') || idLower.includes('app')) {
    return 'application';
  }

  if (idLower.includes('network') || idLower.includes('infra')) {
    return 'network';
  }

  return 'generic';
}

// Mock data for template schemas
export function generateMockSchemaForTemplate(templateIdOrType: string) {
  // Determina o tipo do template
  const templateType = determineTemplateType(templateIdOrType);

  // Get mock fields based on template type
  const fields = getMockFieldsByType(templateType);

  // Prepare the object form for YAML conversion
  const rawObject = createRawObjectFromFields(fields);

  // Convert to YAML string
  const rawYaml = JSON.stringify(rawObject, null, 2);

  // Return the schema with fields and YAML
  return {
    fields,
    rawYaml,
    jsonSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Template`,
      description: `A ${templateType} template for demonstration`,
    },
  };
}

function createRawObjectFromFields(fields: DefaultValueField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Process each top-level field
  fields.forEach((field) => {
    let current = result;
    const pathParts = field.path.slice(0, -1); // All parts except the last one
    const lastPart = field.path[field.path.length - 1];

    // Build the nested structure
    pathParts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    });

    // Set the value at the leaf
    current[lastPart] = field.value;
  });

  return result;
}
