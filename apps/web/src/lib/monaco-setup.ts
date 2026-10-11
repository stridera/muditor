// Self-hosted Monaco. @monaco-editor/react defaults to loading Monaco from
// cdn.jsdelivr.net, which the site CSP (script-src 'self') blocks. Importing the
// npm package and handing it to the loader serves everything from our origin.
// Browser-only: import this module lazily (see MonacoEditor.tsx).
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Only the base editor worker is needed: Lua is a Monarch (main-thread)
// language here, and no TS/JSON/CSS/HTML models are created.
(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker: () =>
    new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url)
    ),
};

loader.config({ monaco });

export { monaco };
