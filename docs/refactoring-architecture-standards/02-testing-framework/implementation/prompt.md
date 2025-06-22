# Prompt: Implementação Testing Framework

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 02 - Testing Framework (Implementation)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Análise completa em `../analysis/results.md`

## Objetivo da Implementação

Estabelecer um framework de testes robusto e abrangente, incluindo testes unitários, de integração, e2e, visual regression, e documentação viva através de Storybook.

## Pré-requisitos

- [ ] Phase 01 (Foundation Architecture) concluída e validada
- [ ] Análise do framework de testes atual completa
- [ ] Stack de testes definida na análise
- [ ] Backup/commit do estado atual

## Stack de Testes Target

### Core Testing Stack

- **Unit Tests**: Vitest (fast, modern alternative to Jest)
- **React Testing**: @testing-library/react
- **E2E Tests**: Playwright (cross-browser, reliable)
- **Visual Tests**: Chromatic + Storybook
- **Coverage**: c8 (native V8 coverage)
- **Mocking**: MSW (Mock Service Worker)

### Supporting Tools

- **Storybook**: Component documentation and testing
- **Faker.js**: Test data generation
- **Testing utilities**: Custom test helpers
- **CI/CD Integration**: GitHub Actions

## Implementação Passo-a-Passo

### Step 1: Install Testing Dependencies

```bash
# Core testing framework
npm install -D vitest @vitest/ui @vitest/coverage-c8

# React testing utilities
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E testing
npm install -D @playwright/test

# Visual regression testing
npm install -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/testing-library

# Mocking and test data
npm install -D msw @faker-js/faker

# Type definitions
npm install -D @types/testing-library__jest-dom
```

### Step 2: Configure Vitest (Unit Tests)

#### vitest.config.ts

```typescript
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
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        '.storybook/',
        'stories/',
      ],
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
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### src/tests/setup.ts

```typescript
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    pop: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
}));
```

### Step 3: Configure MSW (API Mocking)

#### src/tests/mocks/handlers.ts

```typescript
import { rest } from 'msw';
import { faker } from '@faker-js/faker';
import type { Application, Environment, Location } from '@/types';

// Application handlers
export const applicationHandlers = [
  rest.get('/api/applications', (req, res, ctx) => {
    const applications: Application[] = Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
      environmentId: faker.string.uuid(),
      locationId: faker.string.uuid(),
      configuration: {},
      metadata: {
        version: faker.system.semver(),
        tags: faker.helpers.arrayElements(['web', 'api', 'service'], 2),
        owner: faker.person.fullName(),
        lastDeployment: faker.date.recent(),
      },
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }));

    return res(ctx.json({ data: applications, success: true }));
  }),

  rest.get('/api/applications/:id', (req, res, ctx) => {
    const { id } = req.params;

    const application: Application = {
      id: id as string,
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      status: 'active',
      environmentId: faker.string.uuid(),
      locationId: faker.string.uuid(),
      configuration: {},
      metadata: {
        version: faker.system.semver(),
        tags: ['web', 'production'],
        owner: faker.person.fullName(),
        lastDeployment: faker.date.recent(),
      },
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };

    return res(ctx.json({ data: application, success: true }));
  }),

  rest.post('/api/applications', (req, res, ctx) => {
    const newApplication: Application = {
      id: faker.string.uuid(),
      ...(req.body as Omit<Application, 'id' | 'createdAt' | 'updatedAt'>),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return res(ctx.status(201), ctx.json({ data: newApplication, success: true }));
  }),
];

export const handlers = [
  ...applicationHandlers,
  // Add environment and location handlers as needed
];
```

#### src/tests/mocks/server.ts

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Step 4: Configure Playwright (E2E Tests)

#### playwright.config.ts

```typescript
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
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### e2e/example.spec.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('Application Management', () => {
  test('should display applications list', async ({ page }) => {
    await page.goto('/applications');

    // Wait for applications to load
    await expect(page.locator('[data-testid=applications-list]')).toBeVisible();

    // Check if applications are displayed
    const applicationItems = page.locator('[data-testid=application-item]');
    await expect(applicationItems).toHaveCountGreaterThan(0);
  });

  test('should create new application', async ({ page }) => {
    await page.goto('/applications');

    // Click create button
    await page.click('[data-testid=create-application-btn]');

    // Fill form
    await page.fill('[data-testid=application-name-input]', 'Test Application');
    await page.fill('[data-testid=application-description-input]', 'Test description');

    // Submit form
    await page.click('[data-testid=submit-btn]');

    // Verify redirect and success message
    await expect(page).toHaveURL('/applications');
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });
});
```

### Step 5: Configure Storybook

#### .storybook/main.ts

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
```

#### .storybook/preview.ts

```typescript
import type { Preview } from '@storybook/react';
import '../src/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

### Step 6: Create Test Utilities

#### src/tests/utils/test-utils.tsx

```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

#### src/tests/utils/test-data.ts

