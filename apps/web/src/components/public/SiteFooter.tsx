import Link from 'next/link';

import { MUD_HOST, MUD_PORT, MUD_TLS_PORT } from './mud-config';

// package.json currently has only a placeholder repository URL, so no GitHub
// link is rendered. Set NEXT_PUBLIC_REPO_URL to enable it.
const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL;

export function SiteFooter() {
  return (
    <footer className='border-t border-border bg-card/40'>
      <div className='mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3'>
        <div>
          <p className='font-display text-lg font-semibold text-primary'>
            FieryMUD
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>
            A text-based world of fantasy, adventure, and roleplaying.
          </p>
        </div>

        <div>
          <h2 className='font-display text-sm font-semibold uppercase tracking-wider'>
            Connect
          </h2>
          <ul className='mt-3 space-y-1 text-sm text-muted-foreground'>
            <li>
              Telnet:{' '}
              <code className='font-mono text-foreground'>
                {MUD_HOST}:{MUD_PORT}
              </code>
            </li>
            <li>
              TLS:{' '}
              <code className='font-mono text-foreground'>
                {MUD_HOST}:{MUD_TLS_PORT}
              </code>
            </li>
            <li>
              <Link href='/play' className='text-primary hover:underline'>
                How to connect
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className='font-display text-sm font-semibold uppercase tracking-wider'>
            Community
          </h2>
          <ul className='mt-3 space-y-1 text-sm text-muted-foreground'>
            <li>
              <Link href='/rules' className='text-primary hover:underline'>
                Rules
              </Link>
            </li>
            <li>
              <Link href='/news' className='text-primary hover:underline'>
                Game news
              </Link>
            </li>
            {REPO_URL && (
              <li>
                <a
                  href={REPO_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  GitHub
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className='border-t border-border py-4 text-center text-xs text-muted-foreground'>
        &copy; {new Date().getFullYear()} FieryMUD &middot; Since 1996
      </div>
    </footer>
  );
}
