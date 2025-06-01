// types/blueprint.ts

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  category?: string;
  templateId: string; // Template base (principal)
  templateName?: string;
  createdAt: string;
  updatedAt: string;
  variables?: BlueprintVariable[];
  childTemplates?: BlueprintChildTemplate[]; // Aplicações filhas
  helperTpl?: string; // Conteúdo do helper.tpl
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
  category?: string;
  templateId: string; // Template principal
  childTemplates?: Omit<BlueprintChildTemplate, 'order'>[]; // Templates filhos sem ordem
}

export interface UpdateBlueprintDto {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  variables?: BlueprintVariable[];
  childTemplates?: Omit<BlueprintChildTemplate, 'templateName'>[]; // Templates filhos com ordem
  helperTpl?: string; // Helper.tpl para atualização manual
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
