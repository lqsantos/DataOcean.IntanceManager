# Fase 0: Setup de Contexto

## Objetivo

Estabelecer compreensão completa do projeto e do problema a ser resolvido antes de iniciar a implementação.

## Contexto do Projeto

### Tecnologias

- **Next.js** com TypeScript
- **Tailwind CSS** para styling
- **shadcn/ui** como design system
- **Internacionalização** (EN/PT) com sistema de tradução

### Problema Atual

O projeto possui uma tabela hierárquica para gerenciar campos de template com duas colunas de valor que causam confusão:

1. **"Template Default"** - Mostra valor padrão do template
2. **"Blueprint Value"** - Mostra valor customizado (se houver)

**Problemas identificados:**

- Usuários não sabem qual valor está sendo usado
- Interface cluttered com informação redundante
- Falta de feedback visual sobre customizações
- Ausência de validação antes de aplicar mudanças
- Fluxo de edição sem Apply/Cancel explícito

### Objetivo da Refatoração

Unificar as duas colunas em uma única coluna **"Value"** com:

- **Indicadores visuais** claros de origem (template vs customizado)
- **Fluxo Apply/Cancel** explícito para edição
- **Validação preventiva** antes de aceitar mudanças
- **Estados visuais** distintos e intuitivos

### Arquitetura Atual

```
src/components/blueprints/sections/DefaultValuesSection/
├── TableComponents/
│   ├── TableContainer.tsx           # Container principal da tabela
│   ├── EnhancedTableRows.tsx        # Renderização de linhas (AQUI está o problema)
│   └── ValueEditors.tsx             # Editores por tipo de campo
├── types.ts                         # Tipos TypeScript
└── utils/                           # Utilitários diversos
```

### Localização do Problema

O arquivo **`EnhancedTableRows.tsx`** atualmente renderiza:

```typescript
// Estrutura atual problemática
<TableCell>{field.defaultValue}</TableCell>  // Coluna 1: Template Default
<TableCell>{field.blueprintValue}</TableCell> // Coluna 2: Blueprint Value
```

Deve ser substituído por:

```typescript
// Estrutura desejada
<TableCell>
  <UnifiedValueColumn field={field} />  // Uma única coluna inteligente
</TableCell>
```

## Estados Visuais Esperados

### Estado 1: Valor Template (Padrão)

```
┌─────────────────────────────────┐
│ ⚪ "default-value"              │
│    [Customize]                  │
└─────────────────────────────────┘
```

### Estado 2: Valor Customizado

```
┌─────────────────────────────────┐
│ 🔵 "custom-value"               │
│    [Edit] [Reset]               │
└─────────────────────────────────┘
```

### Estado 3: Editando

```
┌─────────────────────────────────┐
│ 🟡 [input: "new-value"]         │
│    [Apply] [Cancel]             │
└─────────────────────────────────┘
```

### Estado 4: Objeto

```
┌─────────────────────────────────┐
│ 🔷 {5 properties}               │
│    [Reset All Children]         │
└─────────────────────────────────┘
```

## Estratégia de Implementação

### Abordagem Incremental

A implementação será dividida em **7 fases pequenas** para:

- Descobrir padrões do projeto antes de implementar
- Validar cada etapa antes de continuar
- Facilitar rollback se necessário
- Manter compatibilidade durante transição

### Fases Planejadas

1. **Análise e Preparação** - Entender padrões atuais
2. **Sistema de Validação** - Hook de validação reutilizável
3. **Editores de Valor** - Componentes Apply/Cancel
4. **Coluna Unificada** - Componente principal
5. **Integração na Tabela** - Substituir colunas antigas
6. **Melhorias para Objetos** - Funcionalidades específicas
7. **Traduções e Polimento** - Finalização

## Preparação do Ambiente

### Antes de Começar

1. **Backup do código atual** - Para rollback se necessário
2. **Ambiente de desenvolvimento** funcionando
3. **Acesso aos arquivos** do projeto
4. **Compreensão da estrutura** atual

### Arquivos Principais a Serem Analisados

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ValueEditors.tsx`
- `src/components/blueprints/sections/DefaultValuesSection/types.ts`
- `src/locales/en/blueprints.json`
- `src/locales/pt/blueprints.json`

### Critérios de Sucesso

Ao final da implementação, teremos:

- ✅ Uma única coluna "Value" funcionando
- ✅ Estados visuais claros e distintos
- ✅ Fluxo Apply/Cancel com validação
- ✅ Funcionalidade específica para objetos
- ✅ Tradução completa EN/PT
- ✅ Zero quebra de funcionalidade existente

## Próximo Passo

Após compreender este contexto, prossiga para: **[Fase 1: Análise e Preparação](./phase-01-analysis-preparation.md)**

## Tempo Estimado: 10 minutos (leitura e preparação)
