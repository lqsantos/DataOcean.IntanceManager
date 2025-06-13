// types/blueprint.ts

// Importações para implementação das funções utilitárias
import * as YAML from 'yaml';

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
  identifier: string; // Identificador único para referência ao template
  overrideValues?: string; // Valores personalizados em formato YAML
  valueConfiguration?: ValueConfiguration; // Nova estrutura tipada para configurações
}

// Tipos para o sistema de configuração de valores

/**
 * Tipos de valores suportados
 */
export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Configuração base para todos os tipos de campos
 */
export interface BaseFieldConfiguration {
  /** Caminho completo do campo na estrutura aninhada */
  path: string;

  /** Valor atual configurado */
  value: unknown;

  /** Se o valor foi personalizado no blueprint (diferente do template) */
  isCustomized: boolean;

  /** Se o campo é exposto para configuração em instâncias */
  isExposed: boolean;

  /** Se o campo pode ser sobrescrito em instâncias */
  isOverridable: boolean;

  /** Se o campo é requerido */
  isRequired?: boolean;

  /** Descrição do campo */
  description?: string;

  /** Valor padrão do template (para referência e reset) */
  templateDefault?: unknown;
}

/**
 * Configuração para campos primitivos (string, number, boolean)
 */
export interface SimpleFieldConfiguration extends BaseFieldConfiguration {
  type: 'string' | 'number' | 'boolean';
}

/**
 * Configuração para campos de objeto (mapa de chave-valor)
 */
export interface ObjectFieldConfiguration extends BaseFieldConfiguration {
  type: 'object';
  properties: Record<string, FieldConfiguration>;
}

/**
 * Configuração para campos de array
 */
export interface ArrayFieldConfiguration extends BaseFieldConfiguration {
  type: 'array';
  items: Array<{
    id: string; // Identificador único e estável para o item
    value: FieldConfiguration;
  }>;
}

/**
 * União de todos os tipos possíveis de configuração de campo
 */
export type FieldConfiguration =
  | SimpleFieldConfiguration
  | ObjectFieldConfiguration
  | ArrayFieldConfiguration;

/**
 * Estrutura principal de configuração de valores
 */
export interface ValueConfiguration {
  /**
   * Mapa de todos os campos configurados, usando caminho completo como chave.
   * Exemplo: { "service.type": {...}, "service.ports[0].port": {...} }
   */
  fields: Record<string, FieldConfiguration>;
}

export interface CreateBlueprintDto {
  name: string;
  description?: string;
  version: string; // Campo de versão adicionado
  applicationId: string;
  childTemplates?: Array<{
    templateId: string;
    identifier: string;
    overrideValues?: string;
    valueConfiguration?: ValueConfiguration;
  }>; // Templates associados ao blueprint
  variables?: BlueprintVariable[];
}

export interface UpdateBlueprintDto {
  id: string;
  name?: string;
  description?: string;
  version?: string; // Campo de versão adicionado
  applicationId?: string;
  variables?: BlueprintVariable[];
  childTemplates?: Array<{
    templateId: string;
    identifier: string;
    order: number;
    overrideValues?: string;
    valueConfiguration?: ValueConfiguration;
  }>; // Templates filhos com ordem
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

// Interface para representar os valores do formulário após a refatoração
export interface BlueprintFormValues {
  id?: string; // Opcional, presente apenas no modo de edição
  name: string;
  description: string;
  version: string;
  applicationId: string;
  childTemplates: Array<{
    templateId: string;
    identifier: string;
    order: number;
    overrideValues?: string;
    valueConfiguration?: ValueConfiguration; // Nova estrutura tipada para configurações
  }>;
  variables: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: string;
  }>;
  defaultValues?: Record<string, Record<string, unknown>>;
}

/**
 * Funções utilitárias para conversão entre YAML e ValueConfiguration
 * Implementações básicas para demonstração - devem ser refinadas em um arquivo separado
 */

/**
 * Função auxiliar para acessar propriedades aninhadas de um objeto
 * (simplificada para não depender do lodash)
 */
