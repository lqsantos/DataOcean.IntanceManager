import eslintPluginNext from '@next/eslint-plugin-next'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'

export default [
  {
    plugins: {
      '@next/next': eslintPluginNext,
      import: eslintPluginImport,
      'unused-imports': eslintPluginUnusedImports,
    },
    rules: {
      // Regras recomendadas do Next.js
      ...eslintPluginNext.configs.recommended.rules,

      // Limpeza de imports não utilizados
      'unused-imports/no-unused-imports': 'warn',

      // Organização de imports
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
    },
  },
]
