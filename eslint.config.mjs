// @ts-check
// Flat ESLint config (ESLint v9) replacing legacy .eslintrc.* discovery.
// Mirrors previous rules while adding TypeScript + React support.
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  // Ignore patterns (taken from prior .eslintrc.json)
  { ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      '*.config.js',
      '*.config.mjs',
      '**/*.d.ts'
    ]
  },
  // Base JS recommended
  eslint.configs.recommended,
  // TypeScript (non type-checked for speed in pre-commit)
  ...tseslint.configs.recommended,
  // (Prettier handled separately via lint-staged; plugin removed for faster commits)
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      // From original root config
  'no-unused-vars': 'off', // disable base to rely on TS version
  '@typescript-eslint/no-unused-vars': ['warn', { args: 'after-used', ignoreRestSiblings: true }],
      'no-console': 'off',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-empty-object-type': 'warn',
  'no-case-declarations': 'warn',
  'no-useless-escape': 'warn',
      // React / hooks quality
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
);

// NOTE:
// 1. If you need full type-aware linting, replace the TS config spread with:
//    ...tseslint.configs.recommendedTypeChecked,
//    and add parserOptions:{ projectService:true, tsconfigRootDir: import.meta.dirname }
//    (will slow pre-commit).
// 2. Remove legacy .eslintrc.json files once everything is green.
