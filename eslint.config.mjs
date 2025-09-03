import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  // Base JavaScript config
  js.configs.recommended,

  // Global settings
  {
    ignores: [
      '**/lib/generated/**',
      'node_modules/',
      '.next/',
      'dist/',
      'build/',
      '*.config.js',
      '*.config.ts',
      '**/*.d.ts',
      'coverage/'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    settings: {
      next: {
        rootDir: __dirname
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    }
  },

  // Next.js rules
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'off',
      '@next/next/no-document-import-in-page': 'off'
    }
  },

  // TypeScript rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          argsIgnorePattern: '^_', 
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false }
      ],
      // Add strict type safety rules
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error'
    }
  },

  // React rules
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },

  // Import rules with strict ordering
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',      // Node.js built-in modules
            'external',     // External packages (react, next, etc.)
            'internal',     // Internal aliased imports (@/*)
            'parent',       // Relative parent imports
            'sibling',      // Relative sibling imports
            'index',        // Index imports
            'object'        // Object imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
            orderImportKind: 'asc'
          },
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before'
            },
            {
              pattern: '@prisma/**',
              group: 'external',
              position: 'before'
            },
            {
              pattern: '@/lib/**',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '@/utils/**',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '@/app/**',
              group: 'internal'
            },
            {
              pattern: '@/components/**',
              group: 'internal'
            },
            {
              pattern: '@/hooks/**',
              group: 'internal'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          distinctGroup: false
        }
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-default-export': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-webpack-loader-syntax': 'error'
    }
  },

  // Additional project-specific rules
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'prefer-const': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'quotes': ['error', 'single', { 
        avoidEscape: true, 
        allowTemplateLiterals: true 
      }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'only-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }]
    }
  },

  // Server-side files overrides (more permissive)
  {
    files: [
      '**/api/**/*.ts',
      '**/route.ts',
      '**/server.ts',
      '**/lib/**/*.ts',
      '**/utils/**/*.ts'
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },

  // Test files overrides
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },

  // Compatibility layer for legacy configs
  ...compat.config({
    extends: [
      'plugin:react/recommended',
      'plugin:react/jsx-runtime'
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    }
  })
]