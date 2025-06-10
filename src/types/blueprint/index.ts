/**
 * Types for blueprint creation and manipulation
 */

export interface CatalogTemplate {
  /**
   * Unique identifier for the template
   */
  id: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Template description
   */
  description?: string;

  /**
   * Whether the template is active and can be selected
   */
  isActive: boolean;

  /**
   * Template category
   */
  category?: string;

  /**
   * Template version
   */
  version?: string;

  /**
   * Dependencies on other templates
   */
  dependencies?: string[];
}

export interface BlueprintChildTemplate {
  /**
   * Reference to the original template ID
   */
  templateId: string;

  /**
   * User-provided unique identifier for this instance of the template
   */
  identifier: string;

  /**
   * Order in which this template should be applied
   */
  order: number;

  /**
   * Default values for the template, if any
   */
  defaultValues?: Record<string, unknown>;
}

export interface SectionCommonProps {
  /**
   * Whether the section is currently active
   */
  isActive: boolean;

  /**
   * Section ID
   */
  sectionId: string;
}

export interface BlueprintFormState {
  /**
   * Form metadata (name, description, etc.)
   */
  metadata: {
    name: string;
    description?: string;
    version: string;
    applicationId?: string;
  };

  /**
   * Selected templates for the blueprint
   */
  templates: BlueprintChildTemplate[];

  /**
   * Variables defined for the blueprint
   */
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    description?: string;
    defaultValue?: string;
  }>;

  /**
   * Default values per template
   */
  defaultValues: Record<string, Record<string, unknown>>;

  /**
   * Form errors by section
   */
  errors: Record<string, string[]>;
}
