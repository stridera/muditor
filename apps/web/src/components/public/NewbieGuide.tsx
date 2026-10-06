'use client';

import { Markdown } from './Markdown';
import { useSiteContent } from '@/hooks/use-public-site';

// Optional extra section: renders nothing while loading or if the page is
// unavailable, so the static connection info on /play remains the fallback.
export function NewbieGuide() {
  const { content } = useSiteContent('newbie-guide');
  if (!content) return null;
  return (
    <section aria-labelledby='newbie-guide'>
      <h2 id='newbie-guide' className='font-display text-2xl'>
        {content.title}
      </h2>
      <Markdown>{content.body}</Markdown>
    </section>
  );
}
