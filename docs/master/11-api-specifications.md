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

## 📊 HTTP Status Codes

All API endpoints follow standard HTTP status code conventions:

**Success Responses:**
- **200 OK** - Successful GET, PUT, PATCH operations or successful operation with data
- **201 Created** - Successful POST operation creating new resource
- **204 No Content** - Successful DELETE operation

**Client Error Responses:**
- **400 Bad Request** - Invalid input data, validation errors, business rule violations
  - Invalid Helm chart structure
  - Branch not found in Git repository
  - Invalid template path
  - Malformed request body
- **404 Not Found** - Requested resource does not exist
  - Template, Blueprint, Instance not found by UUID
  - Location, Environment, Cluster, Application not found by name
- **409 Conflict** - Resource already exists with same unique identifier
  - Duplicate name, duplicate git_path within repository

**Server Error Responses:**
- **500 Internal Server Error** - Unexpected server-side error
  - Database operation failure
  - Template version processing error
- **502 Bad Gateway** - External service communication failure
  - Azure DevOps authentication failure
  - Git repository connection timeout

---

## 🔴 Error Response Format

All API endpoints return structured error responses following RFC 7807 principles with additional context for better debugging and user experience.

### **Standard Error Structure**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Template not found",
    "detail": "Template with identifier 'abc-123-def' not found",
    "field": "public_id",
    "value": "abc-123-def",
    "metadata": {
      "resource": "Template",
      "identifier": "abc-123-def"
    }
  }
}
```

### **Error Response Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Machine-readable error code for programmatic handling |
| `message` | string | Yes | Short, user-friendly error message for UI display |
| `detail` | string | Yes | Technical error message with full context for debugging |
| `field` | string | No | Field name that caused the validation error |
| `value` | any | No | Field value that was invalid or caused the error |
| `metadata` | object | No | Additional context information about the error |

### **Error Response Examples**

#### **404 Not Found**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Template not found",
    "detail": "Template with identifier 'abc-123-def' not found",
    "field": "public_id",
    "value": "abc-123-def",
    "metadata": {
      "resource": "Template",
      "identifier": "abc-123-def"
    }
  }
}
```

#### **409 Conflict**
```json
{
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "Template already exists",
    "detail": "Template with name 'PostgreSQL-DB' already exists",
    "field": "name",
    "value": "PostgreSQL-DB",
    "metadata": {
      "resource": "Template",
      "field": "name"
    }
  }
}
```

#### **400 Bad Request - Invalid Helm Chart**
```json
{
  "error": {
    "code": "INVALID_HELM_CHART",
    "message": "Invalid Helm Chart structure",
    "detail": "Git operation 'helm_chart_validation' failed: Invalid Helm Chart at 'airflow/charts2': missing files Chart.yaml",
    "field": "git_path",
    "value": "airflow/charts2",
    "metadata": {
      "git_path": "airflow/charts2",
      "missing_files": ["Chart.yaml"]
    }
  }
}
```

#### **502 Bad Gateway - Authentication Failed**
```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Authentication with external service failed",
    "detail": "Git operation 'authentication' failed: Azure DevOps authentication failed",
    "metadata": {
      "service": "Azure DevOps"
    }
  }
}
```

#### **500 Internal Server Error**
```json
{
  "error": {
    "code": "TEMPLATE_VERSION_ERROR",
    "message": "Template version creation failed",
    "detail": "Template 'PostgreSQL-DB' version creation failed: database transaction timeout",
    "metadata": {
      "template": "PostgreSQL-DB",
      "operation": "creation",
      "reason": "database transaction timeout"
    }
  }
}
```

### **Error Codes Reference**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource with identifier already exists |
| `INVALID_HELM_CHART` | 400 | Helm Chart structure is invalid or incomplete |
| `INVALID_REPOSITORY` | 400 | Repository is invalid or inaccessible |
| `GIT_SERVICE_ERROR` | 400 | Git service operation failed |
| `AUTHENTICATION_FAILED` | 502 | External service authentication failed |
| `TEMPLATE_SYNC_FAILED` | 400 | Template synchronization operation failed |
| `TEMPLATE_VERSION_ERROR` | 500 | Template version processing error |
| `INTERNAL_ERROR` | 500 | Unexpected server-side error |

