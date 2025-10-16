# 🗄️ Data Model - DataOcean Instance Manager

## 📋 Overview

Defines the core entities and relationships for managing ArgoCD App of Apps deployments across multiple regions and environments.

**Key Enhancements:** 
- **Template Versioning:** Templates + Template_Versions separation enables multiple template versions in use simultaneously
- **Blueprint Governance:** Blueprint_Templates reference specific Template_Versions (tested combinations)
- **Instance Simplicity:** Instance chooses Blueprint_Version, automatically inherits all template versions

---

## 🏗️ Core Domain Entities

### **1. Location**
Geographical region for deployments.

**Attributes:**
- `id`, `name`, `description`, `created_at`, `updated_at`

**Rules:** Names must be globally unique and follow naming convention: alphanumeric + hyphens only, start and end with letters (e.g., "Brazil", "EMEA", "USA").

---

### **2. Environment**
Deployment environment type (dev, staging, production).

**Attributes:**
- `id`, `name`, `description`, `created_at`, `updated_at`

**Rules:** Names must be globally unique and follow naming convention: alphanumeric + hyphens only, start and end with letters (e.g., "Development", "Staging", "Production").

---

### **3. Application**
Business application that can be deployed.

**Attributes:**
- `id`, `name`, `description`, `repository_url`, `created_at`, `updated_at`

**Rules:** Names must be globally unique and follow naming convention: alphanumeric + hyphens only, start and end with letters (e.g., "Ecommerce-Platform", "Analytics-Service"). Has multiple blueprints.

---

### **4. Template**
Metadata and configuration for external Helm Chart repositories.

**Attributes:**
- `id` (UUID, PK): Unique identifier
- `name` (VARCHAR(100), NOT NULL, UNIQUE): Template name
- `description` (TEXT): Optional description
- `git_repository_url` (VARCHAR(500), NOT NULL): Git repository URL
- `git_path` (VARCHAR(255), NOT NULL): Path to Helm Chart within repository
- `current_version_id` (UUID, FK): Reference to current Template_Version
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Rules:** 
- Names must be globally unique and follow alphanumeric + hyphen convention
- git_repository_url and git_path define location of Helm Chart
- current_version_id points to latest imported Template_Version
- Template serves as container for multiple versions of same Helm Chart

**Business Logic:**
- CREATE: Creates Template + initial Template_Version from Git import
- UPDATE: Creates new Template_Version, updates current_version_id
- DELETE: Only if no Template_Versions are referenced by Blueprint_Templates

**Relationships:**
- **1:N** with Template_Version (one template has multiple versions)
- **1:1** with Template_Version (current_version_id points to latest)

---

### **4.1. Template_Version**
Historical versions of Helm Chart data imported from Git repository.

**Attributes:**
- `id` (UUID, PK): Unique identifier
- `template_id` (UUID, FK, NOT NULL): Reference to parent Template
- `git_commit_hash` (VARCHAR(40), NOT NULL): Commit hash used for import
- `chart_metadata` (JSON, NOT NULL): Complete Chart.yaml content
- `default_values` (JSON, NOT NULL): Complete values.yaml content
- `values_schema` (JSON, NULL): values.schema.json content (optional)
- `commit_message` (TEXT): Git commit message
- `commit_author` (VARCHAR(255)): Git commit author
- `imported_at` (TIMESTAMP, DEFAULT NOW()): Import timestamp

**Rules:**
- Unique combination of (template_id, git_commit_hash)
- chart_metadata, default_values must be valid JSON/YAML
- values_schema optional but enables custom values validation
- Each version is immutable after creation
- All Template_Versions preserved for historical reference

**Business Logic:**
- CREATE: During Template import/sync operations
- READ: Used by Blueprint_Templates and Instance operations
- VALIDATE: Schema-based validation of custom values
- COMPARE: Version comparison and diff operations
- DELETE: Only if not referenced by any Blueprint_Template

**Relationships:**
- **N:1** with Template (multiple versions belong to one template)
- **1:N** with Blueprint_Template (one version used by multiple blueprint templates)

---

### **4.1. Cluster**
Kubernetes cluster where applications are deployed.

**Attributes:**
- `id` (UUID, PK): Identificador único
- `name` (VARCHAR(100), NOT NULL, UNIQUE): Nome do cluster (ex: "brazil-prod-aks", "emea-dev-aks")
- `description` (TEXT): Descrição do cluster
- `server_url` (VARCHAR(500), NOT NULL): URL do servidor Kubernetes API
- `location_id` (UUID, FK, NOT NULL): Referência à localização
- `environment_id` (UUID, FK, NOT NULL): Referência ao ambiente
- `is_active` (BOOLEAN, DEFAULT true): Indica se o cluster está ativo
- `created_at` (TIMESTAMP, DEFAULT NOW()): Data de criação
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Data da última atualização

