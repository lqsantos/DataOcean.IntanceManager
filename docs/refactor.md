# Plano de Refatoração: Blueprint Creation Flow

## Visão Geral

Este documento detalha um plano abrangente para refatorar o fluxo de criação de blueprints no DataOcean.InstanceManager. A refatoração transformará a abordagem atual baseada em wizard modal para uma experiência baseada em seções dinâmicas em uma página dedicada, além de adicionar novas funcionalidades como configuração de valores default por template.

## Princípios e Padrões de Codificação

Para garantir a qualidade e consistência do código durante esta refatoração, todos os desenvolvedores devem seguir estes princípios:

- **Componentização**: Dividir a UI em componentes reutilizáveis e testáveis, seguindo o padrão de Atomic Design
- **Testabilidade**: Incluir `data-testid` em todos os componentes interativos e implementar testes unitários
- **Mock de Dados**: Utilizar MSW (Mock Service Worker) para simular a API em desenvolvimento e testes
- **Tipagem Forte**: Usar TypeScript com tipagem rigorosa para todos os componentes e funções
- **Internacionalização**: Extrair textos para arquivos de tradução e usar o sistema i18n existente
- **Acessibilidade**: Seguir diretrizes WCAG 2.1 AA para todos os novos componentes
- **Hooks Personalizados**: Encapsular lógica de negócio em hooks reutilizáveis
- **Gestão de Estado**: Dividir estado entre contextos locais e globais conforme necessidade
- **Código Limpo**: Seguir princípios SOLID e manter a legibilidade como prioridade

## Objetivos

1. Migrar de um modal wizard para uma página dedicada de criação/edição
2. Implementar navegação por seções dinâmicas em vez de steps lineares
3. Adicionar uma nova seção para estabelecimento de contrato de configuração entre blueprint e instâncias
4. Implementar controles granulares de exposição e override para cada campo nos templates
5. Melhorar a visualização e interação durante o processo de criação
6. Implementar preview do resultado final

## Arquitetura Proposta

```
┌─ Blueprint Creation Page ─────────────────────────────────┐
│                                                           │
│  ┌─ Section Navigation ───────────────────────────────┐   │
│  │ Metadata | Templates | Variables | Defaults | Preview  │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ Section Content ─────────────────────────────────┐   │
│  │                                                   │   │
│  │  [Conteúdo dinâmico da seção atual]              │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ Action Controls ───────────────────────────────────┐  │
│  │  Save Draft | Cancel | Save & Create                │  │
│  └───────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────┘
```

## Plano de Entrega em Fases

### Fase 1: Preparação e Estrutura Base

#### Entrega 1.1: Scaffolding da Página Dedicada

- Criar novo componente `BlueprintCreationPage`
- Implementar layout básico com áreas para navegação e conteúdo
- Configurar rota `/blueprints/create` para a nova página
- Adicionar `BlueprintEditPage` para edição com URL pattern `/blueprints/edit/:id`

#### Entrega 1.2: Sistema de Navegação por Seções

- Implementar componente `SectionNavigation` com tabs para cada seção
- Desenvolver lógica para navegação direta entre seções não-sequencial
- Adicionar indicadores visuais de progresso/conclusão por seção
- Implementar persistência de estado entre mudanças de seção
- Criar sistema de validação independente para cada seção

#### Entrega 1.3: Gestão de Estado Global

- Refatorar contexto `CreateBlueprintContext` para suportar o novo fluxo baseado em seções
- Implementar lógica de salvamento parcial (drafts)
- Adicionar suporte para navegação não-linear entre seções sem perder dados
- Configurar validações independentes por seção
- Rastrear estado de completude de cada seção separadamente

### Fase 2: Migração e Adaptação das Seções Existentes

#### Entrega 2.1: Seção de Metadados

- Migrar componente `BasicInfoStep` para `MetadataSection`
- Adaptar layout para o novo formato de página
- Melhorar validações e feedback de erros
- Implementar salvamento automático

#### Entrega 2.2: Seção de Templates

