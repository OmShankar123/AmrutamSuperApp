const expoConfig = require('eslint-config-expo/flat.js');
const prettier = require('eslint-plugin-prettier/recommended');
const unistyles = require('eslint-plugin-react-native-unistyles');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = [
  {
    ignores: [
      '**/dist/*',
      '**/node_modules/*',
      '**/__tests__/*',
      '**/coverage/*',
      '**/.expo/*',
      '**/.expo-shared/*',
      '**/android/*',
      '**/ios/*',
      '**/.vscode/*',
      '**/docs/*',
      '**/expo-env.d.ts',
      '**/babel.config.js',
      '**/metro.config.js',
    ],
  },
  ...expoConfig,
  prettier,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      'react-native-unistyles': unistyles,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          paths: ['src'],
        },
      },
      'import/ignore': ['node_modules', '\\.(scss|css)$'],
    },
    rules: {
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-duplicates': 'off',
      'import/no-named-default': 'off',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000'], ['^react', '^@?\\w'], ['^@env', '^@/', '^'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'react-native-unistyles/no-unused-styles': 'error',
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',

      // RESTRICT REACT NATIVE STYLESHEET - MANDATE UNISTYLES
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['StyleSheet'],
              message:
                "Please use unistyles StyleSheet instead: import { StyleSheet } from 'react-native-unistyles'",
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create'] > ObjectExpression",
          message:
            'StyleSheet.create should use a callback function: StyleSheet.create((theme) => ({ ... }))',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['*.config.js', 'app.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
];
