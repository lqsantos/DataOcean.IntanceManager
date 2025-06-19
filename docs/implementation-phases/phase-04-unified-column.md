# Fase 4: Coluna Unificada

## 🆕 NOVO CHAT AQUI!

Esta fase deve ser executada em um **novo chat** (Chat 3 da abordagem híbrida). Esta é a fase mais importante - merece foco total!

## Contexto Completo do Projeto

### **Missão Crítica:**

Este é o **componente mais importante** da refatoração! Vamos criar `UnifiedValueColumn` que substitui duas colunas confusas por uma experiência inteligente e intuitiva.

### **Problema Original:**

Tabela hierárquica (Next.js + TypeScript) com duas colunas que confundem usuários:

- "Template Default" vs "Blueprint Value"
- Usuários não sabem qual valor está sendo usado
- Sem feedback visual de customizações
- Edição sem Apply/Cancel explícito

### **Infraestrutura Já Criada:**

**✅ Fase 1**: Tipos TypeScript e constantes de configuração  
**✅ Fase 2**: Sistema de validação centralizada (`useFieldValidation` hook)  
**✅ Fase 3**: Editores com Apply/Cancel (`EditableValueContainer`, editores por tipo)

### **Esta Fase (CORE):**

Criar `UnifiedValueColumn` que:

- **Detecta origem do valor** (template vs blueprint)
- **Gerencia estados visuais** distintos com cores/ícones apropriados
- **Orquestra validação + editores** criados nas fases anteriores
- **Coordena transições** entre states (idle → editing → validated)
- **Suporte todos os tipos**: string, number, boolean, object, array

### **Estados Visuais a Implementar:**

- **Template**: `muted background + Circle icon + "Customize" button`
- **Customizado**: `blue border + Edit3 icon + "Edit" + "Reset" buttons`
- **Editando**: `highlighted border + EditableValueContainer active`
- **Erro**: `red border + validation message`

### **Arquivos de Referência:**

- `EnhancedTableRows.tsx` - Como colunas são renderizadas atualmente
- `ValueEditors.tsx` - Editores existentes para referência
- Fases anteriores criaram: tipos, validação, editores Apply/Cancel

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

---

## ✅ Fase 4 Concluída!

Fantástico! O componente principal UnifiedValueColumn está implementado.

**🎯 Próximo passo para o usuário:**  
Esta fase termina aqui.

**📋 PRÓXIMOS PASSOS PARA O USUÁRIO:**
Para continuar a implementação, **você deve iniciar um novo chat** e colar o conteúdo da **[Fase 5: Integração na Tabela](./phase-05-table-integration.md)**

## Estimativa: 45 minutos
