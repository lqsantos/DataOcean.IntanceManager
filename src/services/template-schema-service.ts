/**
 * Template schema service for Blueprint Values Section
 * Provides methods for fetching template schema, default values information,
 * and validates values against JSON Schema
 */

import type { DefaultValueField } from '../components/blueprints/sections/DefaultValuesSection/types';
import { logError } from '../utils/errorLogger';

// Response type for fetchTemplateSchemaForDefaultValues
export interface TemplateSchemaResponse {
  fields: DefaultValueField[];
  rawYaml: string;
  jsonSchema?: Record<string, unknown>; // Optional schema if available
}

// Response from schema validation
export interface SchemaValidationResponse {
  isValid: boolean;
  errors: Array<{ message: string; path?: string[] }>;
}

/**
 * Fetches template schema and default values for a given template ID
 * @param templateId - The ID of the template to fetch
 * @returns Template schema with fields and raw YAML
 */
export async function fetchTemplateSchemaForDefaultValues(
  templateId: string
): Promise<TemplateSchemaResponse> {
  try {
    // Call the API endpoint to fetch template schema
    // In development this will be intercepted by MSW
    const response = await fetch(`/api/templates/${templateId}/schema`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch schema for template ${templateId}. Status: ${response.status}`
      );
    }

    const schemaData = await response.json();

    return {
      fields: schemaData.fields,
      rawYaml: schemaData.rawYaml,
      jsonSchema: schemaData.jsonSchema,
    };
  } catch (error) {
    logError(error, `Error fetching template schema for ${templateId}`);
    throw new Error(`Failed to load schema for template ${templateId}`);
  }
}

/**
 * Validates template values against JSON Schema if available
 * @param templateId - The ID of the template to validate
 * @param values - The values to validate
 * @returns Validation result with any errors
 */
export async function validateTemplateValues(
  templateId: string,
  values: Record<string, unknown>
): Promise<SchemaValidationResponse> {
  try {
    const response = await fetch(`/api/templates/${templateId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to validate values for template ${templateId}. Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    logError(error, `Error validating template values for ${templateId}`);

    return {
      isValid: false,
      errors: [
        {
          message: `Failed to validate template values: ${(error as Error).message}`,
        },
      ],
    };
  }
}

/**
 * Fetches the complete JSON Schema for a template
 * @param templateId - The ID of the template to fetch schema for
 * @returns The full JSON Schema for the template
 */
export async function fetchTemplateJsonSchema(
  templateId: string
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`/api/templates/${templateId}/json-schema`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch JSON Schema for template ${templateId}. Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    logError(error, `Error fetching JSON Schema for template ${templateId}`);
    throw new Error(`Failed to load JSON Schema for template ${templateId}`);
  }
}
