# 🏗️ Helm Chart Generation Architecture - DataOcean Instance Manager

## 📋 Overview

This document defines the technical architecture for generating ArgoCD App of Apps Helm Charts from the DataOcean Instance Manager database entities. The system transforms blueprint configurations into deployable Helm Charts following the App of Apps pattern.

---

## 🎯 Core Architecture Principle

**DataOcean Instance Manager** acts as a **Helm Chart Generator** that produces ArgoCD App of Apps charts. Each Instance generates a complete, self-contained Helm Chart that references external template charts.

```
Database Entities → Helm Chart Generation Engine → App of Apps Chart → ArgoCD Deployment
```

---

## 📦 Generated Helm Chart Structure

### **Complete Chart Layout**
```
{instance.name}/                    # Root directory in Git repository
├── Chart.yaml                     # Helm Chart metadata
├── values.yaml                     # Instance-specific values
├── templates/
│   ├── _helpers.tpl               # Generated from Blueprint_Version.helper_templates
│   ├── database-app.yaml          # ArgoCD Application for database template
│   ├── api-app.yaml              # ArgoCD Application for API template
│   ├── cache-app.yaml             # ArgoCD Application for cache template
│   └── monitoring-app.yaml        # ArgoCD Application for monitoring template
└── .argocd-source.yaml           # ArgoCD App of Apps source configuration
```

### **Chart.yaml Generation**
```yaml
# Generated from Instance entity
apiVersion: v2
name: {instance.name}
description: "App of Apps for {blueprint.name} in {location.name}-{environment.name}"
version: 1.0.0
appVersion: "{blueprint_version.version_number}"
type: application
keywords:
  - argocd
  - app-of-apps
  - {application.name}
maintainers:
  - name: DataOcean Instance Manager
    url: https://github.com/dataocean/instance-manager
```

### **values.yaml Generation**
```yaml
# Generated from Instance.custom_values + environment context
global:
  environment: "{environment.name}"
  location: "{location.name}"
  application: "{application.name}"
  instance: "{instance.name}"

# Instance-specific custom values
{instance.custom_values}
```

---

## 🔗 ArgoCD Application Generation

### **Application Template Structure**
Each Blueprint_Template generates one ArgoCD Application manifest:

```yaml
# templates/{blueprint_template.alias}-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: {instance.name}-{blueprint_template.alias}
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: {template.git_repository_url}
    path: {template.git_path}
    targetRevision: {instance_template.git_revision}
    helm:
      releaseName: {instance.name}-{blueprint_template.alias}
      values: |
{instance_template.instance_values}
  destination:
    server: {cluster.server_url}
    namespace: {instance_template.target_namespace}
  syncPolicy:
    automated:
      prune: {instance.auto_prune_enabled}
      selfHeal: {instance.auto_heal_enabled}
    syncOptions:
    - CreateNamespace={instance.create_namespace}
```

### **Helper Templates Integration**
The `_helpers.tpl` file contains shared functions available to all child applications:

```yaml
# templates/_helpers.tpl (from Blueprint_Version.helper_templates)
{{- define "ecommerce-api.database.name" -}}
ecommerce-{{ .Values.global.environment | lower }}-db
{{- end -}}

{{- define "ecommerce-api.common.labels" -}}
app.kubernetes.io/name: {{ .Values.global.application }}
app.kubernetes.io/instance: {{ .Values.global.instance }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: dataocean-instance-manager
environment: {{ .Values.global.environment }}
location: {{ .Values.global.location }}
{{- end -}}

{{- define "ecommerce-api.api.replicas" -}}
{{- if eq .Values.global.environment "production" -}}
3
{{- else -}}
1
{{- end -}}
{{- end -}}
```

---

## 🎯 Data Flow Architecture

### **Entity to Chart Mapping**

