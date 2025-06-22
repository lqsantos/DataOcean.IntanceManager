# Phase 04: Features Architecture

## Objetivo

Organizar o código por features/domínios ao invés de tipos técnicos, criando uma arquitetura escalável e mantível baseada em contextos de negócio.

## Análise da Situação Atual

### 1. Verificar Organização Atual

```bash
# Verificar estrutura atual
echo "Estrutura atual:"
tree src/ -d -L 2

# Verificar domínios/features identificados
echo "Possíveis features/domínios:"
ls src/components/ 2>/dev/null | head -10
ls src/pages/ 2>/dev/null | head -10
find src/app -type d -name "(\*)" 2>/dev/null | head -10
```

### 2. Identificar Features de Negócio

```bash
# Analisar rotas para identificar features
grep -r "router\|href\|to=" src/ --include="*.tsx" | grep -E "/(applications|environments|locations|blueprints)" | head -10

# Analisar components por domínio
find src/components -name "*application*" -o -name "*environment*" -o -name "*location*" | head -10
```

### 3. Identificar Gaps

- [ ] **Organização por feature**: Código espalhado por tipo técnico
- [ ] **Shared components**: Misturados com feature-specific
- [ ] **Business logic**: Espalhada entre components e services
- [ ] **Domain boundaries**: Não definidas claramente

## Implementação

### Step 1: Definir Features/Domínios

Baseado na análise, identificar as features principais:

```
Features identificadas:
├── applications/     # Gestão de aplicações
├── environments/     # Gestão de ambientes
├── locations/        # Gestão de localizações
├── blueprints/       # Templates e blueprints
├── auth/            # Autenticação
└── dashboard/       # Dashboard principal
```

### Step 2: Criar Nova Estrutura

```bash
# Criar estrutura de features
mkdir -p src/features/{applications,environments,locations,blueprints,auth,dashboard}

# Para cada feature, criar subdiretórios
for feature in applications environments locations blueprints auth dashboard; do
  mkdir -p src/features/$feature/{components,hooks,services,types,utils}
done

# Manter estrutura shared
mkdir -p src/shared/{components,hooks,utils,types}
```

### Step 3: Nova Estrutura Target

```
src/
├── features/
│   ├── applications/
│   │   ├── components/           # Components específicos de aplicações
│   │   │   ├── application-card.tsx
│   │   │   ├── application-form.tsx
│   │   │   ├── application-list.tsx
│   │   │   └── index.ts
│   │   ├── hooks/               # Hooks específicos
│   │   │   ├── use-applications.ts
│   │   │   ├── use-application-form.ts
│   │   │   └── index.ts
│   │   ├── services/            # Business logic
│   │   │   ├── application-service.ts
│   │   │   ├── application-validation.ts
│   │   │   └── index.ts
│   │   ├── types/               # Types específicos
│   │   │   ├── application.ts
│   │   │   └── index.ts
│   │   ├── utils/               # Utils específicos
│   │   │   ├── application-utils.ts
│   │   │   └── index.ts
│   │   └── index.ts             # Feature export
│   ├── environments/
│   ├── locations/
│   └── ...
├── shared/
│   ├── components/              # Components reutilizáveis
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Layout components
│   │   ├── forms/               # Form components
│   │   └── index.ts
│   ├── hooks/                   # Hooks reutilizáveis
│   ├── utils/                   # Utils globais
│   └── types/                   # Types globais
├── lib/                         # Configurações e setup
├── config/                      # Configurações
└── constants/                   # Constantes globais
```

### Step 4: Migração de Applications Feature

```bash
# Migrar components de applications
echo "Migrando components de applications..."

# Identificar components relacionados a applications
find src/components -name "*application*" -type f

# Mover para feature (exemplo)
# mv src/components/applications/* src/features/applications/components/
```

```typescript
// src/features/applications/components/application-card.tsx
import { Application } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface ApplicationCardProps {
  application: Application;
  onEdit?: (application: Application) => void;
  onDelete?: (id: string) => void;
}

export function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{application.name}</CardTitle>
        <Badge variant={application.status === 'active' ? 'default' : 'secondary'}>
          {application.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{application.description}</p>
        <div className="mt-4 flex gap-2">
          {onEdit && (
            <button onClick={() => onEdit(application)} className="btn-primary">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(application.id)} className="btn-danger">
              Delete
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
// src/features/applications/components/index.ts
export { ApplicationCard } from './application-card';
export { ApplicationForm } from './application-form';
export { ApplicationList } from './application-list';
export { ApplicationDetails } from './application-details';
```

### Step 5: Migrar Hooks

```typescript
// src/features/applications/hooks/use-applications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services';
import type { Application, CreateApplicationRequest } from '../types';

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: string) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

export function useApplications(filters?: Record<string, string>) {
  return useQuery({
    queryKey: applicationKeys.list(JSON.stringify(filters || {})),
    queryFn: () => applicationService.getAll(filters),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationService.getById(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      applicationService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
```

