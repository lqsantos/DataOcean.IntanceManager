import { z } from 'zod';

/**
 * Types of variables supported
 */
export type VariableType = 'fixed' | 'expression';

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
  name: z.string().min(1, 'Nome é obrigatório').max(60, 'Nome deve ter no máximo 60 caracteres'),
  description: z.string().max(60, 'Descrição deve ter no máximo 60 caracteres').optional(),
  type: z.literal('fixed'),
  value: z.string().min(1, 'Valor é obrigatório'),
});

/**
 * Validation schema for expression variables
 */
export const expressionVariableSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(60, 'Nome deve ter no máximo 60 caracteres'),
  description: z.string().max(60, 'Descrição deve ter no máximo 60 caracteres').optional(),
  type: z.literal('expression'),
  expression: z.string().min(1, 'Expressão é obrigatória'),
});

export type FixedVariableFormValues = z.infer<typeof fixedVariableSchema>;
export type ExpressionVariableFormValues = z.infer<typeof expressionVariableSchema>;
