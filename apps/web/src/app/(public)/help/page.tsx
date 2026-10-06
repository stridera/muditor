import type { Metadata } from 'next';

import { HelpBrowser } from '@/components/public/HelpBrowser';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Help',
  description:
    'Search the FieryMUD help files: commands, spells, skills, classes, races, and areas.',
};

export default function Page() {
  return (
    <PublicPageShell title='Help' subtitle='Searchable in-game help files.'>
      <HelpBrowser />
    </PublicPageShell>
  );
}
