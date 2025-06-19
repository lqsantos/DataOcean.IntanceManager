# 🛠️ Guia de Desenvolvimento – DataOcean Instance Manager

## 📖 Visão Geral da Plataforma

A **DataOcean Instance Manager** é uma plataforma projetada para simplificar e padronizar a gestão de instâncias no Kubernetes utilizando **ArgoCD**, **Helm** e **GitOps**. Seu objetivo principal é automatizar a criação e manutenção de artefatos no repositório Git, que são monitorados pelo ArgoCD para realizar deploys consistentes e rastreáveis.

---

## 🌐 Proposta de Estrutura de Navegação

### 1. Dashboard Principal
- **Descrição**: Tela inicial da aplicação, com uma visão geral e atalhos para as principais funcionalidades.
- **Elementos**:
  - Resumo de Configurações (Localidades, Ambientes, Aplicações, Templates, Blueprints, Instâncias).
  - Status de Deploys (ex.: instâncias em progresso, erros recentes).
  - Atalhos Rápidos para ações frequentes (ex.: "Criar Instância", "Cadastrar Template").

---

### 2. Configurações
- **Descrição**: Agrupamento de funcionalidades relacionadas à configuração básica da plataforma.
- **Submenus**:
  - **Localidades**: Cadastro e edição de localidades (ex.: Brasil, EUA, EMEA).
  - **Ambientes**: Cadastro e edição de ambientes (ex.: Desenvolvimento, Homologação, Produção).
  - **Aplicações**: Cadastro e edição de aplicações gerenciadas pela plataforma.

---

### 3. Recursos
- **Descrição**: Funcionalidades relacionadas aos recursos necessários para o deploy de aplicações.
- **Submenus**:
  - **Templates**:
    - Cadastro de Templates (Helm Charts).
    - Listagem e edição de Templates.
  - **Blueprints**:
    - Cadastro de Blueprints (agrupamento de templates).
    - Listagem e edição de Blueprints.

---

### 4. Instâncias
- **Descrição**: Funcionalidades relacionadas à criação e gerenciamento de instâncias no Kubernetes.
- **Submenus**:
  - **Criar Instância**:
    - Processo guiado para criar uma nova instância utilizando Blueprints e customizando valores.
  - **Listagem de Instâncias**:
    - Exibição de todas as instâncias criadas, com informações sobre status, localidade, ambiente e blueprint utilizado.
  - **Detalhes da Instância**:
    - Visualização detalhada de uma instância, incluindo valores customizados e status do deploy no ArgoCD.

---

### 5. Configurações de Usuário
- **Descrição**: Funcionalidades relacionadas ao gerenciamento de configurações do usuário.
- **Submenus**:
  - **Personal Access Token (PAT)**:
    - Cadastro e validação de PAT para integração com o repositório Git.
    - Exibição do estado atual da PAT (configurada, não configurada, inválida).

---

### 6. Relatórios e Auditoria
- **Descrição**: Funcionalidades para visualizar relatórios e histórico de ações realizadas na plataforma.
- **Submenus**:
  - **Histórico de Ações**:
    - Registro de todas as ações realizadas pelos usuários (ex.: criação de instâncias, edição de templates).
  - **Relatórios de Deploy**:
    - Relatórios sobre o status dos deploys realizados no Kubernetes.

---

### 7. Administração
- **Descrição**: Funcionalidades avançadas para administração da plataforma.
- **Submenus**:
  - **Gerenciamento de Usuários**:
    - Cadastro, edição e remoção de usuários.
  - **Configurações Globais**:
    - Configurações gerais da plataforma, como intervalos de polling e permissões.

---

## 🔗 Fluxo de Navegação Proposto

O fluxo de navegação descreve como o usuário interage com as principais funcionalidades da plataforma:

1. **Dashboard Principal**:
   - Acesso rápido às informações gerais e atalhos para as principais ações.
2. **Configurações**:
   - Agrupamento de funcionalidades básicas (Localidades, Ambientes, Aplicações).
3. **Recursos**:
   - Gerenciamento de Templates e Blueprints.
4. **Instâncias**:
   - Criação e gerenciamento de instâncias.
5. **Configurações de Usuário**:
   - Gerenciamento de PAT e configurações pessoais.
6. **Relatórios e Auditoria**:
   - Histórico de ações e relatórios de deploy.
7. **Administração**:
   - Funcionalidades avançadas para administradores.

---

## ⚙️ Pré-requisito: Personal Access Token (PAT)

