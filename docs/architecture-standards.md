## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Estrutura Global](#-estrutura-global)
- [Padrões de Componentes](#-padrões-de-componentes)
- [Design System - shadcn/ui](#-design-system---shadcnui)
- [Sistema de Types](#-sistema-de-types)
- [Sistema de Tradução](#-sistema-de-tradução)
- [Constants e Utils](#-constants-e-utils)
- [Hooks](#-hooks)
- [Services Architecture](#-services-architecture)
- [State Management](#-state-management)
- [Error Handling](#-error-handling)
- [MSW (Mock Service Worker)](#-msw-mock-service-worker)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Convenções Gerais](#-convenções-gerais)
- [Conclusão](#-conclusão)

---

## 🎯 Visão Geral

Este documento define os **padrões arquiteturais** para o DataOcean Instance Manager, estabelecendo diretrizes para estrutura, organização e convenções de desenvolvimento.

### Objetivos

- **Consistência**: Padrão único em todo o projeto
- **Escalabilidade**: Estrutura que cresce sem complexidade
- **Maintabilidade**: Código fácil de entender e modificar
- **Developer Experience**: Navegação intuitiva e produtiva

---

## 📁 Estrutura Global

### Organização de Diretórios

```
src/
├── app/                         # Next.js App Directory
├── components/                  # Componentes React
│   ├── ui/                     # shadcn/ui base components
│   ├── features/               # Feature-specific components
│   └── layout/                 # Layout components
├── lib/                        # Bibliotecas e configurações
├── services/                   # Business logic e API calls
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript definitions
├── constants/                  # Application constants
├── utils/                      # Utility functions
├── styles/                     # CSS e tema
├── locales/                    # Internacionalização
├── store/                      # State management
├── mocks/                      # MSW handlers e mock data
│   ├── handlers/               # API handlers
│   ├── data/                   # Mock data
│   ├── browser.ts              # Browser setup
│   └── server.ts               # Node.js setup
└── __tests__/                  # Testes
```

### Princípios de Organização

1. **Separação por responsabilidade**: Cada diretório tem propósito específico
2. **Hierarquia clara**: Estrutura intuitiva para navegação
3. **Escalabilidade**: Fácil adição de novas funcionalidades
4. **Colocation**: Recursos relacionados próximos quando faz sentido

---

## 🧩 Padrões de Componentes

### Estrutura de Componentes

```
components/
├── ui/                         # Base components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── index.ts               # Barrel exports
├── features/                   # Feature components
│   ├── instances/
│   ├── blueprints/
│   └── applications/
└── layout/                     # Layout components
    ├── header.tsx
    ├── sidebar.tsx
    └── footer.tsx
```

### Convenções

- **PascalCase** para nomes de componentes
- **Arquivo por componente** com nome do arquivo em kebab-case
- **Props interface** sempre definida e exportada
- **Default export** para o componente principal
- **Named exports** para types e utilities relacionadas

#### Exemplo de Estrutura de Componente

```typescript
// components/features/instances/instance-card.tsx
interface InstanceCardProps {
  instance: Instance;
  onEdit?: (id: string) => void;
  className?: string;
}

export const InstanceCard = ({ instance, onEdit, className }: InstanceCardProps) => {
  // Component implementation
};

export type { InstanceCardProps };
```

---

## 🎨 Design System - shadcn/ui

### Estratégia de Uso

1. **Base Components**: Usar shadcn/ui como foundation
2. **Composed Components**: Combinar base components para casos específicos
3. **Extensions**: Estender funcionalidades mantendo API consistency

### Organização

```
components/ui/
├── base/                       # shadcn/ui originais (não modificar)
├── composed/                   # Combinações de base components
├── extensions/                 # Extensões customizadas
└── index.ts                   # Exports organizados
```

### Princípios

- **Não modificar** componentes base do shadcn/ui
- **Criar extensões** ao invés de alterações
- **Manter consistência** de API entre componentes similares
- **Documentar customizações** e reasoning

#### Exemplo de Extensão

```typescript
// components/ui/composed/data-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/base';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  // Extended props specific to our use case
}

export const DataTable = <T>({ data, columns, ...props }: DataTableProps<T>) => {
  // Composed component using base UI components
};
```

---

## 📊 Sistema de Types

### Estrutura

```
types/
├── entities/                   # Business entities
├── api/                       # API-related types
├── ui/                        # UI component types
├── forms/                     # Form-specific types
└── global.d.ts               # Global type declarations
```

### Convenções

- **PascalCase** para interfaces e types
- **Prefixos descritivos**: `ApiResponse`, `FormData`, `EntityState`
- **Granularidade apropriada**: Nem muito específico, nem muito genérico
- **Reutilização**: Types compartilhados em arquivos centrais

#### Exemplos de Types

```typescript
// types/entities/instance.ts
export interface Instance {
  id: string;
  name: string;
  status: InstanceStatus;
  createdAt: Date;
}

// types/api/responses.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// types/ui/components.ts
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
```

---

## 🌍 Sistema de Tradução

### Estrutura

```
locales/
├── pt/
│   ├── common.json            # Textos comuns
│   ├── pages.json             # Textos específicos de páginas
│   └── components.json        # Textos de componentes
└── en/
    ├── common.json
    ├── pages.json
    └── components.json
```

### Convenções

- **Chaves hierarchical**: `pages.instances.title`
- **Namespacing**: Agrupar por contexto/feature
- **Consistência**: Mesma estrutura para todos os idiomas
- **Pluralização**: Suporte adequado para diferentes formas

#### Exemplo de Estrutura i18n

```typescript
// locales/pt/pages.json
{
  "instances": {
    "title": "Instâncias",
    "create": "Criar Nova Instância",
    "empty": "Nenhuma instância encontrada"
  }
}

// Uso no componente
const { t } = useTranslation('pages')
const title = t('instances.title') // "Instâncias"
```

---

## 🔧 Constants e Utils

### Constants

```
constants/
├── api.ts
├── ui.ts                      # UI constants (sizes, variants)
├── validation.ts              # Validation rules
└── business.ts               # Business rules
```

### Utils

```
utils/
├── format.ts                  # Formatação de dados
├── validation.ts              # Validação
├── date.ts                    # Manipulação de datas
└── api.ts                     # API utilities
```

### Convenções

- **SCREAMING_SNAKE_CASE** para constants
- **camelCase** para utility functions
- **Pure functions** sempre que possível
- **Single responsibility** por função

#### Exemplos

```typescript
// constants/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const DEFAULT_PAGE_SIZE = 20;
export const STATUS_COLORS = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  ERROR: 'red',
} as const;

// utils/format.ts
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
```

---

## 🎣 Hooks

### Categorização

```
hooks/
├── api/                       # Data fetching hooks
├── ui/                        # UI state hooks
├── forms/                     # Form management hooks
└── utils/                     # General utility hooks
```

### Convenções

- **Prefixo `use`** obrigatório
- **Single responsibility** por hook
- **Proper dependencies** em arrays de dependência
- **Error handling** apropriado

#### Exemplo de Hook

```typescript
// hooks/api/use-instances.ts
export const useInstances = (filters?: InstanceFilters) => {
  return useQuery({
    queryKey: ['instances', filters],
    queryFn: () => instancesService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// hooks/ui/use-toggle.ts
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
};
```

---

## 🔌 Services Architecture

### Estrutura

```
services/
├── api/                       # API communication
├── auth/                      # Authentication
├── storage/                   # Data persistence
└── notifications/             # User notifications
```

### Responsabilidades

- **API Services**: HTTP requests, data transformation
- **Auth Service**: Login, logout, token management
- **Storage Service**: Local/session storage management
- **Notification Service**: Toast, alerts, modal management

### Princípios

- **Single responsibility** por service
- **Error handling** consistente
- **Testability** por design
- **Dependency injection** quando necessário

#### Exemplo de Service

```typescript
// services/api/instances.service.ts
class InstancesService {
  async getAll(filters?: InstanceFilters): Promise<Instance[]> {
    try {
      const response = await apiClient.get('/instances', { params: filters });
      return response.data;
    } catch (error) {
      throw new ApiError('Failed to fetch instances', error);
    }
  }

  async create(data: CreateInstanceRequest): Promise<Instance> {
    // Implementation
  }
}

export const instancesService = new InstancesService();
```

---

## 🏪 State Management

### Estratégia

1. **Local State**: useState para componentes simples
2. **Shared State**: Context API para estado compartilhado
3. **Server State**: React Query para dados do servidor
4. **Global State**: Zustand para estado complexo (se necessário)

### Hierarquia

- **Component Level**: Estado local do componente
- **Feature Level**: Context para features específicas
- **App Level**: Estado global da aplicação

#### Exemplo de Context

```typescript
// contexts/instances-context.tsx
interface InstancesContextValue {
  selectedInstance: Instance | null;
  setSelectedInstance: (instance: Instance | null) => void;
  filters: InstanceFilters;
  setFilters: (filters: InstanceFilters) => void;
}

export const InstancesContext = createContext<InstancesContextValue | null>(null);

export const useInstancesContext = () => {
  const context = useContext(InstancesContext);
  if (!context) {
    throw new Error('useInstancesContext must be used within InstancesProvider');
  }
  return context;
};
```

---

## ⚠️ Error Handling

### Estratégia

1. **Error Boundaries**: Captura de erros em componentes
2. **API Error Handling**: Tratamento centralizado de erros de API
3. **Form Validation**: Validação e exibição de erros
4. **User Feedback**: Comunicação clara de problemas

### Princípios

- **Fail gracefully**: Aplicação continua funcionando
- **User-friendly messages**: Mensagens claras para usuários
- **Developer-friendly logs**: Informações detalhadas para debug
- **Recovery mechanisms**: Permitir que usuário tente novamente

#### Exemplo de Error Boundary

```typescript
// components/error-boundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}
```

---

## 🧪 Testing

### Estratégia

```
__tests__/
├── components/                # Component tests
├── hooks/                     # Hook tests
├── services/                  # Service tests
├── utils/                     # Utility tests
└── integration/               # Integration tests
```

### Tipos de Teste

- **Unit Tests**: Funções, hooks, componentes isolados
- **Integration Tests**: Fluxos completos
- **E2E Tests**: Cenários de usuário completos

### Ferramentas

- **Jest + @next/jest**: Test runner (configuração Next.js oficial)
- **Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking (ver [seção MSW](#-msw-mock-service-worker) para detalhes)

### Configuração Jest + Next.js

### Configuração Jest + Next.js

#### Setup Básico

```javascript
// jest.config.js
const nextJest = require('next/jest');

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
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

// Extend Jest matchers
expect.extend({
  toBeInTheDocument: require('@testing-library/jest-dom/matchers').toBeInTheDocument,
});

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock next/navigation
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

#### Exemplo de Teste

```typescript
// __tests__/components/instance-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { InstanceCard } from '@/components/features/instances/instance-card'
import type { Instance } from '@/types/entities'

describe('InstanceCard', () => {
  it('should render instance information correctly', () => {
    const mockInstance: Instance = {
      id: '1',
      name: 'Test Instance',
      status: 'active'
    }

    render(<InstanceCard instance={mockInstance} />)

    expect(screen.getByText('Test Instance')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    const mockInstance: Instance = { id: '1', name: 'Test', status: 'active' }

    render(<InstanceCard instance={mockInstance} onEdit={mockOnEdit} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledWith('1')
  })

  it('should match snapshot', () => {
    const mockInstance: Instance = { id: '1', name: 'Test', status: 'active' }

    const { container } = render(<InstanceCard instance={mockInstance} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
  })
})
```

---

## 📏 Convenções Gerais

### Nomenclatura

- **Componentes**: PascalCase (`InstanceCard`)
- **Arquivos**: kebab-case (`instance-card.tsx`)
- **Funções**: camelCase (`formatDate`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Types**: PascalCase (`InstanceData`)

### Imports

- **Absolute imports**: Usar `@/` para imports internos
- **Named imports**: Preferir named imports
- **Barrel exports**: Usar `index.ts` para exports organizados

#### Configuração de Paths

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

#### Exemplo de Imports

```typescript
// ✅ Correto
import { Button } from '@/components/ui';
import { instancesService } from '@/services/api';
import type { Instance } from '@/types/entities';

// ❌ Evitar
import { Button } from '../../../components/ui/button';
import { instancesService } from '../../services/api/instances';
```

### Code Style

- **ESLint + Prettier**: Configuração consistente
- **TypeScript strict**: Tipagem rigorosa
- **Functional components**: Preferir function components
- **Composition over inheritance**: Favor composição

---

## 🔄 Migration Strategy

### Fases da Migração

1. **Análise e Planejamento**

   - Auditoria do código atual
   - Identificação de inconsistências
   - Priorização de mudanças

2. **Estrutura Base**

   - Criar nova estrutura de diretórios
   - Configurar ferramentas e linting
   - Setup de testes

3. **Migração Gradual**

   - Migrar por feature/módulo
   - Refatorar componentes
   - Padronizar APIs

4. **Validação e Refinamento**
   - Testes extensivos
   - Code review rigoroso
   - Documentação atualizada

### Princípios da Migração

- **Incremental**: Mudanças graduais, não big bang
- **Testável**: Validar cada mudança
- **Reversível**: Possibilidade de rollback
- **Documentada**: Registrar decisões e mudanças

---

## 🎯 Conclusão

Este documento estabelece os **padrões arquiteturais** para o DataOcean Instance Manager, fornecendo diretrizes claras para:

- **Estrutura** de projeto consistente
- **Organização** de código padronizada
- **Convenções** de desenvolvimento
- **Ferramentas** e configurações recomendadas

**Importante**: Este documento é **vivo** e deve evoluir conforme o projeto cresce e novas necessidades surgem. Os padrões aqui definidos servem como base para decisões arquiteturais e desenvolvimento consistente.

---

## Configuração Jest + Next.js

#### Setup Básico

```javascript
// jest.config.js
const nextJest = require('next/jest');

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
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend({
  toBeInTheDocument: require('@testing-library/jest-dom/matchers').toBeInTheDocument,
});

// Mock next/navigation
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

#### Scripts de Teste

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@next/jest": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "msw": "^2.0.0"
  }
}
```

---

## 🔄 MSW (Mock Service Worker)

O MSW é uma ferramenta essencial para **desenvolvimento** e **testes**, permitindo interceptar requisições HTTP e fornecer respostas mockadas consistentes.

### Casos de Uso

- **Desenvolvimento**: Trabalhar sem dependência de APIs externas
- **Testes**: Simular diferentes cenários e respostas de API
- **Demos**: Apresentações sem necessidade de backend real
- **Prototipagem**: Desenvolvimento rápido de interfaces

### Estrutura MSW

```
src/mocks/
├── handlers/
│   ├── instances.ts           # Handlers para API de instances
│   ├── auth.ts               # Handlers para autenticação
│   └── index.ts              # Barrel export
├── data/
│   ├── instances.ts          # Mock data para instances
│   └── users.ts              # Mock data para users
├── browser.ts                # Setup para browser (desenvolvimento)
├── server.ts                 # Setup para Node.js (testes)
└── README.md                 # Documentação dos mocks
```

### Exemplo de Handler

```typescript
// src/mocks/handlers/instances.ts
import { http, HttpResponse } from 'msw';
import { mockInstances } from '../data/instances';

export const instancesHandlers = [
  // GET /api/instances
  http.get('/api/instances', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let filteredInstances = mockInstances;

    if (search) {
      filteredInstances = mockInstances.filter((instance) =>
        instance.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json({
      data: filteredInstances,
      success: true,
      total: filteredInstances.length,
    });
  }),

  // Simulação de erro
  http.get('/api/instances/error', () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }),
];
```

### Setup para Desenvolvimento

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function startWorker() {
  await worker.start({
    onUnhandledRequest: (request, print) => {
      if (request.url.includes('ui-avatars.com')) {
        return; // Ignore UI avatars
      }
      print.warning();
    },
  });
}

// src/mocks/provider.tsx
// Provider component that conditionally initializes MSW
export function MockProvider({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && process.env.NODE_ENV === 'development') {
    // Initialize MSW
  }
  return children;
}
```

### Mock Data Strategy

```typescript
// src/mocks/data/instances.ts
export const mockInstances: Instance[] = [
  {
    id: '1',
    name: 'Production Instance',
    status: 'active',
    environment: 'production',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Development Instance',
    status: 'inactive',
    environment: 'development',
    createdAt: '2024-01-16T14:30:00Z',
  },
];

// Funções helper para gerar dados dinâmicos
export const createMockInstance = (overrides: Partial<Instance> = {}): Instance => ({
  id: crypto.randomUUID(),
  name: `Instance ${Math.random().toString(36).substr(2, 9)}`,
  status: 'active',
  environment: 'development',
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

### Configuração de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_MOCKING=enabled

# Controle condicional do MSW em desenvolvimento
NODE_ENV=development
```

```typescript
// src/mocks/provider.tsx
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && process.env.NODE_ENV === 'development') {
  // Inicializar MSW em desenvolvimento
}
```

---

## 🌐 Environment Variables

### Organização de Arquivos

Next.js carrega variáveis de ambiente automaticamente seguindo a ordem de precedência:

```
.env.local          # Carregado em todos os ambientes (ignorar no git)
.env.development    # Carregado apenas em development
.env.production     # Carregado apenas em production
.env               # Default para todos os ambientes
```

### Estrutura de Variáveis

#### .env.example (Template)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dataocean

# External Services
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Feature Flags
NEXT_PUBLIC_ENABLE_MSW=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

#### .env.local (Desenvolvimento)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development

# Development Tools
NEXT_PUBLIC_ENABLE_MSW=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true

# Local Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/dataocean_dev

# Development Secrets
NEXTAUTH_SECRET=dev-secret-key-here
```

#### .env.production

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.dataocean.com
NEXT_PUBLIC_APP_ENV=production

# Production Features
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Production Database
DATABASE_URL=${DATABASE_URL}

# Production Secrets (usar secrets do provedor)
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
```

### Convenções de Nomenclatura

#### Prefixos por Tipo

```bash
# Client-side (acessível no browser)
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_FEATURE_FLAG=true

# Server-side only (seguro)
DATABASE_URL=postgresql://...
API_SECRET_KEY=secret-key
STRIPE_SECRET_KEY=sk_live_...

# External Services
STRIPE_PUBLISHABLE_KEY=pk_live_...
SENTRY_DSN=https://...

# Feature Flags
NEXT_PUBLIC_ENABLE_FEATURE_X=true
NEXT_PUBLIC_ENABLE_BETA_UI=false
```

### Validação de Environment Variables

#### Schema de Validação

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public variables
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),

  // Server-only variables
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),

  // Optional variables
  STRIPE_SECRET_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);

// Usage
import { env } from '@/lib/env';
const apiUrl = env.NEXT_PUBLIC_API_BASE_URL;
```

#### Runtime Validation

```typescript
// lib/env-validation.ts
export function validateEnv() {
  const requiredEnvVars = ['NEXT_PUBLIC_API_BASE_URL', 'NEXTAUTH_SECRET', 'DATABASE_URL'];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// pages/_app.tsx ou app/layout.tsx
import { validateEnv } from '@/lib/env-validation';

if (process.env.NODE_ENV !== 'production') {
  validateEnv();
}
```

### Uso em Constants

```typescript
// constants/env.ts
export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as 'development' | 'staging' | 'production',
  IS_PRODUCTION: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  IS_DEVELOPMENT: process.env.NEXT_PUBLIC_APP_ENV === 'development',
  ENABLE_MSW: process.env.NEXT_PUBLIC_ENABLE_MSW === 'true',
} as const;

// Usage
import { ENV } from '@/constants/env';

if (ENV.ENABLE_MSW && ENV.IS_DEVELOPMENT) {
  // Initialize MSW
}
```

### Boas Práticas

1. **Nunca commitar** `.env.local` ou arquivos com secrets reais
2. **Sempre criar** `.env.example` como template
3. **Usar NEXT*PUBLIC*** apenas para variáveis que precisam estar no client
4. **Validar** variáveis obrigatórias no startup
5. **Agrupar** por contexto (API, Auth, Database, etc.)
6. **Documentar** propósito de cada variável
7. **Usar feature flags** para controlar funcionalidades
8. **Diferentes valores** por ambiente (dev/staging/prod)
