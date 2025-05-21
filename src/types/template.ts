// Types for Template functionality
export interface Template {
  id: string;
  name: string;
  version: string;
  description?: string;
  gitRepositoryUrl: string;
  gitRepositoryId: string;
  branch: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  hasBlueprints: boolean;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  gitRepositoryId: string;
  branch: string;
  path: string;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  gitRepositoryId?: string;
  branch?: string;
  path?: string;
}

export interface TemplateChartInfo {
  name: string;
  version: string;
  description?: string;
  isValid: boolean;
  validationMessage?: string;
}

export interface TemplatePreview {
  chartYaml?: string;
  valuesSchemaJson?: string;
  valuesYaml?: string;
}

export interface GitTreeItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  isHelmChart?: boolean;
}

export interface GitRepository {
  id: string;
  name: string;
  url: string;
}

export interface GitBranch {
  name: string;
  isDefault: boolean;
}
