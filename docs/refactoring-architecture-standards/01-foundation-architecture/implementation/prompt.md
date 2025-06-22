# Prompt: Implementação Foundation Architecture

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 01 - Foundation Architecture (Implementation)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Análise completa em `../analysis/results.md`

## Objetivo da Implementação

Estabelecer uma base arquitetural sólida através da reorganização de diretórios, centralização de configurações, padronização de estruturas e implementação de utilitários fundamentais.

## Pré-requisitos

- [ ] Phase 00 (Code Cleanup) concluída e validada
- [ ] Análise da foundation atual completa (`../analysis/results.md`)
- [ ] Gap analysis identificando melhorias necessárias
- [ ] Backup/commit do estado atual

## Estratégia de Implementação

### Abordagem Incremental

1. **Config & Constants**: Centralizar configurações
2. **Utils Enhancement**: Padronizar e melhorar utilitários
3. **Types Foundation**: Estabelecer base de tipos sólida
4. **Error Handling**: Implementar sistema consistente
5. **Directory Structure**: Reorganizar conforme padrões
6. **Barrel Exports**: Implementar index files consistentes

## Implementação Passo-a-Passo

### Step 1: Configuration & Constants Foundation

#### 1.1 Centralizar Configurações

```bash
# Criar estrutura de configuração centralizada
mkdir -p src/config
mkdir -p src/constants
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
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retries: 3,
  },
  ui: {
    defaultPageSize: 10,
    maxPageSize: 100,
    debounceMs: 300,
    animationDuration: 200,
  },
  features: {
    enableDarkMode: true,
    enableI18n: true,
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
} as const;

export type Config = typeof config;
```

```typescript
// src/constants/index.ts
export const ROUTES = {
  HOME: '/',
  APPLICATIONS: '/applications',
  ENVIRONMENTS: '/environments',
  LOCATIONS: '/locations',
  APPLICATION_DETAIL: (id: string) => `/applications/${id}`,
  ENVIRONMENT_DETAIL: (id: string) => `/environments/${id}`,
  LOCATION_DETAIL: (id: string) => `/locations/${id}`,
} as const;

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email',
  MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
} as const;

export const API_ENDPOINTS = {
  APPLICATIONS: '/api/applications',
  ENVIRONMENTS: '/api/environments',
  LOCATIONS: '/api/locations',
} as const;
```

#### 1.2 Migrar Configs Existentes

```bash
# Identificar configs espalhadas e migrar para centralização
grep -r "const.*BASE_URL\|API_URL\|CONFIG" src/ --include="*.ts" --include="*.tsx" | head -10

# Mover configs hardcoded para src/config/
# Atualizar imports para usar config centralizado
```

### Step 2: Enhanced Utils Foundation

#### 2.1 Error Handling Utils

```typescript
// src/utils/error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export const errorHandler = {
  handle: (error: unknown): AppError => {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN_ERROR');
    }

    return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
  },

  format: (error: AppError) => ({
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
  }),
};
```

#### 2.2 Validation Utils

```typescript
// src/utils/validation.ts
export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  required: (value: unknown): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value != null;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
};

export const createValidator = <T>(
  rules: Partial<Record<keyof T, Array<(value: any) => boolean | string>>>
) => {
  return (data: T): Record<keyof T, string[]> => {
    const errors = {} as Record<keyof T, string[]>;

    for (const [field, fieldRules] of Object.entries(rules) as [
      keyof T,
      Array<(value: any) => boolean | string>,
    ][]) {
      const value = data[field];
      const fieldErrors: string[] = [];

      for (const rule of fieldRules) {
        const result = rule(value);
        if (typeof result === 'string') {
          fieldErrors.push(result);
        } else if (!result) {
          fieldErrors.push('Validation failed');
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return errors;
  };
};
```

#### 2.3 Format Utils

