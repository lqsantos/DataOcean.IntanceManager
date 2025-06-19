# Fase 1: Análise e Preparação

## Contexto Rápido

Este é um projeto Next.js + TypeScript que possui uma tabela hierárquica de campos de template. Atualmente temos duas colunas confusas ("Template Default" e "Blueprint Value") que precisam ser unificadas em uma única coluna "Value" com estados visuais claros e fluxo Apply/Cancel.

**Se você não leu:** Recomendo começar pela [Fase 0: Setup de Contexto](./phase-00-context-setup.md) para compreensão completa.

## Objetivo

Entender os padrões atuais do projeto e preparar a infraestrutura base para a coluna unificada.

## Tarefas

### 1. Análise de Padrões Existentes

Analise os seguintes arquivos para entender os padrões do projeto:

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ValueEditors.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/types.ts`
- `src/locales/en/blueprints.json` (seção `values.table`)

**Identifique**:

- Como são estruturadas as interfaces TypeScript
- Padrões de nomenclatura de componentes
- Convenções de styling (cn, className patterns)
- Estrutura de tradução (i18n patterns)
- Como são gerenciados estados de campo (expanded, editing, etc.)

### 2. Criar Tipos Base

Baseado nos padrões encontrados, crie:

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/types.ts`

```typescript
// Tipos para estado de edição e validação
// Seguir padrões encontrados em types.ts existente
// Incluir estados: 'idle' | 'editing' | 'validating' | 'valid' | 'error'
```

### 3. Criar Constantes de Configuração

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/constants.ts`

```typescript
// Larguras de coluna atualizadas (sem defaultValue)
// Seguir padrão do COLUMN_WIDTHS existente
// Redistribuir espaço da coluna removida
```

## Critérios de Aceite

- [ ] Tipos criados seguem exatamente os padrões do projeto
- [ ] Constantes seguem convenções de nomenclatura existentes
- [ ] Não há quebra de funcionalidade existente
- [ ] Documentação JSDoc seguindo padrão do projeto

## Arquivos Criados/Modificados

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/types.ts` (novo)
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/constants.ts` (novo)

## Próxima Fase

Após concluir esta fase, prossiga para: **[Fase 2: Sistema de Validação](./phase-02-validation-system.md)**

## Estimativa: 30 minutos
