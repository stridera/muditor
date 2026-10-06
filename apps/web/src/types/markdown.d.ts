// Markdown files are bundled as raw strings (see next.config.js and
// jest.config.js).
declare module '*.md' {
  const content: string;
  export default content;
}
