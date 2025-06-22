# 🏗️ Plano de Refatoração Arquitetural - DataOcean Instance Manager

> **Versão**: 2.0 - REFORMULADO  
> **Data**: 21 de junho de 2025  
> **Status**: 🎯 Projeto Base Exemplar  
> **Objetivo**: Transformar em template de referência para futuros projetos

## 📋 Índice

- [Visão: Projeto Base Exemplar](#-visão-projeto-base-exemplar)
- [Análise Arquitetural Completa](#-análise-arquitetural-completa)
- [Plano de 6 Fases](#-plano-de-6-fases)
- [Estrutura Target Final](#-estrutura-target-final)
- [Execução Incremental](#-execução-incremental)
- [Critérios de Excelência](#-critérios-de-excelência)
- [Timeline e ROI](#-timeline-e-roi)

---

## 🎯 Visão: Projeto Base Exemplar

### **Transformação Completa**

O DataOcean Instance Manager será **completamente refatorado** para se tornar um **template de referência** que outros projetos possam usar como base, implementando **todas as melhores práticas** da indústria.

### **Objetivos Arquiteturais**

- ✅ **Arquitetura Features-Based** - Organização escalável e intuitiva
- ✅ **Testing Framework Oficial** - Jest + @next/jest (melhores práticas Next.js)
- ✅ **API Architecture** - Cliente API robusto e reutilizável
- ✅ **Type Safety Completo** - Sistema de types categorizado com Zod
- ✅ **State Management** - Providers organizados e escaláveis
- ✅ **i18n Profissional** - Sistema internacionalização exemplar
- ✅ **Developer Experience** - Estrutura intuitiva e bem documentada
- ✅ **Performance Optimized** - Lazy loading, barrel exports, paths absolutos

## 🏗️ Análise Arquitetural Completa

### **📊 Estado Atual vs Estrutura Target**

#### **🔥 GAPS CRÍTICOS - Arquitetura Base**

| Aspecto        | Estado Atual                                                        | Target Exemplar                                      | Impacto  |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| **Components** | Domínios espalhados<br/>`applications/`, `blueprints/`, `clusters/` | Features organizadas<br/>`features/InstanceManager/` | 🔥 Alto  |
| **Testing**    | Vitest                                                              | Jest + @next/jest                                    | 🔥 Alto  |
| **Services**   | 10 services separados                                               | `lib/api/` unificado                                 | 🔥 Alto  |
| **Constants**  | Duplicados (8+ locais)                                              | `config/` centralizado                               | 🔥 Alto  |
| **Types**      | Flat (`types/`)                                                     | Categorizado (`types/entities/`)                     | ⚠️ Médio |
| **State**      | `contexts/` básico                                                  | `store/` escalável                                   | ⚠️ Médio |
| **i18n**       | `locales/` simples                                                  | `i18n/` profissional                                 | ⚠️ Médio |

#### **📋 Estrutura Target Final**

```
src/
├── app/                        ✅ Next.js App Router
├── components/
│   ├── features/               🔄 NOVA - Features organizadas
│   │   ├── InstanceManager/    🔄 applications + environments + locations
│   │   ├── BlueprintManager/   🔄 blueprints + entities
│   │   ├── ClusterManager/     🔄 clusters
│   │   ├── GitSourceManager/   🔄 git-source
│   │   ├── PatManager/         🔄 pat
│   │   └── ResourceManager/    🔄 resources + form
│   ├── layout/                 ✅ Mantém
│   └── ui/                     ✅ Mantém (shadcn/ui)
├── lib/
│   ├── api/                    🔄 NOVA - Services migrados
│   │   ├── clients/            � HTTP clients organizados
│   │   ├── types/              🔄 API-specific types
│   │   └── errors/             🔄 Error handling
│   └── utils/                  ✅ Mantém
├── config/                     🔄 NOVA - Configuration
│   ├── api.ts                  🔄 API endpoints
│   ├── env.ts                  🔄 Environment validation (Zod)
│   └── constants.ts            🔄 Business constants
├── types/                      🔄 REORGANIZADA
│   ├── entities/               🔄 Business entities
│   ├── api/                    🔄 API responses
│   ├── ui/                     🔄 UI-specific types
│   └── shared/                 🔄 Common types
├── store/                      🔄 NOVA - State management
│   ├── providers/              🔄 Context providers
│   ├── contexts/               🔄 Organized contexts
│   └── hooks/                  🔄 State hooks
├── i18n/                       🔄 NOVA - Internationalization
│   ├── locales/                🔄 Translation files
│   ├── namespaces/             🔄 Feature-based namespaces
│   └── config/                 🔄 i18n configuration
├── hooks/                      🔄 REORGANIZADA
│   ├── api/                    🔄 Data fetching hooks
│   ├── ui/                     🔄 UI behavior hooks
│   └── business/               🔄 Business logic hooks
├── tests/                      🔄 MIGRADA - Jest setup
└── mocks/                      ✅ Mantém (já bem estruturado)
```

### **🎯 Benefícios da Refatoração**

#### **Para o Projeto Atual**

- ✅ **Navegabilidade** - Features agrupadas logicamente
- ✅ **Manutenibilidade** - Separation of concerns
- ✅ **Performance** - Barrel exports otimizados
- ✅ **Type Safety** - Sistema robusto com Zod
- ✅ **Testing** - Framework oficial Next.js

#### **Como Template Base**

- ✅ **Reutilização** - Estrutura escalável para novos projetos
- ✅ **Onboarding** - Desenvolvedores encontram tudo facilmente
- ✅ **Padrões** - Melhores práticas implementadas
- ✅ **Qualidade** - Testing e type safety exemplares

### Análise do Projeto Real (2025-06-20)

**DESCOBERTA**: O projeto está **significativamente mais avançado** que o plano original sugeria.

### Estrutura Atual ✅

```
src/
├── app/ ✅                      # Next.js App Directory completo
├── components/                  # ROBUSTO: 10+ feature modules
│   ├── ui/ ✅                  # shadcn/ui implementado
│   ├── applications/ ✅         # Módulo completo com forms, tables, tests
│   ├── environments/ ✅         # Módulo completo com forms, tables, tests
│   ├── locations/ ✅            # Módulo completo
│   ├── blueprints/ ✅           # Módulo complexo e funcional
│   ├── clusters/ ✅             # Módulo implementado
│   ├── git-source/ ✅           # Funcionalidade Git integrada
│   ├── pat/ ✅                 # Personal Access Token
│   └── layout/ ✅              # Layout system completo
├── hooks/ ✅                   # 15+ hooks implementados e testados
├── services/ ✅                # 8+ services com testes unitários
├── types/ ✅                   # Types organizados por domínio
├── contexts/ ✅                # 7+ contexts implementados
├── lib/ ✅                     # Utils, i18n, navigation
├── locales/ ✅                 # Sistema i18n ROBUSTO (pt/en)
├── mocks/ ✅                   # MSW COMPLETO e funcional
├── tests/ ✅                   # Setup de testes, MSW, utils
└── utils/ ✅                   # Utilities implementadas
```

### Estrutura Target (REVISADA)

O **target já foi amplamente alcançado**. Ajustes necessários:

```
src/
├── app/ ✅                      # Mantém (perfeito)
├── components/                  # MANTER estrutura atual
│   ├── ui/ → organizar melhor   # Apenas reorganização interna
│   ├── features/ ❌             # NÃO APLICAR - atual é melhor
│   └── layout/ ✅              # Mantém
├── hooks/ → reorganizar         # api/, ui/, business/
├── lib/ ✅                     # Mantém e expande
├── types/ ✅                   # Mantém estrutura atual
├── constants/ ❌               # CRIAR (único gap real)
├── services/ ✅                # Mantém (excelente)
├── store/ ❌                   # contexts/ atual é suficiente
├── i18n/ → reorganizar          # locales/ + lib/i18n.ts
├── mocks/ ✅                   # PERFEITO (consolidar duplicação)
└── utils/ → expandir           # Expandir estrutura atual
```

---

## 🚨 Análise de Gaps - REVISADA

### Gap 1: Constants Centralizados (ÚNICO GAP CRÍTICO)

**Problema**: API_BASE_URL duplicado em 8+ services, sem constants centralizados

**Evidência**:

```typescript
// Encontrado em TODOS os services:
src/services/application-service.ts: const API_BASE_URL = '/api';
src/services/environment-service.ts: const API_BASE_URL = '/api';
src/services/location-service.ts: const API_BASE_URL = '/api';
```

**Target**:

```typescript
// constants/api.ts
export const API_BASE_URL = '/api';
```

### Gap 2: Inconsistências de Imports (MÉDIO IMPACTO)

**Problema Identificado**: Mistura de import patterns inconsistentes no projeto

**❌ Padrões Inconsistentes Encontrados:**

```typescript
// src/components/entities/entity-table.tsx
export interface Column<T> {
  key: string;
  title: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface EntityTableProps<T extends { id: string }> {
  columns: Column<T>[];
  entities: T[];
  isLoading: boolean;
  onEdit: (entity: T) => void;
  onDelete: (id: string) => Promise<void>;
  'data-testid'?: string;
}
```

**⚠️ Inconsistências Encontradas:**

```typescript
// src/components/environments/environment-form.tsx
interface EnvironmentFormProps {
  environment?: Environment;
  entity?: Environment; // Props duplicadas para compatibilidade
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Interface interna sem export
interface EnvironmentFormValues {
  name: string;
  slug: string;
  order: string; // Tipo string quando deveria ser number
}
```

**❌ Problemas de Types em UI Components:**

```typescript
// Muitos componentes UI sem props interface definida
// ou usando apenas React.ComponentProps<"div">
function Component({ className, ...props }) { // Sem types explícitos
```

#### Solução: Padronização de Types

**Target Structure:**

```typescript
// Sempre exportar interfaces de props
export interface ComponentNameProps {
  // Props obrigatórias primeiro
  requiredProp: string;
  onAction: (data: DataType) => void;

  // Props opcionais depois
  optionalProp?: string;
  className?: string;
  'data-testid'?: string;
}

// Types internos também exportados quando reutilizáveis
export interface InternalFormValues {
  field1: string;
  field2: number; // Types corretos
}

export const ComponentName = ({
  requiredProp,
  onAction,
  className,
  ...otherProps
}: ComponentNameProps) => {
  // Implementação
};
```

### Gap 3: Inconsistências de Imports (MÉDIO IMPACTO)

**Problema Identificado**: Mistura de import patterns inconsistentes no projeto

**❌ Padrões Inconsistentes Encontrados:**

1. **Imports Relativos vs Absolutos (Misturados)**:

   ```typescript
   // src/lib/i18n.ts - INCONSISTENTE
   import enBlueprints from '../locales/en/blueprints.json';
   import ptBlueprints from '../locales/pt/blueprints.json';
   // ... 14 imports relativos para locales

   // src/services/template-schema-service.ts - INCONSISTENTE
   import type { DefaultValueField } from '../components/blueprints/sections/DefaultValuesSection/types';
   import { logError } from '../utils/errorLogger';

   // src/components/resources/blueprints/steps/ - INCONSISTENTE
   import type { CatalogTemplate } from '../../types';
   import { useTemplateSelection } from '../../hooks/use-template-selection';
   ```

2. **Barrel Exports Incompletos**:

   ```typescript
   // ✅ BOM: src/components/ui/index.ts (existe mas básico)
   export * from './avatar';
   export { Avatar as UserAvatar } from './other-file';

   // ❌ FALTAM: Principais diretórios sem barrel exports
   // src/components/applications/index.ts - NÃO EXISTE
   // src/components/environments/index.ts - NÃO EXISTE
   // src/components/layout/index.ts - NÃO EXISTE
   // src/services/index.ts - NÃO EXISTE
   // src/types/index.ts - NÃO EXISTE
   ```

3. **Paths Longos sem Usar @/ Alias**:

   ```typescript
   // ❌ RUIM: Navegação complexa entre diretórios
   import type { DefaultValueField } from '../../types';
   import { useTemplateSelection } from '../../hooks/use-template-selection';
   import type { FieldValidationResult } from '../TableComponents/types';

   // ✅ MELHOR: Usar imports absolutos
   import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';
   import { useTemplateSelection } from '@/hooks/blueprint/use-template-selection';
   ```

**🎯 Solução Target:**

1. **Padronizar para Imports Absolutos**:

   ```typescript
   // ✅ PADRÃO: Sempre usar @/ para imports internos
   import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';
   import { logError } from '@/utils/errorLogger';
   import enBlueprints from '@/locales/en/blueprints.json';
   ```

2. **Criar Barrel Exports Estratégicos**:

   ```typescript
   // src/components/index.ts
   export * from './applications';
   export * from './environments';
   export * from './layout';
   export * from './ui';

   // src/services/index.ts
   export * from './application-service';
   export * from './environment-service';
   export * from './location-service';

   // src/types/index.ts
   export * from './application';
   export * from './environment';
   export * from './location';
   ```

3. **Configuração tsconfig.json** (✅ já existe):
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Gap 4: Framework de Testes (MÉDIO IMPACTO)

**Problema Identificado**: Projeto usa Vitest mas arquitetura standards define Jest + @next/jest como recomendado para Next.js

**❌ Atual - Vitest**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // ... configuração customizada
  },
});

// src/tests/setup.ts
import { vi } from 'vitest';
beforeAll(() => server.listen());
```

**✅ Target - Jest + @next/jest** (conforme architecture-standards.md):

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // ... configuração Next.js oficial
};

module.exports = createJestConfig(customJestConfig);

// jest.setup.js
import '@testing-library/jest-dom';
beforeAll(() => server.listen());
```

**🎯 Benefícios da Migração**:

- **Configuração Oficial**: @next/jest é mantido pela equipe do Next.js
- **Melhor Integração**: Suporte nativo para configurações Next.js (paths, env vars, etc.)
- **Ecosystem**: Maior compatibilidade com tooling Next.js
- **Estabilidade**: Menos configuração manual necessária

**📦 Pacotes atuais vs target**:

```json
// ❌ Atual
"vitest": "^3.1.3",
"@vitest/coverage-v8": "^3.1.3",
"@vitest/ui": "^3.1.3"

// ✅ Target
"@next/jest": "^14.0.0",
"jest": "^29.0.0",
"jest-environment-jsdom": "^29.0.0"
```

### Gap 5: Props Interfaces (BAIXO IMPACTO)

**Problema Identificado**: Análise do código revelou inconsistências significativas na definição de Props interfaces.

#### Exemplos Encontrados:

**✅ Bem Estruturados (Padrão a seguir):**

```typescript
// src/components/entities/entity-table.tsx
export interface Column<T> {
  key: string;
  title: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface EntityTableProps<T extends { id: string }> {
  columns: Column<T>[];
  entities: T[];
  isLoading: boolean;
  onEdit: (entity: T) => void;
  onDelete: (id: string) => Promise<void>;
  'data-testid'?: string;
}
```

**⚠️ Inconsistências Encontradas:**

```typescript
// src/components/environments/environment-form.tsx
interface EnvironmentFormProps {
  environment?: Environment;
  entity?: Environment; // Props duplicadas para compatibilidade
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Interface interna sem export
interface EnvironmentFormValues {
  name: string;
  slug: string;
  order: string; // Tipo string quando deveria ser number
}
```

**❌ Problemas de Types em UI Components:**

```typescript
// Muitos componentes UI sem props interface definida
// ou usando apenas React.ComponentProps<"div">
function Component({ className, ...props }) { // Sem types explícitos
```

#### Solução: Padronização de Props Interfaces

**Target Structure:**

```typescript
// src/components/entities/entity-table.tsx
export interface Column<T> {
  key: string;
  title: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface EntityTableProps<T extends { id: string }> {
  columns: Column<T>[];
  entities: T[];
  isLoading: boolean;
  onEdit: (entity: T) => void;
  onDelete: (id: string) => Promise<void>;
  'data-testid'?: string;
}

// src/components/layout/sidebar.tsx
export interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export const Sidebar = ({ isCollapsed = false, className }: SidebarProps) => {
  // implementação
};

// src/components/environments/environment-form.tsx
export interface EnvironmentFormProps {
  environment?: Environment;
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EnvironmentForm = (props: EnvironmentFormProps) => {
  // implementação
};
```

#### 1.5 Padronizar Imports

**Pattern a aplicar: Always @/ para imports internos**

```typescript
// ❌ ANTES: Imports relativos inconsistentes
import enBlueprints from '../locales/en/blueprints.json';
import type { DefaultValueField } from '../components/blueprints/sections/DefaultValuesSection/types';
import type { CatalogTemplate } from '../../types';

// ✅ DEPOIS: Imports absolutos consistentes
import enBlueprints from '@/locales/en/blueprints.json';
import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';
import type { CatalogTemplate } from '@/components/resources/blueprints/types';
```

**Barrel exports estratégicos:**

```typescript
// src/components/index.ts (criar)
export * from './applications';
export * from './environments';
export * from './layout';

// src/services/index.ts (criar)
export * from './application-service';
export * from './environment-service';
export * from './location-service';
```

### Critérios de Aceitação

- [ ] Constants centralizados criados
- [ ] Todos os 8+ services atualizados
- [ ] MSW handlers consolidados
- [ ] Props interfaces padronizadas nos componentes principais
- [ ] Imports padronizados (absolutos @/ + barrel exports)
- [ ] Testes passando
- [ ] Zero duplicação de constants/types

---

## 🎯 Plano de 6 Fases

### **📅 Timeline: 40-54 horas (5-7 dias focados)**

#### **Phase 01 - Foundation Architecture** (6-8h)

**Objetivo**: Estabelecer base sólida com configurações e constants

**Escopo**:

- ✅ **Config System**: Criar `src/config/` com api.ts, env.ts, constants.ts
- ✅ **Environment Validation**: Zod schemas para environment variables
- ✅ **Constants Centralization**: Eliminar duplicações (API_BASE_URL, etc.)
- ✅ **TypeScript Paths**: Otimizar configuração de imports absolutos

**Impacto**: Foundation para todas as outras fases

---

#### **Phase 02 - Testing Framework Migration** (4-6h)

**Objetivo**: Migrar para Jest + @next/jest (melhores práticas oficiais)

**Escopo**:

- ✅ **Vitest → Jest**: Migration completa
- ✅ **@next/jest Setup**: Configuração oficial Next.js
- ✅ **MSW Integration**: Adaptar mocks para Jest
- ✅ **Test Scripts**: Atualizar package.json e workflows

**Impacto**: Testing framework oficial e mais robusto

---

#### **Phase 03 - API Architecture** (8-10h)

**Objetivo**: Migrar services para arquitetura API robusta

**Escopo**:

- ✅ **lib/api/ Structure**: Criar clients/, types/, errors/
- ✅ **Services Migration**: 10 services → API clients organizados
- ✅ **Error Handling**: Sistema unificado de tratamento de erros
- ✅ **HTTP Client**: Abstração com interceptors

**Impacto**: API architecture escalável e reutilizável

---

#### **Phase 04 - Components Architecture** (12-16h)

**Objetivo**: Reorganizar components em features escaláveis

**Escopo**:

- ✅ **Features Structure**: Criar `components/features/`
- ✅ **Domain Grouping**:
  - InstanceManager (applications + environments + locations)
  - BlueprintManager (blueprints + entities)
  - ClusterManager, GitSourceManager, PatManager, ResourceManager
- ✅ **Co-location**: Components, hooks, types por feature
- ✅ **Barrel Exports**: Sistema otimizado de exports

**Impacto**: Maior impacto - organização e navegabilidade

---

#### **Phase 05 - State & i18n Architecture** (6-8h)

**Objetivo**: Organizar state management e internacionalização

**Escopo**:

- ✅ **Store Structure**: `contexts/` → `store/` organizado
- ✅ **Provider Patterns**: Contexts escaláveis
- ✅ **i18n System**: `locales/` → `i18n/` profissional
- ✅ **Namespaces**: Translations por feature

**Impacto**: State e i18n escaláveis

---

#### **Phase 06 - Types & Standards** (4-6h)

**Objetivo**: Finalizar padronização e organização

**Escopo**:

- ✅ **Types Organization**: Categorizar em entities/, api/, ui/
- ✅ **Hooks Organization**: Categorizar em api/, ui/, business/
- ✅ **Import Standards**: 100% absolutos com barrel exports
- ✅ **Code Quality**: ESLint rules, prettier, standards

**Impacto**: Finalização da padronização

---

### **📊 Fase por Criticidade**

| Fase   | Criticidade   | ROI        | Dependências     |
| ------ | ------------- | ---------- | ---------------- |
| **01** | 🔥 Crítica    | Alto       | Nenhuma          |
| **02** | 🔥 Crítica    | Alto       | Phase 01         |
| **03** | 🔥 Crítica    | Alto       | Phase 01, 02     |
| **04** | 🔥 Crítica    | Muito Alto | Phase 01, 02, 03 |
| **05** | ⚠️ Importante | Médio      | Phase 04         |
| **06** | ⚠️ Importante | Médio      | Todas anteriores |

---

## ⚡ Fase 01 - Consolidação Crítica

### Objetivo

Centralizar constants duplicados, consolidar MSW handlers e padronizar imports/Props.

### Escopo

- ✅ Criar `src/constants/` estrutura
- ✅ Centralizar API_BASE_URL e outras constants
- ✅ Atualizar todos os services para usar constants centralizados
- ✅ Consolidar MSW handlers (remover duplicação)
- ✅ Padronizar interfaces de Props em componentes principais
- ✅ Padronizar imports (absolutos @/ + barrel exports estratégicos)

### Tarefas

#### 1.1 Estrutura de Constants

```typescript
// src/constants/api.ts
export const API = {
  BASE_URL: '/api',
  ENDPOINTS: {
    APPLICATIONS: '/applications',
    ENVIRONMENTS: '/environments',
    LOCATIONS: '/locations',
  },
} as const;

// src/constants/index.ts
export * from './api';
```

#### 1.2 Atualizar Services

```typescript
// ❌ ANTES: Duplicado em 8+ services
const API_BASE_URL = '/api';

// ✅ DEPOIS: Import centralizado
import { API } from '@/constants';
const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.APPLICATIONS}`);
```

**Services a atualizar:**

- application-service.ts
- environment-service.ts
- location-service.ts
- cluster-service.ts
- blueprint-service.ts
- template-service.ts
- pat-service.ts
- git-source-service.ts

#### 1.3 Consolidar MSW

```bash
# PROBLEMA: Handlers duplicados
src/mocks/handlers/ ✅ (manter - mais completo)
src/tests/msw/handlers.ts ❌ (remover - legacy)

# SOLUÇÃO: Update imports nos testes
// Em vez de: import { handlers } from '@/tests/msw/handlers';
// Usar: import { handlers } from '@/mocks/handlers';
```

#### 1.4 Padronizar Props Interfaces

**Componentes alvo:** sidebar, forms, tables, dialogs

**Pattern a aplicar:**

```typescript
// src/components/layout/sidebar.tsx
export interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export const Sidebar = ({ isCollapsed = false, className }: SidebarProps) => {
  // implementação
};

// src/components/environments/environment-form.tsx
export interface EnvironmentFormProps {
  environment?: Environment;
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EnvironmentForm = (props: EnvironmentFormProps) => {
  // implementação
};
```

### Critérios de Aceitação

- [ ] Constants centralizados criados
- [ ] Todos os 8+ services atualizados
- [ ] MSW handlers consolidados
- [ ] Props interfaces padronizadas nos componentes principais
- [ ] Imports padronizados (absolutos @/ + barrel exports)
- [ ] Testes passando
- [ ] Zero duplicação de constants/types

---

## 🔄 Execução Incremental - PROMPTS AUTO-SUFICIENTES

Para facilitar a execução prática do plano, foi criada uma estrutura incremental com **prompts completamente auto-suficientes** para GitHub Copilot:

**📁 `docs/refactoring-architecture-standards/`**

### ✅ Prompts Prontos para Uso

Cada prompt contém **TODAS as informações necessárias** para execução em um novo chat:

- **Contexto do Projeto**: Localização, estrutura, stack completa
- **Comandos Específicos**: Scripts shell executáveis
- **Exemplos Práticos**: Baseados no código real do DataOcean
- **Critérios de Aceitação**: Como validar cada etapa

### Estrutura de Execução

```
refactoring-architecture-standards/
├── README.md                    # Visão geral e status
├── QUICK-START.md              # Guia de execução rápida
├── 01-constants/               # Fase 01 - Constants Centralization
│   ├── analysis/prompt.md     # 📊 Auto-suficiente para análise
│   ├── implementation/prompt.md # � Auto-suficiente para implementação
│   └── validation/prompt.md   # ✅ Auto-suficiente para validação
├── 02-imports/                # Fase 02 - Imports Standardization
│   ├── analysis/prompt.md     # � Auto-suficiente para análise
│   ├── implementation/prompt.md # 🔧 Auto-suficiente para implementação
│   └── validation/prompt.md   # ✅ Auto-suficiente para validação
├── 03-props-interfaces/       # Fase 03 - Props Interfaces
├── 04-testing-framework/      # Fase 04 - Testing Framework (Opcional)
├── 05-msw-consolidation/      # Fase 05 - MSW Consolidation (Opcional)
└── 06-hooks-optimization/     # Fase 06 - Hooks Optimization (Opcional)
```

### Como Usar

1. **Abra um novo chat** com GitHub Copilot
2. **Copie qualquer prompt** da estrutura acima
3. **Execute diretamente** - todas as informações estão incluídas
4. **Siga o fluxo**: analysis → implementation → validation

**Total**: 18 prompts auto-suficientes prontos para uso isolado.
├── 05-msw-consolidation/ # Fase 05 - MSW Consolidation
└── 06-hooks-optimization/ # Fase 06 - Hooks Optimization

```

### Como Usar a Estrutura Incremental

1. **Siga a ordem sequencial**: 01 → 02 → 03 → 04 → 05 → 06
2. **Complete cada subfase**: `analysis` → `implementation` → `validation`
3. **Use os prompts específicos** como guia para cada etapa
4. **Documente os resultados** nos arquivos correspondentes
5. **Marque status no README principal** antes de avançar

### Benefícios da Execução Incremental

- **📋 Prompts específicos**: Cada etapa tem instruções claras
- **🔍 Rastreabilidade**: Resultados documentados em cada fase
- **⚡ Paralelização**: Equipe pode dividir fases independentes
- **🛡️ Segurança**: Validação antes de prosseguir
- **📈 Progresso visível**: Status claro no README

### Tempo Estimado Total

- **Fase 01-03 (Críticas)**: 7-10 horas
- **Fase 04-06 (Opcionais)**: 9-13 horas
- **Total**: 16-23 horas (2-3 dias de trabalho)

---

## 🎯 Próximos Passos

### Execução Imediata

1. **📁 Acesse a estrutura incremental**: `docs/refactoring-architecture-standards/`
2. **🚀 Consulte o guia rápido**: [`QUICK-START.md`](./refactoring-architecture-standards/QUICK-START.md)
3. **▶️ Inicie pela Fase 01**: Execute `01-constants/analysis/prompt.md`

### Recomendação de Execução

**Sequência Recomendada:**

1. **Fase 01** (Constants) - **CRÍTICA** ⏱️ 2-3h
2. **Fase 02** (Imports) - **CRÍTICA** ⏱️ 3-4h
3. **Fase 03** (Props) - **CRÍTICA** ⏱️ 2-3h
4. Avaliar ROI para fases opcionais (04-06)

### Critérios para Execução das Opcionais

- **Fase 04** (Testing): Só se Vitest apresentar problemas evidentes
- **Fase 05** (MSW): Se identificar duplicações significativas na análise
- **Fase 06** (Hooks): Se hooks apresentarem problemas de performance

---

## 🎯 Critérios de Excelência

### **✅ Resultado Final - Projeto Base Exemplar**

Após as 6 fases, o DataOcean será um **template de referência** com:

#### **🏗️ Arquitetura Exemplar**
- ✅ **Features-based Organization** - Domínios agrupados logicamente
- ✅ **API Architecture** - Cliente HTTP robusto e reutilizável
- ✅ **Type Safety Completo** - Sistema com Zod validation
- ✅ **Testing Framework Oficial** - Jest + @next/jest + MSW

#### **🔧 Developer Experience**
- ✅ **Navegabilidade Intuitiva** - Desenvolvedores encontram tudo facilmente
- ✅ **Imports Absolutos** - 100% @/ com barrel exports otimizados
- ✅ **Error Handling** - Sistema unificado e robusto
- ✅ **Hot Reload Otimizado** - Performance de desenvolvimento

#### **📊 Qualidade & Escalabilidade**
- ✅ **Zero Duplicação** - Constants, types, logic centralizados
- ✅ **Co-location** - Features auto-suficientes
- ✅ **Performance** - Lazy loading, code splitting
- ✅ **Maintainability** - Separation of concerns exemplar

#### **🌍 Template Reutilizável**
- ✅ **Setup Automatizado** - Scripts e configs prontos
- ✅ **Documentação Completa** - Padrões bem documentados
- ✅ **Padrões Enforced** - ESLint, prettier, type checking
- ✅ **CI/CD Ready** - Workflows otimizados

---

## 📈 Timeline e ROI

### **📅 Cronograma Realista**

| Semana | Fases | Horas | Progresso |
|--------|-------|-------|-----------|
| **Semana 1** | Phase 01-02 | 10-14h | Foundation + Testing |
| **Semana 2** | Phase 03-04 | 20-26h | API + Features |
| **Semana 3** | Phase 05-06 | 10-14h | State + Standards |
| **TOTAL** | 6 Phases | **40-54h** | **Projeto Base Completo** |

### **💰 ROI - Return on Investment**

#### **Custos**
- **Desenvolvimento**: 40-54h (1 desenvolvedor senior, 5-7 dias)
- **Testing/QA**: Incluído nas fases
- **Documentação**: Incluída nas fases

#### **Benefícios**
- **Template Reutilizável**: Base para 5-10 futuros projetos
- **Redução 60-70%** setup time em novos projetos
- **Qualidade Garantida**: Melhores práticas implementadas
- **Developer Experience**: Produtividade aumentada
- **Maintainability**: Redução custo manutenção

#### **Cálculo ROI**
```

Investimento: 50h (média)
Economia por projeto novo: 30-40h setup
Break-even: 2 projetos novos
ROI após 5 projetos: 500% (250h economizadas)

```

### **🎯 Justificativa Estratégica**

Este investimento transforma o DataOcean de um projeto individual em um **ativo estratégico** que:

1. **Acelera** desenvolvimento de novos projetos
2. **Garante** qualidade e consistência
3. **Reduz** curva de aprendizado de novos devs
4. **Estabelece** padrões de excelência da empresa

**Recomendação**: Executar refatoração completa para maximizar ROI a longo prazo. 🚀
```
