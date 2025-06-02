import { z } from 'zod';

/**
 * Types of variables s    .regex(
      variableNamePattern,
      'Nome deve começar com uma letra e pode conter letras, números, _, . ou -'
    ),rted
 */
export type VariableType = 'fixed' | 'expression';

/**
 * Variable name validation pattern
 * - Must start with a letter
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
 * Validation schema for fixed variables
 */
export const fixedVariableSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(60, 'Nome deve ter no máximo 60 caracteres')
    .regex(
      variableNamePattern,
      'Nome deve começar com "vars_" (opcional) seguido por uma letra e pode conter letras, números, ., _ ou - após'
    ),
  description: z.string().max(60, 'Descrição deve ter no máximo 60 caracteres').optional(),
  type: z.literal('fixed'),
  value: z.string().min(1, 'Valor é obrigatório'),
});

/**
 * Validation schema for expression variables
 */
export const expressionVariableSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(60, 'Nome deve ter no máximo 60 caracteres')
    .regex(
      variableNamePattern,
      'Nome deve começar com "vars_" (opcional) seguido por uma letra e pode conter letras, números, ., _ ou - após'
    ),
  description: z.string().max(60, 'Descrição deve ter no máximo 60 caracteres').optional(),
  type: z.literal('expression'),
  expression: z.string().min(1, 'Expressão é obrigatória'),
});

export type FixedVariableFormValues = z.infer<typeof fixedVariableSchema>;
export type ExpressionVariableFormValues = z.infer<typeof expressionVariableSchema>;
