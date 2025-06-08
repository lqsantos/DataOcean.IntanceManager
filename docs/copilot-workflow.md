# Guia de Trabalho com GitHub Copilot para Refatoração

Este documento contém orientações e exemplos práticos para trabalhar com GitHub Copilot no modo agente durante a implementação do plano de refatoração do fluxo de criação de blueprints, conforme detalhado no arquivo `refactor.md`.

## Índice

1. [Visão Geral das Estratégias](#visão-geral-das-estratégias)
2. [Abordagem para Implementação com Copilot](#abordagem-para-implementação-com-copilot)
   - [Preparação Inicial](#preparação-inicial)
   - [Fluxo de Trabalho para Micro-Entregas](#fluxo-de-trabalho-para-micro-entregas)
3. [Exemplos Práticos de Prompts para o Copilot](#exemplos-práticos-de-prompts-para-o-copilot)
4. [Superando Desafios Comuns com o Copilot](#superando-desafios-comuns-com-o-copilot)
5. [Prompts para Micro-Entregas Específicas](#prompts-para-micro-entregas-específicas)
6. [Meta-Prompt para Geração de Prompts Específicos](#meta-prompt-para-geração-de-prompts-específicos)
   - [Como Usar o Meta-Prompt](#como-usar-o-meta-prompt)
   - [Exemplo de Uso](#exemplo-de-uso)
   - [Benefícios do Meta-Prompting](#benefícios-do-meta-prompting)

## Visão Geral das Estratégias

Este guia apresenta duas estratégias complementares para trabalhar com o Copilot na implementação do plano de refatoração:

1. **Abordagem Direta**: Solicitar implementações específicas usando prompts pré-definidos
2. **Meta-Prompting**: Usar o Copilot para gerar prompts específicos e detalhados para cada entrega (recomendado para entregas complexas)

A estratégia de **Meta-Prompting** é especialmente poderosa, pois permite que o Copilot analise primeiro os requisitos e crie um prompt detalhado antes de implementar o código. Isso resulta em implementações mais precisas e alinhadas com o plano de refatoração. Veja a seção "Meta-Prompt para Geração de Prompts Específicos" para detalhes completos sobre esta abordagem.

## Abordagem para Implementação com Copilot

Esta refatoração pode ser implementada progressivamente usando GitHub Copilot no modo agente. Aqui está uma estratégia passo a passo para maximizar a eficácia do Copilot:

### Preparação Inicial

1. **Contextualize o Copilot**:

   - Abra o documento de refatoração em uma aba
   - Use: "Leia este documento de refatoração e entenda a estrutura do projeto"
   - Depois: "Com base neste plano, vamos implementar a refatoração em micro-entregas"

2. **Mapeie o Código Existente**:
   - Use: "Identifique os componentes principais que precisarão ser refatorados neste projeto"
   - Peça: "Mostre a estrutura atual do fluxo de wizard que será refatorado para uma abordagem baseada em seções"

### Fluxo de Trabalho para Micro-Entregas

1. **Comece pela Infraestrutura**:

   - Crie o arquivo para BlueprintCreationPage no local adequado
   - Use: "Implemente o esqueleto básico do componente BlueprintCreationPage conforme a entrega 1.1.1, focando apenas na estrutura e tipos"

2. **Trabalhe Incrementalmente**:

   - Para cada micro-entrega, abra o arquivo relevante
   - Especifique claramente: "Implemente a micro-entrega 1.1.2: layout grid para BlueprintCreationPage com áreas para navegação e conteúdo"
   - Após implementação, use: "Analise este código e verifique se está alinhado com os princípios definidos no plano de refatoração"

3. **Para Refatoração de Componentes Existentes**:

   - Abra o arquivo original (ex: BasicInfoStep.tsx)
   - Use: "Com base neste componente, crie o novo MetadataSection conforme a micro-entrega 2.1.1, mantendo a mesma funcionalidade mas adaptando para o novo formato"

4. **Para Testes**:

   - Após cada implementação: "Crie um teste unitário para este componente verificando [funcionalidade específica]"
   - Use: "Este teste está cobrindo adequadamente os casos de uso da micro-entrega 1.1.3?"

5. **Revisão e Iteração**:
   - Após cada implementação: "Verifique este código quanto a problemas comuns e sugestões de melhoria"
   - Itere com: "Refine este componente para melhorar [aspecto específico]"

## Exemplos Práticos de Prompts para o Copilot

### Contextualizando o Copilot

```
Estou refatorando o fluxo de criação de blueprint do nosso aplicativo, transformando-o de um wizard modal para uma interface baseada em seções em uma página dedicada.
Quero que você me ajude com esta refatoração, seguindo o plano detalhado no documento refactor.md.
Primeiro, precisamos entender a estrutura atual do componente de wizard.
```

### Implementando Componentes Básicos

```
Crie um componente React TypeScript chamado BlueprintCreationPage. Este componente deve seguir a Entrega 1.1.1 do plano de refatoração, implementando apenas o esqueleto básico com tipos para o estado e props necessários.
Use as convenções de código do projeto, incluindo internacionalização e data-testids.
```

### Evoluindo um Componente

```
Este é o componente SectionNavigation básico que implementei. Agora precisamos evoluí-lo para a Entrega 1.2.2, adicionando a lógica para seleção de seções.
A navegação deve permitir selecionar diretamente qualquer seção, não apenas próxima ou anterior.
Mantenha a compatibilidade com as interfaces já definidas e adicione data-testids para os elementos interativos.
```

### Refatorando um Componente Existente

```
Este é o BasicInfoStep atual do wizard. Por favor, refatore-o para o novo MetadataSection conforme a Entrega 2.1.1, mantendo as mesmas funcionalidades mas adaptando-o para ser uma seção completa dentro da página dedicada.
Mantenha as validações existentes e certifique-se de que a internacionalização continue funcionando.
```

### Implementando Novos Recursos

```
Implemente a estrutura básica do DefaultValuesSection conforme a Entrega 3.1.1. Este é um componente novo que não existia no fluxo anterior.
O componente deve permitir configurar valores padrão para cada template selecionado na seção de Templates.
Implemente apenas a estrutura inicial com tipos e interfaces necessárias.
```

### Criando Testes

```
Crie um teste unitário para o componente SectionNavigation que verifica:
1. Se todas as seções são renderizadas corretamente
2. Se a seção atual é destacada visualmente
3. Se clicar em uma seção muda corretamente a seção selecionada
4. Se o callback onChange é chamado com o valor correto

Use as mesmas convenções de teste usadas no restante do projeto.
```

### Revisando e Refinando

```
Revise este código do MetadataSection e verifique se:
1. Segue os princípios de componentização definidos no plano
2. Implementa corretamente a internacionalização
3. Possui data-testids adequados para testes
4. Mantém a mesma funcionalidade do BasicInfoStep original

Sugira melhorias se necessário.
```

## Superando Desafios Comuns com o Copilot

### Quando o Copilot não Entende o Contexto Completo

Se o Copilot parecer não compreender completamente o contexto do projeto ou da refatoração:

```
Vamos revisar o contexto do projeto: Estamos refatorando o fluxo de criação de blueprint de um wizard modal para uma página dedicada com seções.
O componente atual é X e estamos transformando-o em Y.
A principal diferença é [explicação específica].
Com esse contexto em mente, poderia refatorar este componente?
```

### Refinando Código Gerado

Se o código gerado estiver próximo mas não totalmente alinhado com os padrões do projeto:

```
O código gerado está bom, mas precisamos ajustá-lo para seguir os padrões do projeto:
1. Use o hook useTranslation para internacionalização
2. Siga o padrão de componentes funcionais com interfaces explícitas
3. Use CSS modules para estilização
4. Adicione data-testids seguindo o padrão [componente]-[elemento]

Poderia ajustar o código considerando esses pontos?
```

### Lidando com Componentes Complexos

Para componentes mais complexos, divida a implementação em etapas menores:

```
Vamos implementar o DefaultValuesSection em partes:
1. Primeiro, crie a estrutura básica do componente e seus tipos
2. Depois, implemente o seletor de templates
3. Em seguida, adicione o formulário de valores para um template específico
4. Por último, adicione a lógica de interpolação de variáveis

Comece apenas com a parte 1 por enquanto.
```

### Corrigindo Problemas Específicos

Quando encontrar problemas específicos em uma implementação:

```
O componente SectionNavigation está quase perfeito, mas temos dois problemas:
1. O estado de seção selecionada está sendo perdido durante a renderização
2. Os indicadores visuais de seção completa não estão funcionando

Poderia focar especificamente em corrigir esses dois problemas?
```

### Integrando com Código Existente

Quando precisar que o Copilot entenda melhor como integrar com código existente:

```
Aqui está o código do nosso hook useBlueprint atual que gerencia o estado do wizard.
Precisamos adaptar este hook para suportar o novo fluxo baseado em seções, mantendo compatibilidade com as interfaces existentes onde necessário.
Especificamente, precisamos adicionar suporte para:
1. Navegação não-linear entre seções
2. Estado de completude por seção
3. Validação independente por seção
```

## Dicas para um Fluxo de Trabalho Produtivo

1. **Mantenha o histórico de conversação focado**: Inicie novas conversas para diferentes partes da refatoração para evitar confusão de contexto.

2. **Use comentários no código**: Quando precisar que o Copilot modifique uma seção específica, use comentários para delimitar a área.

3. **Forneça feedback específico**: Em vez de pedir para "melhorar o código", especifique exatamente o que precisa ser melhorado.

4. **Reutilize padrões**: Mostre ao Copilot um componente já refatorado como exemplo ao trabalhar em componentes similares.

5. **Valide regularmente**: Teste cada pequena alteração para evitar acumulação de problemas.

6. **Mantenha o plano visível**: Faça referências explícitas às entregas e micro-entregas do plano de refatoração.

## Prompts para Micro-Entregas Específicas

### Fase 1: Estrutura Base

- **1.1.1**: "Criar a estrutura básica do componente BlueprintCreationPage com TypeScript e React"
- **1.1.2**: "Implementar o layout grid do BlueprintCreationPage com áreas para navegação e conteúdo usando Flexbox/Grid"
- **1.1.3**: "Configurar a rota /blueprints/create para a nova página BlueprintCreationPage"
- **1.2.1**: "Criar o componente SectionNavigation com as 5 tabs visuais sem funcionalidade ainda"
- **1.2.2**: "Adicionar a lógica de seleção de seções ao componente SectionNavigation"
- **1.3.1**: "Refatorar o esqueleto do CreateBlueprintContext com os novos tipos para seções"

### Fase 2: Migração de Componentes

- **2.1.1**: "Copiar a estrutura básica do BasicInfoStep para um novo MetadataSection"
- **2.1.2**: "Adaptar o layout do MetadataSection para o formato de página completa"
- **2.1.3**: "Implementar as validações e mensagens de erro no MetadataSection"
- **2.2.1**: "Migrar o componente TemplatesStep para a nova estrutura, mantendo apenas funcionalidade básica"
- **2.2.3**: "Adicionar funcionalidade de drag & drop ao TemplatesSection usando a biblioteca já utilizada no projeto"

### Fase 3: Novas Funcionalidades

- **3.1.1**: "Criar a estrutura básica do DefaultValuesSection com tipos e interfaces"
- **3.1.2**: "Implementar a UI para configuração de valores por template no DefaultValuesSection"
- **3.1.3**: "Adicionar suporte para interpolação de variáveis com syntax highlighting"
- **3.2.1**: "Criar o esqueleto do componente PreviewSection com áreas para exibição do YAML gerado"

## Meta-Prompt para Geração de Prompts Específicos

Esta abordagem de "meta-prompting" permite usar o próprio Copilot para criar prompts mais detalhados e específicos para cada entrega ou micro-entrega do plano de refatoração.

### O Meta-Prompt

Copie o seguinte prompt geral e personalize-o para a entrega específica que você está trabalhando:

```
Estou trabalhando na implementação da [número da entrega/micro-entrega] do plano de refatoração do fluxo de criação de blueprints, que envolve [breve descrição da entrega].

Com base no documento de refatoração (refactor.md) e no código atual do projeto, crie um prompt detalhado que eu possa usar com você para implementar esta entrega específica.

O prompt deve incluir:
1. Contexto técnico específico necessário para esta implementação
2. Componentes existentes que precisam ser referenciados ou modificados
3. Requisitos específicos e critérios de aceitação para esta entrega
4. Padrões de código que devem ser seguidos (internacionalização, testes, etc.)
5. Possíveis desafios e como abordá-los

Formate o prompt de maneira que eu possa copiá-lo diretamente e usá-lo para solicitar a implementação.
```

### Como Usar o Meta-Prompt

1. **Identifique a entrega** que deseja trabalhar no documento de refatoração
2. **Copie o meta-prompt** acima e substitua as partes entre colchetes
3. **Envie ao Copilot** como uma nova solicitação
4. **Copie o prompt gerado** pelo Copilot
5. **Use este prompt específico** como uma nova solicitação para implementar a entrega

### Exemplo de Uso

#### 1. Solicitação com Meta-Prompt:

```
Estou trabalhando na implementação da micro-entrega 2.1.2 do plano de refatoração do fluxo de criação de blueprints, que envolve adaptar o layout do MetadataSection para o formato de página completa.

Com base no documento de refatoração (refactor.md) e no código atual do projeto, crie um prompt detalhado que eu possa usar com você para implementar esta entrega específica.

O prompt deve incluir:
1. Contexto técnico específico necessário para esta implementação
2. Componentes existentes que precisam ser referenciados ou modificados
3. Requisitos específicos e critérios de aceitação para esta entrega
4. Padrões de código que devem ser seguidos (internacionalização, testes, etc.)
5. Possíveis desafios e como abordá-los

Formate o prompt de maneira que eu possa copiá-lo diretamente e usá-lo para solicitar a implementação.
```

#### 2. Prompt Específico Gerado pelo Copilot (exemplo):

```
Preciso implementar a micro-entrega 2.1.2 do nosso plano de refatoração, que envolve adaptar o layout do componente MetadataSection para o formato de página completa.

Contexto:
- O componente BasicInfoStep atual está em modal/wizard e precisa ser adaptado para um layout de página completa
- O componente MetadataSection já tem a estrutura básica implementada na entrega 2.1.1
- O novo layout deve ser responsivo e seguir o design system do projeto

Componentes existentes para referência:
- src/components/resources/blueprints/steps/basic-info-step.tsx (componente atual no formato wizard)
- src/components/resources/blueprints/sections/MetadataSection.tsx (nova implementação básica)
- src/components/layout/PageLayout.tsx (componente de layout de página completa)

Requisitos específicos:
1. Adaptar o layout para ocupar o espaço completo da área de conteúdo da página
2. Organizar os campos em um grid responsivo (2 colunas em desktop, 1 em mobile)
3. Manter a validação e feedback de erros existentes
4. Garantir que o layout seja consistente com outras seções do novo fluxo
5. Adicionar indicadores visuais de preenchimento obrigatório

Padrões de código:
- Usar CSS modules para estilização com Tailwind
- Implementar i18n usando o hook useTranslation e as chaves existentes
- Adicionar data-testid para todos os elementos interativos: "metadata-section-[elemento]"
- Implementar layout responsivo conforme breakpoints do projeto

Possíveis desafios:
- Garantir que o componente se adapte a diferentes tamanhos de tela
- Manter consistência visual com o restante da aplicação
- Adaptar o comportamento de feedback de erro para o novo formato

Por favor, implemente estas mudanças no componente MetadataSection.tsx garantindo que todas as funcionalidades do BasicInfoStep original sejam preservadas enquanto adapta o layout para o formato de página completa.
```

#### 3. Use o Prompt Gerado para Implementação:

Envie o prompt específico gerado como uma nova solicitação ao Copilot para obter a implementação detalhada da micro-entrega.

### Benefícios do Meta-Prompting

- **Planejamento detalhado**: O Copilot analisa os requisitos e elabora um plano antes da implementação
- **Contexto completo**: Garante que todos os aspectos relevantes sejam considerados
- **Especificidade**: Cria prompts muito mais específicos do que você provavelmente escreveria manualmente
- **Consistência**: Mantém um formato consistente para todos os prompts de implementação
- **Eficiência**: Economiza tempo na formulação de prompts detalhados

### Quando Usar o Meta-Prompt

- Ao iniciar uma nova entrega ou micro-entrega
- Quando precisar de um plano detalhado antes da implementação
- Para entregas complexas que envolvem múltiplos componentes ou serviços
- Quando quiser garantir que todos os requisitos e padrões sejam atendidos
