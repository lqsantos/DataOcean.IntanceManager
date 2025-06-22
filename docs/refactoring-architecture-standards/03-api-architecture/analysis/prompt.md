# Prompt: Análise API Architecture

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 03 - API Architecture (Analysis)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Objetivo**: Analisar arquitetura atual de APIs e identificar melhorias para padronização, tratamento de erros, cache e performance

## Pré-requisitos

- [ ] Phase 02 (Testing Framework) concluída e validada
- [ ] Projeto construindo sem erros
- [ ] API routes e services identificados

## Análise da Arquitetura API Atual

### 1. Mapeamento de API Routes

```bash
echo "🔍 Mapeando API routes existentes..."

# Identificar todas as API routes
find src/app/api -name "route.ts" -o -name "route.js" 2>/dev/null | head -20

# Se usar pages router
find pages/api -name "*.ts" -o -name "*.js" 2>/dev/null | head -20

# Listar estrutura das APIs
echo "Estrutura de APIs encontrada:"
tree src/app/api/ 2>/dev/null || tree pages/api/ 2>/dev/null || echo "Nenhuma API route encontrada"
```

### 2. Análise de Services

```bash
echo "🔍 Analisando services existentes..."

# Encontrar todos os services
find src/ -name "*service*" -type f | head -20

# Analisar padrões de implementação
echo "Services encontrados:"
ls -la src/services/ 2>/dev/null || echo "Diretório src/services não encontrado"

# Verificar padrões de imports e exports
grep -r "export.*Service\|export.*API" src/ --include="*.ts" --include="*.tsx" | head -10
```

### 3. Análise de Client HTTP

```bash
echo "🔍 Analisando clients HTTP..."

# Verificar uso de fetch, axios, ou outros clients
grep -r "fetch\|axios\|http" src/ --include="*.ts" --include="*.tsx" | wc -l

# Identificar padrões de chamadas API
grep -r "'/api/\|http://\|https://" src/ --include="*.ts" --include="*.tsx" | head -10

# Verificar configurações de HTTP client
grep -r "baseURL\|timeout\|interceptor" src/ --include="*.ts" --include="*.tsx" | head -5
```

### 4. Análise de Error Handling

```bash
echo "🔍 Analisando tratamento de erros..."

# Verificar padrões de error handling
grep -r "try.*catch\|\.catch\|error" src/ --include="*.ts" --include="*.tsx" | wc -l

# Identificar tipos de erro definidos
grep -r "Error\|Exception" src/types/ --include="*.ts" 2>/dev/null | head -10

# Verificar middleware de erro
grep -r "middleware\|errorHandler" src/ --include="*.ts" --include="*.tsx" | head -5
```

### 5. Análise de Cache e Performance

```bash
echo "🔍 Analisando cache e performance..."

# Verificar uso de cache (React Query, SWR, etc.)
grep -r "useQuery\|useMutation\|cache\|stale" src/ --include="*.ts" --include="*.tsx" | head -10

# Verificar otimizações de performance
grep -r "revalidate\|ISR\|SSG\|SSR" src/ --include="*.ts" --include="*.tsx" | head -5

# Identificar estratégias de loading
grep -r "loading\|pending\|isLoading" src/ --include="*.ts" --include="*.tsx" | wc -l
```

## Template de Análise

### API Routes Analysis

```markdown
## API Routes Inventory

### Existing Routes

[Listar todas as routes encontradas]

- GET /api/applications
- POST /api/applications
- PUT /api/applications/[id]
- DELETE /api/applications/[id]
- [... outras routes]

### Route Patterns

- **Naming Convention**: [consistent/inconsistent]
- **HTTP Methods**: [appropriate/needs improvement]
- **URL Structure**: [RESTful/needs standardization]
- **Parameter Handling**: [standardized/varies]

### Missing Patterns

- [ ] Consistent error responses
- [ ] Request/response validation
- [ ] Authentication middleware
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] OpenAPI documentation
```

