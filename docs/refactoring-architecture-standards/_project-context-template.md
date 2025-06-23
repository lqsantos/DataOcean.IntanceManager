# Project Architecture Context

## Agent Context Overview

Este documento serve como **referência base** para o GitHub Copilot Agent durante todas as phases de refactoring conforme `docs/architecture-standards.md`.

**Use este context** para entender:

- Estado atual vs. estrutura target
- Domínios principais para organização em features
- Foundation elements (global cross-cutting)
- Constraints tecnológicos importantes

---

## Current State vs. Target Architecture

### 📍 **CURRENT STATE** (Before Refactoring)

**Estrutura atual distribuída:**

```
src/
├── app/                    # Next.js App Router - MANTÉM
├── components/             # React components - REFATORA
│   ├── applications/       # → features/applications/
│   ├── environments/       # → features/environments/
│   ├── locations/          # → features/locations/
│   ├── layout/             # → components/layout/ (global)
│   └── ui/                 # → components/ui/ (global)
├── hooks/                  # Custom hooks - MISTO
│   ├── use-applications.ts # → features/applications/
│   ├── use-environments.ts # → features/environments/
│   └── use-locations.ts    # → features/locations/
├── services/               # API services - MISTO
│   ├── application-service.ts # → features/applications/
│   ├── environment-service.ts # → features/environments/
│   └── location-service.ts    # → features/locations/
├── types/                  # Types - MISTO
│   ├── application.ts      # → features/applications/
│   ├── environment.ts      # → features/environments/
│   └── location.ts         # → features/locations/
└── utils/                  # Utils - MISTO (global vs feature)
```

### 🎯 **TARGET STATE** (After Architecture Standards)

**Estrutura final híbrida:**

```
src/
├── config/                 # 🆕 Global configurations
├── constants/              # 🆕 Global constants
├── utils/                  # ♻️ Global utilities only
├── types/                  # ♻️ Global types only
├── components/             # ♻️ Global components only
│   ├── layout/
│   └── ui/
├── features/               # 🆕 Domain-specific organization
│   ├── applications/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── environments/
│   └── locations/
└── app/                    # Next.js App Router - sem mudança
```

---

## Key Domains for Agent

### 🎯 **PRIMARY FEATURES** (Core Business Domains)

#### **Applications** (Priority 1)

- **Current**: `components/applications/`, `hooks/use-applications.ts`, `services/application-service.ts`, `types/application.ts`
- **Target**: `features/applications/`
- **Description**: Gerenciamento de aplicações do sistema

#### **Environments** (Priority 1)

- **Current**: `components/environments/`, `hooks/use-environments.ts`, `services/environment-service.ts`, `types/environment.ts`
- **Target**: `features/environments/`
- **Description**: Gerenciamento de ambientes (prod, staging, dev)

#### **Locations** (Priority 1)

- **Current**: `components/locations/`, `hooks/use-locations.ts`, `services/location-service.ts`, `types/location.ts`
- **Target**: `features/locations/`
- **Description**: Gerenciamento de localizações/datacenters

### 🔧 **GLOBAL ELEMENTS** (Cross-Cutting Concerns)

#### **Foundation (src/raiz/)**

- **Config**: API settings, app configuration, environment variables
- **Constants**: Routes, status codes, UI constants globais
- **Utils**: Formatters, validators, error handling, array/string helpers
- **Types**: BaseEntity, ApiResponse, Status, pagination interfaces

#### **Shared Components (src/components/)**

- **Layout**: Sidebar, Header, navigation components
- **UI**: Buttons, inputs, modals, loading states
- **Form**: Generic form components reutilizáveis

### ❌ **REMOVED/DEPRECATED**

- **git-source**: Removido do projeto (Phase 00)
- **pat**: Personal Access Tokens descontinuados (Phase 00)
- **blueprints**: Funcionalidade descontinuada
- **clusters**: Funcionalidade descontinuada

---

## Technology Stack & Constraints

### **Framework & Language**

- **Next.js 14+** (App Router) - MANTÉM atual estrutura
- **TypeScript** - Strict mode, path aliases configurados
- **React 18+** - Hooks, Context, sem Redux

### **Styling & UI**

- **Tailwind CSS** - Configurado para todo projeto
- **shadcn/ui** - Design system components
- **Responsive design** - Mobile-first approach

### **Testing & Development**

- **Vitest** - Test framework
- **MSW** - Mock Service Worker para mocks
- **ESLint + Prettier** - Code quality

### **Important Constraints for Agent**

- ✅ **Manter App Router**: Não alterar estrutura de `src/app/`
- ✅ **Preservar imports**: Usar path aliases `@/*`
- ✅ **Manter MSW mocks**: Testing infrastructure
- ✅ **TypeScript strict**: Manter type safety
- ❌ **Não quebrar build**: Validar após cada mudança

---

## Migration Phases Overview

### **Phase 00**: Code Cleanup

- Remove git-source, pat, blueprints, clusters
- Remove unused imports e dead code
- Preparar base limpa

### **Phase 01**: Foundation Architecture

- Criar `src/{config,constants,utils,types}/`
- Estabelecer foundation global
- Configurar path aliases

### **Phase 02**: Testing Framework

- Modernizar testing infrastructure
- Manter MSW mocks funcionando

### **Phase 03**: API Architecture

- HTTP client centralizado
- SWR → React Query migration
- Error handling consistente

### **Phase 04**: Features Organization (Future)

- Migrar domain-specific para `src/features/`
- Manter global elements na raiz
- Organizar por business domains

---

## Agent Usage Guidelines

### **Para todas as Phases:**

1. **Reference este doc** para entender current vs target
2. **Respeitar constraints** tecnológicos listados
3. **Priorizar VS Code tools**: `get_errors`, Problems panel, integrations
4. **Usar terminal apenas quando necessário**: Via `run_in_terminal` tool
5. **Validar mudanças**: VS Code Problems panel + build quando necessário

### **VS Code Tools Priority:**

```
1. get_errors          # Verificar problems no VS Code primeiro
2. Problems panel      # TypeScript/ESLint errors inline
3. Test explorer       # Running tests via VS Code
4. run_in_terminal     # Apenas quando VS Code tools não bastam
```

### **VS Code Integration para Validation:**

**PRIORIZAR integração VS Code:**

- **TypeScript**: Problems panel mostra errors automaticamente
- **ESLint**: Integrado via extension, errors inline
- **Build validation**: VS Code tasks ou terminal integrado
- **Testing**: Test explorer extension

**Comandos Agent (quando necessário terminal):**

```bash
run_in_terminal: 'pnpm run type-check'    # Verificar TypeScript
run_in_terminal: 'pnpm run build'        # Verificar build
run_in_terminal: 'pnpm run test'         # Verificar testes
run_in_terminal: 'pnpm run lint'         # Verificar code quality
```

**IMPORTANTE**: Agent deve usar `get_errors` tool para verificar problems no VS Code antes de recorrer ao terminal.

_Este documento evolui conforme implementação dos architecture standards._
