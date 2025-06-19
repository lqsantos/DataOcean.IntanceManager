# Guia de Implementação: Coluna de Valor Unificada

## ⚠️ DOCUMENTO DEPRECIADO

**Este documento foi substituído por versões mais focadas e funcionais:**

- **Guia Funcional Principal**: `docs/unified-value-column-guide-functional.md`
- **Prompt de Implementação**: `docs/copilot-implementation-prompt-refined.md`
- **Roadmap Futuro**: `docs/dynamic-field-addition-roadmap-refined.md`

**Motivo da Refatoração**: Este documento original continha muito código específico misturado com especificações funcionais. Os novos documentos separam claramente:

- **O que é esperado** (guide funcional)
- **Como implementar** (prompt técnico)
- **O que vem depois** (roadmap)

---

## Resumo Executivo (Histórico)

Este documento detalha a implementação completa da refatoração da tabela hierárquica de campos de template, com foco na criação de uma coluna de valor unificada que melhora significativamente a UX/UI e a qualidade do código.

## Problema Atual

### Limitações da Interface Existente

- **Duas colunas separadas** confundem usuários ("Template Default" e "Blueprint Value")
- **Falta de clareza visual** sobre origem dos valores (template vs customizado)
- **Fluxo de edição inconsistente** sem Apply/Cancel explícito
- **Comportamento inadequado para objetos** que mostram "[object Object]"
- **Ausência de validação** antes de aplicar mudanças

### Impacto na Experiência do Usuário

- Usuários não sabem quando valores foram customizados
- Edição acidental sem possibilidade de cancelar
- Dificuldade para resetar valores customizados
- Interface cluttered com informações redundantes

## Objetivos Principais

### 1. Coluna de Valor Unificada

- **Consolidar** as colunas "Template Default" e "Blueprint Value" em uma única coluna "Value"
- **Implementar** indicadores visuais claros para origem do valor (template vs customizado)
- **Criar** fluxo explícito de Apply/Cancel para edição
- **Adicionar** validação de formato antes de aplicar mudanças

### 2. Melhorias de UX/UI

- **Aprimorar** controles de busca/filtro já implementados
- **Implementar** indicadores visuais de estado (borda + ícone)
- **Suportar** ESC para cancelar edição
- **Melhorar** feedback visual durante edição

### 3. Qualidade do Código

- **Extrair** editores de valor para módulos reutilizáveis
- **Centralizar** lógica de validação
- **Implementar** tipagem forte
- **Seguir** convenções de tradução do projeto

## Estado Atual da Refatoração (Documentação Histórica)

### ✅ Completado

#### Controles de Filtro e Busca

- **Lógica de busca/filtro refatorada** para campos aninhados
- **Auto-expansão de nós pais** quando filhos correspondem à busca
- **Controles expand/collapse aprimorados** com melhor UX
- **Remoção de badge desnecessário** do cabeçalho "Template Values"

#### Documentação e Planejamento

- **Documentação funcional completa** (`unified-value-column-guide-functional.md`)
- **Prompt técnico refinado** para implementação (`copilot-implementation-prompt-refined.md`)
- **Roadmap de funcionalidades futuras** (`dynamic-field-addition-roadmap-refined.md`)
- **Interfaces TypeScript especificadas** para extensibilidade
- **Padrões arquiteturais definidos** (Factory, Strategy, SRP)

### ⏳ Pendente de Implementação

#### Componente Principal

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/TableComponents/UnifiedValueColumn.tsx`

**Status**: Não implementado - especificado em detalhes no prompt técnico

#### Sistema de Editores

**Localização:** `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/`

**Status**: Estrutura planejada, não implementado

#### Sistema de Validação

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/validation/valueValidation.ts`

**Status**: Interface especificada, não implementado

#### Hook de Gerenciamento

**Arquivo:** `src/hooks/useValueEditor.ts`

**Status**: API definida, não implementado

#### Traduções

**Arquivos:** `src/locales/en/blueprints.json`, `src/locales/pt/blueprints.json`

**Status**: Chaves especificadas, não implementado

---

## Próximos Passos para Implementação

1. **Seguir prompt técnico refinado** (`docs/copilot-implementation-prompt-refined.md`)
2. **Implementar componentes na ordem especificada**
3. **Validar critérios de aceitação funcionais**
4. **Executar testes e polimento final**

**Para implementação detalhada, consulte os documentos refinados mencionados no início deste arquivo.**

- ✅ Design visual dos controles de filtro simplificado
- ✅ Controles de expand/collapse all melhorados
- ✅ Remoção de logs de debug e comentários desnecessários
- ✅ Badge de contagem de campos removido

### Arquivos Já Refatorados

- `src/components/blueprints/sections/DefaultValuesSection/EnhancedFilterControls.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/fields/`
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/`

## Implementação Pendente

### 1. Componente UnifiedValueColumn

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/TableComponents/UnifiedValueColumn.tsx`

#### Funcionalidades

- **Indicador Visual de Origem:**

  - Borda verde + ícone para valores customizados
  - Borda cinza + ícone para valores padrão do template
  - Estados hover e focus bem definidos

- **Estados de Edição:**
  - Modo visualização: mostra valor atual com indicador
  - Modo edição: campo editável com botões Apply/Cancel
  - Validação de formato antes de aplicar
  - Suporte a ESC para cancelar

#### Interface TypeScript

```typescript
interface UnifiedValueColumnProps {
  field: BlueprintFieldNode;
  value: string | undefined;
  templateDefault: string | undefined;
  isCustomized: boolean;
  onValueChange: (fieldId: string, value: string | undefined) => void;
  validation?: ValidationConfig;

  // Hooks para funcionalidade futura (Fase 2)
  canAddFields?: boolean;
  onAddField?: (parentField: BlueprintFieldNode) => void;
  canAddItems?: boolean;
  onAddItem?: (arrayField: BlueprintFieldNode) => void;
}

interface ValueState {
  isEditing: boolean;
  editValue: string;
  hasError: boolean;
  errorMessage?: string;
}

// Enum para tipos de campo - melhor que string literals
enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
}

// Enum para origem do valor
enum ValueSourceType {
  TEMPLATE = 'template',
  BLUEPRINT = 'blueprint',
}
```

#### Estrutura do Componente