### Services Analysis

```markdown
## Services Architecture

### Current Implementation

- **Pattern**: [Class-based/Function-based/Mixed]
- **HTTP Client**: [fetch/axios/custom]
- **Error Handling**: [consistent/inconsistent]
- **Type Safety**: [strong/partial/weak]

### Service Categories

1. **Application Service**: [exists/missing]
2. **Environment Service**: [exists/missing]
3. **Location Service**: [exists/missing]
4. **Authentication Service**: [exists/missing]
5. **Config Service**: [exists/missing]

### Code Quality

- **DRY Principle**: [followed/violated]
- **Single Responsibility**: [followed/needs improvement]
- **Testability**: [high/medium/low]
- **Documentation**: [complete/partial/missing]
```

### HTTP Client Analysis

```markdown
## HTTP Client Configuration

### Current Setup

- **Primary Client**: [fetch/axios/other]
- **Base Configuration**: [centralized/scattered]
- **Interceptors**: [implemented/missing]
- **Retry Logic**: [implemented/missing]

### Features Analysis

- **Request Interceptors**: [✅/❌]
- **Response Interceptors**: [✅/❌]
- **Error Interceptors**: [✅/❌]
- **Timeout Configuration**: [✅/❌]
- **Retry Mechanism**: [✅/❌]
- **Request Cancellation**: [✅/❌]

### Performance Features

- **Request Deduplication**: [✅/❌]
- **Response Caching**: [✅/❌]
- **Background Updates**: [✅/❌]
- **Optimistic Updates**: [✅/❌]
```

### Error Handling Analysis

```markdown
## Error Handling Strategy

### Current Implementation

- **Error Types**: [defined/missing]
- **Error Boundaries**: [implemented/missing]
- **Global Error Handler**: [exists/missing]
- **User Feedback**: [consistent/inconsistent]

### Error Categories

1. **Network Errors**: [handled/unhandled]
2. **Validation Errors**: [handled/unhandled]
3. **Authentication Errors**: [handled/unhandled]
4. **Authorization Errors**: [handled/unhandled]
5. **Server Errors**: [handled/unhandled]

### User Experience

- **Error Messages**: [user-friendly/technical]
- **Error Recovery**: [provided/missing]
- **Retry Options**: [available/missing]
- **Fallback Content**: [implemented/missing]
```

### Cache and Performance Analysis

```markdown
## Cache and Performance Strategy

### Current Implementation

- **Cache Library**: [React Query/SWR/Custom/None]
- **Cache Strategy**: [defined/ad-hoc]
- **Invalidation**: [automatic/manual]
- **Background Updates**: [enabled/disabled]

### Performance Metrics

- **API Response Time**: [fast/medium/slow]
- **Cache Hit Ratio**: [high/medium/low/unknown]
- **Bundle Size Impact**: [minimal/moderate/significant]
- **Memory Usage**: [optimized/needs improvement]

### Optimization Opportunities

- [ ] Request batching
- [ ] Response compression
- [ ] CDN usage
- [ ] Service worker caching
- [ ] Prefetching strategies
```

## Comandos de Análise Detalhada

### 1. API Routes Deep Dive

```bash
# Analisar cada API route individualmente
echo "=== API ROUTES ANALYSIS ==="

# Para cada route encontrada, analisar:
for route in $(find src/app/api -name "route.ts" 2>/dev/null); do
  echo "Route: $route"
  echo "Methods:"
  grep -o "export async function \w\+" "$route" 2>/dev/null
  echo "---"
done
```

### 2. Service Implementation Patterns

```bash
# Analisar padrões de implementação dos services
echo "=== SERVICES ANALYSIS ==="

# Verificar consistência entre services
for service in src/services/*.ts; do
  if [ -f "$service" ]; then
    echo "Service: $(basename $service)"
    echo "Exports:"
    grep "export" "$service" | head -3
    echo "Error handling:"
    grep -c "try\|catch\|throw" "$service"
    echo "---"
  fi
done
```

