// Types for Template functionality
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  repositoryUrl: string;
  chartPath: string;
  createdAt: string;
  updatedAt: string;
  lastValidatedAt?: string; // Data da última validação bem-sucedida
  isActive?: boolean;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: string;
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
  lastValidatedAt?: string;
}

export interface TemplateChartInfo {
  name: string;
  version: string;
  description?: string;
  isValid: boolean;
  validationMessage?: string;
}

// Expandindo o tipo para validação de templates com os requisitos detalhados
export interface TemplateValidationResult {
  isValid: boolean;
  status?: 'none' | 'success' | 'error' | 'generic-error';
  message?: string;
  errors?: string[];
  warnings?: string[];

  // Novos campos para detalhes do Chart.yaml
  chartInfo?: {
    name?: string;
    version?: string;
    apiVersion?: string;
    description?: string;
  };

  // Informações sobre arquivos encontrados
  files?: {
    chartYaml: boolean;
    valuesYaml: boolean;
    valuesSchemaJson: boolean;
  };

  // Branch usada para validação (já temos via selectedBranch no componente)
  branch?: string;
}

export enum TemplateTab {
  DETAILS = 'details',
  VALUES = 'values',
}

// Para criação de uma instância baseada em template
export interface TemplateInstance {
  templateId: string;
  customValues?: Record<string, unknown>;
}

export interface GitTreeItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  isHelmChart?: boolean;
}