function getNestedProperty(obj: Record<string, unknown>, path: string): unknown {
  // Retorno rápido para objetos nulos/undefined ou caminhos vazios
  if (!obj || !path) {
    return undefined;
  }

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    // Verifica se o objeto atual é válido
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }

    // Lidar com índices de array como "array[0]"
    const match = part.match(/^(.*?)\[(\d+)\]$/);

    if (match) {
      const arrayName = match[1];
      const index = parseInt(match[2], 10);

      if (!Array.isArray(current[arrayName])) {
        return undefined;
      }

      const arr = current[arrayName] as unknown[];

      // Verifica se o índice está dentro dos limites
      if (index < 0 || index >= arr.length) {
        return undefined;
      }

      current = (arr[index] || {}) as Record<string, unknown>;
    } else {
      current = current[part] as Record<string, unknown>;

      // Se a propriedade não existe, retorna undefined
      if (current === undefined) {
        return undefined;
      }
    }
  }

  return current;
}

/**
 * Função auxiliar para definir propriedades aninhadas em um objeto
 * (simplificada para não depender do lodash)
 */
function setNestedProperty(obj: Record<string, unknown>, path: string, value: unknown): void {
  // Verifica entradas inválidas
  if (!obj || !path) {
    return;
  }

  const parts = path.split('.');
  let current = obj;

  // Navega na estrutura aninhada, criando objetos/arrays conforme necessário
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // Lidar com índices de array como "array[0]"
    const match = part.match(/^(.*?)\[(\d+)\]$/);

    if (match) {
      const arrayName = match[1];
      const index = parseInt(match[2], 10);

      // Garante que temos um array
      if (!Array.isArray(current[arrayName])) {
        current[arrayName] = [] as unknown[];
      }

      const arr = current[arrayName] as unknown[];

      // Preenche o array com objetos vazios até o índice necessário
      while (arr.length <= index) {
        arr.push({});
      }

      // Navega para o item do array
      current = arr[index] as Record<string, unknown>;
    } else {
      // Cria um objeto vazio se a propriedade não existir
      if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
        current[part] = {};
      }

      current = current[part] as Record<string, unknown>;
    }
  }

  // Processa o último segmento do caminho para definir o valor
  const lastPart = parts[parts.length - 1];
  const match = lastPart.match(/^(.*?)\[(\d+)\]$/);

  if (match) {
    const arrayName = match[1];
    const index = parseInt(match[2], 10);

    // Garante que temos um array
    if (!Array.isArray(current[arrayName])) {
      current[arrayName] = [] as unknown[];
    }

    const arr = current[arrayName] as unknown[];

    // Preenche o array com valores nulos até o índice necessário
    while (arr.length <= index) {
      arr.push(null);
    }

    // Define o valor no índice especificado
    arr[index] = value;
  } else {
    // Define o valor diretamente na propriedade
    current[lastPart] = value;
  }
}

/**
 * Função auxiliar para identificar o tipo de um valor
 * Esta função é usada internamente pelo yamlToValueConfiguration
 * quando encontra campos sem tipo definido nos templateFields
 */
