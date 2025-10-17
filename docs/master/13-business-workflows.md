# 🔄 Business Workflows - DataOcean Instance Manager

## 📋 Overview

This document defines **end-to-end business workflows** and **user journeys** for the DataOcean Instance Manager. While the API specifications detail individual operations, this document shows how users complete real business tasks from start to finish.

**Target Audience:** DevOps Engineers, Platform Engineers, Development Teams
**Scope:** Complete user workflows, error scenarios, and operational procedures

---

## 🎯 Core User Personas

### **👤 Platform/DevOps Engineer**
- **Role:** Infrastructure setup, template management, blueprint creation, instance deployment, operational management
- **Goals:** Standardize deployment patterns, ensure template governance, deploy applications efficiently, maintain deployment health
- **Responsibilities:** 
  - **Platform Setup:** System configuration, template versioning, blueprint design
  - **Operations:** Instance creation, environment management, deployment monitoring, troubleshooting
- **Context:** Combined role handling both platform engineering and DevOps responsibilities

### **👤 Development Team Lead**
- **Role:** Application deployment coordination, environment provisioning, requirements definition
- **Goals:** Get applications deployed quickly with proper configurations, ensure development team productivity
- **Responsibilities:** Instance customization, application-specific configurations, environment requirements specification
- **Context:** Collaborates with Platform/DevOps team to define deployment needs and custom configurations

---

## 🚀 Workflow 1: Initial System Setup

**User Story:** *As a Platform/DevOps Engineer, I want to set up the DataOcean Instance Manager for our organization so that teams can deploy applications across multiple regions and environments.*

### **📋 Prerequisites**
- DataOcean Instance Manager deployed and accessible
- Admin access to the system
- Knowledge of organization's infrastructure (regions, environments, clusters)

### **🔧 Step-by-Step Process**

#### **Step 1: Configure Infrastructure Foundation**
```
1.1 Create Locations
    → API: POST /locations
    → Data: name="Brazil", description="Brazil Southeast Region"
    → API: POST /locations  
    → Data: name="EMEA", description="Europe, Middle East, Africa"
    → API: POST /locations
    → Data: name="USA", description="United States East Coast"

1.2 Create Environments
    → API: POST /environments
    → Data: name="Development", description="Development environment"
    → API: POST /environments
    → Data: name="Staging", description="Staging environment"  
    → API: POST /environments
    → Data: name="Production", description="Production environment"

1.3 Register Kubernetes Clusters
    → API: POST /clusters
    → Data: name="AKS-Brazil-01", server_url="https://aks-brazil-01.azure.com",
            description="Azure AKS cluster in Brazil region"
    → API: POST /clusters
    → Data: name="AKS-EMEA-01", server_url="https://aks-emea-01.azure.com",
            description="Azure AKS cluster in EMEA region"
    → API: POST /clusters
    → Data: name="EKS-USA-01", server_url="https://eks-usa-01.amazonaws.com",
            description="AWS EKS cluster in USA region"
    → Note: Clusters are just deployment targets - no location/environment binding
```

#### **Step 2: Configure First Application**
```
2.1 Create Business Application
    → API: POST /applications
    → Data: name="Ecommerce-Platform", description="Core e-commerce application"
```

