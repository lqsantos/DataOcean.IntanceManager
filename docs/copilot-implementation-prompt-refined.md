# Prompt de Implementação: Coluna de Valor Unificada

## Contexto e Objetivo

Você está refatorando uma tabela hierárquica de campos de template em um projeto Next.js com TypeScript, Tailwind CSS e shadcn/ui. O objetivo é unificar duas colunas de valor ("Template Default" e "Blueprint Value") em uma única coluna "Value" mais intuitiva e funcional.

## Estado Atual do Projeto

### Arquivos Já Implementados

- `src/components/blueprints/sections/DefaultValuesSection/EnhancedFilterControls.tsx` ✅
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableContainer.tsx` ✅
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableRows.tsx` ✅
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx` ✅

### Funcionalidades Já Funcionando

- Sistema de busca/filtro para campos aninhados
- Auto-expansão de nós pais quando filhos correspondem
- Controles expand/collapse aprimorados
- Estrutura básica da tabela hierárquica

## Implementação Necessária

### 1. Componente Principal: UnifiedValueColumn

**Localização**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/UnifiedValueColumn.tsx`

**Responsabilidades**:

- Renderizar valor atual com indicador visual de origem
- Gerenciar estado de edição (entrada, edição, validação)
- Orquestrar Apply/Cancel flow
- Delegar para editores especializados por tipo

**Estados Visuais Esperados**:

```typescript
type ValueState = 'default' | 'custom' | 'editing' | 'invalid';
```

**Indicadores Visuais**:

- Valor padrão: sem borda especial, ícone sutil de template
- Valor customizado: borda azul, ícone de edição/customização
- Em edição: background destacado, botões Apply/Cancel
- Inválido: borda vermelha, mensagem de erro

### 2. Sistema de Editores de Valor

**Localização**: `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/`

**Editores Necessários**:

- `StringEditor.tsx` - Para campos de texto
- `NumberEditor.tsx` - Para campos numéricos
- `BooleanEditor.tsx` - Para campos boolean (toggle/checkbox)
- `ObjectEditor.tsx` - Para objetos complexos (JSON editor)

**Interface Comum**:

```typescript
interface ValueEditorProps {
  value: unknown;
  field: TemplateField;
  isEditing: boolean;
  onValueChange: (value: unknown) => void;
  onApply: () => void;
  onCancel: () => void;
  validationError?: string;
}
```

### 3. Sistema de Validação

**Localização**: `src/components/blueprints/sections/DefaultValuesSection/validation/valueValidation.ts`

**Funcionalidades**:

- Validação de tipo baseada no campo template
- Validação de formato (URLs, emails, etc.)
- Validação de constraints (min, max, required)
- Return de mensagens de erro localizadas

**Tipos de Validação**:

```typescript
interface ValidationRule {
  type: 'type' | 'format' | 'constraint';
  validate: (value: unknown, field: TemplateField) => ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  translationKey?: string;
}
```

### 4. Hook de Gerenciamento de Estado

**Localização**: `src/hooks/useValueEditor.ts`

**Responsabilidades**:

- Gerenciar estado local de edição
- Controlar aplicação e cancelamento
- Integrar com validação
- Sincronizar com estado global

**API Esperada**:

```typescript
const useValueEditor = (field: TemplateField, initialValue: unknown) => {
  return {
    // Estado
    isEditing: boolean
    currentValue: unknown
    tempValue: unknown
    validationError: string | null

    // Ações
    startEditing: () => void
    cancelEditing: () => void
    applyChanges: () => void
    updateTempValue: (value: unknown) => void
    resetToDefault: () => void
  }
}
```

### 5. Atualizações de Tradução

**Arquivos**: `src/locales/en/blueprints.json` e `src/locales/pt/blueprints.json`

**Chaves Necessárias**:

```json
{
  "blueprints": {
    "defaultValuesSection": {
      "unifiedValueColumn": {
        "header": "Value",
        "placeholder": "Enter value...",
        "indicators": {
          "templateDefault": "Template default value",
          "customValue": "Custom blueprint value",
          "inherited": "Inherited from template"
        },
        "actions": {
          "apply": "Apply",
          "cancel": "Cancel",
          "reset": "Reset to default",
          "edit": "Edit value"
        },
        "validation": {
          "required": "This field is required",
          "invalidType": "Invalid value type",
          "invalidFormat": "Invalid format"
        }
      }
    }
  }
}
```

## Especificações Técnicas

### Tipos TypeScript