---

### **Error Message Guidelines (Legacy Reference)**

> **Note:** The sections below document message patterns for reference. All errors now use the structured format above.



All API endpoints follow consistent error message patterns for better debugging and user experience:

#### **Message Structure**
Error messages follow the pattern: `{Context}: {Specific Issue}` or `{Entity} '{identifier}' {action/state}`

**Examples:**
- `"Template with identifier 'uuid-123' not found"`
- `"Template with name 'PostgreSQL-DB' already exists"`
- `"Git operation 'helm_chart_validation' failed: Invalid Helm Chart at 'airflow/charts'"`

#### **Best Practices**
1. **Be Specific:** Include entity type, identifier, and exact issue
2. **Be Actionable:** Help user understand what went wrong and how to fix it
3. **Be Consistent:** Use same terminology across all endpoints
4. **Include Context:** Mention the operation being performed when relevant
5. **Avoid Technical Jargon:** Use business terminology when possible

#### **Common Error Patterns**

**Not Found Errors (404):**
```
"{Entity} with identifier '{value}' not found"
"{Entity} '{name}' not found"

Examples:
- "Template with identifier 'abc-123-def' not found"
- "Repository 'helm-charts' not found"
- "Cluster 'production-aks' not found"
```

**Already Exists Errors (409):**
```
"{Entity} with {field} '{value}' already exists"

Examples:
- "Template with name 'PostgreSQL-DB' already exists"
- "Template with git_path 'database/postgresql' already exists in repository 'helm-charts'"
- "Location with name 'Brazil' already exists"
```

**Validation Errors (400):**
```
"Invalid {field}: {reason}"
"{Entity} validation failed: {specific_issue}"

Examples:
- "Invalid branch_name: Branch 'feature-x' not found in repository"
- "Invalid git_path: Chart.yaml not found at 'airflow/charts2'"
- "Template validation failed: repository_name is required"
```

**Git Service Errors (400):**
```
"Git operation '{operation}' failed: {detailed_message}"

Examples:
- "Git operation 'helm_chart_validation' failed: Invalid Helm Chart at 'airflow/charts2': missing files Chart.yaml"
- "Git operation 'branch_validation' failed: Branch 'develop' not found in repository 'DataOcean.Infra'"
```

**External Service Errors (502):**
```
"Git operation '{operation}' failed: {external_service_error}"

Examples:
- "Git operation 'authentication' failed: Azure DevOps authentication failed"
- "Git operation 'repository_access' failed: Repository 'helm-charts' is invalid or inaccessible"
```

**Business Rule Violations (400):**
```
"Cannot {action}: {business_rule_reason}"

Examples:
- "Cannot delete template: Template version is referenced by 3 blueprints"
- "Cannot use disabled template version: commit no longer exists in repository"
- "Cannot publish blueprint version: must have at least one template configured"
```

**Internal Server Errors (500):**
```
"Template '{name}' version {operation} failed: {technical_reason}"

Examples:
- "Template 'PostgreSQL-DB' version synchronization failed: database transaction timeout"
- "Template 'Airflow-Chart' version creation failed: failed to parse Chart.yaml"
```

#### **Field Naming Conventions**
Use consistent field names across all error messages:
- `public_id` (not uuid, guid, id)
- `name` (for human-readable identifiers)
- `branch_name` (not branch, branchName)
- `repository_name` (not repo, repository)
- `git_path` (not path, chartPath)
- `commit_hash` (not commit, sha, revision)

#### **Multi-Language Support (Future)**
Error messages use clear English. Future versions may include:
- Error codes for programmatic handling
- i18n support for localized messages
- Structured error details with machine-readable codes

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
**URL:** `POST /repositories/{repository_name}/sync`
**Purpose:** Synchronize ALL templates across ALL tracked branches

**Process:**
1. Get tracked branches for repository
2. For each branch: Run SYNC Template for all templates
3. Disable versions from deleted branches

**Response:**
- `branches_synchronized` - Successfully synced branches
- `branches_deleted` - Branches removed from Git
- `template_versions_created/updated/disabled` - Counts
- `affected_instances` - Instances using disabled versions

