# Prompt: Validação Code Cleanup - Dead Code Removal

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 00 - Code Cleanup (Validation)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Implementação concluída conforme `../implementation/prompt.md`

## Objetivo da Validação

Garantir que a remoção de dead code foi executada com sucesso, sem quebrar funcionalidades existentes e que o projeto está pronto para as próximas fases arquiteturais.

## Pré-requisitos

- [ ] Implementation phase concluída
- [ ] Todas as remoções de código foram executadas
- [ ] Commits de implementação realizados
- [ ] Summary de implementação criado

## Validação Técnica

### 1. Build & Type Check

```bash
# Validar que o projeto ainda compila
echo "🔍 Validando build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed - rollback needed"
  exit 1
fi

# Validar type checking
echo "🔍 Validando types..."
npm run type-check

if [ $? -eq 0 ]; then
  echo "✅ Type check successful"
else
  echo "❌ Type errors found - investigation needed"
  npm run type-check 2>&1 | head -20
fi
```

### 2. Tests Execution

```bash
# Executar toda suite de testes
echo "🔍 Validando tests..."
npm run test

if [ $? -eq 0 ]; then
  echo "✅ All tests passing"
else
  echo "❌ Test failures detected"
  npm run test 2>&1 | grep -E "(FAIL|FAILED|Error|fail)"
fi

# Testar coverage se disponível
if npm run | grep -q "test:coverage"; then
  echo "🔍 Verificando coverage..."
  npm run test:coverage
fi
```

### 3. Lint & Code Quality

```bash
# Validar lint rules
echo "🔍 Validando lint..."
npm run lint

if [ $? -eq 0 ]; then
  echo "✅ Lint validation passed"
else
  echo "⚠️ Lint issues found (may need fixing)"
  npm run lint 2>&1 | head -10
fi

# Verificar se há eslint-disable órfãos
echo "🔍 Checking for orphaned eslint-disable comments..."
grep -r "eslint-disable" src/ --include="*.ts" --include="*.tsx" | while read line; do
  echo "Manual check needed: $line"
done
```

### 4. Runtime Validation

```bash
# Validar que app inicia corretamente
echo "🔍 Validando runtime startup..."

# Start dev server em background
npm run dev &
DEV_PID=$!

# Aguardar startup
sleep 10

# Verificar se processo ainda está rodando
if ps -p $DEV_PID > /dev/null; then
  echo "✅ Dev server started successfully"

  # Testar endpoint básico (se aplicável)
  if command -v curl > /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
    if [ "$response" = "200" ]; then
      echo "✅ App responding to requests"
    else
      echo "⚠️ App not responding (status: $response)"
    fi
  fi

  # Cleanup
  kill $DEV_PID
  echo "🧹 Dev server stopped"
else
  echo "❌ Dev server failed to start"
fi
```

## Validação de Arquivos

### 5. Verificar Remoções Completadas

```bash
# Validar que arquivos identificados foram realmente removidos
echo "🔍 Validating file removals..."

# Baseado em analysis/results.md, verificar que arquivos não existem mais
# EXEMPLO (ajustar conforme analysis real):

# Verificar components órfãos removidos
orphan_components=(
  # Listar components que deveriam ter sido removidos
  # "src/components/[domain]/[unused-component].tsx"
)

for component in "${orphan_components[@]}"; do
  if [ -f "$component" ]; then
    echo "❌ Component still exists (should be removed): $component"
  else
    echo "✅ Component removed: $component"
  fi
done

# Verificar utils órfãs removidas
orphan_utils=(
  # Listar utils que deveriam ter sido removidas
  # "src/utils/unused-util.ts"
)

for util in "${orphan_utils[@]}"; do
  if [ -f "$util" ]; then
    echo "❌ Util still exists (should be removed): $util"
  else
    echo "✅ Util removed: $util"
  fi
done
```

### 6. Verificar Dead References

