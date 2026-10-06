// eslint-disable-next-line @typescript-eslint/no-require-imports -- Next config runs in CJS
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
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
  // Markdown help guides (src/content/help/*.md) are bundled as raw strings.
  webpack(config) {
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' });
    return config;
  },
  // Other Next.js config options can be added here
};

module.exports = nextConfig;
