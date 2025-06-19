# Fase 3: Editores de Valor

## Objetivo

Refatorar e criar editores de valor com comportamento Apply/Cancel.

## Dependências

- ✅ Fase 1: Análise e Preparação
- ✅ Fase 2: Sistema de Validação

## Tarefas

### 1. Analisar Editores Existentes

Examine `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ValueEditors.tsx`:

- Padrões de props dos editores atuais
- Como são estruturados (StringEditor, NumberEditor, etc.)
- Estilos e classes CSS utilizadas
- Comportamento de onChange

### 2. Refatorar Editores Existentes

Atualizar editores para suportar:

- Props `autoFocus` para quando entram em modo edição
- Props `onEnter` e `onEscape` para atalhos de teclado
- Props `disabled` durante validação
- Estilos específicos para modo edição

**Manter**:

- Interface existente para compatibilidade
- Padrões de styling do projeto
- Estrutura de props atual

### 3. Criar Editor de Container

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EditableValueContainer.tsx`

**Responsabilidades**:

- Gerenciar estado editing/idle
- Implementar Apply/Cancel buttons
- Coordenar com sistema de validação (Fase 2)
- Atalhos de teclado (Enter = Apply, Escape = Cancel)

**Seguir padrões**:

- Estrutura de componente do projeto
- Padrões de className e styling
- Convenções de props e callbacks

### 4. Editor para Objetos

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ObjectDisplayComponent.tsx`

**Funcionalidades**:

- Análise de propriedades (`{X properties}` ou `{empty object}`)
- Detecção de filhos customizados (recursiva)
- Botão "Reset All Children" condicional
- Indicadores visuais para estado dos filhos

## Critérios de Aceite

- [ ] Editores mantêm compatibilidade com uso atual
- [ ] Apply/Cancel funciona com Enter/Escape
- [ ] Validação integrada durante edição
- [ ] Objetos mostram informação estrutural correta
- [ ] Reset de filhos funciona recursivamente
- [ ] Estilos seguem design system do projeto

## Arquivos Criados/Modificados

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ValueEditors.tsx` (modificado)
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EditableValueContainer.tsx` (novo)
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ObjectDisplayComponent.tsx` (novo)

## Próxima Fase

Após concluir esta fase, prossiga para: **[Fase 4: Coluna Unificada](./phase-04-unified-column.md)**

## Estimativa: 60 minutos
