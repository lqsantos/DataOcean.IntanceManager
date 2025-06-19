# Fase 5: Integração na Tabela

## Objetivo

Substituir colunas antigas pela nova UnifiedValueColumn na tabela existente.

## Dependências

- ✅ Fase 1: Análise e Preparação
- ✅ Fase 4: Coluna Unificada

## Tarefas

### 1. Analisar Estrutura Atual da Tabela

Examine `EnhancedTableRows.tsx` e `TableContainer.tsx`:

- Como são definidos cabeçalhos (TableHead)
- Estrutura de TableCell para cada coluna
- COLUMN_WIDTHS e como são aplicados
- Lógica de renderização de campos

### 2. Atualizar TableContainer

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableContainer.tsx`

**Mudanças**:

- Remover cabeçalho "Template Default" (`t('values.table.defaultValue')`)
- Manter apenas cabeçalho "Value" (`t('values.table.value')`)
- Atualizar imports para usar constantes da Fase 1
- Redistribuir larguras das colunas

### 3. Atualizar EnhancedTableRows

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx`

**Mudanças**:

- Remover renderização da coluna defaultValue
- Substituir renderização da coluna value por UnifiedValueColumn
- Manter todas as outras colunas intactas
- Atualizar COLUMN_WIDTHS import

**Manter**:

- Toda a lógica de expansão/colapso
- Sistema de callbacks existente
- Compatibilidade com props atuais

### 4. Atualizar Traduções

Seguir padrão existente em `src/locales/`:

**Remover**:

- `defaultValue: "Template Default"`

**Modificar**:

- `value: "Blueprint Value"` → `value: "Value"`

**Adicionar** (se necessário):

- Keys para botões Apply/Cancel/Edit/Reset

## Critérios de Aceite

- [ ] Tabela mantém todas as funcionalidades existentes
- [ ] Coluna "Template Default" removida completamente
- [ ] Coluna "Value" usa UnifiedValueColumn
- [ ] Larguras redistribuídas proporcionalmente
- [ ] Traduções atualizadas nos dois idiomas
- [ ] Sem quebra de funcionalidade durante transição

## Arquivos Criados/Modificados

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableContainer.tsx` (modificado)
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx` (modificado)
- `src/locales/en/blueprints.json` (modificado)
- `src/locales/pt/blueprints.json` (modificado)

## Próxima Fase

Após concluir esta fase, prossiga para: **[Fase 6: Melhorias para Objetos](./phase-06-object-enhancements.md)**

## Estimativa: 30 minutos
