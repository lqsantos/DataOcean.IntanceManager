# Phase 04B-1: Applications Migration

**Objetivo**: Migrar domínio Applications para arquitetura de features como prova de conceito, estabelecendo padrões para os demais domínios.

**Prioridade**: Alta - Prova de conceito para migração de features

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Domain: Applications**

- **Complexidade**: Baixa (Foundation Domain)
- **Pattern**: Standard CRUD operations
- **Workflow**: Simple table + modal form
- **Dependencies**: Environments, Locations (referências)

### **Categorização para Applications**

- **FEATURE-BOUND** (`features/applications/`): Todos os componentes, hooks, services específicos de Applications
- **GLOBAL** (raiz): Apenas UI components genéricos reutilizados

### **Package Manager**: pnpm (padrão do projeto)

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Mapear arquivos relacionados a Applications em `src/components/`
- Identificar dependências e imports
- Analisar hooks em `src/hooks/use-applications.ts`
- Avaliar services em `src/services/application-service.ts`
- Verificar types em `src/types/application.ts`
- Planejar migração preservando funcionalidade

### 2. Arquivos Esperados para Migração

**Components (src/components/)**:

- [ ] `applications/` (diretório completo)
- [ ] Verificar se há components em outros locais

**Hooks**:

- [ ] `src/hooks/use-applications.ts`

**Services**:

- [ ] `src/services/application-service.ts`

**Types**:

- [ ] `src/types/application.ts`

**Constants** (se houver):

- [ ] Verificar se há constants específicos

## Implementação

### Step 1: Análise de Mapeamento (Copilot Agent)

**COMANDO**: Use ferramentas do VS Code para mapear arquivos Applications:

```typescript
// Copilot Agent deve usar:
// 1. file_search("**/applications/**") - Mapear components
// 2. file_search("**/application*") - Mapear arquivos relacionados
// 3. grep_search("application", isRegexp=false) - Encontrar referências
// 4. read_file para analisar estrutura dos principais arquivos
```

### Step 2: Criar Estrutura Applications Feature (Copilot Agent)

**CATEGORIA**: Feature-bound - Domínio Applications

**COMANDO**: Criar estrutura seguindo template estabelecido:

```bash
src/features/applications/
├── components/
│   ├── ApplicationTable.tsx
│   ├── ApplicationForm.tsx
│   ├── ApplicationModal.tsx
│   └── index.ts
├── hooks/
│   ├── use-applications.ts
│   ├── use-application-form.ts
│   └── index.ts
├── services/
│   ├── application-service.ts
│   └── index.ts
├── types/
│   ├── application.ts
│   └── index.ts
├── constants/
│   ├── application.ts
│   └── index.ts
└── index.ts                # Public API
```

### Step 3: Migrar Components (Copilot Agent)

**COMANDO**: Mover e adaptar components preservando funcionalidade:

```typescript
// features/applications/components/ApplicationTable.tsx (FEATURE-BOUND)
// Migrar de src/components/applications/[existing-component]
// Manter mesma funcionalidade, ajustar apenas imports

// Exemplo de estrutura esperada:
interface ApplicationTableProps {
  applications: Application[];
  onEdit?: (application: Application) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export const ApplicationTable = ({
  applications,
  onEdit,
  onDelete,
  loading,
}: ApplicationTableProps) => {
  // ...existing implementation...
};
```

```typescript
// features/applications/components/ApplicationForm.tsx (FEATURE-BOUND)
// Migrar formulário preservando validação e funcionalidade
interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: ApplicationFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ApplicationForm = ({
  application,
  onSubmit,
  onCancel,
  loading,
}: ApplicationFormProps) => {
  // ...existing implementation...
};
```

```typescript
// features/applications/components/index.ts (FEATURE-BOUND)
export { ApplicationTable } from './ApplicationTable';
export { ApplicationForm } from './ApplicationForm';
export { ApplicationModal } from './ApplicationModal';
```