- Migrar componente `TemplatesStep` para `TemplatesSection`
- Melhorar interface de seleção e organização de templates
- Adicionar funcionalidades de arrastar e soltar (drag & drop)
- Implementar visualização hierárquica de templates

#### Entrega 2.3: Seção de Variáveis

- Migrar componente `VariablesStep` para `VariablesSection`
- Adicionar pre visualização de uso das variáveis
- Melhorar editor de variáveis com sugestões e validação em tempo real
- Implementar categorização de variáveis

### Fase 3: Novas Funcionalidades

#### Entrega 3.1: Seção de Valores Default

- Criar novo componente `DefaultValuesSection`
- Implementar interface tabular para contrato de configuração
- Desenvolver controles granulares de exposição e permissões de override por campo
- Adicionar suporte para interpolação de variáveis
- Desenvolver validação contextual baseada nas variáveis e schema dos templates
- Implementar visualização de contrato final entre blueprint e instâncias
- Para detalhes completos, consultar o documento `/docs/blueprint-values.md`

#### Entrega 3.2: Seção de Preview

- Criar novo componente `PreviewSection`
- Implementar visualização do AppOfApps gerado
- Adicionar highlight de sintaxe para YAML/JSON
- Implementar opções para alternar entre visualizações

#### Entrega 3.3: Recursos Avançados de Preview

- Adicionar validação em tempo real da configuração
- Implementar detecção de potenciais problemas/conflitos
- Adicionar opção para download da configuração
- Criar simulador básico de deployment

### Fase 4: Melhorias de UX e Integração

#### Entrega 4.1: Navegação Avançada

- Implementar URLs dedicadas para cada seção (ex: `/blueprints/create/templates`)
- Adicionar atalhos de teclado para troca rápida entre seções
- Implementar sistema visual para indicar seções completadas/pendentes
- Adicionar histórico de navegação com estado preservado
- Desenvolver transições suaves entre seções com animações sutis

#### Entrega 4.2: Persistência de Dados

- Implementar salvamento automático em localStorage
- Adicionar recuperação de rascunhos
- Criar sistema de versionamento local de alterações
- Implementar detecção de conflitos em edições simultâneas

#### Entrega 4.3: Feedback e Validação

- Melhorar mensagens de erro e sugestões
- Implementar validação contextual entre seções
- Adicionar tooltips e ajuda contextual
- Implementar feedback visual de progresso

### Fase 5: Polimento e Otimização

#### Entrega 5.1: Responsividade e Acessibilidade

- Otimizar layout para diferentes tamanhos de tela
- Implementar modo responsivo para dispositivos móveis
- Melhorar acessibilidade (ARIA, contraste, navegação por teclado)
- Testar com leitores de tela

#### Entrega 5.2: Performance

- Otimizar renderização de componentes grandes
- Implementar carregamento lazy para seções
- Otimizar operações de salvamento e validação
- Adicionar indicadores de carregamento onde apropriado

#### Entrega 5.3: Documentação e Testes

- Atualizar documentação de usuário
- Criar testes E2E para o novo fluxo
- Adicionar testes unitários para novos componentes
- Implementar testes de acessibilidade

## Detalhamento Técnico das Seções

### 1. Seção de Metadados

**Objetivo**: Capturar informações básicas do blueprint.

**Campos**:

- Nome (obrigatório, mín. 3 caracteres)
- Versão (obrigatório, formato semântico)
- Descrição (opcional, suporte a markdown)
- Aplicação (obrigatório, seleção via dropdown)
- Tags (opcional, múltipla seleção)

**Componentes**:

- Formulário responsivo com grid layout
- Editor de markdown com preview
- Seletor de aplicação com busca
- Componente de tags com auto-complete

### 2. Seção de Templates

**Objetivo**: Selecionar e configurar templates que compõem o blueprint.

**Funcionalidades**:

- Lista de templates disponíveis com filtragem
- Área de seleção com drag & drop
- Configuração de ordem e dependências
- Definição de identificadores únicos

**Componentes**:

