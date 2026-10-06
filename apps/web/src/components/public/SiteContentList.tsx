'use client';

import Link from 'next/link';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SiteContentKind } from '@/generated/graphql';
import { useSiteContents } from '@/hooks/use-public-site';
import { formatDate } from '@/lib/mud-text';
import { EmptyState, QueryError, QueryLoading } from './QueryState';

interface SiteContentListProps {
  kind: SiteContentKind;
  basePath: string;
  emptyText: string;
  showDate?: boolean;
}

export function SiteContentList({
  kind,
  basePath,
  emptyText,
  showDate,
}: SiteContentListProps) {
  const { items, loading, error, refetch } = useSiteContents(kind);

  if (loading && items.length === 0) return <QueryLoading />;
  if (error && items.length === 0) {
    return <QueryError onRetry={() => void refetch()} />;
  }
  if (items.length === 0) return <EmptyState>{emptyText}</EmptyState>;

  const sorted = [...items].sort((a, b) => {
    if (kind === 'NEWS') {
      return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
    }
    return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);
  });

  return (
    <ul className='grid gap-4'>
      {sorted.map(item => (
        <li key={item.id}>
          <Link
            href={`${basePath}/${encodeURIComponent(item.slug)}`}
            className='group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <Card className='transition-colors group-hover:border-primary'>
              <CardHeader>
                {showDate && item.publishedAt && (
                  <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                    {formatDate(item.publishedAt)}
                  </p>
                )}
                <CardTitle className='font-display'>{item.title}</CardTitle>
                {item.summary && (
                  <CardDescription>{item.summary}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
