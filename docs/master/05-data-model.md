# � Data Model - Business Logic & Workflows

## 📋 Overview

Defines **business logic, data flows, and architectural strategies** for managing ArgoCD App of Apps deployments across multiple regions and environments.

> **📄 Technical Schema:** Complete database structure in [`database-schema.dbml`](./database-schema.dbml)

**Key Architectural Enhancements:** 
- **Template Versioning Strategy:** Separation of metadata from versioned data enables concurrent template versions
- **Blueprint Governance Model:** Tested template version combinations with commit-based isolation
- **Instance Inheritance Pattern:** Automatic template version inheritance via Blueprint_Version selection

---

> **💡 Note on Source of Truth:** `database-schema.dbml` is the canonical source for all table/column/index/type definitions. Do not duplicate schema details here — use this document for business rules, flows and architecturally relevant explanations only.


## � Core Business Entities & Workflows

### **1. Infrastructure Foundation**
**Location + Environment + Cluster** create the deployment target matrix.

**Business Logic:**
- **Location:** Geographic regions (Brazil, EMEA, USA) for compliance and latency
- **Environment:** Deployment stages (Development, Staging, Production, DR)
- **Cluster:** Kubernetes clusters with unique `(server_url, location_id, environment_id)` combinations

**Workflow:**
```
Location + Environment + Cluster = Complete Deployment Target
Instance specifies all three explicitly for precise targeting
Multiple clusters per location+environment supported (HA, scaling)
```

### **2. Application Lifecycle**
**Applications** represent business services that can be deployed via multiple blueprint patterns.

**Business Logic:**
- One Application can have multiple Blueprints (different deployment patterns)
- Applications define the business domain, Blueprints define deployment strategies
- Global naming ensures unique identification across entire organization

### **3. Template Versioning Strategy**
**Templates + Template_Versions** implement **commit-based isolation** for Helm Chart management.

**Business Model:**
- **Template:** Metadata container for external Helm Chart repository
- **Template_Version:** Immutable snapshot of chart data at specific Git commit

**Key Workflows:**

#### **Template Import Process:**
```
1. Developer specifies Git repository + path + commit
2. System imports complete chart data:
   - Chart.yaml metadata
   - values.yaml defaults  
   - values.schema.json (optional)
3. Creates immutable Template_Version record
4. Updates Template.current_version_id to new version
```

#### **Template Sync Process:**
```
1. System checks Git repository for new commits
2. For each new commit: creates new Template_Version
3. Preserves all historical versions (no deletion)
4. Updates current_version_id to latest
5. Existing instances continue using pinned versions
```

**Business Benefits:**
- **Commit Isolation:** Each Template_Version references specific Git commit hash
- **Version History:** Complete audit trail of all chart changes
- **Rollback Safety:** Previous versions always available
- **Schema Evolution:** values.schema.json enables custom values validation

### **4. Blueprint Governance Model**
**Blueprints + Blueprint_Versions** implement **tested template combinations** with version control.

**Governance Strategy:**
- **Blueprint:** Immutable identity (name, application, description)
- **Blueprint_Version:** Mutable configuration (helper templates, template version selections)
- **Blueprint_Template:** Tested combination of specific template versions

#### **Blueprint Version Workflow:**
```
1. DevOps creates Blueprint_Version with helper templates
2. DevOps selects specific Template_Versions for blueprint
3. Blueprint_Template records define tested combinations:
   - Specific template version (commit hash)
   - Custom values for blueprint context
   - Execution order and alias naming
4. Blueprint_Version becomes immutable after creation
5. Instances inherit template versions from Blueprint_Version
```

**Blueprint Governance Benefits:**
- **Tested Combinations:** Blueprint validates template versions work together
- **Version Control:** Numeric versioning (1, 2, 3...) with upgrade tracking
- **Instance Isolation:** Instances snapshot blueprint version for stability
- **Helper Templates:** Blueprint-specific Helm template definitions

### **5. Instance Deployment Pattern**
**Instances + Instance_Templates** implement **blueprint inheritance** with cluster-specific deployment.

**Instance Model:**
- **Instance:** Deployment configuration snapshot for specific cluster + location + environment + blueprint version
- **Instance_Template:** Final merged configuration per template within instance

#### **Instance Creation Workflow:**
```
1. DevOps selects Blueprint_Version + target Cluster + Location + Environment
2. System creates Instance with snapshot reference and explicit targeting
3. System auto-generates Instance_Templates:
   - One per Blueprint_Template in blueprint version
   - Inherits template versions from Blueprint_Templates
   - Applies 3-level values merge
4. Instance ready for Helm Chart generation
```

#### **Template Version Inheritance:**
```
Instance → Blueprint_Version → Blueprint_Template → Template_Version
                                       ↓
                              Specific commit hash + chart data
```

**Instance Evolution Strategies:**
- **Configuration Updates:** Modify instance-specific settings (Git repo, sync policies)
- **Template Upgrades:** Change Instance.blueprint_version_id (inherits new template versions)
- **Deployment Workflow:**
```
Instance Creation → Blueprint_Template Selection → Instance Configuration
- **Value Overrides:** Update Instance_Template.instance_values for specific customizations



---

## � **Core Data Flow Architecture**

### **📊 Entity Relationship Flow**
```
Application → Blueprint → Blueprint_Version → Instance → Instance_Template
     ↓           ↓            ↓                ↓            ↓