```tsx
const UnifiedValueColumn: React.FC<UnifiedValueColumnProps> = ({
  field,
  value,
  templateDefault,
  isCustomized,
  onValueChange,
  validation,
  canAddFields = false,
  onAddField,
  canAddItems = false,
  onAddItem,
}) => {
  // Estados locais de edição com tipos explícitos
  const [valueState, setValueState] = useState<ValueState>({
    isEditing: false,
    editValue: value || '',
    hasError: false,
    errorMessage: undefined,
  });

  // Handlers tipados
  const handleStartEdit = useCallback(() => {
    setValueState((prev) => ({
      ...prev,
      isEditing: true,
      editValue: value || '',
    }));
  }, [value]);

  const handleApply = useCallback(() => {
    if (validation && !validation.validate(valueState.editValue)) {
      setValueState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: validation.errorMessage,
      }));
      return;
    }

    onValueChange(field.path, valueState.editValue);
    setValueState((prev) => ({ ...prev, isEditing: false, hasError: false }));
  }, [valueState.editValue, validation, onValueChange, field.path]);

  const handleCancel = useCallback(() => {
    setValueState((prev) => ({
      ...prev,
      isEditing: false,
      editValue: value || '',
      hasError: false,
      errorMessage: undefined,
    }));
  }, [value]);

  // Suporte a ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && valueState.isEditing) {
        handleCancel();
      }
    };

    if (valueState.isEditing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [valueState.isEditing, handleCancel]);

  // Roteamento por tipo de campo
  const renderByFieldType = () => {
    switch (field.type) {
      case FieldType.OBJECT:
        return (
          <ObjectDisplayComponent
            field={field}
            children={field.children}
            onResetChildren={(fieldPath) => resetAllChildrenToTemplate(fieldPath)}
            canAddFields={canAddFields}
            onAddField={onAddField}
          />
        );

      case FieldType.ARRAY:
        return (
          <ArrayDisplayComponent
            field={field}
            items={field.items}
            onResetItems={(fieldPath) => resetAllItemsToTemplate(fieldPath)}
            canAddItems={canAddItems}
            onAddItem={onAddItem}
          />
        );

      case FieldType.STRING:
        return (
          <TextValueEditor
            value={valueState.editValue}
            isEditing={valueState.isEditing}
            isCustomized={isCustomized}
            onChange={(newValue) => setValueState((prev) => ({ ...prev, editValue: newValue }))}
            onStartEdit={handleStartEdit}
            onApply={handleApply}
            onCancel={handleCancel}
            validation={validation}
            hasError={valueState.hasError}
            errorMessage={valueState.errorMessage}
          />
        );

      case FieldType.NUMBER:
        return (
          <NumberValueEditor
            value={valueState.editValue}
            isEditing={valueState.isEditing}
            isCustomized={isCustomized}
            onChange={(newValue) => setValueState((prev) => ({ ...prev, editValue: newValue }))}
            onStartEdit={handleStartEdit}
            onApply={handleApply}
            onCancel={handleCancel}
            validation={validation}
            hasError={valueState.hasError}
            errorMessage={valueState.errorMessage}
          />
        );

      case FieldType.BOOLEAN:
        return (
          <BooleanValueEditor
            value={valueState.editValue}
            isEditing={valueState.isEditing}
            isCustomized={isCustomized}
            onChange={(newValue) => setValueState((prev) => ({ ...prev, editValue: newValue }))}
            onStartEdit={handleStartEdit}
            onApply={handleApply}
            onCancel={handleCancel}
            validation={validation}
            hasError={valueState.hasError}
            errorMessage={valueState.errorMessage}
          />
        );

      default:
        console.warn(`Unsupported field type: ${field.type}`);
        return <div>Unsupported field type</div>;
    }
  };

  return <div className="unified-value-column">{renderByFieldType()}</div>;
};

// Memoização para performance
export default React.memo(UnifiedValueColumn);
```

### 2. Extração de Editores de Valor

**Pasta:** `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/`

#### Módulos a Criar:

- `TextValueEditor.tsx` - Editor para campos de texto
- `NumberValueEditor.tsx` - Editor para campos numéricos
- `BooleanValueEditor.tsx` - Editor para campos booleanos
- `ArrayValueEditor.tsx` - Editor para arrays
- `ObjectDisplayComponent.tsx` - Visualizador para campos de objeto
- `index.ts` - Barrel export

#### Interface Comum dos Editores

```typescript
// Interface base para todos os editores
interface BaseValueEditorProps {
  value: string;
  isEditing: boolean;
  isCustomized: boolean;
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onApply: () => void;
  onCancel: () => void;
  validation?: ValidationConfig;
  hasError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  placeholder?: string;
  'data-testid'?: string; // Para testes
}

// Props específicas para diferentes tipos
interface TextValueEditorProps extends BaseValueEditorProps {
  multiline?: boolean;
  maxLength?: number;
}

interface NumberValueEditorProps extends BaseValueEditorProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

interface BooleanValueEditorProps extends BaseValueEditorProps {
  trueLabel?: string;
  falseLabel?: string;
}

interface ArrayValueEditorProps extends BaseValueEditorProps {
  itemType: FieldType;
  minItems?: number;
  maxItems?: number;
}
```

### 3. Sistema de Validação Centralizada

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/validation/valueValidation.ts`

#### Funcionalidades

- Validadores por tipo de campo
- Mensagens de erro padronizadas
- Validação assíncrona quando necessário
- Cache de resultados de validação

#### Interface

```typescript
// Enums para melhor type safety
enum ValidationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  EMAIL = 'email',
  URL = 'url',
  REGEX = 'regex',
}

interface ValidationConfig {
  type: ValidationType;
  required?: boolean;
  format?: string | RegExp; // Suporte a regex compilado
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => boolean;
  customErrorMessage?: string;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warnings?: string[]; // Para avisos não-bloqueantes
}

// Classe principal de validação
class ValueValidator {
  private static cache = new Map<string, ValidationResult>();

