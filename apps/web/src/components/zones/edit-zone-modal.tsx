'use client';

import { useMutation } from '@apollo/client/react';
import {
  isEqual,
  useUnsavedChangesGuard,
} from '@/hooks/use-unsaved-changes-guard';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { roleAtLeast } from '@/lib/roles';
import {
  UpdateZoneDocument,
  type UpdateZoneMutationVariables,
  type Climate,
  type Hemisphere,
  type ResetMode,
} from '@/generated/graphql';

interface ZoneData {
  id: number;
  name: string;
  lifespan: number;
  resetMode: ResetMode;
  hemisphere: Hemisphere;
  climate: Climate;
  isGodZone: boolean;
  isInternal: boolean;
  mobsSleepAtNight: boolean;
}

interface EditZoneModalProps {
  zone: ZoneData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

export function EditZoneModal({
  zone,
  isOpen,
  onClose,
  onSuccess,
}: EditZoneModalProps) {
  const { user } = useAuth();
  // Marking a god zone changes what every mortal can see; the API enforces
  // HEAD_BUILDER+, the UI just doesn't offer it to anyone else.
  const canEditGodZone = roleAtLeast(user?.role, 'HEAD_BUILDER');
  const [formData, setFormData] = useState({
    name: zone.name,
    lifespan: zone.lifespan,
    resetMode: zone.resetMode,
    hemisphere: zone.hemisphere,
    climate: zone.climate,
    mobsSleepAtNight: zone.mobsSleepAtNight,
  });
  const [isGodZone, setIsGodZone] = useState(zone.isGodZone);
  const [isInternal, setIsInternal] = useState(zone.isInternal);

  // Dirty = differs from the zone as loaded. Closing without saving asks first.
  const isDirty =
    isOpen &&
    !isEqual(
      { formData, isGodZone, isInternal },
      {
        formData: {
          name: zone.name,
          lifespan: zone.lifespan,
          resetMode: zone.resetMode,
          hemisphere: zone.hemisphere,
          climate: zone.climate,
          mobsSleepAtNight: zone.mobsSleepAtNight,
        },
        isGodZone: zone.isGodZone,
        isInternal: zone.isInternal,
      }
    );
  const { guard } = useUnsavedChangesGuard(
    isDirty,
    'Discard your unsaved zone changes?'
  );
  const requestClose = guard(onClose);

  const [updateZone, { loading, error }] = useMutation(UpdateZoneDocument, {
    onCompleted: () => {
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateZone({
      variables: {
        id: zone.id,
        data: canEditGodZone
          ? { ...formData, isGodZone, isInternal }
          : formData,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-card border rounded-lg shadow-lg w-full max-w-md mx-4'>
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-foreground'>
            Edit Zone: {zone.name}
          </h2>
          <button
            onClick={requestClose}
            className='text-muted-foreground hover:text-foreground'
            type='button'
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {/* Zone Name */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Zone Name
            </label>
            <input
              id='name'
              type='text'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground'
              required
            />
          </div>

          {/* Lifespan */}
          <div>
            <label
              htmlFor='lifespan'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Lifespan (minutes)
            </label>
            <input
              id='lifespan'
              type='number'
              min='1'
              value={formData.lifespan}
              onChange={e =>
                setFormData({ ...formData, lifespan: parseInt(e.target.value) })
              }
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground'
              required
            />
          </div>

          {/* Reset Mode */}
          <div>
            <label
              htmlFor='resetMode'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Reset Mode
            </label>
            <select
              id='resetMode'
              value={formData.resetMode}
              onChange={e =>
                setFormData({
                  ...formData,
                  resetMode: e.target.value as ResetMode,
                })
              }
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground'
              required
            >
              {RESET_MODES.map(mode => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Climate */}
          <div>
            <label
              htmlFor='climate'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Climate
            </label>
            <select
              id='climate'
              value={formData.climate}
              onChange={e =>
                setFormData({ ...formData, climate: e.target.value as Climate })
              }
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground'
              required
            >
              {CLIMATES.map(climate => (
                <option key={climate} value={climate}>
                  {climate}
                </option>
              ))}
            </select>
          </div>

          {/* Hemisphere */}
          <div>
            <label
              htmlFor='hemisphere'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Hemisphere
            </label>
            <select
              id='hemisphere'
              value={formData.hemisphere}
              onChange={e =>
                setFormData({
                  ...formData,
                  hemisphere: e.target.value as Hemisphere,
                })
              }
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground'
              required
            >
              {HEMISPHERES.map(hemisphere => (
                <option key={hemisphere} value={hemisphere}>
                  {hemisphere}
                </option>
              ))}
            </select>
          </div>

          {/* Mobs sleep at night (off by default) */}
          <div>
            <label
              htmlFor='mobsSleepAtNight'
              className='flex items-start gap-2 text-sm font-medium text-muted-foreground'
            >
              <input
                id='mobsSleepAtNight'
                type='checkbox'
                className='mt-1 rounded border-border'
                checked={formData.mobsSleepAtNight}
                onChange={e =>
                  setFormData({
                    ...formData,
                    mobsSleepAtNight: e.target.checked,
                  })
                }
              />
              <span>
                Mobs sleep at night
                <span className='block text-xs font-normal'>
                  Mobs of this zone lie down in outdoor rooms between 22:00 and
                  05:00 and wake at dawn. Never mid-fight, while hunting or with
                  an enemy in the room. Off by default; the Sleeps at night /
                  Awake at night mob behaviors override it per mob.
                </span>
              </span>
            </label>
          </div>

          {/* God zone (HEAD_BUILDER+) */}
          <div>
            <label
              htmlFor='isGodZone'
              className='flex items-start gap-2 text-sm font-medium text-muted-foreground'
            >
              <input
                id='isGodZone'
                type='checkbox'
                className='mt-1 rounded border-border'
                checked={isGodZone}
                disabled={!canEditGodZone}
                onChange={e => setIsGodZone(e.target.checked)}
              />
              <span>
                God zone (hidden from mortals, no achievements, excluded from
                random teleport)
                {!canEditGodZone && (
                  <span className='block text-xs font-normal'>
                    Only HEAD_BUILDER and above can change this.
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Internal zone (HEAD_BUILDER+, same authority as the god zone flag) */}
          <div>
            <label
              htmlFor='isInternal'
              className='flex items-start gap-2 text-sm font-medium text-muted-foreground'
            >
              <input
                id='isInternal'
                type='checkbox'
                className='mt-1 rounded border-border'
                checked={isInternal}
                disabled={!canEditGodZone}
                onChange={e => setIsInternal(e.target.checked)}
              />
              <span>
                Internal zone (plumbing: no exploration credit, left out of zone
                lists)
                {!canEditGodZone && (
                  <span className='block text-xs font-normal'>
                    Only HEAD_BUILDER and above can change this.
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className='bg-destructive/10 border border-destructive text-destructive rounded-md p-3 text-sm'>
              {error.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex items-center gap-3 pt-4'>
            <button
              type='button'
              onClick={requestClose}
              className='flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50'
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
