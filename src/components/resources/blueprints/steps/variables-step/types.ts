import { useTranslation } from 'react-i18next';
import { z } from 'zod';

/**
 * Types of variables supported
 */
export type VariableType = 'fixed' | 'expression';

/**
 * Variable name validation pattern
 * - Must start with a letter (optionally prefixed with vars_)
 * - Can contain letters, numbers, underscores, dots and hyphens
 * - Cannot contain spaces or other special characters
 */
const variableNamePattern = /^(vars_)?[a-zA-Z][a-zA-Z0-9._-]*$/;

/**
 * Base interface for a blueprint variable
 */
export interface BlueprintVariableBase {
  name: string;
  description?: string;
  type: VariableType;
}

/**
 * Variable with a fixed value
 */
export interface FixedVariable extends BlueprintVariableBase {
  type: 'fixed';
  value: string;
}

/**
 * Variable with a Go template expression
 */
export interface ExpressionVariable extends BlueprintVariableBase {
  type: 'expression';
  expression: string;
}

/**
 * Union type for all variable types
 */
export type BlueprintVariable = FixedVariable | ExpressionVariable;

/**
 * Hook for getting variable validation schemas with translated messages
 */
export function useVariableValidation() {
  const { t } = useTranslation(['blueprints']);

  /**
   * Validation schema for fixed variables with translations
   */
  const getFixedVariableSchema = () =>
    z.object({
      name: z
        .string()
        .min(1, t('variableValidation.nameRequired'))
        .max(60, t('variableValidation.nameMaxLength'))
        .regex(variableNamePattern, t('variableValidation.namePattern')),
      description: z.string().max(60, t('variableValidation.descriptionMaxLength')).optional(),
      type: z.literal('fixed'),
      value: z.string().min(1, t('variableValidation.valueRequired')),
    });

  /**
   * Validation schema for expression variables with translations
   */
  const getExpressionVariableSchema = () =>
    z.object({
      name: z
        .string()
        .min(1, t('variableValidation.nameRequired'))
        .max(60, t('variableValidation.nameMaxLength'))
        .regex(variableNamePattern, t('variableValidation.namePattern')),
      description: z.string().max(60, t('variableValidation.descriptionMaxLength')).optional(),
      type: z.literal('expression'),
      expression: z.string().min(1, t('variableValidation.expressionRequired')),
    });

  return {
    fixedVariableSchema: getFixedVariableSchema(),
    expressionVariableSchema: getExpressionVariableSchema(),
  };
}

/**
 * Static schemas with default messages (for non-React contexts)
 * These will use the default English messages
 */
export const fixedVariableSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(60, 'Name must be at most 60 characters')
    .regex(
      variableNamePattern,
      'Name must start with "vars_" (optional) followed by a letter and can contain letters, numbers, ., _ or - after'
    ),
  description: z.string().max(60, 'Description must be at most 60 characters').optional(),
  type: z.literal('fixed'),
  value: z.string().min(1, 'Value is required'),
});

/**
 * Validation schema for expression variables
 */
export const expressionVariableSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(60, 'Name must be at most 60 characters')
    .regex(
      variableNamePattern,
      'Name must start with "vars_" (optional) followed by a letter and can contain letters, numbers, ., _ or - after'
    ),
  description: z.string().max(60, 'Description must be at most 60 characters').optional(),
  type: z.literal('expression'),
  expression: z.string().min(1, 'Expression is required'),
});

export type FixedVariableFormValues = z.infer<typeof fixedVariableSchema>;
export type ExpressionVariableFormValues = z.infer<typeof expressionVariableSchema>;
