/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{js,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Markdown help guides are imported as raw strings.
  transform: {
    '\\.md$': '<rootDir>/jest.md-transform.js',
  },
  testTimeout: 10000, // 10 seconds for API calls
};

// react-markdown and the unified/remark/micromark packages it pulls in are
// ESM-only, which Jest cannot load untransformed. next/jest always ignores
// node_modules, so un-ignore these packages after the config is resolved.
const esmPackages = [
  'react-markdown',
  'remark-.*',
  'rehype-.*',
  'unified',
  'bail',
  'trough',
  'devlop',
  'is-plain-obj',
  'vfile.*',
  'unist-.*',
  'mdast-util-.*',
  'micromark.*',
  'hast-util-.*',
  'estree-util-.*',
  'html-url-attributes',
  'property-information',
  'space-separated-tokens',
  'comma-separated-tokens',
  'decode-named-character-reference',
  'character-entities.*',
  'ccount',
  'escape-string-regexp',
  'markdown-table',
  'longest-streak',
  'trim-lines',
  'zwitch',
  'stringify-entities',
];

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    // Bun nests packages under node_modules/.bun/<pkg>@<ver>/node_modules/.
    `/node_modules/(?!(\\.bun/[^/]+/node_modules/)?(${esmPackages.join('|')})/)`,
    // Keep next/jest's other patterns (CSS modules) but drop its blanket
    // node_modules ignores, which would re-ignore the packages above.
    ...config.transformIgnorePatterns.filter(
      p => !p.startsWith('/node_modules/')
    ),
  ];
  return config;
};
