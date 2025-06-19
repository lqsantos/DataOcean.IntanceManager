/**
 * YAML validator utility for Blueprint Values Section
 * Handles validation of YAML syntax and schema validation
 */

import { parse, stringify } from 'yaml';

import { logError } from '@/utils/errorLogger';

import type { DefaultValueField, YamlValidationResult } from '../types';

/**
 * Validates YAML syntax and returns parsed document if valid
 * @param yamlContent - The YAML content to validate
 * @returns Validation result with errors and parsed document
 */
export function validateYamlSyntax(yamlContent: string): YamlValidationResult {
  try {
    const document = parse(yamlContent);

    return {
      isValid: true,
      errors: [],
      document,
    };
  } catch (error) {
    logError(error, 'Error validating YAML syntax');

    return {
      isValid: false,
      errors: [{ message: `YAML syntax error: ${(error as Error).message}` }],
    };
  }
}

/**
 * Validates YAML against a schema derived from template fields
 * @param yamlContent - The YAML content to validate
 * @param fields - Template fields that define the schema
 * @returns Validation result with errors
 */
export function validateYamlAgainstSchema(
  yamlContent: string,
  fields: DefaultValueField[]
): YamlValidationResult {
  // First validate syntax
  const syntaxResult = validateYamlSyntax(yamlContent);

  if (!syntaxResult.isValid) {
    return syntaxResult;
  }

  const errors: Array<{ message: string; path?: string[] }> = [];
  const warnings: Array<{ message: string; path?: string[] }> = [];

  // If there's a document to validate against schema
  if (syntaxResult.document) {
    // Ensure document is an object (not an array)
    if (!Array.isArray(syntaxResult.document)) {
      // Validate required fields
      validateRequiredFields(syntaxResult.document, fields, errors);

      // Validate types
      validateValueTypes(syntaxResult.document, fields, errors);

      // Check for unknown fields
      checkForUnknownFields(syntaxResult.document, fields, warnings);
    } else {
      errors.push({
        message: 'Root YAML document must be an object, not an array',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    document: syntaxResult.document,
  };
}

/**
 * Validates that all required fields are present
 * @param document - Parsed YAML document
 * @param fields - Template fields that define the schema
 * @param errors - Array to collect validation errors
 */
function validateRequiredFields(
  document: Record<string, unknown>,
  fields: DefaultValueField[],
  errors: Array<{ message: string; path?: string[] }>
): void {
  fields.forEach((field) => {
    // Check if field is required and exists in document
    if (field.required) {
      const fieldExists = fieldExistsInDocument(document, field.path);

      if (!fieldExists) {
        errors.push({
          message: `Required field "${field.key}" is missing`,
          path: field.path,
        });
      }
    }

    // Recursively check children if they exist
    if (field.children && field.children.length > 0) {
      // Get the nested value at the field's path
      const nestedValue = getValueAtPath(document, field.path);

      if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
        validateRequiredFields(nestedValue as Record<string, unknown>, field.children, errors);
      }
    }
  });
}

/**
 * Validates the types of values match the expected types
 * @param document - Parsed YAML document
 * @param fields - Template fields that define the schema
 * @param errors - Array to collect validation errors
 */
function validateValueTypes(
  document: Record<string, unknown>,
  fields: DefaultValueField[],
  errors: Array<{ message: string; path?: string[] }>
): void {
  fields.forEach((field) => {
    const value = getValueAtPath(document, field.path);

    // Skip validation if value doesn't exist
    if (value === undefined) {
      return;
    }

    // Validate type
    const isValid = validateType(value, field.type);

    if (!isValid) {
      errors.push({
        message: `Field "${field.key}" has invalid type. Expected ${field.type}.`,
        path: field.path,
      });
    }

    // Recursively validate children if they exist and value is an object
    if (
      field.children &&
      field.children.length > 0 &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      validateValueTypes(value as Record<string, unknown>, field.children, errors);
    }
  });
}

/**
 * Checks for fields in the document that aren't defined in the schema
 * @param document - Parsed YAML document
 * @param fields - Template fields that define the schema
 * @param warnings - Array to collect validation warnings
 * @param currentPath - Current path in the document (used for recursion)
 */
function checkForUnknownFields(
  document: Record<string, unknown>,
  fields: DefaultValueField[],
  warnings: Array<{ message: string; path?: string[] }>,
  currentPath: string[] = []
): void {
  // Create a set of known field names at this level
  const knownFieldNames = new Set(
    fields.map((field) => {
      // Get the last segment of the path as the field name
      return field.path[field.path.length - 1];
    })
  );

  // Check each property in the document
  Object.keys(document).forEach((key) => {
    const newPath = [...currentPath, key];

    if (!knownFieldNames.has(key)) {
      warnings.push({
        message: `Unknown field "${key}" found in document`,
        path: newPath,
      });
    } else {
      // If known and it's an object, recursively check its children
      const value = document[key];
      const correspondingField = fields.find((f) => f.path[f.path.length - 1] === key);

      if (
        correspondingField &&
        correspondingField.children &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        checkForUnknownFields(
          value as Record<string, unknown>,
          correspondingField.children,
          warnings,
          newPath
        );
      }
    }
  });
}

/**
 * Validates if a value matches the expected type
 * @param value - Value to validate
 * @param expectedType - Expected type of the value
 * @returns True if value matches type, false otherwise
 */
function validateType(value: unknown, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return true; // Unknown type, can't validate
  }
}

/**
 * Checks if a field exists in the document at the specified path
 * @param document - Parsed YAML document
 * @param path - Path to the field
 * @returns True if field exists, false otherwise
 */
function fieldExistsInDocument(document: Record<string, unknown>, path: string[]): boolean {
  return getValueAtPath(document, path) !== undefined;
}

/**
 * Gets the value at a specified path in the document
 * @param document - Parsed YAML document
 * @param path - Path to the field
 * @returns Value at path or undefined if not found
 */
function getValueAtPath(document: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = document;

  for (const segment of path) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

/**
 * Converts a DefaultValueField array to YAML format
 * @param fields - Array of DefaultValueField objects
 * @returns YAML string representation
 */
export function fieldsToYaml(fields: DefaultValueField[]): string {
  const document = fieldsToObject(fields);

  return stringify(document);
}

/**
 * Converts a DefaultValueField array to a plain JavaScript object
 * @param fields - Array of DefaultValueField objects
 * @returns Plain object representation
 */
function fieldsToObject(fields: DefaultValueField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  fields.forEach((field) => {
    // Only include fields that are set to be exposed
    if (field.exposed) {
      setValueAtPath(result, field.path, field.value);
    }

    // Process children if they exist
    if (field.children && field.children.length > 0) {
      const childrenObject = fieldsToObject(field.children);

      // Merge with any existing value at this path
      const existingValue = getValueAtPath(result, field.path);

      if (existingValue && typeof existingValue === 'object' && !Array.isArray(existingValue)) {
        setValueAtPath(result, field.path, {
          ...(existingValue as Record<string, unknown>),
          ...childrenObject,
        });
      }
    }
  });

  return result;
}

/**
 * Sets a value at a specified path in an object
 * @param obj - Object to modify
 * @param path - Path where to set the value
 * @param value - Value to set
 */
function setValueAtPath(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current = obj;

  // Navigate to the parent of the field
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];

    if (!current[segment] || typeof current[segment] !== 'object') {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  // Set the value at the final path segment
  const lastSegment = path[path.length - 1];

  current[lastSegment] = value;
}

/**
 * Updates DefaultValueField objects based on parsed YAML
 * @param fields - Current field definitions
 * @param yamlDocument - Parsed YAML document
 * @returns Updated fields with new values from YAML
 */
export function updateFieldsFromYaml(
  fields: DefaultValueField[],
  yamlDocument: Record<string, unknown>
): DefaultValueField[] {
  return fields.map((field) => {
    const value = getValueAtPath(yamlDocument, field.path);

    const updatedField: DefaultValueField = {
      ...field,
      // Preserve the type of the original value if the new value is undefined
      value: value !== undefined ? (value as typeof field.value) : field.value,
    };

    // Recursively update children if they exist
    if (
      field.children &&
      field.children.length > 0 &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      updatedField.children = updateFieldsFromYaml(
        field.children,
        value as Record<string, unknown>
      );
    }

    return updatedField;
  });
}
