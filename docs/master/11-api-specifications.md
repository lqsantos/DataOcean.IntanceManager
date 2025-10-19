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

#### **SYNC Repository**
- **What:** Synchronize ALL templates in repository with Git remote state and auto-disable orphaned template versions
- **URL:** `POST /repositories/{repository_name}/sync`
- **Scope:** Affects all templates and branches tracked within this repository
- **Process:**
  1. Get list of branches currently tracked in database for this repository
  2. For each tracked branch, fetch latest state from Git remote
  3. **For tracked branches that still exist in Git:**
     - Synchronize all templates using this branch (equivalent to SYNC Template for each)
     - Update template versions with latest commits using smart versioning
  4. **For tracked branches deleted from Git:**
     - Mark all template versions from deleted branches as `disabled: true`
     - Update branch status to `deleted: true` (soft delete for audit)
     - Log orphaned template versions for reporting
- **Response:**
  - `branches_synchronized`: List of tracked branches successfully synchronized
  - `branches_deleted`: List of tracked branches no longer available in Git
  - `template_versions_created`: Count of new template versions created
  - `template_versions_updated`: Count of existing template versions updated
  - `template_versions_disabled`: Count of disabled template versions (from deleted branches)
  - `affected_instances`: List of instance IDs using disabled template versions
- **Rules:**
  - Only synchronizes branches already tracked in the system (no auto-discovery)
  - New branches must be explicitly added via CREATE Branch API
  - Disabled template versions cannot be used for new instances
  - Existing instances retain their configuration but show "source unavailable" status
  - Manual re-enable possible if branch is restored in Git
- **Use Cases:**
  - **Repository-wide synchronization:** Update all tracked templates and branches at once
  - **Bulk template updates:** Sync multiple templates efficiently after repository changes
  - **Maintenance:** Periodic sync of all tracked branches to detect deletions
  - **Incident response:** When ArgoCD reports missing branch references
  - **DevOps workflows:** Pre-deployment validation of all tracked repository state
  - **Controlled scope:** Only affects explicitly tracked branches (no surprise additions)

#### **LIST/GET Repositories**
- **What:** Retrieve repository information
- **Returns:** Repository data with constructed git_url, repository_name as identifier, branch counts and template summaries

> **📋 Usage Guidelines:** For detailed guidance on when to use SYNC Repository vs SYNC Template, see business-workflow documentation.

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
- **What:** Remove branch tracking (manual cleanup)
- **URL:** `DELETE /repositories/{repository_name}/branches/{branch_name}`
- **Rules:**
  - FORBIDDEN if any active instances reference template versions from this branch
  - If deletion proceeds, marks all template versions as `disabled: true`
  - Branch marked as `deleted: true` (soft delete for audit)
  - Disabled template versions cannot be used for new instances/blueprints
- **Impact:**
  - Existing instances show "source unavailable" status but continue running
  - New deployments cannot use disabled template versions
  - Full cleanup requires instance migration first

#### **LIST/GET Branches**
- **What:** Retrieve branch information for repository
- **Filters:** repository_name (repository_name)
- **Returns:** Branch data with template version counts and availability status

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
- **What:** Synchronize SINGLE template with specific branch using smart versioning (always uses branch HEAD)
- **URL:** `POST /templates/{public_id}/sync` (using UUID)
- **Scope:** Affects only the specified template and branch combination
- **Fields:**
  - `branch_name` (required): Source branch name to sync from HEAD
- **Process:**
  1. **Branch Validation:**
     - Check if branch exists in template's repository (Git remote)
     - **If branch not found:**
       a. Mark branch as `deleted: true, deleted_at: now()`
       b. Disable all template versions from this branch (`disabled: true, disabled_reason: 'branch_deleted'`)
       c. Return protective response with affected data summary
     - **If branch exists:** Continue with synchronization
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
  - **"branch-deleted-protective"**: Branch no longer exists, template versions auto-disabled for protection
- **Use Cases:**
  - **Active development:** Developer updates specific template after code changes
  - **Targeted sync:** `branch_name: "develop"` → sync only this template from develop HEAD
  - **Granular control:** Update individual templates without affecting others
  - **Performance-focused:** Fast sync of single template vs entire repository
  - **Branch-specific work:** `branch_name: "release/v2.0"` → sync specific release branch
  - **Documentation updates:** Chart unchanged in HEAD → commit updated, no new version
  - **Branch cleanup detection:** Missing branch → auto-disable versions + protective response
