# Prompts para Desenvolvimento do Blueprint Values Section

Este documento contém prompts estruturados para guiar o desenvolvimento incremental do Blueprint Values Section com o GitHub Copilot. Os prompts estão organizados em entregas progressivas que permitem implementar a funcionalidade completa enquanto mantém a possibilidade de entregar valor em cada etapa.

## Contexto do Projeto

O Blueprint Values Section é parte do fluxo de criação/edição de blueprints no DataOcean.InstanceManager. Este fluxo está sendo refatorado de um wizard modal para uma página dedicada com seções navegáveis, conforme descrito no documento `refactor.md`.

A estrutura de arquivos do projeto segue um padrão organizacional onde:

- Componentes de blueprint estão em `/src/components/blueprints/`
- Seções específicas estão em `/src/components/blueprints/sections/`
- A seção de valores default estará em `/src/components/blueprints/sections/DefaultValuesSection/`
- Componentes compartilhados estão em `/src/components/ui/`
- Contextos estão em `/src/contexts/`
- Hooks personalizados estão em `/src/hooks/`
- Serviços de API estão em `/src/services/`

## Entrega 1: Estrutura Base e Editor YAML

```
Ajude-me a implementar a primeira parte do Blueprint Values Section conforme descrito nos documentos refactor.md e blueprint-values.md. Esta seção faz parte do fluxo de criação/edição de blueprints.

Nesta primeira etapa, precisamos:

1. Criar a estrutura base de componentes:
   - /src/components/blueprints/sections/DefaultValuesSection/DefaultValuesSection.tsx como componente principal
   - /src/components/blueprints/sections/DefaultValuesSection/TemplateTabsNavigation.tsx para navegação entre templates
   - /src/components/blueprints/sections/DefaultValuesSection/TemplateValueEditor.tsx para editor YAML
   - /src/components/blueprints/sections/DefaultValuesSection/ValidationFeedback.tsx para feedback de erros
   - /src/components/blueprints/sections/DefaultValuesSection/types.ts para tipos e interfaces
   - /src/components/blueprints/sections/DefaultValuesSection/utils/yaml-validator.ts para validação de YAML

2. Implementar o modelo de dados completo desde o início:
   - Definir interfaces para DefaultValueField e TemplateDefaultValues
   - Incluir todos os campos necessários (key, value, source, overridable, exposed)
   - Seguir os padrões de tipagem do projeto existente

3. Desenvolver o editor YAML com:
   - Syntax highlighting usando Monaco Editor (já usado em outras partes do projeto)
   - Validação básica de sintaxe e schema
   - Persistência apenas dos valores modificados
   - Debouncing para validação (usar hook useDebounce existente)

4. Adicionar serviços para:
   - Estender template-service.ts para obter schemas e valores default
   - Integrar com o contexto de blueprint existente

Padrões a seguir:

- Todos os componentes devem ser funções com tipagem explícita de props
- Usar hook de tradução (useTranslation) para todas as strings visíveis
- Componentes devem ter data-testid para testes
- Utilizar componentes do design system (Button, Card, Tabs, etc.)
- Seguir padrão de error handling do projeto com try/catch e errorLogger
- Usar contexto BlueprintFormContext para estado global quando apropriado

Garanta que a seção possa ser acessada através da navegação de seções na página BlueprintCreationPage e que mantenha estado ao navegar entre diferentes seções.
```

## Entrega 2: Interface Tabular e Controle de Campos

```
Vamos implementar a interface tabular para o Blueprint Values Section conforme detalhado no documento blueprint-values.md. Esta seção faz parte do fluxo de criação/edição de blueprints e os arquivos estão organizados em /src/components/blueprints/sections/DefaultValuesSection/.

Precisamos:

1. Criar o componente TableView em /src/components/blueprints/sections/DefaultValuesSection/TableView.tsx:
   - Tabela hierárquica mostrando campos aninhados com indentação visual
   - Cabeçalho com: Campo, Tipo, Valor Default, Valor Blueprint, Expor, Permitir Override
   - Renderização específica por tipo de dado
   - Suporte para expansão/colapso de objetos aninhados
   - Usar componentes existentes como Table, Switch, Input do design system

2. Implementar componentes de edição específicos em /src/components/blueprints/sections/DefaultValuesSection/editors/:
   - StringEditor.tsx, NumberEditor.tsx, BooleanEditor.tsx, etc.
   - Cada editor deve validar conforme o tipo e schema (quando disponível)
   - Seguir o padrão de formulários usado em outras partes do aplicativo
   - Adicionar suporte para interpolação de variáveis

3. Adicionar alternância entre visualizações:
   - ViewToggle.tsx para alternar entre tabela e YAML
   - Sincronização bidirecional entre as duas visões
   - Persistir preferência do usuário no localStorage

4. Implementar FilterControls.tsx:
   - Campo de busca para filtrar por nome/caminho
   - Dropdown para filtrar por tipo (string, number, boolean, object)
   - Toggle para mostrar apenas campos personalizados
   - Toggle para mostrar apenas campos expostos

Padrões a seguir:

- Usar componentes do Shadcn UI ou equivalentes usados no projeto
- Implementar componentes pequenos e focados, seguindo SRP
- Manter a consistência visual com outras seções do blueprint
- Aproveitar hooks existentes como useDebounce para inputs
- Evitar prop drilling usando contextos quando apropriado
- Usar memo e callbacks para otimizar renderização de listas grandes
- Manter acessibilidade com labels, aria-* e navegação por teclado

Integrar todos estes componentes no DefaultValuesSection.tsx principal, mantendo o gerenciamento de estado consistente com o editor YAML já implementado.
```

