# 🔌 API Specifications - DataOcean Instance Manager

## 📋 Overview

This document defines backend API operations with focus on **business rules and validation logic**.

**Simple APIs:** Locations, Environments, Clusters, Applications - Basic CRUD with referential integrity
**Complex APIs:** Templates, Blueprints, Instances - Advanced business logic, Git integration, and deployment orchestration

## 🔐 Identifier Strategy

**Configuration APIs (Name-based URLs):**
- `/locations/{name}`, `/environments/{name}`, `/clusters/{name}`, `/applications/{name}`
- Low volume, user-friendly identifiers, non-sensitive data

**Operational APIs (UUID-based URLs):**  
- `/templates/{uuid}`, `/blueprints/{uuid}`, `/instances/{uuid}`
- High volume, security-sensitive, prevent enumeration attacks

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
- **URL:** `DELETE /locations/{name}`
- **Rules:**
  - Cannot delete if referenced by instances
  - Cascade protection via foreign key constraints

#### **LIST/GET Locations**
- **What:** Retrieve location data
- **URLs:** `GET /locations` (list), `GET /locations/{name}` (single)
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
- **What:** Register Kubernetes cluster as deployment target
- **URL:** `POST /clusters`
- **Fields:**
  - `name` (required): Unique identifier for cluster
  - `description` (optional): Human-readable description
  - `server_url` (required): Kubernetes API server URL (must be globally unique)
- **Rules:**
  - Name must be globally unique (varchar 100)
  - Name format: alphanumeric + hyphens, start/end with letter
  - server_url must be valid URL format and globally unique (varchar 500)
  - Clusters are completely independent - no location or environment association

#### **UPDATE Cluster**
- **What:** Modify cluster metadata and configuration
- **URL:** `PUT /clusters/{name}`
- **Fields:**
  - `description` (optional): Can be updated freely
  - `server_url` (restricted): Can be updated but must maintain global uniqueness
- **Rules:**
  - Name cannot be changed after creation (stability)
  - server_url changes must maintain unique constraint across all clusters

#### **DELETE Cluster**
- **What:** Remove cluster if not in use
- **URL:** `DELETE /clusters/{name}`
- **Rules:**
  - Cannot delete if referenced by instances
  - Cascade protection via foreign key constraints

#### **LIST/GET Clusters**
- **What:** Retrieve cluster data
- **URLs:**
  - GET `/clusters` - List all clusters
  - GET `/clusters/{name}` - Get specific cluster (using name)
- **Returns:** All cluster fields and instance counts
- **Filters:** By name pattern, server_url pattern

---

### **4. Applications API**

#### **CREATE Application**
- **What:** Create business application for deployment
- **URL:** `POST /applications`
- **Fields:**
  - `name` (required): Unique identifier for application
  - `description` (optional): Human-readable description
- **Rules:**
  - Name must be globally unique (varchar 100)
  - Name format: alphanumeric + hyphens, start/end with letter

#### **UPDATE Application**
- **What:** Modify application metadata
- **URL:** `PUT /applications/{name}`
- **Fields:**
  - `description` (optional): Can be updated freely
- **Rules:**
  - Name cannot be changed after creation (stability)

#### **DELETE Application**
- **What:** Remove application if not in use
- **URL:** `DELETE /applications/{name}`
- **Rules:**
  - Cannot delete if referenced by blueprints
  - Cascade protection via foreign key constraints
  - Check for any blueprint dependencies before deletion

#### **LIST/GET Applications**
- **What:** Retrieve application data with relationships
- **URLs:**
  - GET `/applications` - List all applications
  - GET `/applications/{name}` - Get specific application (using name)
- **Returns:** All application fields plus blueprint counts and active instance counts
- **Filters:** By name pattern

---

### **5. Repositories API** *(New)*

#### **CREATE Repository**
- **What:** Register an Azure DevOps repository for template management
- **URL:** `POST /repositories`
- **Fields:**
  - `description` (optional): Human-readable description
  - `azure_devops_org` (required): Azure DevOps organization name
  - `azure_devops_project` (required): Project name within organization
  - `repository_name` (required): Repository name within project (serves as identifier)
