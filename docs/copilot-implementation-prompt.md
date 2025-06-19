# 🤖 Prompt para GitHub Copilot Agent - Implementação da Coluna de Valor Unificada

## 📋 Contexto do Projeto

Estou trabalhando em um projeto Next.js/React com TypeScript que possui uma tabela hierárquica para gerenciar campos de template de Helm Charts/Kubernetes. Atualmente temos duas colunas separadas ("Template Default" e "Blueprint Value") que precisam ser unificadas em uma única coluna "Value" com melhor UX/UI.

## 🎯 Objetivo Principal

Implementar uma **Coluna de Valor Unificada** que:

- Consolidate as colunas "Template Default" e "Blueprint Value" em uma única coluna "Value"
- Tenha indicadores visuais claros para origem do valor (template vs customizado)
- Implemente fluxo Apply/Cancel para edição com validação
- Suporte ESC para cancelar edição
- Tenha comportamento específico para campos de objeto (não editáveis, mas com botão reset para filhos)

## 📚 Documentação Disponível

Tenho um guia de implementação completo em:
`docs/unified-value-column-implementation-guide.md`

Este documento contém:

- ✅ Interfaces TypeScript completas
- ✅ Implementação detalhada de todos os componentes
- ✅ Sistema de validação robusto
- ✅ Estratégia de testes
- ✅ Melhores práticas implementadas

## 🗂️ Estrutura Atual do Projeto

```
src/components/blueprints/sections/DefaultValuesSection/
├── EnhancedFilterControls.tsx (✅ já refatorado)
├── TableComponents/
│   ├── TableContainer.tsx (🔄 precisa refatorar)
│   ├── TableRows.tsx (🔄 precisa refatorar)
│   ├── EnhancedTableRows.tsx (🔄 precisa refatorar)
│   └── ValueEditors.tsx (🔄 precisa refatorar)
├── ValueEditor/
│   └── TemplateValueEditor.tsx (🔄 pode ser removido)
└── fields/ (✅ já refatorado)
```

## 🎯 Tarefas de Implementação

### Fase 1: Infraestrutura Base

1. **Criar sistema de validação centralizada**

   - Arquivo: `src/components/blueprints/sections/DefaultValuesSection/validation/valueValidation.ts`
   - Implementar classes `ValueValidator` e `ValidationStrategy`
   - Criar factory `createCommonValidators`

2. **Implementar hook useValueEditor**
   - Arquivo: `src/hooks/useValueEditor.ts`
   - Gerenciar estado de edição com debounce
   - Suporte a ESC key e auto-save
   - Integração com sistema de validação

### Fase 2: Editores de Valor

3. **Criar editores específicos por tipo**

   - `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/TextValueEditor.tsx`
   - `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/NumberValueEditor.tsx`
   - `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/BooleanValueEditor.tsx`
   - `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/ArrayValueEditor.tsx`

4. **Criar ObjectDisplayComponent**

   - `src/components/blueprints/sections/DefaultValuesSection/ValueEditors/ObjectDisplayComponent.tsx`
   - Mostrar `{X properties}` com indicador visual
   - Botão "Reset All Children" apenas quando há customizações nos filhos
   - Preparado para botão "Add Field" (futuro)

5. **Criar componente UnifiedValueColumn**
   - `src/components/blueprints/sections/DefaultValuesSection/TableComponents/UnifiedValueColumn.tsx`
   - Roteamento por tipo de campo
   - Integração com todos os editores
   - Memoização para performance

### Fase 3: Integração da Tabela

6. **Refatorar TableContainer**

   - Remover coluna "Template Default"
   - Substituir coluna "Blueprint Value" por "Value"
   - Atualizar configuração de larguras das colunas
   - Integrar UnifiedValueColumn

7. **Atualizar TableRows e EnhancedTableRows**
   - Remover renderização das colunas antigas
   - Integrar nova UnifiedValueColumn
   - Manter funcionalidade de expansão/colapso

### Fase 4: Traduções e Polimento

8. **Atualizar arquivos de tradução**
   - `src/locales/en/blueprints.json`
   - `src/locales/pt/blueprints.json`
   - Adicionar chaves para novos estados e tooltips

