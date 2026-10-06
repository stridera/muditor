import type { Metadata } from 'next';

import { PublicPageShell } from '@/components/public/PublicPageShell';
import { SiteContentList } from '@/components/public/SiteContentList';

export const metadata: Metadata = {
  title: 'News',
  description: 'Announcements and updates from the FieryMUD staff.',
};

export default function Page() {
  return (
    <PublicPageShell title='News' subtitle='Announcements and updates.'>
      <SiteContentList
        kind='NEWS'
        basePath='/news'
        emptyText='No news has been posted yet.'
        showDate
      />
    </PublicPageShell>
  );
}
