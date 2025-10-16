# 🔌 API Specifications - DataOcean Instance Manager

## 📋 Overview

This document defines backend API operations with focus on **business rules and validation logic**.

**Simple APIs:** Locations, Environments, Clusters, Applications - Basic CRUD with referential integrity
**Complex APIs:** Templates, Blueprints, Instances - Advanced business logic, Git integration, and deployment orchestration

---

## 🏗️ API Operations

### **1. Locations API**

#### **CREATE/UPDATE/DELETE Location**
- **What:** Manage geographical deployment regions
- **Rules:**
  - Name must be globally unique
  - Cannot change name or delete if referenced by clusters
  - Optional description field

---

### **2. Environments API**

#### **CREATE/UPDATE/DELETE Environment**
- **What:** Manage environment types (Development, Staging, Production)
- **Rules:**
  - Name must be globally unique
  - Cannot change name or delete if referenced by clusters
  - Optional description field

---

### **3. Clusters API**

#### **CREATE/UPDATE/DELETE Cluster**
- **What:** Manage Kubernetes clusters as deployment targets
- **Rules:**
  - Name must be globally unique
  - server_url must be valid Kubernetes API server URL
  - Unique combination of (location_id + environment_id) - one cluster per location/environment
  - Cannot change location/environment or delete if referenced by instances
  - Optional description field

---

### **4. Applications API**

#### **CREATE/UPDATE/DELETE Application**
- **What:** Manage business applications for deployment
- **Rules:**
  - Name must be globally unique
  - repository_url must be valid Git repository
  - Cannot change name or delete if referenced by blueprints
  - Optional description field

---

### **5. Templates API** *(Enhanced)*

#### **CREATE Template**
- **What:** Import complete Helm Chart data from Git repository
- **Process:**
  1. Validate Git repository access and path
  2. Fetch and parse Chart.yaml (required)
  3. Fetch and parse values.yaml (required) 
  4. Fetch values.schema.json (optional)
  5. Store all data in database with commit hash
- **Rules:**
  - Name must be globally unique
  - git_repository_url must be accessible
  - git_path must contain valid Helm Chart (Chart.yaml + values.yaml)
  - Chart metadata name must be valid
  - All fetched JSON/YAML must be parseable

#### **UPDATE Template Metadata**
- **What:** Update local template information (name, description)
- **Rules:**
  - Name must remain globally unique
  - Cannot change name if template is used in any blueprints
  - Description can be updated freely
  - No impact on chart data or Git repository
- **Impact:** Metadata changes only, existing blueprint references unchanged

#### **UPDATE Template Repository**
- **What:** Change Git repository location and re-import all chart data
- **Process:**
  1. Validate new git_repository_url and git_path
  2. Complete re-import process (same as CREATE)
  3. Update all chart data fields
- **Rules:**
  - FORBIDDEN if template is used in any blueprints (breaking change)
  - Must validate new repository before making changes
  - Atomic operation - all changes succeed or all fail
- **Impact:** Complete template data refresh, affects future blueprint usage

#### **SYNC Template Chart Data**
- **What:** Re-import chart data from current Git repository
- **Process:**
  1. Re-fetch Chart.yaml, values.yaml, values.schema.json from current repo
  2. Update chart_metadata, default_values, values_schema, git_commit_hash
  3. Preserve name, description, git_repository_url, git_path
- **Rules:**
  - Can be performed even if template is used in blueprints
  - Validates chart structure consistency
  - Warns if schema changes might affect existing configurations
- **Impact:** Chart data updated while preserving template identity and references

#### **VALIDATE Template Access**
- **What:** Test Git repository accessibility and chart validity
- **Process:**
  1. Test Git repository access
  2. Verify Chart.yaml and values.yaml exist and are parseable
  3. Check for values.schema.json availability
  4. Return detailed validation report
- **Rules:**
  - Read-only operation, no data changes
  - Provides diagnostics for repository issues
- **Impact:** None, validation only

#### **VALIDATE Values Against Schema**
- **What:** Validate custom values against template schema
- **When:** Blueprint configuration or instance updates
- **Process:**
  1. Load template values_schema (if exists)
  2. Validate provided values against schema
  3. Return detailed validation results with specific errors
