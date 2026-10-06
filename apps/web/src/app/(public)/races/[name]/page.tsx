import type { Metadata } from 'next';

import { RaceDetail } from '@/components/public/RaceViews';
import { safeDecode } from '@/lib/mud-text';

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${safeDecode(name)} · Races`,
    description: `FieryMUD race reference: ${safeDecode(name)}.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { name } = await params;
  return <RaceDetail slug={safeDecode(name)} />;
}