**Rules:** 
- Names must be globally unique and follow alphanumeric + hyphen convention
- Combination (location_id, environment_id) must be unique (1 cluster per location+environment)
- server_url must be valid Kubernetes API URL (ex: "https://brasil-prod-aks.hcp.eastus.azmk8s.io:443")
- Cannot be deleted if there are associated Instances

**Relationships:**
- **N:1** with Location (multiple clusters can be in same location)
- **N:1** with Environment (multiple clusters can be in same environment)  
- **1:N** with Instance (one cluster can have multiple instances)

---

### 5. Blueprint (Modelo de Deployment - Dados Imutáveis)

Representa a identidade e metadados imutáveis de um blueprint. Contém informações que nunca mudam durante a vida do blueprint.

**Atributos:**
- `id` (UUID, PK): Identificador único
- `name` (VARCHAR(100), NOT NULL): Nome do blueprint (ex: "api-standard", "microservice-basic")
- `description` (TEXT): Descrição detalhada do blueprint
- `application_id` (UUID, FK, NOT NULL): Referência à aplicação
- `current_version_id` (UUID, FK): Referência à versão atual do blueprint
- `is_active` (BOOLEAN, DEFAULT true): Indica se o blueprint está ativo
- `created_at` (TIMESTAMP, DEFAULT NOW()): Data de criação

**Regras de Negócio:**
- Nome deve ser único por aplicação
- Nome deve seguir padrão alphanuméricocom hífens (inicia e termina com letra)
- Nome será usado como prefixo nos helpers: `blueprint-name.component.property`
- Não pode ser deletado se houver Instances associadas
- current_version_id aponta para a Blueprint_Version mais recente

**Relacionamentos:**
- **N:1** com Application (vários blueprints podem pertencer a uma aplicação)
- **1:N** com Blueprint_Version (um blueprint pode ter várias versões)
- **1:1** com Blueprint_Version (current_version_id - versão atual)
- **1:N** com Instance (um blueprint pode ter várias instâncias)

### 5.1. Blueprint_Version (Modelo de Deployment - Dados Versionados)

Representa uma versão específica de um blueprint, contendo as configurações que podem evoluir ao longo do tempo.

**Atributos:**
- `id` (UUID, PK): Identificador único
- `blueprint_id` (UUID, FK, NOT NULL): Referência ao blueprint pai
- `version_number` (INTEGER, NOT NULL): Número sequencial da versão (1, 2, 3...)
- `helper_templates` (TEXT): Conteúdo do arquivo _helpers.tpl com defines Helm
- `created_at` (TIMESTAMP, DEFAULT NOW()): Data de criação desta versão

**Regras de Negócio:**
- version_number deve ser único por blueprint_id
- version_number é incrementado automaticamente (1, 2, 3...)
- helper_templates contém Go template válido (validação sintática apenas)
- helper_templates recomendado formato: `blueprint-name.component.property`
- Cada versão é imutável após criação (não pode ser editada)
- Nova versão é criada sempre que helper_templates muda

**Validação MVP:**
- Apenas validação sintática Go template: `template.New("helper").Parse(helper_templates)`
- Não validação de nomenclatura, variáveis não utilizadas ou referências
- Critério de sucesso: `helm template` funciona sem erro

**Relacionamentos:**
- **N:1** com Blueprint (várias versões pertencem a um blueprint)
- **N:M** com Template via Blueprint_Template
- **1:N** com Instance (uma versão pode ser usada por várias instâncias)

---

### 6. Blueprint_Template (Relacionamento Blueprint_Version-Template_Version)

Define quais versões específicas de templates fazem parte de uma versão de blueprint, incluindo configurações globais e ordem de execução.

**Atributos:**
- `id` (UUID, PK): Identificador único
- `blueprint_version_id` (UUID, FK, NOT NULL): Referência à versão específica do blueprint
- `template_version_id` (UUID, FK, NOT NULL): Referência à versão específica do template
- `order` (INTEGER, NOT NULL): Ordem de execução do template no blueprint
- `alias` (VARCHAR(100), NOT NULL): Nome único do template nesta versão (para ArgoCD Application names)
- `custom_values` (JSON): Valores globais aplicados pelo blueprint para este template

