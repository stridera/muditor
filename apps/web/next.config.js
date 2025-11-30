/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only run ESLint on these directories during `next build` and `next lint`
    dirs: ['src'],
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: false,
  },
  experimental: {
    // Enable experimental features if needed
  },
  // Proxy GraphQL requests to API server
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: 'http://api:4000/graphql', // Uses Docker network service name
      },
    ];
  },
  // Other Next.js config options can be added here
};

module.exports = nextConfig;
