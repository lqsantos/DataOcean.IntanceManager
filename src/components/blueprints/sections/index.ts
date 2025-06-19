/**
 * Módulo de Seções de Blueprint
 *
 * Este módulo contém os componentes para cada seção do fluxo de criação de blueprint.
 * Cada seção representa uma etapa distinta no processo de criação.
 */

// Seção de informações básicas do blueprint
export { MetadataSection } from './MetadataSection';

// Seção para seleção e configuração de templates
export { TemplatesSection } from './TemplatesSection';

// Seção para definição de variáveis
export { default as VariablesSection } from './variables-section';

// Seção para configuração de valores dos templates
export { DefaultValuesSection as ValuesSection } from './DefaultValuesSection';

// Seção de preview (será implementada nas próximas entregas)
// export { PreviewSection } from './PreviewSection';
