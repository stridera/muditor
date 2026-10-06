'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import type { SiteContentKind } from '@/generated/graphql';
import { useSiteContent } from '@/hooks/use-public-site';
import { formatDate } from '@/lib/mud-text';
import { Markdown } from './Markdown';
import { PublicPageShell } from './PublicPageShell';
import { QueryError, QueryLoading } from './QueryState';

interface SiteContentPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  back?: { href: string; label: string };
  showDate?: boolean;
  /** Content of any other kind is treated as not found. */
  expectedKind: SiteContentKind;
}

function notFound(message?: string) {
  return !!message && /not found|does not exist/i.test(message);
}

export function SiteContentPage({
  slug,
  fallbackTitle,
  fallbackSubtitle,
  back,
  showDate,
  expectedKind,
}: SiteContentPageProps) {
  const { content: found, loading, error, refetch } = useSiteContent(slug);
  const content = found && found.kind === expectedKind ? found : null;

  const backLink = back && (
    <Link
      href={back.href}
      className='mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline'
    >
      <ArrowLeft className='h-4 w-4' aria-hidden />
      {back.label}
    </Link>
  );

  if (loading && !found) {
    return (
      <PublicPageShell title={fallbackTitle}>
        <QueryLoading />
      </PublicPageShell>
    );
  }

  if ((error && !found) || !content) {
    return (
      <PublicPageShell title={fallbackTitle}>
        {backLink}
        {(error ? notFound(error.message) : true) ? (
          <QueryError message='This page could not be found.' />
        ) : (
          <QueryError onRetry={() => void refetch()} />
        )}
      </PublicPageShell>
    );
  }

  const date = showDate ? formatDate(content.publishedAt) : '';
  const subtitle = [date, content.summary ?? fallbackSubtitle]
    .filter(Boolean)
    .join(' · ');

  return (
    <PublicPageShell title={content.title} {...(subtitle ? { subtitle } : {})}>
      {backLink}
      <Markdown>{content.body}</Markdown>
    </PublicPageShell>
  );
}
