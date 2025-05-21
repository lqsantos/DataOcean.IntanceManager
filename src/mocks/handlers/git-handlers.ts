import { delay, http, HttpResponse } from 'msw';

import { gitBranches } from '../data/git-branches';
import { gitRepos } from '../data/git-repos';
import { gitTreeStructure } from '../data/git-tree-structure';

export const gitHandlers = [
  // GET /git/repos - List all Git repositories
  http.get('/api/git/repos', () => {
    return HttpResponse.json(gitRepos);
  }),

  // GET /git/repos/:repo/branches - Get branches for a repository
  http.get('/api/git/repos/:repoId/branches', ({ params }) => {
    const branches = gitBranches.filter((branch) => branch.repositoryId === params.repoId);

    if (branches.length === 0) {
      return HttpResponse.json([]);
    }

    return HttpResponse.json(branches);
  }),

  // GET /git/repos/:repo/tree - Get tree structure for a repository and branch
  http.get('/api/git/repos/:repoId/tree', async ({ params, request }) => {
    // Adicionar um delay para simular o carregamento
    await delay(400); // Reduzir o atraso para facilitar o teste e debug

    const url = new URL(request.url);
    const branch = url.searchParams.get('branch');
    const path = url.searchParams.get('path') || '';

    if (!branch) {
      return new HttpResponse({ message: 'Branch parameter is required' }, { status: 400 });
    }

    console.log(
      `[MSW] Fetching tree for repo: ${params.repoId}, branch: ${branch}, path: '${path}'`
    );

    // Normalizar o caminho para a comparação
    // Para a raiz, sempre use null
    const normalizedPath = path === '' ? null : path.startsWith('/') ? path : `/${path}`;

    console.log(`[MSW] Normalized path: ${normalizedPath}`);

    // Filtrar itens com base no normalizedPath como parentPath
    const items = gitTreeStructure.filter((item) => {
      const match =
        item.repositoryId === params.repoId &&
        item.branch === branch &&
        item.parentPath === normalizedPath;

      if (match) {
        console.log(`[MSW] Matched item: ${item.path}`);
      }

      return match;
    });

    console.log(`[MSW] Found ${items.length} items with parent path: ${normalizedPath}`);

    // Mapear os itens para o formato esperado pelo componente
    const mappedItems = items.map((item) => ({
      // Remover barra inicial do caminho para usar formato consistente
      path: item.path.startsWith('/') ? item.path.substring(1) : item.path,
      name: item.name,
      // Converter 'directory'/'file' para 'tree'/'blob' conforme esperado pelo componente
      type: item.type === 'directory' ? 'tree' : 'blob',
      isChartDirectory: item.isHelmChart || false,
    }));

    console.log(`[MSW] Returning ${mappedItems.length} mapped items for path: ${normalizedPath}`);

    return HttpResponse.json(mappedItems);
  }),

  // GET /git/repos/:repo/file - Get file content
  http.get('/api/git/repos/:repoId/file', async ({ params, request }) => {
    // Adicionar um delay para simular o carregamento
    await delay(800);

    const url = new URL(request.url);
    const branch = url.searchParams.get('branch');
    const path = url.searchParams.get('path');

    if (!branch || !path) {
      return new HttpResponse(
        { message: 'Branch and path parameters are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would fetch the actual file content
    // Here we just return a placeholder content based on the file extension
    let content = '';

    if (path.endsWith('.yaml') || path.endsWith('.yml')) {
      content = `# Example YAML content for ${path}\n\nname: example-chart\nversion: 1.0.0\ndescription: Example Helm chart\napiVersion: v2\ntype: application\nappVersion: "1.0.0"`;
    } else if (path.endsWith('.json')) {
      content =
        '{\n  "type": "object",\n  "required": ["name", "replicas"],\n  "properties": {\n    "name": {\n      "type": "string",\n      "description": "Name for the deployment"\n    },\n    "replicas": {\n      "type": "integer",\n      "minimum": 1,\n      "description": "Number of pods to run"\n    }\n  }\n}';
    } else {
      content = `Example content for ${path}`;
    }

    return HttpResponse.json(content);
  }),
];
