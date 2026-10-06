import type { Metadata } from 'next';

import { HelpEntryView } from '@/components/public/HelpEntryView';
import { safeDecode } from '@/lib/mud-text';

interface PageProps {
  params: Promise<{ keyword: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { keyword } = await params;
  return {
    title: `${safeDecode(keyword)} · Help`,
    description: `FieryMUD help file for ${safeDecode(keyword)}.`,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { keyword } = await params;
  const { id } = await searchParams;
  // `?id=` pins an exact entry; without it the keyword is looked up.
  const entryId = typeof id === 'string' && id !== '' ? id : undefined;
  return <HelpEntryView keyword={safeDecode(keyword)} id={entryId} />;
}
