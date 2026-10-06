'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { usePublicHelpEntry } from '@/hooks/use-public-help';
import { stripMudMarkup, titleCase } from '@/lib/mud-text';
import { PublicPageShell } from './PublicPageShell';
import { QueryError, QueryLoading } from './QueryState';

const BACK = (
  <Link
    href='/help'
    className='mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline'
  >
    <ArrowLeft className='h-4 w-4' aria-hidden />
    Back to help search
  </Link>
);

function isNotFound(message?: string) {
  return !!message && /not found|no help/i.test(message);
}

export function HelpEntryView({
  keyword,
  id,
}: {
  keyword: string;
  id?: string | undefined;
}) {
  const { entry, loading, error, refetch } = usePublicHelpEntry(keyword, id);

  if (loading && !entry) {
    return (
      <PublicPageShell title={keyword} subtitle='Help file.'>
        <QueryLoading />
      </PublicPageShell>
    );
  }

  if (error || !entry) {
    const missing = !error || isNotFound(error.message);
    return (
      <PublicPageShell title={keyword} subtitle='Help file.'>
        {BACK}
        {missing ? (
          <QueryError
            message={`No help file found for "${keyword}". Try searching for a related topic.`}
          />
        ) : (
          <QueryError onRetry={refetch} />
        )}
      </PublicPageShell>
    );
  }

  const meta: Array<[string, string]> = [];
  if (entry.category) meta.push(['Category', titleCase(entry.category)]);
  if (entry.sphere) meta.push(['Sphere', titleCase(entry.sphere)]);
  if (entry.duration) meta.push(['Duration', entry.duration]);

  return (
    <PublicPageShell title={stripMudMarkup(entry.title)} subtitle='Help file.'>
      {BACK}
      <div className='space-y-6'>
        {entry.keywords.length > 0 && (
          <ul className='flex flex-wrap gap-2' aria-label='Keywords'>
            {entry.keywords.map(k => (
              <li key={k}>
                <Link href={`/help/${encodeURIComponent(k)}`}>
                  <Badge variant='secondary'>{k}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {meta.length > 0 && (
          <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm'>
            {meta.map(([k, v]) => (
              <div key={k} className='contents'>
                <dt className='text-muted-foreground'>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {entry.usage && (
          <section aria-labelledby='help-usage'>
            <h2 id='help-usage' className='mb-2 font-display text-lg'>
              Usage
            </h2>
            <pre className='overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm'>
              {stripMudMarkup(entry.usage)}
            </pre>
          </section>
        )}

        <pre className='overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-muted p-4 font-mono text-sm leading-6'>
          {stripMudMarkup(entry.content)}
        </pre>
      </div>
    </PublicPageShell>
  );
}