  static async validateFieldValue(
    value: unknown,
    config: ValidationConfig,
    useCache = true
  ): Promise<ValidationResult> {
    const cacheKey = `${JSON.stringify(value)}-${JSON.stringify(config)}`;

    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = await this.performValidation(value, config);

    if (useCache) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  private static async performValidation(
    value: unknown,
    config: ValidationConfig
  ): Promise<ValidationResult> {
    // Validação de required
    if (config.required && (value === null || value === undefined || value === '')) {
      return {
        isValid: false,
        errorMessage: 'This field is required',
      };
    }

    // Se valor vazio e não required, é válido
    if (!config.required && (value === null || value === undefined || value === '')) {
      return { isValid: true };
    }

    // Validação por tipo
    switch (config.type) {
      case ValidationType.STRING:
        return this.validateString(String(value), config);

      case ValidationType.NUMBER:
        return this.validateNumber(value, config);

      case ValidationType.BOOLEAN:
        return this.validateBoolean(value, config);

      case ValidationType.EMAIL:
        return this.validateEmail(String(value), config);

      case ValidationType.URL:
        return this.validateUrl(String(value), config);

      case ValidationType.ARRAY:
        return this.validateArray(value, config);

      case ValidationType.OBJECT:
        return this.validateObject(value, config);

      default:
        return { isValid: true };
    }
  }

  private static validateString(value: string, config: ValidationConfig): ValidationResult {
    const warnings: string[] = [];

    // Length validation
    if (config.minLength && value.length < config.minLength) {
      return {
        isValid: false,
        errorMessage: `Minimum length is ${config.minLength} characters`,
      };
    }

    if (config.maxLength && value.length > config.maxLength) {
      return {
        isValid: false,
        errorMessage: `Maximum length is ${config.maxLength} characters`,
      };
    }

    // Pattern validation
    if (config.pattern && !config.pattern.test(value)) {
      return {
        isValid: false,
        errorMessage: config.customErrorMessage || 'Invalid format',
      };
    }

    // Custom validator
    if (config.customValidator && !config.customValidator(value)) {
      return {
        isValid: false,
        errorMessage: config.customErrorMessage || 'Validation failed',
      };
    }

    return { isValid: true, warnings };
  }

  private static validateNumber(value: unknown, config: ValidationConfig): ValidationResult {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      return {
        isValid: false,
        errorMessage: 'Must be a valid number',
      };
    }

    if (config.min !== undefined && numValue < config.min) {
      return {
        isValid: false,
        errorMessage: `Minimum value is ${config.min}`,
      };
    }

    if (config.max !== undefined && numValue > config.max) {
      return {
        isValid: false,
        errorMessage: `Maximum value is ${config.max}`,
      };
    }

    return { isValid: true };
  }

  private static validateBoolean(value: unknown, config: ValidationConfig): ValidationResult {
    const boolValue = Boolean(value);
    return { isValid: true };
  }

  private static validateEmail(value: string, config: ValidationConfig): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        errorMessage: 'Must be a valid email address',
      };
    }

    return { isValid: true };
  }

  private static validateUrl(value: string, config: ValidationConfig): ValidationResult {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        errorMessage: 'Must be a valid URL',
      };
    }
  }

  private static validateArray(value: unknown, config: ValidationConfig): ValidationResult {
    if (!Array.isArray(value)) {
      return {
        isValid: false,
        errorMessage: 'Must be an array',
      };
    }

    if (config.min !== undefined && value.length < config.min) {
      return {
        isValid: false,
        errorMessage: `Minimum ${config.min} items required`,
      };
    }

    if (config.max !== undefined && value.length > config.max) {
      return {
        isValid: false,
        errorMessage: `Maximum ${config.max} items allowed`,
      };
    }

    return { isValid: true };
  }

  private static validateObject(value: unknown, config: ValidationConfig): ValidationResult {
    if (typeof value !== 'object' || value === null) {
      return {
        isValid: false,
        errorMessage: 'Must be a valid object',
      };
    }

    return { isValid: true };
  }

  // Utility methods
  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheSize(): number {
    return this.cache.size;
  }
}

// Factory para criar validadores comuns
export const createCommonValidators = {
  required: (errorMessage = 'This field is required'): ValidationConfig => ({
    type: ValidationType.STRING,
    required: true,
    customErrorMessage: errorMessage,
  }),

  minLength: (min: number): ValidationConfig => ({
    type: ValidationType.STRING,
    minLength: min,
  }),

  maxLength: (max: number): ValidationConfig => ({
    type: ValidationType.STRING,
    maxLength: max,
  }),

  numberRange: (min?: number, max?: number): ValidationConfig => ({
    type: ValidationType.NUMBER,
    min,
    max,
  }),

  email: (): ValidationConfig => ({
    type: ValidationType.EMAIL,
  }),

  url: (): ValidationConfig => ({
    type: ValidationType.URL,
  }),

  pattern: (regex: RegExp, errorMessage?: string): ValidationConfig => ({
    type: ValidationType.REGEX,
    pattern: regex,
    customErrorMessage: errorMessage,
  }),
};

// Export da função principal (compatibilidade)
export const validateFieldValue = ValueValidator.validateFieldValue.bind(ValueValidator);
```

### 3.1. Apresentação de Campos de Objeto

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/ObjectDisplayComponent.tsx`

#### Comportamento Específico para Objetos

Os campos de objeto têm um comportamento diferenciado na coluna Value:

- **Não são editados diretamente** - apenas seus campos filhos
- **Não possuem indicadores de customização próprios** - a customização ocorre nos valores dos filhos
- **Apresentam informação estrutural** - quantidade de propriedades
- **Botão reset contextual** - aparece apenas quando há customizações nos filhos

#### Estados Visuais

**Estado 1: Objeto sem customizações nos filhos**

```
┌─────────────────────────────────┐
│ ⚪ {5 properties}               │
│    (nenhum botão)               │
└─────────────────────────────────┘
```

**Estado 2: Objeto com filhos customizados**

```
┌─────────────────────────────────┐
│ ✏️ {5 properties}                │
│    [Reset All Children]         │
└─────────────────────────────────┘
```

**Estado 3: Objeto vazio**

```
┌─────────────────────────────────┐
│ ⚪ {empty object}               │
│    (nenhum botão)               │
└─────────────────────────────────┘
```

#### Interface TypeScript para Objetos

```typescript
interface ObjectDisplayProps {
  field: BlueprintFieldNode;
  children?: BlueprintFieldNode[];
  onResetChildren: (fieldPath: string) => void;

  // Hooks para funcionalidade futura (Fase 2)
  canAddFields?: boolean;
  onAddField?: (parentField: BlueprintFieldNode) => void;
}

interface ObjectAnalysis {
  isEmpty: boolean;
  propertyCount: number;
  properties: string[];
  hasCustomizedChildren: boolean;
}

const analyzeObject = (value: unknown, children?: BlueprintFieldNode[]): ObjectAnalysis => {
  const properties = value && typeof value === 'object' ? Object.keys(value) : [];

  return {
    isEmpty: properties.length === 0,
    propertyCount: properties.length,
    properties: properties.slice(0, 3), // Preview das primeiras 3
    hasCustomizedChildren: checkForCustomizedChildren(children || []),
  };
};

const checkForCustomizedChildren = (children: BlueprintFieldNode[]): boolean => {
  return children.some(
    (child) =>
      child.source === ValueSourceType.BLUEPRINT ||
      (child.children && checkForCustomizedChildren(child.children))
  );
};
```

#### Implementação do Componente