**Regras de Negócio:**
- Chave primária: id (permite mesmo template_version múltiplas vezes)
- Unique constraint: (blueprint_version_id, template_version_id, alias)
- Order deve ser único por blueprint_version_id
- Alias deve ser único por blueprint_version_id
- custom_values define configuração global do blueprint para o template
- Order define a sequência de deployment no ArgoCD App of Apps
- Alias usado para nomear ArgoCD Applications: `{instance.name}-{alias}`
- Blueprint "pina" versões específicas de templates (tested combinations)

**Values Inheritance:**
- Template_Version.default_values (base do Helm Chart)
- Blueprint_Template.custom_values (configuração global do blueprint)
- Instance_Template.template_values (overrides específicos da instância)

**Relacionamentos:**
- **N:1** com Blueprint_Version
- **N:1** com Template_Version
- **1:N** com Instance_Template

---

### 7. Instance (Instância de Deployment)

Representa uma implantação concreta de uma versão específica de blueprint em um cluster target. Funciona como um "snapshot" que herda configurações do blueprint.

**Atributos:**
- `id` (UUID, PK): Identificador único
- `name` (VARCHAR(100), NOT NULL, UNIQUE): Nome da instância (globalmente único)
- `blueprint_version_id` (UUID, FK, NOT NULL): Referência à versão específica do blueprint
- `cluster_id` (UUID, FK, NOT NULL): Referência ao cluster de deployment
- `auto_sync_enabled` (BOOLEAN, DEFAULT true): Habilita sincronização automática ArgoCD
- `auto_prune_enabled` (BOOLEAN, DEFAULT true): Habilita remoção automática de recursos
- `auto_heal_enabled` (BOOLEAN, DEFAULT true): Habilita auto-healing de recursos
- `create_namespace` (BOOLEAN, DEFAULT true): Cria namespace automaticamente
- `git_repository` (VARCHAR(500), NOT NULL): URL do repositório Git onde será gerado o App of Apps
- `git_path` (VARCHAR(200), NOT NULL): Caminho no repositório onde ficará o chart
- `git_branch` (VARCHAR(100), DEFAULT 'main'): Branch do Git para o deployment
- `status` (ENUM: pending, deployed, failed, updating): Status atual da instância
- `created_at` (TIMESTAMP, DEFAULT NOW()): Data de criação
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Data da última atualização

**Regras de Negócio:**
- Nome deve ser globalmente único (não apenas por blueprint)
- Nome deve seguir padrão alphanuméricocom hífens
- blueprint_version_id é imutável após criação (snapshot de versão específica)
- cluster_id deve referenciar cluster ativo
- Herda template versions do Blueprint_Version via Blueprint_Templates
- Gera Helm Chart App of Apps no repositório Git especificado
- Configurações syncPolicy são específicas por instância
- Template versions controladas pelo blueprint (governance)

**Blueprint Version Evolution:**
- Para upgrade de template versions: muda blueprint_version_id
- Uma mudança de blueprint_version_id afeta todas as templates da instância
- Garante combinações testadas de template versions

**Relacionamentos:**
- **N:1** com Blueprint_Version (várias instâncias podem usar a mesma versão)
- **N:1** com Cluster (várias instâncias podem usar o mesmo cluster)
- **1:N** com Instance_Template (uma instância tem vários templates)

### 8. Instance_Template (Template Específico da Instância)

**Entidade central** - Representa a configuração final de cada template dentro de uma instância específica, com valores finais aplicados e overrides da instância.

**Atributos:**
- `id` (UUID, PK): Identificador único
- `instance_id` (UUID, FK, NOT NULL): Referência à instância
- `blueprint_template_id` (UUID, FK, NOT NULL): Referência ao Blueprint_Template específico
- `template_values` (JSONB, NOT NULL): Valores finais aplicados ao template (merged)
- `target_namespace` (VARCHAR(63)): Namespace Kubernetes de destino
- `created_at` (TIMESTAMP, DEFAULT NOW()): Data de criação
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Data da última atualização

**Regras de Negócio:**
- Chave única composta: (instance_id, blueprint_template_id)
- template_values são resultado do merge: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
- target_namespace deve seguir padrões Kubernetes (DNS-1123)
- Template version é herdada do Blueprint_Template.template_version_id
- **Entidade central** para comparação de configurações entre instâncias
- Auto-created quando Instance é criada (um por Blueprint_Template)

**Values Merge Logic:**
1. **Base:** Template_Version.default_values (from Blueprint_Template.template_version_id)
2. **Blueprint:** Blueprint_Template.custom_values (global blueprint config)
3. **Instance:** Instance-specific overrides (stored in template_values)
4. **Result:** Final merged configuration for Helm Chart generation

