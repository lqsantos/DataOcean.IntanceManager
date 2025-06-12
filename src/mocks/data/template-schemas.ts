import type { Template } from '@/types/template';

// Helper function for generating chart description
export function generateChartDescription(): string | undefined {
  return Math.random() > 0.3 ? 'Um chart exemplo para demonstração da validação' : undefined;
}

// Helper para determinar o tipo do template
function determineTemplateType(
  template: Template
): 'database' | 'application' | 'network' | 'generic' {
  // Primeiro tenta usar a categoria oficial
  if (template.category?.toLowerCase() === 'database') {
    return 'database';
  }

  if (template.category?.toLowerCase() === 'application') {
    return 'application';
  }

  if (
    template.category?.toLowerCase() === 'infrastructure' ||
    template.category?.toLowerCase() === 'network'
  ) {
    return 'network';
  }

  // Fallback: tenta inferir pelo nome se não tiver categoria
  if (template.name) {
    const nameLower = template.name.toLowerCase();

    if (nameLower.includes('database') || nameLower.includes('db')) {
      return 'database';
    }

    if (nameLower.includes('application') || nameLower.includes('app')) {
      return 'application';
    }

    if (nameLower.includes('network') || nameLower.includes('infrastructure')) {
      return 'network';
    }
  }

  return 'generic';
}

// Mock data for template schemas
export const generateMockSchemaForTemplate = (template: Template) => {
  if (!template) {
    throw new Error('Template é obrigatório para gerar o schema');
  }

  // Determina o tipo do template
  const templateType = determineTemplateType(template);

  // Get properties based on template type
  let schemaProperties;

  if (templateType === 'database') {
    schemaProperties = getDatabaseSchemaProperties();
  } else if (templateType === 'application') {
    schemaProperties = getApplicationSchemaProperties();
  } else {
    schemaProperties = getGenericSchemaProperties();
  }

  // Return the mocked JSON Schema
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: schemaProperties,
    required: ['name'],
    title: template.name,
    description: template.description,
  };
};

// Helper functions to generate schema properties for different types
function getDatabaseSchemaProperties() {
  return {
    database: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        engine: { type: 'string', enum: ['postgres', 'mysql', 'mongodb'] },
        version: { type: 'string' },
        resources: {
          type: 'object',
          properties: {
            cpu: { type: 'string' },
            memory: { type: 'string' },
          },
        },
      },
      required: ['name', 'engine'],
    },
  };
}

function getApplicationSchemaProperties() {
  return {
    application: {
      type: 'object',
      properties: {
        replicas: { type: 'integer', minimum: 1 },
        image: {
          type: 'object',
          properties: {
            repository: { type: 'string' },
            tag: { type: 'string' },
          },
          required: ['repository'],
        },
      },
    },
  };
}

function getGenericSchemaProperties() {
  return {
    name: { type: 'string' },
    description: { type: 'string' },
    enabled: { type: 'boolean', default: true },
  };
}