```typescript
const ObjectDisplayComponent: React.FC<ObjectDisplayProps> = ({
  field,
  children,
  onResetChildren,
  canAddFields = false,
  onAddField
}) => {
  const analysis = useMemo(
    () => analyzeObject(field.value || field.originalValue, children),
    [field.value, field.originalValue, children]
  );

  const handleResetAllChildren = useCallback(() => {
    // Confirma ação destrutiva
    const confirmed = window.confirm(
      'Are you sure you want to reset all child fields to template values? This action cannot be undone.'
    );

    if (confirmed) {
      onResetChildren(field.path);
    }
  }, [onResetChildren, field.path]);

  const handleAddField = useCallback(() => {
    if (onAddField) {
      onAddField(field);
    }
  }, [onAddField, field]);

  return (
    <div
      className={cn(
        "rounded p-2 transition-all border-l-2",
        analysis.hasCustomizedChildren
          ? "border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10"
          : "border-muted-foreground/20 bg-muted/30"
      )}
      data-testid={`object-display-${field.path}`}
    >
      <div className="space-y-1">
        {/* Informação estrutural */}
        <div className="flex items-center gap-2">
          {analysis.hasCustomizedChildren ? (
            <Edit3
              className="h-3 w-3 text-amber-600"
              aria-label="Object has customized children"
            />
          ) : (
            <Circle
              className="h-3 w-3 text-muted-foreground/60"
              aria-label="Object using template values"
            />
          )}

          <span
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            {analysis.isEmpty
              ? "{empty object}"
              : `{${analysis.propertyCount} properties}`
            }
          </span>
        </div>

        {/* Botões de ação */}
        {(canAddFields || analysis.hasCustomizedChildren) && (
          <div className="flex gap-1" role="group" aria-label="Object actions">
            {/* Funcionalidade futura - Add Field */}
            {canAddFields && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddField}
                className="h-5 px-2 text-xs text-green-600"
                title="Add new field to this object (Feature Preview)"
                aria-label="Add new field"
                data-testid={`add-field-${field.path}`}
              >
                Add Field
              </Button>
            )}

            {/* Funcionalidade atual - Reset */}
            {analysis.hasCustomizedChildren && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAllChildren}
                className="h-5 px-2 text-xs"
                title="Reset all child fields to template values"
                aria-label="Reset all child fields to template values"
                data-testid={`reset-children-${field.path}`}
              >
                Reset All Children
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoização para performance
export default React.memo(ObjectDisplayComponent);
```

#### Fluxo de Interação com Objetos

1. **Visualização**: Usuário vê `{X properties}` com indicador visual sutil
2. **Expansão**: Clica no ícone ▶ para expandir e ver campos filhos
3. **Edição**: Edita campos filhos individuais usando editores específicos
4. **Reset**: Se necessário, usa "Reset All Children" para voltar ao template
5. **Feedback**: Indicador visual no objeto pai reflete estado dos filhos

#### Integração com UnifiedValueColumn

```typescript
const UnifiedValueColumn: React.FC<UnifiedValueColumnProps> = ({
  field,
  value,
  isCustomized,
  onValueChange,
  canAddFields,
  onAddField,
  canAddItems,
  onAddItem
}) => {
  // Factory pattern para criar handlers específicos
  const createResetHandler = useCallback((fieldPath: string, type: 'children' | 'items') => {
    return () => {
      if (type === 'children') {
        resetAllChildrenToTemplate(fieldPath);
      } else {
        resetAllItemsToTemplate(fieldPath);
      }
    };
  }, []);

  // Roteamento de componentes por tipo
  const renderComponentByType = useMemo(() => {
    switch (field.type) {
      case FieldType.OBJECT:
        return (
          <ObjectDisplayComponent
            field={field}
            children={field.children}
            onResetChildren={createResetHandler(field.path, 'children')}
            canAddFields={canAddFields}
            onAddField={onAddField}
          />
        );

      case FieldType.ARRAY:
        return (
          <ArrayDisplayComponent
            field={field}
            items={field.items}
            onResetItems={createResetHandler(field.path, 'items')}
            canAddItems={canAddItems}
            onAddItem={onAddItem}
          />
        );

      default:
        // Para tipos editáveis, usar editores específicos
        return (
          <EditableValueComponent
            field={field}
            value={value}
            isCustomized={isCustomized}
            onValueChange={onValueChange}
          />
        );
    }
  }, [
    field,
    value,
    isCustomized,
    onValueChange,
    canAddFields,
    onAddField,
    canAddItems,
    onAddItem,
    createResetHandler
  ]);

  return (
    <div
      className="unified-value-column"
      data-testid={`value-column-${field.path}`}
    >
      {renderComponentByType}
    </div>
  );
};

// Componente auxiliar para valores editáveis
const EditableValueComponent: React.FC<{
  field: BlueprintFieldNode;
  value: string | undefined;
  isCustomized: boolean;
  onValueChange: (fieldId: string, value: string | undefined) => void;
}> = ({ field, value, isCustomized, onValueChange }) => {
  // Estados e handlers já implementados no componente principal
  // ... (implementação do estado de edição)

  return (
    <div className="editable-value">
      {/* Renderização específica por tipo */}
    </div>
  );
};

export default React.memo(UnifiedValueColumn);
```

### 4. Refatoração da Tabela Principal

**Arquivos a Modificar:**

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableContainer.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableRows.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx`

#### Mudanças Necessárias:

1. **Remover coluna "Template Default"**
2. **Substituir coluna "Blueprint Value" por "Value"**
3. **Integrar UnifiedValueColumn**
4. **Atualizar larguras das colunas**
5. **Atualizar headers da tabela**

#### Nova Configuração de Colunas

```typescript
// Enum para chaves de colunas
enum TableColumnKey {
  FIELD = 'field',
  VALUE = 'value',
  TYPE = 'type',
  REQUIRED = 'required',
}

