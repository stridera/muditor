import type { Metadata } from 'next';

import { SiteContentPage } from '@/components/public/SiteContentPage';

export const metadata: Metadata = {
  title: 'Rules',
  description: 'The rules of conduct every FieryMUD player agrees to follow.',
};

export default function Page() {
  return (
    <SiteContentPage slug='rules' fallbackTitle='Rules' expectedKind='PAGE' />
  );
}