- Catálogo de templates com cards
- Lista ordenável de templates selecionados
- Formulário de configuração por template
- Visualizador de dependências

### 3. Seção de Variáveis

**Objetivo**: Definir variáveis para uso nos templates e valores default.

**Funcionalidades**:

- Editor de variáveis com nome, tipo, descrição
- Agrupamento de variáveis por categoria
- Validação de formato e unicidade
- Preview de uso das variáveis

**Componentes**:

- Tabela de variáveis editável
- Editor de variáveis avançado
- Visualizador de uso com highlight de sintaxe
- Sistema de sugestões automáticas

### 4. Seção de Valores Default

**Objetivo**: Estabelecer um contrato de configuração entre o blueprint e suas instâncias, definindo valores padrão, controle de exposição e permissões de override.

**Funcionalidades**:

- Interface baseada em tabela para controle de campo por campo
- Definição de origem dos valores (template ou blueprint)
- Controle de exposição de campos para instâncias
- Configuração de permissões de override por campo
- Interpolação de variáveis com autocompletion
- Validação contextual baseada em schema
- Preview do contrato de configuração resultante

**Componentes**:

- Tabs para navegação entre templates
- Visualização tabular hierárquica de campos
- Controles granulares de exposição e override
- Editor YAML alternativo para usuários avançados
- Sistema de validação em tempo real
- Filtros e buscas para campos em templates complexos

> **Nota**: Para detalhes completos sobre a implementação desta seção, consulte o documento [`/docs/blueprint-values.md`](../docs/blueprint-values.md) que contém a especificação detalhada da UI/UX, arquitetura de componentes, fluxo de usuário e responsabilidades entre frontend e backend.

### 5. Seção de Preview

**Objetivo**: Visualizar o resultado final do blueprint antes de salvar.

**Funcionalidades**:

- Visualização do AppOfApps gerado
- Validação de configuração completa
- Detecção de problemas potenciais
- Opções de download e compartilhamento

**Componentes**:

- Visualizador de YAML/JSON com highlight
- Lista de verificações e validações
- Botões de ação para finalização
- Opções de visualização alternativas

## Considerações Técnicas

### Gerenciamento de Estado

- Utilizar uma combinação de Context API para estado global
- Implementar persistência em localStorage para recuperação
- Considerar o uso de bibliotecas como Zustand para gerenciamento mais eficiente

### Navegação

- Implementar sistema de rotas aninhadas com React Router
- Manter estado na URL para compartilhamento e navegação entre seções
- Utilizar history API para preservação do estado durante navegação
- Implementar navegação direta entre seções via tabs em vez de fluxo linear

### Validação

- Implementar validação por seção e validação cruzada entre seções
- Utilizar Zod para schemas de validação tipados
- Adicionar validações contextuais baseadas em templates selecionados

### Performance

- Implementar virtualização para listas grandes (templates, variáveis)
- Usar memo e callbacks para otimizar renderizações
- Considerar code-splitting para carregamento lazy de seções

## Boas Práticas de Engenharia

### Componentização e Reuso

- Construir componentes modulares e reutilizáveis seguindo o princípio de responsabilidade única
- Implementar interfaces consistentes para componentes similares
- Criar componentes de UI desacoplados da lógica de negócio
- Manter uma estrutura de diretórios organizada seguindo o padrão já estabelecido no projeto

#### Documentação de Componentes

Para cada componente reutilizável, incluir:

```typescript
/**
 * SectionHeader - Componente para exibir o cabeçalho de uma seção na página de criação de blueprint
 *
 * @example
 * // Uso básico
 * <SectionHeader
 *   title="Metadados"
 *   description="Informações básicas sobre o blueprint"
 *   isCompleted={true}
 * />
 *
 * // Com ação personalizada
 * <SectionHeader
 *   title="Templates"
 *   description="Selecione os templates para este blueprint"
 *   isCompleted={false}
 *   action={<Button onClick={addTemplate}>Adicionar Template</Button>}
 * />
 *
 * @param {object} props
 * @param {string} props.title - Título da seção
 * @param {string} [props.description] - Descrição opcional da seção
 * @param {boolean} [props.isCompleted=false] - Se a seção foi preenchida corretamente
 * @param {ReactNode} [props.action] - Componente de ação opcional (botão, etc)
 */
export const SectionHeader = ({
  title,
  description,
  isCompleted = false,
  action,
}: SectionHeaderProps) => {
  // Implementação...
};
```

