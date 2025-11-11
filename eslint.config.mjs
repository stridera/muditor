// @ts-check
// Flat ESLint config (ESLint v9) replacing legacy .eslintrc.* discovery.
// Mirrors previous rules while adding TypeScript + React support.
import eslint from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore patterns (taken from prior .eslintrc.json)
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      '*.config.js',
      '*.config.mjs',
      '**/*.d.ts',
    ],
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
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      // From original root config
      'no-unused-vars': 'off', // disable base to rely on TS version
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'after-used', ignoreRestSiblings: true },
      ],
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      // Custom project rules
      // Discourage double-cast pattern which weakens type safety; allow in mappers temporarily via inline disable if needed.
      '@typescript-eslint/consistent-type-assertions': [
        'warn',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      // Flag chained unknown casts explicitly
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "TSAsExpression > TSAsExpression[typeAnnotation.typeName.name='unknown']",
          message:
            'Avoid as unknown as T double cast; introduce a proper intermediate type or mapper.',
        },
      ],
      // Require using LoggingService instead of raw console.* except in scripts or config
      'no-restricted-properties': [
        'warn',
        {
          object: 'console',
          property: 'log',
          message:
            'Use LoggingService (dependency-injected) for application logging.',
        },
        {
          object: 'console',
          property: 'error',
          message: 'Use LoggingService.error for structured errors.',
        },
        {
          object: 'console',
          property: 'warn',
          message: 'Use LoggingService.warn for structured warnings.',
        },
      ],
      // React / hooks quality
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  }
);

// NOTE:
// 1. If you need full type-aware linting, replace the TS config spread with:
//    ...tseslint.configs.recommendedTypeChecked,
//    and add parserOptions:{ projectService:true, tsconfigRootDir: import.meta.dirname }
//    (will slow pre-commit).
// 2. Remove legacy .eslintrc.json files once everything is green.