**Rules:** Only syncs explicitly tracked branches (no auto-discovery)

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

**Endpoint Summary:**
- `POST /templates` - Create template metadata
- `PUT /templates/{public_id}` - Update template metadata
- `POST /templates/{public_id}/sync` - Sync template version from branch
- `GET /templates` - List all templates
- `GET /templates/{public_id}` - Get template with versions summary
- `GET /templates/{public_id}/versions` - List template versions
- `GET /templates/{public_id}/versions/{commit_hash}` - Get version details
- `POST /templates/{public_id}/validate-values` - Validate values against schema
- `DELETE /templates/{public_id}` - Delete template and versions

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
**URL:** `POST /templates/{public_id}/sync`
**Field:** `branch_name` (required) - Branch to sync from HEAD
**Core Logic:**
1. **Branch Check:** Validate branch exists, handle recovery/deletion
2. **Commit Audit:** Verify all Template_Version commit hashes still exist in Git  
3. **Smart Versioning:** Create new version only if chart files changed

**Commit Audit Process:**
```
For each Template_Version (active + disabled):
  commit_exists = git rev-parse --verify <commit_hash>
  
  IF commit_exists AND currently_disabled AND disabled_reason IN ('orphaned_commit', 'branch_deleted'):
    → Re-enable (recovery)
  ELIF NOT commit_exists AND currently_active:  
    → Disable (disabled_reason='orphaned_commit')
```

**Smart Versioning (MVP Logic):**
- **No valid versions:** Create first Template_Version from HEAD
- **Valid baseline exists:** Git diff baseline vs HEAD in `git_path`
  - **Any changes detected:** Create new Template_Version
  - **No changes detected:** Update commit_hash only  
- **All orphaned:** Create new Template_Version (recovery mode)

**Change Detection (MVP):** Simple git diff in template's `git_path`:
- Detects **ANY file changes** within the path (not specific files)
- Command: `git diff <baseline_commit> <HEAD_commit> -- <git_path>/`
- If diff output exists → Changes detected → New version
- If diff output empty → No changes → Update commit only

**Response Types:**
- `up-to-date` - No action needed
- `version-created` - Chart files changed  
- `commit-updated` - Files unchanged, commit updated
- `branch-recovered` - Branch restored, versions re-enabled
- `multiple-orphaned-commits` - Git history rewritten, all versions orphaned
- `partial-orphaned-commits` - Some commits missing
- `branch-deleted-protective` - Branch deleted, versions disabled

#### **SYNC Process Flow**

**3-Phase Approach:**
1. **Initial Check:** If no versions exist → create first version
2. **Commit Audit:** Validate all commit hashes exist in Git
3. **Smart Versioning:** Create/update based on chart changes

**Commit States:**
- `EXISTS + ACTIVE` → Keep active
- `EXISTS + DISABLED (orphaned/branch_deleted)` → Re-enable (recovery)  
- `EXISTS + DISABLED (other reasons)` → Keep disabled
- `NOT_EXISTS + ACTIVE` → Disable (orphaned)
- `NOT_EXISTS + DISABLED` → Keep disabled

**Baseline Selection:**
- **All orphaned:** Create new version from HEAD
- **Valid versions exist:** Use latest valid as baseline for diff
- **Mixed state:** Use valid baseline + log orphaned actions

#### **Git History Scenarios**

**Common Git Operations Handled:**
- **Squash:** All commits → single commit (Response: `multiple-orphaned-commits`)
- **Rebase:** Some commits missing/modified (Response: `partial-orphaned-commits`) 
- **Force Push:** Complete history rewrite (Response: `multiple-orphaned-commits`)
- **Branch Delete:** All versions disabled (Response: `branch-deleted-protective`)
- **Branch Recovery:** Re-enable valid commits (Response: `branch-recovered`)

**Design Principles:**
✅ Individual commit validation - no Git history assumptions
✅ Automatic recovery when commits return  
✅ Zero data loss - content preserved when commits disappear
✅ **Selective recovery** - only re-enable Git-related disabled reasons

