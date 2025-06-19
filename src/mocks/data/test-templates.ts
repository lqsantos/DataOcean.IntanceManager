/**
 * Mock data for template tests
 */
import type { Template } from '@/types/template';

export const testTemplates: Template[] = [
  // Basic templates
  {
    id: 'template-1',
    name: 'Template 1',
    description: 'Description of Template 1',
    repositoryUrl: 'https://github.com/org/repo1',
    chartPath: '/charts/template1',
    category: 'Default',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'template-2',
    name: 'Template 2',
    description: 'Description of Template 2',
    repositoryUrl: 'https://github.com/org/repo2',
    chartPath: '/charts/template2',
    category: 'Default',
    isActive: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },

  // Typed templates
  {
    id: 'database-template-1',
    name: 'Database Template',
    description: 'Template for database deployments',
    repositoryUrl: 'https://github.com/org/db-repo',
    chartPath: '/charts/database',
    category: 'Database',
    isActive: true,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
  {
    id: 'application-template-1',
    name: 'Application Template',
    description: 'Template for application deployments',
    repositoryUrl: 'https://github.com/org/app-repo',
    chartPath: '/charts/application',
    category: 'Application',
    isActive: true,
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
  },
  {
    id: 'network-template-1',
    name: 'Network Template',
    description: 'Template for network configurations',
    repositoryUrl: 'https://github.com/org/net-repo',
    chartPath: '/charts/network',
    category: 'Network',
    isActive: true,
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z',
  },
  {
    id: 'generic-template-1',
    name: 'Generic Template',
    description: 'Generic template for testing',
    repositoryUrl: 'https://github.com/org/generic-repo',
    chartPath: '/charts/generic',
    category: 'Generic',
    isActive: true,
    createdAt: '2023-01-06T00:00:00Z',
    updatedAt: '2023-01-06T00:00:00Z',
  },
];
