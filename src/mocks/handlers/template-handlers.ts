import { delay, http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

import { templates } from '../data/templates';

export const templateHandlers = [
  // GET /templates - List all templates
  http.get('/api/templates', () => {
    return HttpResponse.json(templates);
  }),

  // GET /templates/:id - Get template by id
  http.get('/api/templates/:id', ({ params }) => {
    const template = templates.find((t) => t.id === params.id);

    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(template);
  }),

  // POST /templates - Create a new template
  http.post('/api/templates', async ({ request }) => {
    const data = await request.json();

    // Adaptar para aceitar o formato atualizado dos dados
    // Criar um ID único para o novo template
    const newTemplate = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      category: data.category || 'Other',
      repositoryUrl: data.repositoryUrl || '',
      chartPath: data.chartPath || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    templates.push(newTemplate);

    return HttpResponse.json(newTemplate, { status: 201 });
  }),

  // PUT /templates/:id - Update a template
  http.put('/api/templates/:id', async ({ request, params }) => {
    const data = await request.json();
    const templateIndex = templates.findIndex((t) => t.id === params.id);

    if (templateIndex === -1) {
      return new HttpResponse({ message: 'Template não encontrado' }, { status: 404 });
    }

    // Update template with new data
    const updatedTemplate = {
      ...templates[templateIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    templates[templateIndex] = updatedTemplate;

    return HttpResponse.json(updatedTemplate);
  }),

  // DELETE /templates/:id - Delete a template
  http.delete('/api/templates/:id', ({ params }) => {
    const templateIndex = templates.findIndex((t) => t.id === params.id);

    if (templateIndex === -1) {
      return new HttpResponse({ message: 'Template não encontrado' }, { status: 404 });
    }

    templates.splice(templateIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /templates/validate - Validar template diretamente pelos dados
  http.post('/api/templates/validate', async ({ request }) => {
    // Adiciona um delay de 3 segundos para simular uma validação mais demorada
    await delay(3000);

    const { repositoryUrl, chartPath, branch } = await request.json();

    // Simulamos verificar se a URL do repositório e o caminho do chart existem
    // Em um caso real, faria uma chamada ao serviço Git para validar estes dados
    const isValidUrl = repositoryUrl && repositoryUrl.startsWith('https://');
    const isValidPath = chartPath && chartPath.length > 0;

    // Simulamos o resultado da validação
    const randomResult = Math.random();

    if (isValidUrl && isValidPath && randomResult > 0.3) {
      // Caso de sucesso
      return HttpResponse.json({
        isValid: true,
        message: `Template validado com sucesso na branch "${branch}".`,
      });
    } else {
      // Caso de erro
      const errors = [];

      if (!isValidUrl) {
        errors.push('URL do repositório inválida.');
      }

      if (!isValidPath) {
        errors.push('Caminho do chart inválido.');
      }

      // Adicionar alguns erros aleatórios para demonstração
      if (randomResult <= 0.3) {
        const possibleErrors = [
          'Chart.yaml não encontrado no caminho especificado.',
          'Erro de sintaxe YAML na linha 15 do values.yaml.',
          'Dependência "redis" não encontrada no chart.',
          'Falha ao validar esquema values.schema.json.',
        ];

        const randomErrorIndex = Math.floor(Math.random() * possibleErrors.length);

        errors.push(possibleErrors[randomErrorIndex]);
      }

      // Adicionar alguns avisos em alguns casos
      const warnings = [];

      if (Math.random() > 0.5) {
        warnings.push('Requests/limits de recursos não especificados para o container.');
        warnings.push('Nenhum ingress definido, o serviço pode não estar acessível.');
      }

      return HttpResponse.json({
        isValid: false,
        message: 'Validação do template falhou. Corrija os erros abaixo.',
        errors,
        warnings,
      });
    }
  }),

  // POST /templates/:id/validate - Validate template
  http.post('/api/templates/:id/validate', async ({ params, request }) => {
    await delay(1500); // Longer delay to simulate validation process

    const { id } = params;
    const { branch } = await request.json();

    const template = templates.find((t) => t.id === id);

    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }

    // Simulate validation results - we'll randomly succeed or fail for demonstration purposes
    const randomResult = Math.random();

    if (randomResult > 0.3) {
      // Success case
      return HttpResponse.json({
        isValid: true,
        message: `Template validado com sucesso na branch "${branch}".`,
      });
    } else {
      // Error case with random errors
      const possibleErrors = [
        'Sintaxe YAML inválida na linha 12',
        'Campo obrigatório "name" ausente no chart.yaml',
        'Valor inválido para "replicas": deve ser um inteiro positivo',
        'Dependência do chart "redis" não encontrada no requirements.yaml',
        'Não foi possível analisar o template em templates/deployment.yaml',
      ];

      // Select 1-3 random errors
      const errorCount = Math.floor(Math.random() * 3) + 1;
      const errors = [];

      for (let i = 0; i < errorCount; i++) {
        const randomIndex = Math.floor(Math.random() * possibleErrors.length);

        errors.push(possibleErrors[randomIndex]);
        possibleErrors.splice(randomIndex, 1);

        if (possibleErrors.length === 0) {
          break;
        }
      }

      // Add some warnings in some cases
      const warnings = [];

      if (Math.random() > 0.5) {
        warnings.push('Requests/limits de recursos não especificados para o container');
        warnings.push('Nenhum ingress definido, o serviço pode não estar acessível');
      }

      return HttpResponse.json({
        isValid: false,
        message: 'Validação do template falhou. Corrija os erros abaixo.',
        errors,
        warnings,
      });
    }
  }),
];