> **⚠️ Recovery Rules:** Only Template_Versions disabled due to `orphaned_commit` or `branch_deleted` are candidates for automatic recovery. Versions disabled for other reasons (manual, security, etc.) remain disabled.

**Disabled Reasons:**
- `orphaned_commit` - Commit no longer exists in Git history (auto-recoverable)
- `branch_deleted` - Source branch was deleted (auto-recoverable)  
- `manual` - Manually disabled by admin (NOT recoverable)
- `security` - Security issue identified (NOT recoverable)
- `deprecated` - Version marked as deprecated (NOT recoverable)  

#### **VALIDATE Values Against Schema**
- **What:** Validate custom values against specific template version from branch
- **URL:** `POST /templates/{public_id}/validate-values`
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
- **Alternative URL:** `POST /templates/{public_id}/versions/{commit_hash}/validate-values`
  - Validates against specific version instead of branch HEAD

#### **DELETE Template**
- **What:** Remove template and all versions
- **URL:** `DELETE /templates/{public_id}` (using UUID)
- **Rules:**
  - FORBIDDEN if any Template_Version is referenced by Blueprint_Templates
  - Must be completely unused across all blueprints
  - Cascades deletion of all Template_Versions from all branches

#### **SYNC Response Examples**

**Success Responses (HTTP 200 OK):**
```json
// No changes detected
{ "result": "up-to-date", "current_version": {...} }

// New version created
{ "result": "version-created", "current_version": {...} }

// Commit updated without new version
{ "result": "commit-updated", "current_version": {...} }
```

**Recovery Responses (HTTP 200 OK):**
```json
// Branch recovered with versions re-enabled
{ "result": "branch-recovered", "recovered_versions": 3 }

// Multiple commits orphaned (Git history rewrite)
{ "result": "multiple-orphaned-commits", "orphaned_count": 5 }

// Some commits orphaned
{ "result": "partial-orphaned-commits", "orphaned_count": 2 }

// Branch deleted, versions disabled (protective action)
{ "result": "branch-deleted-protective", "disabled_versions": 4 }
```

**Error Responses (HTTP Status Codes):**

**400 Bad Request - Invalid Helm chart structure:**
```json
{
  "error": {
    "code": "INVALID_HELM_CHART",
    "message": "Invalid Helm Chart structure",
    "detail": "Git operation 'helm_chart_validation' failed: Invalid Helm Chart at 'airflow/charts2': missing files Chart.yaml",
    "field": "git_path",
    "value": "airflow/charts2",
    "metadata": {
      "git_path": "airflow/charts2",
      "missing_files": ["Chart.yaml"]
    }
  }
}
```

**400 Bad Request - Branch not found:**
```json
{
  "error": {
    "code": "GIT_SERVICE_ERROR",
    "message": "Git operation failed: branch_validation",
    "detail": "Git operation 'branch_validation' failed: Branch 'feature-x' not found in repository 'DataOcean.Infra'",
    "field": "branch_name",
    "value": "feature-x",
    "metadata": {
      "operation": "branch_validation"
    }
  }
}
```