## Entrega 3: Recursos Avançados e Integração

```
Para finalizar o Blueprint Values Section, vamos implementar os recursos avançados e integrar completamente com o fluxo de criação de blueprint. Esta seção está em /src/components/blueprints/sections/DefaultValuesSection/.

Precisamos:

1. Desenvolver o ContractPreview.tsx:
   - Visualização consolidada do contrato de configuração
   - Mostrar apenas campos que serão expostos às instâncias
   - Exibir valores default e permissões de override
   - Usar componente de código com highlight para JSON/YAML
   - Opção para download do contrato

2. Aprimorar a validação em utils/validators/:
   - schema-validator.ts para validar contra JSON Schema
   - variable-validator.ts para detectar e validar variáveis interpoladas
   - Integrar com o sistema de validação do BlueprintFormContext

3. Implementar recursos avançados de UX:
   - Adicionar tooltips com descrições dos campos do schema
   - Implementar ações em lote (ExposeAllFields.tsx, ResetToDefaults.tsx)
   - Adicionar indicadores visuais de modificação (badges, ícones)
   - Melhorar responsividade para diferentes tamanhos de tela

4. Integrar com o fluxo completo de blueprint:
   - Atualizar BlueprintCreationPage.tsx e BlueprintEditPage.tsx para incluir a nova seção
   - Estender BlueprintService para persistir o contrato completo
   - Implementar validação de completude para navegação entre seções
   - Adicionar tratamento de erros e feedback para o usuário

5. Adicionar testes:
   - Testes unitários para validadores e utilitários
   - Testes de componentes para os principais elementos de UI
   - Testes de integração para o fluxo completo

Padrões a seguir:

- Manter consistência com o contexto CreateBlueprintContext ou BlueprintFormContext
- Seguir o padrão de gerenciamento de estado já estabelecido no projeto
- Usar o sistema de notificação existente para erros e confirmações
- Manter todos os textos no sistema i18n em /src/locales/[lang]/blueprints.json
- Garantir que a seção funcione tanto para criação quanto para edição de blueprints
- Seguir convenções de nome de componentes e estrutura de diretórios do projeto
- Implementar error boundaries para prevenir falhas em cascata
- Adicionar comentários JSDoc em funções complexas

A seção deve estar completamente integrada ao fluxo de criação/edição, permitindo que usuários definam precisamente o contrato de configuração entre blueprint e instâncias, controlando valores default, exposição de campos e permissões de override.
```

## Notas para o Desenvolvimento

Ao implementar esses componentes, considere:

1. **Estado Global vs. Local**: Use o contexto `BlueprintFormContext` ou `CreateBlueprintContext` para estado que deve persistir entre navegação de seções, e estado local para UI e validações temporárias.

2. **Performance**: Para templates com muitos campos, considere virtualização ou paginação da tabela.

3. **Progressividade**: Embora estejamos desenvolvendo em entregas incrementais, o modelo de dados e APIs já devem contemplar a visão completa desde o início.

4. **Consistência**: Mantenha a mesma linguagem visual e comportamentos de outras seções do fluxo de criação de blueprint.

5. **Testes**: Adicione testes para todas as funcionalidades críticas, especialmente validações e transformações de dados.

## Referências

Para orientação adicional, consulte:

- `/docs/refactor.md`: Visão geral do plano de refatoração do blueprint
- `/docs/blueprint-values.md`: Especificação detalhada do Blueprint Values Section
- Arquivos existentes como `/src/components/blueprints/sections/MetadataSection` para exemplos de implementações de outras seções
