/**
 * Mock data for Git tree structures
 * This represents the directory structure for repositories
 */
export const gitTreeStructure = [
  // Repository 1 - web-templates main branch root directories
  {
    repositoryId: '1',
    branch: 'main',
    path: '/charts',
    name: 'charts',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },
  {
    repositoryId: '1',
    branch: 'main',
    path: '/docs',
    name: 'docs',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },

  // Repository 1 - web-templates main branch /charts subdirectories
  {
    repositoryId: '1',
    branch: 'main',
    path: '/charts/web-app',
    name: 'web-app',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '1',
    branch: 'main',
    path: '/charts/static-site',
    name: 'static-site',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },

  // Repository 1 - web-templates develop branch root directories
  {
    repositoryId: '1',
    branch: 'develop',
    path: '/charts',
    name: 'charts',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },
  {
    repositoryId: '1',
    branch: 'develop',
    path: '/docs',
    name: 'docs',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },

  // Repository 1 - web-templates develop branch /charts subdirectories
  {
    repositoryId: '1',
    branch: 'develop',
    path: '/charts/web-app',
    name: 'web-app',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '1',
    branch: 'develop',
    path: '/charts/static-site',
    name: 'static-site',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '1',
    branch: 'develop',
    path: '/charts/database',
    name: 'database',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },

  // Repository 2 - api-templates main branch root directories
  {
    repositoryId: '2',
    branch: 'main',
    path: '/charts',
    name: 'charts',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },
  {
    repositoryId: '2',
    branch: 'main',
    path: '/examples',
    name: 'examples',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },

  // Repository 2 - api-templates main branch /charts subdirectories
  {
    repositoryId: '2',
    branch: 'main',
    path: '/charts/api-service',
    name: 'api-service',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '2',
    branch: 'main',
    path: '/charts/api-gateway',
    name: 'api-gateway',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },

  // Repository 3 - database-templates main branch root directories
  {
    repositoryId: '3',
    branch: 'main',
    path: '/charts',
    name: 'charts',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },

  // Repository 3 - database-templates main branch /charts subdirectories
  {
    repositoryId: '3',
    branch: 'main',
    path: '/charts/mysql',
    name: 'mysql',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '3',
    branch: 'main',
    path: '/charts/postgresql',
    name: 'postgresql',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '3',
    branch: 'main',
    path: '/charts/mongodb',
    name: 'mongodb',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },

  // Repository 4 - infrastructure-templates main branch root directories
  {
    repositoryId: '4',
    branch: 'main',
    path: '/charts',
    name: 'charts',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },
  {
    repositoryId: '4',
    branch: 'main',
    path: '/terraform',
    name: 'terraform',
    type: 'directory',
    parentPath: null,
    isHelmChart: false,
  },

  // Repository 4 - infrastructure-templates main branch /charts subdirectories
  {
    repositoryId: '4',
    branch: 'main',
    path: '/charts/ingress-controller',
    name: 'ingress-controller',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
  {
    repositoryId: '4',
    branch: 'main',
    path: '/charts/monitoring',
    name: 'monitoring',
    type: 'directory',
    parentPath: '/charts',
    isHelmChart: true,
  },
];
