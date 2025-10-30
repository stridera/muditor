import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Point to your GraphQL API
  schema: 'http://localhost:4000/graphql',

  // Find all GraphQL queries/mutations in your frontend
  documents: ['apps/web/src/**/*.tsx', 'apps/web/src/**/*.ts'],

  // Generate types
  generates: {
    // Generate types for the web app
    './apps/web/src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        // Make hooks more type-safe
        withHooks: true,
        withHOC: false,
        withComponent: false,
        // Add useful React Query options
        exposeQueryKeys: true,
        exposeFetcher: true,
        // Make the generated code easier to read
        skipTypename: false,
        // Add comments from GraphQL schema
        addDocBlocks: true,
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
