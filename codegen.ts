import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Point to your GraphQL API
  schema: './apps/api/src/schema.gql',

  // Find all GraphQL queries/mutations in your frontend
  documents: [
    'apps/web/src/**/*.tsx',
    'apps/web/src/**/*.ts',
    'apps/web/src/**/*.graphql',
  ],

  // Generate types
  generates: {
    // Generate types for the web app using client preset (modern recommended approach)
    './apps/web/src/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
        gqlTagName: 'gql',
      },
      config: {
        useTypeImports: true,
        skipTypename: false,
        enumsAsTypes: true,
        dedupeFragments: true,
        avoidOptionals: false,
      },
    },
  },

  // Watch mode for development
  watch: false,

  // Show errors clearly
  verbose: true,

  // Don't exit on errors during development
  ignoreNoDocuments: true,
};

export default config;
