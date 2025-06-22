# Prompt: Implementação da Consolidação MSW

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Consolidar mocks MSW em estrutura centralizada por domínio  
**Base**: Resultados da análise em `../analysis/results.md`

**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Informações do Projeto

### Estrutura Atual do Projeto

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── applications/    # Application-related components
│   ├── environments/    # Environment-related components
│   ├── locations/       # Location-related components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # Generic UI components
├── services/            # API services
│   ├── application-service.ts
│   ├── environment-service.ts
│   └── location-service.ts
├── hooks/               # Custom React hooks
│   ├── use-applications.ts
│   ├── use-environments.ts
│   └── use-locations.ts
├── types/               # TypeScript type definitions
│   ├── application.ts
│   ├── environment.ts
│   └── location.ts
├── mocks/               # MSW mocks for testing/development
├── lib/                 # Utility libraries and configurations
└── locales/             # i18n translation files
```

### Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Mocking**: MSW (Mock Service Worker)
- **State**: React hooks + Context
- **i18n**: Custom i18n implementation

### Domínios Principais

1. **Applications** - Gerenciamento de aplicações
2. **Environments** - Gerenciamento de ambientes (prod, staging, dev)
3. **Locations** - Gerenciamento de localizações/datacenters

## Objetivo da Implementação

Consolidar e organizar todos os mocks MSW em uma estrutura centralizada e reutilizável, eliminando duplicações.

## Pré-requisitos

- [ ] Análise completa executada (`../analysis/results.md` preenchido)
- [ ] Mocks duplicados identificados
- [ ] Estrutura alvo definida

## Tarefas de Implementação

### 1. Criar Estrutura Centralizada

**Estrutura alvo em `src/mocks/`:**

```
src/mocks/
├── index.ts              # Configuração principal e exports
├── browser.ts           # Setup para desenvolvimento (browser)
├── server.ts            # Setup para testes (Node.js)
└── handlers/
    ├── index.ts         # Barrel export de todos handlers
    ├── applications.ts  # Handlers específicos de applications
    ├── environments.ts  # Handlers específicos de environments
    ├── locations.ts     # Handlers específicos de locations
    └── common.ts        # Handlers comuns (auth, user, etc.)
```

### 2. Consolidar Handlers por Domínio

**src/mocks/handlers/applications.ts:**

```typescript
import { rest } from 'msw';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

// Mock data baseado na estrutura real do projeto
const mockApplications: Application[] = [
  {
    id: '1',
    name: 'Production App',
    description: 'Main production application',
    status: 'active',
    environmentId: 'env-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Staging App',
    description: 'Staging environment application',
    status: 'inactive',
    environmentId: 'env-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const applicationHandlers = [
  // GET /api/applications
  rest.get('/api/applications', (req, res, ctx) => {
    return res(ctx.json(mockApplications));
  }),

  // POST /api/applications
  rest.post('/api/applications', async (req, res, ctx) => {
    const data = (await req.json()) as CreateApplicationDto;
    const newApp: Application = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.json(newApp));
  }),

  // PUT /api/applications/:id
  rest.put('/api/applications/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const data = (await req.json()) as UpdateApplicationDto;
    const updatedApp: Application = {
      id: id as string,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Application;
    return res(ctx.json(updatedApp));
  }),

  // DELETE /api/applications/:id
  rest.delete('/api/applications/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
];
```

**src/mocks/handlers/environments.ts:**

```typescript
import { rest } from 'msw';
import type { Environment, CreateEnvironmentDto, UpdateEnvironmentDto } from '@/types/environment';

const mockEnvironments: Environment[] = [
  {
    id: 'env-1',
    name: 'Production',
    description: 'Production environment',
    status: 'active',
    locationId: 'loc-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'env-2',
    name: 'Staging',
    description: 'Staging environment',
    status: 'active',
    locationId: 'loc-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const environmentHandlers = [
  rest.get('/api/environments', (req, res, ctx) => {
    return res(ctx.json(mockEnvironments));
  }),

  rest.post('/api/environments', async (req, res, ctx) => {
    const data = (await req.json()) as CreateEnvironmentDto;
    const newEnv: Environment = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.json(newEnv));
  }),

  rest.put('/api/environments/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const data = (await req.json()) as UpdateEnvironmentDto;
    const updatedEnv: Environment = {
      id: id as string,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Environment;
    return res(ctx.json(updatedEnv));
  }),

  rest.delete('/api/environments/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
];
```

### 3. Criar Handlers para Locations e Common

**src/mocks/handlers/locations.ts:**

```typescript
import { rest } from 'msw';
import type { Location } from '@/types/location';

const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'US East',
    description: 'US East Coast datacenter',
    region: 'us-east-1',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const locationHandlers = [
  rest.get('/api/locations', (req, res, ctx) => {
    return res(ctx.json(mockLocations));
  }),
  // Adicionar outros endpoints conforme análise
];
```

**src/mocks/handlers/common.ts:**

```typescript
import { rest } from 'msw';

export const commonHandlers = [
  // Auth endpoints se aplicável
  rest.get('/api/auth/user', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      })
    );
  }),

  // Health check
  rest.get('/api/health', (req, res, ctx) => {
    return res(ctx.json({ status: 'ok' }));
  }),
];
```

### 4. Criar Configuração Unificada

**src/mocks/handlers/index.ts:**

```typescript
import { applicationHandlers } from './applications';
import { environmentHandlers } from './environments';
import { locationHandlers } from './locations';
import { commonHandlers } from './common';