```typescript
// src/utils/format.ts
export const formatters = {
  currency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  date: (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString();
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'relative':
        return new Intl.RelativeTimeFormat('en-US').format(
          Math.floor((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          'day'
        );
      default:
        return dateObj.toLocaleDateString();
    }
  },

  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  truncate: (text: string, maxLength: number): string => {
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
  },
};
```

#### 2.4 Async Utils

```typescript
// src/utils/async.ts
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await delay(delayMs * Math.pow(2, i)); // Exponential backoff
    }
  }
  throw new Error('Retry failed');
};

export const timeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
};
```

### Step 3: Enhanced Types Foundation

#### 3.1 Common Base Types

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

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

#### 3.2 Enhanced Domain Types

```typescript
// src/types/application.ts
import { BaseEntity } from './common';

export interface Application extends BaseEntity {
  name: string;
  description?: string;
  status: ApplicationStatus;
  environmentId: string;
  locationId: string;
  configuration: ApplicationConfiguration;
  metadata: ApplicationMetadata;
}

export type ApplicationStatus = 'active' | 'inactive' | 'pending' | 'error';

export interface ApplicationConfiguration {
  // Definir baseado na análise específica do domínio
  [key: string]: unknown;
}

export interface ApplicationMetadata {
  version?: string;
  tags?: string[];
  owner?: string;
  lastDeployment?: Date;
}

export type CreateApplicationRequest = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateApplicationRequest = Partial<CreateApplicationRequest>;
```

### Step 4: Directory Structure Standardization

#### 4.1 Reorganizar Utils

```bash
# Verificar estrutura atual de utils
ls -la src/utils/

# Reorganizar por categoria se necessário
mkdir -p src/utils/{validation,format,async,error}

# Mover e organizar utils existentes
# [Baseado na análise, mover utils específicos para subdiretórios]
```

#### 4.2 Implementar Barrel Exports Consistentes

```typescript
// src/config/index.ts
export * from './app.config';
export * from './api.config';
export * from './ui.config';

// src/constants/index.ts
export * from './routes';
export * from './status';
export * from './validation';
export * from './api';

// src/utils/index.ts
export * from './error';
export * from './validation';
export * from './format';
export * from './async';

// src/types/index.ts
export * from './common';
export * from './application';
export * from './environment';
export * from './location';
```

### Step 5: Environment & Build Configuration

#### 5.1 Enhanced Environment Variables

```bash
# .env.example (atualizar ou criar)
cat > .env.example << 'EOF'
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="DataOcean Instance Manager"
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000
API_RETRIES=3

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false

# UI Configuration
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=10
NEXT_PUBLIC_MAX_PAGE_SIZE=100
NEXT_PUBLIC_DEBOUNCE_MS=300
EOF
```

#### 5.2 Enhanced TypeScript Configuration

```json
// tsconfig.json (melhorias baseadas na análise)
{
  "compilerOptions": {
    // ... existing config ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/config/*": ["src/config/*"],
      "@/constants/*": ["src/constants/*"]
    },
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Step 6: Integration & Migration

#### 6.1 Atualizar Imports Existentes

```bash
# Script para atualizar imports para usar nova estrutura
echo "Updating imports to use new foundation structure..."

# Atualizar imports de config
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.\.\/.*config/\@\/config/g'

# Atualizar imports de constants
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.\.\/.*constants/\@\/constants/g'

# Atualizar imports de utils
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.\.\/.*utils/\@\/utils/g'
```

#### 6.2 Migrar Hardcoded Values

```bash
# Identificar valores hardcoded que devem ir para constants
grep -r "http://\|https://\|'api/\|\"api/" src/ --include="*.ts" --include="*.tsx" | head -10

# Identificar magic numbers que devem ir para config
grep -r "\b[0-9]\{3,\}\b" src/ --include="*.ts" --include="*.tsx" | head -10

# [Migrar valores encontrados para config/constants apropriados]
```

## Validação Contínua

### Após Cada Step:

```bash
# Type checking
npm run type-check

# Build verification
npm run build

# Test execution
npm run test