#### **Step 3: Setup Repository and Template Catalog**
```
3.1 Register Azure DevOps Helm Charts Repository
    → API: POST /repositories
    → Data: azure_devops_org="mycompany",
            azure_devops_project="Platform",
            git_repository_name="helm-charts",
            description="Platform team Helm Charts"
    → System: Constructs git_url = "https://dev.azure.com/mycompany/Platform/_git/helm-charts"
    → System: Uses "helm-charts" as repository identifier
    → System: Validates access using Azure Managed Identity
    → Result: repository_id = 1

3.2 Register Application Team Repository
    → API: POST /repositories  
    → Data: azure_devops_org="mycompany",
            azure_devops_project="Applications",
            git_repository_name="microservices-charts",
            description="Application team microservice charts"
    → Result: repository_id = 2

3.3 Add Tracked Branches for Platform Repository
    → API: POST /branches
    → Data: repository_id=1, name="main"
    → API: POST /branches
    → Data: repository_id=1, name="develop"
    → Results: branch_id = 1 (main), branch_id = 2 (develop)

3.4 Add Tracked Branches for Application Repository
    → API: POST /branches
    → Data: repository_id=2, name="main"
    → API: POST /branches
    → Data: repository_id=2, name="feature/v2"
    → Results: branch_id = 3 (main), branch_id = 4 (feature/v2)

3.5 Create Database Template
    → API: POST /templates
    → Data: name="PostgreSQL-Database", 
            repository_id=1,
            git_path="database/postgresql",
            description="PostgreSQL database with monitoring"
    → Result: template_id = 1

3.6 Import Database Version from Main Branch
    → API: POST /templates/1/import-version
    → Data: branch_id=1 (platform main branch)
    → System: Uses Azure Managed Identity to access Azure DevOps
    → System: Fetches latest commit from main branch and creates Template_Version

3.7 Create API Service Template
    → API: POST /templates
    → Data: name="FastAPI-Service",
            repository_id=2,
            git_path="microservices/fastapi-service",
            description="FastAPI microservice with ingress"
    → Result: template_id = 2

3.8 Import API Service Version from Company Main
    → API: POST /templates/2/import-version
    → Data: branch_id=3 (company main branch)
    → System: Creates Template_Version from company repository

3.9 Create Cache Template
    → API: POST /templates
    → Data: name="Redis-Cache",
            repository_id=1,
            git_path="bitnami/redis", 
            description="Redis cache cluster"
    → Result: template_id = 3

3.10 Import Cache Version
    → API: POST /templates/3/import-version
    → Data: branch_id=1 (bitnami main branch)
    → System: Creates Template_Version for Redis
```

### **✅ Expected Outcomes**
- Infrastructure foundation configured (locations, environments, clusters)
- First application registered in the system
- Azure DevOps repository catalog configured with tracked branches
- Template catalog available with imported versions from specific branches
- System ready for blueprint and instance creation with Azure Managed Identity authentication
- Zero credential management - all authentication handled by Azure

### **❌ Error Scenarios**
- **Cluster connectivity issues:** Validate Kubernetes API access before registering
- **Azure DevOps access issues:** Ensure Managed Identity has proper permissions to Azure DevOps projects
- **Branch validation failures:** Verify branches exist in Azure DevOps repositories before tracking
- **Template import failures:** Validate Helm chart structure at specified paths in Azure DevOps
- **Managed Identity permissions:** Ensure proper Azure AD permissions for target organizations/projects
- **Naming conflicts:** Handle duplicate names gracefully with clear error messages

---

## 🎨 Workflow 2: Blueprint Creation & Template Orchestration

**User Story:** *As a Platform/DevOps Engineer, I want to create a deployment blueprint that combines multiple templates so that development teams can deploy the complete e-commerce stack consistently.*

### **📋 Prerequisites**
- Application and templates exist in the system
- Understanding of application architecture and dependencies
- Knowledge of template dependencies and deployment order

### **🔧 Step-by-Step Process**

#### **Step 1: Create Blueprint Foundation**
```
1.1 Create Blueprint
    → API: POST /blueprints
    → Data: application_id=1, name="Ecommerce-Standard",
            description="Standard e-commerce deployment pattern"
    → System: Auto-creates Blueprint_Version v1 with empty helper_templates
```

#### **Step 2: Add Templates to Blueprint**
```
2.1 Add Database Template (Deploy First)
    → API: POST /blueprint-versions/{version_id}/templates  
    → Data: template_version_id=1, alias="database", order=1,
            custom_values={
              "auth": { "database": "ecommerce_prod" },
              "primary": { "persistence": { "size": "100Gi" } }
            }

2.2 Add Cache Template (Deploy Second)
    → API: POST /blueprint-versions/{version_id}/templates
    → Data: template_version_id=3, alias="cache", order=2,
            custom_values={
              "cluster": { "enabled": true, "slaveCount": 2 },
              "metrics": { "enabled": true }
            }

2.3 Add API Service Template (Deploy Last)
    → API: POST /blueprint-versions/{version_id}/templates
    → Data: template_version_id=2, alias="api", order=3,
            custom_values={
              "image": { "repository": "company/ecommerce-api" },
              "ingress": { "enabled": true, "hostname": "api.ecommerce.com" },
              "database": { "host": "{{ include \"ecommerce.database.host\" . }}" }
            }
```