```typescript
// src/features/applications/hooks/index.ts
export * from './use-applications';
export * from './use-application-form';
export * from './use-application-deployment';
```

### Step 6: Migrar Services

```typescript
// src/features/applications/services/application-service.ts
import { BaseService } from '@/lib/base-service';
import { applicationSchemas } from './schemas';
import type { Application, CreateApplicationRequest, UpdateApplicationRequest } from '../types';

class ApplicationService extends BaseService<Application> {
  protected baseEndpoint = '/api/applications';
  protected schemas = applicationSchemas;

  // Business-specific methods
  async deploy(id: string) {
    const response = await this.httpClient.post(`${this.baseEndpoint}/${id}/deploy`);
    return this.validate(response, this.schemas.single);
  }

  async getByEnvironment(environmentId: string) {
    const response = await this.httpClient.get(`${this.baseEndpoint}`, {
      environmentId,
    });
    return this.validate(response, this.schemas.list);
  }

  async getDeploymentHistory(id: string) {
    const response = await this.httpClient.get(`${this.baseEndpoint}/${id}/deployments`);
    return this.validate(response, this.schemas.deployments);
  }
}

export const applicationService = new ApplicationService();
```

```typescript
// src/features/applications/services/index.ts
export { applicationService } from './application-service';
export * from './schemas';
export * from './validation';
```

### Step 7: Definir Types

```typescript
// src/features/applications/types/application.ts
import { BaseEntity } from '@/shared/types';

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
  repository?: string;
  branch?: string;
  buildCommand?: string;
  startCommand?: string;
  environmentVariables?: Record<string, string>;
}

export interface ApplicationMetadata {
  version?: string;
  tags?: string[];
  owner?: string;
  lastDeployment?: Date;
  deploymentHistory?: Deployment[];
}

export interface Deployment {
  id: string;
  version: string;
  status: 'pending' | 'success' | 'failed';
  deployedAt: Date;
  deployedBy: string;
}

export type CreateApplicationRequest = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateApplicationRequest = Partial<CreateApplicationRequest>;
```

```typescript
// src/features/applications/types/index.ts
export * from './application';
```

### Step 8: Feature Index

```typescript
// src/features/applications/index.ts
// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types
export * from './types';

// Utils
export * from './utils';
```

### Step 9: Atualizar Imports

```bash
# Script para atualizar imports
echo "Atualizando imports para usar features..."

# Atualizar imports de components
find src/app -name "*.tsx" | xargs sed -i '' 's|@/components/applications|@/features/applications|g'

# Atualizar imports de hooks
find src/app -name "*.tsx" | xargs sed -i '' 's|@/hooks/use-applications|@/features/applications|g'

# Atualizar imports de services
find src/app -name "*.tsx" | xargs sed -i '' 's|@/services/application|@/features/applications|g'
```

### Step 10: Shared Components

```typescript
// src/shared/components/ui/data-table.tsx
// Component genérico para tabelas que pode ser usado por qualquer feature
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  // Implementação genérica de tabela
}
```

```typescript
// src/shared/hooks/use-pagination.ts
// Hook genérico para paginação
export function usePagination(totalItems: number, pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    nextPage: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
    prevPage: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
  };
}
```

### Step 11: Atualizar TSConfig

```json
// tsconfig.json - adicionar paths para features
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

## Checklist de Finalização

### Estrutura de Features

- [ ] Features principais identificadas e criadas
- [ ] Subdiretórios criados para cada feature
- [ ] Shared vs feature-specific bem definido
- [ ] Barrel exports implementados

### Migração Completa

- [ ] Components migrados para features
- [ ] Hooks migrados e organizados
- [ ] Services agrupados por domínio
- [ ] Types específicos definidos

### Imports e Paths

- [ ] TSConfig paths atualizados
- [ ] Imports atualizados para nova estrutura
- [ ] Barrel exports funcionando
- [ ] IDE intellisense funcionando

### Shared Layer

- [ ] Components UI genéricos identificados
- [ ] Hooks reutilizáveis separados
- [ ] Utils globais organizados
- [ ] Types base definidos

### Funcionalidade

- [ ] `npm run type-check` - Types válidos
- [ ] `npm run build` - Build successful
- [ ] `npm run test` - Tests passam
- [ ] App funciona normalmente
- [ ] Features independentes funcionais

### Benefícios Alcançados

- [ ] **Discoverability**: Fácil encontrar código relacionado
- [ ] **Maintainability**: Mudanças isoladas por feature
- [ ] **Scalability**: Novas features seguem padrão consistente
- [ ] **Team collaboration**: Diferentes times podem trabalhar em features separadas

## Próximo Passo

→ **Phase 05: State & i18n Architecture**
