import { delay, http, HttpResponse } from 'msw';

import { createRandomId } from '../../lib/utils';
import { templates } from '../data/templates';

// Permite controlar se o comportamento do mock será aleatório ou previsível
// Usar process.env.NODE_ENV === 'test' para detectar se está em teste automaticamente
const USE_PREDICTABLE_MOCK = process.env.USE_PREDICTABLE_MOCK === 'true' || process.env.NODE_ENV === 'test';

// Função para criar respostas de validação aleatórias ou previsíveis para testes
const generateValidationResponse = (branch: string, forceResult?: 'success' | 'error' | 'generic-error') => {
  // Se estamos em ambiente de teste, usamos resultados previsíveis baseados no branch
  if (USE_PREDICTABLE_MOCK) {
    // No ambiente de teste, o resultado é determinado pelo branch ou pelo parâmetro forceResult
    const resultType = forceResult || (
      branch === 'main' ? 'success' :
      branch === 'error' ? 'error' :
      branch === 'generic-error' ? 'generic-error' : 'success'
    );
    
    // Base para todos os resultados
    const baseResult = {
      branch,
      status: resultType
    };

    if (resultType === 'success') {
      return {
        ...baseResult,
        isValid: true,
        message: `Template validado com sucesso na branch "${branch}".`,
        chartInfo: {
          name: 'test-chart',
          version: '1.0.0',
          apiVersion: 'v2',
          description: 'Chart de teste para validação',
        },
        files: {
          chartYaml: true,
          valuesYaml: true,
          valuesSchemaJson: branch === 'with-schema',
        },
        warnings: branch === 'with-warnings' ? [
          'Adicione um arquivo values.schema.json para habilitar o editor visual de valores.',
          'Considere adicionar mais documentação no README.md.'
        ] : []
      };
    } else if (resultType === 'error') {
      return {
        ...baseResult,
        isValid: false,
        message: 'Arquivo Chart.yaml não encontrado no caminho informado.',
        errors: ['Arquivo Chart.yaml não encontrado no caminho informado.'],
        files: {
          chartYaml: false,
          valuesYaml: true,
          valuesSchemaJson: false,
        }
      };
    } else {
      return {
        ...baseResult,
        isValid: false,
        message: 'Verifique se o repositório e o caminho estão corretos.',
        errors: ['Erro inesperado durante a validação.']
      };
    }
  } 
  // Em ambiente de desenvolvimento, usamos resultados aleatórios para testes manuais
  else {
    // Determinar o resultado: success (60%), error (30%), generic-error (10%) por padrão
    // ou usar o resultado forçado se fornecido
    const resultType = forceResult || (Math.random() < 0.6 ? 'success' : Math.random() < 0.9 ? 'error' : 'generic-error');
    
    // Base para todos os resultados
    const baseResult = {
      branch,
      status: resultType
    };

    // Exemplo de erros que podem ocorrer
    const possibleErrors = [
      'Arquivo Chart.yaml não encontrado no caminho informado.',
      'Não foi possível acessar o repositório na branch especificada.',
      'O arquivo values.yaml contém sintaxe YAML inválida.',
      'O chart não segue as convenções de nomenclatura padrão.',
      'Formato do Chart.yaml não está em conformidade com a especificação Helm.',
      'Falha na autenticação com o repositório Git.',
      'Timeout ao acessar o repositório Git. Tente novamente mais tarde.',
    ];

    // Exemplo de avisos/recomendações
    const possibleWarnings = [
      'Adicione um arquivo values.schema.json para habilitar o editor visual de valores.',
      'Considere adicionar mais documentação no README.md.',
      'Versão apiVersion está desatualizada, considere usar v2.',
      'Faltam metadados importantes como maintainers e appVersion no Chart.yaml.',
      'Valores sensíveis como senhas devem ser parametrizados.',
      'Considere adicionar testes automatizados para o chart.',
      'Chart não inclui recursos para monitoramento, considere adicionar.',
    ];

    // Para resultados de sucesso
    if (resultType === 'success') {
      // Randomizar se alguns arquivos estão presentes
      const hasValuesSchema = Math.random() > 0.5;
      
      // Adicionar algumas recomendações aleatoriamente
      const warningCount = Math.floor(Math.random() * 3); // 0 a 2 recomendações
      const warnings = warningCount > 0 
        ? possibleWarnings
            .sort(() => 0.5 - Math.random())
            .slice(0, warningCount)
        : [];
      
      return {
        ...baseResult,
        isValid: true,
        message: `Template validado com sucesso na branch "${branch}".`,
        chartInfo: {
          name: `example-chart-${Math.floor(Math.random() * 100)}`,
          version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
          apiVersion: Math.random() > 0.3 ? 'v2' : 'v1',
          description: Math.random() > 0.3 ? 'Um chart exemplo para demonstração da validação' : undefined,
        },
        files: {
          chartYaml: true, // Sempre verdadeiro para sucesso
          valuesYaml: true, // Sempre verdadeiro para sucesso
          valuesSchemaJson: hasValuesSchema,
        },
        warnings
      };
    } 
    // Para erros de validação específicos
    else if (resultType === 'error') {
      // Escolher um erro aleatório
      const errorIndex = Math.floor(Math.random() * possibleErrors.length);
      const error = possibleErrors[errorIndex];
      
      return {
        ...baseResult,
        isValid: false,
        message: error,
        errors: [error],
        // Dependendo do erro, alguns arquivos podem estar presentes
        files: {
          chartYaml: errorIndex !== 0, // Se o erro for "Chart.yaml não encontrado", então é falso
          valuesYaml: Math.random() > 0.3, // 70% de chance de ter values.yaml
          valuesSchemaJson: Math.random() > 0.7, // 30% de chance de ter values.schema.json
        }
      };
    }
    // Para erros genéricos/inesperados
    else {
      return {
        ...baseResult,
        isValid: false,
        message: 'Verifique se o repositório e o caminho estão corretos.',
        errors: ['Erro inesperado durante a validação.']
      };
    }
  }
};