#### **Step 3: Configure Helper Templates**
```
3.1 Update Blueprint with Helper Templates
    → API: PUT /blueprint-versions/{version_id}
    → Data: helper_templates="""
{{- define "ecommerce.database.host" -}}
{{- printf "%s-%s" .Values.global.instance "database" -}}
{{- end -}}

{{- define "ecommerce.cache.host" -}}  
{{- printf "%s-%s" .Values.global.instance "cache" -}}
{{- end -}}

{{- define "ecommerce.common.labels" -}}
app.kubernetes.io/name: {{ .Values.global.application }}
app.kubernetes.io/instance: {{ .Values.global.instance }}
environment: {{ .Values.global.environment }}
location: {{ .Values.global.location }}
{{- end -}}
"""
```

#### **Step 4: Validate Blueprint Configuration**
```
4.1 Test Template Version Compatibility
    → API: POST /templates/{template_id}/validate-values
    → Data: template_version_id=1, custom_values={...}
    → Verify: All custom_values pass schema validation

4.2 Preview Blueprint Deployment
    → API: GET /blueprints/{blueprint_id}/versions/{version_id}
    → Review: Template combinations, helper templates, deployment order
```

### **✅ Expected Outcomes**
- Blueprint created with tested template combinations
- Helper templates configured for cross-template references
- Template deployment order defined (database → cache → api)
- Blueprint ready for instance creation

### **❌ Error Scenarios**
- **Template version conflicts:** Incompatible template versions or conflicting requirements
- **Helper template syntax errors:** Invalid Go template syntax in helper templates
- **Custom values validation failures:** Values that don't match template schemas

---

## 🚀 Workflow 3: Application Instance Deployment

**User Story:** *As a Platform/DevOps Engineer, I want to deploy an e-commerce instance to production so that our application is running in the Brazil production environment.*

### **📋 Prerequisites**
- Blueprint version exists and is tested
- Target cluster is configured and accessible
- Git repository configured for Helm chart storage
- ArgoCD access for deployment execution

### **🔧 Step-by-Step Process**

#### **Step 1: Create Instance Configuration**
```
1.1 Create Instance
    → API: POST /instances
    → Data: {
        "name": "ecommerce-brazil-production",
        "blueprint_version_id": 1,
        "cluster_id": 2,      // Brazil-Prod-AKS (independent cluster)
        "location_id": 1,     // Brazil (for Helm chart generation)
        "environment_id": 3,  // Production (for Helm chart generation)
        "git_repository": "https://github.com/company/argocd-charts",
        "git_path": "instances/ecommerce-brazil-production",
        "git_branch": "main",
        "auto_sync_enabled": false,  // Manual sync for production
        "auto_prune_enabled": true,
        "auto_heal_enabled": true,
        "create_namespace": true
      }
    → System: Auto-creates Instance_Templates for database, cache, api
    → System: Inherits template versions from blueprint
    → System: Uses location_id and environment_id for Helm chart context
    → System: Generates target namespaces: "ecommerce-brazil-production"
```

#### **Step 2: Customize Instance Values**
```
2.1 Customize Database Configuration
    → API: PUT /instances/{instance_id}/templates/{instance_template_id}/values
    → Data: {
        "primary": {
          "persistence": { "size": "500Gi" },  // Larger disk for production
          "resources": { 
            "requests": { "cpu": "2", "memory": "8Gi" },
            "limits": { "cpu": "4", "memory": "16Gi" }
          }
        },
        "metrics": { "enabled": true, "serviceMonitor": { "enabled": true } }
      }

2.2 Customize API Service Configuration  
    → API: PUT /instances/{instance_id}/templates/{instance_template_id}/values
    → Data: {
        "replicaCount": 3,  // HA for production
        "image": { "tag": "v2.1.0" },  // Specific production version
        "ingress": { 
          "hostname": "api.ecommerce.com.br",
          "tls": { "enabled": true }
        },
        "resources": {
          "requests": { "cpu": "1", "memory": "2Gi" },
          "limits": { "cpu": "2", "memory": "4Gi" }
        }
      }

2.3 Customize Cache Configuration
    → API: PUT /instances/{instance_id}/templates/{instance_template_id}/values  
    → Data: {
        "cluster": { "slaveCount": 3 },  // More replicas for production
        "persistence": { "enabled": true, "size": "50Gi" }
      }
```

