# 🔧 Plano de Refatoração - DataOcean Instance Manager

## 📋 Situação Atual

### Problemas Identificados:

- ❌ Padrões de export inconsistentes (export \* vs export { })
- ❌ Estrutura de diretórios sem hierarquia clara
- ❌ Componentes, hooks e utilitários sem organização por domínio
- ❌ Falta de convenções claras para index.ts

### Pontos Positivos:

- ✅ Componentes UI (shadcn/radix) bem estruturados
- ✅ TableComponents já bem organizados internamente
- ✅ Separação clara entre pages, components, hooks, services
- ✅ TypeScript bem tipado

## 🎯 Estratégia: Refatoração Conservadora

### **FASE 1: Padronização de Exports (Prioritária)**

#### 1.1 Definir Padrões de Export

```typescript
// ✅ PADRÃO RECOMENDADO: Export seletivo com re-exports organizados

// Para componentes públicos (API externa)
export { ComponentName } from './ComponentName';
export type { ComponentProps } from './ComponentName';

// Para utilitários e hooks
export { useHookName } from './hooks/useHookName';
export { utilityFunction } from './utils/utilityFunction';

// Para tipos e constantes
export type { TypeName } from './types';
export { CONSTANT_NAME } from './constants';

// ❌ EVITAR: export * from './module' - usar apenas quando apropriado
```

#### 1.2 Reorganizar Index Files por Prioridade

```
1. src/components/ui/index.ts (ALTA)
2. src/components/blueprints/sections/DefaultValuesSection/TableComponents/index.ts (MÉDIA)
3. Outros index.ts files (BAIXA)
```

### **FASE 2: Organização por Domínio**

#### 2.1 Estrutura Recomendada para TableComponents

```
TableComponents/
├── index.ts                          # Public API
├── public/                           # Componentes para uso externo
│   ├── UnifiedValueColumn.tsx
│   ├── TableView.tsx
│   └── ValidationDisplay.tsx
├── internal/                         # Componentes internos
│   ├── TableRows.tsx
│   ├── ValueEditors.tsx
│   └── EditableValueContainer.tsx
├── shared/                           # Utilitários compartilhados
│   ├── types.ts
│   ├── constants.ts
│   └── hooks/
└── services/                         # Lógica de negócio
    ├── fieldUpdateService.ts
    └── valueConfigFieldUpdateService.ts
```

#### 2.2 Index.ts Estruturado

```typescript
// src/components/blueprints/sections/DefaultValuesSection/TableComponents/index.ts

// =============================================================================
// PUBLIC API - Componentes para uso externo
// =============================================================================
export { UnifiedValueColumn } from './public/UnifiedValueColumn';
export { TableView } from './public/TableView';
export { ValidationDisplay } from './public/ValidationDisplay';

// =============================================================================
// TYPES & INTERFACES - Tipagem pública
// =============================================================================
export type {
  UnifiedValueColumnProps,
  TableViewProps,
  ValidationDisplayProps,
} from './shared/types';

// =============================================================================
// CONSTANTS - Configurações públicas
// =============================================================================
export { COLUMN_WIDTHS, VISUAL_STATES, DEFAULT_VALIDATION_CONFIG } from './shared/constants';

// =============================================================================
// HOOKS - Hooks reutilizáveis
// =============================================================================
export { useTableValidation } from './shared/hooks/useTableValidation';

// INTERNAL COMPONENTS - NÃO exportar, apenas para uso interno
// - TableRows, ValueEditors, EditableValueContainer
// - Esses componentes são detalhes de implementação
```

### **FASE 3: Padronização Global**

#### 3.1 Convenções para Index.ts

```typescript
// PADRÃO RECOMENDADO:
// 1. Comentários organizacionais
// 2. Exports agrupados por categoria
// 3. Tipos antes de implementações
// 4. Documentação inline quando necessário

/**
 * @fileoverview Public API for [Module Name]
 *
 * Este módulo exporta os componentes principais para [funcionalidade].
 *
 * @example
 * import { ComponentName, useHookName } from './path/to/module';
 */

// =============================================================================
// COMPONENTS
// =============================================================================
export { ComponentName } from './components/ComponentName';

// =============================================================================
// HOOKS
// =============================================================================
export { useHookName } from './hooks/useHookName';

// =============================================================================
// TYPES
// =============================================================================
export type { TypeName } from './types';

// =============================================================================
// UTILITIES (se necessário para API pública)
// =============================================================================
export { utilityFunction } from './utils/utilityFunction';
```

#### 3.2 Estrutura de Diretórios Padronizada

```
component-directory/
├── index.ts                 # Public API apenas
├── ComponentName.tsx        # Componente principal
├── ComponentName.test.tsx   # Testes
├── types.ts                 # Tipos específicos
├── constants.ts             # Constantes específicas
├── hooks/                   # Hooks específicos do componente
│   ├── index.ts
│   └── useSpecificHook.ts
├── utils/                   # Utilitários específicos
│   ├── index.ts
│   └── helperFunction.ts
└── components/              # Sub-componentes (se necessário)
    ├── index.ts
    └── SubComponent.tsx
```

### **FASE 4: Implementação Gradual**

#### 4.1 Cronograma Sugerido

```
Semana 1:
- ✅ Revisar e padronizar TableComponents/index.ts
- ✅ Criar estrutura public/internal/shared/services

Semana 2:
- 📝 Aplicar padrão em DefaultValuesSection/index.ts
- 📝 Reorganizar hooks e utilitários

Semana 3:
- 📝 Padronizar src/components/ui/index.ts
- 📝 Aplicar padrão em outros módulos críticos

Semana 4:
- 📝 Validação e ajustes finais
- 📝 Documentação das convenções
```

#### 4.2 Critérios de Decisão para Exports

```typescript
// ✅ EXPORTAR SEMPRE:
- Componentes React para uso externo
- Hooks públicos
- Tipos de propriedades (Props)
- Constantes de configuração pública

// ❓ EXPORTAR COM CUIDADO:
- Utilitários (apenas se realmente reutilizáveis)
- Tipos internos (apenas se necessários externamente)
- Sub-componentes (preferir composição interna)

// ❌ NÃO EXPORTAR:
- Componentes internos/de implementação
- Utilitários muito específicos
- Estados internos
- Detalhes de implementação
```

## 🚀 Próximos Passos

### Implementação Imediata (Esta Sessão):

1. **Reorganizar TableComponents** seguindo nova estrutura
2. **Atualizar index.ts** com padrão padronizado
3. **Testar imports** e garantir que não quebrou nada

### Implementação Futura:

1. Aplicar padrão em outros módulos críticos
2. Criar guidelines de desenvolvimento
3. Configurar linting rules para enforçar padrões
4. Documentar arquitetura no README

## 📊 Métricas de Sucesso

### Antes da Refatoração:

- ❌ 15+ padrões diferentes de export
- ❌ Estrutura inconsistente
- ❌ Dificuldade para encontrar componentes

### Após Refatoração:

- ✅ 1 padrão consistente de export
- ✅ Hierarquia clara (public/internal/shared/services)
- ✅ API pública bem definida
- ✅ Fácil navegação e manutenção

---

**Benefícios Esperados:**

- 🔍 **Melhor Developer Experience** - encontrar e usar componentes
- 🧪 **Facilita Testing** - dependências claras
- 📈 **Melhor Escalabilidade** - padrão consistente para novos componentes
- 🛠️ **Manutenibilidade** - refatorações mais seguras
