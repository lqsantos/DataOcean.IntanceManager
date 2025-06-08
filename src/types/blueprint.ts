// types/blueprint.ts

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  version: string; // Campo de versão adicionado
  applicationId: string; // Identificador da aplicação associada
  templateName?: string;
  createdAt: string;
  updatedAt: string;
  variables?: BlueprintVariable[];
  childTemplates?: BlueprintChildTemplate[]; // Templates associados ao blueprint
  // helperTpl removido - será gerado e usado apenas no backend
}

export interface BlueprintVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  options?: string[];
}

// Nova interface para templates filhos associados
export interface BlueprintChildTemplate {
  templateId: string;
  templateName?: string;
  order: number; // Ordem de aplicação
  overrideValues?: string; // Valores personalizados em formato YAML
}

export interface CreateBlueprintDto {
  name: string;
  description?: string;
  version: string; // Campo de versão adicionado
  applicationId: string;
  childTemplates?: Omit<BlueprintChildTemplate, 'order'>[]; // Templates associados ao blueprint
  variables?: BlueprintVariable[];
}

export interface UpdateBlueprintDto {
  id: string;
  name?: string;
  description?: string;
  version?: string; // Campo de versão adicionado
  applicationId?: string;
  variables?: BlueprintVariable[];
  childTemplates?: Omit<BlueprintChildTemplate, 'templateName'>[]; // Templates filhos com ordem
}

export interface BlueprintWithTemplate extends Blueprint {
  template: {
    id: string;
    name: string;
    chartPath: string;
    repositoryUrl: string;
    valuesYaml?: string;
  };
}
