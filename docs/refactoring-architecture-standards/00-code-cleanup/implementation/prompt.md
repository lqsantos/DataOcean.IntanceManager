# Prompt: Implementação Code Cleanup - Dead Code Removal

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Remover código não utilizado (dead code) identificado na análise  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Resultados da análise em `../analysis/results.md`

## Pré-requisitos

- [ ] Análise completa executada (`../analysis/results.md` preenchido)
- [ ] Dead code identificado e categorizado por risco
- [ ] Backup/commit do estado atual criado
- [ ] Strategy de cleanup definida

## Estratégia de Remoção Segura

### Phase 1 - Remoção Segura (LOW RISK)

Remover código com **zero referências confirmadas**:

#### 1.1 Components Órfãos

```bash
# Baseado nos resultados da análise, remover components não utilizados
# EXEMPLO (ajustar conforme results.md):

# Verificar novamente antes de remover
component_to_remove="src/components/[domain]/[unused-component].tsx"
if [ -f "$component_to_remove" ]; then
  echo "Verificando component: $component_to_remove"

  # Double-check: buscar qualquer referência
  grep -r "$(basename $component_to_remove .tsx)" src/ --include="*.ts" --include="*.tsx" | grep -v "$component_to_remove"

  # Se zero resultados, remover
  if [ $? -ne 0 ]; then
    echo "✅ Safe to remove: $component_to_remove"
    # git rm "$component_to_remove"
  fi
fi
```

#### 1.2 Utils Não Utilizadas

```bash
# Remover utils com zero usage
utils_to_remove=(
  # Listar baseado em analysis/results.md
  # "src/utils/unused-util.ts"
)

for util in "${utils_to_remove[@]}"; do
  if [ -f "$util" ]; then
    utilname=$(basename "$util" .ts)

    # Verificar novamente
    grep -r "$utilname" src/ --include="*.ts" --include="*.tsx" | grep -v "$util" > /dev/null

    if [ $? -ne 0 ]; then
      echo "✅ Removing unused util: $util"
      # git rm "$util"
    else
      echo "⚠️ Found references, skipping: $util"
    fi
  fi
done
```

#### 1.3 Test Files Órfãos

```bash
# Remover test files sem source correspondente
orphan_tests=(
  # Listar baseado em analysis/results.md
)

for testfile in "${orphan_tests[@]}"; do
  if [ -f "$testfile" ]; then
    echo "✅ Removing orphan test: $testfile"
    # git rm "$testfile"
  fi
done
```

### Phase 2 - Remoção Cuidadosa (MEDIUM RISK)

#### 2.1 Hooks Não Utilizados

```bash
# Hooks requerem verificação extra para dynamic usage
hooks_to_remove=(
  # Listar baseado em analysis/results.md
)

for hook in "${hooks_to_remove[@]}"; do
  if [ -f "$hook" ]; then
    hookname=$(basename "$hook" .ts)

    echo "Checking hook: $hookname"

    # Verificar imports diretos
    direct_imports=$(grep -r "import.*$hookname" src/ --include="*.ts" --include="*.tsx" | grep -v "$hook" | wc -l)

    # Verificar chamadas diretas
    direct_calls=$(grep -r "$hookname(" src/ --include="*.ts" --include="*.tsx" | grep -v "$hook" | wc -l)

    if [ "$direct_imports" -eq 0 ] && [ "$direct_calls" -eq 0 ]; then
      echo "✅ Safe to remove hook: $hook"
      # git rm "$hook"
    else
      echo "⚠️ Found usage ($direct_imports imports, $direct_calls calls), skipping: $hook"
    fi
  fi
done
```

#### 2.2 Contexts Não Utilizados

```bash
# Contexts requerem verificação de Provider patterns
contexts_to_remove=(
  # Listar baseado em analysis/results.md
)

for context in "${contexts_to_remove[@]}"; do
  if [ -f "$context" ]; then
    contextname=$(basename "$context" .tsx)

    # Verificar Provider usage
    provider_usage=$(grep -r "${contextname}Provider\|Provider.*${contextname}" src/ --include="*.ts" --include="*.tsx" | wc -l)

    # Verificar useContext usage
    usecontext_usage=$(grep -r "useContext.*${contextname}\|use.*${contextname}" src/ --include="*.ts" --include="*.tsx" | grep -v "$context" | wc -l)

    if [ "$provider_usage" -eq 0 ] && [ "$usecontext_usage" -eq 0 ]; then
      echo "✅ Safe to remove context: $context"
      # git rm "$context"
    else
      echo "⚠️ Found context usage ($provider_usage providers, $usecontext_usage hooks), skipping: $context"
    fi
  fi
done
```

### Phase 3 - Verificação Manual (HIGH RISK)

#### 3.1 Types/Interfaces

```typescript
// Types requerem verificação manual porque podem ser usados apenas em anotações
// Listar types candidates baseado em analysis/results.md

// EXEMPLO:
// interface UnusedInterface { } // Candidato para remoção
// type UnusedType = string;    // Candidato para remoção

// Para cada type candidate:
// 1. Verificar se é usado em type annotations
// 2. Verificar se é usado em extends/implements
// 3. Verificar se é usado em generic constraints
// 4. Verificar imports type-only

// Comandos para verificação manual:
// grep -r "UnusedInterface" src/ --include="*.ts" --include="*.tsx"
// grep -r ": UnusedInterface\|<UnusedInterface>" src/ --include="*.ts" --include="*.tsx"
```

