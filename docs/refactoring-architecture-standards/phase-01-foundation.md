# Phase 01: Foundation Architecture

## Objetivo

Estabelecer base arquitetural sólida com configurações centralizadas, utilitários padronizados e estrutura de tipos consistente.

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Verificar estrutura de diretórios existente
- Buscar configurações espalhadas no código
- Identificar padrões de organização atual
- Detectar gaps na arquitetura

### 2. Gaps Típicos Esperados

- [ ] **Config centralizada**: Falta src/config/
- [ ] **Constants centralizadas**: Falta src/constants/
- [ ] **Utils padronizadas**: Falta organização
- [ ] **Types base**: Falta tipos comuns
- [ ] **Error handling**: Falta sistema consistente

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
git add .
git commit -m "Backup before foundation architecture"
```

### Step 2: Análise da Estrutura Atual (Copilot Agent)

O Copilot Agent irá primeiro analisar:

- Verificar estrutura de diretórios existente usando `file_search`
- Buscar configurações espalhadas com `grep_search`
- Identificar padrões de organização atual
- Detectar gaps na arquitetura

### Step 3: Criar Estrutura de Config (Copilot Agent)

```typescript
// src/config/index.ts
export const config = {
  app: {
    name: 'DataOcean Instance Manager',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    timeout: 30000,
    retries: 3,
  },
  ui: {
    defaultPageSize: 10,
    maxPageSize: 100,
    debounceMs: 300,
  },
} as const;
```

### Step 4: Constants Organizadas (Copilot Agent)

```typescript
// src/constants/index.ts
  HOME: '/',
  APPLICATIONS: '/applications',
  ENVIRONMENTS: '/environments',
  LOCATIONS: '/locations',
} as const;

export const API_ENDPOINTS = {
  APPLICATIONS: '/api/applications',
  ENVIRONMENTS: '/api/environments',
  LOCATIONS: '/api/locations',
} as const;

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
```

### Step 5: Utils Aprimorados (Copilot Agent)

```typescript
// src/utils/error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = {
  handle: (error: unknown): AppError => {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new AppError(error.message, 'UNKNOWN_ERROR');
    return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
  },
};
```

```typescript
// src/utils/validation.ts
export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  required: (value: unknown) => value != null && value !== '',
  minLength: (value: string, min: number) => value.length >= min,
  maxLength: (value: string, max: number) => value.length <= max,
};
```

```typescript
// src/utils/format.ts
export const formatters = {
  date: (date: Date | string) => new Date(date).toLocaleDateString(),
  currency: (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount),
  fileSize: (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },
};
```

### Step 6: Types Base (Copilot Agent)

```typescript
// src/types/common.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';
```

### Step 7: Barrel Exports (Copilot Agent)

```typescript
// src/config/index.ts
export * from './app';
export * from './api';

// src/constants/index.ts
export * from './routes';
export * from './api';
export * from './status';

// src/utils/index.ts
export * from './error';
export * from './validation';
export * from './format';

// src/types/index.ts
export * from './common';
export * from './application';
export * from './environment';
export * from './location';
```

### Step 8: Atualizar TSConfig (Copilot Agent)

```json
// tsconfig.json - adicionar paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@/config": ["src/config"],
      "@/constants": ["src/constants"],
      "@/utils": ["src/utils"],
      "@/types": ["src/types"]
    }
  }
}
```

### Step 9: Migrar Imports Existentes (Copilot Agent)

O Copilot Agent irá usar suas ferramentas nativas para:

1. **Identificar imports antigos**: `grep_search` para encontrar imports relativos
2. **Atualizar automaticamente**: `replace_string_in_file` para corrigir imports
3. **Validar mudanças**: `get_errors` para verificar se não quebrou nada

### Step 10: Validação e Commit (Usuário)

**APÓS a refatoração completa**: O usuário deve validar e commitar:

```bash
# Validar
npm run type-check  # Verificar types
npm run build       # Verificar se build passa
npm run lint        # Verificar se não há erros críticos

# Commitar
git add .
git commit -m "feat: establish foundation architecture with centralized config and utils"
```

## Checklist de Finalização

### ✅ Antes de Iniciar (Usuário)

- [ ] Backup realizado

### ✅ Estrutura Criada (Copilot Agent)

- [ ] `src/config/` com configurações centralizadas
- [ ] `src/constants/` com constantes organizadas
- [ ] `src/utils/` com utilitários padronizados
- [ ] `src/types/` com tipos base definidos
- [ ] Barrel exports implementados

### ✅ Funcionalidade (Copilot Agent)

- [ ] TSConfig paths configurados
- [ ] Imports migrados para nova estrutura
- [ ] Barrel exports funcionando

### ✅ Validação Final (Usuário)

- [ ] `npm run type-check` - Types válidos
- [ ] `npm run build` - Build successful
- [ ] `npm run lint` - Sem erros críticos
- [ ] App funciona normalmente
- [ ] Alterações commitadas

### ✅ Impacto Esperado

- [ ] Configurações centralizadas
- [ ] Import paths simplificados
- [ ] Error handling consistente
- [ ] Developer experience melhorada

## Próximo Passo

→ **Phase 02: Testing Framework**
