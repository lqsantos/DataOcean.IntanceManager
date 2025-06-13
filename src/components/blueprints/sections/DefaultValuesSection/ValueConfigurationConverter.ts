/**
 * ValueConfigurationConverter.ts
 * Utilitários para conversão entre a estrutura antiga e a nova estrutura tipada
 */

import type {
  ArrayFieldConfiguration,
  FieldConfiguration,
  ObjectFieldConfiguration,
  SimpleFieldConfiguration,
  ValueConfiguration,
} from '@/types/blueprint';
import { convertLegacyFieldsToValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField } from './types';
import { ValueSourceType } from './types';

/**
 * Converte a estrutura antiga (DefaultValueField[]) para a nova estrutura tipada (ValueConfiguration)
 */
export function legacyFieldsToValueConfiguration(fields: DefaultValueField[]): ValueConfiguration {
  return convertLegacyFieldsToValueConfiguration(
    fields.map((field) => ({
      path: field.path,
      key: field.key,
      value: field.value,
      type: field.type,
      source: field.source === ValueSourceType.BLUEPRINT ? 'blueprint' : 'template',
      exposed: field.exposed,
      overridable: field.overridable,
      required: field.required,
      originalValue: field.originalValue,
    }))
  );
}

/**
 * Converte um campo da estrutura tipada para a estrutura antiga
 */
function fieldConfigToLegacyField(
  path: string,
  fieldConfig: FieldConfiguration
): DefaultValueField {
  const pathParts = path.split('.');

  // Campos comuns
  // Define o tipo para valor e valor original para evitar linhas muito longas
  type FieldValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

  const baseField: DefaultValueField = {
    key: path,
    displayName: pathParts[pathParts.length - 1],
    value: fieldConfig.value as FieldValue,
    originalValue: fieldConfig.templateDefault as FieldValue | undefined,
    source: fieldConfig.isCustomized ? ValueSourceType.BLUEPRINT : ValueSourceType.TEMPLATE,
    exposed: fieldConfig.isExposed,
    overridable: fieldConfig.isOverridable,
    required: fieldConfig.isRequired ?? false,
    type: fieldConfig.type,
    path: pathParts,
    children: [],
  };

  // Para objetos e arrays, adiciona os filhos recursivamente
  if (fieldConfig.type === 'object') {
    const objectConfig = fieldConfig as ObjectFieldConfiguration;

    // Processar propriedades do objeto
    baseField.children = Object.entries(objectConfig.properties).map(([key, propConfig]) => {
      const childPath = `${path}.${key}`;

      return fieldConfigToLegacyField(childPath, propConfig);
    });
  } else if (fieldConfig.type === 'array') {
    const arrayConfig = fieldConfig as ArrayFieldConfiguration;

    // Processar itens do array
    baseField.children = arrayConfig.items.map((item) => {
      return fieldConfigToLegacyField(item.id, item.value);
    });
  }

  return baseField;
}

/**
 * Converte a estrutura tipada (ValueConfiguration) para a estrutura antiga (DefaultValueField[])
 */
export function valueConfigurationToLegacyFields(
  valueConfig: ValueConfiguration
): DefaultValueField[] {
  const result: DefaultValueField[] = [];

  // Converte cada campo da configuração tipada para um campo legado
  Object.entries(valueConfig.fields).forEach(([path, fieldConfig]) => {
    result.push(fieldConfigToLegacyField(path, fieldConfig));
  });

  return result;
}

/**
 * Filtra campos na estrutura tipada com base em critérios
 */
export function filterValueConfigurationFields(
  valueConfig: ValueConfiguration,
  filters: {
    searchQuery?: string;
    fieldType?: string | null;
    onlyCustomized?: boolean;
    onlyExposed?: boolean;
  }
): Record<string, FieldConfiguration> {
  const { searchQuery, fieldType, onlyCustomized, onlyExposed } = filters;
  const filteredFields: Record<string, FieldConfiguration> = {};

  Object.entries(valueConfig.fields).forEach(([path, field]) => {
    // Filtro por busca de texto
    const matchesSearch =
      !searchQuery ||
      path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(field.value).toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro por tipo
    const matchesType = !fieldType || field.type === fieldType;

    // Filtro por customizado
    const matchesCustomized = !onlyCustomized || field.isCustomized;

    // Filtro por exposto
    const matchesExposed = !onlyExposed || field.isExposed;

    // Se atende a todos os critérios, adiciona ao resultado
    if (matchesSearch && matchesType && matchesCustomized && matchesExposed) {
      filteredFields[path] = field;
    }
  });

  return filteredFields;
}

/**
 * Atualiza um campo específico na estrutura tipada
 */
export function updateValueConfigurationField(
  valueConfig: ValueConfiguration,
  path: string,
  updates: Partial<Omit<SimpleFieldConfiguration, 'path' | 'type'>>
): ValueConfiguration {
  const updatedFields = { ...valueConfig.fields };

  if (updatedFields[path]) {
    const currentField = updatedFields[path];

    // Aplicar atualizações preservando as propriedades específicas do tipo
    if (currentField.type === 'object') {
      const objectField = currentField as ObjectFieldConfiguration;

      updatedFields[path] = {
        ...objectField,
        ...updates,
      } as ObjectFieldConfiguration;
    } else if (currentField.type === 'array') {
      const arrayField = currentField as ArrayFieldConfiguration;

      updatedFields[path] = {
        ...arrayField,
        ...updates,
      } as ArrayFieldConfiguration;
    } else {
      // Para tipos simples
      updatedFields[path] = {
        ...currentField,
        ...updates,
      } as FieldConfiguration;
    }
  }

  return {
    ...valueConfig,
    fields: updatedFields,
  };
}
