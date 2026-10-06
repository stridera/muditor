'use client';

import Link from 'next/link';

import { useSiteContents } from '@/hooks/use-public-site';
import { formatDate } from '@/lib/mud-text';

// Landing-page strip: renders nothing unless there is news to show.
export function LatestNews() {
  const { items } = useSiteContents('NEWS');
  const latest = [...items]
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section
      aria-labelledby='latest-news'
      className='mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6'
    >
      <div className='mb-4 flex items-baseline justify-between'>
        <h2 id='latest-news' className='font-display text-2xl'>
          Latest news
        </h2>
        <Link href='/news' className='text-sm text-primary hover:underline'>
          All news
        </Link>
      </div>
      <ul className='grid gap-4 md:grid-cols-3'>
        {latest.map(n => (
          <li key={n.id}>
            <Link
              href={`/news/${encodeURIComponent(n.slug)}`}
              className='block h-full rounded-lg border border-border p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                {formatDate(n.publishedAt)}
              </p>
              <h3 className='mt-1 font-display text-lg'>{n.title}</h3>
              {n.summary && (
                <p className='mt-1 line-clamp-3 text-sm text-muted-foreground'>
                  {n.summary}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
