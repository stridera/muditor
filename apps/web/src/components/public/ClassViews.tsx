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
import {
  usePublicClassCircles,
  usePublicClasses,
  usePublicClassSkills,
} from '@/hooks/use-public-reference';
import { nameToSlug, titleCase } from '@/lib/mud-text';
import { HelpGuide } from './HelpGuide';
import { PublicPageShell } from './PublicPageShell';
import { EmptyState, QueryError, QueryLoading } from './QueryState';

export function ClassGrid() {
  const { classes, loading, error, refetch } = usePublicClasses();

  if (loading && classes.length === 0) return <QueryLoading />;
  if (error && classes.length === 0) {
    return <QueryError onRetry={() => void refetch()} />;
  }
  if (classes.length === 0) {
    return <EmptyState>No classes available.</EmptyState>;
  }

  const sorted = [...classes].sort((a, b) =>
    a.plainName.localeCompare(b.plainName)
  );

  return (
    <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {sorted.map(c => (
        <li key={c.id}>
          <Link
            href={`/classes/${nameToSlug(c.plainName)}`}
            className='group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <Card className='h-full transition-colors group-hover:border-primary'>
              <CardHeader>
                <CardTitle className='font-display'>{c.plainName}</CardTitle>
                <CardDescription>
                  {c.description || 'Hit dice ' + c.hitDice}
                </CardDescription>
                {c.primaryStat && (
                  <div className='pt-1'>
                    <Badge variant='secondary'>Primary: {c.primaryStat}</Badge>
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

function ClassAbilities({ classId }: { classId: number }) {
  const skills = usePublicClassSkills(classId);
  const circles = usePublicClassCircles(classId);

  const loading = skills.loading || circles.loading;
  const failed = !!(skills.error || circles.error);
  const retry = () => {
    void skills.refetch();
    void circles.refetch();
  };

  const sortedSkills = [...skills.skills].sort(
    (a, b) => a.minLevel - b.minLevel || a.skillName.localeCompare(b.skillName)
  );
  const sortedCircles = [...circles.circles]
    .map(c => ({
      ...c,
      spells: [...c.spells].sort((a, b) =>
        a.spellName.localeCompare(b.spellName)
      ),
    }))
    .sort((a, b) => a.circle - b.circle);

  return (
    <section aria-labelledby='class-abilities'>
      <h2 id='class-abilities' className='mb-4 font-display text-2xl'>
        Skills &amp; spells
      </h2>
      {loading && sortedSkills.length === 0 && sortedCircles.length === 0 ? (
        <QueryLoading />
      ) : failed && sortedSkills.length === 0 && sortedCircles.length === 0 ? (
        <QueryError onRetry={retry} />
      ) : sortedSkills.length === 0 && sortedCircles.length === 0 ? (
        <EmptyState>No skills or spells listed for this class.</EmptyState>
      ) : (
        <div className='space-y-8'>
          {sortedCircles.length > 0 && (
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Spells by circle</h3>
              <div className='grid gap-4 sm:grid-cols-2'>
                {sortedCircles.map(c => (
                  <div
                    key={c.id}
                    className='rounded-lg border border-border p-4'
                  >
                    <h4 className='mb-2 flex items-baseline justify-between font-medium'>
                      <span>Circle {c.circle}</span>
                      <span className='text-xs text-muted-foreground'>
                        Level {c.minLevel}
                      </span>
                    </h4>
                    {c.spells.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>
                        No spells.
                      </p>
                    ) : (
                      <ul className='space-y-1 text-sm'>
                        {c.spells.map(s => (
                          <li key={s.id} className='flex justify-between gap-2'>
                            <Link
                              href={`/help/${encodeURIComponent(s.spellName.toLowerCase())}`}
                              className='text-primary hover:underline'
                            >
                              {s.spellName}
                            </Link>
                            {s.minLevel != null && (
                              <span className='text-muted-foreground'>
                                Lvl {s.minLevel}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedSkills.length > 0 && (
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Skills</h3>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border text-left text-muted-foreground'>
                    <th className='py-2 pr-4 font-medium'>Skill</th>
                    <th className='py-2 pr-4 font-medium'>Category</th>
                    <th className='py-2 text-right font-medium'>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSkills.map(s => (
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
                        {s.category ? titleCase(s.category) : ''}
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {s.minLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function ClassDetail({ slug }: { slug: string }) {
  const { classes, loading, error, refetch } = usePublicClasses();
  const cls = classes.find(c => nameToSlug(c.plainName) === slug.toLowerCase());

  const back = (
    <Link
      href='/classes'
      className='mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline'
    >
      <ArrowLeft className='h-4 w-4' aria-hidden />
      All classes
    </Link>
  );

  if (loading && classes.length === 0) {
    return (
      <PublicPageShell title='Class'>
        <QueryLoading />
      </PublicPageShell>
    );
  }
  if (error && classes.length === 0) {
    return (
      <PublicPageShell title='Class'>
        {back}
        <QueryError onRetry={() => void refetch()} />
      </PublicPageShell>
    );
  }
  if (!cls) {
    return (
      <PublicPageShell title='Class'>
        {back}
        <QueryError message='This class could not be found.' />
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      title={cls.plainName}
      {...(cls.description ? { subtitle: cls.description } : {})}
    >
      {back}
      <div className='space-y-10'>
        <HelpGuide keyword={cls.plainName.toLowerCase()} />

        <section aria-labelledby='class-stats'>
          <h2 id='class-stats' className='mb-2 font-display text-2xl'>
            Class statistics
          </h2>
          <dl className='max-w-md'>
            <div className='flex justify-between gap-4 border-b border-border py-2 text-sm'>
              <dt className='text-muted-foreground'>Hit dice</dt>
              <dd className='font-mono font-medium'>{cls.hitDice}</dd>
            </div>
            {cls.primaryStat && (
              <div className='flex justify-between gap-4 border-b border-border py-2 text-sm'>
                <dt className='text-muted-foreground'>Primary stat</dt>
                <dd className='font-medium'>{cls.primaryStat}</dd>
              </div>
            )}
          </dl>
        </section>

        <ClassAbilities classId={Number(cls.id)} />
      </div>
    </PublicPageShell>
  );
}