Embora algumas funcionalidades da plataforma possam ser utilizadas sem a necessidade de uma **Personal Access Token (PAT)**, o cadastro de uma PAT é obrigatório para qualquer funcionalidade que envolva integração com o repositório Git.

### 📝 Detalhes do Pré-requisito

1. **Quando a PAT é Necessária**:
   - Funcionalidades que exigem integração com o Git, como:
     - Cadastro de Templates.
     - Criação de Instâncias.
   - A PAT será utilizada para autenticar operações realizadas no repositório Git em nome do usuário.

2. **Quando a PAT Não é Necessária**:
   - Funcionalidades que não dependem de integração com o Git, como:
     - Cadastro de localidades, ambientes e aplicações na página **Settings**.

3. **Cadastro da PAT**:
   - O usuário pode cadastrar uma PAT válida a qualquer momento.
   - A plataforma verificará automaticamente se a PAT fornecida é válida e possui as permissões necessárias.

4. **Monitoramento da PAT**:
   - O componente **PATChecker** será responsável por verificar o estado da PAT e notificar o usuário caso ela esteja inválida ou ausente.

---

## ⚙️ Funcionalidade: Settings

A página **Settings** é o ponto de partida para configurar os elementos básicos necessários para o funcionamento da plataforma. Ela permite o cadastro e a gestão de localidades, ambientes e aplicações, que são essenciais para garantir os padrões necessários para a criação de novas instâncias.

### 📝 Detalhes da Funcionalidade

#### 1. **Objetivo**

A funcionalidade **Settings** centraliza a configuração básica da plataforma, permitindo que os usuários definam os seguintes elementos:

- **Localidades**: Representam as regiões ou países onde as instâncias serão implantadas.
- **Ambientes**: Definem os estágios do ciclo de vida da aplicação, como `desenvolvimento`, `homologação` e `produção`.
- **Aplicações**: Representam os serviços ou sistemas que serão gerenciados pela plataforma.

Essas configurações são utilizadas para organizar os dados da plataforma e, quando necessário, gerar os artefatos no repositório Git.

#### 2. **Fluxo de Uso**

1. O usuário acessa a página **Settings**.
2. Realiza o cadastro ou edição de localidades, ambientes e aplicações.
3. As configurações são validadas e salvas.
4. Caso a funcionalidade exija integração com o Git, a plataforma utiliza a PAT do usuário para realizar as operações necessárias.

---

## ⚙️ Funcionalidade: Cadastro de Templates

A funcionalidade de **Cadastro de Templates** permite que os usuários registrem os templates necessários para realizar o deploy das aplicações. Esses templates são manifestos YAML versionados em repositórios Git e, no contexto do MVP, devem estar empacotados como **Helm Charts**.

### 📝 Detalhes da Funcionalidade

#### 1. **Objetivo**

O objetivo do cadastro de templates é garantir que todas as aplicações que serão implantadas estejam devidamente registradas e disponíveis para uso no contexto de deploy de instâncias. Cada template representa um conjunto de configurações reutilizáveis para deploy de uma aplicação.

#### 2. **Valores Padrão nos Templates**

Os templates (Helm Charts) possuem arquivos `values.yaml` que definem os valores padrão para a aplicação. Esses valores podem ser customizados em dois níveis:
1. **No Blueprint**: Durante a criação de um Blueprint, os valores padrão podem ser ajustados e valores comuns podem ser definidos.
2. **Na Instância**: Durante a criação de uma instância, os valores podem ser customizados para atender às necessidades específicas da instância.

##### Exemplo de Valores Padrão:
- **Helm Chart do Banco de Dados** (`values.yaml`):
  ```yaml
  nome: banco1
  resources:
    request:
      memory: 1Gi
  serviceName: app1.banco
  ```
- **Helm Chart da Aplicação** (`values.yaml`):
  ```yaml
  nome: app1
  resources:
    request:
      memory: 1Gi
  config:
    db_host_name: local.host
  ```

---

## ⚙️ Funcionalidade: Cadastro de Blueprints

A funcionalidade de **Cadastro de Blueprints** permite que os usuários definam um conjunto de templates necessários para o funcionamento completo de uma aplicação. Um **Blueprint** é um agrupamento lógico de templates que define todos os recursos que uma aplicação precisa para ser implantada.

### 📝 Detalhes da Funcionalidade

#### 1. **Objetivo**

O objetivo do cadastro de Blueprints é permitir que os usuários agrupem templates relacionados, criando um pacote reutilizável que pode ser utilizado para o deploy de instâncias completas de uma aplicação.

#### 2. **Valores Comuns no Blueprint**

