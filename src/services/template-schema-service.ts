/**
 * Template schema service for Blueprint Values Section
 * Provides methods for fetching template schema, default values information,
 * and validates values against JSON Schema
 */

import type { DefaultValueField } from '../components/blueprints/sections/DefaultValuesSection/types';
import { logError } from '../utils/errorLogger';

// Constantes para retry
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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
 * Helper function para delay entre retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
 * Fetches the complete JSON Schema for a template with retry
 * @param templateId - The ID of the template to fetch schema for
 * @returns The full JSON Schema for the template
 */
export async function fetchTemplateJsonSchema(
  templateId: string,
  retryCount = 0
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`/api/templates/${templateId}/json-schema`);
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      const errorData = contentType?.includes('application/json')
        ? await response.json()
        : { error: response.statusText };

      // Se for 404, não tentar novamente
      if (response.status === 404) {
        throw new Error(`Template não encontrado: ${templateId}`);
      }

      // Se ainda tiver tentativas e for um erro recuperável, tentar novamente
      if (retryCount < MAX_RETRIES && response.status >= 500) {
        console.warn(`Tentativa ${retryCount + 1} de ${MAX_RETRIES} falhou, tentando novamente...`);

        await sleep(RETRY_DELAY_MS);

        return fetchTemplateJsonSchema(templateId, retryCount + 1);
      }

      throw new Error(
        errorData.message || `Falha ao buscar JSON Schema para template ${templateId}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    logError(error, `Error fetching JSON Schema for template ${templateId}`);

    // Se ainda tiver tentativas e for um erro de rede, tentar novamente
    if (retryCount < MAX_RETRIES && error instanceof TypeError) {
      console.warn(`Tentativa ${retryCount + 1} de ${MAX_RETRIES} falhou, tentando novamente...`);

      await sleep(RETRY_DELAY_MS);

      return fetchTemplateJsonSchema(templateId, retryCount + 1);
    }

    throw new Error(`Falha ao carregar JSON Schema para template ${templateId}`);
  }
}
