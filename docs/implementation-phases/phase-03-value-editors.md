# Fase 3: Editores de Valor

## 🆕 NOVO CHAT AQUI!

Esta fase deve ser executada em um **novo chat** (Chat 2 da abordagem híbrida). Se necessário, mencione descobertas importantes das Fases 1-2.

## Contexto Completo do Projeto

### **Problema Original:**

Este é um projeto Next.js + TypeScript com uma tabela hierárquica de campos de template que possui duas colunas confusas:

- "Template Default" (valor padrão do template)
- "Blueprint Value" (valor customizado pelo usuário)

### **Solução em Desenvolvimento:**

Estamos criando uma única coluna "Value" unificada com estados visuais claros:

- **Estado Template**: Fundo muted, ícone Circle, botão "Customize"
- **Estado Customizado**: Borda azul, ícone Edit3, botões "Edit" + "Reset"
- **Estado Editando**: Border destacado, botões Apply/Cancel visíveis
- **Estado Erro**: Borda vermelha, mensagem de validação

### **Progresso Até Agora:**

**✅ Fase 1**: Analisou padrões do projeto e criou tipos base  
**✅ Fase 2**: Implementou sistema de validação centralizada  
**🎯 Agora**: Implementar editores com fluxo Apply/Cancel explícito

### **Esta Fase (Editores):**

Vamos criar editores que suportam:

- Entrada em modo edição com `autoFocus`
- Atalhos `Enter` (Apply) e `Escape` (Cancel)
- Integração com sistema de validação da Fase 2
- Estados `disabled` durante validação
- Container que gerencia Apply/Cancel buttons

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

---

## ✅ Fase 3 Concluída!

Excelente! Os editores com Apply/Cancel estão implementados.

**🎯 Próximo passo para o usuário:**  
Esta fase termina aqui.

**📋 PRÓXIMOS PASSOS PARA O USUÁRIO:**
Para continuar a implementação, **você deve iniciar um novo chat** e colar o conteúdo da **[Fase 4: Coluna Unificada](./phase-04-unified-column.md)** (a fase mais importante!)

## Estimativa: 60 minutos
