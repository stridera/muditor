// eslint-disable-next-line @typescript-eslint/no-require-imports -- Next config runs in CJS
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

// Origins the browser may talk to besides this site: the API (HTTP) and its
// GraphQL subscription socket (ws/wss), taken from the same env the client uses.
function apiConnectSources() {
  const sources = new Set();
  for (const raw of [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_GRAPHQL_URL,
    'http://localhost:3001',
  ]) {
    if (!raw) continue;
    try {
      const u = new URL(raw);
      sources.add(u.origin);
      sources.add(`${u.protocol === 'https:' ? 'wss:' : 'ws:'}//${u.host}`);
    } catch {
      // ignore malformed env values
    }
  }
  return [...sources];
}

// 'unsafe-inline' for scripts: Next injects inline bootstrap/hydration scripts,
// and a nonce would need middleware that forces every page to render
// dynamically. Revisit if the app moves to nonce-based CSP.
function contentSecurityPolicy() {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      ...apiConnectSources(),
      ...(isDev ? ['ws:', 'wss:'] : []),
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy() },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  // Other Next.js config options can be added here
};

module.exports = nextConfig;
