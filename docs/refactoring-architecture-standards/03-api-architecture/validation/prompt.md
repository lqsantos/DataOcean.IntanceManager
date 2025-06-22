# Prompt: Validação API Architecture

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 03 - API Architecture (Validation)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Implementação concluída conforme `../implementation/prompt.md`

## Objetivo da Validação

Verificar que a arquitetura de APIs foi implementada corretamente, oferece performance adequada, tratamento de erros robusto e experiência de desenvolvimento excelente.

## Pré-requisitos

- [ ] Implementation phase concluída
- [ ] HTTP client customizado implementado
- [ ] TanStack Query configurado
- [ ] Services refatorados
- [ ] Error boundaries implementados

## Validação Técnica

### 1. HTTP Client Validation

```bash
# Verificar se HTTP client está funcionando
echo "🔍 Validando HTTP client..."

# Testar se o build inclui a nova arquitetura
npm run type-check

if [ $? -eq 0 ]; then
  echo "✅ HTTP client types são válidos"
else
  echo "❌ Problemas de tipos no HTTP client"
fi

# Verificar se interceptors estão funcionando
echo "Testando interceptors..."
# [Verificação manual necessária - iniciar dev server e testar]
```

### 2. React Query Integration

```bash
# Verificar se React Query está configurado
echo "🔍 Validando React Query..."

# Verificar dependências
npm list @tanstack/react-query @tanstack/react-query-devtools || echo "❌ React Query dependencies missing"

# Verificar se QueryProvider está no layout
grep -r "QueryProvider" src/app/layout.tsx && echo "✅ QueryProvider configurado" || echo "❌ QueryProvider não encontrado"

# Build para verificar se tudo compila
npm run build

if [ $? -eq 0 ]; then
  echo "✅ React Query integração successful"
else
  echo "❌ React Query integration issues"
fi
```

### 3. Service Layer Validation

```bash
# Verificar se services foram refatorados
echo "🔍 Validando service layer..."

# Verificar se BaseService existe
if [ -f "src/services/base-service.ts" ]; then
  echo "✅ BaseService implementado"
else
  echo "❌ BaseService não encontrado"
fi

# Verificar se schemas Zod estão definidos
grep -r "z\." src/services/ && echo "✅ Zod schemas encontrados" || echo "❌ Zod schemas missing"

# Verificar se services estendem BaseService
grep -r "extends BaseService" src/services/ && echo "✅ Services usando BaseService" || echo "⚠️ Services podem não estar usando BaseService"
```

### 4. Error Handling Validation

```bash
# Verificar error boundary
echo "🔍 Validando error handling..."

# Verificar se ErrorBoundary existe
if [ -f "src/components/error-boundary.tsx" ]; then
  echo "✅ ErrorBoundary implementado"
else
  echo "❌ ErrorBoundary não encontrado"
fi

# Verificar se custom errors estão definidos
grep -r "class.*Error extends" src/lib/ && echo "✅ Custom error classes encontradas" || echo "❌ Custom errors missing"

# Verificar error interceptors
grep -r "errorInterceptor\|addErrorInterceptor" src/lib/ && echo "✅ Error interceptors configurados" || echo "❌ Error interceptors missing"
```

### 5. Runtime Validation

```bash
# Testar funcionamento em runtime
echo "🔍 Validando runtime behavior..."

# Start dev server para testes
npm run dev &
DEV_PID=$!

# Aguardar startup
sleep 15

# Verificar se dev server está rodando
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Dev server iniciado com sucesso"

  # Testar se React Query DevTools está carregado (verificação manual necessária)
  echo "ℹ️  Verifique manualmente se React Query DevTools aparecem no browser"

  # Testar API endpoint básico
  api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs || echo "000")
  if [ "$api_response" = "200" ]; then
    echo "✅ API docs endpoint responding"
  else
    echo "⚠️ API docs endpoint não está respondendo (status: $api_response)"
  fi

else
  echo "❌ Dev server failed to start"
fi

# Cleanup
kill $DEV_PID 2>/dev/null
```

### 6. Hook Validation

```bash
# Verificar se hooks foram implementados
echo "🔍 Validando custom hooks..."

# Verificar se hooks seguem padrão correto
hook_files=$(find src/hooks -name "use-*.ts" 2>/dev/null | wc -l)
echo "Hooks encontrados: $hook_files"

# Verificar se hooks usam React Query
grep -r "useQuery\|useMutation" src/hooks/ && echo "✅ Hooks usando React Query" || echo "❌ Hooks não estão usando React Query"

# Verificar query keys pattern
grep -r "queryKey.*\[\]" src/hooks/ && echo "✅ Query keys pattern encontrado" || echo "⚠️ Query keys pattern pode estar inconsistente"
```

