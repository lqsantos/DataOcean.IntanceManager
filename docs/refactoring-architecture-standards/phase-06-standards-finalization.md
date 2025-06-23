# Phase 06: Standards Finalization

**Objetivo**: Finalizar padrões arquiteturais, configurar qualidade de código e documentação para template exemplar.

**Dependência**: Phase 05 (Global State) completa.

## Context & Pre-Conditions

> **📋 Contexto**: Consulte [project-architecture-context.md](../project-architecture-context.md) para convenções.

**Validar antes de executar**:

- [ ] Phase 05: Global State completa
- [ ] Zustand store funcional
- [ ] Features architecture implementada

## Implementation Target

**FOCO**: Configurar qualidade, documentação e finalizar template.

### Step 1: Code Quality Setup

Instalar apenas dependências que faltam:

```bash
# Verificar dependências já instaladas:
# ✅ eslint-plugin-import: ^2.31.0 (já instalado)
# ✅ husky: ^9.1.7 (já instalado)
# ✅ lint-staged: ^16.0.0 (já instalado)
# ✅ prettier-plugin-tailwindcss: ^0.6.11 (já instalado)
# ✅ @testing-library/jest-dom: ^6.6.3 (já instalado)

# Instalar apenas o que falta:
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint-plugin-testing-library
pnpm add -D commitlint @commitlint/config-conventional
```

Verificar se configuração ESLint está adequada:

```typescript
// ✅ eslint.config.mjs já existe e está configurado
// ✅ @typescript-eslint/eslint-plugin já importado
// ✅ eslint-plugin-import já configurado
// ✅ Regras de React já configuradas

// Apenas verificar se regras rigorosas estão ativas:
// - @typescript-eslint/no-explicit-any
// - @typescript-eslint/prefer-nullish-coalescing
// - import/order com alphabetize
```

    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/self-closing-comp': 'error',
    'prefer-const': 'error',
    'object-shorthand': 'error',

},
};

````

### Step 2: Git Hooks & Scripts

Atualizar scripts existentes no `package.json`:

```json
// ✅ Scripts básicos já existem:
// "dev", "build", "start", "lint", "test" já configurados

// Adicionar apenas scripts que faltam:
{
  "scripts": {
    // ...existing scripts...
    "type-check": "tsc --noEmit",
    "test:coverage": "vitest --coverage",
    "quality-check": "pnpm type-check && pnpm lint && pnpm test:coverage && pnpm build",
    "setup": "pnpm install && pnpm quality-check"
  }
}
````

Atualizar Husky hooks:

```bash
# ✅ Husky já instalado e configurado
# ✅ .husky/pre-commit já existe
# ✅ lint-staged já configurado no package.json

# Apenas adicionar commit-msg hook se necessário:
npx husky add .husky/commit-msg "npx commitlint --edit $1"

# Atualizar pre-commit para incluir lint-staged:
echo "npx lint-staged" > .husky/pre-commit
```

Verificar configuração lint-staged:

```typescript
// ✅ lint-staged já configurado no package.json:
// "lint-staged": {
//   "**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
//   "**/*.{json,css,scss,md}": ["prettier --write"]
// }
```

### Step 3: Documentation Setup

Criar `docs/ARCHITECTURE.md`:

```markdown
# DataOcean Instance Manager - Architecture Guide

## Overview

Feature-based architecture with TypeScript, Zustand state management, and Next.js App Router.

## Project Structure
```

src/
├── features/ # Business domains
│ ├── applications/
│ ├── environments/
│ └── locations/
├── lib/ # Core infrastructure
│ ├── store/ # Global state (Zustand)
│ ├── i18n/ # Internationalization
│ └── utils/ # Utilities
├── components/ # Shared UI components
└── app/ # Next.js pages

```

## State Management
- **Global**: Zustand with persistence
- **Feature**: Feature-specific contexts
- **Server**: React Query/SWR
- **Forms**: React Hook Form

