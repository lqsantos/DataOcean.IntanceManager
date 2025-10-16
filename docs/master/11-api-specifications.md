# 🔌 API Specifications - DataOcean Instance Manager

## 📋 Overview

This document defines backend API operations with focus on **business rules and validation logic**.

**Simple APIs:** Locations, Environments, Clusters, Applications - Basic CRUD with referential integrity
**Complex APIs:** Templates, Blueprints, Instances - Advanced business logic, Git integration, and deployment orchestration

---

## 🏗️ API Operations

### **1. Locations API**

#### **CREATE Location**
- **What:** Create geographical deployment region
- **Fields:**
  - `name` (required): Unique identifier for location (Brazil, EMEA, USA)
  - `description` (optional): Human-readable description
- **Rules:**
  - Name must be globally unique (varchar 100)
  - Name format: alphanumeric + hyphens, start/end with letter

#### **UPDATE Location**
- **What:** Modify location metadata
- **Fields:**
  - `description` (optional): Can be updated freely
- **Rules:**
  - Name cannot be changed after creation (stability)

#### **DELETE Location**
- **What:** Remove location if not in use
- **Rules:**
  - Cannot delete if referenced by clusters
  - Cannot delete if referenced by instances
  - Cascade protection via foreign key constraints

#### **LIST/GET Locations**
- **What:** Retrieve location data
- **Returns:** All location fields including usage counts

---

### **2. Environments API**

#### **CREATE Environment**
- **What:** Create deployment environment type
- **Fields:**
  - `name` (required): Unique identifier for environment (Development, Staging, Production)
  - `description` (optional): Human-readable description
- **Rules:**
  - Name must be globally unique (varchar 100)
  - Name format: alphanumeric + hyphens, start/end with letter

#### **UPDATE Environment**
- **What:** Modify environment metadata
- **Fields:**
  - `description` (optional): Can be updated freely
- **Rules:**
  - Name cannot be changed after creation (stability)

#### **DELETE Environment**
- **What:** Remove environment if not in use
- **Rules:**
  - Cannot delete if referenced by clusters
  - Cannot delete if referenced by instances
  - Cascade protection via foreign key constraints

#### **LIST/GET Environments**
- **What:** Retrieve environment data
- **Returns:** All environment fields including usage counts

---

### **3. Clusters API**

#### **CREATE Cluster**
- **What:** Create Kubernetes cluster as deployment target
- **Fields:**
  - `name` (required): Unique identifier for cluster
  - `description` (optional): Human-readable description
  - `server_url` (required): Kubernetes API server URL
  - `location_id` (required): Reference to location
  - `environment_id` (required): Primary environment served
- **Rules:**
  - Name must be globally unique (varchar 100)
  - Name format: alphanumeric + hyphens, start/end with letter
  - server_url must be valid URL format (varchar 500)
  - Unique combination of (server_url + location_id + environment_id)
  - Multiple clusters allowed per location/environment (HA scenarios)

#### **UPDATE Cluster**
- **What:** Modify cluster metadata and configuration
- **Fields:**
  - `description` (optional): Can be updated freely
  - `server_url` (restricted): Can be updated but must maintain uniqueness
- **Rules:**
  - Name, location_id, environment_id cannot be changed after creation
  - server_url changes must maintain unique constraint

#### **DELETE Cluster**
- **What:** Remove cluster if not in use
- **Rules:**
  - Cannot delete if referenced by instances
  - Cascade protection via foreign key constraints

#### **LIST/GET Clusters**
- **What:** Retrieve cluster data with relationships
- **Returns:** All cluster fields plus location/environment names and instance counts
- **Filters:** By location_id, environment_id

---

### **4. Applications API**

#### **CREATE Application**
- **What:** Create business application for deployment
- **Fields:**
  - `name` (required): Unique identifier for application
  - `description` (optional): Human-readable description
  - `repository_url` (optional): Git repository URL for application source code
- **Rules:**
  - Name must be globally unique (varchar 100)
  - Name format: alphanumeric + hyphens, start/end with letter
  - repository_url must be valid Git URL format if provided (varchar 500)

