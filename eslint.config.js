// Using ES Modules syntax

import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginSvelte from 'eslint-plugin-svelte'

export default [
  'eslint:recommended',
  ...eslintPluginSvelte.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es6,
        ...globals.commonjs,
      },
    },
  },
  {
    files: ['sub/*.js'],
    rules: {
      'no-undef': 'warn',
      'no-console': 'warn',
    },
  },
  {
    files: ['*.ts', '**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
    },
    rules: {
      semi: 'off',
      '@typescript-eslint/semi': 'error',
      'no-extra-semi': 'warn',
      curly: 'warn',
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      eqeqeq: 'error',
      indent: 'off',
      '@typescript-eslint/indent': ['warn', 'tab', { SwitchCase: 1 }],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
]
