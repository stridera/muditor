'use client';

import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

// Monaco touches `window` at import time, so the self-hosted setup and the
// editor are loaded client-side only.
const MonacoReact = dynamic(
  async () => {
    await import('@/lib/monaco-setup');
    return Editor;
  },
  {
    ssr: false,
    loading: () => (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
      </div>
    ),
  }
);

export default function MonacoEditor(props: ComponentProps<typeof Editor>) {
  return <MonacoReact {...props} />;
}
