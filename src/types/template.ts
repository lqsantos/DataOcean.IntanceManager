// Types for Template functionality
export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  repositoryUrl: string;
  chartPath: string;
  version?: string;
  isActive: boolean;
  valuesYaml?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category?: string;
  repositoryUrl: string;
  chartPath: string;
  version?: string;
  isActive?: boolean;
  valuesYaml?: string;
}

export interface UpdateTemplateDto {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  repositoryUrl?: string;
  chartPath?: string;
  version?: string;
  isActive?: boolean;
  valuesYaml?: string;
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