Durante a criação de um Blueprint, o usuário pode definir **valores comuns reutilizáveis** que podem ser referenciados por vários templates associados ao Blueprint. Esses valores comuns funcionam como um "contexto compartilhado" e podem incluir lógica avançada para resolução dinâmica.

##### Exemplo de Valores Comuns:
```yaml
valores_comuns:
  app_name: app1
  db_service_name: app1.banco
  resources:
    memory: 1Gi
```

##### Exemplo de Referência nos Templates:
- **Helm Chart do Banco de Dados**:
  ```yaml
  nome: {{ .valores_comuns.app_name }}-db
  resources:
    request:
      memory: {{ .valores_comuns.resources.memory }}
  serviceName: {{ .valores_comuns.db_service_name }}
  ```
- **Helm Chart do Backend**:
  ```yaml
  nome: {{ .valores_comuns.app_name }}-backend
  config:
    db_host_name: {{ .valores_comuns.db_service_name }}
  resources:
    request:
      memory: {{ .valores_comuns.resources.memory }}
  ```

#### 3. **Fluxo de Uso**

1. O usuário acessa a funcionalidade de **Cadastro de Blueprints**.
2. Define os valores comuns reutilizáveis no nível do Blueprint.
3. Associa os templates ao Blueprint e configura os placeholders nos templates para referenciar os valores comuns.
4. O sistema valida os valores e registra o Blueprint.

---

## ⚙️ Funcionalidade: Criação de Instâncias

A funcionalidade de **Criação de Instâncias** permite que os usuários utilizem Blueprints previamente cadastrados para criar instâncias de aplicações no Kubernetes. Durante o processo, o usuário pode customizar os valores (values) dos templates associados ao Blueprint, e o sistema gera automaticamente o Helm Chart no padrão **AppOfApps**, armazenando-o na estrutura correta do repositório Git e criando o aplicativo correspondente no ArgoCD.

### 📝 Detalhes da Funcionalidade

#### 1. **Customização de Valores na Instância**

Durante a criação de uma instância:
1. Os valores comuns definidos no Blueprint são herdados automaticamente.
2. O usuário pode customizar os valores comuns ou adicionar novos valores específicos para a instância.

##### Exemplo de Herança e Customização:
- **Valores Comuns no Blueprint**:
  ```yaml
  valores_comuns:
    app_name: app1
    db_service_name: app1.banco
    resources:
      memory: 1Gi
  ```
- **Customização na Instância**:
  ```yaml
  valores_comuns:
    resources:
      memory: 2Gi
  ```

- Resultado Final no Template do Backend:
  ```yaml
  nome: app1-backend
  config:
    db_host_name: app1.banco
  resources:
    request:
      memory: 2Gi
  ```

#### 2. **Fluxo de Uso**

1. O usuário acessa a funcionalidade de **Criação de Instâncias**.
2. Informa os seguintes dados:
   - **Nome da Instância**: Nome descritivo para identificação.
   - **Localidade**: Seleção de uma localidade previamente cadastrada.
   - **Ambiente**: Seleção de um ambiente previamente cadastrado.
   - **Blueprint**: Seleção de um Blueprint previamente cadastrado.
   - **Customização de Valores**: Opcionalmente, o usuário pode customizar os valores (values) dos templates associados ao Blueprint.
3. O sistema gera automaticamente o Helm Chart no padrão **AppOfApps**, com os valores customizados, e o armazena na estrutura correta do repositório Git.
4. O sistema cria o aplicativo **AppOfApps** no ArgoCD, apontando para o Helm Chart gerado no repositório Git.
5. O ArgoCD detecta as mudanças no repositório Git e realiza o deploy da instância no Kubernetes.

#### 3. **Regras para o MVP**

- O usuário deve selecionar um Blueprint previamente cadastrado.
- A customização de valores é opcional, mas os valores padrão definidos no Blueprint serão utilizados caso nenhuma customização seja feita.
- O Helm Chart gerado deve seguir o padrão **AppOfApps** e ser armazenado na estrutura do repositório Git conforme definido anteriormente.
- O aplicativo **AppOfApps** no ArgoCD deve ser criado automaticamente, apontando para o Helm Chart gerado.

---

## 🌐 Exemplos de Uso

### Exemplo 1: Cadastro de uma PAT

1. O usuário acessa a plataforma pela primeira vez.
2. É solicitado que ele forneça uma **Personal Access Token (PAT)** válida caso deseje utilizar funcionalidades que dependam de integração com o Git.
3. A plataforma valida a PAT e a registra para uso nas operações de integração com o repositório Git.

### Exemplo 2: Cadastro de um Template

