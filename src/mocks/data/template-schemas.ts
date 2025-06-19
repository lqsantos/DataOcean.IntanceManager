import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';

import { getMockFieldsByType, templateSpecificGenerators } from './template-fields';

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
  // Verifica se temos um gerador específico para este template ID
  let fields: DefaultValueField[];
  let templateName: string;
  let templateType: string;

  if (templateSpecificGenerators[templateIdOrType]) {
    // Usar gerador específico para o template ID
    console.log(`Using specific field generator for template ID: ${templateIdOrType}`);
    fields = templateSpecificGenerators[templateIdOrType]();

    // Atribuir nomes para templates específicos
    switch (templateIdOrType) {
      case '1':
        templateName = 'Basic Web Application';
        templateType = 'application';
        break;
      case '2':
        templateName = 'React Frontend';
        templateType = 'application';
        break;
      case '4':
        templateName = 'PostgreSQL Database';
        templateType = 'database';
        break;
      case '5':
        templateName = 'MongoDB Deployment';
        templateType = 'database';
        break;
      case '7':
        templateName = 'Nginx Ingress Controller';
        templateType = 'infrastructure';
        break;
      default:
        templateName = `Template ${templateIdOrType}`;
        templateType = 'generic';
    }
  } else {
    // Fallback: usar gerador baseado no tipo
    const genericType = determineTemplateType(templateIdOrType);

    console.log(`Using generic field generator for type: ${genericType}`);
    fields = getMockFieldsByType(genericType);
    templateName = `Generic ${genericType.charAt(0).toUpperCase() + genericType.slice(1)} Template`;
    templateType = genericType;
  }

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
      title: templateName || `Template ${templateIdOrType}`,
      description: `${templateName} (${templateType}) - Template configuration for ID ${templateIdOrType}`,
    },
  };
}

function createRawObjectFromFields(fields: DefaultValueField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Verifica se temos um nó raiz (estrutura nova) ou não (estrutura antiga)
  if (fields && fields.length === 1 && fields[0].key === 'root' && fields[0].children) {
    // Se temos um nó raiz, usamos seus filhos para criar o objeto
    return createRawObjectFromFields(fields[0].children);
  }

  // Se não temos um array de campos ou é um array vazio, retorna um objeto vazio
  if (!fields || fields.length === 0) {
    return {};
  }

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