#### **Step 3: Generate and Deploy Helm Chart**
```
3.1 Generate Helm Chart
    → API: POST /instances/{instance_id}/generate-helm-chart
    → System: Merges Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
    → System: Generates App of Apps chart with 3 ArgoCD Applications:
              - ecommerce-brazil-production-database
              - ecommerce-brazil-production-cache  
              - ecommerce-brazil-production-api
    → System: Commits chart to Git repository

3.2 Deploy via ArgoCD
    → Manual: Create ArgoCD Application pointing to generated chart
    → ArgoCD: Syncs and deploys all 3 applications in order
    → Monitor: Deployment status in ArgoCD UI
```

#### **Step 4: Verify Deployment**
```
4.1 Check Instance Status
    → API: GET /instances/{instance_id}
    → Review: Instance configuration, template versions, Git commit
    → Verify: All Instance_Templates show correct merged values

4.2 Monitor ArgoCD Applications
    → ArgoCD UI: Check sync status of all 3 applications
    → Verify: Applications deploy in correct order (database → cache → api)
    → Confirm: All pods are running and healthy
```

### **✅ Expected Outcomes**
- Instance deployed with production-ready configurations
- All templates deployed in correct dependency order
- ArgoCD managing ongoing synchronization
- Application accessible at production URL

### **❌ Error Scenarios**
- **Resource constraints:** Insufficient cluster resources for production workloads
- **Git repository issues:** Authentication or access problems with chart repository
- **ArgoCD sync failures:** Network issues or configuration conflicts
- **Template dependency failures:** Database not ready when API tries to connect

---

## 🔄 Workflow 4: Template Version Management & Instance Upgrades

**User Story:** *As a Platform/DevOps Engineer, I want to upgrade our database template to a newer version and roll it out to development instances first, then production.*

### **📋 Prerequisites**
- Existing template with instances deployed
- New template version available in Git repository
- Understanding of breaking changes and migration requirements

### **🔧 Step-by-Step Process**

#### **Step 1: Import New Template Version**
```
1.1 Check for Updates in Specific Branch
    → API: POST /templates/{template_id}/sync-branch
    → Data: branch_id=1  // Target specific branch (e.g., bitnami main)
    → System: Checks latest commit in specified branch
    → System: If new commit found, creates Template_Version with branch_id + commit hash
    → System: Optionally updates Template.current_version_id
    → Review: New default_values, chart_metadata changes

1.2 Alternative: Import from Different Branch
    → API: POST /templates/{template_id}/import-version
    → Data: branch_id=2  // Import from develop branch
    → System: Creates Template_Version from develop branch
    → System: Allows testing development versions
    → Review: Compare differences between branch versions
```

#### **Step 2: Test New Version in Development Blueprint**
```
2.1 Create New Blueprint Version for Testing
    → API: POST /blueprints/{blueprint_id}/versions
    → Data: helper_templates="..." // Copy from previous version
    → System: Creates Blueprint_Version v2

2.2 Update Template to New Version
    → API: PUT /blueprint-versions/{new_version_id}/templates/{blueprint_template_id}
    → Data: template_version_id=4  // New template version
    → Keep: Same custom_values and alias
    → System: Blueprint now uses new template version
```

#### **Step 3: Deploy Test Instance**
```
3.1 Create Development Test Instance
    → API: POST /instances  
    → Data: {
        "name": "ecommerce-brazil-development-v2",
        "blueprint_version_id": 2,  // New blueprint version
        "cluster_id": 1,  // Development cluster
        "git_repository": "https://github.com/company/argocd-charts",
        "git_path": "instances/ecommerce-brazil-development-v2"
      }

3.2 Generate and Deploy Test Chart
    → API: POST /instances/{test_instance_id}/generate-helm-chart
    → Deploy via ArgoCD
    → Test: Verify new template version works correctly
```

