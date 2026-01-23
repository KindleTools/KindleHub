import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' }

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Ignore patterns
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/auto-imports.d.ts',
      '**/components.d.ts',
      '**/typed-router.d.ts',
      '**/coverage/**'
    ]
  },

  // Base ESLint rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Vue 3 recommended rules (includes essential + strongly-recommended + recommended)
  ...vue.configs['flat/recommended'],

  // Stylistic rules (replaces Prettier)
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false,
    arrowParens: true,
    braceStyle: '1tbs',
    blockSpacing: true,
    quoteProps: 'as-needed',
    commaDangle: 'never'
  }),

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
        ...autoImportGlobals.globals
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },

  // Vue file settings
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },

  // Custom rules
  {
    rules: {
      // Console logs allowed in development
      'no-console': 'off',

      // TypeScript specific
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // Vue specific
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': ['warn', {
        singleline: 3,
        multiline: 1
      }],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always'
        }
      }],

      // Stylistic overrides to match previous Biome config
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/operator-linebreak': ['error', 'after', {
        overrides: { '?': 'before', ':': 'before' }
      }]
    }
  }
]
