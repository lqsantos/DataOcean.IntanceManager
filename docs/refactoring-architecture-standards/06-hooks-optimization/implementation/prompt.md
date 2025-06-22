# Prompt: Implementação da Otimização de Hooks

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Otimizar hooks customizados para performance e consistência  
**Base**: Resultados da análise em `../analysis/results.md`

## Objetivo da Implementação

Otimizar e padronizar todos os hooks customizados, garantindo performance adequada, interfaces consistentes e eliminando lógica duplicada.

## Pré-requisitos

- [ ] Análise completa executada (`../analysis/results.md` preenchido)
- [ ] Hooks com problemas identificados
- [ ] Oportunidades de otimização mapeadas

## Tarefas de Implementação

### 1. Aplicar Memoização Adequada

**Exemplo de hook otimizado baseado no projeto:**

```typescript
// ❌ ANTES: Hook sem memoização (exemplo use-applications.ts)
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []); // ❌ fetchApplications não é estável

  return { applications, loading, refetch: fetchApplications }; // ❌ Objeto recriado a cada render
}

// ✅ DEPOIS: Hook otimizado com memoização
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
      setError(errorMessage);
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Estável - applicationService.getAll é assumido como estável

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]); // Dependencies corretas

  const refetch = useCallback(() => {
    return fetchApplications();
  }, [fetchApplications]);

  // Retorno memoizado para evitar re-renders desnecessários
  return useMemo(
    () => ({
      applications,
      loading,
      error,
      refetch,
    }),
    [applications, loading, error, refetch]
  );
}
```

### 2. Padronizar Interfaces de Retorno

**Criar types consistentes:**

```typescript
// src/hooks/types.ts (criar se não existir)
export interface UseDataHookResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseSingleDataHookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseMutationHookResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}
```

**Aplicar interfaces nos hooks:**

```typescript
// src/hooks/use-applications.ts
import type { UseDataHookResult } from './types';
import type { Application } from '@/types/application';

export function useApplications(): UseDataHookResult<Application> {
  // implementação otimizada acima
}

// src/hooks/use-application.ts
import type { UseSingleDataHookResult } from './types';

export function useApplication(id: string): UseSingleDataHookResult<Application> {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getById(id);
      setApplication(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const refetch = useCallback(() => {
    return fetchApplication();
  }, [fetchApplication]);

  return useMemo(
    () => ({
      data: application,
      loading,
      error,
      refetch,
    }),
    [application, loading, error, refetch]
  );
}
```

### 3. Extrair Lógica Comum

**Criar hook base para operações async:**

```typescript
// src/hooks/use-async-operation.ts
export function useAsyncOperation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return useMemo(
    () => ({
      loading,
      error,
      execute,
      reset,
    }),
    [loading, error, execute, reset]
  );
}

// Usar no hook específico
export function useApplications(): UseDataHookResult<Application> {
  const [applications, setApplications] = useState<Application[]>([]);
  const { loading, error, execute } = useAsyncOperation<Application[]>();

  const fetchApplications = useCallback(async () => {
    const data = await execute(() => applicationService.getAll());
    setApplications(data);
  }, [execute]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const refetch = useCallback(() => {
    return fetchApplications();
  }, [fetchApplications]);

  return useMemo(
    () => ({
      data: applications,
      loading,
      error,
      refetch,
    }),
    [applications, loading, error, refetch]
  );
}
```

### 4. Otimizar Hooks de Mutação

**Para operações CRUD:**

```typescript
// src/hooks/use-application-mutations.ts
import type { UseMutationHookResult } from './types';
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '@/types/application';

export function useCreateApplication(): UseMutationHookResult<Application, CreateApplicationDto> {
  const { loading, error, execute, reset } = useAsyncOperation<Application>();

  const mutate = useCallback(
    async (data: CreateApplicationDto) => {
      return execute(() => applicationService.create(data));
    },
    [execute]
  );

  return useMemo(
    () => ({
      mutate,
      loading,
      error,
      reset,
    }),
    [mutate, loading, error, reset]
  );
}

export function useUpdateApplication(): UseMutationHookResult<
  Application,
  { id: string; data: UpdateApplicationDto }
> {
  const { loading, error, execute, reset } = useAsyncOperation<Application>();

  const mutate = useCallback(
    async ({ id, data }: { id: string; data: UpdateApplicationDto }) => {
      return execute(() => applicationService.update(id, data));
    },
    [execute]
  );

  return useMemo(
    () => ({
      mutate,
      loading,
      error,
      reset,
    }),
    [mutate, loading, error, reset]
  );
}
```

### 5. Aplicar Pattern Similar para Environments e Locations

**Replicar otimizações para:**

- `src/hooks/use-environments.ts`
- `src/hooks/use-environment.ts`
- `src/hooks/use-locations.ts`
- `src/hooks/use-location.ts`

### 6. Documentar Hooks Complexos

````typescript
/**
 * Hook for managing application data with optimized performance
 *
 * Features:
 * - Automatic data fetching on mount
 * - Memoized return value to prevent unnecessary re-renders
 * - Proper error handling and loading states
 * - Stable refetch function
 *
 * @returns Object containing:
 * - data: Array of applications
 * - loading: Whether data is being fetched
 * - error: Error message if operation failed (null if no error)
 * - refetch: Stable function to refetch all applications
 *
 * @example
 * ```tsx
 * function ApplicationsList() {
 *   const { data: applications, loading, error, refetch } = useApplications();
 *
 *   if (loading) return <div>Loading applications...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {applications.map(app => (
 *         <div key={app.id}>{app.name}</div>
 *       ))}
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useApplications(): UseDataHookResult<Application> {
  // implementação
}
````

### 7. Criar Barrel Export Otimizado

**src/hooks/index.ts:**

```typescript
// Data hooks
export { useApplications } from './use-applications';
export { useApplication } from './use-application';
export { useEnvironments } from './use-environments';
export { useEnvironment } from './use-environment';
export { useLocations } from './use-locations';
export { useLocation } from './use-location';

// Mutation hooks
export { useCreateApplication, useUpdateApplication } from './use-application-mutations';
export { useCreateEnvironment, useUpdateEnvironment } from './use-environment-mutations';
export { useCreateLocation, useUpdateLocation } from './use-location-mutations';

// Base hooks
export { useAsyncOperation } from './use-async-operation';

// Types
export type { UseDataHookResult, UseSingleDataHookResult, UseMutationHookResult } from './types';
```

## Checklist de Implementação

- [ ] Memoização aplicada adequadamente (useMemo, useCallback)
- [ ] Dependencies arrays otimizadas e corretas
- [ ] Interfaces de retorno consistentes
- [ ] Lógica comum extraída para hooks base
- [ ] Error handling padronizado em todos os hooks
- [ ] Documentação JSDoc completa para hooks complexos
- [ ] Performance otimizada (retornos memoizados)
- [ ] Barrel export atualizado

## Validação Rápida

```bash
# Verificar se hooks seguem padrões de memoização
grep -r "useCallback\|useMemo" src/hooks/ --include="*.ts" | wc -l

# Verificar dependencies arrays
grep -r "useEffect.*\[" src/hooks/ --include="*.ts"

# Testar build e types
npm run build
npm run type-check

# Testar funcionalidade básica
npm run dev
# Verificar se hooks funcionam na interface
```

## Próximo Passo

Após implementação, execute `../validation/prompt.md` para validação final incluindo testes de performance.
