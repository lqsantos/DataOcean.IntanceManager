import { useCallback, useState } from 'react';

import { GitService } from '@/services/git-service';
import type { GitBranch, GitRepository, GitTreeItem } from '@/types/template';

export function useGitNavigation() {
  const [repositories, setRepositories] = useState<GitRepository[]>([]);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [treeItems, setTreeItems] = useState<GitTreeItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Git repositories
  const fetchRepositories = useCallback(async () => {
    try {
      setIsLoadingRepos(true);
      setError(null);
      const data = await GitService.getRepositories();

      setRepositories(data);

      return data;
    } catch (err) {
      console.error('Failed to fetch Git repositories:', err);
      setError('Não foi possível carregar os repositórios Git. Tente novamente mais tarde.');

      return [];
    } finally {
      setIsLoadingRepos(false);
    }
  }, []);

  // Fetch branches for a specific repository
  const fetchBranches = useCallback(async (repositoryId: string) => {
    try {
      setIsLoadingBranches(true);
      setError(null);
      const data = await GitService.getBranches(repositoryId);

      setBranches(data);

      return data;
    } catch (err) {
      console.error('Failed to fetch Git branches:', err);
      setError('Não foi possível carregar os branches do repositório. Tente novamente mais tarde.');

      return [];
    } finally {
      setIsLoadingBranches(false);
    }
  }, []);

  // Fetch tree structure for a specific repository and branch
  const fetchTreeStructure = useCallback(
    async (repositoryId: string, branch: string, path?: string) => {
      try {
        setIsLoadingTree(true);
        setError(null);
        const data = await GitService.getTreeStructure(repositoryId, branch, path);

        setTreeItems(data);

        return data;
      } catch (err) {
        console.error('Failed to fetch Git tree structure:', err);
        setError(
          'Não foi possível carregar a estrutura de diretórios. Tente novamente mais tarde.'
        );

        return [];
      } finally {
        setIsLoadingTree(false);
      }
    },
    []
  );

  // Get the repository URL by ID
  const getRepositoryUrl = useCallback(
    (repositoryId: string) => {
      const repository = repositories.find((repo) => repo.id === repositoryId);

      return repository?.url || '';
    },
    [repositories]
  );

  return {
    repositories,
    branches,
    treeItems,
    isLoadingRepos,
    isLoadingBranches,
    isLoadingTree,
    error,
    fetchRepositories,
    fetchBranches,
    fetchTreeStructure,
    getRepositoryUrl,
  };
}
