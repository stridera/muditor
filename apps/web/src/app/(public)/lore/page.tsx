import type { Metadata } from 'next';

import { PublicPageShell } from '@/components/public/PublicPageShell';
import { SiteContentList } from '@/components/public/SiteContentList';

export const metadata: Metadata = {
  title: 'Lore',
  description:
    'The history, geography, and legends of Ethilien, the world of FieryMUD.',
};

export default function Page() {
  return (
    <PublicPageShell
      title='Lore'
      subtitle='The history and legends of Ethilien.'
    >
      <SiteContentList
        kind='LORE'
        basePath='/lore'
        emptyText='No lore has been published yet.'
      />
    </PublicPageShell>
  );
}
