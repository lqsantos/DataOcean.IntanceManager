import type { GitBranch, GitRepository, GitTreeItem } from '@/types/template';

const API_BASE_URL = '/api';

export const GitService = {
  async getRepositories(): Promise<GitRepository[]> {
    const response = await fetch(`${API_BASE_URL}/git/repos`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar repositórios Git');
    }

    return response.json();
  },

  async getBranches(repositoryId: string): Promise<GitBranch[]> {
    const response = await fetch(`${API_BASE_URL}/git/repos/${repositoryId}/branches`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar branches do repositório');
    }

    return response.json();
  },

  async getTreeStructure(
    repositoryId: string,
    branch: string,
    path?: string
  ): Promise<GitTreeItem[]> {
    const queryParams = new URLSearchParams({ branch });

    if (path) {
      queryParams.append('path', path);
    }

    const response = await fetch(
      `${API_BASE_URL}/git/repos/${repositoryId}/tree?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar estrutura de diretórios');
    }

    return response.json();
  },

  async getFileContent(repositoryId: string, branch: string, path: string): Promise<string> {
    const queryParams = new URLSearchParams({ branch, path });

    const response = await fetch(
      `${API_BASE_URL}/git/repos/${repositoryId}/file?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.message || 'Falha ao buscar conteúdo do arquivo');
    }

    return response.json();
  },
};
