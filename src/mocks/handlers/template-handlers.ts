import { delay, http, HttpResponse } from 'msw';

import { createRandomId } from '@/lib/id-utils';
import type { Template } from '@/types/template';

import { generateMockSchemaForTemplate } from '../data/template-schemas';
import { generateValidationResponse, USE_PREDICTABLE_MOCK } from '../data/template-validation';
import { templates as devTemplates } from '../data/templates';
import { testTemplates } from '../data/test-templates';
import { createValidationResponse } from '../data/test-validation';

// Use different template data based on environment
const templates = USE_PREDICTABLE_MOCK ? testTemplates : devTemplates;

// =============================================================================
// HANDLERS UNIFICADOS
// =============================================================================

export const templateHandlers = [
  // =========================================================================
  // CRUD OPERATIONS
  // =========================================================================

  // Get all templates
  http.get('/api/templates', async () => {
    await delay(USE_PREDICTABLE_MOCK ? 100 : 500);

    return HttpResponse.json(templates);
  }),

  // Get template by id
  http.get('/api/templates/:id', async ({ params }) => {
    const { id } = params;
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    await delay(USE_PREDICTABLE_MOCK ? 100 : 500);

    return HttpResponse.json(template);
  }),

  // Create template
  http.post('/api/templates', async ({ request }) => {
    const newTemplateData = (await request.json()) as Record<string, unknown>;

    // Criar um objeto Template com todos os campos necessários
    const createdTemplate: Template = {
      id: createRandomId(),
      name: (newTemplateData.name as string) || 'Unnamed Template',
      description: (newTemplateData.description as string) || '',
      category: (newTemplateData.category as string) || 'default',
      repositoryUrl: (newTemplateData.repositoryUrl as string) || '',
      chartPath: (newTemplateData.chartPath as string) || '',
      isActive: newTemplateData.isActive === undefined ? true : Boolean(newTemplateData.isActive),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    templates.push(createdTemplate);

    await delay(USE_PREDICTABLE_MOCK ? 200 : 1000);

    return HttpResponse.json(createdTemplate, { status: 201 });
  }),

  // Update template
  http.put('/api/templates/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedTemplateData = (await request.json()) as Record<string, unknown>;
    const templateIndex = templates.findIndex((t) => t.id === id);

    if (templateIndex === -1) {
      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    const updated = {
      ...templates[templateIndex],
      ...(updatedTemplateData as Partial<Template>),
      updatedAt: new Date().toISOString(),
    };

    templates[templateIndex] = updated;

    await delay(USE_PREDICTABLE_MOCK ? 200 : 1000);

    return HttpResponse.json(updated);
  }),

  // Delete template
  http.delete('/api/templates/:id', async ({ params }) => {
    const { id } = params;
    const templateIndex = templates.findIndex((t) => t.id === id);

    if (templateIndex === -1) {
      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    templates.splice(templateIndex, 1);

    await delay(USE_PREDICTABLE_MOCK ? 200 : 1000);

    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // TEMPLATE VALIDATION OPERATIONS
  // =========================================================================

  // Validate template data
  http.post('/api/templates/validate', async ({ request }) => {
    const data = (await request.json()) as {
      repositoryUrl: string;
      chartPath: string;
      branch?: string;
    };
    const { branch = 'main' } = data;

    let validationResult;

    if (USE_PREDICTABLE_MOCK) {
      // Use simplified validation response in tests
      validationResult = createValidationResponse(
        !branch.includes('error'), // isValid is true unless branch contains "error"
        branch
      );
    } else {
      // Use detailed validation response in development
      validationResult = generateValidationResponse(branch);
    }

    await delay(USE_PREDICTABLE_MOCK ? 100 : Math.random() * 1500 + 500);

    if (!validationResult.isValid) {
      return HttpResponse.json(validationResult, { status: 400 });
    }

    return HttpResponse.json(validationResult);
  }),

  // Validate existing template
  http.post('/api/templates/:id/validate', async ({ params, request }) => {
    const { id } = params;
    const data = (await request.json()) as { branch?: string };
    const { branch = 'main' } = data;

    const template = templates.find((t) => t.id === id);

    if (!template) {
      await delay(USE_PREDICTABLE_MOCK ? 50 : 500);

      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    let validationResult;

    if (USE_PREDICTABLE_MOCK) {
      // Use simplified validation response in tests
      validationResult = createValidationResponse(
        !branch.includes('error'), // isValid is true unless branch contains "error"
        branch
      );
    } else {
      // Use detailed validation response in development
      validationResult = generateValidationResponse(branch);
    }

    await delay(USE_PREDICTABLE_MOCK ? 100 : Math.random() * 1500 + 500);

    if (!validationResult.isValid) {
      return HttpResponse.json(validationResult, { status: 400 });
    }

    return HttpResponse.json(validationResult);
  }),

  // =========================================================================
  // TEMPLATE SCHEMA OPERATIONS
  // =========================================================================

  // Get template schema (migrado de template-schema-handlers.ts)
  http.get('/api/templates/:id/schema', async ({ params }) => {
    const { id } = params;

    if (!id) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Bad Request: Missing template ID',
      });
    }

    // 'non-existent-template' is a special ID to test 404 error
    if (id === 'non-existent-template') {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Template not found',
      });
    }

    // In test mode, ensure we always return a schema for test template IDs
    if (USE_PREDICTABLE_MOCK) {
      console.log(`TEST MODE - Generating schema for template ID: ${id}`);

      // Generate schema based on template ID
      let templateType = 'generic';

      if (id.includes('database')) {
        templateType = 'database';
      } else if (id.includes('application')) {
        templateType = 'application';
      } else if (id.includes('network')) {
        templateType = 'network';
      } else if (id.includes('generic')) {
        templateType = 'generic';
      }

      // Get the corresponding schema data
      const schemaData = generateMockSchemaForTemplate(templateType);

      await delay(100); // Short delay in test mode

      return HttpResponse.json(schemaData);
    }

    // For development mode, verify if template exists
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Template not found',
      });
    }

    await delay(USE_PREDICTABLE_MOCK ? 100 : 500);

    try {
      console.log(`Generating schema for template ID: ${id}`);
      // Generate mock schema response based on template ID
      const schemaData = generateMockSchemaForTemplate(id.toString());

      console.log('Schema generated successfully:', schemaData);

      return HttpResponse.json(schemaData);
    } catch (error) {
      console.error('MSW error generating template schema:', error);

      return new HttpResponse(null, {
        status: 500,
        statusText: 'Error generating template schema',
      });
    }
  }),
];
