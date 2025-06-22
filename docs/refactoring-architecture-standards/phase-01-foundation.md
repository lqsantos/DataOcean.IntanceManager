# Phase 01: Foundation Architecture

## Objetivo

Estabelecer base arquitetural sólida com configurações centralizadas, utilitários padronizados e estrutura de tipos consistente.

## Análise da Situação Atual

### 1. Verificar Configurações Atuais

```bash
# Procurar configs espalhadas
grep -r "const.*URL\|API_BASE\|BASE_URL" src/ --include="*.ts" --include="*.tsx" | head -10

# Verificar estrutura de utils
ls -la src/utils/ 2>/dev/null || echo "Utils não organizadas"

# Verificar estrutura de types
ls -la src/types/ 2>/dev/null || echo "Types não organizadas"
```

### 2. Identificar Gaps

- [ ] **Config centralizada**: Falta src/config/
- [ ] **Constants centralizadas**: Falta src/constants/
- [ ] **Utils padronizadas**: Falta organização
- [ ] **Types base**: Falta tipos comuns
- [ ] **Error handling**: Falta sistema consistente

## Implementação

### Step 1: Instalar Dependências

```bash
npm install zod  # Para validação de schemas
```

### Step 2: Criar Estrutura de Config

```bash
mkdir -p src/config src/constants
```

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

```typescript
// src/constants/index.ts
export const ROUTES = {
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

### Step 3: Utils Aprimorados

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

### Step 4: Types Base

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

### Step 5: Barrel Exports

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

### Step 6: Atualizar TSConfig

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

### Step 7: Migrar Imports Existentes

```bash
# Atualizar imports para usar nova estrutura
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.\.\/.*config/@\/config/g'
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.\.\/.*constants/@\/constants/g'
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.\.\/.*utils/@\/utils/g'
```

## Checklist de Finalização

### Estrutura Criada

- [ ] `src/config/` com configurações centralizadas
- [ ] `src/constants/` com constantes organizadas
- [ ] `src/utils/` com utilitários padronizados
- [ ] `src/types/` com tipos base definidos
- [ ] Barrel exports implementados

### Funcionalidade

- [ ] `npm run type-check` - Types válidos
- [ ] `npm run build` - Build successful
- [ ] `npm run lint` - Sem erros críticos
- [ ] Imports atualizados para nova estrutura
- [ ] App funciona normalmente

### Impacto

- [ ] Configurações centralizadas
- [ ] Import paths simplificados
- [ ] Error handling consistente
- [ ] Developer experience melhorada

## Próximo Passo

→ **Phase 02: Testing Framework**
