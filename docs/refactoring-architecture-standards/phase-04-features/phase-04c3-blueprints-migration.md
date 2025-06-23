# Phase 04C-3: Blueprints Migration

**Objetivo**: Migrar a implementação Blueprint consolidada para a features architecture seguindo o resultado da Phase 04C-2.

**Dependência**: Phase 04C-2 (Blueprints Analysis) deve estar completa com decisão arquitetural definida.

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Pre-Conditions**

**Antes de executar esta phase, validar**:

- [ ] Phase 04C-2 completa com BLUEPRINT_ANALYSIS_REPORT.md
- [ ] CONSOLIDATION_STRATEGY.md definido
- [ ] **Implementação escolhida**: [Modal-based | Dedicated Page | Híbrida]
- [ ] Breaking changes identificados

## Features Architecture Target

### **Target Structure para Blueprints**

```typescript
src/features/blueprints/
├── index.ts                 // Public API
├── components/             // UI Components
│   ├── index.ts
│   ├── BlueprintCard.tsx
│   ├── BlueprintForm.tsx
│   ├── BlueprintList.tsx
│   └── __tests__/
├── hooks/                  // Feature-specific hooks
│   ├── index.ts
│   ├── useBlueprintActions.ts
│   ├── useBlueprintValidation.ts
│   └── __tests__/
├── services/              // Business logic & API
│   ├── index.ts
│   ├── blueprintService.ts
│   ├── blueprintValidation.ts
│   └── __tests__/
├── types/                 // Feature-specific types
│   ├── index.ts
│   └── blueprint.ts
└── utils/                 // Feature-specific utilities
    ├── index.ts
    ├── blueprintHelpers.ts
    └── __tests__/
```

## Implementação da Migração

### Step 1: Criar Base Structure (Copilot Agent)

**COMANDO**: Criar estrutura base da feature:

```bash
# Copilot Agent deve usar create_directory e create_file para:
mkdir -p src/features/blueprints/{components,hooks,services,types,utils}
mkdir -p src/features/blueprints/{components,hooks,services,utils}/__tests__
```

### Step 2: Migrar Types (Copilot Agent)

**COMANDO**: Migrar tipos Blueprint para features:

```typescript
// 1. Identificar tipos existentes em:
//    - src/types/blueprint.ts (se existir)
//    - Componentes existentes (interfaces inline)
//    - Services existentes

// 2. Consolidar em src/features/blueprints/types/blueprint.ts
export interface Blueprint {
  // [tipos consolidados das duas implementações]
}

export interface BlueprintFormData {
  // [tipos de formulário]
}

export interface BlueprintValidation {
  // [tipos de validação]
}

// 3. Criar src/features/blueprints/types/index.ts
export * from './blueprint';
```

### Step 3: Migrar Services (Copilot Agent)

**COMANDO**: Migrar lógica de negócio para services:

```typescript
// 1. Identificar services existentes relacionados a Blueprints
// 2. Migrar para src/features/blueprints/services/blueprintService.ts

export class BlueprintService {
  // [métodos consolidados das duas implementações]
  async getBlueprints(): Promise<Blueprint[]> {}
  async createBlueprint(data: BlueprintFormData): Promise<Blueprint> {}
  async updateBlueprint(id: string, data: BlueprintFormData): Promise<Blueprint> {}
  async deleteBlueprint(id: string): Promise<void> {}
}

// 3. Criar src/features/blueprints/services/index.ts
export * from './blueprintService';
export * from './blueprintValidation';
```

### Step 4: Migrar Hooks (Copilot Agent)

**COMANDO**: Migrar hooks existentes ou criar novos:

```typescript
// 1. Identificar hooks existentes (use-blueprints.ts, etc.)
// 2. Migrar para src/features/blueprints/hooks/

// useBlueprintActions.ts
export const useBlueprintActions = () => {
  // [consolidar hooks das duas implementações]
};

// useBlueprintValidation.ts
export const useBlueprintValidation = () => {
  // [lógica de validação]
};

// 3. Criar src/features/blueprints/hooks/index.ts
export * from './useBlueprintActions';
export * from './useBlueprintValidation';
```

### Step 5: Migrar Components (Copilot Agent)

**COMANDO**: Migrar componentes da implementação escolhida:

```typescript
// **BASEADO NA DECISÃO da Phase 04C-2**:

// Cenário A: Se Modal-based foi escolhido
// Migrar de: src/components/resources/blueprints/
// Para: src/features/blueprints/components/

// Cenário B: Se Dedicated Page foi escolhido
// Migrar de: src/components/blueprints/
// Para: src/features/blueprints/components/

// Cenário C: Se Híbrida foi escolhida
// Consolidar ambas implementações em:
// src/features/blueprints/components/

// Principais componentes esperados:
// - BlueprintCard.tsx
// - BlueprintForm.tsx
// - BlueprintList.tsx
// - BlueprintModal.tsx (se modal-based)
// - BlueprintPage.tsx (se dedicated page)
```

### Step 6: Atualizar Imports Globais (Copilot Agent)

**COMANDO**: Atualizar todos os imports para nova structure:

```typescript
// 1. Buscar todas as referências às implementações antigas:
// grep_search("from.*blueprints", isRegexp=true)
// grep_search("import.*blueprint", isRegexp=true)

// 2. Atualizar imports para nova features structure:

// ANTES (exemplos):
import { Blueprint } from '@/types/blueprint';
import { BlueprintModal } from '@/components/resources/blueprints';
import { BlueprintPage } from '@/components/blueprints';

// DEPOIS:
import {
  Blueprint,
  BlueprintForm,
  BlueprintList,
  useBlueprintActions,
} from '@/features/blueprints';
```

