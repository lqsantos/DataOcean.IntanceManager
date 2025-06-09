/**
 * Módulo de hooks para manipulação de blueprints
 *
 * Este módulo exporta todos os hooks relacionados a blueprints usados na aplicação.
 * É a principal API para interação com o estado dos blueprints.
 */

// Exportando os hooks existentes
import { useBlueprintNavigation } from './use-blueprint-navigation';
import { useSectionValidation } from './use-section-validation';

// Exportando os hooks do contexto
export { useBlueprintForm } from '@/contexts/blueprint-form-context';
export { useBlueprintSection } from './use-blueprint-section';

// Re-exportando os hooks existentes
export { useBlueprintNavigation, useSectionValidation };

// Exportando tipos para reutilização
export type {
  SectionId,
  SectionValidation,
  SectionValidations,
  ValidationStatus,
} from './use-section-validation';