```typescript
// Em src/types/template.ts ou arquivo apropriado
interface TemplateFieldValue {
  current: unknown;
  default: unknown;
  isCustomized: boolean;
  lastModified?: Date;
}

enum FieldValueOrigin {
  TEMPLATE_DEFAULT = 'template_default',
  BLUEPRINT_CUSTOM = 'blueprint_custom',
}

interface ValueEditingState {
  isEditing: boolean;
  tempValue: unknown;
  validationError: string | null;
  hasChanges: boolean;
}
```

### Padrões de Design

**Factory Pattern** para editores:

```typescript
class ValueEditorFactory {
  static createEditor(field: TemplateField): ValueEditor {
    switch (field.type) {
      case 'string':
        return new StringEditor();
      case 'number':
        return new NumberEditor();
      case 'boolean':
        return new BooleanEditor();
      case 'object':
        return new ObjectEditor();
      default:
        return new StringEditor(); // fallback
    }
  }
}
```

**Strategy Pattern** para validação:

```typescript
class ValidationStrategyManager {
  private strategies: Map<string, ValidationStrategy>;

  validate(value: unknown, field: TemplateField): ValidationResult {
    const strategy = this.strategies.get(field.type);
    return strategy?.validate(value, field) ?? { isValid: true };
  }
}
```

### Estilo e UI

**Convenções do Projeto**:

- Use shadcn/ui components (Button, Input, Textarea, etc.)
- Siga padrões de Tailwind já estabelecidos
- Mantenha consistência com outros componentes da tabela
- Use ícones do Lucide React

**Estados Visuais**:

```css
/* Exemplos de classes esperadas */
.value-default {
  /* styling neutro */
}
.value-custom {
  /* borda azul, indicador visual */
}
.value-editing {
  /* background destacado */
}
.value-invalid {
  /* borda vermelha, texto de erro */
}
```

## Integração com Componentes Existentes

### TableRows.tsx

- Substitua as células "Template Default" e "Blueprint Value"
- Use `<UnifiedValueColumn />` no lugar das duas colunas
- Mantenha todas as outras funcionalidades intactas

### EnhancedTableRows.tsx

- Atualize a estrutura de colunas
- Mantenha funcionalidades de expansão/colapso
- Integre com sistema de filtros existente

## Fluxo de Interação Esperado

1. **Estado Inicial**: Valor exibido com indicador de origem
2. **Entrada em Edição**: Click ou Enter ativa modo de edição
3. **Durante Edição**:
   - ESC cancela e volta ao valor original
   - Validação em tempo real
   - Apply só habilitado para valores válidos
4. **Aplicação**: Confirma mudança e sai do modo de edição
5. **Reset**: Opção para voltar ao valor padrão do template

## Critérios de Aceitação

### Funcionalidade Mínima Viável

- [ ] Uma única coluna substitui as duas existentes
- [ ] Indicadores visuais claros de origem do valor
- [ ] Fluxo Apply/Cancel funcional
- [ ] Validação antes de aplicar mudanças
- [ ] Suporte a ESC para cancelar

### Qualidade Técnica

- [ ] Tipagem TypeScript completa
- [ ] Separação clara de responsabilidades
- [ ] Componentes testáveis e reutilizáveis
- [ ] Performance adequada para hierarquias grandes
- [ ] Integração suave com código existente

### UX/UI

- [ ] Interface intuitiva sem necessidade de treinamento
- [ ] Feedback visual imediato para todas as ações
- [ ] Comportamento consistente em todos os tipos de campo
- [ ] Acessibilidade básica (navegação por teclado)

## Teste e Validação

### Cenários de Teste Essenciais

1. **Edição de valores simples** (string, number, boolean)
2. **Edição de objetos complexos** (JSON válido/inválido)
3. **Cancelamento durante edição** (ESC e botão Cancel)
4. **Validação de entrada** (tipos incorretos, formatos inválidos)
5. **Reset para valor padrão** do template
6. **Performance** com hierarquias de 100+ campos

### Casos Edge

- Valores null/undefined
- Strings muito longas
- Objetos com estrutura complexa
- Edição simultânea de múltiplos campos (não deve acontecer)

## Próximos Passos

1. **Implementar UnifiedValueColumn** como componente principal
2. **Criar editores básicos** (String, Number, Boolean)
3. **Implementar sistema de validação** básico
4. **Integrar com tabela existente** substituindo as duas colunas
5. **Adicionar traduções** necessárias
6. **Testar fluxo completo** de edição
7. **Implementar editor de objetos** complexos
8. **Polimento visual** e accessibility
9. **Documentação** e cleanup final

---

**Importante**: Mantenha toda funcionalidade existente intacta. Esta é uma refatoração de UX/UI, não uma reescrita. O sistema de busca/filtro e expansão hierárquica deve continuar funcionando exatamente como antes.
