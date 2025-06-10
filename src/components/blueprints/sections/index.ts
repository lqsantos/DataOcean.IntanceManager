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

// As outras seções serão implementadas nas próximas entregas:
// export { DefaultValuesSection } from './DefaultValuesSection';
// export { PreviewSection } from './PreviewSection';
