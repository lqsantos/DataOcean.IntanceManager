# 🏗️ Estratégia de Organização por Features - DataOcean Instance Manager

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Análise dos Domínios de Negócio](#análise-dos-domínios-de-negócio)
- [Estratégia de Migração](#estratégia-de-migração)
- [Estrutura Target](#estrutura-target)
- [Roadmap de Implementação](#roadmap-de-implementação)
- [Ferramentas e Metodologia](#ferramentas-e-metodologia)

---

## 🎯 Visão Geral

Este documento define a estratégia para reorganizar o código do DataOcean Instance Manager de uma arquitetura baseada em **tipos técnicos** para uma arquitetura baseada em **features/domínios de negócio**.

### Objetivo Principal

Transformar a estrutura atual:

```
src/
├── components/     # Por tipo técnico
├── hooks/         # Por tipo técnico
├── services/      # Por tipo técnico
└── types/         # Por tipo técnico
```

Para uma estrutura orientada a domínios:

```
src/
├── features/      # Por domínio de negócio
├── shared/        # Código compartilhado
└── lib/          # Infraestrutura core
```

---

## 🔍 Análise dos Domínios de Negócio

### 📊 Domínios Identificados

Com base na análise da estrutura atual do projeto, identificamos os seguintes domínios de negócio:

#### **1. Foundation Domains (CRUD Simples)**

> **Características**: Operações básicas, baixa complexidade, poucos contextos específicos

- **Applications** 📱

  - Gestão de aplicações da plataforma
  - CRUD básico com formulários simples
  - Relacionamento com outros domínios

- **Environments** 🌍

  - Gestão de ambientes (development, staging, production)
  - Configurações específicas por ambiente
  - Integração com deploy workflows

- **Locations** 📍

  - Gestão de localizações/datacenters
  - Configurações geográficas
  - Distribuição de recursos

- **Clusters** ⚙️
  - Gestão de clusters Kubernetes
  - Configurações de infraestrutura
  - Status e monitoramento

#### **2. Orchestration Domains (CRUD Complexo)**

> **Características**: Fluxos complexos, múltiplos contextos, validações avançadas

- **Blueprints** 📋

  - Templates/blueprints com fluxo multistepper
  - Contextos complexos (create-blueprint-context, blueprint-form-context)
  - Validações e formulários avançados
  - Seções modulares (metadata, templates, variables, values, preview)

- **Templates** 📄

  - Templates Helm com validação e schema
  - Catálogo de templates
  - Schema validation e Git integration
  - Template schema service

- **Instances** 🚀 _(Futuro)_
  - Criação e gestão de instâncias
  - Orquestração completa de deployments
  - Customização de valores

### 🔗 Mapeamento de Complexidade

| Domínio      | Complexidade        | Contextos | Components | Prioridade Migração |
| ------------ | ------------------- | --------- | ---------- | ------------------- |
| Applications | ⭐ Baixa            | 0-1       | 3-5        | 1️⃣ Primeira         |
| Environments | ⭐ Baixa            | 0-1       | 3-5        | 1️⃣ Primeira         |
| Locations    | ⭐ Baixa            | 0-1       | 3-5        | 1️⃣ Primeira         |
| Clusters     | ⭐⭐ Média          | 1-2       | 5-8        | 2️⃣ Segunda          |
| Templates    | ⭐⭐⭐ Alta         | 2-3       | 8-12       | 3️⃣ Terceira         |
| Blueprints   | ⭐⭐⭐⭐ Muito Alta | 4+        | 15+        | 3️⃣ Terceira         |

---

## 🚀 Estratégia de Migração

### 🎯 Princípios Orientadores

1. **Migração Incremental**: Uma feature por vez, validando a cada etapa
2. **Baixo Risco**: Começar pelos domínios mais simples
3. **Preservação de Funcionalidade**: Manter 100% da funcionalidade existente
4. **Mínimo Impacto**: Mudanças que não quebrem imports existentes

### 📋 Fases de Migração

#### **Phase 1: Foundation Domains** _(Baixo Risco)_

**Ordem de Migração:**

1. **Applications** - CRUD mais simples, menos dependências
2. **Environments** - Estrutura similar ao Applications
3. **Locations** - Funcionalidade independente
4. **Clusters** - Maior complexidade, mas ainda manageable

**Por que esta ordem?**

- Menor impacto em outras features
- Padrões mais simples para estabelecer convenções
- Rápida validação da abordagem

#### **Phase 2: Orchestration Domains** _(Alto Risco)_

**Ordem de Migração:**

1. **Templates** - Base para Blueprints, independente
2. **Blueprints** - Mais complexo, depende de Templates

**Por que esta ordem?**

- Templates é base fundamental para Blueprints
- Blueprints tem maior complexidade contextual
- Validação cuidadosa necessária

### ⚠️ Fatores de Risco Identificados

#### **🚨 Risco Crítico:**

- **Blueprints**: Duas implementações coexistindo, múltiplos contextos, workflows complexos, 40+ arquivos
- **Cross-implementation consistency**: Manter funcionalidades durante consolidação

#### **⚠️ Alto Risco:**

- **Templates**: Schema validation, Git integration, dependência crítica dos Blueprints
- **Cross-domain imports**: Shared components entre features
- **State management**: Context + Store + Form state distribuído

#### **📋 Médio Risco:**

- **Type definitions**: Shared types entre domínios
- **Service integration**: API calls e error handling
- **Validation systems**: Form validation + business rules

#### **✅ Baixo Risco:**

- **Foundation domains**: CRUD simples, poucos contextos
- **Isolated features**: Funcionalidades independentes

### 📊 Complexidade por Domínio (Detalhada)

| Domínio        | Complexidade | Arquivos | Contextos | Workflows            | Risco       | Prioridade |
| -------------- | ------------ | -------- | --------- | -------------------- | ----------- | ---------- |
| Applications   | ⭐           | ~8       | 0-1       | CRUD básico          | Baixo       | 1️⃣         |
| Environments   | ⭐           | ~8       | 0-1       | CRUD básico          | Baixo       | 1️⃣         |
| Locations      | ⭐           | ~8       | 0-1       | CRUD básico          | Baixo       | 1️⃣         |
| Clusters       | ⭐⭐         | ~12      | 1-2       | CRUD + Status        | Médio       | 2️⃣         |
| Templates      | ⭐⭐⭐       | ~15      | 2-3       | CRUD + Validation    | Alto        | 3️⃣         |
| **Blueprints** | ⭐⭐⭐⭐⭐   | **40+**  | **6+**    | **2 implementações** | **Crítico** | 🚨         |

#### **Baixo Risco:**

- **Foundation domains**: CRUD simples, poucos contextos
- **Isolated features**: Funcionalidades independentes

---

## 🏗️ Estrutura Target

### 📁 Nova Organização de Diretórios

```
src/
├── features/                   # Features/domínios de negócio
│   ├── applications/          # 📱 Application management
│   │   ├── components/        # Components específicos
│   │   ├── hooks/            # Hooks específicos
│   │   ├── services/         # Services específicos
│   │   ├── types/            # Types específicos
│   │   └── index.ts          # Public API
│   │
│   ├── environments/         # 🌍 Environment management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── locations/            # 📍 Location management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── clusters/             # ⚙️ Cluster management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── templates/            # 📄 Template management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── blueprints/           # 📋 Blueprint management
│       ├── components/
│       │   ├── sections/     # Seções específicas do stepper
│       │   ├── forms/        # Formulários específicos
│       │   └── ui/          # UI components específicos
│       ├── contexts/         # Contextos específicos
│       ├── hooks/           # Hooks específicos
│       ├── services/        # Services específicos
│       ├── types/           # Types específicos
│       └── index.ts         # Public API
│
├── shared/                    # Código compartilhado entre features
│   ├── components/           # Components reutilizáveis
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # Form components genéricos
│   │   ├── tables/          # Table components genéricos
│   │   └── layout/          # Layout components
│   ├── hooks/               # Hooks genéricos
│   │   ├── use-api.ts       # API hooks genéricos
│   │   ├── use-form.ts      # Form hooks genéricos
│   │   └── use-table.ts     # Table hooks genéricos
│   ├── utils/               # Utility functions
│   ├── types/               # Types compartilhados
│   └── constants/           # Constants globais
│
├── lib/                      # Core infrastructure
│   ├── api/                 # API client setup
│   ├── store/               # State management (Zustand)
│   ├── i18n/                # Internationalization
│   ├── router/              # Router setup
│   └── utils/               # Core utilities
│
└── app/                      # Next.js app router pages
    ├── (routes)/            # Route groups
    └── globals.css          # Global styles
```

### 🔄 Padrão de Feature Interna

Cada feature seguirá uma estrutura consistente:

```
features/[feature-name]/
├── components/              # Components específicos da feature
│   ├── [Feature]Table.tsx   # Tabela principal
│   ├── [Feature]Form.tsx    # Formulário principal
│   ├── [Feature]Modal.tsx   # Modal específico
│   └── index.ts            # Exports dos components
├── hooks/                   # Hooks específicos
│   ├── use-[feature].ts     # Hook principal de dados
│   ├── use-[feature]-form.ts # Hook de formulário
│   └── index.ts            # Exports dos hooks
├── services/               # Services específicos
│   ├── [feature]-service.ts # Service principal
│   └── index.ts            # Exports dos services
├── types/                  # Types específicos
│   ├── [feature].ts        # Types principais
│   └── index.ts            # Exports dos types
└── index.ts               # Public API da feature
```

### 📤 Public API Pattern

Cada feature exporta uma API pública limpa:

```typescript
// features/applications/index.ts
export { ApplicationTable, ApplicationForm } from './components';
export { useApplications, useApplicationForm } from './hooks';
export { applicationService } from './services';
export type { Application, ApplicationFormData } from './types';
```

---

## 📅 Roadmap de Implementação

### 🎯 Milestone 1: Foundation Setup _(1-2 dias)_

- [ ] Criar estrutura base de `features/` e `shared/`
- [ ] Migrar **Applications** como prova de conceito
- [ ] Estabelecer padrões e convenções
- [ ] Validar funcionamento com Applications

### 🎯 Milestone 2: Foundation Domains _(3-5 dias)_

- [ ] Migrar **Environments**
- [ ] Migrar **Locations**
- [ ] Migrar **Clusters**
- [ ] Consolidar shared components identificados

### 🎯 Milestone 3: Orchestration Domains _(5-7 dias)_

- [ ] Migrar **Templates**
- [ ] **Consolidar Blueprints** (página dedicada exclusiva)
  - [ ] Migrar implementação `blueprints/` para `features/blueprints/`
  - [ ] Preservar componentes úteis da implementação modal
  - [ ] Remover implementação modal (`resources/blueprints`)
  - [ ] Atualizar Resources page para redirecionamentos
- [ ] Validação final da arquitetura

### 🎯 Milestone 4: Cleanup & Optimization _(1-2 dias)_

- [ ] Remover estruturas antigas
- [ ] Otimizar imports
- [ ] Documentar nova arquitetura
- [ ] Atualizar padrões de desenvolvimento

**Total Estimado: 10-16 dias de trabalho**

---

## 🔧 Ferramentas e Metodologia

### 🤖 Ferramentas do Copilot Agent

Para cada migração, utilizaremos:

1. **grep_search**: Encontrar imports, dependencies, shared code
2. **file_search**: Localizar arquivos relacionados por domínio
3. **semantic_search**: Entender relacionamentos conceituais
4. **list_code_usages**: Mapear uso de hooks, services, components

### 📋 Processo de Migração por Feature

#### **1. Investigation Phase**

- Usar `semantic_search` para entender o domínio
- Usar `file_search` para mapear arquivos relacionados
- Usar `grep_search` para encontrar dependencies
- Usar `list_code_usages` para mapear imports

#### **2. Analysis Phase**

- Mapear dependencies entre features
- Identificar shared code
- Avaliar complexidade de migração
- Identificar riscos potenciais

#### **3. Planning Phase**

- Propor estrutura específica da feature
- Definir API pública da feature
- Planejar ordem de migração de arquivos
- Identificar shared components

#### **4. Implementation Phase**

- Criar estrutura da feature
- Migrar arquivos um a um
- Manter imports funcionando
- Validar funcionamento

#### **5. Validation Phase**

- Testar funcionalidade migrada
- Validar imports e exports
- Verificar não há regressões
- Atualizar documentação

### 📊 Output Esperado por Feature

Para cada feature migrada, produzir:

1. **📋 Relatório de Análise**

   - Arquivos identificados
   - Dependencies mapeadas
   - Shared code identificado
   - Complexidade avaliada

2. **🏗️ Proposta de Estrutura**

   - Organização interna da feature
   - API pública definida
   - Shared components identificados

3. **⚠️ Análise de Riscos**

   - Dependencies críticas
   - Potential breaking changes
   - Mitigation strategies

4. **✅ Plano de Validação**
   - Testes necessários
   - Validações funcionais
   - Checklist de qualidade

---

## 📋 Considerações Especiais

### 🎯 Caso Especial: Blueprints - Duas Implementações Coexistindo

Os Blueprints representam um caso único no projeto devido à **evolução arquitetural** que está acontecendo:

#### **📍 Implementação Atual: `src/components/resources/blueprints`**

> **Abordagem**: Página de Resources com modal multistepper

**Características:**

- **Modal-based**: Criação via `CreateBlueprintModal` com stepper
- **Multistepper workflow**: 4 steps lineares (Basic Info → Templates → Variables → Preview)
- **Resources page integration**: Integrado na página geral de Resources
- **Limitações identificadas**: Modal restritivo para fluxo complexo

**Estrutura atual:**

```
src/components/resources/blueprints/
├── blueprint-card.tsx
├── blueprint-edit-page.tsx        # Página de edição dedicada
├── blueprint-form.tsx             # Formulário multistepper
├── create-blueprint-modal.tsx     # Modal de criação
├── steps/                         # Steps do wizard
│   ├── basic-info-step.tsx
│   ├── templates-step/
│   ├── variables-step.tsx
│   └── preview-step.tsx
└── hooks/
    └── use-template-selection.ts
```

#### **🚀 Implementação Nova: `src/components/blueprints`**

> **Abordagem**: Página dedicada com navegação por abas

**Características:**

- **Dedicated page**: `BlueprintCreationPage` como tela dedicada
- **Tab-based navigation**: Navegação por abas ao invés de steps lineares
- **Shared editor**: `BlueprintEditor` compartilhado entre create/edit
- **Enhanced UX**: Maior flexibilidade de navegação e espaço

**Estrutura target:**

```
src/components/blueprints/
├── creation/
│   └── BlueprintCreationPage.tsx  # Tela dedicada de criação
├── edit/
│   └── BlueprintEditPage.tsx      # Tela dedicada de edição
├── sections/                      # Seções modulares
│   ├── MetadataSection.tsx
│   ├── TemplatesSection.tsx
│   ├── VariablesSection.tsx
│   └── ValuesSection.tsx          # Nova seção para valores
├── shared/
│   └── BlueprintEditor.tsx        # Editor compartilhado
└── index.ts
```

#### **🔄 Estratégia de Migração dos Blueprints**

**Decisão: Página Dedicada Exclusiva**

**Fase 1: Consolidação e Análise**

1. **Usar implementação `blueprints/` como base** (mais moderna, com abas)
2. **Mapear funcionalidades da implementação `resources/blueprints`** que devem ser preservadas
3. **Descartar modal multistepper** em favor da página dedicada

**Fase 2: Migração para Features**

1. **Migrar** implementação `blueprints/` para `features/blueprints/`
2. **Consolidar** componentes úteis da implementação modal
3. **Unificar** contexts, hooks e services

**Fase 3: Estrutura Final**

```
features/blueprints/
├── components/
│   ├── creation/           # Criação de blueprints
│   │   └── BlueprintCreationPage.tsx
│   ├── edit/               # Edição de blueprints
│   │   └── BlueprintEditPage.tsx
│   ├── sections/           # Seções modulares (abas)
│   │   ├── MetadataSection.tsx
│   │   ├── TemplatesSection.tsx
│   │   ├── VariablesSection.tsx
│   │   └── ValuesSection.tsx
│   ├── shared/             # Components compartilhados
│   │   ├── BlueprintEditor.tsx
│   │   └── SectionNavigation.tsx
│   └── list/               # Para Resources page
│       ├── BlueprintCard.tsx
│       └── BlueprintTable.tsx
├── contexts/               # Contexto unificado
│   └── blueprint-form-context.tsx
├── hooks/                  # Hooks específicos
├── services/               # Services específicos
└── types/                  # Types específicos
```

**Fase 4: Descarte e Integração**

1. **Remover** implementação modal (`src/components/resources/blueprints/`)
2. **Atualizar Resources page** para redirecionar para páginas dedicadas
3. **Otimizar** imports e finalizar migração

---

## 📄 **Templates: Análise e Estratégia de Migração**

### ⚖️ **Templates: Estrutura Atual Analisada**

**Decisão: Modal-Based Workflow Simples**

Diferentemente dos Blueprints, Templates seguem um padrão mais simples baseado em modal único para workflow completo, adequado à sua menor complexidade.

#### **🏗️ Implementação Atual: `src/components/resources/templates`**

**Características:**

- **Resource page**: `ResourceTemplatesPage` como página principal de listagem
- **Modal-based workflow**: `CreateTemplateModal` para criação/edição
- **Simple form**: `ResourceTemplateForm` com validação integrada
- **Table view**: `ResourceTemplatesTable` para visualização e ações
- **Direct validation**: `DirectValidateButton` para validação inline

**Estrutura atual:**

```
src/components/resources/templates/
├── resource-templates-page.tsx       # Página principal (tabela + filtros)
├── resource-templates-table.tsx      # Tabela com ações inline
├── create-template-modal.tsx         # Modal de criação
├── resource-template-form.tsx        # Formulário de template
├── direct-validate-button.tsx        # Botão de validação inline
├── select-branch-dialog.tsx          # Dialog de seleção de branch
└── delete-resource-template-dialog.tsx # Dialog de confirmação de exclusão
```

#### **🔄 Estratégia de Migração dos Templates**

**Decisão: Modal Workflow Exclusivo**

**Características dos Templates que justificam modal:**

- **Formulário simples**: 5 campos básicos (name, description, category, repositoryUrl, chartPath)
- **Validação inline**: DirectValidateButton integrado ao formulário
- **Workflow linear**: Criação → Preenchimento → Validação → Submissão
- **Menor complexidade**: Sem múltiplas seções ou estados complexos

**Fase 1: Migração para Features**

1. **Manter estrutura modal** como apropriada para Templates
2. **Migrar** implementação atual para `features/templates/`
3. **Consolidar** components de visualização (table, filters)
4. **Preservar** validação inline e direct validation

**Fase 2: Estrutura Target**

```
features/templates/
├── components/
│   ├── list/                          # Componentes de visualização
│   │   ├── TemplatesTable.tsx         # Tabela principal
│   │   ├── TemplateFilters.tsx        # Filtros de busca
│   │   └── TemplateActions.tsx        # Ações da tabela
│   ├── forms/                         # Componentes de formulário
│   │   ├── TemplateForm.tsx           # Formulário principal
│   │   ├── CreateTemplateModal.tsx    # Modal de criação
│   │   └── EditTemplateModal.tsx      # Modal de edição
│   ├── validation/                    # Componentes de validação
│   │   ├── DirectValidateButton.tsx   # Validação inline
│   │   └── ValidationResults.tsx      # Resultados de validação
│   └── dialogs/                       # Dialogs auxiliares
│       ├── SelectBranchDialog.tsx     # Seleção de branch
│       └── DeleteTemplateDialog.tsx   # Confirmação de exclusão
├── hooks/
│   ├── use-templates.ts               # Hook principal de dados
│   ├── use-template-form.ts           # Hook de formulário
│   └── use-template-validation.ts     # Hook de validação
├── services/
│   └── template-service.ts            # Service de templates
├── types/
│   └── template.ts                    # Types de templates
└── index.ts                          # Public API
```

#### **📋 Componentes a Migrar - Templates**

**Componentes a migrar para features:**

```
src/components/resources/templates/
├── ✅ resource-templates-page.tsx → features/templates/components/list/TemplatesPage.tsx
├── ✅ resource-templates-table.tsx → features/templates/components/list/TemplatesTable.tsx
├── ✅ create-template-modal.tsx → features/templates/components/forms/CreateTemplateModal.tsx
├── ✅ resource-template-form.tsx → features/templates/components/forms/TemplateForm.tsx
├── ✅ direct-validate-button.tsx → features/templates/components/validation/DirectValidateButton.tsx
├── ✅ select-branch-dialog.tsx → features/templates/components/dialogs/SelectBranchDialog.tsx
└── ✅ delete-resource-template-dialog.tsx → features/templates/components/dialogs/DeleteTemplateDialog.tsx
```

**Nenhum componente a descartar** - todos são relevantes para a funcionalidade.

---

## 🎯 **Estratégia Consolidada: Blueprints vs Templates**

### 📊 **Comparativo de Abordagens**

| **Aspecto**       | **Blueprints**                         | **Templates**              |
| ----------------- | -------------------------------------- | -------------------------- |
| **Complexidade**  | Alta (múltiplas seções, valores)       | Baixa (formulário simples) |
| **Workflow**      | Página dedicada + abas                 | Modal único                |
| **Justificativa** | Espaço para complexidade               | Adequado para simplicidade |
| **Navegação**     | Abas não-lineares                      | Linear simples             |
| **Seções**        | Metadata, Templates, Variables, Values | Formulário único           |
| **Validação**     | Complexa (schema, variáveis)           | Simples (inline)           |

### 🏗️ **Padrões Arquiteturais por Domínio**

#### **Blueprints: Página Dedicada**

```
/blueprints/create → Página completa com navegação por abas
/blueprints/edit/:id → Página completa com navegação por abas

Características:
- Tab-based navigation para flexibilidade
- Multiple sections (Metadata, Templates, Variables, Values)
- Complex validation and schema management
- Shared editor entre create/edit
```

#### **Templates: Modal Workflow**

```
/resources/templates → Página de listagem
Modal → Create/Edit inline na mesma página

Características:
- Modal único para create/edit
- Simple form com 5 campos
- Direct validation inline
- Table-based view com ações integradas
```

### 🎨 **Design Patterns Específicos**

#### **Blueprint Pattern: Complex Dedicated Workflow**

- **When to use**: Workflows complexos com múltiplas seções interdependentes
- **Components**: Page + Tabs + Sections + Shared Editor
- **Navigation**: Non-linear tab-based
- **State Management**: Complex context with multiple data types

#### **Template Pattern: Simple Modal Workflow**

- **When to use**: Formulários simples com validação básica
- **Components**: Page + Table + Modal + Form
- **Navigation**: Linear modal-based
- **State Management**: Simple form state

### 🚀 **Roadmap de Implementação Consolidado**

#### **Ordem de Migração Recomendada**

1. **🥇 Templates (2-3 days)**

   - Menor complexidade, maior ROI
   - Base independente para testes do padrão
   - Validação da estratégia de features

2. **🥈 Blueprints (8-12 days)**
   - Maior complexidade, consolida a arquitetura
   - Implementa padrões avançados
   - Finaliza a migração completa

#### **Marcos de Validação**

- [ ] **M1**: Templates migrados e funcionais
- [ ] **M2**: Padrão de features validado
- [ ] **M3**: Blueprints migrados e funcionais
- [ ] **M4**: Arquitetura consolidada documentada

### 📋 **Template Final: Features Organization**

```
features/
├── templates/                    # 📄 Template Pattern: Simple Modal
│   ├── components/
│   │   ├── list/                # Table, filters, page
│   │   ├── forms/               # Modal, form components
│   │   ├── validation/          # Direct validation
│   │   └── dialogs/             # Support dialogs
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── index.ts
├── blueprints/                  # 📘 Complex Pattern: Dedicated Workflow
│   ├── components/
│   │   ├── list/                # Cards, tables (visualization)
│   │   ├── creation/            # Dedicated creation page
│   │   ├── edit/                # Dedicated edit page
│   │   ├── sections/            # Tab sections
│   │   └── shared/              # Shared editor components
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── index.ts
└── [other-features]/            # Follow appropriate pattern
```

### ✅ **Conclusões e Próximos Passos**

#### **Estratégia Finalizada**

1. **✅ Blueprints**: Página dedicada com abas (complexidade alta)
2. **✅ Templates**: Modal workflow (complexidade baixa)
3. **✅ Padrões**: Definidos por complexidade do domínio
4. **✅ Migração**: Templates → Blueprints (ordem de dependência)

#### **Próximas Ações**

- [ ] **Executar migração de Templates** seguindo o padrão documentado
- [ ] **Validar funcionamento** e ajustar padrões se necessário
- [ ] **Executar migração de Blueprints** com base no aprendizado
- [ ] **Documentar template final** para novas features

---

**🎯 Template exemplar para uso com Copilot Agent: Finalizado**