- **Protective Action Response:**
  - **HTTP 200** with protective action taken (not an error - system self-healed)
  - **Protective Response:**
    ```json
    {
      "status": "branch-deleted-protective",
      "message": "Branch 'feature/deleted-branch' no longer exists - protective action taken",
      "repository": "my-charts",
      "branch_name": "feature/deleted-branch",
      "actions_taken": {
        "branch_marked_deleted": true,
        "template_versions_disabled": 2,
        "affected_instances": ["uuid1", "uuid2"]
      },
      "next_steps": [
        "Review affected instances: GET /instances?source_availability=unavailable",
        "Migrate instances to available template versions",
        "Use existing branches for future synchronization"
      ],
      "available_branches": ["main", "develop", "release/v1.0"]
    }
    ```
- **Impact:** Self-healing system that automatically protects against broken references while maintaining operational transparency and user guidance

#### **VALIDATE Values Against Schema**
- **What:** Validate custom values against specific template version from branch
- **URL:** `POST /templates/{public_id}/branches/{branch_name}/validate-values`
- **Fields:**
  - `branch_name` (required): Source branch name to validate against
  - `custom_values` (required): Values object to validate
- **Process:**
  1. Load latest Template_Version for template + branch combination
  2. Use that version's values_schema for validation
  3. Validate custom_values against schema
- **Rules:**
  - Uses current HEAD version from specified branch
  - Branch must exist and have synchronized template versions
  - If no schema exists in latest version, validation passes
  - Template must exist with accessible branch

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
- **What:** Create blueprint metadata only (no versions)
- **URL:** `POST /blueprints`
- **Fields:**
  - `name` (required): Unique blueprint identifier within application scope
  - `description` (optional): Human-readable description
  - `application_name` (required): Target application name
- **Process:**
  1. Create Blueprint record (metadata only)
  2. Set Blueprint.current_version_id = null (no versions yet)
- **Rules:**
  - Name must be unique within application scope
  - Must belong to exactly one valid application
  - Creates Blueprint entity only - versions created separately
- **Returns:** Blueprint object with generated UUID
- **State:** Blueprint exists but unusable until first version is created

#### **CREATE Blueprint Version**
- **What:** Create new version of existing blueprint in DRAFT state (first or subsequent)
- **URL:** `POST /blueprints/{public_id}/versions` (using UUID)
- **Fields:**
  - `helper_templates` (required): Go template syntax for Helm value generation
  - `description` (optional): Version description
- **Process:**
  1. Create new Blueprint_Version with status = 'draft'
  2. Increment version number automatically (1, 2, 3...)
  3. Blueprint.current_version_id remains unchanged (still points to last published)
- **Rules:**
  - Blueprint must exist (created via CREATE Blueprint)
  - helper_templates must be valid Go template syntax
  - Version created in 'draft' state - not usable by instances yet
  - Only one draft version per blueprint allowed at a time
- **Impact:** Draft version created for editing - blueprint remains at previous published state until new version is published

#### **ADD Template to Blueprint Version**
- **What:** Associate specific template version with blueprint version (only draft versions)
- **URL:** `POST /blueprints/{public_id}/versions/{version_number}/templates`
- **Fields:**
  - `template_public_id` (required): Public UUID of the template to add
  - `branch_name` (required): Branch name to use for template version
  - `alias` (required): Unique identifier for template within blueprint version
  - `custom_values` (optional): Global blueprint configuration for this template
- **Process:**
  1. Resolve latest Template_Version for template_public_id + branch_name
  2. Create Blueprint_Template record with resolved template_version_id
- **Rules:**
  - Blueprint version must be in 'draft' state (FORBIDDEN if published)
  - template_public_id must reference existing Template with accessible branch
  - Branch must have synchronized template versions available
  - Alias must be unique within blueprint version scope
  - Same Template can be added multiple times with different branches/aliases
  - Uses HEAD version from specified branch at time of addition
- **Impact:** Template version becomes part of draft blueprint version

#### **UPDATE Blueprint Template**
- **What:** Modify template configuration within blueprint version (only draft versions)
- **URL:** `PUT /blueprints/{public_id}/versions/{version_number}/templates/{template_alias}`
- **Fields:**
  - `template_public_id` (optional): Change to different template
  - `branch_name` (optional): Change to different branch version
  - `alias` (optional): Change template alias (must remain unique)
  - `custom_values` (optional): Update global blueprint configuration
- **Rules:**
  - Blueprint version must be in 'draft' state (FORBIDDEN if published)
  - Can change template_public_id + branch_name (template/version upgrade)
  - Uses HEAD version from specified branch at time of update
  - Can update custom_values (global blueprint configuration)
  - Alias changes require no conflicts within blueprint version
- **Impact:** Draft blueprint version updated with new template configuration

