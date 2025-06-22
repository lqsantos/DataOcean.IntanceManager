# Phase 02: Testing Framework

## Objetivo

Mig**IMPORTANTE**: Migrar de Vitest para Jest:

```bash
# Instalar Jest e dependências
pnpm add -D jest @types/jest jest-environment-jsdom

# E2E testing (verificar se precisa)
pnpm add -D @playwright/test

# Component documentation (verificar se precisa)
pnpm add -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions

# Faker para mocks (verificar se precisa)
pnpm add -D @faker-js/faker

# Remover Vitest (após migração completa)
# pnpm remove vitest @vitest/ui @vitest/coverage-v8
```

### Step 4: Configurar Jest (Copilot Agent)

**IMPORTANTE**: Substituir vitest.config.ts por jest.config.js: Jest como framework principal de testes unitários, implementar E2E tests (Playwright), component documentation (Storybook) e API mocking (MSW).

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Verificar configuração atual de Vitest
- Analisar dependências de teste existentes
- Planejar migração de Vitest para Jest
- Identificar testes existentes que precisam ser migrados
- Avaliar configurações e gaps no framework

### 2. Gaps Típicos Esperados

- [ ] **Migração Vitest → Jest**: Substituir framework atual
- [ ] **Jest Configuration**: Setup completo do Jest
- [ ] **E2E Testing**: Playwright setup
- [ ] **Component Docs**: Storybook
- [ ] **API Mocking**: MSW integration com Jest

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
git add .
git commit -m "Backup before testing framework setup"
```

### Step 2: Análise da Infraestrutura Atual (Copilot Agent)

O Copilot Agent irá primeiro analisar usando `read_file` e `file_search`:

- 🔄 **Vitest configurado**: Precisa ser migrado para Jest
- ✅ **Testing Library**: @testing-library/\* já instaladas (compatível com Jest)
- ✅ **MSW**: msw (2.8.2) já instalado (compatível com Jest)
- 🔄 **Coverage**: @vitest/coverage-v8 → jest coverage
- ❓ **Verificar se faltam**: jest, @playwright/test, storybook, @faker-js/faker

### Step 3: Instalar Jest e Dependências (Copilot Agent)

**IMPORTANTE**: Usar `pnpm` e verificar apenas o que está faltando:

```bash
# E2E testing (verificar se precisa)
pnpm add -D @playwright/test

# Component documentation (verificar se precisa)
pnpm add -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions

# Faker para mocks (verificar se precisa)
pnpm add -D @faker-js/faker
```

### Step 4: Otimizar Configuração Vitest (Copilot Agent)

**IMPORTANTE**: Vitest já está configurado! Apenas verificar/otimizar se necessário.

O Agent deve `read_file` em `vitest.config.ts` e verificar se tem:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/tests/**/*', '!src/mocks/**/*'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': '@swc/jest',
  },
};
```

```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));
```

### Step 5: Configurar MSW (Copilot Agent)

```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  rest.get('/api/applications', (req, res, ctx) => {
    return res(
      ctx.json({
        data: Array.from({ length: 10 }, () => ({
          id: faker.string.uuid(),
          name: faker.company.name(),
          status: faker.helpers.arrayElement(['active', 'inactive']),
          createdAt: faker.date.past(),
        })),
        success: true,
      })
    );
  }),
];
```

```typescript
// src/tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Step 6: Configurar Playwright (Copilot Agent)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('should display applications page', async ({ page }) => {
  await page.goto('/applications');
  await expect(page.locator('h1')).toContainText('Applications');
});
```

### Step 7: Configurar Storybook (Copilot Agent)

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

```typescript
// .storybook/preview.ts
import '../src/globals.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
```

### Step 8: Criar Test Utils (Copilot Agent)

```typescript
// src/tests/utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Step 9: Testes de Exemplo com Jest (Copilot Agent)

**IMPORTANTE**: Criar apenas **poucos exemplos** como prova de conceito, agora usando Jest:

```typescript
// src/components/button.test.tsx
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@/tests/utils/test-utils';
import { Button } from './button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

```typescript
// src/components/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Button' },
};
```

### Step 10: Atualizar Scripts para Jest (Copilot Agent)

O Copilot Agent deve atualizar os scripts em package.json para usar Jest em vez de Vitest:

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Step 11: Migração e Limpeza (Copilot Agent)

**DEPOIS** que Jest estiver funcionando:

1. **Migrar testes existentes**: Trocar `vi` por `jest`, `import` por `require` se necessário
2. **Remover vitest.config.ts**: Deletar arquivo obsoleto
3. **Remover dependências Vitest**: Atualizar package.json

### Step 12: Validação e Commit (Usuário)

**APÓS a migração completa**: O usuário deve validar e commitar:

```bash
# Validar migração para Jest
pnpm test          # Verificar se Jest funciona
pnpm test:coverage # Verificar se coverage funciona
pnpm test:e2e      # Verificar se playwright funciona (se instalado)
pnpm run storybook # Verificar se storybook funciona (se instalado)

# Commitar
git add .
git commit -m "feat: migrate from Vitest to Jest testing framework"
```

## Checklist de Finalização

### ✅ Antes de Iniciar (Usuário)

- [ ] Backup realizado

### ✅ Framework Setup (Copilot Agent)

- [ ] Jest instalado e configurado (jest.config.js)
- [ ] Vitest removido (config e dependências)
- [ ] Playwright configurado multi-browser (se escolhido)
- [ ] Storybook configurado com addons (se escolhido)
- [ ] MSW integrado com Jest

### ✅ Infraestrutura Básica (Copilot Agent)

- [ ] Test utils criados (`src/tests/utils/`)
- [ ] MSW handlers básicos (`src/tests/mocks/`)
- [ ] Exemplo de unit test **simples** (1-2 testes)
- [ ] Exemplo de E2E test **simples** (1 teste)
- [ ] Exemplo de story **simples** (1-2 stories)

### ✅ Scripts & Configuração (Copilot Agent)

- [ ] Scripts de teste adicionados ao package.json
- [ ] Configurações criadas (vitest.config.ts, playwright.config.ts, etc.)
- [ ] Setup files criados

### ✅ Validação Final (Usuário)

- [ ] `pnpm test` - Jest funciona
- [ ] `pnpm test:coverage` - Coverage funciona
- [ ] `pnpm test:e2e` - E2E funciona (se configurado)
- [ ] `pnpm run storybook` - Storybook abre (se configurado)
- [ ] Vitest completamente removido
- [ ] Alterações commitadas

### ✅ Impacto Esperado

- [ ] **Jest** como framework principal de testes unitários
- [ ] **Vitest** completamente removido do projeto
- [ ] **MSW** integrado para API mocking
- [ ] **Playwright** para E2E (se configurado)
- [ ] **Storybook** para component docs (se configurado)
- [ ] **Coverage** funcionando com Jest

## Próximo Passo

→ **Phase 03: API Architecture**
