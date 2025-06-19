# Roadmap: Adição Dinâmica de Campos

## Resumo Executivo

Este documento detalha a implementação futura da funcionalidade de **adição dinâmica de campos** na tabela hierárquica de templates. Esta funcionalidade permitirá que usuários adicionem novos campos customizados a objetos e arrays, expandindo a flexibilidade dos templates beyond the original schema.

## Contexto e Motivação

### Problema a Resolver

- **Templates limitados**: Usuários ficam restritos aos campos predefinidos no schema
- **Necessidades específicas**: Diferentes projetos precisam de configurações adicionais
- **Flexibilidade de deployment**: Helm charts often require custom configurations
- **Evolução de templates**: Novas versões podem adicionar campos não previstos

### Casos de Uso Típicos

#### 1. Configurações de Service

```yaml
service:
  type: ClusterIP
  port: 80
  # Usuário quer adicionar:
  # annotations: {}
  # labels: {}
  # sessionAffinity: ClientIP
```

#### 2. Variáveis de Ambiente

```yaml
env:
  - name: NODE_ENV
    value: production
  # Usuário quer adicionar:
  # - name: DEBUG
  #   value: "false"
  # - name: LOG_LEVEL
  #   value: "info"
```

#### 3. Configurações Customizadas

```yaml
extraConfig: {}
# Usuário quer adicionar qualquer configuração específica do projeto
```

## Arquitetura da Solução

### 1. Detecção de Expansibilidade

#### Schema Analysis

```typescript
interface ExpandabilityConfig {
  allowAdditionalProperties: boolean;
  allowAdditionalItems: boolean;
  maxProperties?: number;
  maxItems?: number;
  restrictedKeys?: string[];
  suggestedFields?: FieldSuggestion[];
}

interface FieldSuggestion {
  name: string;
  type: FieldType;
  description: string;
  defaultValue?: unknown;
  required?: boolean;
}

const analyzeExpandability = (field: BlueprintFieldNode): ExpandabilityConfig => {
  const schema = field.schema;

  if (field.type === 'object') {
    return {
      allowAdditionalProperties: schema?.additionalProperties !== false,
      maxProperties: schema?.maxProperties,
      restrictedKeys: schema?.restrictedKeys || [],
      suggestedFields: getSuggestedFields(field.path),
    };
  }

  if (field.type === 'array') {
    return {
      allowAdditionalItems: !schema?.maxItems || field.items.length < schema.maxItems,
      maxItems: schema?.maxItems,
    };
  }

  return { allowAdditionalProperties: false, allowAdditionalItems: false };
};
```

#### Sugestões Contextuais

```typescript
const getSuggestedFields = (fieldPath: string): FieldSuggestion[] => {
  const suggestions: Record<string, FieldSuggestion[]> = {
    service: [
      { name: 'annotations', type: 'object', description: 'Service annotations' },
      { name: 'labels', type: 'object', description: 'Service labels' },
      { name: 'sessionAffinity', type: 'string', description: 'Session affinity type' },
    ],
    ingress: [
      { name: 'className', type: 'string', description: 'Ingress class name' },
      { name: 'tls', type: 'array', description: 'TLS configuration' },
    ],
    env: [
      { name: 'DEBUG', type: 'string', defaultValue: 'false', description: 'Enable debug mode' },
      { name: 'LOG_LEVEL', type: 'string', defaultValue: 'info', description: 'Logging level' },
    ],
  };

  return suggestions[fieldPath] || [];
};
```

### 2. Interface de Adição

#### Modal de Configuração

