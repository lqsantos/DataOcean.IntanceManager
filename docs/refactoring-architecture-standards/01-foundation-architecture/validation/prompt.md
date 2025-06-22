# Prompt: Validação Foundation Architecture

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Validar implementação da foundation architecture com config/ e constants centralizados  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Pré-requisitos

- [ ] Implementação completa executada
- [ ] Build sem erros
- [ ] Estrutura `src/config/` criada

## Tarefas de Validação

### 1. Verificação Estrutural

#### Verificar se estrutura foi criada corretamente:

```bash
# Verificar estrutura config/
ls -la src/config/
# Deve mostrar: api.ts, constants.ts, env.ts, index.ts

# Verificar conteúdo dos arquivos
wc -l src/config/*.ts
# Cada arquivo deve ter conteúdo substancial

# Verificar exports
grep "export" src/config/index.ts
```

### 2. Verificação de Dependências

```bash
# Verificar se Zod foi instalado
npm list zod

# Verificar se types estão corretos
npm run type-check

# Build completo
npm run build
```

### 3. Validação Environment Variables

```bash
# Testar env validation
node -e "
try {
  const { env } = require('./src/config/env.ts');
  console.log('✅ Environment validation working');
  console.log('NODE_ENV:', env.NODE_ENV);
} catch (error) {
  console.log('❌ Environment validation failed:', error.message);
}
"

# Verificar se process.env ainda é usado diretamente
grep -r "process\.env" src/ --include="*.ts" --include="*.tsx" --exclude-dir=config | wc -l
# Deve ser 0 ou apenas em src/config/env.ts
```

### 4. Validação Constants Centralizados

```bash
# Verificar se constants duplicados foram removidos
grep -r "API_BASE_URL\|'/api'" src/services/ --include="*.ts" | grep -v "@/config"
# Deve retornar vazio (sem results)

# Verificar se services usam imports corretos
grep -r "@/config" src/services/ --include="*.ts" | wc -l
# Deve ser > 0 (services usando config)

# Verificar duplicações restantes
grep -r "const.*=.*http\|const.*=.*api" src/ --include="*.ts" --exclude-dir=config | wc -l
# Deve ser mínimo possível
```

### 5. Validação TypeScript Paths

```bash
# Verificar imports absolutos vs relativos
echo "Imports relativos encontrados:"
grep -r "from ['\"]\.\./" src/ --include="*.ts" --include="*.tsx" | wc -l

echo "Imports absolutos encontrados:"
grep -r "from ['\"]@/" src/ --include="*.ts" --include="*.tsx" | wc -l

# Testar resolução de paths
npm run type-check 2>&1 | grep -i "cannot find module\|path"
```

### 6. Testes Funcionais

```bash
# Rodar testes (se existirem)
npm run test 2>/dev/null || echo "Testes não configurados ainda"

# Verificar se dev server inicia
timeout 10s npm run dev 2>&1 | grep -E "(ready|error|localhost)" || echo "Dev server test completed"

# Lint check
npm run lint 2>&1 | head -10
```

### 7. Validação de Performance

```bash
# Build size analysis
npm run build 2>&1 | grep -E "(size|Size|pages|static)"

# Verificar se tree-shaking funciona com barrel exports
grep -A 5 -B 5 "import.*config" src/services/*.ts | head -20
```

## Checklist de Validação

### ✅ Estrutura

- [ ] `src/config/api.ts` existe e contém API_CONFIG, API_ENDPOINTS
- [ ] `src/config/constants.ts` existe e contém UI_CONSTANTS, BUSINESS_CONSTANTS
- [ ] `src/config/env.ts` existe e contém Zod validation
- [ ] `src/config/index.ts` existe e exporta tudo
- [ ] Zod dependency instalada

### ✅ Constants Migration

- [ ] Zero duplicação de API_BASE_URL nos services
- [ ] Services importam de `@/config` ao invés de constants locais
- [ ] Hardcoded URLs/endpoints removidos
- [ ] HTTP status codes centralizados

### ✅ Environment Validation

- [ ] process.env usado apenas em src/config/env.ts
- [ ] Environment variables validadas com Zod
- [ ] Type safety para env vars

### ✅ TypeScript Configuration

- [ ] Imports absolutos (@/) funcionando
- [ ] Type checking passa sem erros
- [ ] Build completo passa
- [ ] IntelliSense funciona com @/config

### ✅ Quality Checks

- [ ] Lint passes without config-related errors
- [ ] No TypeScript errors relacionados a paths
- [ ] Dev server inicia corretamente
- [ ] Tree-shaking funciona (build size otimizado)

## Testes de Qualidade

### Test 1: Import Resolution

```typescript
// Criar arquivo temporário para testar imports
// src/test-imports.ts
import { API_CONFIG, API_ENDPOINTS, BUSINESS_CONSTANTS } from '@/config';

console.log('✅ API_CONFIG:', API_CONFIG.BASE_URL);
console.log('✅ API_ENDPOINTS:', API_ENDPOINTS.APPLICATIONS);
console.log('✅ BUSINESS_CONSTANTS:', BUSINESS_CONSTANTS.APPLICATION_STATUS);

// Executar: node -r ts-node/register src/test-imports.ts
// Depois deletar arquivo
```

### Test 2: Environment Validation

```bash
# Testar com env var inválida
NODE_ENV=invalid node -e "
try {
  require('./src/config/env.ts');
  console.log('❌ Should have failed validation');
} catch (error) {
  console.log('✅ Validation working correctly');
}
"
```

### Test 3: Service Integration

```bash
# Verificar se pelo menos um service principal funciona
grep -A 10 -B 10 "@/config" src/services/application-service.ts
```

## Critérios de Sucesso

- ✅ **Zero Duplicação**: Nenhum constant duplicado encontrado
- ✅ **Type Safety**: Environment variables tipadas e validadas
- ✅ **Import Resolution**: Todos imports @/config funcionando
- ✅ **Build Success**: npm run build passa sem erros
- ✅ **Development**: npm run dev funciona corretamente
- ✅ **Standards**: Código segue padrões estabelecidos

## Problemas Comuns e Soluções

### "Cannot resolve @/config"

```bash
# Verificar tsconfig.json
grep -A 10 "paths" tsconfig.json

# Restart TS server no VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### "Zod validation errors"

```bash
# Verificar se .env.local existe
ls -la .env*

# Adicionar env vars necessárias
echo "NODE_ENV=development" >> .env.local
```

### "Build failures"

```bash
# Limpar cache
rm -rf .next
npm run build
```

## Relatório Final

Documente os resultados em `validation/report.md`:

```markdown
# Foundation Architecture Validation Report

## Status: [✅ PASSED / ❌ FAILED]

### Estrutura

- Config directory: [✅/❌]
- All files present: [✅/❌]
- Barrel exports working: [✅/❌]

### Constants Migration

- Duplications removed: [✅/❌]
- Services updated: [X/10 services]
- Import resolution: [✅/❌]

### Environment Validation

- Zod setup: [✅/❌]
- Type safety: [✅/❌]
- Validation working: [✅/❌]

### Quality Metrics

- Build time: [X seconds]
- Type check: [✅/❌]
- Lint issues: [X issues]

### Next Steps

- Phase 02 (Testing Framework) ready: [✅/❌]
```

## Próximos Passos

Se validação passou com sucesso, proceder para **Phase 02 - Testing Framework Migration**.
