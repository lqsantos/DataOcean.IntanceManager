/**
 * Schema validator for Blueprint Values Section
 * Validates field values against JSON Schema definitions
 */

import type { ErrorObject } from 'ajv';
import Ajv from 'ajv';
// Note: ajv-formats would normally be imported here
// We'll implement basic format validation manually instead

import { logError } from '@/utils/errorLogger';

import type { DefaultValueField } from '../types';

// Initialize Ajv instance
const ajv = new Ajv({ allErrors: true });

// Add basic format validators manually
// This would typically be done with ajv-formats, but we're implementing basic ones
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('date-time', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
ajv.addFormat('email', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
// Split URI regex into multiple lines for better readability
const uriPattern = new RegExp(
  [
    '^https?:\\/\\/', // Protocol
    '(?:www\\.)?', // Optional www subdomain
    '[-a-zA-Z0-9@:%._+~#=]{1,256}', // Domain name
    '\\.[a-zA-Z0-9()]{1,6}\\b', // Domain extension
    '(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)', // Query parameters and path
    '$',
  ].join(''),
  'i'
);

ajv.addFormat('uri', uriPattern);

export interface SchemaValidationResult {
  isValid: boolean;
  errors: Array<{ message: string; path?: string[] }>;
  field: DefaultValueField;
}

/**
 * Validate a field value against its schema
 * @param field - Field to validate
 * @param schema - JSON Schema to validate against
 * @returns Validation result with errors if any
 */
export function validateFieldAgainstSchema(
  field: DefaultValueField,
  schema: Record<string, unknown>
): SchemaValidationResult {
  try {
    // If no schema or the field comes from template default, it's valid
    if (!schema || field.source === 'template') {
      return { isValid: true, errors: [], field };
    }

    // Find the schema for this specific field path
    const fieldPath = field.path.join('/');
    const fieldSchema = findSchemaForPath(schema, fieldPath);

    if (!fieldSchema) {
      return { isValid: true, errors: [], field };
    }

    // Format the validate function
    const validate = ajv.compile(fieldSchema);

    // Validate the field value
    const isValid = validate(field.value);

    if (!isValid) {
      const errors = (validate.errors || []).map((error: ErrorObject) => ({
        message: `${error.schemaPath || error.keyword} ${error.message}`,
        path: field.path,
      }));

      return { isValid: false, errors, field };
    }

    return { isValid: true, errors: [], field };
  } catch (error) {
    logError(error, `Error validating field ${field.key} against schema`);

    return {
      isValid: false,
      errors: [{ message: `Validation error: ${(error as Error).message}`, path: field.path }],
      field,
    };
  }
}

/**
 * Find the schema definition for a specific path in the JSON Schema
 * @param schema - The full JSON Schema
 * @param path - Dot notation path to find
 * @returns Schema definition for the path or undefined if not found
 */
// Type for JSON Schema with properties
interface SchemaWithProperties extends Record<string, unknown> {
  properties?: Record<string, SchemaWithProperties>;
}

function findSchemaForPath(
  schema: Record<string, unknown>,
  path: string
): Record<string, unknown> | undefined {
  // Cast schema to the more specific type
  const schemaWithProps = schema as SchemaWithProperties;

  if (!schemaWithProps.properties) {
    return undefined;
  }

  // Split path into segments
  const segments = path.split('/');

  // Start with the root properties
  let currentSchema = schemaWithProps;

  // Traverse the schema following the path
  for (const segment of segments) {
    if (!currentSchema.properties || !currentSchema.properties[segment]) {
      return undefined;
    }

    currentSchema = currentSchema.properties[segment];
  }

  return currentSchema;
}

/**
 * Validate a complete set of fields against a schema
 * @param fields - Array of fields to validate
 * @param schema - JSON Schema to validate against
 * @returns Array of validation results
 */
export function validateFieldsAgainstSchema(
  fields: DefaultValueField[],
  schema: Record<string, unknown>
): SchemaValidationResult[] {
  return fields.flatMap((field) => {
    const result = validateFieldAgainstSchema(field, schema);

    // If this field has children, validate them too
    if (field.children && field.children.length > 0) {
      return [result, ...validateFieldsAgainstSchema(field.children, schema)];
    }

    return [result];
  });
}
