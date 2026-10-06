import type { Metadata } from 'next';

import { SiteFooter } from '@/components/public/SiteFooter';
import { SiteNav } from '@/components/public/SiteNav';

export const metadata: Metadata = {
  title: { default: 'FieryMUD', template: '%s · FieryMUD' },
  description:
    'Fantasy, adventure, and roleplaying in the world of Ethilien. Connect and play FieryMUD.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground'
      >
        Skip to content
      </a>
      <SiteNav />
      <main id='main-content' className='flex flex-1 flex-col'>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
