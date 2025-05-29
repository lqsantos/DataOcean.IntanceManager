// Types for Template functionality
export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  repositoryUrl: string;
  chartPath: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category?: string;
  repositoryUrl: string;
  chartPath: string;
  isActive?: boolean;
}

export interface UpdateTemplateDto {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  repositoryUrl?: string;
  chartPath?: string;
  isActive?: boolean;
}

export interface TemplateChartInfo {
  name: string;
  version: string;
  description?: string;
  isValid: boolean;
  validationMessage?: string;
}

export interface TemplateValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
  warnings?: string[];
}

export interface GitTreeItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  isHelmChart?: boolean;
}