- **Rules:**
  - Combination of org+project+repository_name must be globally unique
  - repository_name serves as the natural identifier for the repository
  - Repository accessibility is validated using Azure Managed Identity
  - System constructs git_url as: `https://dev.azure.com/{org}/{project}/_git/{repository_name}`
- **Returns:** Repository object with generated ID

#### **LIST/GET Repositories**
- **What:** Retrieve repository information
- **URLs:**
  - GET `/repositories` - List all repositories
  - GET `/repositories/{repository_name}` - Get specific repository (using name)

#### **UPDATE Repository**
- **What:** Update repository description and Azure DevOps information
- **Rules:**
  - Azure DevOps parameters can be updated (with uniqueness validation)
  - repository_name changes effectively point to a different repository
  - Changes don't affect existing branches or template versions
  - Updates affect future operations only

#### **DELETE Repository**
- **What:** Remove repository and all associated data
- **Rules:**
  - FORBIDDEN if any template versions are referenced by blueprints
  - Cascades deletion of all branches, templates, and template versions

#### **LIST/GET Repositories**
- **What:** Retrieve repository information
- **Returns:** Repository data with constructed git_url, repository_name as identifier, branch counts and template summaries

---

### **6. Branches API** *(New)*

#### **CREATE Branch**
- **What:** Add a branch to be tracked within a repository
- **URL:** `POST /repositories/{repository_name}/branches`
- **Fields:**
  - `repository_name` (required): Target repository (repository_name)
  - `name` (required): Branch name (main, develop, release/v1.0)
- **Rules:**
  - Branch name must be unique within repository
  - Repository must exist and be accessible
  - Branch existence is validated against Azure DevOps repository
  - System populates branch automatically based on user selection
- **Returns:** Branch object with generated ID

#### **LIST/GET Branches**
- **What:** Retrieve branch information within repository
- **URLs:**
  - GET `/repositories/{repository_name}/branches` - List branches in repository
  - GET `/repositories/{repository_name}/branches/{branch_name}` - Get specific branch

#### **UPDATE Branch**
- **What:** Update branch name within repository
- **URL:** `PUT /repositories/{repository_name}/branches/{branch_name}`
- **Rules:**
  - Name can be updated (with repository uniqueness validation)
  - Changes don't affect existing template versions

#### **DELETE Branch**
- **What:** Remove branch tracking
- **URL:** `DELETE /repositories/{repository_name}/branches/{branch_name}`
- **Rules:**
  - FORBIDDEN if any template versions from this branch are referenced by blueprints
  - If deletion proceeds (no active references), cascades deletion of all template versions from this branch
  - All template versions from this branch become permanently unavailable

#### **LIST/GET Branches**
- **What:** Retrieve branch information for repository
- **Filters:** repository_name (repository_name)
- **Returns:** Branch data with template version counts

---

### **7. Templates API** *(Enhanced with Repository Structure)*

#### **CREATE Template**
- **What:** Create template metadata within a repository
- **URL:** `POST /templates`
- **Fields:**
  - `name` (required): Unique template identifier
  - `description` (optional): Human-readable description
  - `repository_name` (required): Target repository (repository_name)
  - `git_path` (required): Path to Helm Chart within repository
- **Rules:**
  - Name must be globally unique across all templates
  - Repository must exist and be accessible
  - git_path must be unique within repository
  - Path validation ensures Helm Chart structure exists
- **Process:**
  1. Create Template record (metadata only)
  2. No automatic version import - user controls when to import
- **Returns:** Template object with generated UUID

#### **UPDATE Template Metadata**
- **What:** Update template metadata and repository path
- **URL:** `PUT /templates/{public_id}` (using UUID)
- **Rules:**
  - Name must remain globally unique
  - Can update description freely
  - repository_name and git_path changes allowed (affects future imports only)
  - No impact on existing Template_Versions

#### **SYNC Template Version**
- **What:** Synchronize template with Git repository using smart versioning (always uses branch HEAD)
- **URL:** `POST /templates/{public_id}/sync` (using UUID)
- **Fields:**
  - `branch_name` (required): Source branch name to sync from HEAD
