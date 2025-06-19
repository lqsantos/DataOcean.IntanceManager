# Fase 4: Coluna Unificada

## Objetivo

Criar o componente principal UnifiedValueColumn que orquestra toda a experiência.

## Dependências

- ✅ Fase 1: Análise e Preparação
- ✅ Fase 2: Sistema de Validação
- ✅ Fase 3: Editores de Valor

## Tarefas

### 1. Analisar Renderização Atual

Examine como `EnhancedTableRows.tsx` renderiza as colunas de valor:

- Lógica para determinar se campo é `isFromTemplate`
- Como são aplicados estilos condicionais
- Estrutura de TableCell para valores
- Botões Customize/Reset existentes

### 2. Criar Componente Principal

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/UnifiedValueColumn.tsx`

**Estados Visuais**:

- **Template (padrão)**: Fundo muted, ícone Circle, botão "Customize"
- **Customizado**: Borda azul, ícone Edit3, botões "Edit" + "Reset"
- **Editando**: Border destacado, EditableValueContainer ativo
- **Erro**: Borda vermelha, mensagem de validação

**Lógica Principal**:

- Detectar origem do valor (template vs blueprint)
- Gerenciar transições entre estados
- Coordenar com validação (Fase 2) e editores (Fase 3)
- Suporte a todos os tipos: string, number, boolean, object, array

### 3. Integração com Editores

- Usar EditableValueContainer para campos editáveis
- Usar ObjectDisplayComponent para objetos
- Manter ArrayEditor para arrays (YAML only)
- Aplicar validação antes de confirmar mudanças

### 4. Indicadores Visuais

Implementar conforme padrões do projeto:

```typescript
// Seguir padrões de className do projeto
const getVisualState = (field, isEditing) => ({
  container: cn(/* classes baseadas no estado */),
  indicator: /* ícone apropriado */,
  actions: /* botões contextuais */
});
```

## Critérios de Aceite

- [ ] Estados visuais claros e distintos
- [ ] Transições suaves entre modos
- [ ] Ações contextuais apropriadas por estado
- [ ] Integração completa com validação
- [ ] Suporte a todos os tipos de campo
- [ ] Atalhos de teclado funcionando
- [ ] Accessibility (aria-labels, focus management)

## Arquivos Criados/Modificados

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/UnifiedValueColumn.tsx` (novo)

## Próxima Fase

Após concluir esta fase, prossiga para: **[Fase 5: Integração na Tabela](./phase-05-table-integration.md)**

## Estimativa: 45 minutos