## Validação de Performance

### 7. Cache Strategy Validation

```bash
# Verificar configuração de cache
echo "🔍 Validando cache strategy..."

# Verificar se staleTime e gcTime estão configurados
grep -r "staleTime\|gcTime" src/lib/query-client.ts && echo "✅ Cache timing configurado" || echo "❌ Cache timing não configurado"

# Verificar retry logic
grep -r "retry.*failureCount" src/lib/query-client.ts && echo "✅ Retry logic configurado" || echo "❌ Retry logic missing"

# Verificar invalidation patterns
grep -r "invalidateQueries" src/hooks/ && echo "✅ Cache invalidation implementado" || echo "❌ Cache invalidation missing"
```

### 8. Request Deduplication Test

```bash
# Teste de performance para request deduplication
echo "🔍 Testando request deduplication..."

# Este teste requer verificação manual:
echo "Para verificar request deduplication:"
echo "1. Inicie o dev server: npm run dev"
echo "2. Abra as DevTools do browser"
echo "3. Navegue para uma página que faz múltiplas chamadas simultâneas"
echo "4. Verifique na aba Network se requests duplicados são deduplicated"
echo "5. Abra React Query DevTools para ver o status das queries"
```

### 9. Error Recovery Validation

```bash
# Testar recovery de erros
echo "🔍 Validando error recovery..."

# Verificar se retry está configurado
grep -r "retry.*attempt\|retryDelay" src/lib/ && echo "✅ Retry mechanism configurado" || echo "❌ Retry missing"

# Verificar timeout configuration
grep -r "timeout\|TimeoutError" src/lib/ && echo "✅ Timeout handling configurado" || echo "❌ Timeout handling missing"

# Manual test needed for error scenarios
echo "Para testar error recovery:"
echo "1. Desconecte a internet"
echo "2. Tente fazer uma requisição"
echo "3. Reconecte a internet"
echo "4. Verifique se a requisição é repetida automaticamente"
```

## Validação Manual

### 10. Developer Experience

```markdown
# Manual Validation Checklist

## React Query DevTools

- [ ] Start `npm run dev`
- [ ] Navigate to any page with data fetching
- [ ] Verify React Query DevTools appear (bottom left toggle)
- [ ] Check query states (fresh, stale, loading)
- [ ] Verify cache inspector shows cached data

## API Integration

- [ ] Test successful API calls
- [ ] Test failed API calls (simulate network error)
- [ ] Verify error messages are user-friendly
- [ ] Check retry behavior on network failure
- [ ] Verify loading states work correctly

## Error Boundary

- [ ] Intentionally cause a component error
- [ ] Verify error boundary catches error
- [ ] Check error message is displayed
- [ ] Test retry functionality
- [ ] Verify error logging in console

## Performance

- [ ] Check Network tab for request deduplication
- [ ] Verify caching - same requests return cached data
- [ ] Test background updates (stale-while-revalidate)
- [ ] Check loading performance with React Profiler
```

### 11. API Documentation

```bash
# Verificar documentação da API
echo "🔍 Validando API documentation..."

# Start dev server se não estiver rodando
if ! curl -s http://localhost:3000 > /dev/null; then
  npm run dev &
  DEV_PID=$!
  sleep 15
fi

# Testar endpoint de documentação
docs_response=$(curl -s http://localhost:3000/api/docs)
if echo "$docs_response" | grep -q "openapi"; then
  echo "✅ OpenAPI specs disponíveis"
else
  echo "❌ OpenAPI specs não encontradas"
fi

# Cleanup if we started the server
if [ ! -z "$DEV_PID" ]; then
  kill $DEV_PID 2>/dev/null
fi
```

### 12. Type Safety Validation

```bash
# Verificar type safety
echo "🔍 Validando type safety..."

# Strict TypeScript checking
npm run type-check

if [ $? -eq 0 ]; then
  echo "✅ Type checking passou"
else
  echo "❌ Problemas de tipos encontrados"
  npm run type-check 2>&1 | head -20
fi

# Verificar se há any types (code smell)
any_count=$(grep -r ": any\|as any" src/ --include="*.ts" --include="*.tsx" | wc -l)
echo "Uso de 'any' encontrado: $any_count instances"

if [ "$any_count" -lt 5 ]; then
  echo "✅ Uso mínimo de 'any' types"
else
  echo "⚠️ Muitos 'any' types - considere melhorar tipagem"
fi
```

## Critérios de Aceitação

### ✅ Critérios Obrigatórios (MUST PASS)

