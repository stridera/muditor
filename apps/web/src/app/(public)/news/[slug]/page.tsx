import type { Metadata } from 'next';

import { SiteContentPage } from '@/components/public/SiteContentPage';
import { safeDecode } from '@/lib/mud-text';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${safeDecode(slug)} · News`,
    description: 'FieryMUD news article.',
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
    <SiteContentPage
      slug={safeDecode(slug)}
      expectedKind='NEWS'
      fallbackTitle='News'
      back={{ href: '/news', label: 'Back to news' }}
      showDate
    />
  );
}
