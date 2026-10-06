'use client';

import { Markdown } from '@/components/public/Markdown';

/** Preview uses the same renderer as the public site (raw HTML is dropped). */
export function MarkdownPreview({ source }: { source: string }) {
  if (!source.trim()) {
    return (
      <p className='text-sm text-muted-foreground italic'>
        Nothing to preview yet.
      </p>
    );
  }
  return <Markdown>{source}</Markdown>;
}
