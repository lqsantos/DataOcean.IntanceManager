import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

import { gitRepos } from '../data/git-repos';
import { helmChartFiles } from '../data/helm-chart-files';
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

    // Validate required fields
    if (!data.name || !data.gitRepositoryId || !data.branch || !data.path) {
      return new HttpResponse({ message: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    // Create a new template with the data provided
    const newTemplate = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      gitRepositoryId: data.gitRepositoryId,
      gitRepositoryUrl: gitRepos.find((repo) => repo.id === data.gitRepositoryId)?.url || '',
      branch: data.branch,
      path: data.path,
      version: '1.0.0', // Default or from validation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasBlueprints: false,
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

    // If repository changed, update the URL
    if (data.gitRepositoryId && data.gitRepositoryId !== templates[templateIndex].gitRepositoryId) {
      updatedTemplate.gitRepositoryUrl =
        gitRepos.find((repo) => repo.id === data.gitRepositoryId)?.url || '';
    }

    templates[templateIndex] = updatedTemplate;

    return HttpResponse.json(updatedTemplate);
  }),

  // DELETE /templates/:id - Delete a template
  http.delete('/api/templates/:id', ({ params }) => {
    const templateIndex = templates.findIndex((t) => t.id === params.id);

    if (templateIndex === -1) {
      return new HttpResponse({ message: 'Template não encontrado' }, { status: 404 });
    }

    // Check if the template has blueprints
    if (templates[templateIndex].hasBlueprints) {
      return new HttpResponse(
        { message: 'Não é possível excluir um template vinculado a blueprints' },
        { status: 400 }
      );
    }

    templates.splice(templateIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /templates/validate - Validate a template path
  http.post('/api/templates/validate', async ({ request }) => {
    const { gitRepositoryId, branch, path } = await request.json();

    // Simulate validation logic checking for Chart.yaml and values.schema.json
    const hasChartYaml = helmChartFiles.some(
      (file) =>
        file.gitRepositoryId === gitRepositoryId &&
        file.branch === branch &&
        file.path === `${path}/Chart.yaml`
    );

    const hasValuesSchema = helmChartFiles.some(
      (file) =>
        file.gitRepositoryId === gitRepositoryId &&
        file.branch === branch &&
        file.path === `${path}/values.schema.json`
    );

    // Get chart info if valid
    const chartYamlFile = helmChartFiles.find(
      (file) =>
        file.gitRepositoryId === gitRepositoryId &&
        file.branch === branch &&
        file.path === `${path}/Chart.yaml`
    );

    const isValid = hasChartYaml && hasValuesSchema;

    if (isValid && chartYamlFile) {
      // Parse Chart.yaml content to extract info (simplified mock)
      return HttpResponse.json({
        name: 'my-chart', // In a real implementation, we would parse this from the YAML
        version: '1.0.0',
        description: 'A Helm chart for Kubernetes application deployment',
        isValid: true,
      });
    }

    return HttpResponse.json({
      isValid: false,
      validationMessage: !hasChartYaml
        ? 'Chart.yaml não encontrado'
        : 'values.schema.json não encontrado',
    });
  }),

  // POST /templates/preview - Get preview of template files
  http.post('/api/templates/preview', async ({ request }) => {
    const { gitRepositoryId, branch, path } = await request.json();

    // Find the content for each file if it exists
    const chartYamlFile = helmChartFiles.find(
      (file) =>
        file.gitRepositoryId === gitRepositoryId &&
        file.branch === branch &&
        file.path === `${path}/Chart.yaml`
    );

    const valuesSchemaFile = helmChartFiles.find(
      (file) =>
        file.gitRepositoryId === gitRepositoryId &&
        file.branch === branch &&
        file.path === `${path}/values.schema.json`
    );

    const valuesYamlFile = helmChartFiles.find(
      (file) =>
        file.gitRepositoryId === gitRepositoryId &&
        file.branch === branch &&
        file.path === `${path}/values.yaml`
    );

    return HttpResponse.json({
      chartYaml: chartYamlFile?.content,
      valuesSchemaJson: valuesSchemaFile?.content,
      valuesYaml: valuesYamlFile?.content,
    });
  }),
];
