# Blueprint Values Section - Implementation Guide

## Overview

This document provides detailed implementation guidance for the **Blueprint Values Section**, part of the Blueprint Creation flow. This section allows users to define:

1. The **default values** for each template in the blueprint
2. The **fields that will be exposed** and made configurable in downstream instances created from this blueprint
3. The **permissions** for whether instances can override each field or not
4. The **source** of each value (template default or blueprint override)

These values form a **contract of configuration** between the blueprint and its instances.

## 🎯 Objectives

- Allow users to define blueprint-level values for each template
- Control which fields are exposed to instance-level overrides
- Define the source of each field: chart default or blueprint-defined
- Support variable interpolation using Helm syntax (`{{ include "..." . }}`)
- Support schema-based rendering and fallback to YAML parsing if schema is not present
- Enable full visibility of the contract result from the author's perspective

## 📋 Requirements

### Functional Requirements

1. **Template Selection**

- Users can select from templates already added to the blueprint
- Navigation between templates via tabs interface
- Visual indication of templates with custom values

2. **Field-Level Configuration Table**
   For each field extracted from the template's `values.schema.json` (or inferred from its `values.yaml`):

- Display: name, type, default value
- Allow the user to define:

  - Whether the field value comes from the chart or is overridden in the blueprint
  - Whether the field is editable by instances
  - Optional override value in case of blueprint-sourced

- Fields that are **not included in the blueprint** will not be exposed to instâncias, and will follow the default behavior defined in the original chart values

3. **YAML View (Optional)**

- Allow editing the override block in YAML directly
- Persist only values defined as blueprint-sourced
- The YAML editor may be read-only or hidden entirely if field-level UI is used exclusively

4. **Reference & Validation**

- Use `values.schema.json` when available
- Fallback to inferring schema from `values.yaml`
- Validate field values on edit
- Warn on undefined variables in overrides
- Highlight fields using interpolated variables and flag undeclared ones

5. **Contract Visualization**

- Provide a summary view per template that consolidates all field decisions: source, value (if any), and override permission
- Show hierarchical structure of fields with indentation or nesting to preserve clarity on dot notation keys

6. **Persistence Format**
   Store for each field:

- Key path (e.g., `service.port`)
- Value (if overridden)
- Source: `template` | `blueprint`
- Overridable by instance: true | false

Example:

```json
{
  "templateId": "api",
  "fields": [
    {
      "key": "replicaCount",
      "value": 3,
      "source": "blueprint",
      "overridable": true
    },
    {
      "key": "image.tag",
      "source": "template",
      "overridable": false
    }
  ]
}
```

### Non-functional Requirements

1. **Performance**

- Efficient rendering of forms for dozens of fields
- Lazy evaluation of schema parsing
- Debounced validation

2. **Accessibility & UX**

- Clear labels and toggles for editability/source
- Contextual explanations and tooltips
- Keyboard navigable table
- Visual distinction between source types
- Fields that are deeply nested should maintain hierarchical readability (e.g., collapsible paths)

## 🧱 Component Architecture

### Component Hierarchy

```
BlueprintValuesSection/
├── TemplateTabsNavigation.tsx           # Navigation between templates
├── TemplateFieldsTable.tsx              # Main table-based interface
│   ├── FieldRow.tsx                     # Individual field configuration row
│   └── FieldValueEditor.tsx             # Type-specific value editors
├── TemplateYamlEditor.tsx               # Alternative YAML editing view
├── ViewToggle.tsx                       # Switch between table and YAML views
├── FilterControls.tsx                   # Search and filtering options
├── ValidationFeedback.tsx               # Error/warning display
├── ContractPreview.tsx                  # Preview the final configuration
└── types.ts                             # Type definitions
```

### Data Flow

```
┌─────────────────────┐
│ Blueprint Context   │◄──────┐
└─────────────────────┘       │
         ▲                    │
         │                    │
┌─────────────────────┐       │
│ BlueprintValuesForm │       │ State Updates
└─────────────────────┘       │
         ▲                    │
         │                    │
┌──────────────┐     ┌────────────────┐
│ SchemaLoader │◄────┤ Template API   │
└──────────────┘     └────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Field Configuration Controls │
└──────────────────────────────┘
```

## 🧪 User Flow

1. **Template Selection**

   - User navigates to the Default Values section
   - System loads all templates associated with the blueprint
   - User selects a template to configure via the tab navigation

2. **Field Configuration**

   - System loads schema for the selected template
   - Fields are displayed in hierarchical table with:
     - Field name and path
     - Data type
     - Default value from chart
   - For each field, user can:
     - Toggle whether to override the default value
     - Set a blueprint-specific value if overriding
     - Choose whether the field is exposed to instances
     - Determine if instances can override the value

