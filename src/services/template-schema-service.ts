/**
 * Template schema service for Blueprint Values Section
 * Provides methods for fetching template schema and default values information
 */

import type { DefaultValueField } from '../components/blueprints/sections/DefaultValuesSection/types';
import { logError } from '../utils/errorLogger';

// Response type for fetchTemplateSchemaForDefaultValues
export interface TemplateSchemaResponse {
  fields: DefaultValueField[];
  rawYaml: string;
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
    };
  } catch (error) {
    logError(error, `Error fetching template schema for ${templateId}`);
    throw new Error(`Failed to load schema for template ${templateId}`);
  }
}