## Styling
- **Framework**: Tailwind CSS
- **Components**: shadcn/ui
- **Themes**: CSS variables
```

Criar `docs/DEVELOPMENT.md`:

````markdown
# Development Guidelines

## Setup

```bash
pnpm install
pnpm dev
```
````

## Code Standards

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Types**: PascalCase with descriptive names

## Testing

- **Unit**: Vitest for logic
- **Component**: React Testing Library
- **E2E**: Playwright

## Commits

Use conventional commits:

```bash
feat(auth): add login form
fix(ui): resolve button alignment
docs: update setup guide
```

````

### Step 4: Quality Validation

Executar validações usando VS Code tools:

```typescript
// 1. Verificar erros TypeScript
// get_errors() - Validar se há erros de tipo

// 2. Executar build
// run_vs_code_task() - Task "build" deve passar

// 3. Executar testes
// run_tests() - Todos os testes devem passar

// 4. Validar linting
// run_in_terminal("pnpm lint") - Linting deve passar sem erros
````

### Step 5: Performance Setup

Adicionar monitoramento básico em `src/lib/performance.ts`:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  const sendMetric = ({ name, value, rating }: any) => {
    console.log(`Performance [${rating}]: ${name} = ${value}ms`);
    // Integrate with analytics service here
  };

  getCLS(sendMetric);
  getFID(sendMetric);
  getFCP(sendMetric);
  getLCP(sendMetric);
  getTTFB(sendMetric);
}
```

Configurar no `src/app/layout.tsx`:

```typescript
// ...existing code...
import { initPerformanceMonitoring } from '@/lib/performance';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  // ...existing code...
}
```

````

## Validation

### Checklist
- [ ] **Code quality**: ESLint configurado com regras rigorosas
- [ ] **Git hooks**: Husky com pre-commit e commit-msg hooks
- [ ] **Scripts**: quality-check, setup e build funcionais
- [ ] **Documentation**: ARCHITECTURE.md e DEVELOPMENT.md criados
- [ ] **Performance**: Monitoramento básico implementado
- [ ] **TypeScript**: Sem erros de tipo
- [ ] **Tests**: Cobertura adequada
- [ ] **Build**: Build production funcional

### Testing Commands

```bash
# Verificar qualidade completa
pnpm run quality-check

# Verificar tipos
pnpm run type-check

# Executar testes
pnpm run test:coverage

# Verificar build
pnpm run build
```

### Validation with VS Code Tools

```typescript
// 1. Verificar erros TypeScript
// get_errors(["src/**/*.ts", "src/**/*.tsx"])

// 2. Executar task de build
// run_vs_code_task("build", workspaceFolder)

// 3. Executar testes
// run_tests()

// 4. Verificar linting no terminal
// run_in_terminal("pnpm lint", "Verificar linting", false)
```

### Final Project Status

Após implementação, o projeto deve ter:

- **✅ Architecture Standards**: Alinhado com architecture-standards.md
- **✅ Code Quality**: ESLint + Prettier + Husky configurados
- **✅ Documentation**: Guides completos para desenvolvimento
- **✅ Performance**: Monitoramento básico implementado
- **✅ Testing**: Padrões de teste estabelecidos
- **✅ Template Ready**: Pronto para uso como template

### Commit

```bash
git add .
git commit -m "feat: finalize project standards and documentation

- Configure ESLint with strict rules and import ordering
- Add Husky git hooks for quality enforcement
- Create comprehensive architecture and development documentation
- Implement basic performance monitoring
- Add quality-check script for CI/CD
- Align all standards with architecture-standards.md"
```

## Expected Outcomes

**Template Exemplar Alcançado**:
- Arquitetura escalável e documentada
- Qualidade de código automatizada
- Processo de desenvolvimento padronizado
- Performance monitorada
- Pronto para uso em novos projetos

**Próximo**: Template pronto para uso em produção e como base para novos projetos
````
