# Quick Start - Refactoring Plan Simplificado

Este guia fornece um caminho rápido para executar a refatoração usando os **prompts únicos** simplificados.

## 🚀 Execução Rápida

### Preparação

```bash
# Garantir que está na branch correta
git checkout develop
git pull origin develop

# Criar branch para refatoração
git checkout -b refactor/architecture-standards

# Backup do estado atual
cp -r src/ src_backup/
```

### Execução das Fases

#### Fase 00: Code Cleanup (2-3h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-00-code-cleanup.md

# Após implementação, verificar
npm run lint
npm run type-check
npm run build

# Commit
git add .
git commit -m "refactor(phase-00): code cleanup and basic organization"
```

#### Fase 01: Foundation (4-6h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-01-foundation.md

# Após implementação, verificar
npm run type-check
npm run build
npm run test

# Commit
git add .
git commit -m "refactor(phase-01): foundation architecture and infrastructure"
```

#### Fase 02: Testing (3-4h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-02-testing.md

# Após implementação, verificar
npm run test
npm run test:coverage

# Commit
git add .
git commit -m "refactor(phase-02): testing framework implementation"
```

#### Fase 03: API (6-8h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-03-api.md

# Após implementação, verificar
npm run type-check
npm run build
npm run test

# Commit
git add .
git commit -m "refactor(phase-03): API architecture and services"
```

#### Fase 04: Features (8-12h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-04-features.md

# Após implementação, verificar
npm run type-check
npm run build
npm run test

# Commit
git add .
git commit -m "refactor(phase-04): features-based architecture"
```

#### Fase 05: State & i18n (6-8h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-05-state-i18n.md

# Após implementação, verificar
npm run type-check
npm run build
npm run test

# Commit
git add .
git commit -m "refactor(phase-05): state management and i18n"
```

#### Fase 06: Standards Finalization (4-6h)

```bash
# Abrir prompt e executar
cat docs/refactoring-architecture-standards/phase-06-standards-finalization.md

# Após implementação, verificar
npm run quality-check
npm run build
npm run test:coverage

# Commit final
git add .
git commit -m "refactor(phase-06): standards finalization and documentation"
```

### Finalização

```bash
# Push da branch completa
git push origin refactor/architecture-standards

# Criar PR para develop
gh pr create --title "refactor: Complete architecture standards implementation" \
  --body "Implements all 6 phases of architecture refactoring plan"

# Após merge, limpar
git checkout develop
git pull origin develop
git branch -d refactor/architecture-standards
rm -rf src_backup/
```

## ⚡ Execução Acelerada (Para Experts)

Se você já conhece bem a arquitetura e quer acelerar:

```bash
# Executar múltiplas fases em sequência
for phase in {00..06}; do
  echo "=== EXECUTANDO FASE $phase ==="
  cat "docs/refactoring-architecture-standards/phase-$phase-*.md"

  # Implementar manualmente seguindo o prompt
  # Validar usando checklist do prompt

  git add .
  git commit -m "refactor(phase-$phase): automated implementation"

  echo "=== FASE $phase CONCLUÍDA ==="
done
```

## 📋 Checklist Geral

### Antes de Começar

- [ ] Projeto buildando sem erros
- [ ] Testes passando
- [ ] Branch de trabalho criada
- [ ] Backup do estado atual

### Durante Cada Fase

- [ ] Prompt lido completamente
- [ ] Análise executada
- [ ] Implementação seguida step-by-step
- [ ] Checklist da fase validado
- [ ] Commit realizado

### Ao Final

- [ ] Todos os testes passando
- [ ] Build funcionando
- [ ] Linting sem erros
- [ ] Type checking sem erros
- [ ] Funcionalidade preservada
- [ ] Template pronto para uso

## 🔧 Comandos Úteis

```bash
# Verificar estado do projeto
npm run type-check && npm run lint && npm run build && npm run test

# Verificar estrutura de arquivos
tree src/ -I node_modules

# Verificar imports quebrados
npm run build 2>&1 | grep -i error

# Verificar cobertura de testes
npm run test:coverage

# Analisar bundle
npm run analyze

# Verificar performance
npm run lighthouse
```

## 🚨 Em Caso de Problemas

### Erro de Build

```bash
# Voltar ao estado anterior
git reset --hard HEAD~1
# ou restaurar backup
rm -rf src/
mv src_backup/ src/
```

### Erro de Testes

```bash
# Executar teste específico
npm run test -- --run [test-file]

# Debug de teste
npm run test -- --run --reporter=verbose [test-file]
```

### Erro de Types

```bash
# Verificar erros específicos
npx tsc --noEmit --strict

# Verificar imports
npx tsc --showConfig
```

## 📚 Referências Rápidas

- **Estrutura Target**: `docs/refactoring-architecture-standards/gap-analysis.md`
- **Plano Completo**: `docs/refactoring-architecture-standards/refactoring-plan.md`
- **Arquitetura**: `docs/ARCHITECTURE.md` (criado na Fase 06)
- **Guidelines**: `docs/DEVELOPMENT.md` (criado na Fase 06)

---

**Tempo Total Estimado**: 35-45 horas
**Resultado**: Template exemplar pronto para uso em futuros projetos