#### **PUBLISH Blueprint Version**
- **What:** Finalize draft version and make it available for instances
- **URL:** `POST /blueprints/{public_id}/versions/{version_number}/publish` (using UUID)
- **Process:**
  1. Validate blueprint version is in 'draft' state
  2. Validate at least one template is configured in blueprint version
  3. Change status from 'draft' to 'published'
  4. Set published_at = now()
  5. Update Blueprint.current_version_id → this version
- **Rules:**
  - Blueprint version must be in 'draft' state
  - Must have at least one Blueprint_Template configured
  - After publishing, version becomes immutable (no ADD/UPDATE allowed)
  - Published version becomes available for instance creation
- **Response:**
  - `version_id`: Published version identifier
  - `version_number`: Version number (1, 2, 3...)
  - `templates_count`: Number of templates in published version
- **Impact:** Blueprint version becomes available for instances; version is now immutable

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
  - FORBIDDEN if any instances exist using any published blueprint version
  - Draft versions can be deleted freely (no instance impact)
  - Must have zero instances across all published versions before deletion
  - Cascades deletion of all Blueprint_Versions and Blueprint_Templates

---

### **9. Instances API** *(Most Complex)*

#### **CREATE Instance**
- **What:** Create concrete deployment configuration for specific cluster target
- **URL:** `POST /instances`
- **Fields:**
  - `name` (required): Unique instance identifier
  - `blueprint_public_id` (required): Public UUID of the blueprint
  - `version_number` (required): Blueprint version number to use
  - `cluster_name` (required): Target cluster name (independent selection)
  - `location_name` (required): Geographic location name for path generation
  - `environment_name` (required): Environment name for path generation
  - `namespace` (required): Target Kubernetes namespace for deployment
  - Sync policy fields: `auto_sync_enabled`, `auto_prune_enabled`, `auto_heal_enabled`, etc.
- **Process:**
  1. Resolve Blueprint_Version using blueprint_public_id + version_number
  2. Extract application_name from Blueprint.application_name for path generation
  3. Validate cluster_name, location_name, environment_name, namespace
  4. Auto-create Instance_Template for each Blueprint_Template in blueprint version
  5. Inherit template versions from Blueprint_Template.template_version_id
  6. Merge values: Template_Version.default_values + Blueprint_Template.custom_values
  7. Generate Helm charts path: `{environment_name}/{location_name}/{application_name}/{instance_name}/`
- **Rules:**
  - Name must be globally unique across system
  - blueprint_public_id + version_number must reference valid published Blueprint_Version
  - Draft blueprint versions cannot be used for instance creation
  - cluster_name must exist (clusters are independent of location/environment)
  - location_name and environment_name must exist for path generation
  - namespace follows Kubernetes naming conventions (max 63 chars)
  - Uses system-wide helm_charts_repository and helm_charts_branch configuration
  - ArgoCD sync policy defaults: auto_sync_enabled=true, auto_prune_enabled=false, auto_heal_enabled=true
- **Impact:** 
  - Creates Instance_Template records inheriting template versions from blueprint
  - Generates structured path: `{environment}/{location}/{application}/{instance}/`
  - Enables centralized Helm Chart generation in configured repository
  - Creates ArgoCD App of Apps structure with tested template combinations

#### **Instance_Template Auto-Creation Logic**
- **What:** Automatically create Instance_Template for each Blueprint_Template
- **Process:**
  1. For each Blueprint_Template in blueprint version
  2. Create Instance_Template with blueprint_template_id reference (internal relationship)
  3. Inherit template version from Blueprint_Template.template_version_id
  4. Merge values: Template_Version.default_values + Blueprint_Template.custom_values
  5. Namespace inherited from instance.namespace (centralized)
- **Rules:**
  - One Instance_Template per Blueprint_Template in blueprint version
  - Template versions inherited from blueprint (no instance choice)
  - instance_values are pre-merged ready for Helm Chart generation
  - All templates in instance deploy to same namespace (instance.namespace)
- **Impact:** Complete deployment configuration with tested template combinations

#### **UPDATE Instance Metadata**
- **What:** Update instance settings (namespace, sync policies)
- **URL:** `PUT /instances/{public_id}` (using UUID)
- **Rules:**
  - Cannot change blueprint or cluster assignments (use UPGRADE operation)
  - Can update namespace (following Kubernetes naming conventions)
  - Can update sync policy fields (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled)
  - Cannot change location/environment (affects path generation - requires new instance)
- **Impact:** Triggers Helm Chart regeneration with updated settings

#### **UPGRADE Instance Blueprint Version**
- **What:** Change instance to use different blueprint version (template upgrade)
- **URL:** `PATCH /instances/{public_id}/blueprint-version` (using UUID)
- **Fields:**
  - `version_number` (required): New blueprint version number to upgrade to