```bash
# Buscar por imports que podem ter ficado órfãos após remoções
echo "🔍 Checking for broken imports..."

# Buscar imports que referenciam arquivos removidos
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "^import.*from" | while read file; do
  grep "^import.*from.*['\"]\..*['\"]" "$file" | while read import_line; do
    # Extrair path do import
    import_path=$(echo "$import_line" | sed -n "s/.*from.*['\"]\\(\\.[^'\"]*\\)['\"].*/\\1/p")
    if [ -n "$import_path" ]; then
      # Resolver path relativo
      file_dir=$(dirname "$file")
      resolved_path="$file_dir/$import_path"

      # Verificar se arquivo existe (com extensões possíveis)
      if [ ! -f "$resolved_path.ts" ] && [ ! -f "$resolved_path.tsx" ] && [ ! -f "$resolved_path.js" ] && [ ! -f "$resolved_path/index.ts" ] && [ ! -f "$resolved_path/index.tsx" ]; then
        echo "⚠️ Potential broken import in $file: $import_line"
      fi
    fi
  done
done
```

### 7. Verificar Exports Órfãos

```bash
# Verificar se index.ts files têm exports para arquivos removidos
echo "🔍 Checking for orphaned exports..."

find src/ -name "index.ts" | while read index_file; do
  if [ -f "$index_file" ]; then
    grep "export.*from" "$index_file" | while read export_line; do
      # Extrair path do export
      export_path=$(echo "$export_line" | sed -n "s/.*from.*['\"]\\(\\.[^'\"]*\\)['\"].*/\\1/p")
      if [ -n "$export_path" ]; then
        # Resolver path relativo
        index_dir=$(dirname "$index_file")
        resolved_path="$index_dir/$export_path"

        # Verificar se arquivo existe
        if [ ! -f "$resolved_path.ts" ] && [ ! -f "$resolved_path.tsx" ] && [ ! -f "$resolved_path.js" ]; then
          echo "⚠️ Orphaned export in $index_file: $export_line"
        fi
      fi
    done
  fi
done
```

## Validação de Métricas

### 8. Comparar Métricas Before/After

```bash
# Calcular métricas de código
echo "🔍 Calculating cleanup metrics..."

# Contar arquivos
current_files=$(find src/ -name "*.ts" -o -name "*.tsx" | wc -l)
echo "Current TypeScript files: $current_files"

# Contar linhas de código
current_lines=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')
echo "Current lines of code: $current_lines"

# Verificar bundle size (se build foi successful)
if [ -d ".next" ]; then
  echo "Build output:"
  ls -la .next/static/chunks/ 2>/dev/null | head -5
fi

# Calcular tempo de build
echo "🔍 Measuring build performance..."
time npm run build > /dev/null 2>&1
```

### 9. Validar Coverage (se disponível)

```bash
# Se test coverage estiver configurado
if [ -d "coverage" ]; then
  echo "🔍 Validating test coverage..."

  # Verificar se coverage melhorou (menos código morto = melhor coverage)
  if [ -f "coverage/coverage-summary.json" ]; then
    echo "Coverage summary available for review"
    # Verificar metrics principais
  fi
fi
```

## Validação Manual

### 10. Checklist Manual

```markdown
# Manual Validation Checklist

## Functionality Check

- [ ] App loads in browser without console errors
- [ ] Navigation works correctly
- [ ] Core features function as expected
- [ ] No broken UI components
- [ ] No missing icons/assets

## Code Quality Check

- [ ] No TypeScript errors in IDE
- [ ] No ESLint errors (critical ones)
- [ ] No broken imports highlighted
- [ ] IntelliSense working correctly
- [ ] No unused import warnings

## Performance Check

- [ ] Build time: **\_** (vs baseline: **\_**)
- [ ] App startup time: similar/better
- [ ] Hot reload working correctly
- [ ] No memory leaks in dev tools

## Documentation Check

- [ ] README still accurate
- [ ] No broken internal links
- [ ] Code comments still valid
- [ ] API documentation up to date
```

## Critérios de Aceitação

### ✅ Critérios Obrigatórios (MUST PASS)