```
Instance
├── Chart.yaml (name, description, version)
├── values.yaml (custom_values + global context)
├── .argocd-source.yaml (git_repository, git_path, git_branch)
└── syncPolicy configuration (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled, create_namespace)

Cluster
└── Application.spec.destination.server (server_url)

Blueprint_Version
└── templates/_helpers.tpl (helper_templates content)

Blueprint_Template (for each template in the blueprint version)
└── templates/{alias}-app.yaml (ArgoCD Application manifest)

Instance_Template (for each template instance)
├── Application.spec.helm.values (instance_values merged at runtime)
└── Application.spec.destination.namespace (target_namespace)

Template
├── Application.spec.source.repoURL (git_repository_url)
├── Application.spec.source.path (git_path)
└── Application.spec.helm.releaseName (chart_name)
```

### **Generation Process Flow**

```
1. Query Instance entity with related data:
   ├── Instance → Cluster (server_url)
   ├── Instance → Blueprint_Version → Blueprint_Template[] → Template[]
   └── Instance → Instance_Template[] → Template[]

2. Generate Chart.yaml:
   ├── name: Instance.name
   ├── description: Auto-generated from context
   └── appVersion: Blueprint_Version.version_number

3. Generate values.yaml:
   ├── global.* values from Instance context
   └── Instance.custom_values content

4. Generate _helpers.tpl:
   └── Blueprint_Version.helper_templates content

5. For each Blueprint_Template, generate ArgoCD Application:
   ├── metadata.name: Instance.name + Blueprint_Template.alias
   ├── spec.source.*: Template entity values
   ├── spec.destination.server: Cluster.server_url
   ├── spec.destination.namespace: Instance_Template.target_namespace
   ├── spec.helm.values: Instance_Template.instance_values (merged at runtime)
   └── spec.syncPolicy.*: Instance sync configuration fields

6. Write complete Helm Chart to Git repository:
   ├── Repository: Instance.git_repository
   ├── Path: Instance.git_path
   └── Branch: Instance.git_branch
```

---

## 🔄 Practical Examples

### **Example 1: E-commerce API Blueprint**

**Database Entities:**
```
Application: "ecommerce-platform"
Blueprint: "api-standard"
Blueprint_Version: version_number=2, helper_templates="..."
Location: "brazil-southeast"
Environment: "production"
Cluster: name="brazil-prod-aks", server_url="https://brasil-prod-aks.hcp.eastus.azmk8s.io:443"
Instance: "ecommerce-platform-brazil-production"
  ├── auto_sync_enabled=false (production = manual sync)
  ├── auto_prune_enabled=true
  ├── auto_heal_enabled=true
  └── create_namespace=true

Blueprint_Templates:
1. alias="database", template="PostgreSQL-Database", order=1
2. alias="api", template="FastAPI-Service", order=2
3. alias="cache", template="Redis-Cache", order=3

Instance_Templates:
1. instance_values="database config overrides...", target_namespace="ecommerce-prod"
2. instance_values="api config overrides...", target_namespace="ecommerce-prod"
3. instance_values="cache config overrides...", target_namespace="ecommerce-prod"
```

**Generated Helm Chart:**
```
ecommerce-platform-brazil-production/
├── Chart.yaml
│   name: ecommerce-platform-brazil-production
│   appVersion: "2"
├── values.yaml
│   global:
│     environment: "production"
│     location: "brazil-southeast"
│     application: "ecommerce-platform"
├── templates/
│   ├── _helpers.tpl              # Blueprint helper functions
│   ├── database-app.yaml         # PostgreSQL ArgoCD Application
│   ├── api-app.yaml             # FastAPI ArgoCD Application
│   └── cache-app.yaml           # Redis ArgoCD Application
```

### **Example 2: Generated Application Manifest**

**database-app.yaml:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ecommerce-platform-brazil-production-database
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://charts.bitnami.com/bitnami
    path: postgresql
    targetRevision: "12.1.5"
    helm:
      releaseName: ecommerce-platform-brazil-production-database
      values: |
        auth:
          database: {{ include "ecommerce-platform.database.name" . }}
          username: app_user
        primary:
          persistence:
            enabled: true
            size: 100Gi
        metrics:
          enabled: true
  destination:
    server: https://brasil-prod-aks.hcp.eastus.azmk8s.io:443
    namespace: ecommerce-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