// Interface para configuração de coluna
interface TableColumn {
  key: TableColumnKey;
  label: string;
  width: string;
  sortable?: boolean;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// Configuração tipada das colunas
const TABLE_COLUMNS: readonly TableColumn[] = [
  {
    key: TableColumnKey.FIELD,
    label: 'Field',
    width: '40%',
    sortable: true,
    resizable: true,
    align: 'left',
  },
  {
    key: TableColumnKey.VALUE,
    label: 'Value',
    width: '35%', // Nova coluna unificada
    sortable: false, // Valores podem ser complexos
    resizable: true,
    align: 'left',
  },
  {
    key: TableColumnKey.TYPE,
    label: 'Type',
    width: '15%',
    sortable: true,
    resizable: true,
    align: 'center',
  },
  {
    key: TableColumnKey.REQUIRED,
    label: 'Required',
    width: '10%',
    sortable: true,
    resizable: false,
    align: 'center',
  },
] as const;

// Helper para acessar colunas por chave
export const getColumnByKey = (key: TableColumnKey): TableColumn | undefined => {
  return TABLE_COLUMNS.find((col) => col.key === key);
};

// Cálculo de larguras responsivas
export const getResponsiveColumnWidths = (screenSize: 'sm' | 'md' | 'lg' | 'xl') => {
  switch (screenSize) {
    case 'sm':
      return {
        [TableColumnKey.FIELD]: '50%',
        [TableColumnKey.VALUE]: '50%',
        [TableColumnKey.TYPE]: '0%', // Oculta em telas pequenas
        [TableColumnKey.REQUIRED]: '0%',
      };
    case 'md':
      return {
        [TableColumnKey.FIELD]: '45%',
        [TableColumnKey.VALUE]: '40%',
        [TableColumnKey.TYPE]: '15%',
        [TableColumnKey.REQUIRED]: '0%',
      };
    default:
      return {
        [TableColumnKey.FIELD]: '40%',
        [TableColumnKey.VALUE]: '35%',
        [TableColumnKey.TYPE]: '15%',
        [TableColumnKey.REQUIRED]: '10%',
      };
  }
};
```

### 5. Atualizações de Tradução

**Arquivos:**

- `src/locales/en/blueprints.json`
- `src/locales/pt/blueprints.json`

#### Novas Chaves de Tradução

```json
{
  "defaultValues": {
    "table": {
      "columns": {
        "value": "Value"
      },
      "valueStates": {
        "customized": "Customized value",
        "template": "Template default",
        "editing": "Editing...",
        "apply": "Apply",
        "cancel": "Cancel",
        "invalid": "Invalid value"
      },
      "tooltips": {
        "customizedValue": "This value has been customized",
        "templateValue": "Using template default value",
        "editValue": "Click to edit value",
        "applyChanges": "Apply changes",
        "cancelEdit": "Cancel editing",
        "pressEscToCancel": "Press ESC to cancel",
        "resetAllChildren": "Reset all child fields to template values",
        "objectHasCustomizations": "Some child fields have been customized"
      }
    }
  }
}
```

### 6. Hooks Personalizados

**Arquivo:** `src/hooks/useValueEditor.ts`

#### Funcionalidade

- Gerenciar estado de edição de valores
- Lógica de Apply/Cancel
- Integração com validação
- Suporte a ESC key

```typescript
interface UseValueEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  validation?: ValidationConfig;
  debounceMs?: number;
  autoSave?: boolean;
}

interface UseValueEditorReturn {
  value: string;
  isEditing: boolean;
  hasChanges: boolean;
  hasError: boolean;
  errorMessage?: string;
  startEdit: () => void;
  cancelEdit: () => void;
  applyChanges: () => Promise<boolean>;
  updateValue: (newValue: string) => void;
  resetToInitial: () => void;
}

const useValueEditor = ({
  initialValue,
  onSave,
  validation,
  debounceMs = 300,
  autoSave = false,
}: UseValueEditorProps): UseValueEditorReturn => {
  // Estados do editor
  const [state, setState] = useState({
    value: initialValue,
    isEditing: false,
    hasError: false,
    errorMessage: undefined as string | undefined,
  });

  // Referência para o valor inicial (para reset)
  const initialValueRef = useRef(initialValue);

  // Atualizar referência quando initialValue muda
  useEffect(() => {
    initialValueRef.current = initialValue;
    if (!state.isEditing) {
      setState((prev) => ({ ...prev, value: initialValue }));
    }
  }, [initialValue, state.isEditing]);

  // Detectar mudanças
  const hasChanges = useMemo(() => {
    return state.value !== initialValueRef.current;
  }, [state.value]);

  // Validação com debounce
  const debouncedValidation = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!validation) return;

        try {
          const result = await ValueValidator.validateFieldValue(value, validation);
          setState((prev) => ({
            ...prev,
            hasError: !result.isValid,
            errorMessage: result.errorMessage,
          }));
        } catch (error) {
          setState((prev) => ({
            ...prev,
            hasError: true,
            errorMessage: 'Validation error occurred',
          }));
        }
      }, debounceMs),
    [validation, debounceMs]
  );

  // Handlers
  const startEdit = useCallback(() => {
    setState((prev) => ({ ...prev, isEditing: true }));
  }, []);

  const cancelEdit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      value: initialValueRef.current,
      hasError: false,
      errorMessage: undefined,
    }));
  }, []);

  const updateValue = useCallback(
    (newValue: string) => {
      setState((prev) => ({ ...prev, value: newValue }));
      debouncedValidation(newValue);
    },
    [debouncedValidation]
  );

  const applyChanges = useCallback(async (): Promise<boolean> => {
    if (validation) {
      const result = await ValueValidator.validateFieldValue(state.value, validation);
      if (!result.isValid) {
        setState((prev) => ({
          ...prev,
          hasError: true,
          errorMessage: result.errorMessage,
        }));
        return false;
      }
    }

    try {
      await onSave(state.value);
      setState((prev) => ({
        ...prev,
        isEditing: false,
        hasError: false,
        errorMessage: undefined,
      }));
      initialValueRef.current = state.value;
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: 'Failed to save changes',
      }));
      return false;
    }
  }, [state.value, validation, onSave]);

  const resetToInitial = useCallback(() => {
    setState((prev) => ({
      ...prev,
      value: initialValueRef.current,
      hasError: false,
      errorMessage: undefined,
    }));
  }, []);

  // Auto-save quando sai de edição (se habilitado)
  useEffect(() => {
    if (autoSave && !state.isEditing && hasChanges && !state.hasError) {
      applyChanges();
    }
  }, [autoSave, state.isEditing, hasChanges, state.hasError, applyChanges]);

  // Suporte a ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isEditing) {
        event.preventDefault();
        cancelEdit();
      }
    };

    if (state.isEditing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [state.isEditing, cancelEdit]);

  // Cleanup debounce ao desmontar
  useEffect(() => {
    return () => {
      debouncedValidation.cancel?.();
    };
  }, [debouncedValidation]);

  return {
    value: state.value,
    isEditing: state.isEditing,
    hasChanges,
    hasError: state.hasError,
    errorMessage: state.errorMessage,
    startEdit,
    cancelEdit,
    applyChanges,
    updateValue,
    resetToInitial,
  };
};

// Hook auxiliar para debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;

  const debouncedFunc = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), waitMs);
  }) as T & { cancel: () => void };

  debouncedFunc.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debouncedFunc;
}

