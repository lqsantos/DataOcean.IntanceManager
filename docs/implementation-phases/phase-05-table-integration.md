# Fase 5: Integração na Tabela

## 🆕 NOVO CHAT AQUI!

Esta fase deve ser executada em um **novo chat** (Chat 4 da abordagem híbrida). Mudança estrutural que pode gerar conflitos - merece foco isolado.

## Contexto Completo do Projeto

### **Momento Crucial:**

Esta é a fase onde **tudo se conecta**! Vamos finalmente remover as duas colunas confusas e colocar nossa nova `UnifiedValueColumn` no lugar.

### **Situação Atual:**

**✅ Fase 1**: Criou tipos e constantes  
**✅ Fase 2**: Sistema de validação  
**✅ Fase 3**: Editores Apply/Cancel  
**✅ Fase 4**: `UnifiedValueColumn` componente principal  
**🎯 Agora**: Integrar tudo na tabela existente

### **Mudança Estrutural:**

**ANTES** (problema):

```typescript
<TableCell>{field.defaultValue}</TableCell>     // Template Default
<TableCell>{field.blueprintValue}</TableCell>   // Blueprint Value
```

**DEPOIS** (solução):

```typescript
<TableCell>
  <UnifiedValueColumn field={field} />  // Uma única coluna inteligente
</TableCell>
```

### **Arquivos a Modificar:**

- `TableContainer.tsx` - Remover header "Template Default", ajustar larguras
- `EnhancedTableRows.tsx` - Substituir renderização das duas colunas
- `src/locales/` - Atualizar traduções (EN/PT)

### **Cuidados Especiais:**

- **Manter funcionalidade existente** - expand/collapse, filtros, etc.
- **Redistribuir larguras** - espaço da coluna removida
- **Testar hierarquia** - campos aninhados devem continuar funcionando
- **Tradução consistente** - EN/PT para novos labels

### **Resultado Esperado:**

Uma tabela com uma coluna "Value" unificada que mostra estados visuais claros, mantendo toda funcionalidade existente.

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

⚠️ **PRÓXIMOS PASSOS PARA O USUÁRIO**: Após concluir esta fase, **você deve iniciar um NOVO CHAT** para: **[Fase 6: Melhorias para Objetos](./phase-06-object-enhancements.md)**

**Por quê novo chat?** Iniciamos o Chat 5 (finalização) que inclui Fases 6+7. Continue no mesmo chat para a Fase 7.

## Estimativa: 30 minutos