**Template Version Inheritance:**
- Template version vem de Blueprint_Template.template_version_id
- Instance não escolhe template version diretamente
- Para mudar template version: muda Instance.blueprint_version_id

**Relacionamentos:**
- **N:1** com Instance (vários templates pertencem a uma instância)
- **N:1** com Blueprint_Template (várias instâncias podem referenciar o mesmo blueprint template)
- **Via Blueprint_Template → Template_Version** (template version data)

---

## 🔗 Relacionamentos Entre Entidades

```
Application (1→N) Blueprint (1→N) Blueprint_Version (1→N) Instance (1→N) Instance_Template
Blueprint (1→1) Blueprint_Version [current_version_id - versão atual]
Template (1→N) Template_Version [versioned chart data]
Template (1→1) Template_Version [current_version_id - versão atual]
Blueprint_Version (1→N) Blueprint_Template (N→1) Template_Version
Blueprint_Template (1→N) Instance_Template
Location (1→N) Cluster (1→N) Instance  
Environment (1→N) Cluster
```

**Abordagem de Versionamento:**
- **Blueprint:** Dados imutáveis (nome, descrição, application_id)
- **Blueprint_Version:** Dados mutáveis (helper_templates, template combinations)
- **Template:** Dados imutáveis (nome, descrição, git_repository_url)
- **Template_Version:** Dados mutáveis (chart_metadata, default_values, values_schema)
- **Instance:** Snapshot de blueprint_version_id específica para estabilidade
- **Template Versions:** Controladas via Blueprint_Template (tested combinations)

---

## 📊 Fluxo Central de Dados

```
Application → Blueprint → Blueprint_Version → Instance → Instance_Template
     ↓           ↓            ↓                ↓            ↓
Templates → Template_Versions → Blueprint_Template → Helper Templates → ArgoCD App
```

**Fluxo de Versionamento:**
1. **Template** criado com metadados imutáveis + **Template_Version** inicial
2. **Blueprint** criado com metadados imutáveis
3. **Blueprint_Version** criada com helper_templates + **Blueprint_Templates** específicos
4. **Blueprint_Template** referencia Template_Version específica (tested combination)
5. **Instance** criada referenciando blueprint_version_id específica
6. **Instance_Template** gerados automaticamente com valores finais merged
7. **Git Repository** recebe App of Apps chart com template versions fixas

**Versioning Strategy:** 
- `Blueprint_Version.version_number` increments on changes (1 → 2 → 3...)
- `Instance.blueprint_version_id` snapshots specific version at creation
- `Blueprint.current_version_id` points to latest version
- Simple numeric comparison enables upgrade decisions

---

## 🎯 Configuration Inheritance & Data Completeness

```
Template_Version (default_values) → Blueprint_Template (custom_values) → Instance_Template (template_values) → ArgoCD App
```

**Values Merge Hierarchy:**
1. **Template_Version.default_values** - Base configuration from Helm Chart
2. **Blueprint_Template.custom_values** - Global blueprint configuration
3. **Instance_Template.template_values** - Final merged values (includes instance overrides)

**Template Version Control:**
- **Blueprint_Template.template_version_id** defines exact template version to use
- **Instance** inherits template versions from its Blueprint_Version
- **Template version changes** require new Blueprint_Version (tested combinations)

**Required Fields for Helm Chart Generation:**

**Instance Level:**
- `git_repository`: Where to write generated Helm Chart
- `git_path`: Path within repository for instance files  
- `git_branch`: Target branch for generated files
- `name`: Used for ArgoCD Application names and namespaces

**Instance_Template Level:**
- `template_values`: Final merged configuration (JSON/YAML)
- `target_namespace`: Kubernetes namespace for deployment

**Template_Version Level (via Blueprint_Template):**
- `git_commit_hash`: Specific commit version of external template
- `chart_metadata`: Helm chart metadata for ArgoCD Application
- `default_values`: Base values for merging

**Template Level:**
- `git_repository_url`: External Helm Chart repository
- `git_path`: Path to chart within external repository

**All fields required for autonomous generation - no external lookups needed.**

---

## 🔄 Blueprint Versioning Strategy

**MVP Approach - Refinado com Blueprint + Blueprint_Version:**

### **Version Management:**
- **Simple Versioning:** Blueprint_Version.version_number increments on changes (1 → 2 → 3...)
- **Instance Snapshot:** Instance.blueprint_version_id references specific Blueprint_Version
- **Current Version:** Blueprint.current_version_id points to latest Blueprint_Version
- **DevOps Control:** Manual decision for when/how to upgrade instances
- **Historical Awareness:** System knows which instances need upgrades

