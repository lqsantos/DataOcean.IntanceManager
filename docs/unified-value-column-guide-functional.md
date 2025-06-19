# Guia de Implementação: Coluna de Valor Unificada

## Resumo Executivo

Este documento especifica a refatoração da tabela hierárquica de campos de template, unificando as colunas de valor em uma experiência mais intuitiva e funcional. O foco está nas expectativas funcionais e padrões arquiteturais, usando código apenas para ilustrar convenções do projeto.

## 1. Experiência do Usuário Esperada

### Coluna de Valor Unificada

**Funcionalidade Central:**

- Uma única coluna "Value" substitui "Template Default" e "Blueprint Value"
- Indicadores visuais imediatos mostram a origem do valor
- Processo de edição explícito com confirmação obrigatória
- Validação preventiva antes de aceitar alterações

**Estados Visuais:**

- **Valor padrão**: Aparência neutra, ícone de template
- **Valor customizado**: Borda azul, ícone de customização
- **Em edição**: Background destacado, botões Apply/Cancel visíveis
- **Inválido**: Feedback de erro claro antes da aplicação

### Fluxo de Interação

1. **Entrada em edição**: Click ou Enter inicia modo de edição
2. **Durante edição**: ESC cancela, Apply confirma, validação em tempo real
3. **Aplicação**: Só aceita valores válidos, feedback imediato de sucesso/erro
4. **Reset**: Opção clara para voltar ao valor padrão do template

## 2. Arquitetura e Padrões Técnicos

### Responsabilidades dos Componentes

**UnifiedValueColumn:**

- Orquestra a exibição e interação com valores
- Gerencia estados de edição e validação
- Delega renderização para editores especializados

**Value Editors:**

- StringEditor, NumberEditor, BooleanEditor, etc.
- Cada um responsável por seu tipo específico
- Implementam interface comum para consistência

**Validation System:**

- Validação centralizada por tipo de campo
- Regras configuráveis e extensíveis
- Feedback imediato e contextual

### Padrões de Implementação

**Padrão Factory** para criação de editores:

```typescript
// Exemplo da convenção do projeto para factories
interface EditorFactory {
  createEditor(field: TemplateField): ValueEditor;
}
```

**Padrão Strategy** para validação:

```typescript
// Convenção de validadores no projeto
interface ValidationStrategy {
  validate(value: unknown, field: TemplateField): ValidationResult;
}
```

**Hook personalizado** seguindo padrões do projeto:

```typescript
// Exemplo da estrutura esperada de hooks
const useValueEditor = (field: TemplateField) => {
  // Estado de edição, validação e persistência
  return { isEditing, value, errors, actions };
};
```

## 3. Especificações Técnicas

### Interface de Dados

O sistema deve suportar todos os tipos de campo existentes, com extensibilidade para novos tipos:

- **Primitivos**: string, number, boolean
- **Estruturados**: objects, arrays
- **Especiais**: enums, referencias

### Validação e Formatação

**Requisitos de validação:**

- Validação de tipo antes da aplicação
- Validação de formato específico (ex: URLs, emails)
- Validação de constraints (min, max, required)
- Feedback visual imediato para erros

**Formatação de exibição:**

- Valores complexos formatados como JSON legível
- Truncamento inteligente para valores longos
- Tooltips com valor completo quando necessário

### Estados de Persistência

**Gerenciamento de estado:**

- Estado local durante edição (não persistido)
- Aplicação explícita para persistência
- Rollback automático no cancelamento
- Sincronização com estado global do blueprint

## 4. Critérios de Aceitação

### Funcionalidade Essencial

✅ **Consolidação visual**: Uma única coluna substitui as duas existentes
⏳ **Indicadores de origem**: Valores customizados claramente distinguíveis
⏳ **Fluxo Apply/Cancel**: Processo de edição explícito e confiável
⏳ **Validação preventiva**: Apenas valores válidos são aceitos
⏳ **Suporte ESC**: Cancelamento rápido durante edição

### Qualidade Técnica

