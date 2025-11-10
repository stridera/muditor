module.exports = {
  client: {
    service: {
      name: 'muditor-api',
      // Point to your local GraphQL endpoint
      url: 'http://localhost:4000/graphql',
      // Alternative: use introspection from schema file
      // localSchemaFile: './apps/api/src/schema.gql',
    },
    includes: ['./apps/web/src/**/*.{ts,tsx}', './apps/api/src/**/*.{ts,tsx}'],
    excludes: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/dist/**',
      '**/build/**',
    ],
  },
};
