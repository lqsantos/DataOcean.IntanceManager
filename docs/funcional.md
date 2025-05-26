# 🛠️ Guia de Desenvolvimento – DataOcean Instance Manager

## 📖 Visão Geral da Plataforma

A **DataOcean Instance Manager** é uma plataforma projetada para simplificar e padronizar a gestão de instâncias no Kubernetes utilizando **ArgoCD**, **Helm** e **GitOps**. Seu objetivo principal é automatizar a criação e manutenção de artefatos no repositório Git, que são monitorados pelo ArgoCD para realizar deploys consistentes e rastreáveis.

### 🌟 Objetivos Principais

1. **Padronizar Configurações**: Garantir que todas as instâncias sigam padrões definidos para localidades, ambientes e aplicações.
2. **Automatizar Artefatos Git**: Gerar automaticamente os artefatos necessários no repositório Git para integração com o ArgoCD.
3. **Facilitar a Escalabilidade**: Permitir a criação e gestão de múltiplas instâncias de forma eficiente e rastreável.
4. **Monitoramento e Conformidade**: Utilizar ferramentas como o **PATChecker** para verificar o estado de configurações críticas.

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

#### 2. **Fluxo de Uso**

1. O usuário acessa a funcionalidade de **Cadastro de Templates**.
2. Informa os seguintes dados:
   - **Nome do Template**: Nome descritivo para identificação.
   - **Repositório Git**: URL do repositório onde o Helm Chart está versionado.
   - **Caminho no Repositório**: Caminho dentro do repositório onde o Helm Chart está localizado.
   - **Versão**: Versão específica do Helm Chart (ex.: `v1.0.0`).
3. O sistema valida as informações fornecidas e registra o template.
4. O template fica disponível para seleção durante a criação de novas instâncias.

#### 3. **Regras para o MVP**

- Todos os templates devem estar empacotados como **Helm Charts**.
- O repositório Git deve ser acessível e conter os arquivos necessários para o deploy.
- No futuro, será possível adicionar suporte a outros tipos de deploys além de Helm Charts.

---

## ⚙️ Funcionalidade: Cadastro de Blueprints

A funcionalidade de **Cadastro de Blueprints** permite que os usuários definam um conjunto de templates necessários para o funcionamento completo de uma aplicação. Um **Blueprint** é um agrupamento lógico de templates que define todos os recursos que uma aplicação precisa para ser implantada.

### 📝 Detalhes da Funcionalidade

#### 1. **Objetivo**

O objetivo do cadastro de Blueprints é permitir que os usuários agrupem templates relacionados, criando um pacote reutilizável que pode ser utilizado para o deploy de instâncias completas de uma aplicação.

#### 2. **Fluxo de Uso**

1. O usuário acessa a funcionalidade de **Cadastro de Blueprints**.
2. Informa os seguintes dados:
   - **Nome do Blueprint**: Nome descritivo para identificação.
   - **Descrição**: Informações adicionais sobre o propósito do Blueprint.
   - **Templates Associados**: Seleção de um ou mais templates previamente cadastrados (ex.: backend, banco de dados, volumes, etc.).
3. O sistema valida as informações fornecidas e registra o Blueprint.
4. O Blueprint fica disponível para seleção durante a criação de novas instâncias.

#### 3. **Regras para o MVP**

- Um Blueprint deve conter pelo menos um template associado.
- Os templates associados devem estar previamente cadastrados na funcionalidade **Cadastro de Templates**.
- No futuro, será possível adicionar configurações específicas ao Blueprint, como valores padrão para os templates.

---

## ⚙️ Funcionalidade: Criação de Instâncias

A funcionalidade de **Criação de Instâncias** permite que os usuários utilizem Blueprints previamente cadastrados para criar instâncias de aplicações no Kubernetes. Durante o processo, o usuário pode customizar os valores (values) dos templates associados ao Blueprint, e o sistema gera automaticamente o Helm Chart no padrão **AppOfApps**, armazenando-o na estrutura correta do repositório Git e criando o aplicativo correspondente no ArgoCD.

### 📝 Detalhes da Funcionalidade

#### 1. **Objetivo**

O objetivo da criação de instâncias é permitir que os usuários definam como um Blueprint será implementado no Kubernetes, com a possibilidade de customizar valores específicos para atender às necessidades de cada instância. Além disso, o sistema cria automaticamente o aplicativo **AppOfApps** no ArgoCD para gerenciar o deploy da instância.

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
3. O sistema valida as informações e registra o Blueprint.
4. O Blueprint fica disponível para uso no deploy de instâncias.

### Exemplo 5: Criação de uma Instância com Valores Padrão

1. O usuário acessa a funcionalidade de **Criação de Instâncias**.
2. Preenche os seguintes dados:
   - Nome da Instância: `Insights-Prod-BR`
   - Localidade: `Brasil`
   - Ambiente: `Produção`
   - Blueprint: `Insights Application`
3. O sistema utiliza os valores padrão definidos no Blueprint para gerar o Helm Chart.
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

### Exemplo 6: Criação de uma Instância com Valores Customizados

1. O usuário acessa a funcionalidade de **Criação de Instâncias**.
2. Preenche os seguintes dados:
   - Nome da Instância: `Insights-Dev-US`
   - Localidade: `Estados Unidos`
   - Ambiente: `Desenvolvimento`
   - Blueprint: `Insights Application`
3. O usuário customiza os valores (values) dos templates associados ao Blueprint, como:
   - Alterar o número de réplicas do backend.
   - Configurar credenciais específicas para o banco de dados.
4. O sistema utiliza os valores customizados para gerar o Helm Chart.
5. O Helm Chart é armazenado no repositório Git na estrutura correta:
   ```
   desenvolvimento/
   └── eua/
       └── insights/
           └── chart/
               ├── templates/
               │   ├── app.yaml
               │   └── bd.yaml
               └── values.yaml
   ```
6. O sistema cria o aplicativo **AppOfApps** no ArgoCD, apontando para o Helm Chart gerado.
7. O ArgoCD detecta as mudanças e realiza o deploy da instância no Kubernetes.

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

### **Estrutura de Pastas**

A estrutura de pastas para a funcionalidade **Settings** segue o padrão modular da plataforma:

```
src/
├── app/
│   └── settings/
│       ├── __tests__/          # Testes unitários
│       ├── components/         # Componentes específicos da página
│       └── page.tsx            # Página principal
├── components/
│   └── templates/
│       └── pat-checker.tsx     # Componente PATChecker
└── tests/
    └── msw/
        └── handlers.ts         # Handlers do MSW para mock de APIs
```

---

## 🧪 Testes Unitários

### **Cenários de Teste para Settings**

1. **Renderização Inicial**:
   - Verificar se as abas `Applications`, `Environments` e `Locations` são exibidas corretamente.
2. **Navegação entre Abas**:
   - Garantir que os dados mockados sejam carregados ao navegar entre as abas.
3. **Mensagens de Erro**:
   - Exibir mensagens de erro ao falhar no carregamento de dados.
4. **Atualização de Dados**:
   - Validar a atualização de dados ao clicar no botão de "Refresh".

### **Exemplo de Teste para PATChecker**

```tsx
import { render, screen } from '@testing-library/react';
import { PATChecker } from '@/components/templates/pat-checker';

describe('PATChecker', () => {
  it('should render with the correct status', () => {
    render(<PATChecker />);
    const element = screen.getByTestId('pat-checker');
    expect(element).toHaveAttribute('data-pat-status', 'loading');
  });
});
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
