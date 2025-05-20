export type GitProvider = 'github' | 'gitlab' | 'azure-devops';

export interface GitSource {
  id: string;
  name: string;
  provider: GitProvider;
  url: string;
  token?: string;
  namespace?: string;
  organization?: string;
  project?: string;
  status: 'active' | 'inactive';
  repositoryCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGitSourceDto {
  name: string;
  provider: GitProvider;
  url: string;
  token: string;
  namespace?: string;
  organization?: string;
  project?: string;
  notes?: string;
}

export interface UpdateGitSourceDto {
  name?: string;
  url?: string;
  token?: string;
  namespace?: string;
  organization?: string;
  project?: string;
  notes?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  repositoryCount?: number;
}
