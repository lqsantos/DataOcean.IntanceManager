# Phase 02: Testing Fr### 1. O Copilot Agent irá automaticamente:

- Verificar configuração atual de Vitest (será migrado para Jest)
- Analisar dependências de teste existentes
- Planejar migração completa Vitest → Jest seguindo architecture-standards.md
- Avaliar se E2E (Playwright) e Storybook são necessários
- Configurar MSW integration com Jest

### 2. Gaps Típicos Esperados

- [ ] **Migração Vitest → Jest**: Substituir framework atual pelo padrão
- [ ] **Jest + @next/jest Configuration**: Setup conforme architecture-standards.md
- [ ] **E2E Testing**: Playwright setup (se necessário)
- [ ] **Component Docs**: Storybook (se necessário)
- [ ] **API Mocking**: Integrar MSW com Jest
- [ ] **Test Utils**: Criar helpers centralizados para Jestetivo

Migrar de Vitest para Jest e estabelecer framework de testes robusto seguindo architecture-standards.md, implementar E2E tests (Playwright), component documentation (Storybook) e API mocking (MSW).

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](./project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Categorização Global vs. Feature**

- **GLOBAL** (`src/tests/`, configs raiz): Setup, utils, mocks globais, configurações Jest
- **FEATURE-BOUND** (`src/components/*.test.tsx`, `*.stories.tsx`): Testes específicos por componente/feature

### **Tecnologias & Padrões (conforme architecture-standards.md)**

- **Jest + @next/jest**: Framework principal de testes (substituir Vitest)
- **@testing-library/react**: Component testing
- **Playwright**: E2E testing opcional
- **Storybook**: Component documentation opcional
- **MSW**: API mocking (otimizar integração com Jest)
- **Package Manager**: pnpm (padrão do projeto)

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Verificar configuração atual de Vitest (manter)
- Analisar dependências de teste existentes
- Avaliar se E2E (Playwright) e Storybook são necessários
- Otimizar configuração MSW existente
- Identificar gaps na estrutura de testes

### 2. Gaps Típicos Esperados

- [ ] **Vitest otimização**: Melhorar configuração existente
- [ ] **E2E Testing**: Playwright setup (se necessário)
- [ ] **Component Docs**: Storybook (se necessário)
- [ ] **API Mocking**: Otimizar MSW integration existente
- [ ] **Test Utils**: Criar helpers centralizados

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
git add .
git commit -m "Backup before testing framework setup"
```

### Step 2: Análise da Infraestrutura Atual (Copilot Agent)

O Copilot Agent irá primeiro analisar usando `read_file` e `file_search`:

- 🔄 **Vitest configurado**: Será migrado para Jest (padrão architecture-standards.md)
- ✅ **Testing Library**: @testing-library/\* já instaladas (compatível com Jest)
- ✅ **MSW**: msw já instalado (será integrado com Jest)
- 🔄 **Vitest coverage**: Será substituído por Jest coverage
- ❓ **Verificar se faltam**: @next/jest, jest, @types/jest, jest-environment-jsdom

### Step 3: Instalar Jest e Remover Vitest (Copilot Agent)

**COMANDO**: Use pnpm para instalar Jest e remover Vitest:

```bash
# Instalar Jest + Next.js integration conforme architecture-standards.md
pnpm add -D @next/jest jest @types/jest jest-environment-jsdom

# E2E testing (apenas se requisitado)
pnpm add -D @playwright/test

# Component documentation (apenas se requisitado)
pnpm add -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions

# Faker para mocks (apenas se necessário)
pnpm add -D @faker-js/faker

# Remover Vitest completamente após migração
pnpm remove vitest @vitest/ui @vitest/coverage-v8
```

### Step 4: Configurar Jest + @next/jest (Copilot Agent)

**CATEGORIA**: Global - Configuração conforme architecture-standards.md

**COMANDO**: Agent deve criar `jest.config.js` seguindo padrão do architecture-standards.md:

```javascript
// jest.config.js (GLOBAL)
const nextJest = require('@next/jest');

const createJestConfig = nextJest({
  // Caminho para sua aplicação Next.js
  dir: './',
});

// Configuração customizada do Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts', '!src/mocks/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js (GLOBAL)
import '@testing-library/jest-dom';
import { server } from './src/tests/mocks/server';

// Setup MSW conforme architecture-standards.md
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock next/navigation conforme architecture-standards.md
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
```

**Remover vitest.config.ts após validação**

### Step 5: Configurar MSW com Jest (Copilot Agent)

**CATEGORIA**: Global - Mocking de APIs para toda aplicação

```typescript
// src/tests/mocks/handlers.ts (GLOBAL)
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  http.get('/api/applications', (req, res, ctx) => {
    return HttpResponse.json({
      data: Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        name: faker.company.name(),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        createdAt: faker.date.past(),
      })),
      success: true,
    });
  }),
];
```

```typescript
// src/tests/mocks/server.ts (GLOBAL)
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Step 6: Configurar Playwright (Copilot Agent)

**CATEGORIA**: Global - E2E testing para toda aplicação (opcional)

```typescript
// playwright.config.ts (GLOBAL)
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
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// e2e/example.spec.ts (FEATURE-BOUND)
import { test, expect } from '@playwright/test';

test('should display applications page', async ({ page }) => {
  await page.goto('/applications');
  await expect(page.locator('h1')).toContainText('Applications');
});
```

### Step 6: Configurar Playwright (Copilot Agent)

**CATEGORIA**: Global - E2E testing para toda aplicação (opcional)

