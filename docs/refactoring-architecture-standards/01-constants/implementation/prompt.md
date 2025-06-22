# Prompt: Implementação da Centralização de Constantes

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Centralizar constantes em `src/lib/constants.ts` e atualizar imports  
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

Implementar a centralização de constantes baseada nos resultados da análise, criando/atualizando `src/lib/constants.ts` e refatorando os imports.

## Pré-requisitos

- [ ] Análise completa executada (`../analysis/results.md` preenchido)
- [ ] Lista de constantes duplicadas identificadas
- [ ] Estrutura proposta definida

## Tarefas de Implementação

### 1. Criar/Atualizar src/lib/constants.ts

Com base nos resultados da análise, implemente a estrutura:

```typescript
// Template base - ajustar conforme análise
export const UI = {
  PLACEHOLDERS: {
    // Placeholders identificados
  },
  LABELS: {
    // Labels identificados
  },
  CSS_CLASSES: {
    // Classes CSS comuns
  },
} as const;

export const BUSINESS = {
  STATUS: {
    // Status values identificados
  },
  TYPES: {
    // Entity types identificados
  },
} as const;

export const CONFIG = {
  API: {
    // Endpoints identificados
  },
  LIMITS: {
    // Timeouts, limites identificados
  },
} as const;

export const MESSAGES = {
  ERRORS: {
    // Error messages identificados
  },
  SUCCESS: {
    // Success messages identificados
  },
} as const;
```

### 2. Refatorar Imports nos Arquivos Afetados

Para cada arquivo identificado na análise:

1. **Importar as constantes**:

```typescript
import { UI, BUSINESS, CONFIG, MESSAGES } from '@/lib/constants';
```

2. **Substituir valores hardcoded**:

```typescript
// Antes
const placeholder = 'Enter your name';

// Depois
const placeholder = UI.PLACEHOLDERS.NAME;
```

### 3. Atualizar Barrel Exports

Se necessário, atualizar `src/lib/index.ts`:

```typescript
export * from './constants';
```

### Exemplos Práticos de Refatoração

#### Antes (Arquivo com constantes duplicadas):

```typescript
// src/services/application-service.ts
const API_BASE_URL = '/api'; // ❌ Duplicado
const APPLICATIONS_ENDPOINT = '/applications'; // ❌ Duplicado

export const fetchApplications = async () => {
  const response = await fetch(`${API_BASE_URL}${APPLICATIONS_ENDPOINT}`);
  return response.json();
};
```

#### Depois (Usando constantes centralizadas):

```typescript
// src/services/application-service.ts
import { API } from '@/lib/constants';

export const fetchApplications = async () => {
  const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.APPLICATIONS}`);
  return response.json();
};
```

### 4. Padrão de Migração por Arquivo

Para cada arquivo identificado na análise:

1. **Adicionar import das constantes**:

```typescript
import { API, UI, BUSINESS, MESSAGES } from '@/lib/constants';
```

2. **Substituir valores hardcoded** seguindo o padrão:

```typescript
// ❌ ANTES
const url = '/api/applications';
const placeholder = 'Enter application name';
const status = 'active';

// ✅ DEPOIS
const url = `${API.BASE_URL}${API.ENDPOINTS.APPLICATIONS}`;
const placeholder = UI.PLACEHOLDERS.APPLICATION_NAME;
const status = BUSINESS.STATUS.ACTIVE;
```

3. **Verificar se alias @/ está configurado**:

```typescript
// Verificar em tsconfig.json se existe:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Checklist de Implementação

- [ ] `src/lib/constants.ts` criado/atualizado
- [ ] Todas as constantes duplicadas centralizadas
- [ ] Imports atualizados em todos os arquivos afetados
- [ ] Barrel exports atualizados (se aplicável)
- [ ] Tipos TypeScript corretos aplicados
- [ ] Build sem erros de compilação

## Validação Rápida

```bash
# Verificar se não há mais duplicações
npm run build
npm run lint

# Testar funcionalidade
npm run test
```

## Próximo Passo

Após implementação, execute `../validation/prompt.md` para validação final.