#### **Step 4: Upgrade Production Instances**
```
4.1 Upgrade Production Instance to New Blueprint Version
    → API: PUT /instances/{prod_instance_id}/upgrade
    → Data: blueprint_version_id=2  // Tested blueprint version
    → System: Regenerates all Instance_Templates with new template versions
    → System: Preserves instance-specific custom values where compatible

4.2 Review Configuration Changes
    → API: GET /instances/{prod_instance_id}
    → Review: Template version changes, value merging results
    → Verify: Instance-specific overrides preserved

4.3 Generate Updated Production Chart
    → API: POST /instances/{prod_instance_id}/generate-helm-chart  
    → System: Generates chart with new template versions
    → ArgoCD: Detects changes and shows diff
    → Manual: Review changes and approve sync in ArgoCD
```

### **✅ Expected Outcomes**
- New template version tested in development environment
- Production instances upgraded with minimal disruption
- Instance-specific configurations preserved during upgrade
- Clear audit trail of template version changes

### **❌ Error Scenarios**
- **Breaking changes:** New template version incompatible with existing custom values
- **Migration requirements:** Database schema changes requiring manual intervention
- **Rollback needs:** Quick rollback to previous blueprint version if issues arise

---

## 📊 Workflow 5: Day-to-Day Operations & Monitoring

**User Story:** *As a Platform/DevOps Engineer, I want to monitor and manage deployed instances so that I can ensure applications are running smoothly and troubleshoot issues quickly.*

### **📋 Prerequisites**
- Instances deployed and running
- Access to ArgoCD for deployment monitoring
- Understanding of application architecture and dependencies

### **🔧 Step-by-Step Process**

#### **Step 1: Instance Health Monitoring**
```
1.1 Review All Instances
    → API: GET /instances
    → Filter: By cluster_id for infrastructure view
    → Filter: By application_id for application-focused view
    → Review: Instance status, blueprint versions, last updates

1.2 Check Specific Instance Details
    → API: GET /instances/{instance_id}
    → Review: Complete configuration, template versions
    → Verify: Instance_Templates show correct merged values
    → Check: Git repository sync status
```

#### **Step 2: Configuration Troubleshooting**
```
2.1 Investigate Configuration Issues
    → API: GET /instances/{instance_id}
    → Review: Final merged values for each template
    → Identify: Conflicts between template defaults, blueprint overrides, instance customizations
    → Trace: Value inheritance from Template_Version → Blueprint_Template → Instance_Template

2.2 Update Instance Configuration
    → API: PUT /instances/{instance_id}/templates/{template_id}/values
    → Data: Updated instance-specific overrides
    → API: POST /instances/{instance_id}/generate-helm-chart
    → ArgoCD: Review diff and approve changes
```

#### **Step 3: Infrastructure Management**
```
3.1 Cluster Resource Planning
    → API: GET /instances?cluster_id={cluster_id}
    → Review: All instances deployed to specific cluster
    → Analyze: Resource usage patterns, scaling needs
    → Plan: Cluster capacity and instance distribution

3.2 Application Deployment Tracking
    → API: GET /instances?application_id={app_id}
    → Review: All instances of specific application
    → Compare: Configuration differences between environments
    → Plan: Standardization and consistency improvements
```

#### **Step 4: Routine Maintenance**
```
4.1 Template Version Audit
    → Review: Template versions across all instances
    → Identify: Instances using outdated template versions
    → Plan: Upgrade schedule for non-critical updates

4.2 Blueprint Standardization
    → Review: Blueprint usage patterns
    → Identify: Configuration drift between similar instances
    → Plan: Blueprint improvements and standardization
```

### **✅ Expected Outcomes**
- Clear visibility into instance health and configuration
- Quick identification and resolution of deployment issues
- Proactive monitoring of template version currency
- Data-driven decisions for infrastructure and blueprint improvements

### **❌ Error Scenarios**
- **Configuration drift:** Instances with significantly different configurations from blueprint
- **Template version lag:** Critical security updates not applied to production instances
- **Resource constraints:** Cluster capacity issues affecting instance performance

---

## 🔧 Workflow 6: Error Resolution & Troubleshooting

**User Story:** *As a Platform/DevOps Engineer, I need to quickly diagnose and resolve deployment failures so that applications can be restored to working state.*