```typescript
// playwright.config.ts (GLOBAL)
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
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// e2e/example.spec.ts (FEATURE-BOUND)
import { test, expect } from '@playwright/test';

test('should display applications page', async ({ page }) => {
  await page.goto('/applications');
  await expect(page.locator('h1')).toContainText('Applications');
});
```

### Step 7: Configurar Storybook (Copilot Agent)

**CATEGORIA**: Global - Configuração + Feature-bound stories

```typescript
// .storybook/main.ts (GLOBAL)
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
// .storybook/preview.ts (GLOBAL)
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

**CATEGORIA**: Global - Utilitários compartilhados para testes

```typescript
// src/tests/utils/test-utils.tsx (GLOBAL)
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

**CATEGORIA**: Feature-bound - Exemplos mínimos conforme architecture-standards.md

**COMANDO**: Criar apenas **poucos exemplos** para validar setup Jest:

```typescript
// src/components/button.test.tsx (FEATURE-BOUND)
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
// src/components/button.stories.tsx (FEATURE-BOUND)
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

    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);

});
});

````

```typescript
// src/components/button.stories.tsx (FEATURE-BOUND)
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
````

### Step 10: Atualizar Scripts Package.json (Copilot Agent)

**COMANDO**: Agent deve usar `read_file` e `replace_string_in_file` para migrar scripts para Jest:

```json
// package.json - Scripts Jest conforme architecture-standards.md
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"

}
}

````

### Step 11: Migração de Testes Existentes e Validação (Copilot Agent)

**COMANDO**: Use ferramentas do VS Code para migração e validação:

1. **Migrar testes existentes**: Substituir `vi` por `jest`, `import { vi }` por `import { jest }`
2. **Verificar Erros**: Use `get_errors` para identificar problemas de build
3. **Executar Testes**: Use `run_tests` ou `run_in_terminal` para test validation
4. **Verificar Coverage**: Use `run_in_terminal("pnpm test:coverage")`
5. **Remover vitest.config.ts**: Deletar após validação completa

```typescript
// Copilot Agent deve usar:
// 1. Migrar todos os testes de Vitest para Jest
// 2. get_errors(filePaths) - Verificar problemas de compilação
// 3. run_tests() - Executar testes com Jest
// 4. run_in_terminal("pnpm test:coverage") - Verificar coverage
// 5. Verificar no Problems panel do VS Code se há erros
````

**APÓS validação automática**, fazer commit:

```bash
git add .
git commit -m "feat: migrate from Vitest to Jest following architecture-standards.md"
```

## Checklist de Finalização

### ✅ Antes de Iniciar (Usuário)

- [ ] Backup realizado

### ✅ Framework Setup (Copilot Agent)

- [ ] Jest + @next/jest instalado e configurado (conforme architecture-standards.md)
- [ ] Vitest completamente removido (dependências e configs)
- [ ] Playwright configurado multi-browser (se escolhido)
- [ ] Storybook configurado com addons (se escolhido)
- [ ] MSW integrado com Jest

### ✅ Infraestrutura Básica (Copilot Agent)

- [ ] Test utils criados (`src/tests/utils/`) (GLOBAL)
- [ ] MSW handlers básicos (`src/tests/mocks/`) (GLOBAL)
- [ ] Exemplo de unit test **simples** com Jest (1-2 testes) (FEATURE-BOUND)
- [ ] Exemplo de E2E test **simples** (1 teste) (FEATURE-BOUND)
- [ ] Exemplo de story **simples** (1-2 stories) (FEATURE-BOUND)

### ✅ Scripts & Configuração (Copilot Agent)

- [ ] Scripts de teste otimizados no package.json
- [ ] Configurações criadas (vitest.config.ts, playwright.config.ts, etc.)
- [ ] Setup files criados

### ✅ Validação Final (Copilot Agent)

- [ ] `get_errors` - Sem erros de compilação/lint
- [ ] `run_tests()` - Vitest funciona
- [ ] `run_in_terminal("pnpm test:coverage")` - Coverage funciona
- [ ] `run_in_terminal("pnpm test:e2e")` - E2E funciona (se configurado)
- [ ] `run_in_terminal("pnpm run storybook")` - Storybook abre (se configurado)
- [ ] Problems panel vazio no VS Code
- [ ] Alterações commitadas

### ✅ Scripts & Configuração (Copilot Agent)

- [ ] Scripts de teste migrados para Jest no package.json
- [ ] jest.config.js criado conforme architecture-standards.md
- [ ] jest.setup.js criado com MSW integration
- [ ] vitest.config.ts removido

### ✅ Validação Final (Copilot Agent)

- [ ] `get_errors` - Sem erros de compilação/lint
- [ ] `run_tests()` - Jest funciona
- [ ] `run_in_terminal("pnpm test:coverage")` - Coverage funciona
- [ ] `run_in_terminal("pnpm test:e2e")` - E2E funciona (se configurado)
- [ ] `run_in_terminal("pnpm run storybook")` - Storybook abre (se configurado)
- [ ] Problems panel vazio no VS Code
- [ ] Alterações commitadas

### ✅ Impacto Esperado

- [ ] **Jest + @next/jest** como framework principal conforme architecture-standards.md
- [ ] **Vitest** completamente removido do projeto
- [ ] **MSW** integrado para API mocking robusto
- [ ] **Playwright** para E2E (se configurado e necessário)
- [ ] **Storybook** para component docs (se configurado e necessário)
- [ ] **Coverage** funcionando com Jest
- [ ] **Test Utils** centralizados para reuso

## Próximo Passo

→ **Phase 03: API Architecture**
