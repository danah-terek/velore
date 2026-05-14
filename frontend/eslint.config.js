import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.vite', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Keep core hooks safety, but avoid overly strict rules that
      // don’t match existing patterns in this repo.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',

      // Repo exports non-component helpers in many files.
      'react-refresh/only-export-components': 'off',
    },
  },
  // Admin code is legacy / more permissive.
  {
    files: ['src/components/admin/**/*.{js,jsx}', 'src/features/admin/**/*.{js,jsx}', 'src/pages/Admin*.{js,jsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'no-unused-vars': 'off',
    },
  },
])
