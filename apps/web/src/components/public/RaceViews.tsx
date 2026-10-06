'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Race } from '@/generated/graphql';
import {
  usePublicRace,
  usePublicRaces,
  usePublicRaceSkills,
} from '@/hooks/use-public-reference';
import { findRaceBySlug, raceToSlug, titleCase } from '@/lib/mud-text';
import { HelpGuide } from './HelpGuide';
import { PublicPageShell } from './PublicPageShell';
import { EmptyState, QueryError, QueryLoading } from './QueryState';

export function RaceGrid() {
  const { races, loading, error, refetch } = usePublicRaces();

  if (loading && races.length === 0) return <QueryLoading />;
  if (error && races.length === 0) {
    return <QueryError onRetry={() => void refetch()} />;
  }
  if (races.length === 0) return <EmptyState>No races available.</EmptyState>;

  const sorted = [...races].sort((a, b) =>
    a.plainName.localeCompare(b.plainName)
  );

  return (
    <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {sorted.map(r => (
        <li key={r.race}>
          <Link
            href={`/races/${raceToSlug(r.race)}`}
            className='group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <Card className='h-full transition-colors group-hover:border-primary'>
              <CardHeader>
                <CardTitle className='font-display'>{r.plainName}</CardTitle>
                <CardDescription>
                  {titleCase(r.defaultSize)} size
                  {r.humanoid ? ', humanoid' : ''}
                  {r.magical ? ', magical' : ''}
                </CardDescription>
                {r.keywords && (
                  <div className='flex flex-wrap gap-1 pt-1'>
                    {r.keywords
                      .split(/\s+/)
                      .filter(Boolean)
                      .map(k => (
                        <Badge key={k} variant='secondary'>
                          {k}
                        </Badge>
                      ))}
                  </div>
                )}
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const STATS = [
  ['Strength', 'maxStrength'],
  ['Dexterity', 'maxDexterity'],
  ['Constitution', 'maxConstitution'],
  ['Intelligence', 'maxIntelligence'],
  ['Wisdom', 'maxWisdom'],
  ['Charisma', 'maxCharisma'],
] as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex justify-between gap-4 border-b border-border py-2 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='font-medium'>{value}</dd>
    </div>
  );
}

function pct(n: number) {
  return `${n}%`;
}

function RaceInnateSkills({ race }: { race: Race }) {
  const { skills, loading, error, refetch } = usePublicRaceSkills(race);
  const sorted = [...skills].sort((a, b) =>
    a.skillName.localeCompare(b.skillName)
  );

  return (
    <section aria-labelledby='race-skills'>
      <h2 id='race-skills' className='mb-4 font-display text-2xl'>
        Innate skills
      </h2>
      {loading && sorted.length === 0 ? (
        <QueryLoading />
      ) : error && sorted.length === 0 ? (
        <QueryError onRetry={() => void refetch()} />
      ) : sorted.length === 0 ? (
        <EmptyState>This race has no innate skills.</EmptyState>
      ) : (
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border text-left text-muted-foreground'>
              <th className='py-2 pr-4 font-medium'>Skill</th>
              <th className='py-2 pr-4 font-medium'>Category</th>
              <th className='py-2 text-right font-medium'>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => (
              <tr key={s.id} className='border-b border-border/50'>
                <td className='py-2 pr-4'>
                  <Link
                    href={`/help/${encodeURIComponent(s.skillName.toLowerCase())}`}
                    className='text-primary hover:underline'
                  >
                    {s.skillName}
                  </Link>
                </td>
                <td className='py-2 pr-4 text-muted-foreground'>
                  {titleCase(s.category)}
                </td>
                <td className='py-2 text-right font-mono'>
                  {s.bonus > 0 ? `+${s.bonus}` : s.bonus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const BACK_LINK = (
  <Link
    href='/races'
    className='mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline'
  >
    <ArrowLeft className='h-4 w-4' aria-hidden />
    All races
  </Link>
);

/** Validates the slug against the playable race list before querying detail. */
export function RaceDetail({ slug }: { slug: string }) {
  const { races, loading, error, refetch } = usePublicRaces();
  const match = findRaceBySlug(races, slug);

  if (!match) {
    return (
      <PublicPageShell title={titleCase(slug)}>
        {loading && races.length === 0 ? (
          <QueryLoading />
        ) : error && races.length === 0 ? (
          <>
            {BACK_LINK}
            <QueryError onRetry={() => void refetch()} />
          </>
        ) : (
          <>
            {BACK_LINK}
            <QueryError message='This race could not be found.' />
          </>
        )}
      </PublicPageShell>
    );
  }
  return <RaceDetailLoaded race={match.race} fallbackTitle={match.plainName} />;
}

function RaceDetailLoaded({
  race: raceId,
  fallbackTitle,
}: {
  race: Race;
  fallbackTitle: string;
}) {
  const { race, loading, error, refetch } = usePublicRace(raceId);
  const back = BACK_LINK;

  if (loading && !race) {
    return (
      <PublicPageShell title={fallbackTitle}>
        <QueryLoading />
      </PublicPageShell>
    );
  }
  if (error || !race) {
    return (
      <PublicPageShell title={fallbackTitle}>
        {back}
        <QueryError
          message={error ? undefined : 'This race could not be found.'}
          onRetry={() => void refetch()}
        />
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      title={race.plainName}
      subtitle={`${titleCase(race.defaultSize)} ${
        race.humanoid ? 'humanoid' : 'creature'
      }`}
    >
      {back}
      <div className='space-y-10'>
        <HelpGuide keyword={race.plainName.toLowerCase()} />

        <div className='grid gap-8 md:grid-cols-2'>
          <section aria-labelledby='race-overview'>
            <h2 id='race-overview' className='mb-2 font-display text-2xl'>
              Overview
            </h2>
            <dl>
              <Row label='Size' value={titleCase(race.defaultSize)} />
              <Row label='Humanoid' value={race.humanoid ? 'Yes' : 'No'} />
              <Row label='Magical' value={race.magical ? 'Yes' : 'No'} />
              <Row
                label='Life force'
                value={titleCase(race.defaultLifeforce)}
              />
              <Row label='Alignment' value={titleCase(race.raceAlign)} />
              <Row label='Experience factor' value={pct(race.expFactor)} />
              <Row label='Hit point factor' value={pct(race.hpFactor)} />
              <Row label='Focus bonus' value={race.focusBonus} />
            </dl>
          </section>

          <section aria-labelledby='race-stats'>
            <h2 id='race-stats' className='mb-2 font-display text-2xl'>
              Maximum attributes
            </h2>
            <dl>
              {STATS.map(([label, key]) => (
                <Row key={key} label={label} value={race[key]} />
              ))}
            </dl>
          </section>
        </div>

        <RaceInnateSkills race={race.race} />
      </div>
    </PublicPageShell>
  );
}