- [ ] HTTP client funciona corretamente
- [ ] React Query integrado e funcional
- [ ] Services refatorados para nova arquitetura
- [ ] Error handling robusto implementado
- [ ] Type checking passa sem erros
- [ ] Build succeed com nova arquitetura
- [ ] Dev server inicia sem problemas

### ✅ Critérios Desejáveis (SHOULD PASS)

- [ ] React Query DevTools funcionam
- [ ] Cache strategy funciona conforme esperado
- [ ] Request deduplication verificado
- [ ] Error recovery funciona automaticamente
- [ ] API documentation acessível
- [ ] Performance igual ou melhor que antes

### ✅ Critérios Opcionais (NICE TO HAVE)

- [ ] Bundle size não aumentou significativamente
- [ ] Loading states melhorados
- [ ] User experience aprimorada
- [ ] Developer experience excelente

## Ações Corretivas

### Se Validação Falhar:

#### HTTP Client Issues:

```bash
# Debug HTTP client
# Verificar se interceptors estão sendo chamados
# Testar diferentes cenários de erro
# Verificar timeout configuration

# Common fixes:
# - Ajustar timeout values
# - Fix interceptor logic
# - Improve error handling
```

#### React Query Issues:

```bash
# Debug React Query
npm run dev
# → Abrir DevTools e verificar queries
# → Verificar se cache está funcionando
# → Testar invalidation

# Common fixes:
# - Ajustar query keys
# - Fix stale time configuration
# - Improve error handling in hooks
```

#### Service Issues:

```bash
# Debug services
# Verificar schema validation
# Testar CRUD operations
# Verificar type safety

# Common fixes:
# - Ajustar Zod schemas
# - Fix service method signatures
# - Improve error handling
```

#### Performance Issues:

```bash
# Profile performance
npm run dev
# → Use React Profiler
# → Check Network tab
# → Monitor memory usage

# Common fixes:
# - Optimize query configurations
# - Reduce unnecessary re-renders
# - Improve cache efficiency
```

## Documentação de Resultados

### Criar Validation Summary:

```markdown
# API Architecture Validation Results

## ✅ Status: [PASSED/FAILED/PARTIALLY_PASSED]

## Technical Validation

- HTTP Client: [✅/❌]
- React Query: [✅/❌]
- Service Layer: [✅/❌]
- Error Handling: [✅/❌]
- Type Safety: [✅/❌]
- Documentation: [✅/❌]

## Performance Metrics

- Request deduplication: [✅/❌]
- Cache hit ratio: [High/Medium/Low]
- Error recovery time: [X]ms
- Bundle size impact: [+X/-X KB]

## Developer Experience

- React Query DevTools: [✅/❌]
- API documentation: [✅/❌]
- Type inference: [Excellent/Good/Needs improvement]
- Error messages: [Clear/Adequate/Confusing]

## API Coverage

- Applications API: [✅/❌]
- Environments API: [✅/❌]
- Locations API: [✅/❌]
- Authentication: [✅/❌]

## Issues Found & Resolved

[List any issues discovered during validation and how they were fixed]

## Performance Comparison

- Before: [X requests/sec, Y error rate]
- After: [X requests/sec, Y error rate]
- Improvement: [X% faster, Y% fewer errors]

## Recommendation

[✅ PROCEED to Phase 04 / ⚠️ ADDRESS ISSUES / ❌ NEEDS REWORK]

## Next Steps

- [ ] Address any performance issues
- [ ] Complete migration of remaining services
- [ ] Train team on new API patterns
- [ ] Begin Phase 04 - Features Architecture
```

## Finalização da Phase 03

### Se Validação for Successful:

```bash
# Commit final da phase
git add .
git commit -m "Phase 03 complete: API architecture validated

- Custom HTTP client with interceptors and retry logic
- TanStack Query for state management and caching
- Type-safe service layer with Zod validation
- Comprehensive error handling and recovery
- React Query DevTools for debugging
- OpenAPI documentation
- Ready for Phase 04 - Features Architecture"

# Tag da milestone
git tag -a phase-03-complete -m "API architecture implementation completed successfully"
```

### Preparar Phase 04:

```bash
# Verificar que estamos prontos para próxima fase
echo "✅ Phase 03 - API Architecture: COMPLETE"
echo "→  Ready for Phase 04 - Features Architecture"
echo ""
echo "Next command:"
echo "cd docs/refactoring-architecture-standards/04-features-architecture/analysis/"
echo "# Use prompt.md to analyze current features organization"
```

A arquitetura de APIs está agora robusta, performática e pronta para suportar uma arquitetura de features escalável.