- **Process:**
  1. Validate branch belongs to template's repository
  2. Get latest commit from branch HEAD
  3. Find latest Template_Version for this template+branch combination
  4. **Smart Versioning Logic:**
     - **If no previous version exists:** Create new Template_Version with chart data from HEAD
     - **If previous version exists:**
       a. Compare `previous_commit_hash` vs `HEAD_commit_hash` in template's `git_path`
       b. **Changes detected in chart path:**
          - Fetch updated Chart.yaml, values.yaml, values.schema.json from HEAD
          - Create NEW Template_Version with updated chart data
       c. **No changes in chart path:**
          - UPDATE existing Template_Version `git_commit_hash` to HEAD commit
          - Preserve all chart data (no new version created)
  5. Update Template.current_version_id if new version was created
- **Change Detection:**
  - Use Git diff to compare commits within template's `git_path` directory
  - Relevant files: `Chart.yaml`, `values.yaml`, `values.schema.json`, `templates/**/*`
  - Any file change within chart path triggers new version creation
  - Changes outside chart path only update commit tracking
- **Rules:**
  - Branch must belong to template's repository
  - Always uses latest commit from branch HEAD
  - Same template can have versions from multiple branches
  - Smart versioning prevents unnecessary version proliferation
- **Response Types:**
  - **"version-created"**: New Template_Version created (chart files changed in HEAD)
  - **"commit-updated"**: Existing version updated with HEAD commit (no chart changes)
  - **"up-to-date"**: HEAD commit already tracked
- **Use Cases:**
  - **Development sync:** `branch_name: "develop"` → always uses develop HEAD
  - **Release sync:** `branch_name: "release/v2.0"` → always uses release branch HEAD
  - **Documentation updates:** Chart unchanged in HEAD → commit updated, no new version
  - **Specific commit needs:** Use Git workflow (checkout/tag + sync) for non-HEAD commits
- **Impact:** Simplified, predictable template synchronization always using latest branch state while avoiding version pollution from non-chart changes

#### **VALIDATE Template Access**
- **What:** Test repository accessibility and chart validity
- **Process:**
  1. Test repository access for template's repository
  2. Verify Chart.yaml and values.yaml exist at git_path
  3. Check across all tracked branches
  4. Return detailed validation report per branch
- **Rules:**
  - Read-only operation, no data changes
  - Provides diagnostics per branch

#### **VALIDATE Values Against Schema**
- **What:** Validate custom values against specific template version
- **Input:** template_version_id + custom_values
- **Process:**
  1. Load Template_Version by ID
  2. Use that version's values_schema for validation
  3. Validate custom_values against schema
- **Rules:**
  - Works for any stored Template_Version
  - Version-specific validation (branch+commit context)
  - If no schema exists, validation passes

#### **DELETE Template**
- **What:** Remove template and all versions
- **URL:** `DELETE /templates/{public_id}` (using UUID)
- **Rules:**
  - FORBIDDEN if any Template_Version is referenced by Blueprint_Templates
  - Must be completely unused across all blueprints
  - Cascades deletion of all Template_Versions from all branches

#### **LIST/GET Templates**
- **What:** Retrieve template information
- **URLs:**
  - GET `/templates` - List all templates
  - GET `/templates/{public_id}` - Get specific template (using UUID)
- **Filters:** repository_name, branch_name (for versions)
- **Returns:** Template metadata with version summaries per branch

---

### **8. Blueprints API** *(Blueprint + Blueprint_Version Management)*

#### **CREATE Blueprint**
- **What:** Create blueprint metadata and initial version
- **URL:** `POST /blueprints`
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
- **URL:** `POST /blueprints/{public_id}/versions` (using UUID)
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
- **URL:** `POST /blueprints/{public_id}/versions/{version_id}/templates`
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
- **URL:** `PUT /blueprints/{public_id}/versions/{version_id}/templates/{template_alias}`
- **When:** Adjusting template version, alias, or custom_values
- **Rules:**
  - Can change template_version_id (upgrade/downgrade template version)
  - Can update custom_values (global blueprint configuration)
  - Alias changes require no conflicts within blueprint version
  - Changes affect new instances only; existing instances unchanged
- **Impact:** Blueprint version updated with new template configuration



