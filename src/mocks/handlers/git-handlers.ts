import { http, HttpResponse } from 'msw';

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
  http.get('/api/git/repos/:repoId/tree', ({ params, request }) => {
    const url = new URL(request.url);
    const branch = url.searchParams.get('branch');
    const path = url.searchParams.get('path') || '';

    if (!branch) {
      return new HttpResponse({ message: 'Branch parameter is required' }, { status: 400 });
    }

    const items = gitTreeStructure.filter(
      (item) =>
        item.repositoryId === params.repoId &&
        item.branch === branch &&
        (path === '' ? item.parentPath === null : item.parentPath === path)
    );

    return HttpResponse.json(
      items.map((item) => ({
        path: item.path,
        name: item.name,
        type: item.type,
        isHelmChart: item.isHelmChart || false,
      }))
    );
  }),

  // GET /git/repos/:repo/file - Get file content
  http.get('/api/git/repos/:repoId/file', ({ params, request }) => {
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
      content = `# Example YAML content for ${path}`;
    } else if (path.endsWith('.json')) {
      content = `{ "message": "Example JSON content for ${path}" }`;
    } else {
      content = `Example content for ${path}`;
    }

    return HttpResponse.json(content);
  }),
];
