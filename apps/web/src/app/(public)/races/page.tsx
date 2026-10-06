import type { Metadata } from 'next';

import { PublicPageShell } from '@/components/public/PublicPageShell';
import { RaceGrid } from '@/components/public/RaceViews';

export const metadata: Metadata = {
  title: 'Races',
  description:
    'Choose your people: the playable races of FieryMUD and their attributes.',
};

export default function Page() {
  return (
    <PublicPageShell
      title='Races'
      subtitle='The peoples of Ethilien you can play.'
    >
      <RaceGrid />
    </PublicPageShell>
  );
}