### **Change Workflow:**
```
1. Developer modifies helper_templates or templates
2. System creates new Blueprint_Version (version_number: 2)
3. System updates Blueprint.current_version_id → new Blueprint_Version
4. Existing instances keep blueprint_version_id = previous version (no automatic changes)
5. System shows: "Instance X using version 1, Blueprint now at version 2"
6. DevOps reviews changes and decides to upgrade
7. DevOps manually updates Instance.blueprint_version_id = new version
8. System regenerates Helm Chart with current Blueprint_Version configuration
```

### **Versioning Benefits:**
- **Immutable Versions:** Each Blueprint_Version is immutable after creation
- **Complete History:** All versions preserved in Blueprint_Version table
- **Easy Rollback:** Change Instance.blueprint_version_id to previous version
- **Flexible Evolution:** Different versions can have completely different templates
- **No Automatic Classification:** All changes treated equally for MVP simplicity

---

## 🔒 Restrições Principais

**Unicidade:**
- Location, Environment, Application, Template: nomes globalmente únicos
- Blueprint: nomes únicos dentro da aplicação
- Blueprint_Version: version_number único dentro do blueprint (1, 2, 3...)
- Instance: nomes globalmente únicos
- Blueprint_Template: (blueprint_version_id, template_id) único

**Versionamento:**
- Blueprint_Version.version_number segue incremento simples (1, 2, 3...)
- Instance.blueprint_version_id faz snapshot da versão na criação para estabilidade
- Blueprint.current_version_id aponta sempre para a versão mais recente
- Comparação numérica simples permite detecção de upgrade e rollback

**Convenção de Nomenclatura:**
- Todos os nomes: caracteres alfanuméricos + hífens, iniciam/terminam com letra
- Blueprint names usados como prefixo nos helpers: `blueprint-name.component.property`
- Instance names: padrão `{application.name}-{location.name}-{environment.name}`

**Helper Template Defines:**
- Formato recomendado: `{blueprint.name}.{component}.{property}`
- Exemplo: `ecommerce-api.database.name`, `ecommerce-api.common.labels`
- Blueprint name sanitizado para uso em defines Helm
- Validação MVP: sintaxe Go template válida apenas (não formato naming)

---

## 📈 MVP Scale

**Expected Volumes:**
- Locations: 3 (Brazil, EMEA, USA)
- Environments: 5 (dev, test, staging, prod, dr)
- Applications: 5 (current team applications)
- Templates: 20-50 (common infrastructure components)
- Instances: 50-200 (3 regions × 5 apps × multiple environments)

---

## 🎯 **Single Source of Truth Principle**

**System as Source of Truth:**
- DataOcean Instance Manager database contains ALL information needed for Helm Chart generation
- Git repository is **output destination only** - never read as source of truth
- System can regenerate complete Helm Chart from database at any time
- Manual changes in Git repository are **overwritten** on next regeneration

**Regeneration Triggers:**
- Instance configuration changes
- Blueprint template updates  
- Template version changes
- Manual regeneration request

**Data Completeness Guarantee:**
All entities contain sufficient information for autonomous Helm Chart generation without external dependencies (except referenced Helm templates).

---

## 🔗 ArgoCD Integration & Git Strategy

**Template References:** Templates point to external Git repositories with Helm Charts (read-only).

**Git Repository Strategy:**
- **Input:** External template repositories (read-only references)
- **Output:** Instance Helm Charts written to Git repository
- **Source of Truth:** DataOcean database (never Git repository)
- **Regeneration:** Complete Helm Chart recreated from database on demand

**Generated Output:** Instance creates ArgoCD App of Apps Helm Chart with:
```yaml
# App of Apps parent chart
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: {instance.name}-app-of-apps
spec:
  source:
    repoURL: {instance.git_repository}
    path: {instance.git_path}
    targetRevision: {instance.git_branch}
  # Contains child Applications per template

# Child Applications (per template in blueprint)
apiVersion: argoproj.io/v1alpha1  
kind: Application
metadata:
  name: {instance.name}-{blueprint_template.alias}  # alphanumeric + hyphens format
spec:
  source:
    repoURL: {template.git_repository_url}
    path: {template.git_path}
    targetRevision: {instance_template.git_revision}
    helm:
      values: |
        {instance_template.template_values}
  destination:
    namespace: {instance_template.target_namespace}
```

**MVP Scope:**
- ✅ Database as single source of truth, regenerate Helm Charts on demand
- ✅ Reference external templates, merge configuration values  
- ❌ Monitor Git changes, template lifecycle management, bidirectional sync

---

*Database contains complete state for autonomous Helm Chart generation without external dependencies.*