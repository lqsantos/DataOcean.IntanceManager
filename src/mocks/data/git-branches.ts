/**
 * Mock data for Git branches
 */
export const gitBranches = [
  // Repository 1 branches
  {
    repositoryId: '1',
    name: 'main',
    isDefault: true,
  },
  {
    repositoryId: '1',
    name: 'develop',
    isDefault: false,
  },
  {
    repositoryId: '1',
    name: 'feature/new-templates',
    isDefault: false,
  },

  // Repository 2 branches
  {
    repositoryId: '2',
    name: 'main',
    isDefault: true,
  },
  {
    repositoryId: '2',
    name: 'release/v2',
    isDefault: false,
  },

  // Repository 3 branches
  {
    repositoryId: '3',
    name: 'main',
    isDefault: true,
  },
  {
    repositoryId: '3',
    name: 'develop',
    isDefault: false,
  },

  // Repository 4 branches
  {
    repositoryId: '4',
    name: 'main',
    isDefault: true,
  },
  {
    repositoryId: '4',
    name: 'feature/terraform-templates',
    isDefault: false,
  },
];