# Lint checking
npm run lint
```

## Checklist de Implementação

### ✅ Step 1: Configuration & Constants

- [ ] Estrutura `src/config/` criada e populada
- [ ] Estrutura `src/constants/` criada e populada
- [ ] Configurações centralizadas migradas
- [ ] Environment variables organizadas

### ✅ Step 2: Enhanced Utils

- [ ] Error handling utils implementados
- [ ] Validation utils criados
- [ ] Format utils implementados
- [ ] Async utils adicionados

### ✅ Step 3: Types Foundation

- [ ] Common base types definidos
- [ ] Domain types aprimorados
- [ ] Type exports organizados
- [ ] Type safety melhorada

### ✅ Step 4: Directory Structure

- [ ] Utils reorganizados por categoria
- [ ] Barrel exports implementados
- [ ] Index files consistentes
- [ ] Import paths padronizados

### ✅ Step 5: Build Configuration

- [ ] Environment variables documentadas
- [ ] TypeScript paths configurados
- [ ] Build configuration otimizada
- [ ] Development experience melhorada

### ✅ Step 6: Integration

- [ ] Imports atualizados para nova estrutura
- [ ] Hardcoded values migrados
- [ ] Existing code integrado
- [ ] Backward compatibility mantida

## Documentação dos Resultados

```markdown
# Foundation Architecture Implementation Summary

## ✅ Completed

### Configuration Foundation

- Centralized app, API, UI, and feature configurations
- Environment variables properly organized
- Type-safe configuration system

### Utils Enhancement

- Comprehensive error handling system
- Robust validation utilities
- Formatting and async utilities
- Consistent utility patterns

### Types Foundation

- Common base types established
- Enhanced domain types
- Type safety improvements
- Organized type exports

### Directory Structure

- Logical organization by function
- Consistent barrel exports
- Clean import paths
- Scalable architecture

## Impact

### Code Quality

- Type safety: Enhanced
- Error handling: Standardized
- Configuration: Centralized
- Import paths: Simplified

### Developer Experience

- IDE support: Improved
- Code navigation: Enhanced
- Build performance: Optimized
- Documentation: Comprehensive

## Next Steps

✅ Phase 01 (Foundation Architecture) completed
→ Ready for Phase 02 (Testing Framework)
```

## Próximos Passos

Após completar a implementação com sucesso:

1. Executar `validation/prompt.md` para validar a foundation
2. Proceder para Phase 02 - Testing Framework
3. Iterar baseado no feedback da validação
   const response = await fetch(`${API_BASE_URL}${ENDPOINTS.blueprints}/${id}`);
   return response.json();
   };

// ✅ DEPOIS: blueprint-service.ts
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '@/config';

export const getBlueprintById = async (id: string) => {
const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.BLUEPRINTS}/${id}`, {
signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
});

if (response.status === HTTP_STATUS.NOT_FOUND) {
throw new Error(`Blueprint ${id} not found`);
}

return response.json();
};

````

## Troubleshooting

### Erro: "Cannot resolve @/config"

```bash
# Verificar tsconfig.json paths
cat tsconfig.json | grep -A 5 "paths"

# Restart TypeScript server
# VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
````

### Erro: "Zod is not defined"

```bash
npm install zod
npm run build
```

### Imports não encontrados após migração

```bash
# Verificar se barrel export está correto
cat src/config/index.ts

# Verificar se paths estão corretos
grep -r "@/config" src/ --include="*.ts" | head -5
```

## Critérios de Aceitação

- [ ] `src/config/` estrutura criada com todos os arquivos
- [ ] Zod validation implementada para environment variables
- [ ] Constants centralizados (zero duplicação)
- [ ] Todos os services atualizados para usar `@/config`
- [ ] TypeScript paths otimizados
- [ ] Build passa sem erros
- [ ] Imports absolutos funcionando
- [ ] Documentação atualizada

## Próximos Passos

Após implementação, proceder para `validation/prompt.md` para validar as mudanças.