### 3. HTTP Client Usage Patterns

```bash
# Analisar uso do HTTP client
echo "=== HTTP CLIENT ANALYSIS ==="

echo "Fetch usage:"
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | wc -l

echo "Axios usage:"
grep -r "axios\." src/ --include="*.ts" --include="*.tsx" | wc -l

echo "Custom clients:"
grep -r "http\|Http" src/ --include="*.ts" --include="*.tsx" | grep -i client | head -5
```

### 4. Cache Strategy Analysis

```bash
# Analisar estratégias de cache
echo "=== CACHE ANALYSIS ==="

echo "React Query usage:"
grep -r "useQuery\|useMutation\|QueryClient" src/ --include="*.ts" --include="*.tsx" | wc -l

echo "SWR usage:"
grep -r "useSWR\|SWRConfig" src/ --include="*.ts" --include="*.tsx" | wc -l

echo "Manual caching:"
grep -r "localStorage\|sessionStorage\|cache" src/ --include="*.ts" --include="*.tsx" | wc -l
```

## Gap Analysis

### Identificar Lacunas Arquiteturais

```markdown
## Architectural Gaps Identified

### Critical Gaps (High Priority)

- [ ] **Centralized HTTP Client**: Missing unified client configuration
- [ ] **Error Handling Standards**: Inconsistent error handling patterns
- [ ] **Request/Response Validation**: Missing schema validation
- [ ] **API Documentation**: No OpenAPI/Swagger documentation

### Important Gaps (Medium Priority)

- [ ] **Cache Strategy**: No unified caching approach
- [ ] **Request Deduplication**: Multiple identical requests
- [ ] **Loading States**: Inconsistent loading management
- [ ] **Retry Logic**: Missing automatic retry for failed requests

### Nice-to-Have Gaps (Low Priority)

- [ ] **Request/Response Logging**: Missing development aids
- [ ] **Performance Monitoring**: No API performance tracking
- [ ] **Mock Data Integration**: Limited mock data support
- [ ] **API Versioning**: No versioning strategy
```

### Recomendar Stack Target

```markdown
## Recommended API Architecture Stack

### HTTP Client Layer

- **Primary**: Custom HTTP client wrapper around fetch
- **Features**: Interceptors, retry logic, timeout, deduplication
- **Fallback**: Axios for complex scenarios

### Cache Layer

- **Primary**: TanStack Query (React Query v5)
- **Features**: Background updates, optimistic updates, persistence
- **Fallback**: SWR for simple scenarios

### Validation Layer

- **Request/Response**: Zod schemas
- **Runtime validation**: Type-safe API contracts
- **Error handling**: Structured error responses

### Development Tools

- **API Documentation**: OpenAPI + Swagger UI
- **Mock Data**: MSW integration
- **Performance**: React Query DevTools
```

## Critérios de Avaliação

### Arquitetura Atual

- **Consistência**: [1-5] - Padrões consistentes entre services
- **Manutenibilidade**: [1-5] - Facilidade de manutenção e extensão
- **Performance**: [1-5] - Velocidade e eficiência das APIs
- **Error Handling**: [1-5] - Robustez no tratamento de erros
- **Developer Experience**: [1-5] - Facilidade de desenvolvimento

### Gaps Prioritários

1. **[Gap Name]** - [Impacto] - [Esforço de implementação]
2. **[Gap Name]** - [Impacto] - [Esforço de implementação]
3. **[Gap Name]** - [Impacto] - [Esforço de implementação]

## Próximos Passos

Após completar esta análise:

1. Documentar todos os findings em `results.md`
2. Priorizar gaps por impacto vs esforço
3. Proceder para `implementation/prompt.md`
4. Implementar melhorias incrementalmente