## 🔧 Especificações Técnicas

### Tecnologias Utilizadas

- **React 18** com hooks
- **TypeScript** strict mode
- **Tailwind CSS** para styling
- **Shadcn/ui** para componentes base
- **React Hook Form** (se aplicável)
- **i18next** para internacionalização

### Padrões de Código

- **Functional components** com hooks
- **React.memo** para otimização
- **Enums** em vez de string literals
- **Error boundaries** para robustez
- **ARIA labels** para acessibilidade
- **JSDoc** para documentação

### Comportamentos Específicos

#### Para Campos Editáveis (string, number, boolean)

- Clique para entrar em modo edição
- Botões Apply/Cancel visíveis
- ESC cancela edição
- Validação em tempo real
- Indicadores visuais: borda verde (customizado) vs cinza (template)

#### Para Campos de Objeto

- Exibir `{X properties}` ou `{empty object}`
- Indicador visual: ✏️ (tem filhos customizados) vs ⚪ (template)
- Botão "Reset All Children" apenas quando há customizações
- Preparar hook para "Add Field" (feature flag false por enquanto)

#### Para Campos de Array

- Similar a objetos, mas com `[X items]`
- Preparar para "Add Item" no futuro

## 🎨 Design System

### Indicadores Visuais

```css
/* Template values */
border-left: 2px solid theme(colors.muted.foreground / 20%);
background: theme(colors.muted / 30%);

/* Customized values */
border-left: 2px solid theme(colors.blue.500);
background: theme(colors.blue.50 / 30%);

/* Objects with customized children */
border-left: 2px solid theme(colors.amber.500 / 50%);
background: theme(colors.amber.50 / 20%);
```

### Componentes Base (Shadcn/ui)

- `Button` para ações
- `Input` para campos de texto
- `Select` para dropdowns
- `Tooltip` para help text
- `Badge` para indicadores

## 🧪 Critérios de Aceite

### Funcionalidade

- [ ] Coluna unificada mostra valor correto com indicador visual de origem
- [ ] Campos de objeto exibem informação estrutural e botão reset contextual
- [ ] Edição funciona com Apply/Cancel explícito para tipos editáveis
- [ ] ESC cancela edição corretamente
- [ ] Validação impede aplicação de valores inválidos
- [ ] Reset de filhos de objeto funciona recursivamente
- [ ] Tradução funciona em EN/PT

### Performance

- [ ] Componentes memoizados adequadamente
- [ ] Debounce na validação (300ms)
- [ ] Sem re-renders desnecessários

### Acessibilidade

- [ ] ARIA labels implementados
- [ ] Navegação por teclado funcional
- [ ] Screen reader support

## 🚨 Pontos Importantes

1. **Manter compatibilidade** com sistema existente durante transição
2. **Não quebrar** funcionalidade de busca/filtro já implementada
3. **Preservar** tipos e interfaces existentes quando possível
4. **Seguir** padrões já estabelecidos no projeto
5. **Implementar** feature flags para funcionalidades futuras (Add Field/Item)

## 📂 Arquivos para Verificar

Antes de começar, analise estes arquivos para entender o contexto:

- `src/components/blueprints/sections/DefaultValuesSection/fields/types.ts`
- `src/components/blueprints/sections/DefaultValuesSection/fields/FieldsContext.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableContainer.tsx`
- `src/locales/en/blueprints.json`

## 🎯 Solicitação Final

Por favor, implemente a **Coluna de Valor Unificada** seguindo exatamente as especificações do guia de implementação em `docs/unified-value-column-implementation-guide.md`.

Comece pela **Fase 1 (Infraestrutura Base)** e depois prossiga sequencialmente. Mantenha o código limpo, tipado e seguindo as melhores práticas mencionadas no documento.

Se houver dúvidas sobre alguma implementação específica, consulte o guia detalhado que contém exemplos completos de código para todos os componentes.

**Objetivo**: Substituir completamente as colunas "Template Default" e "Blueprint Value" por uma única coluna "Value" intuitiva e poderosa. 🚀