Esta documentação deve estar:

1. No arquivo do componente, logo antes da definição do componente
2. Seguindo o formato JSDoc para compatibilidade com IDEs e ferramentas
3. Incluindo ao menos um exemplo básico e um avançado quando aplicável

#### Documentação Adicional para Componentes Complexos

Para componentes mais complexos ou que exijam mais contexto, criar um arquivo README.md na pasta do componente:

```
/src/components/resources/blueprints/sections/
  ├── DefaultValuesSection/
  │   ├── DefaultValuesSection.tsx
  │   ├── DefaultValueForm.tsx
  │   ├── TemplateSelector.tsx
  │   └── README.md
```

Exemplo de conteúdo para o README.md:

````markdown
# DefaultValuesSection

Este componente gerencia o contrato de configuração entre blueprint e instâncias, permitindo definir valores padrão, exposição de campos e permissões de override.

## Uso

```tsx
<DefaultValuesSection
  templates={selectedTemplates}
  variables={definedVariables}
  defaultValuesContract={existingContract}
  onChange={handleContractChange}
/>
```

### Fluxo de Dados

1. O componente carrega schemas/valores para templates selecionados
2. Para cada template, exibe uma interface de controle por campo
3. Usuário define para cada campo:
   - Se o valor vem do template ou é definido no blueprint
   - Se o campo é exposto para as instâncias
   - Se as instâncias podem sobrescrever o valor
4. Valores podem incluir interpolações com a sintaxe Helm `{{ .Values.variableName }}`
5. O componente gera e persiste um contrato de configuração

### Componentes Internos

- **TemplateTabsNavigation**: Navegação entre templates do blueprint
- **TemplateFieldsTable**: Interface tabular de controle por campo
- **TemplateYamlEditor**: Editor alternativo para usuários avançados
- **ValidationFeedback**: Exibição de erros e avisos de validação
- **ContractPreview**: Visualização do contrato resultante

### Dependências

- Depende de templates selecionados na seção de Templates
- Utiliza schema dos templates para renderização baseada em tipo
- Para detalhes completos de implementação, ver `/docs/blueprint-values.md`
````

### Arquivos de Índice como Documentação

Usar arquivos index.ts para documentar a API pública de um módulo:

```typescript
/**
 * Módulo de Seções de Blueprint
 *
 * Este módulo contém os componentes para cada seção do fluxo de criação de blueprint.
 * Cada seção representa uma etapa distinta no processo de criação.
 */

// Seção de informações básicas do blueprint
export { MetadataSection } from './MetadataSection/MetadataSection';

// Seção para selecionar e configurar templates
export { TemplatesSection } from './TemplatesSection/TemplatesSection';

// Seção para definir variáveis do blueprint
export { VariablesSection } from './VariablesSection/VariablesSection';

// Seção para configurar valores padrão por template
export { DefaultValuesSection } from './DefaultValuesSection/DefaultValuesSection';

// Seção de prévia do blueprint final
export { PreviewSection } from './PreviewSection/PreviewSection';

// Tipos compartilhados entre as seções
export type { SectionProps } from './types';
```

Essas práticas de documentação são:

1. **Integradas ao código**: Ficam próximas ao código que documentam
2. **Fáceis de manter**: São atualizadas junto com o código
3. **Acessíveis**: Visíveis diretamente no IDE através de tooltips e autocompletion
4. **Úteis para novos desenvolvedores**: Fornecem exemplos práticos e contexto

#### Testing

- Adicionar atributos `data-testid` para todos os componentes interativos e principais
- Seguir padrão consistente de nomenclatura: `[componente]-[elemento]-[ação]` (ex: `template-card-remove`)
- Implementar testes unitários para cada componente novo ou modificado
- Desenvolver testes de integração para validar o fluxo entre seções
- Criar testes E2E para cenários completos de criação de blueprint