export const templateHandlers = [
  // Get all templates
  http.get('/api/templates', async () => {
    await delay(500);

    return HttpResponse.json(templates);
  }),

  // Create template
  http.post('/api/templates', async ({ request }) => {
    const newTemplate = await request.json();
    const createdTemplate = {
      id: createRandomId(),
      ...newTemplate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    templates.push(createdTemplate);

    await delay(1000);

    return HttpResponse.json(createdTemplate, { status: 201 });
  }),

  // Validate template data
  http.post('/api/templates/validate', async ({ request }) => {
    const data = await request.json();
    const { branch } = data;

    // Gerar uma resposta baseada no ambiente (teste ou desenvolvimento)
    const validationResult = generateValidationResponse(branch, 
      // Você pode forçar um tipo específico descomentando uma das opções abaixo
      // 'success',
      // 'error',
      // 'generic-error',
    );

    await delay(USE_PREDICTABLE_MOCK ? 100 : Math.random() * 2000 + 500);

    if (!validationResult.isValid) {
      // Para erros, retornar status 400
      return HttpResponse.json(validationResult, { status: 400 });
    }

    return HttpResponse.json(validationResult, { status: 200 });
  }),

  // Validate existing template
  http.post('/api/templates/:id/validate', async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const branch = url.searchParams.get('branch') || 'main';
    const template = templates.find((t) => t.id === id);

    if (!template) {
      await delay(USE_PREDICTABLE_MOCK ? 50 : 500);

      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    // Gerar uma resposta baseada no ambiente (teste ou desenvolvimento)
    const validationResult = generateValidationResponse(branch, 
      // Você pode forçar um tipo específico descomentando uma das opções abaixo
      // 'success',
      // 'error',
      // 'generic-error',
    );

    await delay(USE_PREDICTABLE_MOCK ? 100 : Math.random() * 2000 + 500);

    if (!validationResult.isValid) {
      // Para erros, retornar status 400
      return HttpResponse.json(validationResult, { status: 400 });
    }

    return HttpResponse.json(validationResult, { status: 200 });
  }),
  
  // Get template by id
  http.get('/api/templates/:id', async ({ params }) => {
    const { id } = params;
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    await delay(500);

    return HttpResponse.json(template);
  }),

  // Update template
  http.put('/api/templates/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedTemplate = await request.json();
    const templateIndex = templates.findIndex((t) => t.id === id);

    if (templateIndex === -1) {
      return HttpResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    const updated = {
      ...templates[templateIndex],
      ...updatedTemplate,
      updatedAt: new Date().toISOString(),
    };

    templates[templateIndex] = updated;

    await delay(1000);

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

    await delay(1000);

    return new HttpResponse(null, { status: 204 });
  }),
];
