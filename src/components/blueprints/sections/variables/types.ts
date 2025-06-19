/**
 * Interface para variável do blueprint com o novo formato
 */
export interface BlueprintVariable {
  id: string; // Identificador único
  name: string; // Nome da variável (ex: "app_name")
  value: string; // Expressão Go Template (pode ser um valor simples ou complexo)
  description?: string; // Descrição opcional
  type: 'expression'; // Tipo da variável - Somente expressão suportada
  isValid: boolean; // Estado de validação
  validationError?: string; // Mensagem de erro se inválida
}
