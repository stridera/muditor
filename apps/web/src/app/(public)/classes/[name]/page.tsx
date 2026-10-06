import type { Metadata } from 'next';

import { ClassDetail } from '@/components/public/ClassViews';
import { safeDecode } from '@/lib/mud-text';

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${safeDecode(name)} · Classes`,
    description: `FieryMUD class reference: ${safeDecode(name)}.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { name } = await params;
  return <ClassDetail slug={safeDecode(name)} />;
}