#### **UPDATE Application**
- **What:** Modify application metadata
- **Fields:**
  - `description` (optional): Can be updated freely
  - `repository_url` (optional): Can be updated freely
- **Rules:**
  - Name cannot be changed after creation (stability)

#### **DELETE Application**
- **What:** Remove application if not in use
- **Rules:**
  - Cannot delete if referenced by blueprints
  - Cascade protection via foreign key constraints
  - Check for any blueprint dependencies before deletion

#### **LIST/GET Applications**
- **What:** Retrieve application data with relationships
- **Returns:** All application fields plus blueprint counts and active instance counts
- **Filters:** By name pattern, repository domain

---

### **5. Templates API** *(Enhanced with Versioning)*

#### **CREATE Template**
- **What:** Create template metadata and import initial chart version from Git
- **Process:**
  1. Create Template record (metadata)
  2. Import chart data and create Template_Version
  3. Set Template.current_version_id → new Template_Version
- **Rules:**
  - Name must be globally unique
  - git_repository_url must be accessible
  - git_path must contain valid Helm Chart (Chart.yaml + values.yaml)
  - Creates both Template and Template_Version atomically

#### **UPDATE Template Metadata**
- **What:** Update template metadata (name, description, git repository info)
- **Rules:**
  - Name must remain globally unique
  - Can update description freely
  - git_repository_url/git_path changes allowed (no version impact)
  - No impact on existing Template_Versions or Blueprint_Templates

#### **SYNC Template (Create New Version)**
- **What:** Import new version from Git repository
- **Process:**
  1. Fetch Chart.yaml, values.yaml, values.schema.json from Git
  2. Create new Template_Version with imported data
  3. Update Template.current_version_id → new Template_Version
- **Rules:**
  - Always creates new Template_Version (preserves history)
  - Can be performed regardless of template usage
  - All existing Template_Versions preserved
  - Blueprint_Templates continue referencing their specific versions

#### **VALIDATE Template Access**
- **What:** Test Git repository accessibility and chart validity
- **Process:**
  1. Test Git repository access for Template.git_repository_url
  2. Verify Chart.yaml and values.yaml exist and are parseable
  3. Check for values.schema.json availability
  4. Return detailed validation report
- **Rules:**
  - Works with Template metadata (not specific version)
  - Read-only operation, no data changes
  - Provides diagnostics for repository issues

#### **VALIDATE Values Against Schema (Any Version)**
- **What:** Validate custom values against specific template version schema
- **Input:** template_id + git_commit_hash + custom_values
- **Process:**
  1. Find Template_Version by template_id + git_commit_hash
  2. Load that version's values_schema
  3. Validate custom_values against version-specific schema
- **Rules:**
  - Works for any stored Template_Version
  - If no schema exists for that version, validation passes
  - Returns version-specific validation results



#### **DELETE Template**
- **What:** Remove template and all versions
- **Rules:**
  - FORBIDDEN if any Template_Version is referenced by Blueprint_Templates
  - Must be completely unused across all blueprints
  - Cascades deletion of all Template_Versions

---

### **6. Blueprints API** *(Blueprint + Blueprint_Version Management)*

#### **CREATE Blueprint**
- **What:** Create blueprint metadata and initial version
- **Process:**
  1. Create Blueprint record (metadata)
  2. Create Blueprint_Version with helper_templates
  3. Set Blueprint.current_version_id → new Blueprint_Version
- **Rules:**
  - Name must be unique within application scope
  - Must belong to exactly one valid application
  - Creates both Blueprint and Blueprint_Version atomically
  - helper_templates must be valid Go template syntax

#### **CREATE Blueprint Version**
- **What:** Create new version of existing blueprint
- **When:** Updating helper_templates or template combinations
- **Process:**
  1. Create new Blueprint_Version with updated helper_templates
  2. Update Blueprint.current_version_id → new Blueprint_Version
  3. Copy Blueprint_Templates from previous version (optional base)