**404 Not Found - Template not found:**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Template not found",
    "detail": "Template with identifier 'uuid-xyz' not found",
    "field": "public_id",
    "value": "uuid-xyz",
    "metadata": {
      "resource": "Template",
      "identifier": "uuid-xyz"
    }
  }
}
```

**502 Bad Gateway - Authentication issues:**
```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Authentication with external service failed",
    "detail": "Git operation 'authentication' failed: Azure DevOps authentication failed",
    "metadata": {
      "service": "Azure DevOps"
    }
  }
}
```

#### **LIST Templates**
- **What:** Retrieve all templates with basic information
- **URL:** `GET /templates`
- **Filters:** 
  - `repository_name` (optional): Filter by repository
  - `include_versions` (optional, default: false): Include version summaries
- **Returns:** Array of templates with basic metadata
- **Response Format:**
  ```json
  [
    {
      "public_id": "uuid-123",
      "name": "PostgreSQL-Database",
      "description": "PostgreSQL database with monitoring", 
      "repository_name": "helm-charts",
      "git_path": "database/postgresql",
      "created_at": "2024-01-10T10:00:00Z",
      "current_version": {
        "commit_hash": "abc123def",
        "branch_name": "main",
        "version_display": "main-abc123d",
        "chart_version": "15.2.1"
      },
      "versions_count": 5
    }
  ]
  ```

#### **GET Template with Versions Summary**
- **What:** Retrieve specific template with versions summary
- **URL:** `GET /templates/{public_id}` (using UUID)
- **Purpose:** Provides overview of available versions for blueprint creation and upgrade planning
- **Returns:** Template details with summarized version information
- **Response Format:**
  ```json
  {
    "public_id": "uuid-123",
    "name": "PostgreSQL-Database",
    "description": "PostgreSQL database with monitoring",
    "repository_name": "helm-charts", 
    "git_path": "database/postgresql",
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "current_version": {
      "commit_hash": "abc123def",
      "branch_name": "main",
      "version_display": "main-abc123d",
      "chart_version": "15.2.1",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "versions_summary": [
      {
        "commit_hash": "abc123def",
        "branch_name": "main",
        "version_display": "main-abc123d",
        "chart_version": "15.2.1",
        "app_version": "15.2",
        "created_at": "2024-01-15T10:00:00Z",
        "is_current": true
      },
      {
        "commit_hash": "def456abc", 
        "branch_name": "main",
        "version_display": "main-def456a",
        "chart_version": "15.2.0",
        "app_version": "15.2",
        "created_at": "2024-01-10T10:00:00Z",
        "is_current": false
      },
      {
        "commit_hash": "ghi789def",
        "branch_name": "develop", 
        "version_display": "develop-ghi789d",
        "chart_version": "15.3.0-beta",
        "app_version": "15.3-beta",
        "created_at": "2024-01-12T10:00:00Z",
        "is_current": false
      }
    ]
  }
  ```
- **Use Cases:**
  - Blueprint creation: Choose template version for blueprint
  - Upgrade planning: See available newer versions
  - Version comparison: Compare chart_version between branches
  - Quick overview: See all versions without loading details

#### **GET Template Versions List**
- **What:** List all versions for specific template
- **URL:** `GET /templates/{public_id}/versions`
- **Filters:**
  - `branch_name` (optional): Filter by specific branch
  - `limit` (optional, default: 50): Limit number of results
  - `order` (optional, default: "desc"): Order by created_at (desc/asc)
- **Returns:** Array of version summaries with pagination
- **Response Format:**
  ```json
  {
    "template_public_id": "uuid-123",
    "total_count": 25,
    "versions": [
      {
        "commit_hash": "abc123def",
        "branch_name": "main",
        "version_display": "main-abc123d", 
        "chart_version": "15.2.1",
        "app_version": "15.2",
        "created_at": "2024-01-15T10:00:00Z",
        "is_current": true
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total_pages": 1
    }
  }
  ```

#### **GET Template Version Details**
- **What:** Get complete details for specific template version
- **URL:** `GET /templates/{public_id}/versions/{commit_hash}`
- **Purpose:** Deep analysis of specific version for troubleshooting and configuration
- **Returns:** Complete template version data including schema and default values
- **Response Format:**
  ```json
  {
    "template_public_id": "uuid-123",
    "commit_hash": "abc123def",
    "branch_name": "main",
    "version_display": "main-abc123d",
    "created_at": "2024-01-15T10:00:00Z",
    "chart_metadata": {
      "name": "postgresql",
      "version": "15.2.1",
      "app_version": "15.2",
      "description": "PostgreSQL object-relational database",
      "type": "application",
      "keywords": ["postgresql", "database", "sql"],
      "home": "https://github.com/bitnami/charts/tree/main/bitnami/postgresql",
      "sources": ["https://github.com/bitnami/containers/tree/main/bitnami/postgresql"],
      "maintainers": [
        {
          "name": "Bitnami",
          "email": "containers@bitnami.com"
        }
      ]
    },
    "default_values": {
      "image": {
        "repository": "bitnami/postgresql",
        "tag": "15.2.0-debian-11-r14",
        "pullPolicy": "IfNotPresent"
      },
      "auth": {
        "enablePostgresUser": true,
        "postgresPassword": "",
        "username": "",
        "password": "",
        "database": ""
      },
      "primary": {
        "persistence": {
          "enabled": true,
          "size": "8Gi"
        },
        "resources": {
          "limits": {},
          "requests": {
            "cpu": "250m",
            "memory": "256Mi"
          }
        }
      }
    },
    "values_schema": {
      "type": "object",
      "properties": {
        "image": {
          "type": "object",
          "properties": {
            "repository": {"type": "string"},
            "tag": {"type": "string"},
            "pullPolicy": {"type": "string", "enum": ["Always", "Never", "IfNotPresent"]}
          }
        },
        "auth": {
          "type": "object",
          "properties": {
            "enablePostgresUser": {"type": "boolean"},
            "database": {"type": "string"}
          }
        }
      }
    },
    "import_details": {
      "imported_at": "2024-01-15T10:00:00Z",
      "sync_method": "manual",
      "chart_files_detected": ["Chart.yaml", "values.yaml", "values.schema.json"],
      "template_files_count": 12
    }
  }
  ```
- **Use Cases:**
  - Configuration planning: See complete default values for customization
  - Schema validation: Understand available configuration options
  - Troubleshooting: Deep dive into specific version causing issues
  - Documentation: Complete chart metadata and structure

#### **Template Version Status Management**

**Status Fields:** All Template_Version records include status tracking fields:
- `disabled` (boolean): Whether version is available for use (default: false)
- `disabled_reason` (string, nullable): Reason for disabling (when disabled = true)
- `disabled_at` (timestamp, nullable): When version was disabled
- `recovered_at` (timestamp, nullable): When version was recovered from disabled state

**Status Values:**
- **Available** (`disabled: false`): Template version ready for use in blueprints and instances
- **Disabled** (`disabled: true`): Template version cannot be used for new blueprints/instances

**Disable Reasons:**
- `"branch_deleted"`: Source branch no longer exists in repository
- `"orphaned_commit"`: Git commit hash no longer exists in repository history
- `"orphaned_commit_after_recovery"`: Branch was recovered but commit no longer exists in new branch history
- `"manual_disable"`: Administratively disabled by user
- `"repository_deleted"`: Source repository no longer accessible

**Business Rules:**
- **New Blueprints/Instances:** Cannot use disabled template versions
- **Existing Instances:** Continue running but show "source unavailable" status
- **Automatic Recovery:** Template versions automatically re-enabled when branch is recovered and commits still exist
- **Partial Recovery:** If branch is recovered but commits are missing, versions remain disabled with updated reason
- **Manual Recovery:** Administrators can manually re-enable template versions after validation
- **Cleanup:** Disabled versions older than retention period can be purged

**Branch Recovery Process:**
- **Automatic Detection:** Next sync operation detects previously deleted branch is now available
- **Commit Validation:** Each disabled template version's commit is checked against recovered branch
- **Smart Re-enabling:** Only commits that still exist in recovered branch are automatically re-enabled
- **Audit Trail:** All recovery actions logged with timestamps for operational transparency

**Impact on Instance Operations:**
- **LIST Instances Filter:** `source_availability=unavailable` shows instances using disabled template versions
- **Instance Status:** Instances using disabled versions show warning indicators
- **Upgrade Recommendations:** System suggests alternative template versions for affected instances

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

#### **UPDATE Blueprint Version**
- **What:** Update blueprint version metadata
- **URL:** `PUT /blueprints/{public_id}/versions/{version_number}` (using UUID)
- **Fields:**
  - `helper_templates` (optional): Update Go template syntax for Helm value generation (draft only)
  - `description` (optional): Update version description (allowed anytime)
- **Rules:**
  - `helper_templates` can only be updated on 'draft' versions (FORBIDDEN if published)
  - `description` can be updated on both 'draft' and 'published' versions (documentation field)
  - helper_templates must be valid Go template syntax (if provided)
  - Version number cannot be changed (auto-generated)
- **Impact:** 
  - Description updates: Pure documentation change, no functional impact
  - helper_templates updates: Only allowed on draft versions, affects Helm value generation

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