---

## 🛠️ Implementation Considerations

### **Template Values Processing - Layer Override Implementation**

**CRITICAL:** Values are stored as **layer-specific overrides**, requiring runtime merge for chart generation.

```python
# Pseudocode for Layer Override Merge
def generate_application_values(instance_template):
    # Step 1: Load complete template defaults
    template_version = instance_template.blueprint_template.template_version
    base_values = json.loads(template_version.default_values)
    
    # Step 2: Apply blueprint-specific overrides (if any)
    blueprint_template = instance_template.blueprint_template
    if blueprint_template.custom_values:
        blueprint_overrides = json.loads(blueprint_template.custom_values)
        base_values = deep_merge(base_values, blueprint_overrides)
    
    # Step 3: Apply instance-specific overrides (if any)
    if instance_template.instance_values:
        instance_overrides = json.loads(instance_template.instance_values)
        base_values = deep_merge(base_values, instance_overrides)
    
    # Step 4: Return complete merged values as YAML
    return yaml.dump(base_values, default_flow_style=False)

def deep_merge(base_dict, override_dict):
    """Recursively merge override values into base dictionary"""
    result = base_dict.copy()
    for key, value in override_dict.items():
        if isinstance(value, dict) and key in result and isinstance(result[key], dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result
```

**Storage vs Runtime:**
- **Storage:** Only overrides stored (Blueprint_Template.custom_values, Instance_Template.instance_values)
- **Runtime:** Complete merged values generated for ArgoCD Application
- **Benefit:** Template updates don't require blueprint/instance updates

### **Helper Templates Integration**
```python
# Pseudocode for helper templates
def generate_helpers_tpl(blueprint_version):
    # Get raw helper templates content
    helpers_content = blueprint_version.helper_templates
    
    # Validate Go template syntax
    if not validate_go_template(helpers_content):
        raise ValidationError("Invalid Go template syntax")
    
    # Return as-is (no processing needed)
    return helpers_content
```

### **File Generation Order**
1. **Chart.yaml** - Chart metadata
2. **values.yaml** - Global values and instance customizations  
3. **templates/_helpers.tpl** - Shared template functions
4. **templates/*-app.yaml** - ArgoCD Applications (ordered by Blueprint_Template.order)

---

## 🎯 MVP Scope

### **✅ In Scope**
- Generate complete App of Apps Helm Charts
- Support helper templates with Blueprint naming convention
- Reference external Helm Charts via Template entities
- Merge instance-specific values with template configurations
- Write charts to specified Git repositories

### **❌ Out of Scope (Future)**
- Template content validation beyond syntax
- Dependency management between templates
- Automatic template version updates
- Chart lifecycle management
- Rollback mechanisms

---

## 🔐 Security & Best Practices

### **Repository Access**
- System requires write access to Instance.git_repository
- Generated charts should be committed with clear attribution
- Branch isolation recommended for different environments

### **Template Security**
- External template repositories are read-only references
- No template content stored in DataOcean database
- Template validation responsibility lies with template maintainers

### **Values Security**
- Sensitive values should use Kubernetes secrets
- Instance.custom_values should not contain plain-text secrets
- Helper templates should not expose sensitive information

---

## 🚀 Future Enhancements

1. **Template Validation**: Lint generated charts before commit
2. **Dependency Management**: Handle template inter-dependencies
3. **Preview Mode**: Generate charts without committing to Git
4. **Diff Generation**: Compare chart changes between versions
5. **Automatic Updates**: Detect template version changes

---

*This architecture enables DataOcean Instance Manager to function as a comprehensive Helm Chart generation engine, transforming database configurations into deployable ArgoCD App of Apps patterns.*