export default useValueEditor;
```

## Estratégia de Preparação para Funcionalidade Futura

### Contextualização

Durante o planejamento desta refatoração, identificamos que uma funcionalidade importante - **adição de novos campos dinâmicos** - pode impactar a experiência que estamos criando. Para evitar refatorações futuras desnecessárias, optamos pela **Estratégia B**: preparar a arquitetura atual para suportar essa funcionalidade sem implementá-la agora.

### Benefícios da Abordagem

✅ **Foco na funcionalidade principal** - Unificação de colunas sem complexidade adicional  
✅ **Arquitetura extensível** - Interfaces preparadas para futuras funcionalidades  
✅ **Zero overhead** - Funcionalidade futura não impacta performance atual  
✅ **UX consistente** - Interface preparada para evolução natural  
✅ **Redução de refatoração** - Mudanças futuras serão incrementais

### Preparação Arquitetural

#### 1. Interfaces Extensíveis

```typescript
// Props opcionais para funcionalidade futura
interface FutureCapabilities {
  canAddFields?: boolean; // Objeto pode receber novos campos
  canAddItems?: boolean; // Array pode receber novos itens
  onAddField?: (parent: BlueprintFieldNode) => void;
  onAddItem?: (array: BlueprintFieldNode) => void;
}
```

#### 2. Feature Flags Preparatórias

```typescript
const FEATURE_FLAGS = {
  ENABLE_ADD_FIELDS: false, // Para objetos expansíveis
  ENABLE_ADD_ITEMS: false, // Para arrays expansíveis
  SHOW_ADD_PREVIEWS: false, // Mostrar botões desabilitados
} as const;
```

#### 3. Estados Visuais Futuros

**Objeto Expansível (Preview):**

```
┌─────────────────────────────────┐
│ ⚪ {3 properties}               │
│    [Add Field] [Reset Children] │
└─────────────────────────────────┘
```

**Array Expansível (Preview):**

```
┌─────────────────────────────────┐
│ ⚪ [4 items]                    │
│    [Add Item] [Reset Items]     │
└─────────────────────────────────┘
```

### Implementação de Hooks

#### UnifiedValueColumn com Preparação

```typescript
const UnifiedValueColumn = ({
  field,
  value,
  isCustomized,
  onValueChange,
  // Funcionalidade futura
  canAddFields = false,
  onAddField,
  canAddItems = false,
  onAddItem
}: UnifiedValueColumnProps) => {

  if (field.type === 'object') {
    return (
      <ObjectDisplayComponent
        field={field}
        children={field.children}
        onResetChildren={resetChildrenHandler}
        // Hooks para futuro
        canAddFields={canAddFields}
        onAddField={onAddField}
      />
    );
  }

  if (field.type === 'array') {
    return (
      <ArrayDisplayComponent
        field={field}
        items={field.items}
        onResetItems={resetItemsHandler}
        // Hooks para futuro
        canAddItems={canAddItems}
        onAddItem={onAddItem}
      />
    );
  }

  // Outros tipos seguem fluxo normal de edição
  // ...existing code...
};
```

### Plano de Ativação Futura

#### Fase 1: Detecção de Expansibilidade

```typescript
const detectExpandableCapabilities = (field: BlueprintFieldNode): FutureCapabilities => {
  return {
    canAddFields: field.type === 'object' && field.schema?.additionalProperties !== false,
    canAddItems: field.type === 'array' && !field.schema?.maxItems,
  };
};
```

#### Fase 2: Implementação de Adição

```typescript
const handleAddField = (parentField: BlueprintFieldNode) => {
  // Modal para configurar novo campo
  openAddFieldModal({
    parentPath: parentField.path,
    availableTypes: ['string', 'number', 'boolean', 'object', 'array'],
    onConfirm: (newField) => addFieldToBlueprint(parentField, newField),
  });
};
```

### Validação da Estratégia

Esta preparação nos permite:

1. **Implementar a unificação completa** sem pressa ou complexidade extra
2. **Aprender com uso real** antes de adicionar funcionalidades complexas
3. **Ativar funcionalidades futuras** com mudanças mínimas no código
4. **Manter UX consistente** quando novas funcionalidades forem ativadas

### Documentação Relacionada

Um documento separado (`dynamic-field-addition-roadmap.md`) detalha a implementação completa da funcionalidade de adição dinâmica de campos, servindo como roadmap para desenvolvimento futuro.

## Plano de Implementação

### Fase 1: Infraestrutura Base

1. **Criar sistema de validação centralizada**
2. **Implementar hook useValueEditor**
3. **Criar interfaces TypeScript para todos os componentes**

### Fase 2: Editores de Valor

1. **Implementar editores específicos por tipo (Text, Number, Boolean, Array)**
2. **Criar componente ObjectDisplayComponent para campos de objeto**
3. **Criar componente UnifiedValueColumn com lógica de roteamento por tipo**
4. **Testar editores e display de objetos individualmente**

### Fase 3: Integração da Tabela

1. **Refatorar TableContainer para nova estrutura**
2. **Atualizar TableRows com UnifiedValueColumn**
3. **Remover código da coluna antiga**
4. **Atualizar configurações de largura**

### Fase 4: Traduções e Polimento

1. **Adicionar todas as chaves de tradução**
2. **Testar todos os fluxos de edição**
3. **Validar UX/UI final**
4. **Documentar mudanças**

## Critérios de Aceite

### Funcionalidade

- [ ] Coluna unificada mostra valor correto com indicador visual de origem
- [ ] Campos de objeto exibem informação estrutural e botão reset contextual
- [ ] Edição funciona com Apply/Cancel explícito para tipos editáveis
- [ ] ESC cancela edição corretamente
- [ ] Validação impede aplicação de valores inválidos
- [ ] Reset de filhos de objeto funciona recursivamente
- [ ] Tradução funciona em EN/PT

### Qualidade do Código

- [ ] Tipagem TypeScript completa e correta
- [ ] Separação de responsabilidades clara
- [ ] Componentes reutilizáveis
- [ ] Cobertura de testes adequada
- [ ] Performance mantida ou melhorada

### UX/UI

- [ ] Indicadores visuais claros e consistentes
- [ ] Feedback imediato para ações do usuário
- [ ] Estados de hover/focus bem definidos
- [ ] Acessibilidade mantida
- [ ] Design responsivo

## Arquivos de Referência

### Estrutura de Pastas Final

```
src/components/blueprints/sections/DefaultValuesSection/
├── TableComponents/
│   ├── UnifiedValueColumn.tsx (NOVO)
│   ├── TableContainer.tsx (MODIFICAR)
│   ├── TableRows.tsx (MODIFICAR)
│   └── EnhancedTableRows.tsx (MODIFICAR)
├── ValueEditors/ (NOVA PASTA)
│   ├── TextValueEditor.tsx
│   ├── NumberValueEditor.tsx
│   ├── BooleanValueEditor.tsx
│   ├── ArrayValueEditor.tsx
│   ├── ObjectDisplayComponent.tsx
│   └── index.ts
├── validation/ (NOVA PASTA)
│   └── valueValidation.ts
├── EnhancedFilterControls.tsx (JÁ REFATORADO)
└── fields/ (JÁ REFATORADO)
```

### Hooks

```
src/hooks/
├── useValueEditor.ts (NOVO)
└── ... (existentes)
```

### Traduções

```
src/locales/
├── en/blueprints.json (ATUALIZAR)
└── pt/blueprints.json (ATUALIZAR)
```

## Considerações Técnicas

### Performance

- Usar React.memo para componentes de linha da tabela
- Implementar debounce para validação em tempo real
- Lazy loading para editores complexos

### Acessibilidade

- ARIA labels para indicadores visuais
- Navegação por teclado completa
- Screen reader support para estados de edição

### Testes

- Unit tests para cada editor de valor
- Integration tests para fluxo completo de edição
- Visual regression tests para indicadores

#### Estratégia de Testes

```typescript
// Exemplo de testes unitários para UnifiedValueColumn
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnifiedValueColumn } from './UnifiedValueColumn';
import { FieldType, ValueSourceType } from '../types';

