# DefaultValuesSection - Documentação Consolidada

## Descrição

O DefaultValuesSection é um componente sofisticado para gerenciamento de valores padrão em templates/blueprints, oferecendo:

1. **Edição de valores hierárquicos** com interface tabular
2. **Sistema de filtros avançado** para busca e filtragem
3. **Controles de exposição e override** com propagação hierárquica
4. **Expansão/colapso inteligente** de campos aninhados

## Principais Funcionalidades Implementadas

### 1. Sistema de Filtros

- **Busca por nome**: Filtragem dinâmica com debounce de 150ms
- **Filtro por campos expostos**: Toggle para mostrar apenas campos com `exposed: true`
- **Filtro por campos que podem ser sobrescritos**: Toggle para mostrar apenas campos com `overridable: true`
- **Filtro por campos customizados**: Toggle para mostrar apenas campos modificados pelo blueprint

### 2. Expansão/Colapso

- **Expandir Todos**: Expande todos os campos hierárquicos de uma vez
- **Colapsar Todos**: Colapsa todos os campos para vista compacta
- **Funcionamento com filtros**: Os botões funcionam corretamente mesmo com filtros ativos

### 3. Propagação de Toggles

- **Propagação hierárquica**: Mudanças em campos pai se propagam para filhos
- **Propagação simétrica**: Funciona tanto para ativar quanto para desativar
- **UX inteligente**: Pais são desabilitados automaticamente se todos os filhos estão desabilitados

## Arquitetura Técnica

### Componentes Principais

1. **EnhancedFilterControls**: Interface de filtros
2. **TemplateValueEditor**: Componente principal que coordena filtros e dados
3. **TableViewContainer**: Container que integra contexto e tabela
4. **FieldsContext**: Contexto React para gerenciamento de estado hierárquico

### Hooks Utilizados

- **useSharedFiltering**: Filtragem compartilhada entre componentes
- **useFields**: Acesso ao contexto de campos
- **useFieldManagement**: Gerenciamento de operações em campos

### Fluxo de Dados Simplificado

```
Filtros → useSharedFiltering → campos filtrados → TableViewContainer → FieldsContext → TableView
```

## Problemas Resolvidos

### 1. Loop Infinito de Logs

- **Causa**: Logs excessivos em useEffect e hooks de renderização
- **Solução**: Remoção/comentário de logs desnecessários

### 2. Ordem de Hooks Inconsistente

- **Causa**: Hooks condicionais e callbacks inline
- **Solução**: Hooks sempre no topo, callbacks memorizados

### 3. Botões Expand/Collapse Não Funcionavam

- **Causa**: Estado distribuído e sincronização complexa
- **Solução**: Centralização no FieldsContext com comunicação via refs

### 4. Referências de Objeto Inconsistentes

- **Causa**: Mutação de Sets sem criar novas referências
- **Solução**: Sempre criar novos Sets para garantir re-renderização

## Melhorias de Performance

1. **Debounce na busca**: Reduz chamadas durante digitação
2. **Memorização de callbacks**: Evita re-criações desnecessárias
3. **Centralização de estado**: Reduz sincronizações complexas
4. **Remoção de timeouts**: Elimina delays artificiais

## Estrutura de Arquivos

### Componentes Core

- `EnhancedFilterControls.tsx` - Interface de filtros
- `TemplateValueEditor.tsx` - Coordenador principal
- `TableViewContainer.tsx` - Container integrador

### Contexto e Estado

- `fields/FieldsContext.tsx` - Contexto React
- `fields/fieldsReducer.ts` - Reducer para ações
- `fields/fieldsUtils.ts` - Utilitários de campos

### Hooks Especializados

- `useSharedFiltering.ts` - Filtragem compartilhada
- `hooks/useFieldManagement.ts` - Gerenciamento de campos

## Status Atual

✅ **Funcionalidades Principais**: Todas implementadas e funcionando
✅ **Filtros**: Funcionando com debounce e UX suave
✅ **Expandir/Colapsar**: Funcionando via refs e contexto
✅ **Propagação**: Simétrica e hierárquica
✅ **Performance**: Otimizada sem loops ou delays

## Próximos Passos (Opcional)

1. **Testes Unitários**: Adicionar cobertura de testes
2. **Testes E2E**: Validar fluxos completos de usuário
3. **Acessibilidade**: Melhorar suporte a screen readers
4. **Internacionalização**: Verificar todas as strings traduzíveis
5. Get immediate feedback on validation errors and variable interpolation issues
6. Switch between multiple templates in the blueprint
7. Preview the final configuration contract between blueprint and instances

## Components

- **DefaultValuesSection:** Main container component
- **TemplateTabsNavigation:** Navigation tabs to switch between templates
- **TemplateValueEditor:** YAML editor with Monaco editor integration
- **TableView:** Hierarchical table view of fields with granular controls
- **ViewToggle:** Switch between YAML and table views
- **FilterControls:** Search and filter fields by various criteria
- **BatchActions:** Batch operations like expose all, reset to defaults
- **ValidationFeedback:** Component to display validation errors and warnings
- **ContractPreview:** Preview the final configuration contract

## Integration

The component integrates with:

- **BlueprintFormContext:** For form state management and persistence
- **template-schema-service:** For fetching template schemas, default values, and JSON schema validation
- **variable-validator:** For validating and highlighting variable interpolation
- **schema-validator:** For JSON schema validation of field values

## Data Flow

1. On mount, loads template schemas from the API for each selected template
2. Displays either YAML editor or table view based on user preference
3. Validates both syntax and schema constraints in real-time
4. Validates any variable interpolation against declared blueprint variables
5. Shows a consolidated preview of the configuration contract
6. Updates form context on valid changes

## Usage

```tsx
import { DefaultValuesSection } from '@/components/blueprints/sections/DefaultValuesSection';

// This component is designed to be used within a blueprint form flow
// It reads from and updates the BlueprintFormContext
const BlueprintDefaultValuesPage = () => {
  return (
    <div>
      <h1>Configure Default Values</h1>
      <DefaultValuesSection />
    </div>
  );
};
```

## Advanced Features (Entrega 3)

1. **Advanced Schema Validation**: Template values are validated against a JSON Schema fetched from the template's definition
2. **Variable Validation**: Values using template variables are validated against declared blueprint variables
3. **Error Boundaries**: Components are wrapped with ErrorBoundary to prevent UI crashes
4. **Batch Actions**: Expose all fields, hide all fields, and reset to defaults in one click
5. **Contract Preview**: View and download the finalized configuration contract between blueprint and instances
6. **Validation Feedback**: Comprehensive feedback for syntax, schema, and variable errors

## Reliability and Error Handling

- **ErrorBoundary**: Each section is wrapped with an ErrorBoundary component to prevent entire UI crashes
- **Schema Validation**: Advanced JSON Schema validation using Ajv with format support
- **Variable Warnings**: Clear warnings when undeclared variables are used in template values
- **Asynchronous Operations**: All API calls and validations are properly handled with loading states and error reporting

## Future Improvements

1. **Conditional field visibility:** Show/hide fields based on the values of other fields
2. **Field dependency graph:** Visualize dependencies between fields
3. **Snapshot comparison:** Compare current contract with previous versions
4. **Impact analysis:** Show how changes to the contract might affect existing instances
5. **Multi-template view:** Compare settings across multiple templates simultaneously
6. **Implement virtualized view:** For templates with many fields