### Step 4: Migrar Hooks (Copilot Agent)

**COMANDO**: Mover hooks ajustando imports conforme nova estrutura:

```typescript
// features/applications/hooks/use-applications.ts (FEATURE-BOUND)
// Migrar de src/hooks/use-applications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services';
import type { Application, ApplicationFilters } from '../types';

export const useApplications = (filters?: ApplicationFilters) => {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applicationService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// ...existing hooks implementation...
```

```typescript
// features/applications/hooks/use-application-form.ts (FEATURE-BOUND)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationValidationSchema } from '../constants';
import type { ApplicationFormData } from '../types';

export const useApplicationForm = (application?: Application) => {
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationValidationSchema),
    defaultValues: application || {},
  });

  // ...existing form logic...
};
```

```typescript
// features/applications/hooks/index.ts (FEATURE-BOUND)
export { useApplications } from './use-applications';
export { useApplicationForm } from './use-application-form';
```

### Step 5: Migrar Services (Copilot Agent)

**COMANDO**: Mover service ajustando imports:

```typescript
// features/applications/services/application-service.ts (FEATURE-BOUND)
// Migrar de src/services/application-service.ts
import { httpClient } from '@/lib/http-client';
import type { Application, ApplicationFormData, ApplicationFilters } from '../types';

class ApplicationService {
  private readonly baseUrl = '/api/applications';

  async getAll(filters?: ApplicationFilters): Promise<Application[]> {
    // ...existing implementation...
  }

  async getById(id: string): Promise<Application> {
    // ...existing implementation...
  }

  async create(data: ApplicationFormData): Promise<Application> {
    // ...existing implementation...
  }

  async update(id: string, data: ApplicationFormData): Promise<Application> {
    // ...existing implementation...
  }

  async delete(id: string): Promise<void> {
    // ...existing implementation...
  }
}

export const applicationService = new ApplicationService();
```

```typescript
// features/applications/services/index.ts (FEATURE-BOUND)
export { applicationService } from './application-service';
```

### Step 6: Migrar Types (Copilot Agent)

**COMANDO**: Mover types preservando definições:

```typescript
// features/applications/types/application.ts (FEATURE-BOUND)
// Migrar de src/types/application.ts

export interface Application {
  id: string;
  name: string;
  description?: string;
  status: ApplicationStatus;
  environmentId: string;
  locationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationFormData {
  name: string;
  description?: string;
  environmentId: string;
  locationId: string;
}

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus;
  environmentId?: string;
  locationId?: string;
}

export type ApplicationStatus = 'active' | 'inactive' | 'pending' | 'error';
```

```typescript
// features/applications/types/index.ts (FEATURE-BOUND)
export type {
  Application,
  ApplicationFormData,
  ApplicationFilters,
  ApplicationStatus,
} from './application';
```

### Step 7: Criar Constants (Copilot Agent)

**COMANDO**: Extrair/criar constants específicos do domínio:

```typescript
// features/applications/constants/application.ts (FEATURE-BOUND)
import { z } from 'zod';

export const APPLICATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  ERROR: 'error',
} as const;

export const APPLICATION_VALIDATION = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

export const applicationValidationSchema = z.object({
  name: z
    .string()
    .min(APPLICATION_VALIDATION.MIN_NAME_LENGTH)
    .max(APPLICATION_VALIDATION.MAX_NAME_LENGTH),
  description: z.string().max(APPLICATION_VALIDATION.MAX_DESCRIPTION_LENGTH).optional(),
  environmentId: z.string().min(1),
  locationId: z.string().min(1),
});
```

```typescript
// features/applications/constants/index.ts (FEATURE-BOUND)
export {
  APPLICATION_STATUS,
  APPLICATION_VALIDATION,
  applicationValidationSchema,
} from './application';
```

### Step 8: Estabelecer Public API (Copilot Agent)

**COMANDO**: Criar API pública limpa da feature:

```typescript
// features/applications/index.ts (FEATURE-BOUND)
// Public API da Feature Applications

// Components
export { ApplicationTable, ApplicationForm, ApplicationModal } from './components';

// Hooks
export { useApplications, useApplicationForm } from './hooks';

// Services
export { applicationService } from './services';

// Types
export type {
  Application,
  ApplicationFormData,
  ApplicationFilters,
  ApplicationStatus,
} from './types';

// Constants
export { APPLICATION_STATUS, APPLICATION_VALIDATION } from './constants';
```

### Step 9: Atualizar Imports Existentes (Copilot Agent)

**COMANDO**: Atualizar imports em arquivos que usam Applications:

```typescript
// ANTES (imports antigos)
import { useApplications } from '@/hooks/use-applications';
import { applicationService } from '@/services/application-service';
import type { Application } from '@/types/application';

// DEPOIS (imports da feature)
import { useApplications, applicationService, type Application } from '@/features/applications';
```

**Locais para atualizar**:

- Páginas em `src/app/`
- Outros components que usam Applications
- Tests que referenciam Applications

### Step 10: Validação da Migração (Copilot Agent)

**COMANDO**: Use ferramentas do VS Code para validação:

1. **Verificar Estrutura**: Use `list_dir` para confirmar criação
2. **Verificar Erros**: Use `get_errors` para identificar problemas
3. **Executar Build**: Use `run_in_terminal("pnpm build")` para validar
4. **Executar Testes**: Use `run_tests` para validar testes

```typescript
// Copilot Agent deve usar:
// 1. list_dir("src/features/applications") - Verificar estrutura
// 2. get_errors(filePaths) - Verificar problemas de compilação
// 3. run_in_terminal("pnpm build") - Validar build
// 4. grep_search("@/features/applications") - Verificar imports atualizados
// 5. Verificar no Problems panel do VS Code se há erros
```

### Step 11: Cleanup de Arquivos Antigos (Copilot Agent)

**COMANDO**: Remover arquivos antigos APENAS após validação completa:

```bash
# Remover APENAS após confirmação que tudo funciona
# src/hooks/use-applications.ts
# src/services/application-service.ts
# src/types/application.ts
# src/components/applications/ (diretório completo)
```

**APÓS validação automática**, fazer commit:

```bash
git add .
git commit -m "feat: migrate Applications domain to features architecture"
```

## Checklist de Finalização

### ✅ Estrutura da Feature (Copilot Agent)

- [ ] Diretório `src/features/applications/` criado
- [ ] Components migrados e funcionando
- [ ] Hooks migrados e funcionando
- [ ] Services migrados e funcionando
- [ ] Types migrados e disponíveis
- [ ] Constants criados e organizados

### ✅ Public API (Copilot Agent)

- [ ] `features/applications/index.ts` com exports limpos
- [ ] API pública bem definida e documentada
- [ ] Imports externos funcionando via @/features/applications

### ✅ Imports Atualizados (Copilot Agent)

- [ ] Páginas usando novo import path
- [ ] Components dependentes atualizados
- [ ] Tests atualizados para nova estrutura

### ✅ Validação Final (Copilot Agent)

- [ ] `get_errors` - Sem erros de compilação
- [ ] `run_in_terminal("pnpm build")` - Build successful
- [ ] `run_tests` - Testes passando
- [ ] Problems panel vazio no VS Code
- [ ] Funcionalidade preservada 100%
- [ ] Arquivos antigos removidos
- [ ] Alterações commitadas

### ✅ Impacto Esperado

- [ ] **Applications domain** completamente migrado para features
- [ ] **Padrão estabelecido** para migração dos demais domínios
- [ ] **Public API limpa** facilitando uso e manutenção
- [ ] **Imports organizados** usando @/features/applications
- [ ] **Zero breaking changes** na funcionalidade
- [ ] **Template funcional** para próximas migrações

## Próximo Passo

→ **Phase 04B-2: Environments Migration** - Aplicar padrões estabelecidos
