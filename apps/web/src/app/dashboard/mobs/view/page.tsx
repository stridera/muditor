'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { Button } from '@/components/ui/button';
import {
  GetMobDocument,
  type GetMobQuery,
  type GetMobQueryVariables,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function MobViewPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <MobViewContent />
    </PermissionGuard>
  );
}

function MobViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneParam = searchParams.get('zone');
  const idParam = searchParams.get('id');

  const zoneId = zoneParam ? parseInt(zoneParam) : null;
  const mobId = idParam ? parseInt(idParam) : null;

  // Redirect to list if missing parameters
  useEffect(() => {
    if (zoneId === null || mobId === null) {
      router.push('/dashboard/mobs');
    }
  }, [zoneId, mobId, router]);

  const { loading, error, data } = useQuery<GetMobQuery, GetMobQueryVariables>(
    GetMobDocument,
    {
      variables: { id: mobId!, zoneId: zoneId! },
      skip: zoneId === null || mobId === null,
    }
  );

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center py-12'>Loading mob details...</div>
      </div>
    );
  }

  if (error || !data?.mob) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center py-12 text-red-600'>
          Error loading mob: {error?.message || 'Mob not found'}
        </div>
      </div>
    );
  }

  const mob = data.mob;

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Link href={`/dashboard/mobs?zone=${zoneId}`}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to List
            </Button>
          </Link>
          <h1 className='text-3xl font-bold'>
            Mob #{mob.id} - <ColoredTextInline markup={mob.name} />
          </h1>
        </div>
        <Link href={`/dashboard/mobs/editor?zone=${zoneId}&id=${mobId}`}>
          <Button>
            <Edit className='w-4 h-4 mr-2' />
            Edit
          </Button>
        </Link>
      </div>

      {/* Mob Details Card */}
      <div className='bg-card border rounded-lg p-6 space-y-6'>
        {/* Basic Info */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Basic Information</h2>
          <dl className='grid grid-cols-2 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Zone
              </dt>
              <dd className='text-base'>{mob.zoneId}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>ID</dt>
              <dd className='text-base'>{mob.id}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Level
              </dt>
              <dd className='text-base'>{mob.level}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Role
              </dt>
              <dd className='text-base'>{mob.role}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Race
              </dt>
              <dd className='text-base'>{mob.race}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Gender
              </dt>
              <dd className='text-base'>{mob.gender}</dd>
            </div>
          </dl>
        </section>

        {/* Keywords */}
        <section>
          <h2 className='text-xl font-semibold mb-2'>Keywords</h2>
          <div className='flex flex-wrap gap-2'>
            {mob.keywords.map((kw, i) => (
              <span
                key={i}
                className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm'
              >
                {kw}
              </span>
            ))}
          </div>
        </section>

        {/* Descriptions */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Descriptions</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Room Description
              </h3>
              <p className='bg-muted p-3 rounded'>
                <ColoredTextInline markup={mob.roomDescription} />
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Examine Description
              </h3>
              <p className='bg-muted p-3 rounded'>
                <ColoredTextInline markup={mob.examineDescription} />
              </p>
            </div>
          </div>
        </section>

        {/* Combat Stats */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Combat Statistics</h2>
          <dl className='grid grid-cols-3 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                HP Dice
              </dt>
              <dd className='text-base font-mono'>{mob.hpDice}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Damage Dice
              </dt>
              <dd className='text-base font-mono'>{mob.damageDice}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Damage Type
              </dt>
              <dd className='text-base'>{mob.damageType}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Hit Roll
              </dt>
              <dd className='text-base'>{mob.hitRoll}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Armor Class
              </dt>
              <dd className='text-base'>{mob.armorClass}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Alignment
              </dt>
              <dd className='text-base'>{mob.alignment}</dd>
            </div>
          </dl>
        </section>

        {/* Advanced Combat Stats */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Advanced Combat</h2>
          <dl className='grid grid-cols-3 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Accuracy
              </dt>
              <dd className='text-base'>{mob.accuracy}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Attack Power
              </dt>
              <dd className='text-base'>{mob.attackPower}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Spell Power
              </dt>
              <dd className='text-base'>{mob.spellPower}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Penetration (Flat)
              </dt>
              <dd className='text-base'>{mob.penetrationFlat}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Penetration (%)
              </dt>
              <dd className='text-base'>{mob.penetrationPercent}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Evasion
              </dt>
              <dd className='text-base'>{mob.evasion}</dd>
            </div>
          </dl>
        </section>

        {/* Defense Stats */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Defense</h2>
          <dl className='grid grid-cols-3 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Armor Rating
              </dt>
              <dd className='text-base'>{mob.armorRating}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Damage Reduction (%)
              </dt>
              <dd className='text-base'>{mob.damageReductionPercent}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Soak
              </dt>
              <dd className='text-base'>{mob.soak}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Hardness
              </dt>
              <dd className='text-base'>{mob.hardness}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Ward (%)
              </dt>
              <dd className='text-base'>{mob.wardPercent}</dd>
            </div>
          </dl>
        </section>

        {/* Resistances */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Resistances</h2>
          <dl className='grid grid-cols-5 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Fire
              </dt>
              <dd className='text-base'>{mob.resistanceFire}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Cold
              </dt>
              <dd className='text-base'>{mob.resistanceCold}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Lightning
              </dt>
              <dd className='text-base'>{mob.resistanceLightning}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Acid
              </dt>
              <dd className='text-base'>{mob.resistanceAcid}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Poison
              </dt>
              <dd className='text-base'>{mob.resistancePoison}</dd>
            </div>
          </dl>
        </section>

        {/* Attributes */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Attributes</h2>
          <dl className='grid grid-cols-4 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Strength
              </dt>
              <dd className='text-base'>{mob.strength}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Intelligence
              </dt>
              <dd className='text-base'>{mob.intelligence}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Wisdom
              </dt>
              <dd className='text-base'>{mob.wisdom}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Dexterity
              </dt>
              <dd className='text-base'>{mob.dexterity}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Constitution
              </dt>
              <dd className='text-base'>{mob.constitution}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Charisma
              </dt>
              <dd className='text-base'>{mob.charisma}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Perception
              </dt>
              <dd className='text-base'>{mob.perception}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Concealment
              </dt>
              <dd className='text-base'>{mob.concealment}</dd>
            </div>
          </dl>
        </section>

        {/* Other Properties */}
        <section>
          <h2 className='text-xl font-semibold mb-4'>Other Properties</h2>
          <dl className='grid grid-cols-2 gap-4'>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Size
              </dt>
              <dd className='text-base'>{mob.size}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Life Force
              </dt>
              <dd className='text-base'>{mob.lifeForce}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Composition
              </dt>
              <dd className='text-base'>{mob.composition}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Position
              </dt>
              <dd className='text-base'>{mob.position}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-muted-foreground'>
                Stance
              </dt>
              <dd className='text-base'>{mob.stance}</dd>
            </div>
            {mob.wealth != null && (
              <div>
                <dt className='text-sm font-medium text-muted-foreground'>
                  Wealth (copper)
                </dt>
                <dd className='text-base'>{mob.wealth.toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Flags */}
        {mob.mobFlags && mob.mobFlags.length > 0 && (
          <section>
            <h2 className='text-xl font-semibold mb-2'>Mob Flags</h2>
            <div className='flex flex-wrap gap-2'>
              {mob.mobFlags.map((flag, i) => (
                <span
                  key={i}
                  className='px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm'
                >
                  {flag}
                </span>
              ))}
            </div>
          </section>
        )}

        {mob.effectFlags && mob.effectFlags.length > 0 && (
          <section>
            <h2 className='text-xl font-semibold mb-2'>Effect Flags</h2>
            <div className='flex flex-wrap gap-2'>
              {mob.effectFlags.map((flag, i) => (
                <span
                  key={i}
                  className='px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm'
                >
                  {flag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
