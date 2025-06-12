/**
 * Mock data for template fields used in the Values section
 * This file provides mock DefaultValueField arrays for different template types
 */

import type { DefaultValueField } from '@/components/blueprints/sections/DefaultValuesSection/types';
import { ValueSourceType } from '@/components/blueprints/sections/DefaultValuesSection/types';

/**
 * Generate mock fields for database templates
 */
export function generateDatabaseFields(): DefaultValueField[] {
  return [
    {
      key: 'database.name',
      displayName: 'Database Name',
      description: 'The name of the database instance',
      value: 'example-db',
      originalValue: 'example-db',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'string',
      required: true,
      path: ['database', 'name'],
    },
    {
      key: 'database.engine',
      displayName: 'Database Engine',
      description: 'The database engine to use',
      value: 'postgres',
      originalValue: 'postgres',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: false,
      type: 'string',
      required: true,
      path: ['database', 'engine'],
    },
    {
      key: 'database.version',
      displayName: 'Engine Version',
      description: 'The version of the database engine',
      value: '13.4',
      originalValue: '13.4',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'string',
      required: false,
      path: ['database', 'version'],
    },
    {
      key: 'database.resources',
      displayName: 'Resources',
      description: 'Resource allocation for the database',
      value: { cpu: '500m', memory: '1Gi' },
      originalValue: { cpu: '500m', memory: '1Gi' },
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'object',
      required: false,
      path: ['database', 'resources'],
      children: [
        {
          key: 'database.resources.cpu',
          displayName: 'CPU Request',
          description: 'CPU resource request',
          value: '500m',
          originalValue: '500m',
          source: ValueSourceType.TEMPLATE,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['database', 'resources', 'cpu'],
        },
        {
          key: 'database.resources.memory',
          displayName: 'Memory Request',
          description: 'Memory resource request',
          value: '1Gi',
          originalValue: '1Gi',
          source: ValueSourceType.TEMPLATE,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['database', 'resources', 'memory'],
        },
      ],
    },
  ];
}

/**
 * Generate mock fields for application templates
 */
export function generateApplicationFields(): DefaultValueField[] {
  return [
    {
      key: 'application.replicas',
      displayName: 'Replica Count',
      description: 'Number of application replicas',
      value: 2,
      originalValue: 2,
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'number',
      required: true,
      path: ['application', 'replicas'],
    },
    {
      key: 'application.image',
      displayName: 'Container Image',
      description: 'Container image configuration',
      value: { repository: 'nginx', tag: 'latest' },
      originalValue: { repository: 'nginx', tag: 'latest' },
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'object',
      required: true,
      path: ['application', 'image'],
      children: [
        {
          key: 'application.image.repository',
          displayName: 'Image Repository',
          description: 'Container image repository',
          value: 'nginx',
          originalValue: 'nginx',
          source: ValueSourceType.TEMPLATE,
          exposed: true,
          overridable: true,
          type: 'string',
          required: true,
          path: ['application', 'image', 'repository'],
        },
        {
          key: 'application.image.tag',
          displayName: 'Image Tag',
          description: 'Container image tag',
          value: 'latest',
          originalValue: 'latest',
          source: ValueSourceType.TEMPLATE,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['application', 'image', 'tag'],
        },
      ],
    },
    {
      key: 'application.environment',
      displayName: 'Environment Variables',
      description: 'Application environment variables',
      value: { NODE_ENV: 'production', LOG_LEVEL: 'info' },
      originalValue: { NODE_ENV: 'production', LOG_LEVEL: 'info' },
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'object',
      required: false,
      path: ['application', 'environment'],
      children: [
        {
          key: 'application.environment.NODE_ENV',
          displayName: 'NODE_ENV',
          description: 'Node environment',
          value: 'production',
          originalValue: 'production',
          source: ValueSourceType.TEMPLATE,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['application', 'environment', 'NODE_ENV'],
        },
        {
          key: 'application.environment.LOG_LEVEL',
          displayName: 'LOG_LEVEL',
          description: 'Logging level',
          value: 'info',
          originalValue: 'info',
          source: ValueSourceType.TEMPLATE,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['application', 'environment', 'LOG_LEVEL'],
        },
      ],
    },
  ];
}

/**
 * Generate mock fields for network templates
 */
export function generateNetworkFields(): DefaultValueField[] {
  return [
    {
      key: 'network.type',
      displayName: 'Network Type',
      description: 'Type of network to create',
      value: 'vpc',
      originalValue: 'vpc',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: false,
      type: 'string',
      required: true,
      path: ['network', 'type'],
    },
    {
      key: 'network.cidr',
      displayName: 'CIDR Block',
      description: 'CIDR block for the network',
      value: '10.0.0.0/16',
      originalValue: '10.0.0.0/16',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'string',
      required: true,
      path: ['network', 'cidr'],
    },
    {
      key: 'network.subnets',
      displayName: 'Subnets',
      description: 'Network subnet configuration',
      value: [
        { name: 'public', cidr: '10.0.1.0/24', isPublic: true },
        { name: 'private', cidr: '10.0.2.0/24', isPublic: false },
      ],
      originalValue: [
        { name: 'public', cidr: '10.0.1.0/24', isPublic: true },
        { name: 'private', cidr: '10.0.2.0/24', isPublic: false },
      ],
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'array',
      required: false,
      path: ['network', 'subnets'],
    },
  ];
}

/**
 * Generate mock fields for generic templates
 */
export function generateGenericFields(): DefaultValueField[] {
  return [
    {
      key: 'name',
      displayName: 'Name',
      description: 'Resource name',
      value: 'generic-resource',
      originalValue: 'generic-resource',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'string',
      required: true,
      path: ['name'],
    },
    {
      key: 'description',
      displayName: 'Description',
      description: 'Resource description',
      value: 'A generic resource deployment',
      originalValue: 'A generic resource deployment',
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'string',
      required: false,
      path: ['description'],
    },
    {
      key: 'enabled',
      displayName: 'Enabled',
      description: 'Whether the resource is enabled',
      value: true,
      originalValue: true,
      source: ValueSourceType.TEMPLATE,
      exposed: true,
      overridable: true,
      type: 'boolean',
      required: false,
      path: ['enabled'],
    },
  ];
}

/**
 * Get mock fields based on template type
 */
export function getMockFieldsByType(
  templateType: 'database' | 'application' | 'network' | 'generic'
): DefaultValueField[] {
  switch (templateType) {
    case 'database':
      return generateDatabaseFields();
    case 'application':
      return generateApplicationFields();
    case 'network':
      return generateNetworkFields();
    case 'generic':
    default:
      return generateGenericFields();
  }
}
