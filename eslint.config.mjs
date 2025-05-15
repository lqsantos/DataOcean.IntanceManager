import path from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create compatibility layer for eslintrc configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {},
});

// Import configs from eslintrc format
const eslintRecommended = compat.extends('eslint:recommended');
const tseslintRecommended = compat.extends('plugin:@typescript-eslint/recommended');
const nextRecommended = compat.extends('plugin:@next/next/recommended');
const reactRecommended = compat.extends('plugin:react/recommended');

export default [
  // Global ignores - Consolidated all ignore patterns here
  {
    ignores: [
      // Dependencies
      'node_modules/**',
      '.pnp/**',
      '.pnp.js',

      // Build outputs
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',

      // Cache
      '.vercel/**',
      '.swc/**',

      // Misc
      '.DS_Store',
      '*.pem',

      // Debug
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.pnpm-debug.log*',

      // Local env files
      '.env*.local',

      // TypeScript
      '*.tsbuildinfo',
      'next-env.d.ts',

      // Public directories
      'public/**',

      // User-specified directories to ignore
      'src/components/ui/**', // Ignoring src/components/ui directory
    ],
  },

  // Base configuration for all files
  {
    // Explicitly include files we want to lint
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],

    linterOptions: {
      reportUnusedDisableDirectives: true,
      noInlineConfig: false,
    },

    // Apply configs imported from eslintrc format
    ...eslintRecommended[0],
    ...tseslintRecommended[0],
    ...nextRecommended[0],
    ...reactRecommended[0],

    // Configure parser for TypeScript
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    // Configure plugins - Make sure all plugins are correctly added here
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
      'unused-imports': unusedImportsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },

    // Rules - enhanced for robust projects
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'error',

      // TypeScript
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Turn off in favor of unused-imports rule
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 5,
        },
      ],
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Imports
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',

      // General code quality
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'max-len': [
        'error',
        {
          code: 100,
          tabWidth: 2,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-nested-ternary': 'warn',
      'prefer-template': 'error',
      'no-param-reassign': 'error',
      'no-promise-executor-return': 'error',
      'no-useless-return': 'error',
      'prefer-spread': 'error',
      'array-callback-return': 'error',
      curly: ['error', 'all'],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
          typedefs: true,
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
      ],
    },

    // Settings
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  // Add a specific configuration for .mjs files
  {
    files: ['*.mjs'],
    rules: {},
    // Disable TypeScript parsing for .mjs files
    languageOptions: {
      parserOptions: {
        project: null, // Disable the TypeScript configuration for these files
      },
    },
  },
];
