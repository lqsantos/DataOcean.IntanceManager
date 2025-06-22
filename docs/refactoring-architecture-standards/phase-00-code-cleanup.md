# Phase 00: Code Cleanup

## Objetivo

Remover código não utilizado (dead code) antes de iniciar a refatoração arquitetural.

## Análise da Situação Atual

### 1. Identificar Dead Code

```bash
# Buscar componentes não utilizados
echo "🔍 Procurando componentes órfãos..."
find src/components -name "*.tsx" | while read component; do
  filename=$(basename "$component" .tsx)
  usage=$(grep -r "import.*$filename\|<$filename" src/ --exclude="$component" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "⚠️ Possível órfão: $component"
  fi
done

# Buscar hooks não utilizados
echo "🔍 Procurando hooks órfãos..."
find src/hooks -name "*.ts" | while read hook; do
  hookname=$(basename "$hook" .ts)
  usage=$(grep -r "import.*$hookname" src/ --exclude="$hook" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "⚠️ Possível órfão: $hook"
  fi
done

# Buscar utils não utilizadas
echo "🔍 Procurando utils órfãs..."
find src/utils -name "*.ts" | while read util; do
  utilname=$(basename "$util" .ts)
  usage=$(grep -r "import.*$utilname" src/ --exclude="$util" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "⚠️ Possível órfã: $util"
  fi
done
```

### 2. Categorizar por Risco

- **LOW RISK**: Zero referências encontradas
- **MEDIUM RISK**: Possível uso dinâmico (verificar manualmente)
- **HIGH RISK**: Tipos e interfaces (podem ser usados apenas em anotações)

## Implementação

### Step 1: Backup e Preparação

```bash
# Criar branch para cleanup
git checkout -b cleanup/dead-code-removal
git add .
git commit -m "Backup before dead code cleanup"
```

### Step 2: Remoção Segura (LOW RISK)

```bash
# Remover arquivos com zero referências confirmadas
# Execute os comandos de análise acima e remova manualmente os arquivos identificados

# Para cada arquivo órfão confirmado:
# git rm src/path/to/orphan-file.tsx
```

### Step 3: Verificação (MEDIUM/HIGH RISK)

Para arquivos de risco médio/alto, verificar manualmente:

- Abrir no editor
- Verificar se é usado em imports dinâmicos
- Verificar se é usado apenas em tipos
- Decidir se é seguro remover

### Step 4: Limpeza de Index Files

```bash
# Atualizar arquivos index.ts que podem ter exports órfãos
find src/ -name "index.ts" | while read indexfile; do
  echo "Verificar exports órfãos em: $indexfile"
  # Verificar manualmente e remover exports para arquivos removidos
done
```

## Checklist de Finalização

- [ ] `npm run build` - Build passa sem erros
- [ ] `npm run test` - Testes passam
- [ ] `npm run lint` - Sem erros críticos
- [ ] App inicia corretamente em dev mode
- [ ] Funcionalidades principais funcionam
- [ ] Commit das alterações

## Próximo Passo

→ **Phase 01: Foundation Architecture**