⏳ **Tipagem completa**: TypeScript rigoroso em todos os componentes
⏳ **Separação de responsabilidades**: Cada módulo com propósito claro
⏳ **Extensibilidade**: Fácil adição de novos tipos de editor
⏳ **Performance**: Renderização eficiente para hierarquias grandes
⏳ **Testabilidade**: Componentes isolados e facilmente testáveis

### Experiência do Usuário

⏳ **Intuitividade**: Interface self-explanatory sem necessidade de treinamento
⏳ **Consistência**: Comportamento uniforme em todos os tipos de campo
⏳ **Feedback imediato**: Resposta visual rápida para todas as ações
⏳ **Acessibilidade**: Suporte completo a navegação por teclado

## 5. Estrutura de Implementação

### Componentes Principais

```
src/components/blueprints/sections/DefaultValuesSection/
├── TableComponents/
│   └── UnifiedValueColumn.tsx           # Componente principal da coluna
├── ValueEditors/                         # Editores especializados
│   ├── StringEditor.tsx
│   ├── NumberEditor.tsx
│   ├── BooleanEditor.tsx
│   └── ObjectEditor.tsx
├── validation/
│   └── valueValidation.ts               # Sistema de validação
└── hooks/
    └── useValueEditor.ts                # Hook de gerenciamento de estado
```

### Padrões de Tradução

Seguindo as convenções do projeto em `src/locales/`:

```json
{
  "blueprints": {
    "defaultValuesSection": {
      "unifiedValueColumn": {
        "header": "Value",
        "indicators": {
          "templateDefault": "Template default value",
          "customValue": "Custom blueprint value"
        },
        "actions": {
          "apply": "Apply",
          "cancel": "Cancel",
          "reset": "Reset to default"
        }
      }
    }
  }
}
```

## 6. Estratégia de Testes

### Testes Unitários

**Value Editors**: Cada editor deve ter testes para:

- Renderização correta do valor
- Entrada e validação de dados
- Aplicação e cancelamento de mudanças

**Validation System**: Testes para:

- Validação de tipos primitivos
- Validação de objetos complexos
- Handling de casos edge

**Hooks**: Testes para:

- Estados de edição
- Persistência de dados
- Rollback de mudanças

### Testes de Integração

**Coluna Unificada**: Testes end-to-end para:

- Fluxo completo de edição
- Interação entre componentes
- Performance com datasets grandes

## 7. Considerações de Performance

### Otimizações Esperadas

**Renderização**:

- Virtualização para listas grandes
- Memoização de componentes pesados
- Lazy loading de editores complexos

**Estado**:

- Debounce para validação durante digitação
- Batching de updates para aplicação
- Cleanup automático de estados temporários

## 8. Extensibilidade Futura

### Preparação para Funcionalidades Futuras

O design deve acomodar facilmente:

- **Adição dinâmica de campos**: Novos campos via interface
- **Editores customizados**: Tipos de campo específicos do domínio
- **Validação avançada**: Regras de negócio complexas
- **Integração com APIs**: Validação server-side opcional

### Interfaces Extensíveis

```typescript
// Exemplo de interface preparada para extensão
interface TemplateField {
  // ... propriedades existentes
  customEditor?: string; // Para editores futuros
  validationRules?: ValidationRule[]; // Para validação avançada
  metadata?: Record<string, unknown>; // Para funcionalidades futuras
}
```

## 9. Roadmap de Implementação

### Fase 1: Base (Atual)

- [x] Controles de filtro aprimorados
- [x] Estrutura de documentação

### Fase 2: Core Implementation

- [ ] UnifiedValueColumn component
- [ ] Basic value editors (string, number, boolean)
- [ ] Validation system
- [ ] Apply/Cancel flow

### Fase 3: Advanced Features

- [ ] Complex value editors (object, array)
- [ ] Advanced validation rules
- [ ] Performance optimizations
- [ ] Comprehensive testing

### Fase 4: Polish & Future-Proofing

- [ ] Accessibility improvements
- [ ] Advanced UX features
- [ ] Extensibility hooks
- [ ] Documentation finalization

---

**Nota**: Este documento foca nas expectativas funcionais e padrões arquiteturais. Os snippets de código apresentados ilustram apenas as convenções do projeto, não implementação específica. Para prompt de implementação detalhado, consulte `docs/copilot-implementation-prompt.md`.