export const handlers = [
  ...applicationHandlers,
  ...environmentHandlers,
  ...locationHandlers,
  ...commonHandlers,
];

// Export específicos para uso granular se necessário
export { applicationHandlers, environmentHandlers, locationHandlers, commonHandlers };
```

### 5. Configurar para Diferentes Ambientes

**src/mocks/browser.ts:**

```typescript
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Configurar para desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
  });
}
```

**src/mocks/server.ts:**

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**src/mocks/index.ts:**

```typescript
// Export principal para fácil importação
export { handlers } from './handlers';
export { worker } from './browser';
export { server } from './server';

// Types se necessário
export type { Application } from '@/types/application';
export type { Environment } from '@/types/environment';
export type { Location } from '@/types/location';
```

### 6. Atualizar Imports nos Testes

Com base na análise, atualizar imports em arquivos de teste:

```typescript
// ❌ ANTES: Imports duplicados/inconsistentes
import { handlers } from '@/tests/msw/handlers';
import { mockServer } from '@/some/other/mock/location';

// ✅ DEPOIS: Import unificado
import { server } from '@/mocks/server';
import { handlers } from '@/mocks/handlers';

// Em setup de testes (ex: jest.setup.js ou vitest.setup.ts)
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 7. Atualizar Configuração para Desenvolvimento

**Se houver setup no app para desenvolvimento:**

```typescript
// pages/_app.tsx ou app/layout.tsx
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  import('@/mocks/browser');
}
```

### 8. Remover Arquivos Duplicados

Com base na análise, remover:

- [ ] Handlers duplicados em outras localizações
- [ ] Configurações MSW redundantes
- [ ] Arquivos de mock obsoletos
- [ ] Imports antigos em testes

```bash
# Exemplo de remoção (ajustar conforme análise)
rm -rf src/tests/msw/ 2>/dev/null || echo "Diretório não encontrado"
rm -rf src/__mocks__/ 2>/dev/null || echo "Diretório não encontrado"
```

## Checklist de Implementação

- [ ] Estrutura centralizada criada em `src/mocks/`
- [ ] Handlers organizados por domínio (applications, environments, locations)
- [ ] Configuração unificada para browser e server
- [ ] Mock data tipado corretamente
- [ ] Imports atualizados em todos os arquivos de teste
- [ ] Setup de testes atualizado para usar nova configuração
- [ ] Arquivos duplicados removidos
- [ ] Configuração de desenvolvimento atualizada (se aplicável)

## Validação Rápida

```bash
# Verificar estrutura criada
ls -la src/mocks/
ls -la src/mocks/handlers/

# Testar mocks em desenvolvimento
npm run dev
# Abrir browser e verificar Network tab se requests são interceptados

# Testar mocks nos testes
npm run test
# Verificar se testes que dependem de API funcionam
```

## Próximo Passo

Após implementação, execute `../validation/prompt.md` para validação final.