1. O usuário acessa a funcionalidade de **Cadastro de Templates**.
2. Preenche os seguintes dados:
   - Nome do Template: `Insights Application`
   - Repositório Git: `https://git.example.com/helm/insights`
   - Caminho no Repositório: `/charts/insights`
   - Versão: `v1.0.0`
3. O sistema valida as informações e registra o template.
4. O template fica disponível para uso no deploy de instâncias.

### Exemplo 3: Cadastro de Localidades sem PAT

1. O usuário acessa a página **Settings**.
2. Na aba **Localidades**, adiciona uma nova localidade chamada "Canadá".
3. A localidade é salva e estará disponível para seleção ao criar novas instâncias, sem necessidade de integração com o Git.

### Exemplo 4: Cadastro de um Blueprint

1. O usuário acessa a funcionalidade de **Cadastro de Blueprints**.
2. Preenche os seguintes dados:
   - Nome do Blueprint: `Insights Application`
   - Descrição: `Blueprint para a aplicação Insights, incluindo backend, banco de dados e volumes.`
   - Templates Associados:
     - `Backend Template`
     - `Database Template`
     - `Volume Template`
   - Valores Comuns:
     ```yaml
     valores_comuns:
       app_name: insights
       db_service_name: insights.db
       resources:
         memory: 1Gi
     ```
3. O sistema valida as informações e registra o Blueprint.
4. O Blueprint fica disponível para uso no deploy de instâncias.

### Exemplo 5: Criação de uma Instância com Customização de Valores

1. O usuário acessa a funcionalidade de **Criação de Instâncias**.
2. Preenche os seguintes dados:
   - Nome da Instância: `Insights-Prod-BR`
   - Localidade: `Brasil`
   - Ambiente: `Produção`
   - Blueprint: `Insights Application`
   - Customização de Valores:
     ```yaml
     valores_comuns:
       resources:
         memory: 2Gi
     ```
3. O sistema utiliza os valores customizados para gerar o Helm Chart.
4. O Helm Chart é armazenado no repositório Git na estrutura correta:
   ```
   producao/
   └── br/
       └── insights/
           └── chart/
               ├── templates/
               │   ├── app.yaml
               │   └── bd.yaml
               └── values.yaml
   ```
5. O sistema cria o aplicativo **AppOfApps** no ArgoCD, apontando para o Helm Chart gerado.
6. O ArgoCD detecta as mudanças e realiza o deploy da instância no Kubernetes.

---

## 🧩 Detalhes Técnicos

### **Componente: PATChecker**

O componente `PATChecker` verifica o estado de configuração do Personal Access Token (PAT), que é essencial para a integração com o repositório Git. Ele possui os seguintes estados:

- **`not-configured`**: O PAT não está configurado.
- **`loading`**: O estado do PAT está sendo carregado.
- **`configured`**: O PAT está configurado corretamente.

#### Exemplo de Uso:

```tsx
<PATChecker onStatusChange={(isConfigured) => console.log(isConfigured)}>
  <span>Verificando o estado do PAT...</span>
</PATChecker>
```

---

## 🚀 Próximos Passos

1. **Finalizar a funcionalidade Settings**:
   - Garantir que os cadastros de localidades, ambientes e aplicações estejam funcionais.
2. **Implementar a funcionalidade de Cadastro de Templates**:
   - Garantir que os templates possam ser registrados e validados.
3. **Implementar a funcionalidade de Cadastro de Blueprints**:
   - Garantir que os Blueprints possam ser registrados e validados.
4. **Implementar a funcionalidade de Criação de Instâncias**:
   - Garantir que o sistema permita a seleção de Blueprints e a customização de valores.
5. **Gerar Helm Charts no Padrão AppOfApps**:
   - Implementar a lógica para gerar os artefatos no formato correto e armazená-los no repositório Git.
6. **Criar Aplicativos AppOfApps no ArgoCD**:
   - Automatizar a criação de aplicativos no ArgoCD, apontando para os Helm Charts gerados.
7. **Adicionar Suporte a Outros Tipos de Deploys**:
   - Expandir o suporte para além de Helm Charts no futuro.
8. **Testar e Validar**:
   - Criar testes unitários e de integração para garantir a confiabilidade das funcionalidades.

---

## 📚 Referências

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Helm Documentation](https://helm.sh/docs/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitOps Principles](https://www.gitops.tech/)

---

Este documento reflete o funcionamento das funcionalidades **Settings**, **Cadastro de Templates**, **Cadastro de Blueprints** e **Criação de Instâncias**, destacando como o sistema utiliza o padrão **AppOfApps** para gerenciar o deploy de instâncias no Kubernetes.