- **Rules:**
  - If no schema exists, validation passes (schema is optional)
  - Returns warnings/suggestions, not blocking errors (MVP approach)
  - Validates structure, types, required fields
- **Impact:** Improved configuration accuracy and user guidance

#### **DELETE Template**
- **What:** Remove template and all imported data
- **Rules:**
  - FORBIDDEN if used in any blueprint templates
  - Must be completely unused across all blueprints
  - Cascades deletion of all stored chart data

---

### **6. Blueprints API**

#### **CREATE Blueprint**
- **What:** Define complete deployment pattern for application
- **When:** Creating new deployment architecture for application
- **Rules:**
  - Name must be unique within application scope
  - Name must follow naming convention: alphanumeric + hyphens only, start and end with letters (e.g., "Standard-Deployment", "High-Performance")
  - Must belong to exactly one valid application
  - Version must follow semantic versioning
  - helper_template must be valid Helm template syntax
- **Impact:** Blueprint becomes available for instance creation

#### **UPDATE Blueprint**
- **What:** Modify blueprint configuration
- **When:** Updating deployment pattern or helper templates
- **Rules:**
  - Cannot change application_id if instances exist
  - Name changes must maintain naming convention (alphanumeric + hyphens, start/end with letters)
  - Version updates create new version (no in-place updates)
  - helper_template changes affect future instance generations only
- **Impact:** Existing instances maintain current blueprint version; new instances use updated version

#### **ADD Template to Blueprint**
- **What:** Associate template with blueprint (creates Blueprint_Template)
- **When:** Adding infrastructure component to deployment pattern
- **Rules:**
  - Template must exist and be valid
  - Alias must be unique within blueprint scope
  - Same template can be added multiple times with different aliases
  - custom_values must be valid JSON/YAML
- **Impact:** Template becomes part of blueprint; affects all future instances

#### **UPDATE Blueprint Template**
- **What:** Modify template configuration within blueprint
- **When:** Adjusting template parameters or values
- **Rules:**
  - Cannot remove if instances exist using this blueprint template
  - custom_values changes affect future instance template generations
  - Alias changes require no conflicts within blueprint
- **Impact:** Existing instance templates maintain current values; new instances use updated configuration

#### **DELETE Blueprint**
- **What:** Remove blueprint from system
- **When:** Blueprint no longer needed
- **Rules:**
  - FORBIDDEN if any instances exist using this blueprint
  - Must have zero instances before deletion
  - Also removes all associated blueprint templates
- **Impact:** Prevents new instance creation with this blueprint

---

### **7. Instances API** *(Most Complex)*

#### **CREATE Instance**
- **What:** Create concrete deployment configuration for specific cluster target
- **When:** Deploying application to target infrastructure
- **Rules:**
  - Name must be globally unique across system
  - Must reference valid blueprint and cluster
  - cluster_id must exist and define valid location + environment combination
  - Combination of (blueprint + cluster) should be unique
  - git_repository must be accessible for Helm Chart generation
  - git_path must be valid path within repository
  - git_branch must exist in target repository
  - custom_values must be valid JSON/YAML
  - ArgoCD sync policy fields (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled, create_namespace) have sensible defaults
- **Impact:** 
  - Creates Instance_Template records for each Blueprint_Template
  - Triggers Helm Chart generation in target Git repository with proper cluster destination
  - Enables ArgoCD deployment workflow with configured sync policy
  - Links instance to specific Kubernetes cluster via cluster relationship

#### **Instance_Template Auto-Creation Logic**
- **What:** Automatically create Instance_Template for each Blueprint_Template
- **When:** During instance creation process
- **Rules:**
  - One Instance_Template per Blueprint_Template in blueprint
  - git_revision defaults to "main" (should be commit hash for robustness)
  - template_values inherit from Blueprint_Template.custom_values
  - target_namespace generated from instance name pattern
  - All Instance_Templates must be valid before instance creation completes
- **Impact:** Complete deployment configuration ready for Helm Chart generation

