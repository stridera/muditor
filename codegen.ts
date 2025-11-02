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
        // Disable newer Apollo Client features not available in v4.0.4
        withRefetchFn: false,
        // Explicitly specify which hooks to generate (exclude Suspense)
        withQuery: true,
        withMutation: true,
        withLazyQuery: true,
        // Don't generate Suspense-related hooks
        withSuspenseQuery: false,
        // Other options
        exposeQueryKeys: true,
        exposeFetcher: true,
        skipTypename: false,
        addDocBlocks: false,
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