Templates → Template_Versions → Blueprint_Template → Merged Values → ArgoCD App
```

### **🔄 Version Control Flow**
```
1. Template Import:
   Git Repository → Template + Template_Version (immutable chart data)

2. Blueprint Evolution:
   Blueprint → Blueprint_Version (helper templates + template selections)

3. Template Governance:
   Blueprint_Version → Blueprint_Template (tested template version combinations)

4. Instance Deployment:
   Blueprint_Version + Cluster → Instance (deployment snapshot)

5. Configuration Resolution:
   Instance → Instance_Templates (final merged values per template)

6. Chart Generation:
   Instance_Templates → ArgoCD App of Apps (Git repository output)
```

### **📈 Versioning Strategy**
- **Incremental Versioning:** Blueprint_Version.version_number (1 → 2 → 3...)
- **Snapshot Isolation:** Instance.blueprint_version_id locks specific version
- **Current Tracking:** Blueprint.current_version_id points to latest
- **Upgrade Detection:** Numeric comparison identifies drift

## 🎯 **Configuration Inheritance Strategy**

### **📋 3-Level Values Merge Hierarchy**
```
Template_Version.default_values (Helm Chart base)
         ↓
Blueprint_Template.custom_values (Blueprint global config)  
         ↓
Instance_Template.instance_values (Final merged + instance overrides)
         ↓
ArgoCD Application values (Generated chart output)
```

### **🎯 Layer Override Strategy**

**CRITICAL ARCHITECTURAL PRINCIPLE:** Each layer stores **ONLY** its customizations, not complete values.

**Storage Strategy:**
- **Template_Version.default_values:** Complete Helm Chart values.yaml (baseline)
- **Blueprint_Template.custom_values:** ONLY blueprint-specific overrides (partial JSON)
- **Instance_Template.instance_values:** ONLY instance-specific overrides (partial JSON)

**Benefits:**
- ✅ **Storage Efficiency:** No duplication of template defaults
- ✅ **Change Traceability:** Clear visibility of what was customized at each layer
- ✅ **Template Updates:** Template changes don't break existing blueprints/instances
- ✅ **Override Clarity:** Explicit separation between defaults and customizations

**Example:**
```json
// Template_Version.default_values (complete)
{
  "image": { "tag": "1.0.0", "repository": "nginx" },
  "replicas": 1,
  "resources": { "cpu": "100m", "memory": "128Mi" }
}

// Blueprint_Template.custom_values (overrides only)
{
  "replicas": 3,
  "resources": { "cpu": "200m" }
}

// Instance_Template.instance_values (overrides only)  
{
  "image": { "tag": "1.2.0" },
  "resources": { "memory": "256Mi" }
}

// Final merged result (runtime only)
{
  "image": { "tag": "1.2.0", "repository": "nginx" },
  "replicas": 3,
  "resources": { "cpu": "200m", "memory": "256Mi" }
}
```

### **🔄 Values Merge Logic**
1. **Base Layer:** Template_Version provides complete chart defaults from values.yaml
2. **Blueprint Layer:** Blueprint_Template applies global blueprint overrides only
3. **Instance Layer:** Instance-specific overrides only (not merged values)
4. **Runtime Merge:** System merges all layers at deployment time

### **🔒 Template Version Governance**
- **Blueprint Control:** Blueprint_Template selects exact Template_Version (commit hash)
- **Instance Inheritance:** Instance inherits template versions via Blueprint_Version
- **Upgrade Pattern:** Template version changes require new Blueprint_Version
- **Tested Combinations:** Blueprint ensures template versions work together

### **📦 Data Completeness for Helm Generation**
**Complete autonomous generation capability - no external dependencies:**

- **Template Source:** External Git repository + path + commit hash
- **Chart Metadata:** Complete Chart.yaml content stored in Template_Version
- **Default Values:** Complete values.yaml stored in Template_Version  
- **Blueprint Config:** Blueprint-specific values in Blueprint_Template
- **Instance Config:** Final merged values in Instance_Template
- **Target Context:** Cluster server URL + namespace configuration

---

## 🆔 ID Strategy (Design Decision)

To avoid schema duplication while keeping operational simplicity and performance, the canonical schema (`database-schema.dbml`) uses **sequential numeric primary keys** (PostgreSQL `BIGSERIAL`) for all core tables. Rationale:

- **Performance:** Sequential keys produce smaller, more cache-friendly indexes and faster joins.
- **Simplicity:** Easier debugging and human-readable identifiers in logs and dashboards.
- **Storage efficiency:** Numeric keys require less space than UUIDs, especially for foreign keys.

When an external, non-guessable identifier is required (for public APIs or cross-system exchanges), add an auxiliary column such as `external_id UUID DEFAULT gen_random_uuid() UNIQUE`. This keeps internal performance benefits while allowing secure external references when needed.

Reference implementations and the definitive column types live in [`database-schema.dbml`](./database-schema.dbml).


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
        {instance_template.instance_values}
  destination:
    namespace: {instance_template.target_namespace}
```

**MVP Scope:**
- ✅ Database as single source of truth, regenerate Helm Charts on demand
- ✅ Reference external templates, merge configuration values  
- ❌ Monitor Git changes, template lifecycle management, bidirectional sync

---

*Database contains complete state for autonomous Helm Chart generation without external dependencies.*