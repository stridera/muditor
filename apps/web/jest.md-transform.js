// Jest transform for `import guide from '*.md'`: export the raw file text,
// mirroring the `asset/source` webpack rule in next.config.js.
module.exports = {
  process(sourceText) {
    return { code: `module.exports = ${JSON.stringify(sourceText)};` };
  },
};