```typescript
import { faker } from '@faker-js/faker';
import type { Application, Environment, Location } from '@/types';

export const createMockApplication = (overrides?: Partial<Application>): Application => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
  environmentId: faker.string.uuid(),
  locationId: faker.string.uuid(),
  configuration: {},
  metadata: {
    version: faker.system.semver(),
    tags: faker.helpers.arrayElements(['web', 'api', 'service'], 2),
    owner: faker.person.fullName(),
    lastDeployment: faker.date.recent(),
  },
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockEnvironment = (overrides?: Partial<Environment>): Environment => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['development', 'staging', 'production']),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockLocation = (overrides?: Partial<Location>): Location => ({
  id: faker.string.uuid(),
  name: faker.location.city(),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});
```

### Step 7: Create Sample Tests

#### src/components/applications/application-card.test.tsx

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import { ApplicationCard } from './application-card';
import { createMockApplication } from '@/tests/utils/test-data';

describe('ApplicationCard', () => {
  it('renders application information correctly', () => {
    const mockApplication = createMockApplication({
      name: 'Test Application',
      description: 'Test description',
      status: 'active',
    });

    render(<ApplicationCard application={mockApplication} />);

    expect(screen.getByText('Test Application')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockApplication = createMockApplication();
    const onEdit = vi.fn();

    render(<ApplicationCard application={mockApplication} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.click();

    expect(onEdit).toHaveBeenCalledWith(mockApplication);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockApplication = createMockApplication();
    const onDelete = vi.fn();

    render(<ApplicationCard application={mockApplication} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    deleteButton.click();

    expect(onDelete).toHaveBeenCalledWith(mockApplication.id);
  });
});
```

#### src/components/applications/application-card.stories.tsx

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ApplicationCard } from './application-card';
import { createMockApplication } from '@/tests/utils/test-data';

const meta: Meta<typeof ApplicationCard> = {
  title: 'Components/ApplicationCard',
  component: ApplicationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    application: createMockApplication({
      name: 'Sample Application',
      description: 'This is a sample application for demonstration purposes.',
      status: 'active',
    }),
  },
};

export const Inactive: Story = {
  args: {
    application: createMockApplication({
      name: 'Inactive Application',
      description: 'This application is currently inactive.',
      status: 'inactive',
    }),
  },
};

export const Pending: Story = {
  args: {
    application: createMockApplication({
      name: 'Pending Application',
      description: 'This application is pending deployment.',
      status: 'pending',
    }),
  },
};
```

### Step 8: Update Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test:storybook": "test-storybook"
  }
}
```

### Step 9: CI/CD Integration

#### .github/workflows/test.yml

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run build-storybook

      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

## Validação Contínua

### Após Cada Step:

```bash
# Run unit tests
npm run test:run

# Check coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Start Storybook
npm run storybook

# Type checking
npm run type-check

# Build verification
npm run build
```

## Checklist de Implementação

### ✅ Step 1: Dependencies

- [ ] Vitest e testing utilities instalados
- [ ] Playwright configurado
- [ ] Storybook setup completo
- [ ] MSW para API mocking

### ✅ Step 2: Configuration

- [ ] Vitest config com coverage thresholds
- [ ] Test setup com mocks
- [ ] Playwright config multi-browser
- [ ] Storybook config com addons

### ✅ Step 3: Mocking System

- [ ] MSW handlers para APIs
- [ ] Mock data generators
- [ ] Test utilities criados
- [ ] Provider wrappers

### ✅ Step 4: Sample Tests

- [ ] Component unit tests
- [ ] Storybook stories
- [ ] E2E test scenarios
- [ ] Integration tests

### ✅ Step 5: CI/CD Pipeline

- [ ] GitHub Actions workflow
- [ ] Coverage reporting
- [ ] Visual regression testing
- [ ] Multi-environment testing

## Documentação dos Resultados

```markdown
# Testing Framework Implementation Summary

## ✅ Stack Implemented

### Unit Testing

- Vitest with React Testing Library
- 80% coverage threshold enforced
- MSW for API mocking
- Custom test utilities

### E2E Testing

- Playwright with multi-browser support
- Page Object Model patterns
- Visual regression capabilities
- Mobile testing included

### Component Testing

- Storybook for documentation
- Interactive testing
- Visual testing with Chromatic
- Accessibility testing

### CI/CD Integration

- Automated test execution
- Coverage reporting
- Visual regression detection
- Multi-environment validation

## Impact

### Quality Assurance

- Comprehensive test coverage
- Automated regression detection
- Cross-browser compatibility
- Performance monitoring

### Developer Experience

- Fast test execution with Vitest
- Interactive debugging
- Visual component development
- Automated feedback loops

## Next Steps

✅ Phase 02 (Testing Framework) completed
→ Ready for Phase 03 (API Architecture)
```

## Próximos Passos

Após completar a implementação com sucesso:

1. Executar `validation/prompt.md` para validar o framework de testes
2. Criar testes para os componentes existentes
3. Proceder para Phase 03 - API Architecture