- **Rules:**
  - helper_templates changes trigger new version creation
  - Each Blueprint_Version is immutable after creation
  - Version numbers increment automatically (1, 2, 3...)
- **Impact:** New version available for instances; existing instances unchanged

#### **ADD Template to Blueprint Version**
- **What:** Associate specific template version with blueprint version
- **Input:** blueprint_version_id + template_version_id + alias + custom_values
- **Process:** Create Blueprint_Template record
- **Rules:**
  - template_version_id must reference existing Template_Version
  - Alias must be unique within blueprint version scope
  - Same Template can be added multiple times with different versions/aliases
  - custom_values define global blueprint configuration for this template
- **Impact:** Template version becomes part of blueprint; used by all future instances

#### **UPDATE Blueprint Template**
- **What:** Modify template configuration within blueprint version
- **When:** Adjusting template version, alias, or custom_values
- **Rules:**
  - Can change template_version_id (upgrade/downgrade template version)
  - Can update custom_values (global blueprint configuration)
  - Alias changes require no conflicts within blueprint version
  - Changes affect new instances only; existing instances unchanged
- **Impact:** Blueprint version updated with new template configuration



#### **DELETE Blueprint**
- **What:** Remove blueprint and all versions
- **Rules:**
  - FORBIDDEN if any instances exist using any blueprint version
  - Must have zero instances across all versions before deletion
  - Cascades deletion of all Blueprint_Versions and Blueprint_Templates

---

### **7. Instances API** *(Most Complex)*

#### **CREATE Instance**
- **What:** Create concrete deployment configuration for specific cluster target
- **Process:**
  1. Validate blueprint_version_id and cluster_id
  2. Auto-create Instance_Template for each Blueprint_Template in blueprint version
  3. Inherit template versions from Blueprint_Template.template_version_id
  4. Merge values: Template_Version.default_values + Blueprint_Template.custom_values
- **Rules:**
  - Name must be globally unique across system
  - blueprint_version_id must reference valid Blueprint_Version
  - cluster_id must exist and define valid location + environment combination
  - git_repository must be accessible for Helm Chart generation
  - ArgoCD sync policy fields have sensible defaults
- **Impact:** 
  - Creates Instance_Template records inheriting template versions from blueprint
  - Triggers Helm Chart generation with specific template versions
  - Enables ArgoCD deployment workflow with tested template combinations

#### **Instance_Template Auto-Creation Logic**
- **What:** Automatically create Instance_Template for each Blueprint_Template
- **Process:**
  1. For each Blueprint_Template in blueprint version
  2. Create Instance_Template with blueprint_template_id reference
  3. Inherit template version from Blueprint_Template.template_version_id
  4. Merge values: Template_Version.default_values + Blueprint_Template.custom_values
  5. Generate target_namespace from instance naming pattern
- **Rules:**
  - One Instance_Template per Blueprint_Template in blueprint version
  - Template versions inherited from blueprint (no instance choice)
  - instance_values are pre-merged ready for Helm Chart generation
- **Impact:** Complete deployment configuration with tested template combinations

#### **UPDATE Instance Metadata**
- **What:** Update instance settings (sync policies, Git settings)
- **Rules:**
  - Cannot change blueprint_version_id or cluster_id (structural changes)
  - Can update Git settings, sync policy fields, status
  - Git repository changes require validation of accessibility
- **Impact:** Triggers Helm Chart regeneration with updated settings

#### **UPGRADE Instance Blueprint Version**
- **What:** Change instance to use different blueprint version (template upgrade)
- **Process:**
  1. Validate new blueprint_version_id belongs to same Blueprint
  2. Regenerate all Instance_Templates for new blueprint version
  3. Inherit new template versions from new Blueprint_Templates
  4. Preserve instance-specific overrides where possible
- **Rules:**
  - Must be same Blueprint (different version)
  - All Instance_Templates regenerated with new template versions
  - Instance-specific values preserved where compatible
- **Impact:** Instance upgrades to new template versions defined in blueprint

