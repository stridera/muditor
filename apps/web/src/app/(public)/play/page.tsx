import type { Metadata } from 'next';
import Link from 'next/link';

import { NewbieGuide } from '@/components/public/NewbieGuide';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import {
  MUD_HOST,
  MUD_PORT,
  MUD_TLS_PORT,
} from '@/components/public/mud-config';

export const metadata: Metadata = { title: 'Play' };

const CLIENTS = [
  {
    name: 'Mudlet',
    href: 'https://www.mudlet.org/',
    note: 'Free, cross-platform, scriptable. Best all-round choice.',
  },
  {
    name: 'TinTin++',
    href: 'https://tintin.mudhalla.net/',
    note: 'Powerful terminal client for Linux, macOS, and Windows.',
  },
  {
    name: 'Blightmud',
    href: 'https://github.com/Blightmud/Blightmud',
    note: 'Modern terminal client with Lua scripting and TLS.',
  },
  {
    name: 'Plain telnet',
    href: 'https://en.wikipedia.org/wiki/Telnet',
    note: 'Works anywhere, but no colour triggers or scripting.',
  },
] as const;

export default function PlayPage() {
  return (
    <PublicPageShell
      title='Play FieryMUD'
      subtitle='Connect with any MUD client. Encrypted TLS is recommended.'
    >
      <div className='space-y-10'>
        <section aria-labelledby='connect'>
          <h2 id='connect' className='font-display text-2xl'>
            Connection details
          </h2>
          <dl className='mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm'>
            <dt className='text-muted-foreground'>Host</dt>
            <dd className='font-mono'>{MUD_HOST}</dd>
            <dt className='text-muted-foreground'>
              TLS port{' '}
              <span className='font-medium text-primary'>(recommended)</span>
            </dt>
            <dd className='font-mono'>{MUD_TLS_PORT}</dd>
            <dt className='text-muted-foreground'>Plain port</dt>
            <dd className='font-mono'>{MUD_PORT}</dd>
          </dl>

          <h3 className='mt-6 font-medium'>Recommended: encrypted (TLS)</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            In Mudlet, tick &ldquo;Secure&rdquo; when adding the profile. In
            TinTin++, use <code>#ssl</code>. The classic <code>telnet</code>{' '}
            command does not speak TLS, so use a MUD client for this port.
          </p>
          <pre className='mt-2 overflow-x-auto rounded-md border border-border bg-muted p-4 font-mono text-sm'>
            <code>{`#ssl {fiery} {${MUD_HOST}} {${MUD_TLS_PORT}}`}</code>
          </pre>

          <h3 className='mt-6 font-medium'>Fallback: plain telnet</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            <strong>Unencrypted.</strong> Anything you type, including
            passwords, crosses the network in the clear. Use this only if your
            client cannot do TLS.
          </p>
          <pre className='mt-2 overflow-x-auto rounded-md border border-border bg-muted p-4 font-mono text-sm'>
            <code>{`telnet ${MUD_HOST} ${MUD_PORT}`}</code>
          </pre>
        </section>

        <section aria-labelledby='clients'>
          <h2 id='clients' className='font-display text-2xl'>
            Recommended clients
          </h2>
          <ul className='mt-4 space-y-3'>
            {CLIENTS.map(c => (
              <li key={c.name}>
                <a
                  href={c.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary hover:underline'
                >
                  {c.name}
                </a>
                <span className='text-muted-foreground'> &mdash; {c.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='first-five'>
          <h2 id='first-five' className='font-display text-2xl'>
            Your first five minutes
          </h2>
          <ol className='mt-4 list-decimal space-y-2 pl-6'>
            <li>
              Create an account on this site:{' '}
              <Link href='/register' className='text-primary hover:underline'>
                register
              </Link>
              .
            </li>
            <li>Connect with your client and type your character name.</li>
            <li>
              At the password prompt, type <code>code</code> and approve the
              login at{' '}
              <Link href='/verify' className='text-primary hover:underline'>
                /verify
              </Link>
              , or type your game password.
            </li>
            <li>
              Pick a race and class. Browse the{' '}
              <Link href='/races' className='text-primary hover:underline'>
                races
              </Link>{' '}
              and{' '}
              <Link href='/classes' className='text-primary hover:underline'>
                classes
              </Link>{' '}
              first.
            </li>
            <li>Read the newbie guide below.</li>
          </ol>
        </section>

        <section aria-labelledby='passwords'>
          <h2 id='passwords' className='font-display text-2xl'>
            Passwords
          </h2>
          <p className='mt-4 text-sm text-muted-foreground'>
            Your website password and your game password are separate, and the
            game never accepts your website password. Set your game password in{' '}
            <Link href='/profile' className='text-primary hover:underline'>
              your account settings
            </Link>
            , or skip it and approve each login with a code.
          </p>
        </section>

        <NewbieGuide />
      </div>
    </PublicPageShell>
  );
}
