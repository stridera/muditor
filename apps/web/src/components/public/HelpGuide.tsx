'use client';

import Link from 'next/link';

import { useHelpGuide } from '@/hooks/use-public-reference';
import { stripMudMarkup } from '@/lib/mud-text';

export function HelpGuide({ keyword }: { keyword: string }) {
  const entry = useHelpGuide(keyword);
  if (!entry || !entry.content.trim()) return null;
  return (
    <section aria-labelledby='guide'>
      <h2 id='guide' className='mb-2 font-display text-2xl'>
        In-game guide
      </h2>
      <pre className='overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-muted p-4 font-mono text-sm leading-6'>
        {stripMudMarkup(entry.content)}
      </pre>
      <p className='mt-2 text-sm'>
        <Link
          href={`/help/${encodeURIComponent(entry.keywords[0] ?? keyword)}?id=${encodeURIComponent(entry.id)}`}
          className='text-primary hover:underline'
        >
          Open full help file
        </Link>
      </p>
    </section>
  );
}
