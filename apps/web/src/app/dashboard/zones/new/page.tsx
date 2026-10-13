'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  CreateZoneDocument,
  GetZonesForSelectorDocument,
  type Climate,
  type Hemisphere,
  type ResetMode,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const RESET_MODES: ResetMode[] = ['NEVER', 'EMPTY', 'NORMAL'];
const HEMISPHERES: Hemisphere[] = [
  'NORTHWEST',
  'NORTHEAST',
  'SOUTHWEST',
  'SOUTHEAST',
];
const CLIMATES: Climate[] = [
  'ALPINE',
  'ARCTIC',
  'ARID',
  'NONE',
  'OCEANIC',
  'SEMIARID',
  'SUBARCTIC',
  'SUBTROPICAL',
  'TEMPERATE',
  'TROPICAL',
];

const inputClass =
  'w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground';
const labelClass = 'block text-sm font-medium text-muted-foreground mb-1';

export default function NewZonePage() {
  return (
    <PermissionGuard requireBuilder={true}>
      <NewZoneForm />
    </PermissionGuard>
  );
}

/** Highest zone id the API accepts (zone 0 is stored as 1000). */
const MAX_ZONE_ID = 9999;

function NewZoneForm() {
  const router = useRouter();
  const { isHeadBuilder } = usePermissions();
  const { data: zonesData } = useQuery(GetZonesForSelectorDocument);
  const existingIds = new Set((zonesData?.zones ?? []).map(z => z.id));

  const [zoneId, setZoneId] = useState('');
  const [name, setName] = useState('');
  const [lifespan, setLifespan] = useState('30');
  const [resetMode, setResetMode] = useState<ResetMode>('NORMAL');
  const [hemisphere, setHemisphere] = useState<Hemisphere>('NORTHWEST');
  const [climate, setClimate] = useState<Climate>('NONE');

  const [createZone, { loading, error }] = useMutation(CreateZoneDocument, {
    onCompleted: data => {
      // Navigate with the id the API returned, never with form state
      router.push(`/dashboard/zones/${data.createZone.id}`);
    },
  });

  const parsedId = /^\d+$/.test(zoneId) ? Number(zoneId) : null;
  const idOutOfRange = parsedId !== null && parsedId > MAX_ZONE_ID;
  const idMalformed = zoneId !== '' && parsedId === null;
  const idTaken = parsedId !== null && existingIds.has(parsedId);
  const canSubmit =
    parsedId !== null &&
    !idOutOfRange &&
    !idTaken &&
    name.trim().length > 0 &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedId === null || !canSubmit) return;
    try {
      await createZone({
        variables: {
          data: {
            id: parsedId,
            name: name.trim(),
            lifespan: Number(lifespan) || 30,
            resetMode,
            hemisphere,
            climate,
          },
        },
      });
    } catch {
      // Surfaced through the mutation `error` state below
    }
  };

  // Hooks above run for everyone; only the view differs.
  if (!isHeadBuilder) {
    return (
      <div className='max-w-xl'>
        <h1 className='text-3xl font-bold font-display text-foreground mb-6'>
          Create Zone
        </h1>
        <p className='text-muted-foreground mb-4'>
          Zones are created by a head builder or above. Ask one to create the
          zone and grant you write access to it.
        </p>
        <Link href='/dashboard/zones' className='text-primary hover:underline'>
          Back to zones
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-xl'>
      <h1 className='text-3xl font-bold font-display text-foreground mb-6'>
        Create Zone
      </h1>
      <form
        onSubmit={handleSubmit}
        className='bg-card border rounded-lg p-6 space-y-4'
      >
        <div>
          <label htmlFor='zoneId' className={labelClass}>
            Zone ID
          </label>
          <input
            id='zoneId'
            type='text'
            inputMode='numeric'
            value={zoneId}
            onChange={e => setZoneId(e.target.value.trim())}
            className={inputClass}
            required
          />
          {idMalformed && (
            <p className='text-sm text-destructive mt-1'>
              Zone ID must be a whole number from 0 to {MAX_ZONE_ID}.
            </p>
          )}
          {idOutOfRange && (
            <p className='text-sm text-destructive mt-1'>
              Zone ID cannot be above {MAX_ZONE_ID}.
            </p>
          )}
          {idTaken && (
            <p className='text-sm text-destructive mt-1'>
              Zone {parsedId} already exists.
            </p>
          )}
        </div>

        <div>
          <label htmlFor='zoneName' className={labelClass}>
            Zone Name
          </label>
          <input
            id='zoneName'
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor='lifespan' className={labelClass}>
            Lifespan (minutes)
          </label>
          <input
            id='lifespan'
            type='number'
            min='1'
            value={lifespan}
            onChange={e => setLifespan(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor='resetMode' className={labelClass}>
            Reset Mode
          </label>
          <select
            id='resetMode'
            value={resetMode}
            onChange={e => setResetMode(e.target.value as ResetMode)}
            className={inputClass}
          >
            {RESET_MODES.map(mode => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='climate' className={labelClass}>
            Climate
          </label>
          <select
            id='climate'
            value={climate}
            onChange={e => setClimate(e.target.value as Climate)}
            className={inputClass}
          >
            {CLIMATES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='hemisphere' className={labelClass}>
            Hemisphere
          </label>
          <select
            id='hemisphere'
            value={hemisphere}
            onChange={e => setHemisphere(e.target.value as Hemisphere)}
            className={inputClass}
          >
            {HEMISPHERES.map(h => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className='bg-destructive/10 border border-destructive text-destructive rounded-md p-3 text-sm'>
            {error.message}
          </div>
        )}

        <div className='flex items-center gap-3 pt-2'>
          <Link
            href='/dashboard/zones'
            className='flex-1 text-center px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors'
          >
            Cancel
          </Link>
          <button
            type='submit'
            disabled={!canSubmit}
            className='flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create Zone'}
          </button>
        </div>
      </form>
    </div>
  );
}
