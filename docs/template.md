📝 Especificação – Cadastro de Templates (DataOcean Instance Manager)

📖 O que é um Template?

Na plataforma DataOcean Instance Manager, um **template** representa um **Helm Chart** versionado em um repositório Git que descreve como uma aplicação específica deve ser implantada no Kubernetes. Cada template pode ser reutilizado em diferentes Blueprints e instâncias, e contém os valores padrão, schemas e estrutura necessária para o deploy automatizado via ArgoCD.

Cada template:

- Representa uma aplicação isolada e reutilizável (ex: PostgreSQL, Backend, Redis)
- É versionado em um repositório Git, com caminho e estrutura definidos
- Contém arquivos como `Chart.yaml`, `values.yaml` e opcionalmente `values.schema.json`
- É utilizado como base para geração do AppOfApps durante a criação de instâncias

🎯 Objetivo

Permitir que o usuário cadastre templates Helm reutilizáveis na plataforma, vinculando-os a repositórios Git válidos, validando sua estrutura e tornando-os disponíveis para uso em Blueprints.

🔄 Etapas do Cadastro de Template

1. Informações Básicas

   - Nome do template
   - Tipo do template (ex: Backend, Database, Monitoring) – usado para classificar tecnicamente o template e facilitar buscas e organização
   - Descrição (opcional)
   - Aplicação associada (ex: Advanced Insights, Knowledge Assistant)

2. Origem Git

   - Repositório Git (URL)
   - Caminho no repositório onde se encontra o chart
   - Tipo de repositório: Azure Repos (único suporte no momento)
   - Validação automática realizada via Managed Identity do backend, autenticando diretamente com o Azure DevOps

3. Validação da Estrutura

   O usuário poderá acionar manualmente a validação da estrutura do template por meio de um botão “Validar Chart”. Ao clicar, o sistema solicitará a **branch** que deve ser utilizada para a validação. Em seguida, o sistema realiza as seguintes verificações:

- Presença dos arquivos `Chart.yaml` e `values.yaml`
- Validação opcional do `values.schema.json` (se existir)
- Leitura do `Chart.yaml` para sugerir nome e versão do chart

4. Registro

   - Após validação, o template é registrado no banco de dados da plataforma
   - Fica disponível para seleção em Blueprints
   - Pode ser referenciado múltiplas vezes (com identificadores distintos) dentro de um mesmo Blueprint

📦 Estrutura Esperada do Chart

```
charts/
└── my-template/
    ├── Chart.yaml
    ├── values.yaml
    ├── values.schema.json (opcional)
    └── templates/
        └── deployment.yaml
```

🔁 Considerações

- A autenticação com o Azure Repos é feita via Managed Identity do backend, garantindo segurança e rastreabilidade.
- O template é um artefato genérico, sem acoplamento a localidade ou ambiente.
- A branch ou versão do chart é escolhida apenas na criação da instância.
- Toda customização de valores ocorre nos Blueprints ou nas instâncias.
- O template deve seguir a estrutura padrão do Helm.
- Um mesmo template pode ser reutilizado em diferentes Blueprints e múltiplas vezes no mesmo Blueprint, com identificadores distintos.
