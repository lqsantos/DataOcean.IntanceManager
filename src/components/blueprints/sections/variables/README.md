# Seção de Variáveis para Blueprints

Esta implementação corresponde à Entrega 2.3 do plano de refatoração do Blueprint Creation Flow. Esta seção substitui o antigo `VariablesStep` do wizard modal.

## Características Implementadas

1. **Interface Baseada em Seção**: Componente dedicado para uso na página de criação/edição de blueprints
2. **Editor Avançado para Go Templates**: Suporte a sintaxe highlighting, autocompletar e snippets
3. **Validação em Tempo Real**: Feedback imediato sobre problemas de nome ou sintaxe
4. **Virtualização para Performance**: Suporte a grandes conjuntos de variáveis com rendering otimizado
5. **Categorização e Busca**: Pesquisa de variáveis por nome ou descrição

## Componentes

- **VariablesSection**: Componente principal que integra o gerenciamento de variáveis
- **VariablesList**: Exibição tabular das variáveis com suporte a virtualização para performance
- **VariableEditor**: Modal para edição detalhada de variáveis individuais
- **MonacoExpressionEditor**: Editor especializado para expressões Go Template

## Uso

```tsx
// Em páginas/seções de blueprint
import { VariablesSection } from '@/components/blueprints/sections/variables-section';

// Na seção de variáveis
<VariablesSection />;
```

## Dependências

- `@monaco-editor/react`: Para o editor avançado de expressões
- `react-window`: Para virtualização de listas longas

## Formato de Dados

As variáveis usam um formato unificado que permite tanto valores simples quanto expressões complexas:

```typescript
interface BlueprintVariable {
  id: string;
  name: string;
  value: string; // Pode ser um valor simples ou expressão Go Template
  description?: string;
  type: 'expression';
  isValid: boolean;
  validationError?: string;
}
```
