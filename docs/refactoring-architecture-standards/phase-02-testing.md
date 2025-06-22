# Phase 02: Testing Framework

## Objetivo

Implementar framework de testes robusto com unit tests (Vitest), E2E tests (Playwright), component documentation (Storybook) e API mocking (MSW).

## Análise da Situação Atual

### 1. Verificar Setup de Testes Atual

```bash
# Verificar dependências de teste
npm list vitest jest @testing-library/react playwright

# Verificar configurações existentes
ls -la vitest.config.* jest.config.* playwright.config.* 2>/dev/null

# Verificar testes existentes
find src/ -name "*.test.*" -o -name "*.spec.*" | head -10
```

### 2. Identificar Gaps

- [ ] **Framework moderno**: Vitest vs Jest
- [ ] **E2E Testing**: Playwright setup
- [ ] **Component Docs**: Storybook
- [ ] **API Mocking**: MSW integration
- [ ] **Coverage**: Thresholds e reporting

## Implementação

### Step 1: Instalar Dependências

```bash
# Core testing
npm install -D vitest @vitest/ui @vitest/coverage-c8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E testing
npm install -D @playwright/test

# Component documentation
npm install -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions

# API mocking
npm install -D msw @faker-js/faker
```

### Step 2: Configurar Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
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

### Step 3: Configurar MSW

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

### Step 4: Configurar Playwright

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

### Step 5: Configurar Storybook

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

### Step 6: Criar Test Utils

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

### Step 7: Exemplo de Testes

```typescript
// src/components/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import { Button } from './button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
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

### Step 8: Atualizar Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Checklist de Finalização

### Framework Setup

- [ ] Vitest configurado com coverage
- [ ] Playwright configurado multi-browser
- [ ] Storybook configurado com addons
- [ ] MSW configurado para mocking

### Test Implementation

- [ ] Test utils criados
- [ ] Exemplo de unit test funciona
- [ ] Exemplo de E2E test funciona
- [ ] Exemplo de story funciona

### Scripts & CI

- [ ] Scripts de teste funcionam
- [ ] Coverage threshold atingido (80%)
- [ ] E2E tests passam
- [ ] Storybook builda corretamente

### Funcionalidade

- [ ] `npm run test` - Unit tests passam
- [ ] `npm run test:e2e` - E2E tests passam
- [ ] `npm run storybook` - Storybook abre
- [ ] `npm run test:coverage` - Coverage OK

## Próximo Passo

→ **Phase 03: API Architecture**