```typescript
interface AddFieldModalProps {
  parentField: BlueprintFieldNode;
  expandabilityConfig: ExpandabilityConfig;
  onConfirm: (newField: NewFieldConfig) => void;
  onCancel: () => void;
}

interface NewFieldConfig {
  name: string;
  type: FieldType;
  value: unknown;
  required?: boolean;
  description?: string;
}

const AddFieldModal = ({ parentField, expandabilityConfig, onConfirm, onCancel }: AddFieldModalProps) => {
  const [fieldConfig, setFieldConfig] = useState<NewFieldConfig>({
    name: '',
    type: 'string',
    value: ''
  });

  const [showSuggestions, setShowSuggestions] = useState(true);

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Field to {parentField.name}</DialogTitle>
          <DialogDescription>
            Add a custom field to extend the template configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sugestões Rápidas */}
          {showSuggestions && expandabilityConfig.suggestedFields && (
            <SuggestedFieldsSection
              suggestions={expandabilityConfig.suggestedFields}
              onSelectSuggestion={(suggestion) => {
                setFieldConfig(suggestion);
                setShowSuggestions(false);
              }}
            />
          )}

          {/* Configuração Manual */}
          <FieldConfigurationForm
            config={fieldConfig}
            onChange={setFieldConfig}
            restrictedKeys={expandabilityConfig.restrictedKeys}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(fieldConfig)}
            disabled={!isValidFieldConfig(fieldConfig)}
          >
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### Formulário de Configuração

```typescript
const FieldConfigurationForm = ({ config, onChange, restrictedKeys }: {
  config: NewFieldConfig;
  onChange: (config: NewFieldConfig) => void;
  restrictedKeys?: string[];
}) => {
  return (
    <div className="space-y-3">
      {/* Nome do Campo */}
      <div>
        <Label htmlFor="fieldName">Field Name</Label>
        <Input
          id="fieldName"
          value={config.name}
          onChange={(e) => onChange({ ...config, name: e.target.value })}
          placeholder="Enter field name"
        />
        {restrictedKeys?.includes(config.name) && (
          <p className="text-sm text-red-500 mt-1">
            This field name is reserved
          </p>
        )}
      </div>

      {/* Tipo do Campo */}
      <div>
        <Label htmlFor="fieldType">Field Type</Label>
        <Select
          value={config.type}
          onValueChange={(type) => onChange({ ...config, type: type as FieldType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="array">Array</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Valor Inicial */}
      <div>
        <Label htmlFor="fieldValue">Initial Value</Label>
        <DynamicValueInput
          type={config.type}
          value={config.value}
          onChange={(value) => onChange({ ...config, value })}
        />
      </div>

      {/* Opções Adicionais */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={config.required || false}
          onCheckedChange={(required) => onChange({ ...config, required: !!required })}
        />
        <Label htmlFor="required">Required field</Label>
      </div>
    </div>
  );
};
```

### 3. Validação e Integração

#### Validação de Novos Campos

```typescript
const validateNewField = (
  newField: NewFieldConfig,
  parentField: BlueprintFieldNode,
  expandabilityConfig: ExpandabilityConfig
): ValidationResult => {
  const errors: string[] = [];

  // Nome único
  if (parentField.children?.some((child) => child.name === newField.name)) {
    errors.push(`Field '${newField.name}' already exists`);
  }

  // Nome reservado
  if (expandabilityConfig.restrictedKeys?.includes(newField.name)) {
    errors.push(`Field name '${newField.name}' is reserved`);
  }

  // Limite de propriedades
  if (
    expandabilityConfig.maxProperties &&
    parentField.children!.length >= expandabilityConfig.maxProperties
  ) {
    errors.push(`Maximum of ${expandabilityConfig.maxProperties} properties allowed`);
  }

  // Validação de valor por tipo
  const valueValidation = validateValueByType(newField.value, newField.type);
  if (!valueValidation.isValid) {
    errors.push(valueValidation.errorMessage!);
  }

  return {
    isValid: errors.length === 0,
    errorMessage: errors.join(', '),
  };
};
```

#### Integração com Context

```typescript
const useFieldManagement = () => {
  const { state, dispatch } = useDefaultValuesContext();

  const addField = useCallback(
    (parentPath: string, newField: NewFieldConfig) => {
      // Criar novo nó na árvore
      const newNode: BlueprintFieldNode = {
        path: `${parentPath}.${newField.name}`,
        name: newField.name,
        type: newField.type,
        value: newField.value,
        originalValue: undefined, // Novo campo não tem valor original
        source: ValueSourceType.BLUEPRINT,
        required: newField.required || false,
        isCustom: true, // Marca como campo customizado
        children: newField.type === 'object' ? [] : undefined,
      };

      dispatch({
        type: 'ADD_FIELD',
        payload: {
          parentPath,
          newField: newNode,
        },
      });

      // Notificar mudança para componente pai
      onBlueprintChange?.(state.values);
    },
    [state, dispatch]
  );

  const removeField = useCallback(
    (fieldPath: string) => {
      dispatch({
        type: 'REMOVE_FIELD',
        payload: { fieldPath },
      });
    },
    [dispatch]
  );

  return { addField, removeField };
};
```

### 4. Experiência do Usuário

#### Fluxo de Adição

1. **Identificação**: Sistema detecta objetos/arrays expansíveis automaticamente
2. **Indicação Visual**: Botão "Add Field"/"Add Item" aparece contextualmente
3. **Configuração**: Modal guiado com sugestões inteligentes
4. **Validação**: Feedback imediato sobre conflitos ou limitações
5. **Integração**: Campo aparece na árvore como customizado
6. **Edição**: Novo campo segue mesmo fluxo dos campos existentes

#### Estados Visuais

**Objeto Expansível:**

```
┌─────────────────────────────────┐
│ ⚪ {3 properties}               │
│    [Add Field] [Reset Children] │
└─────────────────────────────────┘
```

**Objeto com Campo Customizado:**

```
┌─────────────────────────────────┐
│ 🔵 {4 properties} (+1 custom)   │
│    [Add Field] [Reset All]      │
└─────────────────────────────────┘
```

**Campo Customizado na Árvore:**

```
├── 📦 service {3 properties}
│   ├── 🔵 type: "ClusterIP"
│   ├── 🔵 port: 80
│   └── ⭐ annotations: {} (custom)
```

#### Diferenciação Visual de Campos Customizados

```typescript
const CustomFieldIndicator = ({ field }: { field: BlueprintFieldNode }) => {
  if (!field.isCustom) return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Star className="h-3 w-3 text-yellow-500" />
      </TooltipTrigger>
      <TooltipContent>
        This is a custom field added to extend the template
      </TooltipContent>
    </Tooltip>
  );
};
```

### 5. Considerações Técnicas

#### Performance

- **Lazy Loading**: Sugestões carregadas apenas quando necessário
- **Debounce**: Validação de nomes com debounce para evitar spam
- **Cache**: Resultados de análise de expansibilidade em cache
- **Virtual Scrolling**: Para listas grandes de sugestões

#### Persistência

```typescript
interface BlueprintData {
  templateFields: BlueprintFieldNode[];
  customFields: CustomFieldDefinition[]; // Campos adicionados pelo usuário
  fieldOverrides: Record<string, unknown>; // Valores customizados
}

interface CustomFieldDefinition {
  path: string;
  name: string;
  type: FieldType;
  addedAt: Date;
  addedBy?: string;
  description?: string;
}
```

#### Backup e Recovery

- **Histórico de mudanças**: Track quando campos foram adicionados/removidos
- **Export/Import**: Permitir backup de configurações customizadas
- **Template Sync**: Gerenciar conflitos quando template original muda

### 6. Plano de Implementação

#### Fase 1: Infraestrutura (2-3 dias)

1. **Sistema de detecção** de expansibilidade
2. **Interfaces TypeScript** para novos campos
3. **Context actions** para ADD_FIELD/REMOVE_FIELD
4. **Validação básica** de campos

#### Fase 2: Interface (3-4 dias)

1. **Modal de adição** com formulário básico
2. **Sugestões contextuais** para campos comuns
3. **Indicadores visuais** para campos customizados
4. **Integração com UnifiedValueColumn**

#### Fase 3: Refinamento (2-3 dias)

1. **Validação avançada** e mensagens de erro
2. **Performance optimization**
3. **Testes de integração**
4. **Documentação de uso**

#### Fase 4: Features Avançadas (3-5 dias)

1. **Templates de campos** comuns
2. **Import/Export** de configurações
3. **Histórico de mudanças**
4. **Integração com Git** para versionamento

## Critérios de Aceite

### Funcionalidade Core

- [ ] Detectar objetos/arrays expansíveis automaticamente
- [ ] Modal de adição com formulário intuitivo
- [ ] Sugestões contextuais baseadas no tipo de campo
- [ ] Validação completa (nomes únicos, tipos, valores)
- [ ] Integração transparente com tabela existente
- [ ] Campos customizados visualmente diferenciados
- [ ] Remoção de campos customizados
- [ ] Export/Import de configurações

### Qualidade e Performance

- [ ] Interface responsiva e acessível
- [ ] Performance mantida com muitos campos customizados
- [ ] Validação em tempo real sem lag
- [ ] Estados de loading apropriados
- [ ] Tratamento de erros robusto

### Integração

- [ ] Compatibilidade com sistema de tradução
- [ ] Integração com validation system existente
- [ ] Sincronização com YAML view
- [ ] Compatibilidade com feature flags

## Riscos e Mitigações

### Riscos Técnicos

1. **Complexidade de validação** - Mitigar com sistema robusto de regras
2. **Performance com muitos campos** - Mitigar com virtualização e lazy loading
3. **Conflitos com template updates** - Mitigar com merge strategies

### Riscos de UX

1. **Interface complexa** - Mitigar com progressive disclosure
2. **Perda de dados** - Mitigar com auto-save e confirmações
3. **Confusão sobre origem dos campos** - Mitigar com indicadores claros

## Métricas de Sucesso

### Adoção

- **Taxa de uso**: % de usuários que adicionam campos customizados
- **Campos por blueprint**: Média de campos customizados por configuração
- **Tipos de campo**: Distribuição dos tipos mais utilizados

### Qualidade

- **Taxa de erro**: % de tentativas de adição que falham
- **Tempo de configuração**: Tempo médio para adicionar um campo
- **Satisfação do usuário**: Feedback sobre facilidade de uso

---

**Status**: 📋 **Planejamento**  
**Dependências**: Conclusão da unificação de colunas  
**Estimativa**: 10-15 dias de desenvolvimento  
**Priority**: Média (após conclusão da refatoração principal)
