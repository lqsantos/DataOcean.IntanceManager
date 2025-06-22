# Prompt: Análise de Otimização de Hooks

## Objetivo

Analisar todos os hooks customizados existentes e identificar oportunidades de otimização, padronização e reutilização.

## Tarefas de Análise

### 1. Mapear Hooks Customizados Existentes

```bash
# Identificar todos os hooks customizados
find src/hooks/ -name "*.ts" -o -name "*.tsx" 2>/dev/null || echo "Verificar estrutura"

# Buscar hooks em outros diretórios
grep -r "export.*use[A-Z]" src/ --include="*.ts" --include="*.tsx"

# Listar hooks existentes
ls -la src/hooks/ 2>/dev/null || echo "Hooks não encontrados em src/hooks/"
```

### 2. Analisar Padrões de Implementação

```bash
# Verificar uso de React hooks
grep -r "useState\|useEffect\|useMemo\|useCallback" src/hooks/ --include="*.ts" --include="*.tsx"

# Identificar hooks que fazem fetch de dados
grep -r "fetch\|axios\|api" src/hooks/ --include="*.ts" --include="*.tsx"

# Verificar se há hooks similares
grep -r "use.*Application\|use.*Environment\|use.*Location" src/ --include="*.ts" --include="*.tsx"
```

### 3. Identificar Oportunidades de Memoização

```bash
# Hooks sem memoização adequada
grep -l "useState\|useEffect" src/hooks/*.ts 2>/dev/null | xargs grep -L "useMemo\|useCallback"

# Verificar dependencies arrays
grep -r "useEffect.*\[\]" src/hooks/ --include="*.ts"
grep -r "useEffect.*\[.*\]" src/hooks/ --include="*.ts"
```

### 4. Analisar Performance

```bash
# Hooks que podem ter problemas de performance
grep -r "useEffect.*\[" src/hooks/ --include="*.ts" | grep -v "// eslint-disable"

# Verificar re-renderizações desnecessárias
grep -r "console.log\|console.warn" src/hooks/ --include="*.ts"
```

### 5. Verificar Consistência de Interfaces

```bash
# Padrões de retorno dos hooks
grep -r "return {" src/hooks/ --include="*.ts" -A5

# Verificar tipagem dos hooks
grep -r ": {" src/hooks/ --include="*.ts"
grep -r "interface.*Hook" src/hooks/ --include="*.ts"
```

### 6. Identificar Lógica Duplicada

```bash
# Padrões similares entre hooks
grep -r "try.*catch" src/hooks/ --include="*.ts"
grep -r "loading.*setLoading" src/hooks/ --include="*.ts"
grep -r "error.*setError" src/hooks/ --include="*.ts"
```

## Resultado Esperado

Documente em `results.md`:

### 1. Inventário de Hooks

- Lista completa de hooks customizados
- Propósito e responsabilidade de cada hook
- Dependências e relacionamentos

### 2. Problemas de Performance Identificados

- Hooks sem memoização adequada
- Dependencies arrays problemáticas
- Re-renderizações desnecessárias

### 3. Oportunidades de Padronização

- Interfaces inconsistentes
- Padrões de error handling diferentes
- Lógica duplicada entre hooks similares

### 4. Otimizações Propostas

```typescript
// Exemplo de hook otimizado
export function useOptimizedHook(params: Params) {
  const memoizedValue = useMemo(() => {
    // computação pesada
  }, [dependencies]);

  const stableCallback = useCallback(
    (arg: Type) => {
      // lógica do callback
    },
    [dependencies]
  );

  return {
    value: memoizedValue,
    action: stableCallback,
    // interface consistente
  };
}
```

### 5. Hooks Candidatos para Refatoração

- **Alta prioridade**: Hooks com problemas de performance
- **Média prioridade**: Hooks com interfaces inconsistentes
- **Baixa prioridade**: Hooks funcionais mas não otimizados

## Próximo Passo

Após análise completa, execute `../implementation/prompt.md`

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
