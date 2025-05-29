// types/blueprint.ts

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  category?: string;
  templateId: string;
  templateName?: string;
  createdAt: string;
  updatedAt: string;
  variables?: BlueprintVariable[];
}

export interface BlueprintVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  options?: string[];
}

export interface CreateBlueprintDto {
  name: string;
  description?: string;
  category?: string;
  templateId: string;
}

export interface UpdateBlueprintDto {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  variables?: BlueprintVariable[];
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