describe('UnifiedValueColumn', () => {
  const mockField = {
    path: 'test.field',
    name: 'testField',
    type: FieldType.STRING,
    value: 'test value',
    originalValue: 'original value',
    source: ValueSourceType.BLUEPRINT,
    required: false,
    children: []
  };

  const mockProps = {
    field: mockField,
    value: 'test value',
    templateDefault: 'original value',
    isCustomized: true,
    onValueChange: jest.fn(),
    validation: {
      type: ValidationType.STRING,
      required: false
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('String Field Editor', () => {
    it('should render string value correctly', () => {
      render(<UnifiedValueColumn {...mockProps} />);
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('should enter edit mode when clicked', async () => {
      const user = userEvent.setup();
      render(<UnifiedValueColumn {...mockProps} />);

      const valueDisplay = screen.getByDisplayValue('test value');
      await user.click(valueDisplay);

      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should apply changes on Apply button click', async () => {
      const user = userEvent.setup();
      render(<UnifiedValueColumn {...mockProps} />);

      // Enter edit mode
      await user.click(screen.getByDisplayValue('test value'));

      // Change value
      const input = screen.getByDisplayValue('test value');
      await user.clear(input);
      await user.type(input, 'new value');

      // Apply changes
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(mockProps.onValueChange).toHaveBeenCalledWith('test.field', 'new value');
    });

    it('should cancel changes on ESC key', async () => {
      const user = userEvent.setup();
      render(<UnifiedValueColumn {...mockProps} />);

      // Enter edit mode
      await user.click(screen.getByDisplayValue('test value'));

      // Change value
      const input = screen.getByDisplayValue('test value');
      await user.clear(input);
      await user.type(input, 'new value');

      // Press ESC
      await user.keyboard('{Escape}');

      // Should exit edit mode without saving
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
      expect(mockProps.onValueChange).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid input', async () => {
      const user = userEvent.setup();
      const propsWithValidation = {
        ...mockProps,
        validation: {
          type: ValidationType.STRING,
          required: true,
          minLength: 5
        }
      };

      render(<UnifiedValueColumn {...propsWithValidation} />);

      // Enter edit mode
      await user.click(screen.getByDisplayValue('test value'));

      // Enter invalid value
      const input = screen.getByDisplayValue('test value');
      await user.clear(input);
      await user.type(input, 'abc');

      // Try to apply
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/minimum length is 5/i)).toBeInTheDocument();
      });

      expect(mockProps.onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('Object Field Display', () => {
    const objectField = {
      ...mockField,
      type: FieldType.OBJECT,
      children: [
        {
          path: 'test.field.child1',
          name: 'child1',
          type: FieldType.STRING,
          value: 'child value',
          originalValue: 'original child',
          source: ValueSourceType.BLUEPRINT,
          required: false
        }
      ]
    };

    const objectProps = {
      ...mockProps,
      field: objectField
    };

    it('should render object properties count', () => {
      render(<UnifiedValueColumn {...objectProps} />);
      expect(screen.getByText('{1 properties}')).toBeInTheDocument();
    });

    it('should show reset button when has customized children', () => {
      render(<UnifiedValueColumn {...objectProps} />);
      expect(screen.getByRole('button', { name: /reset all children/i })).toBeInTheDocument();
    });

    it('should confirm before resetting children', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const onResetChildren = jest.fn();

      render(
        <UnifiedValueColumn
          {...objectProps}
          onResetChildren={onResetChildren}
        />
      );

      await user.click(screen.getByRole('button', { name: /reset all children/i }));

      expect(confirmSpy).toHaveBeenCalled();
      expect(onResetChildren).toHaveBeenCalledWith('test.field');

      confirmSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should memoize component when props do not change', () => {
      const { rerender } = render(<UnifiedValueColumn {...mockProps} />);
      const firstRender = screen.getByTestId('value-column-test.field');

      // Rerender with same props
      rerender(<UnifiedValueColumn {...mockProps} />);
      const secondRender = screen.getByTestId('value-column-test.field');

      // Component should be memoized (this is a simplified test)
      expect(firstRender).toBe(secondRender);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<UnifiedValueColumn {...mockProps} />);

      const valueInput = screen.getByDisplayValue('test value');
      expect(valueInput).toHaveAttribute('aria-label', expect.stringContaining('field value'));
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<UnifiedValueColumn {...mockProps} />);

      // Tab to input
      await user.tab();
      expect(screen.getByDisplayValue('test value')).toHaveFocus();

      // Enter edit mode with Enter key
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });
  });
});
```

#### Configuração de Testes

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '\\.(d\\.ts)$'],
  collectCoverageFrom: [
    'src/components/blueprints/sections/DefaultValuesSection/**/*.{ts,tsx}',
    '!src/components/blueprints/sections/DefaultValuesSection/**/*.stories.{ts,tsx}',
    '!src/components/blueprints/sections/DefaultValuesSection/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// src/tests/setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configurar timeouts para testes
configure({ testIdAttribute: 'data-testid' });

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});

// Mock window.alert
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});
```

## Melhores Práticas Implementadas

### 1. Arquitetura e Design Patterns

#### **Single Responsibility Principle (SRP)**

- Cada componente tem uma responsabilidade específica
- `UnifiedValueColumn`: Roteamento por tipo
- `ObjectDisplayComponent`: Apenas exibição de objetos
- `ValueValidator`: Apenas validação
- `useValueEditor`: Apenas gerenciamento de estado de edição

#### **Factory Pattern**

```typescript
// Factory para criação de editores por tipo
const createValueEditor = (type: FieldType): React.ComponentType<BaseValueEditorProps> => {
  switch (type) {
    case FieldType.STRING:
      return TextValueEditor;
    case FieldType.NUMBER:
      return NumberValueEditor;
    case FieldType.BOOLEAN:
      return BooleanValueEditor;
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }
};
```

#### **Strategy Pattern para Validação**

```typescript
// Diferentes estratégias de validação por tipo
class ValidationStrategy {
  static getValidator(type: ValidationType): ValidationFunction {
    return this.validators[type] || this.validators.default;
  }

  private static validators = {
    [ValidationType.EMAIL]: (value: string) => this.validateEmail(value),
    [ValidationType.URL]: (value: string) => this.validateUrl(value),
    default: (value: string) => ({ isValid: true }),
  };
}
```

### 2. Type Safety (TypeScript)

#### **Strict Typing com Enums**

```typescript
// Uso de enums em vez de string literals
enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
}

// Union types para casos específicos
type EditableFieldType = FieldType.STRING | FieldType.NUMBER | FieldType.BOOLEAN;
type ContainerFieldType = FieldType.OBJECT | FieldType.ARRAY;
```

#### **Generic Types para Reutilização**

```typescript
interface BaseEditor<T = string> {
  value: T;
  onChange: (value: T) => void;
  validation?: ValidationConfig<T>;
}

interface NumberEditor extends BaseEditor<number> {
  min?: number;
  max?: number;
}
```

### 3. Performance Optimizations

#### **React.memo para Componentes Puros**

```typescript
// Memoização com comparação customizada
const UnifiedValueColumn = React.memo(UnifiedValueColumnComponent, (prevProps, nextProps) => {
  // Comparação otimizada para campos grandes
  return (
    prevProps.field.path === nextProps.field.path &&
    prevProps.value === nextProps.value &&
    prevProps.isCustomized === nextProps.isCustomized
  );
});
```

#### **useMemo e useCallback Estratégicos**

```typescript
// Memoização de cálculos custosos
const analysis = useMemo(
  () => analyzeObject(field.value || field.originalValue, children),
  [field.value, field.originalValue, children]
);

// Callback memoizado para prevenir re-renders
const handleResetAllChildren = useCallback(() => {
  onResetChildren(field.path);
}, [onResetChildren, field.path]);
```

#### **Debounce para Validação**

```typescript
// Evita validação excessiva durante digitação
const debouncedValidation = useMemo(() => debounce(validateValue, 300), [validation]);
```

### 4. Error Handling e Resilience

#### **Error Boundaries**

```typescript
class ValueColumnErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ValueColumn Error:', error, errorInfo);
    // Log para serviço de monitoramento
  }

  render() {
    if (this.state.hasError) {
      return <ValueColumnFallback />;
    }
    return this.props.children;
  }
}
```

#### **Graceful Degradation**

```typescript
// Fallback para tipos não suportados
const renderByFieldType = () => {
  try {
    switch (field.type) {
      case FieldType.STRING: return <TextValueEditor />;
      // ... outros casos
      default:
        console.warn(`Unsupported field type: ${field.type}`);
        return <UnsupportedFieldTypeDisplay />;
    }
  } catch (error) {
    console.error('Render error:', error);
    return <ErrorDisplay message="Failed to render field" />;
  }
};
```

### 5. Acessibilidade (a11y)

#### **ARIA Labels e Roles**

```typescript
<div
  role="group"
  aria-label="Object actions"
  aria-describedby={`object-description-${field.path}`}
>
  <Button
    aria-label="Reset all child fields to template values"
    aria-describedby={`reset-help-${field.path}`}
  >
    Reset All Children
  </Button>
</div>
```

#### **Keyboard Navigation**

```typescript
// Suporte completo ao teclado
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      if (!isEditing) startEdit();
      else applyChanges();
      break;
    case 'Escape':
      if (isEditing) cancelEdit();
      break;
    case 'Tab':
      // Não interceptar Tab para navegação natural
      break;
  }
};
```

#### **Screen Reader Support**

```typescript
<span
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isEditing ? 'Editing field value' : 'Field value displayed'}
</span>
```

### 6. Testing Best Practices

#### **Test Structure (AAA Pattern)**

```typescript
describe('UnifiedValueColumn', () => {
  it('should apply changes when Apply button is clicked', async () => {
    // Arrange
    const mockOnValueChange = jest.fn();
    const props = { ...defaultProps, onValueChange: mockOnValueChange };

    // Act
    render(<UnifiedValueColumn {...props} />);
    await userEvent.click(screen.getByDisplayValue('test'));
    await userEvent.clear(screen.getByDisplayValue('test'));
    await userEvent.type(screen.getByDisplayValue(''), 'new value');
    await userEvent.click(screen.getByRole('button', { name: /apply/i }));

    // Assert
    expect(mockOnValueChange).toHaveBeenCalledWith('field.path', 'new value');
  });
});
```

#### **Custom Render Utilities**

```typescript
// Render helper com providers
const renderWithProviders = (
  component: React.ReactElement,
  options: { theme?: 'light' | 'dark'; locale?: string } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={options.theme || 'light'}>
      <LocaleProvider locale={options.locale || 'en'}>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );

  return render(component, { wrapper: Wrapper });
};
```

### 7. Code Organization

#### **Barrel Exports**

```typescript
// src/components/blueprints/sections/DefaultValuesSection/ValueEditors/index.ts
export { default as TextValueEditor } from './TextValueEditor';
export { default as NumberValueEditor } from './NumberValueEditor';
export { default as BooleanValueEditor } from './BooleanValueEditor';
export { default as ObjectDisplayComponent } from './ObjectDisplayComponent';
export type * from './types';
```

#### **Feature-Based Structure**

```
ValueEditors/
├── components/          # Componentes específicos
│   ├── TextValueEditor/
│   ├── NumberValueEditor/
│   └── ObjectDisplayComponent/
├── hooks/              # Hooks compartilhados
│   └── useValueEditor.ts
├── utils/              # Utilities
│   └── validation.ts
├── types/              # Type definitions
│   └── index.ts
└── index.ts           # Barrel export
```

### 8. Documentation e Comments

#### **JSDoc para APIs Públicas**

````typescript
/**
 * Hook para gerenciar estado de edição de valores com validação
 *
 * @param initialValue - Valor inicial do campo
 * @param onSave - Callback executado ao salvar
 * @param validation - Configuração de validação opcional
 * @param options - Opções adicionais (debounce, auto-save)
 *
 * @returns Estado e handlers para edição
 *
 * @example
 * ```tsx
 * const editor = useValueEditor({
 *   initialValue: 'hello',
 *   onSave: (value) => updateField(value),
 *   validation: { type: ValidationType.STRING, required: true }
 * });
 * ```
 */
export const useValueEditor = (props: UseValueEditorProps): UseValueEditorReturn => {
  // Implementation...
};
````

#### **Inline Comments para Lógica Complexa**

```typescript
// Recursively check for customized children
// This handles nested objects and arrays to determine if any descendant
// has been modified from the template default
const checkForCustomizedChildren = (children: BlueprintFieldNode[]): boolean => {
  return children.some(
    (child) =>
      // Direct customization check
      child.source === ValueSourceType.BLUEPRINT ||
      // Recursive check for nested structures
      (child.children && checkForCustomizedChildren(child.children))
  );
};
```
