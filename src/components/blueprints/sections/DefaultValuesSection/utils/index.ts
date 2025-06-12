/**
 * Export all utility functions related to YAML validation
 * This file serves as a central point for importing validation utilities
 */

// Re-export from enhanced YAML validator (which should be used moving forward)
export * from './enhanced-yaml-validator';

// Re-export from original YAML validator for backward compatibility
// These will be deprecated in future versions
export {
  fieldsToYaml as legacyFieldsToYaml,
  updateFieldsFromYaml as legacyUpdateFieldsFromYaml,
  validateYamlAgainstSchema as legacyValidateYamlAgainstSchema,
  validateYamlSyntax as legacyValidateYamlSyntax,
} from './yaml-validator';