### **📋 Common Error Scenarios**

#### **Scenario 1: Helm Chart Generation Failure**
```
Problem: Instance chart generation fails with template errors

Troubleshooting Steps:
1. API: GET /instances/{instance_id}
   → Review: Instance_Template configurations
   → Check: Template version compatibility

2. API: POST /templates/{template_id}/validate-values
   → Data: custom_values from failing Instance_Template
   → Identify: Schema validation failures

3. Fix: Update Instance_Template values
   → API: PUT /instances/{instance_id}/templates/{template_id}/values
   → Data: Corrected configuration values

4. Retry: Generate chart
   → API: POST /instances/{instance_id}/generate-helm-chart
```

#### **Scenario 2: ArgoCD Sync Failure**
```
Problem: ArgoCD cannot sync generated chart

Troubleshooting Steps:
1. Verify: Git repository access and chart validity
2. Check: ArgoCD Application configuration matches instance settings
3. Review: Kubernetes cluster connectivity and permissions
4. Fix: Correct configuration in instance or ArgoCD
5. Retry: Manual sync in ArgoCD UI
```

#### **Scenario 3: Template Version Conflicts**
```
Problem: Blueprint template versions are incompatible

Troubleshooting Steps:
1. API: GET /blueprints/{blueprint_id}/versions/{version_id}
   → Review: All template versions in blueprint
   → Identify: Conflicting requirements

2. Resolution Options:
   → Update blueprint template to compatible version
   → Create new blueprint version with compatible templates
   → Modify template custom_values to resolve conflicts

3. Test: Deploy to development environment first
4. Apply: Upgrade production instances after validation
```

### **🔨 Emergency Procedures**

#### **Rollback Instance to Previous Blueprint Version**
```
1. API: GET /instances/{instance_id}
   → Note: Current blueprint_version_id

2. API: PUT /instances/{instance_id}/upgrade  
   → Data: blueprint_version_id={previous_version}
   → System: Reverts to previous template versions

3. API: POST /instances/{instance_id}/generate-helm-chart
   → Generate: Chart with previous configuration

4. ArgoCD: Sync to deploy rollback
```

#### **Emergency Instance Shutdown**
```
1. ArgoCD: Delete ArgoCD Applications for instance
2. Manual: Scale down deployments in Kubernetes
3. API: Update instance status to "maintenance"
4. Document: Incident details for post-mortem
```

---

## 📈 Success Metrics & KPIs

### **Deployment Efficiency**
- **Time to Deploy:** From instance creation to running application
- **Success Rate:** Percentage of successful deployments without manual intervention
- **Template Reuse:** Number of instances using standardized blueprints

### **Operational Health**
- **Configuration Drift:** Instances with significant deviations from blueprint
- **Template Currency:** Percentage of instances using latest template versions
- **Error Rate:** Failed deployments requiring manual troubleshooting

### **Platform Adoption**
- **Blueprint Coverage:** Percentage of applications using standardized blueprints
- **Self-Service Rate:** Deployments completed without platform team intervention
- **Template Ecosystem:** Number of reusable templates available

---

## 🎯 Best Practices Summary

### **For Platform/DevOps Engineers**
1. **Start Small:** Begin with simple blueprints and iterate based on feedback
2. **Version Control:** Always use specific template versions, avoid "latest"
3. **Test First:** Validate all changes in development before production
4. **Document Changes:** Maintain clear records of template and blueprint evolution
5. **Monitor Continuously:** Regular review of instance configurations for consistency
6. **Plan Upgrades:** Schedule regular template version updates
7. **Automate When Possible:** Use blueprints to standardize deployments and reduce manual work

### **For Development Teams**
1. **Understand Blueprints:** Learn available deployment patterns for your applications
2. **Collaborate Early:** Involve Platform/DevOps team in custom requirements
3. **Environment Parity:** Keep development and production configurations similar
4. **Report Issues:** Provide feedback on blueprint limitations and improvement needs
5. **Follow Standards:** Use standardized blueprints whenever possible
6. **Minimal Overrides:** Keep instance-specific customizations to minimum

---

*This workflow guide ensures consistent, reliable, and scalable application deployment across all environments while maintaining flexibility for specific requirements.*