#### **UPDATE Instance_Template Values**
- **What:** Override specific template values for this instance
- **When:** Instance-specific customization beyond blueprint defaults
- **Rules:**
  - instance_values merge: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  - Cannot change template version (controlled by blueprint)
  - target_namespace changes must follow naming conventions
- **Impact:** Instance-specific customization while maintaining template version governance

#### **GET Instance Details**
- **What:** Retrieve complete instance configuration with template versions
- **Response:** Instance with nested Instance_Templates showing inherited template versions
- **Data Flow:**
  - Instance → Blueprint_Version → Blueprint_Templates → Template_Versions
  - Show final merged values: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  - Include template version information (commit hashes, chart metadata)
- **Usage:** Primary API for deployment configuration review

#### **LIST Instances**
- **What:** Retrieve instances with basic filtering
- **Response:** Instance list with essential metadata (name, blueprint, cluster, status)
- **Filters:** 
  - By cluster_id (infrastructure management)
  - By blueprint_id (blueprint usage tracking)
  - By application_id (application-focused view)
- **Usage:** Primary dashboard and operational views

#### **GENERATE Helm Chart**
- **What:** Create/update App of Apps Helm Chart in Git repository using template versions
- **Process:**
  1. For each Instance_Template, resolve template version via Blueprint_Template relationship
  2. Use Template_Version.git_repository and Template_Version.git_revision for ArgoCD source
  3. Merge values: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  4. Generate ArgoCD Applications with specific template version references
- **Rules:**
  - System is single source of truth (overwrites existing Git content)
  - Each ArgoCD Application references Template_Version.git_repository with Template_Version.git_revision
  - ArgoCD Application destination uses cluster.server_url from instance's cluster relationship
  - Sync policy from instance settings (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled)
  - Values merging uses 3-level hierarchy with template version as base
  - Namespace creation controlled by instance.create_namespace setting
- **Impact:**
  - Creates Helm Chart with specific template versions (commit-based isolation)
  - Ready for ArgoCD deployment with tested template combinations
  - Provides complete deployment specification with version governance



#### **DELETE Instance**
- **What:** Remove instance and cascade delete Instance_Templates
- **Process:**
  1. Verify no blocking dependencies
  2. Cascade delete all Instance_Template records  
  3. Clean up ArgoCD Applications (optional integration)
  4. Remove generated Helm Charts from Git repository (optional)
- **Rules:**
  - Removes all associated Instance_Template records
  - Optional cleanup of external resources (ArgoCD, Git)
  - Cannot delete if referenced by other entities
- **Impact:** Complete instance removal with configurable infrastructure cleanup

---

## 🔄 Global Business Rules

### **Auto-Generated Fields**
- **CREATE Operations:** All entities auto-generate `id` (BIGSERIAL), `created_at`, `updated_at` timestamps
- **UPDATE Operations:** All entities auto-update `updated_at` timestamp on any field modification

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

### **✅ Phase 1 (MVP Core)**
- **Basic CRUD:** Locations, Environments, Clusters, Applications (with simple LIST operations)
- **Template Management:** CREATE, UPDATE metadata, SYNC versions, VALIDATE access
- **Blueprint Management:** CREATE, CREATE version, ADD/UPDATE templates
- **Instance Management:** CREATE, UPDATE metadata/values, UPGRADE blueprint, GET details, LIST with filters
- **Helm Chart Generation:** GENERATE chart operation

### **🔄 Phase 2 (Enhanced Operations)**
- **Advanced Queries:** Template history, Blueprint version comparison
- **Instance Operations:** Detailed template debugging, advanced filtering
- **Monitoring Integration:** Deployment status, ArgoCD sync status

### **🚀 Phase 3 (Advanced Features)**
- **Comparison Tools:** Instance comparison, template version diffs
- **Automation:** Batch operations, automated upgrades
- **External Integration:** Git monitoring, ArgoCD API, CI/CD pipelines

---

*This specification prioritizes business logic over technical implementation, ensuring clear understanding of system behavior and constraints.*