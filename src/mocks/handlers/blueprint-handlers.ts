import { delay, http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

import type {
  Blueprint,
  BlueprintVariable,
  CreateBlueprintDto,
  UpdateBlueprintDto,
} from '@/types/blueprint';

// Função auxiliar para gerar o helperTpl no lado do servidor (mock)
const generateHelperTplForMock = (variables: BlueprintVariable[]): string => {
  if (!variables || variables.length === 0) {
    return '';
  }

  const helperContent = variables
    .map((variable) => {
      let defaultValue = '';

      // Formatar o valor padrão de acordo com o tipo
      if (variable.defaultValue !== undefined) {
        if (variable.type === 'string') {
          defaultValue = variable.defaultValue;
        } else if (variable.type === 'number') {
          defaultValue = String(Number(variable.defaultValue) || 0);
        } else if (variable.type === 'boolean') {
          defaultValue = variable.defaultValue.toLowerCase() === 'true' ? 'true' : 'false';
        }
      }

      const description = variable.description ? `{{/* ${variable.description} */}}\n` : '';

      return `${description}{{- define "helper.${variable.name}" -}}
${defaultValue}
{{- end }}`;
    })
    .join('\n\n');

  return helperContent;
};

// Mock data store
let blueprints: Blueprint[] = [
  {
    id: '1',
    name: 'Web Application Blueprint',
    description: 'Standard web application with load balancing',
    category: 'Application',
    // Removido templateId
    templateName: 'Web Application Template',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variables: [
      {
        name: 'replicaCount',
        description: 'Number of replicas',
        defaultValue: '2',
        required: true,
        type: 'number',
      },
      {
        name: 'imageTag',
        description: 'Docker image tag',
        defaultValue: 'latest',
        required: true,
        type: 'string',
      },
    ],
    childTemplates: [
      {
        templateId: '1',
        templateName: 'Web Application Template',
        order: 1,
      },
    ],
  },
  {
    id: '2',
    name: 'Database Blueprint',
    description: 'PostgreSQL database with persistent storage',
    category: 'Database',
    templateName: 'Database Template',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variables: [
      {
        name: 'storageSize',
        description: 'Storage size in GB',
        defaultValue: '10',
        required: true,
        type: 'number',
      },
      {
        name: 'databaseName',
        description: 'Name of the database to create',
        defaultValue: 'appdb',
        required: true,
        type: 'string',
      },
    ],
    childTemplates: [
      {
        templateId: '2',
        templateName: 'Database Template',
        order: 1,
      },
    ],
  },
  {
    id: '3',
    name: 'API Service Blueprint',
    description: 'REST API service with autoscaling',
    category: 'Application',
    templateName: 'API Service Template',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variables: [
      {
        name: 'minReplicas',
        description: 'Minimum number of replicas',
        defaultValue: '2',
        required: true,
        type: 'number',
      },
      {
        name: 'maxReplicas',
        description: 'Maximum number of replicas',
        defaultValue: '10',
        required: true,
        type: 'number',
      },
    ],
    childTemplates: [
      {
        templateId: '3',
        templateName: 'API Service Template',
        order: 1,
      },
    ],
  },
];

export const blueprintHandlers = [
  // Get all blueprints
  http.get('/api/blueprints', async () => {
    await delay();

    return HttpResponse.json(blueprints);
  }),

  // Get blueprint by ID
  http.get('/api/blueprints/:id', async ({ params }) => {
    await delay();
    const { id } = params;

    const blueprint = blueprints.find((b) => b.id === id);

    if (!blueprint) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(blueprint);
  }),

  // Create a new blueprint
  http.post('/api/blueprints', async ({ request }) => {
    await delay();

    const data = (await request.json()) as CreateBlueprintDto;

    // Gerar o helperTpl automaticamente com base nas variáveis fornecidas (simulando o backend)
    const helperTpl = data.variables ? generateHelperTplForMock(data.variables) : '';

    const newBlueprint: Blueprint = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      category: data.category,
      // Removido templateId
      templateName: data.childTemplates?.length ? 'Template associado' : undefined, // Nome derivado de templates associados
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variables: data.variables || [],
      helperTpl, // Adicionar o helperTpl gerado automaticamente
      childTemplates: data.childTemplates?.map((template, index) => ({
        ...template,
        templateName: `Template ${index + 1}`, // Nome representativo do template
        order: index + 1, // Definir ordem dos templates
      })),
    };

    blueprints = [...blueprints, newBlueprint];

    return HttpResponse.json(newBlueprint, { status: 201 });
  }),

  // Update a blueprint
  http.put('/api/blueprints/:id', async ({ request, params }) => {
    await delay();

    const { id } = params;
    const data = (await request.json()) as UpdateBlueprintDto;

    const index = blueprints.findIndex((b) => b.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // Gerar o helperTpl automaticamente com base nas variáveis (simulando o backend)
    const helperTpl = generateHelperTplForMock(data.variables || []);

    const updatedBlueprint = {
      ...blueprints[index],
      ...data,
      helperTpl, // Adicionar o helperTpl gerado automaticamente
      updatedAt: new Date().toISOString(),
    };

    blueprints[index] = updatedBlueprint;

    return HttpResponse.json(updatedBlueprint);
  }),

  // Delete a blueprint
  http.delete('/api/blueprints/:id', async ({ params }) => {
    await delay();

    const { id } = params;

    const index = blueprints.findIndex((b) => b.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    blueprints = blueprints.filter((b) => b.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),

  // Duplicate a blueprint
  http.post('/api/blueprints/:id/duplicate', async ({ params }) => {
    await delay();

    const { id } = params;

    const blueprint = blueprints.find((b) => b.id === id);

    if (!blueprint) {
      return new HttpResponse(null, { status: 404 });
    }

    const duplicatedBlueprint: Blueprint = {
      ...blueprint,
      id: uuidv4(),
      name: `${blueprint.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    blueprints = [...blueprints, duplicatedBlueprint];

    return HttpResponse.json(duplicatedBlueprint, { status: 201 });
  }),

  // Create instance from blueprint
  http.post('/api/blueprints/:id/create-instance', async ({ params, request }) => {
    await delay(1000);

    const { id } = params;

    // Recebemos os dados, mas não estamos usando neste mock
    await request.json();

    const blueprint = blueprints.find((b) => b.id === id);

    if (!blueprint) {
      return new HttpResponse(null, { status: 404 });
    }

    // In a real implementation, this would create an instance
    // For now, we'll just return success

    return HttpResponse.json({
      success: true,
      message: `Instance created from blueprint ${blueprint.name}`,
      instanceId: uuidv4(),
    });
  }),

  // Validate blueprint
  http.post('/api/blueprints/validate', async ({ request }) => {
    await delay(800); // Simular um pequeno atraso na validação

    const blueprintData = (await request.json()) as CreateBlueprintDto;

    // Implementar validação básica do blueprint
    if (!blueprintData.name || blueprintData.name.length < 3) {
      return HttpResponse.json({
        valid: false,
        message: 'O nome do blueprint deve ter pelo menos 3 caracteres',
      });
    }

    // Verificar se tem descrição
    if (!blueprintData.description) {
      return HttpResponse.json({
        valid: false,
        message: 'A descrição do blueprint é obrigatória',
      });
    }

    // Adicione aqui outras validações que você desejar...

    // Se passou em todas as validações
    return HttpResponse.json({
      valid: true,
    });
  }),
];