- **Process:**
  1. Validate new version_number belongs to same Blueprint and is published
  2. Regenerate all Instance_Templates for new blueprint version
  3. Inherit new template versions from new Blueprint_Templates
  4. Preserve instance-specific overrides where possible
- **Rules:**
  - Must be same Blueprint (different published version)
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
  - Namespace changes must be done at instance level (affects all templates)
- **Impact:** Instance-specific customization while maintaining template version governance

#### **LIST/GET Instances**
- **What:** Retrieve instance information
- **URLs:**
  - GET `/instances` - List instances with filtering
  - GET `/instances/{public_id}` - Get specific instance details (using UUID)
- **List Response:** Instance list with essential metadata (name, blueprint, cluster, status)
- **Detail Response:** Complete instance configuration with nested Instance_Templates showing inherited template versions and source availability status
- **List Filters:** 
  - By cluster_name (infrastructure management)
  - By blueprint_public_id (blueprint usage tracking)
  - By application_name (application-focused view)
  - By source_availability (available, unavailable) - filters instances using disabled template versions
- **Detail Data Flow:**
  - Instance → Blueprint_Version → Blueprint_Templates → Template_Versions
  - Show final merged values: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  - Include template version information (commit hashes, chart metadata)
- **Usage:** Primary API for deployment configuration review and management
- **Usage:** Primary dashboard and operational views

#### **GENERATE Helm Chart**
- **What:** Create/update App of Apps Helm Chart in centralized Git repository using structured path
- **Target Path:** `{environment_name}/{location_name}/{application_name}/{instance_name}/`
- **Process:**
  1. Extract application_name from Blueprint.application_name relationship
  2. For each Instance_Template, resolve template version via Blueprint_Template relationship
  3. Use Template_Version.git_repository and Template_Version.git_revision for ArgoCD source
  4. Merge values: Template_Version.default_values + Blueprint_Template.custom_values + Instance overrides
  5. Generate ArgoCD App of Apps structure in centralized helm_charts_repository
  6. Create ArgoCD Applications with specific template version references
- **Generated Structure:**
  ```
  {helm_charts_repository}/{helm_charts_branch}/
  └── {environment}/{location}/{application}/{instance}/
      ├── Chart.yaml              # App of Apps metadata
      ├── values.yaml             # Merged configuration values
      └── templates/
          ├── app-database.yaml   # ArgoCD Application for database template
          ├── app-backend.yaml    # ArgoCD Application for backend template
          └── app-frontend.yaml   # ArgoCD Application for frontend template
  ```
- **Rules:**
  - System is single source of truth (overwrites existing Git content in target path)
  - Each ArgoCD Application references Template_Version.git_repository with Template_Version.git_revision
  - ArgoCD Application destination uses cluster.server_url from instance's cluster relationship
  - All applications deployed to instance.namespace
  - Sync policy from instance settings (auto_sync_enabled, auto_prune_enabled, auto_heal_enabled)
  - Values merging uses 3-level hierarchy with template version as base
  - Path structure enables logical organization and easy navigation
- **Impact:**
  - Creates centralized Helm Chart with specific template versions (commit-based isolation)
  - Enables scalable App of Apps pattern with clear organizational structure
  - Provides complete deployment specification with version governance and path-based organization



#### **DELETE Instance**
- **What:** Remove instance and cascade delete Instance_Templates
- **URL:** `DELETE /instances/{public_id}` (using UUID)
- **Process:**
  1. Verify no blocking dependencies
  2. Cascade delete all Instance_Template records  
  3. Clean up ArgoCD Applications (optional integration)
  4. Remove generated Helm Charts from centralized git repository path (optional)
- **Rules:**
  - Removes all associated Instance_Template records
  - Optional cleanup of external resources (ArgoCD, centralized Git path)
  - Cannot delete if referenced by other entities
- **Impact:** Complete instance removal with configurable infrastructure cleanup and path-based Git cleanup

---

## ⚙️ System Configuration

### **Centralized Helm Charts Repository**
- **Global Configuration:** System maintains single helm_charts_repository and helm_charts_branch
- **No Instance Override:** All instances use same centralized repository (simplified governance)
- **Default Values:** Typically `helm_charts_repository: "https://dev.azure.com/{org}/{project}/_git/helm-charts"` and `helm_charts_branch: "main"`
- **Path Generation:** Automatic structure `{environment}/{location}/{application}/{instance}/`
- **Repository Requirements:** Must be accessible via Azure Managed Identity for chart generation

### **Path Structure Convention**
- **Format:** `{environment_name}/{location_name}/{application_name}/{instance_name}/`
- **Benefits:** Logical organization, easy navigation, clear separation of concerns
- **Example:** `production/brazil/ecommerce/web-frontend/`
- **Scalability:** Supports unlimited environments, locations, applications per structure

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