#### 3.2 Services com Dependências

```bash
# Services podem ter imports dinâmicos que grep não captura
services_candidates=(
  # Listar baseado em analysis/results.md
)

for service in "${services_candidates[@]}"; do
  if [ -f "$service" ]; then
    servicename=$(basename "$service" .ts)

    echo "Manual verification needed for service: $service"
    echo "Check for:"
    echo "  - Dynamic imports: import('path/to/$servicename')"
    echo "  - Runtime resolution: require('$servicename')"
    echo "  - API route usage: /api endpoints"
    echo "  - Next.js dynamic imports"

    # Mostrar conteúdo para análise manual
    echo "Service exports:"
    grep "export" "$service" | head -5
  fi
done
```

## Implementação Passo-a-Passo

### Step 1: Preparação

```bash
# Criar branch para cleanup
git checkout -b cleanup/dead-code-removal

# Fazer backup do estado atual
git add .
git commit -m "Backup before dead code cleanup"

# Executar testes baseline
npm run test
npm run build
```

### Step 2: Executar Phase 1 (Safe Removals)

```bash
# Executar comandos de Phase 1
# [Inserir comandos específicos baseados em results.md]

# Testar após cada grupo de remoções
npm run type-check
npm run build
```

### Step 3: Executar Phase 2 (Careful Removals)

```bash
# Executar comandos de Phase 2
# [Inserir comandos específicos baseados em results.md]

# Testes mais rigorosos
npm run test
npm run dev # Verificar se app inicia
```

### Step 4: Verificação Manual Phase 3

```typescript
// Para cada item de HIGH RISK:
// 1. Abrir arquivo no editor
// 2. Verificar usage manualmente
// 3. Decidir se é seguro remover
// 4. Remover individualmente com teste
```

### Step 5: Limpeza de Index Files

```bash
# Atualizar index.ts files que podem ter exports órfãos
find src/ -name "index.ts" -exec grep -l "export.*from" {} \; | while read indexfile; do
  echo "Checking index file: $indexfile"
  # Verificar se exports apontam para arquivos que ainda existem
done

# Remove exports órfãos de index.ts files
# [Comandos específicos baseados nos arquivos removidos]
```

## Validação Contínua

### Após Cada Fase:

```bash
# Type checking
npm run type-check

# Lint checking
npm run lint

# Build checking
npm run build

# Test running
npm run test

# Dev server
timeout 10s npm run dev
```

### Métricas de Sucesso:

```bash
# Contar arquivos antes/depois
echo "Files before cleanup:"
find src/ -name "*.ts" -o -name "*.tsx" | wc -l

# [Após cleanup]
echo "Files after cleanup:"
find src/ -name "*.ts" -o -name "*.tsx" | wc -l

# Calcular redução
echo "Files removed: [difference]"

# Bundle size comparison
npm run build 2>&1 | grep -E "size|Size"
```

## Checklist de Implementação

### ✅ Phase 1 - Safe Removals

- [ ] Components órfãos removidos
- [ ] Utils não utilizadas removidas
- [ ] Test files órfãos removidos
- [ ] Build passa após Phase 1
- [ ] Commit das remoções seguras

### ✅ Phase 2 - Careful Removals

- [ ] Hooks não utilizados removidos
- [ ] Contexts não utilizados removidos
- [ ] Verificação dupla executada
- [ ] Testes passam após Phase 2
- [ ] Commit das remoções cuidadosas

### ✅ Phase 3 - Manual Verification

- [ ] Types/interfaces verificadas manualmente
- [ ] Services verificados para dynamic imports
- [ ] Decisões documentadas
- [ ] Remoções executadas individualmente
- [ ] Commit das remoções verificadas

### ✅ Cleanup Final

- [ ] Index files atualizados
- [ ] Exports órfãos removidos
- [ ] Build final passa
- [ ] Testes finais passam
- [ ] Métricas de redução calculadas

## Rollback Strategy

### Se algo quebrar:

```bash
# Rollback para commit anterior
git reset --hard HEAD~1

# Ou rollback para backup específico
git reset --hard [backup-commit-hash]

# Verificar se tudo volta a funcionar
npm run build
npm run test
```

## Documentação Final

Documente os resultados em `implementation/summary.md`:

```markdown
# Code Cleanup Implementation Summary

## Removals Executed

### Phase 1 - Safe Removals

- Components removed: X files
- Utils removed: Y files
- Test files removed: Z files

### Phase 2 - Careful Removals

- Hooks removed: A files
- Contexts removed: B files

### Phase 3 - Manual Verification

- Types removed: C types
- Services removed: D files

## Impact

### Code Reduction

- Total files removed: X
- Lines of code removed: ~Y
- Bundle size reduction: ~Z KB

### Quality Improvement

- Dead code eliminated: 100%
- Codebase cleaner: ✅
- Build time: [before] → [after]
- Type checking: [before] → [after]

## Next Steps

✅ Phase 00 (Code Cleanup) completed
→ Ready for Phase 01 (Foundation Architecture)
```

## Próximos Passos

Após completar a implementação com sucesso, proceder para `validation/prompt.md` para validar que tudo funciona corretamente.
