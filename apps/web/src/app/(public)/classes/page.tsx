import type { Metadata } from 'next';

import { ClassGrid } from '@/components/public/ClassViews';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Classes',
  description: 'The character classes of FieryMUD, from warriors to mages.',
};

export default function Page() {
  return (
    <PublicPageShell
      title='Classes'
      subtitle='Pick the path your character will walk.'
    >
      <ClassGrid />
    </PublicPageShell>
  );
}
