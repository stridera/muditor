import type { Metadata } from 'next';
import Link from 'next/link';
import { Map, ScrollText, Swords, Users } from 'lucide-react';

import { LatestNews } from '@/components/public/LatestNews';
import { ServerStatusCard } from '@/components/public/ServerStatusCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: { absolute: 'FieryMUD · Fantasy, adventure, and roleplaying' },
  description:
    'FieryMUD is a text-based multiplayer fantasy game. Explore Ethilien, choose a race and class, and connect for free.',
};

const FEATURES = [
  {
    href: '/races',
    icon: Users,
    title: 'Races',
    desc: 'Choose your people and see how heritage shapes your strengths.',
  },
  {
    href: '/classes',
    icon: Swords,
    title: 'Classes',
    desc: 'From steel-clad warriors to scholars of the arcane.',
  },
  {
    href: '/world-map',
    icon: Map,
    title: 'World Map',
    desc: 'Explore every zone of Ethilien on the interactive map.',
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <section className='relative overflow-hidden border-b border-border'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 0%, hsl(var(--gold) / 0.14) 0%, transparent 70%)',
          }}
        />
        <div className='relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28'>
          <h1 className='font-display text-4xl font-semibold tracking-wide sm:text-6xl'>
            Fiery<span className='text-primary'>MUD</span>
          </h1>
          <p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl'>
            Fantasy, adventure, and roleplaying in the world of Ethilien
          </p>
          <div className='mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Button asChild size='lg'>
              <Link href='/play'>Connect now</Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/help'>
                <ScrollText className='mr-2 h-4 w-4' aria-hidden />
                Browse the help files
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className='mx-auto w-full max-w-6xl px-4 py-14 sm:px-6'>
        <h2 className='sr-only'>Explore the game</h2>
        <div className='grid gap-6 md:grid-cols-3'>
          {FEATURES.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className='group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              <Card className='h-full transition-colors group-hover:border-primary'>
                <CardHeader>
                  <Icon className='mb-2 h-7 w-7 text-primary' aria-hidden />
                  <CardTitle className='font-display'>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <LatestNews />

      <section className='mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6'>
        <div className='max-w-md'>
          <ServerStatusCard />
        </div>
      </section>
    </>
  );
}