#### **LIST/GET Blueprints**
- **What:** Retrieve blueprint information
- **URLs:**
  - GET `/blueprints` - List all blueprints
  - GET `/blueprints/{public_id}` - Get specific blueprint (using UUID)
- **Returns:** Blueprint metadata with version information

#### **DELETE Blueprint**
- **What:** Remove blueprint and all versions
- **URL:** `DELETE /blueprints/{public_id}` (using UUID)
- **Rules:**
  - FORBIDDEN if any instances exist using any blueprint version
  - Must have zero instances across all versions before deletion
  - Cascades deletion of all Blueprint_Versions and Blueprint_Templates

---

### **9. Instances API** *(Most Complex)*

#### **CREATE Instance**
- **What:** Create concrete deployment configuration for specific cluster target
- **URL:** `POST /instances`
- **Fields:**
  - `name` (required): Unique instance identifier
  - `blueprint_version_id` (required): Reference to blueprint version
  - `cluster_name` (required): Target cluster name (independent selection)
  - `location_name` (required): Geographic location name for Helm chart generation
  - `environment_name` (required): Environment name for Helm chart generation
  - `git_repository`, `git_path`, `git_branch` (required): Git repository configuration
  - Sync policy fields: `auto_sync_enabled`, `auto_prune_enabled`, etc.
- **Process:**
  1. Validate blueprint_version_id, cluster_name, location_name, environment_name
  2. Auto-create Instance_Template for each Blueprint_Template in blueprint version
  3. Inherit template versions from Blueprint_Template.template_version_id
  4. Merge values: Template_Version.default_values + Blueprint_Template.custom_values
- **Rules:**
  - Name must be globally unique across system
  - blueprint_version_id must reference valid Blueprint_Version
  - cluster_name must exist (clusters are independent of location/environment)
  - location_name and environment_name used for Helm chart generation context
  - git_repository must be accessible for Helm Chart generation
  - ArgoCD sync policy fields have sensible defaults
- **Impact:** 
  - Creates Instance_Template records inheriting template versions from blueprint
  - Triggers Helm Chart generation with location/environment context
  - Enables ArgoCD deployment workflow with tested template combinations

#### **Instance_Template Auto-Creation Logic**
- **What:** Automatically create Instance_Template for each Blueprint_Template
- **Process:**
  1. For each Blueprint_Template in blueprint version
  2. Create Instance_Template with blueprint_template_id reference (internal relationship)
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
- **URL:** `PUT /instances/{public_id}` (using UUID)
- **Rules:**
  - Cannot change blueprint_version_id or cluster_name (structural changes)
  - Can update Git settings, sync policy fields, status
  - Git repository changes require validation of accessibility
- **Impact:** Triggers Helm Chart regeneration with updated settings

#### **UPGRADE Instance Blueprint Version**
- **What:** Change instance to use different blueprint version (template upgrade)
- **URL:** `PATCH /instances/{public_id}/blueprint-version` (using UUID)
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
- **URL:** `PATCH /instances/{public_id}/templates/{template_alias}` (using UUID for instance)
- **When:** Instance-specific customization beyond blueprint defaults
- **Rules:**
  - instance_values merge: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  - Cannot change template version (controlled by blueprint)
  - target_namespace changes must follow naming conventions
- **Impact:** Instance-specific customization while maintaining template version governance

#### **LIST/GET Instances**
- **What:** Retrieve instance information
- **URLs:**
  - GET `/instances` - List instances with filtering
  - GET `/instances/{public_id}` - Get specific instance details (using UUID)
- **List Response:** Instance list with essential metadata (name, blueprint, cluster, status)
- **Detail Response:** Complete instance configuration with nested Instance_Templates showing inherited template versions
- **List Filters:** 
  - By cluster_name (infrastructure management)
  - By blueprint_public_id (blueprint usage tracking)
  - By application_name (application-focused view)
- **Detail Data Flow:**
  - Instance → Blueprint_Version → Blueprint_Templates → Template_Versions
  - Show final merged values: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  - Include template version information (commit hashes, chart metadata)
- **Usage:** Primary API for deployment configuration review and management
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
- **URL:** `DELETE /instances/{public_id}` (using UUID)
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