function _detectValueType(value: unknown): ValueType {
  if (value === null || value === undefined) {
    return 'string'; // Tipo padrão para valores nulos/indefinidos
  }

  const valueType = typeof value;

  if (valueType === 'string') {
    return 'string';
  }

  if (valueType === 'number') {
    return 'number';
  }

  if (valueType === 'boolean') {
    return 'boolean';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (valueType === 'object') {
    return 'object';
  }

  // Fallback para string
  return 'string';
}

/**
 * Converte uma configuração de valores para formato YAML
 *
 * @param config - A configuração de valores tipada
 * @returns String em formato YAML
 */
export function valueConfigurationToYaml(config: ValueConfiguration): string {
  try {
    // Cria um objeto para armazenar os valores customizados
    const yamlObject: Record<string, unknown> = {};

    // Extrai apenas os campos customizados
    Object.entries(config.fields)
      .filter(([, fieldConfig]) => fieldConfig.isCustomized)
      .forEach(([path, fieldConfig]) => {
        // Define o valor na estrutura aninhada
        setNestedProperty(yamlObject, path, fieldConfig.value);
      });

    // Utiliza a biblioteca YAML para serializar o objeto
    const result = YAML.stringify(yamlObject);

    return result;
  } catch (error) {
    // Log do erro e retorno de string vazia
    console.error('Erro ao converter ValueConfiguration para YAML:', error);

    return '';
  }
}

/**
 * Converte uma string YAML em uma configuração de valores tipada
 *
 * @param yaml - String em formato YAML
 * @param templateFields - Lista de campos do template para referência de tipos e valores padrão
 * @returns Configuração de valores tipada
 */
export function yamlToValueConfiguration(
  yaml: string,
  templateFields: Array<{ path: string; type: ValueType; defaultValue?: unknown }>
): ValueConfiguration {
  const valueConfig: ValueConfiguration = {
    fields: {},
  };

  if (!yaml || yaml.trim() === '') {
    return valueConfig;
  }

  try {
    // Utiliza a biblioteca YAML para converter a string para objeto
    const yamlObject = YAML.parse(yaml) as Record<string, unknown>;

    // Cria um mapa de campos do template para acesso mais rápido
    type TemplateField = {
      path: string;
      type: ValueType;
      defaultValue?: unknown;
    };
    const templateFieldsMap: Record<string, TemplateField> = {};

    // Preenche o mapa com os campos do template
    templateFields.forEach((field) => {
      templateFieldsMap[field.path] = field;
    });

    // Processa todos os campos do template
    templateFields.forEach(({ path, type, defaultValue }) => {
      // Tenta obter o valor do YAML usando o caminho
      const value = getNestedProperty(yamlObject, path);

      // Determina se o valor foi customizado
      const isCustomized = value !== undefined && value !== defaultValue;

      // Cria a configuração do campo baseada no tipo
      let fieldConfig: FieldConfiguration;

      // Determina valor a ser usado
      const resolvedValue = isCustomized ? value : defaultValue;

      if (type === 'object') {
        // Para objetos, processamos as propriedades internas
        const objectValue = (resolvedValue as Record<string, unknown>) || {};
        const properties: Record<string, FieldConfiguration> = {};

        // Cria a configuração base para o objeto
        fieldConfig = {
          path,
          type: 'object',
          value: objectValue,
          isCustomized,
          isExposed: false, // Valor padrão, deve ser ajustado conforme necessário
          isOverridable: true, // Valor padrão, deve ser ajustado conforme necessário
          isRequired: false, // Valor padrão, deve ser ajustado conforme necessário
          templateDefault: defaultValue,
          properties,
        };

        // Procura por subcampos nos templateFields com este caminho como prefixo
        const prefix = path ? `${path}.` : '';

        Object.entries(objectValue).forEach(([key, propValue]) => {
          const propPath = `${prefix}${key}`;
          const propType = _detectValueType(propValue);

          // Verifica se temos informação do template para esta propriedade
          const templateField = templateFieldsMap[propPath];

          // Cria a configuração para esta propriedade
          properties[key] = {
            path: propPath,
            type: propType,
            value: propValue,
            isCustomized: true,
            isExposed: false,
            isOverridable: true,
            isRequired: false,
            templateDefault: templateField?.defaultValue,
          } as FieldConfiguration;
        });
      } else if (type === 'array') {
        // Para arrays, processamos os itens
        const arrayValue = (resolvedValue as unknown[]) || [];
        const items: Array<{ id: string; value: FieldConfiguration }> = [];

        // Cria a configuração base para o array
        fieldConfig = {
          path,
          type: 'array',
          value: arrayValue,
          isCustomized,
          isExposed: false,
          isOverridable: true,
          isRequired: false,
          templateDefault: defaultValue,
          items,
        };

        // Processa cada item do array
        arrayValue.forEach((item, index) => {
          const itemType = _detectValueType(item);
          const itemId = `${path}[${index}]`;

          // Cria a configuração para este item
          items.push({
            id: itemId,
            value: {
              path: itemId,
              type: itemType,
              value: item,
              isCustomized: true,
              isExposed: false,
              isOverridable: true,
              isRequired: false,
              templateDefault: undefined,
            } as FieldConfiguration,
          });
        });
      } else {
        // Para tipos primitivos (string, number, boolean)
        fieldConfig = {
          path,
          type: type as 'string' | 'number' | 'boolean',
          value: resolvedValue,
          isCustomized,
          isExposed: false,
          isOverridable: true,
          isRequired: false,
          templateDefault: defaultValue,
        };
      }

      // Adiciona o campo à configuração
      valueConfig.fields[path] = fieldConfig;
    });

    return valueConfig;
  } catch (error) {
    // Log do erro e retorno da configuração vazia
    console.error('Erro ao converter YAML para ValueConfiguration:', error);

    return valueConfig;
  }
}

/**
 * Converte a estrutura antiga (campos planos) para a nova estrutura tipada
 * Função auxiliar para migração de dados
 *
 * @param fields - Campos no formato antigo
 * @returns Configuração de valores no novo formato tipado
 */
export function convertLegacyFieldsToValueConfiguration(
  fields: Array<{
    path: string[];
    key: string;
    value: unknown;
    type: string;
    source: string;
    exposed: boolean;
    overridable: boolean;
    required: boolean;
    originalValue?: unknown;
  }>
): ValueConfiguration {
  // Inicializa a configuração de valores
  const valueConfig: ValueConfiguration = {
    fields: {},
  };

  // Para cada campo no formato antigo
  fields.forEach((field) => {
    // Converte o array de caminhos para uma string pontilhada
    const pathString = field.path.join('.');

    // Mapeamento direto dos valores comuns
    const baseConfig = {
      path: pathString,
      value: field.value,
      isCustomized: field.source === 'blueprint',
      isExposed: field.exposed,
      isOverridable: field.overridable,
      isRequired: field.required,
      templateDefault: field.originalValue,
    };

    // Determinar o tipo e criar a configuração apropriada
    let fieldConfig: FieldConfiguration;

    switch (field.type) {
      case 'object': {
        const objectValue = (field.value as Record<string, unknown>) || {};
        const properties: Record<string, FieldConfiguration> = {};

        // Preenche as propriedades com base no valor atual
        Object.entries(objectValue).forEach(([key, propValue]) => {
          const propPath = `${pathString}.${key}`;
          const propType = _detectValueType(propValue);

          // Cria a configuração para esta propriedade
          properties[key] = {
            path: propPath,
            type: propType,
            value: propValue,
            isCustomized: field.source === 'blueprint',
            isExposed: field.exposed,
            isOverridable: field.overridable,
            isRequired: false,
          } as FieldConfiguration;
        });

        fieldConfig = {
          ...baseConfig,
          type: 'object',
          properties,
        } as ObjectFieldConfiguration;
        break;
      }

      case 'array': {
        const arrayValue = (field.value as unknown[]) || [];
        const items: Array<{ id: string; value: FieldConfiguration }> = [];

        // Processa cada item do array
        arrayValue.forEach((item, index) => {
          const itemType = _detectValueType(item);
          const itemId = `${pathString}[${index}]`;

          // Cria a configuração para este item
          items.push({
            id: itemId,
            value: {
              path: itemId,
              type: itemType,
              value: item,
              isCustomized: field.source === 'blueprint',
              isExposed: field.exposed,
              isOverridable: field.overridable,
              isRequired: false,
            } as FieldConfiguration,
          });
        });

        fieldConfig = {
          ...baseConfig,
          type: 'array',
          items,
        } as ArrayFieldConfiguration;
        break;
      }

      case 'number':
      case 'boolean':
      case 'string':
        fieldConfig = {
          ...baseConfig,
          type: field.type as 'string' | 'number' | 'boolean',
        } as SimpleFieldConfiguration;
        break;

      default:
        // Fallback para string para tipos desconhecidos
        fieldConfig = {
          ...baseConfig,
          type: 'string',
        } as SimpleFieldConfiguration;
    }

    // Adiciona à configuração final
    valueConfig.fields[pathString] = fieldConfig;
  });

  return valueConfig;
}