#### **UPDATE Instance**
- **What:** Modify instance configuration
- **When:** Updating deployment parameters, Git settings, or sync policies
- **Rules:**
  - Cannot change blueprint or cluster_id (structural changes)
  - Can update custom_values, git settings, status, and sync policy fields
  - Git repository changes require validation of accessibility
  - custom_values updates trigger Instance_Template value recalculation
  - Sync policy changes (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled, create_namespace) affect ArgoCD behavior
- **Impact:** 
  - Triggers Helm Chart regeneration with updated cluster destination and sync policy
  - Updates all Instance_Template configurations
  - Sync policy changes require manual ArgoCD synchronization to take effect

#### **UPDATE Instance_Template**
- **What:** Modify specific template configuration within instance
- **When:** Updating individual component versions or parameters
- **Rules:**
  - git_revision should be immutable commit hash for reliability
  - template_values merge with Blueprint_Template.custom_values (instance values override)
  - target_namespace changes must follow naming conventions
  - Cannot create orphan Instance_Templates (must belong to valid instance)
- **Impact:**
  - Triggers Helm Chart regeneration for instance
  - Updates specific ArgoCD Application configuration
  - Core entity for configuration comparison between instances

#### **GENERATE Helm Chart**
- **What:** Create/update App of Apps Helm Chart in Git repository
- **When:** Instance creation, updates, or manual regeneration requests
- **Rules:**
  - System is single source of truth (ignores existing Git content)
  - Overwrites any manual changes in target Git repository
  - Must generate valid Helm Chart with ArgoCD Applications for each Instance_Template
  - Each ArgoCD Application references external template repository with specific git_revision
  - ArgoCD Application destination uses cluster.server_url from instance's cluster relationship
  - ArgoCD Application sync policy configured from instance's sync policy fields (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled)
  - Values merging: Blueprint_Template.custom_values + Instance_Template.template_values
  - Namespace creation controlled by instance.create_namespace setting
- **Impact:**
  - Creates/updates Helm Chart files in Git repository with proper cluster destinations
  - Ready for manual ArgoCD Application creation by DevOps
  - Provides complete deployment specification with cluster targeting and sync policies

#### **COMPARE Instances**
- **What:** Compare configurations between multiple instances
- **When:** Analyzing deployment differences across environments/regions
- **Rules:**
  - Can compare instances of same blueprint only
  - Comparison focuses on Instance_Template configurations
  - Shows differences in git_revision, template_values, and target_namespace
  - Highlights configuration drift between environments
- **Impact:** Enables configuration standardization and drift detection

#### **DELETE Instance**
- **What:** Remove instance from system
- **When:** Decommissioning deployment
- **Rules:**
  - Does NOT automatically clean up Git repository content
  - Does NOT automatically remove ArgoCD Applications
  - Removes all associated Instance_Template records
  - Manual cleanup required in Git and ArgoCD
- **Impact:** 
  - Instance configuration no longer manageable via system
  - Git repository content remains for manual cleanup
  - ArgoCD Applications continue functioning until manually removed

---

## 🔄 Global Business Rules

### **Naming Convention**
- **Format:** Alphanumeric + hyphens only, start and end with letters
- **Examples:** "Brazil-Production-AKS", "Ecommerce-Platform", "PostgreSQL-DB"
- **Global Uniqueness:** Location, Environment, Application, Template, Cluster names

### **Referential Integrity**
- Entities cannot be deleted if referenced by other entities
- Foreign keys must reference valid entities
- Multi-step operations are atomic (all succeed or all fail)

### **Git Strategy**
- Database is single source of truth (not Git repository)
- System can regenerate Helm Charts from database on demand
- External template repositories are read-only references

---

## 🎯 MVP Priorities

**Core Operations:** Instance management, Blueprint configuration, Helm Chart generation
**Secondary:** Template/Blueprint lifecycle, Instance comparison, Sync policies
**Future:** Git monitoring, Batch operations, ArgoCD API integration

---

*This specification prioritizes business logic over technical implementation, ensuring clear understanding of system behavior and constraints.*