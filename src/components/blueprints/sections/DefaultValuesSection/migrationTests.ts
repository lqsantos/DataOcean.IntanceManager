/**
 * migrationTests.ts
 * Testes para validar a migração entre os formatos antigo e novo
 * NOTA: Este arquivo é temporário e pode ser removido após a migração completa
 */

import {
  valueConfigurationToYaml,
  yamlToValueConfiguration,
  type ValueType,
} from '@/types/blueprint';

import type { DefaultValueField, TemplateDefaultValues } from './types';
import {
  legacyFieldsToValueConfiguration,
  valueConfigurationToLegacyFields,
} from './ValueConfigurationConverter';

/**
 * Testa a conversão de ida e volta entre formatos
 */
export function testRoundTripConversion(fieldsLegacy: DefaultValueField[]): {
  success: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  try {
    // Converter do formato antigo para o novo
    const valueConfig = legacyFieldsToValueConfiguration(fieldsLegacy);

    // Converter de volta para o formato antigo
    const fieldsConverted = valueConfigurationToLegacyFields(valueConfig);

    // Verificar se os campos essenciais são os mesmos
    const fieldsMap = new Map<string, DefaultValueField>();

    fieldsLegacy.forEach((field) => {
      fieldsMap.set(field.key, field);
    });

    fieldsConverted.forEach((field) => {
      const originalField = fieldsMap.get(field.key);

      if (!originalField) {
        issues.push(`Campo ${field.key} não existia no formato original`);

        return;
      }

      // Verificar propriedades essenciais
      if (field.type !== originalField.type) {
        issues.push(`Tipo do campo ${field.key} mudou: ${originalField.type} -> ${field.type}`);
      }

      if (field.exposed !== originalField.exposed) {
        issues.push(
          `Exposição do campo ${field.key} mudou: ${originalField.exposed} -> ${field.exposed}`
        );
      }

      if (field.overridable !== originalField.overridable) {
        issues.push(
          `Sobreposição do campo ${field.key} mudou: ${originalField.overridable} -> ${field.overridable}`
        );
      }

      // Verificar valor (não podemos comparar diretamente objetos, então convertemos para string)
      const originalValueStr = JSON.stringify(originalField.value);
      const convertedValueStr = JSON.stringify(field.value);

      if (originalValueStr !== convertedValueStr) {
        issues.push(
          `Valor do campo ${field.key} mudou: ${originalValueStr} -> ${convertedValueStr}`
        );
      }
    });

    // Verificar se todos os campos originais foram preservados
    fieldsMap.forEach((_, key) => {
      const exists = fieldsConverted.some((f) => f.key === key);

      if (!exists) {
        issues.push(`Campo ${key} do formato original não foi preservado na conversão`);
      }
    });

    return {
      success: issues.length === 0,
      issues,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      issues: [`Erro durante o teste de conversão: ${errorMessage}`],
    };
  }
}

/**
 * Testa a conversão de YAML para ValueConfiguration e de volta para YAML
 */
export function testYamlConversion(
  yaml: string,
  templateFieldsInfo: Array<{ path: string; type: string; defaultValue: unknown }>
): { success: boolean; issues: string[] } {
  const issues: string[] = [];

  try {
    // Converter YAML para ValueConfiguration - convertendo o tipo para ValueType
    const typedTemplateFieldsInfo = templateFieldsInfo.map((field) => ({
      path: field.path,
      type: field.type as ValueType, // Conversão de tipo para ValueType
      defaultValue: field.defaultValue,
    }));
    const valueConfig = yamlToValueConfiguration(yaml, typedTemplateFieldsInfo);

    // Converter ValueConfiguration de volta para YAML
    const yamlConverted = valueConfigurationToYaml(valueConfig);

    // Verificar se o YAML convertido é válido
    // Aqui não podemos comparar string por string devido a formatações diferentes
    // Em vez disso, convertemos ambos para objetos e comparamos os objetos
    let originalObj;
    let convertedObj;

    try {
      // Tentamos converter com segurança, tratando tanto YAML quanto JSON
      originalObj = typeof yaml === 'string' ? JSON.parse(yaml) : yaml;
      convertedObj = typeof yamlConverted === 'string' ? JSON.parse(yamlConverted) : yamlConverted;
    } catch (parseError) {
      issues.push(`Erro ao analisar YAML/JSON: ${String(parseError)}`);

      return {
        success: false,
        issues,
      };
    }

    // Função recursiva para comparar objetos
    function compareObjects(obj1: unknown, obj2: unknown, path = ''): void {
      if (typeof obj1 !== typeof obj2) {
        issues.push(`Tipo diferente no caminho ${path}: ${typeof obj1} != ${typeof obj2}`);

        return;
      }

      if (typeof obj1 !== 'object' || obj1 === null) {
        if (obj1 !== obj2) {
          issues.push(`Valor diferente no caminho ${path}: ${String(obj1)} != ${String(obj2)}`);
        }

        return;
      }

      // Se ambos são arrays
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
          issues.push(
            `Comprimento de array diferente no caminho ${path}: ${obj1.length} != ${obj2.length}`
          );
        }
        const minLength = Math.min(obj1.length, obj2.length);

        for (let i = 0; i < minLength; i++) {
          compareObjects(obj1[i], obj2[i], `${path}[${i}]`);
        }

        return;
      }

      // Se ambos são objetos (mas não arrays)
      if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
        // Usamos type assertion para informar ao TypeScript que os objetos são do tipo Record<string, unknown>
        const typedObj1 = obj1 as Record<string, unknown>;
        const typedObj2 = obj2 as Record<string, unknown>;

        const allKeys = new Set([...Object.keys(typedObj1), ...Object.keys(typedObj2)]);

        allKeys.forEach((key) => {
          if (!(key in typedObj1)) {
            issues.push(`Chave ${key} no caminho ${path} existe apenas no objeto convertido`);

            return;
          }

          if (!(key in typedObj2)) {
            issues.push(`Chave ${key} no caminho ${path} existe apenas no objeto original`);

            return;
          }

          compareObjects(typedObj1[key], typedObj2[key], path ? `${path}.${key}` : key);
        });
      }
    }

    try {
      // Comparamos os objetos depois de validar que são do tipo esperado
      compareObjects(originalObj, convertedObj);

      return {
        success: issues.length === 0,
        issues,
      };
    } catch (compareError) {
      // Se ocorrer um erro durante a comparação, registramos e retornamos falha
      issues.push(`Erro ao comparar objetos: ${String(compareError)}`);

      return {
        success: false,
        issues,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      issues: [`Erro durante o teste de conversão YAML: ${errorMessage}`],
    };
  }
}

/**
 * Executa todos os testes disponíveis
 */
export function runAllMigrationTests(templateValues: TemplateDefaultValues): {
  success: boolean;
  results: Record<string, { success: boolean; issues: string[] }>;
} {
  const results: Record<string, { success: boolean; issues: string[] }> = {};

  // Teste de conversão ida e volta
  results.roundTripConversion = testRoundTripConversion(templateValues.fields);

  // Teste de conversão YAML
  // Precisamos extrair informações de tipo e valores padrão dos campos
  const templateFieldsInfo = templateValues.fields.map((field) => ({
    path: field.path.join('.'),
    type: field.type,
    defaultValue: field.originalValue,
  }));

  results.yamlConversion = testYamlConversion(templateValues.rawYaml, templateFieldsInfo);

  // Verificar sucesso global
  const success = Object.values(results).every(
    (result): result is { success: true; issues: string[] } => result.success
  );

  return {
    success,
    results,
  };
}