- [ ] `npm run build` executa sem erros
- [ ] `npm run type-check` passa sem erros TypeScript
- [ ] `npm run test` passa sem falhas
- [ ] App inicia em dev mode sem erros críticos
- [ ] Zero broken imports detectados
- [ ] Zero exports órfãos confirmados

### ✅ Critérios Desejáveis (SHOULD PASS)

- [ ] `npm run lint` passa sem warnings críticos
- [ ] Build time igual ou melhor que baseline
- [ ] Redução no número de arquivos confirmada
- [ ] Redução nas linhas de código confirmada
- [ ] Coverage percentage mantido ou melhorado

### ✅ Critérios Opcionais (NICE TO HAVE)

- [ ] Bundle size reduzido
- [ ] App performance igual ou melhor
- [ ] Zero ESLint warnings
- [ ] Hot reload funciona perfeitamente

## Ações Corretivas

### Se Validação Falhar:

#### Build/Type Errors:

```bash
# Investigar erros específicos
npm run type-check 2>&1 | tee type-errors.log
npm run build 2>&1 | tee build-errors.log

# Analisar erros mais comuns:
# - Missing exports from removed files
# - Broken import paths
# - Type definitions removidas indevidamente
```

#### Test Failures:

```bash
# Executar testes específicos que falharam
npm run test -- --verbose
npm run test -- --watch

# Verificar se testes órfãos estão tentando testar código removido
# Verificar se mocks estão quebrados
```

#### Runtime Issues:

```bash
# Verificar console do browser para erros
# Verificar network tab para recursos quebrados
# Verificar se dynamic imports estão quebrados
```

#### Rollback Procedure:

```bash
# Se validação crítica falhar, fazer rollback
git log --oneline -10  # Identificar commit antes do cleanup
git reset --hard [commit-hash-before-cleanup]

# Revalidar que rollback restaura funcionalidade
npm run build && npm run test
```

## Documentação de Resultados

### Criar Validation Summary:

```markdown
# Code Cleanup Validation Results

## ✅ Status: [PASSED/FAILED/PARTIALLY_PASSED]

## Technical Validation

- Build: [✅/❌]
- Type Check: [✅/❌]
- Tests: [✅/❌] ([X] passing, [Y] failing)
- Lint: [✅/⚠️/❌]
- Runtime: [✅/❌]

## Code Reduction Achieved

- Files removed: X
- Lines of code removed: ~Y
- Dead components eliminated: Z
- Dead utils eliminated: A
- Dead hooks eliminated: B

## Quality Metrics

- Build time: [before] → [after]
- Bundle size: [before] → [after]
- Test coverage: [before] → [after]

## Issues Found & Resolved

[List any issues discovered during validation and how they were fixed]

## Recommendation

[✅ PROCEED to Phase 01 / ⚠️ ADDRESS ISSUES / ❌ ROLLBACK NEEDED]

## Next Steps

- [ ] Address any minor issues found
- [ ] Create final commit for Phase 00
- [ ] Begin Phase 01 - Foundation Architecture
```

## Finalização da Phase 00

### Se Validação for Successful:

```bash
# Commit final da phase
git add .
git commit -m "Phase 00 complete: Dead code cleanup validated

- Removed X unused components
- Removed Y unused utils
- Removed Z unused hooks
- Build, tests, and runtime validation passed
- Ready for Phase 01 - Foundation Architecture"

# Tag da milestone
git tag -a phase-00-complete -m "Code cleanup phase completed successfully"
```

### Preparar Phase 01:

```bash
# Verificar que estamos prontos para próxima fase
echo "✅ Phase 00 - Code Cleanup: COMPLETE"
echo "→  Ready for Phase 01 - Foundation Architecture"
echo ""
echo "Next command:"
echo "cd docs/refactoring-architecture-standards/01-foundation-architecture/analysis/"
echo "# Use prompt.md to analyze current foundation architecture"
```

O projeto está agora limpo de dead code e pronto para a refatoração arquitetural incremental das próximas fases.