### Step 7: Atualizar Routing (Copilot Agent)

**COMANDO**: Atualizar rotas se necessário:

```typescript
// 1. Identificar rotas existentes para blueprints
// 2. Atualizar imports nos arquivos de routing
// 3. Remover rotas da implementação descartada

// Em app/blueprints/page.tsx (se existir):
import { BlueprintPage } from '@/features/blueprints';

// Em outros arquivos de rota:
import { BlueprintModal } from '@/features/blueprints';
```

### Step 8: Criar Public API (Copilot Agent)

**COMANDO**: Criar API pública da feature:

```typescript
// src/features/blueprints/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';

// Specific named exports for commonly used items
export {
  Blueprint,
  BlueprintFormData,
  BlueprintService,
  useBlueprintActions,
  BlueprintForm,
  BlueprintList,
} from './components';
```

### Step 9: Atualizar Tests (Copilot Agent)

**COMANDO**: Migrar e atualizar testes:

```typescript
// 1. Identificar testes existentes para blueprints
// 2. Migrar para estrutura features
// 3. Atualizar imports nos testes
// 4. Executar testes para validação

// Estrutura esperada:
// src/features/blueprints/components/__tests__/
// src/features/blueprints/hooks/__tests__/
// src/features/blueprints/services/__tests__/
// src/features/blueprints/utils/__tests__/
```

### Step 10: Remove Legacy Code (Copilot Agent)

**COMANDO**: Remover implementações antigas:

```typescript
// **BASEADO NA DECISÃO da Phase 04C-2**:

// Cenário A: Se Modal-based foi escolhido
// REMOVER: src/components/blueprints/ (dedicated page)
// MANTER: Referências em src/components/resources/ podem ser removidas após migração

// Cenário B: Se Dedicated Page foi escolhido
// REMOVER: src/components/resources/blueprints/ (modal-based)
// MANTER: src/components/blueprints/ será removido após migração

// Cenário C: Se Híbrida foi escolhida
// REMOVER: Ambas implementações após consolidação

// Confirmar remoção apenas após validação completa!
```

### Step 11: Update Global Imports (Copilot Agent)

**COMANDO**: Atualizar imports em lib/index.ts se necessário:

```typescript
// Se houver exports globais de blueprints, atualizar para:
export * from '@/features/blueprints';
```

### Step 12: Validação Final (Copilot Agent)

**COMANDO**: Validar migração com VS Code tools:

```typescript
// 1. TypeScript validation
// Use get_errors() para verificar erros de tipo

// 2. Build validation
// Use run_vs_code_task() para executar build

// 3. Test validation
// Use run_tests() para executar testes

// 4. Import validation
// Use grep_search para confirmar que não há imports quebrados
```

**APÓS migração completa**, fazer commit:

```bash
git add .
git commit -m "feat: migrate blueprints to features architecture following consolidation strategy"
```

## Validation Checklist

### ✅ Structure Migration (Copilot Agent)

- [ ] **Features structure created**: `src/features/blueprints/` com todas as pastas
- [ ] **Types migrated**: Tipos consolidados em `types/blueprint.ts`
- [ ] **Services migrated**: Lógica de negócio em `services/`
- [ ] **Hooks migrated**: Hooks em `hooks/` com testes
- [ ] **Components migrated**: Componentes da implementação escolhida

### ✅ Integration Updates (Copilot Agent)

- [ ] **Imports updated**: Todos os imports apontando para features
- [ ] **Routing updated**: Rotas atualizadas se necessário
- [ ] **Public API created**: `index.ts` com exports organizados
- [ ] **Global imports updated**: `lib/index.ts` atualizado

### ✅ Code Quality (Copilot Agent)

- [ ] **No TypeScript errors**: Validado com get_errors()
- [ ] **Build successful**: Validado com build task
- [ ] **Tests passing**: Todos os testes passando
- [ ] **No broken imports**: Validado com grep_search

### ✅ Legacy Cleanup (Copilot Agent)

- [ ] **Old implementation removed**: Implementação não escolhida removida
- [ ] **Dead code removed**: Código morto eliminado
- [ ] **Unused types removed**: Tipos não utilizados removidos
- [ ] **Import cleanup**: Imports antigos removidos

### ✅ Documentation (Copilot Agent)

- [ ] **Migration documented**: Mudanças documentadas
- [ ] **Breaking changes noted**: Breaking changes identificados
- [ ] **Examples updated**: Exemplos de uso atualizados

## Expected Outcomes

### **Nova Estrutura Blueprints**

```typescript
// Single import point for all Blueprint functionality
import {
  Blueprint,
  BlueprintForm,
  BlueprintList,
  useBlueprintActions,
  BlueprintService,
} from '@/features/blueprints';
```

### **Consolidação Completa**

- ✅ Uma única implementação Blueprint
- ✅ Código duplicado eliminado
- ✅ Features architecture aplicada
- ✅ Public API bem definida

### **Preparação para Cleanup**

- ✅ Estrutura pronta para Phase 04D (Cleanup)
- ✅ Imports organizados e otimizados
- ✅ Legacy code removido

## Próximo Passo

→ **Phase 04D: Cleanup & Optimization** - Cleanup final e otimização de toda a features architecture