### Mock Service Worker (MSW)

- Expandir handlers existentes para suportar todos os novos endpoints e campos
- Implementar comportamentos realistas nos mocks (validações, erros, etc.)
- Criar fixtures reutilizáveis para cada tipo de entidade
- Manter sincronização entre os schemas da API real e os mocks
- Adicionar delay configurável para simular latência de rede em modo de desenvolvimento

### Acessibilidade

- Garantir que todos os componentes sejam navegáveis por teclado
- Implementar ARIA labels e roles apropriadamente
- Manter contraste adequado para todos os elementos visuais
- Testar com leitores de tela
- Implementar feedback não-visual para ações e erros

### Internacionalização

- Extrair todas as strings para arquivos de tradução
- Usar chaves de tradução consistentes seguindo padrão ja estabelecido pelo projeto.

### Versionamento e Documentação

- Documentar de forma clara todas as mudanças na API
- Adicionar comentários JSDoc para funções e componentes complexos
- Criar documentação de uso para novas funcionalidades

## Mudanças nos Serviços e APIs

### Serviço de Blueprints

- Adicionar suporte para salvamento parcial (rascunhos)
- Estender endpoints para incluir contrato de configuração (valores, exposição, permissões)
- Fornecer schemas de templates para renderização orientada a tipo
- Implementar validação de contrato de configuração no servidor
- Validar blueprint completo antes de salvar

### API Mock com MSW

- Atualizar handlers MSW em `src/mocks/handlers` para suportar novos campos e estruturas
- Implementar validações completas nos handlers MSW, similares às do ambiente de produção
- Criar factories dedicadas para geração de dados de teste consistentes
- Implementar geração realista de previews
- Simular cenários de erro e edge cases para testar robustez da UI
- Manter sincronização rigorosa entre o contrato da API e os handlers MSW

## Considerações de UI/UX

- Manter consistência visual com o restante da aplicação
- Utilizar indicadores claros de progresso e validação para cada seção
- Fornecer feedback imediato sobre ações e erros contextuais à seção atual
- Implementar animações sutis para transições entre seções
- Garantir que o processo seja interrompível e recuperável
- Destacar visualmente a seção atual na navegação
- Permitir que usuários naveguem livremente entre seções já preenchidas
- Indicar claramente quando uma seção depende de dados de outra seção

## Testes e Qualidade

### Estratégia de Testes

- Desenvolver testes unitários para todos os novos componentes usando Vitest
- Implementar testes de integração para fluxos completos com React Testing Library
- Criar testes E2E simulando criação de blueprints com Playwright ou Cypress
- Estabelecer pipelines CI/CD para execução automatizada de todos os testes
- Implementar relatórios de cobertura de código e estabelecer limites mínimos

### Garantia de Qualidade

- Testar em diferentes tamanhos de tela e navegadores
- Validar acessibilidade em cada entrega usando ferramentas automatizadas
- Realizar revisões de código focadas em performance e acessibilidade
- Implementar análise estática de código com ESLint e regras personalizadas
- Estabelecer testes de regressão visual para componentes críticos

### Ferramentas e Práticas

- Padronizar o uso de `data-testid` em todos os componentes testáveis
- Utilizar MSW para mocks realistas em testes e desenvolvimento
- Implementar fixture factories para geração consistente de dados de teste
- Adotar abordagem TDD (Test-Driven Development) para novos componentes críticos
- Configurar ambientes de teste que simulem condições reais de produção

## Conclusão

Este plano de refatoração transformará o processo de criação de blueprints em uma experiência mais robusta, flexível e amigável. Ao dividir o trabalho em entregas menores e sequenciais, podemos garantir um progresso constante e resultados incrementais visíveis. A abordagem de seções dinâmicas em uma página dedicada permitirá maior flexibilidade para os usuários e possibilitará a implementação de recursos avançados como configuração de valores default por template e visualização prévia do resultado final.