3. **Validation & Preview**

   - System validates values against schema constraints
   - User can preview how the configuration will appear to instances
   - Visual indicators show which fields will be visible/editable

4. **Multi-Template Management**

   - User can switch between templates to configure each one
   - System maintains state for all templates in the context
   - Summary view shows configuration status across all templates

5. **Saving & Persistence**
   - On save, only the relevant override data and permission settings are persisted
   - System formats the data according to the persistence model

## 🖼️ Interface Design

### Tab-Based Template Navigation

```
+--------------------------------------------------------+
|  [API] | [Database] | [Frontend] | [Cache]              |
+--------------------------------------------------------+
```

### Main Table-Based Interface

```
+--------------------------------------------------------+
| Filtrar: [Todos ▼] | Buscar: [____________] | [⊞] [≡]  |
+--------------------------------------------------------+
| Campo           | Tipo   | Valor Blueprint  | Exibir | Override |
+----------------+--------+-----------------+--------+---------+
| replicaCount   | number | 3               | ✓      | ✓       |
+----------------+--------+-----------------+--------+---------+
| service        | object | ⊟               | -      | -       |
| ├─ type        | string | ClusterIP       | ✓      | ✓       |
| ├─ port        | number | 8080            | ✓      | ✓       |
| └─ targetPort  | number | 8080            | ✓      | ✗       |
+----------------+--------+-----------------+--------+---------+
| resources      | object | ⊟               | -      | -       |
| ├─ limits      | object | ⊟               | -      | -       |
| │  ├─ cpu      | string | 500m            | ✓      | ✓       |
| │  └─ memory   | string | 512Mi           | ✓      | ✓       |
| └─ requests    | object | ⊟               | -      | -       |
|    ├─ cpu      | string | 250m            | ✓      | ✓       |
|    └─ memory   | string | 256Mi           | ✓      | ✓       |
+----------------+--------+-----------------+--------+---------+
```

### Alternative View for Comparison

| Field        | Type   | Chart Default | Blueprint Value | Expose | Allow Override |
| ------------ | ------ | ------------- | --------------- | ------ | -------------- |
| replicaCount | number | 1             | 3               | ✅     | ✅             |
| image.tag    | string | latest        | -               | ❌     | ❌             |
| service.port | number | 80            | 8080            | ✅     | ❌             |

### Interface Elements

- **Field List**: Hierarchical display of fields with collapsible sections
- **Type Indicators**: Visual cues for different data types
- **Value Editors**: Type-appropriate editors (checkbox, number, select, etc.)
- **Exposure Controls**: Clear toggles for field visibility in instances
- **Override Permission**: Controls whether instances can change values

### Progressive Disclosure

The interface should follow a progressive disclosure pattern:

1. **Basic View**: Simple list of fields with toggle for blueprint override
2. **Advanced View**: Full control with exposure and override permissions
3. **YAML View**: Direct editing in YAML format for power users

## 🔧 Backend Responsibilities

- Provide both `values.schema.json` and `values.yaml`
- If schema not present, parse `values.yaml` to generate an inferred schema
- Normalize nested fields into dot notation (`service.port`, `resources.limits.cpu`)
- Expose fields with: type, default, and documentation (if available)
- Prevent saving of blueprint values that attempt to override undeclared or locked fields

## 💡 UX Guidelines

1. **Clear Visual Hierarchy**

   - Nested fields should maintain parent-child relationships visually
   - Use indentation, connecting lines, or grouping to show structure

2. **Intuitive Controls**

   - Use familiar patterns like checkboxes for boolean options
   - Provide immediate visual feedback for changes

3. **Contextual Help**

   - Show field descriptions from schema as tooltips
   - Provide guidance on best practices for exposure decisions

4. **Template Comparison**

   - Enable side-by-side comparison of values across templates
   - Highlight common patterns to encourage consistency

5. **Efficient Navigation**
   - Search and filter capabilities for large schemas
   - Shortcuts for common operations (expose all, reset to defaults)

## ✅ Conclusion

This refined model for the **Blueprint Values Section** transforms it into a robust, declarative contract builder. Blueprint authors can explicitly control:

- What values are used by default
- Which values instances are allowed to override
- Where each value originates from
- What fields are purposefully hidden or restricted

This model enables safe configuration boundaries, clean upgrade paths, and scalable governance across environments and teams.

The system is designed to degrade gracefully when schema definitions are missing, and will continue to evolve into a powerful interface contract engine with strong tooling support.
