/**
 * Variable validator for Blueprint Values Section
 * Validates and extracts variables used in interpolated strings
 */

import type { DefaultValueField } from '../types';

// Interface representing a variable used in field values
export interface VariableReference {
  name: string; // Name of the variable
  path: string[]; // Path to the field using the variable
  fieldKey: string; // Field key
  raw: string; // Raw interpolation string
  isDeclared: boolean; // Whether the variable is declared in the blueprint
}

// Regex for Helm variables like {{ .Values.variableName }}
const HELM_VARIABLE_REGEX = /\{\{\s*\.Values\.([a-zA-Z0-9_.-]+)\s*\}\}/g;

/**
 * Extract variables from a value string using Helm variable syntax
 * @param str - String to extract variables from
 * @returns Array of variable names found in the string
 */
export function extractVariablesFromString(str: string): string[] {
  if (typeof str !== 'string') {
    return [];
  }

  const variables: string[] = [];
  let match;

  // Reset regex state
  HELM_VARIABLE_REGEX.lastIndex = 0;

  while ((match = HELM_VARIABLE_REGEX.exec(str)) !== null) {
    if (match[1]) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Check if a field value uses variable interpolation
 * @param field - The field to check
 * @returns True if the field uses variables
 */
export function fieldUsesVariables(field: DefaultValueField): boolean {
  if (typeof field.value === 'string') {
    return HELM_VARIABLE_REGEX.test(field.value);
  }

  return false;
}

/**
 * Find all variable references in a set of fields and check if they are declared
 * @param fields - The fields to check for variables
 * @param declaredVariables - Available variables in the blueprint
 * @returns Array of variable references with declaration status
 */
export function findVariableReferences(
  fields: DefaultValueField[],
  declaredVariables: string[]
): VariableReference[] {
  const references: VariableReference[] = [];

  // Helper function to process a field
  const processField = (field: DefaultValueField): void => {
    if (typeof field.value === 'string') {
      const variables = extractVariablesFromString(field.value);

      for (const varName of variables) {
        references.push({
          name: varName,
          path: field.path,
          fieldKey: field.key,
          raw: field.value,
          isDeclared: declaredVariables.includes(varName),
        });
      }
    }

    // Process children recursively
    if (field.children && field.children.length > 0) {
      field.children.forEach(processField);
    }
  };

  // Process all fields
  fields.forEach(processField);

  return references;
}

/**
 * Check for undeclared variables in a set of fields
 * @param fields - Fields to check
 * @param declaredVariables - Available variables in the blueprint
 * @returns Array of errors for undeclared variables
 */
export function validateVariables(
  fields: DefaultValueField[],
  declaredVariables: string[]
): Array<{ message: string; path?: string[]; variableName?: string }> {
  const references = findVariableReferences(fields, declaredVariables);

  // Filter for undeclared variables and map to errors
  return references
    .filter((ref) => !ref.isDeclared)
    .map((ref) => ({
      message: `Undeclared variable: ${ref.name} in field ${ref.fieldKey}`,
      path: ref.path,
      variableName: ref.name,
    }));
}
