/**
 * Export all components from the DefaultValuesSection
 * Updated to use the new refactored components where available
 */

export { DefaultValuesSection } from './DefaultValuesSection';
export { FilterControls } from './FilterControls';
export { TableView } from './TableView';
export { TemplateTabsNavigation } from './TemplateTabsNavigation';
// Use the refactored editor instead of the old one
export type {
  DefaultValueField,
  DefaultValuesContract,
  DefaultValuesSectionProps,
  TemplateDefaultValues,
  TemplateTabsNavigationProps,
  TemplateValueEditorProps,
  ValidationFeedbackProps,
  ValueSourceType,
  YamlValidationResult,
} from './types';

// Export new unified value column components and hooks
export * from './hooks';
export * from './validators';

export { ValidationFeedback } from './ValidationFeedback';
export { TemplateValueEditor } from './ValueEditor/TemplateValueEditor';
export { ViewMode, ViewToggle } from './ViewToggle';
