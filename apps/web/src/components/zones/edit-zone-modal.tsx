'use client';

import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
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
}

interface EditZoneModalProps {
  zone: ZoneData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RESET_MODES: ResetMode[] = ['NEVER', 'EMPTY', 'ALWAYS', 'NORMAL'];
const HEMISPHERES: Hemisphere[] = [
  'NORTH',
  'SOUTH',
  'NORTHWEST',
  'NORTHEAST',
  'SOUTHWEST',
  'SOUTHEAST',
];
const CLIMATES: Climate[] = ['TEMPERATE', 'ARCTIC', 'TROPICAL', 'ARID', 'NONE'];

export function EditZoneModal({
  zone,
  isOpen,
  onClose,
  onSuccess,
}: EditZoneModalProps) {
  const [formData, setFormData] = useState({
    name: zone.name,
    lifespan: zone.lifespan,
    resetMode: zone.resetMode,
    hemisphere: zone.hemisphere,
    climate: zone.climate,
  });

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
        data: formData,
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
            onClick={onClose}
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
                setFormData({ ...formData, resetMode: e.target.value })
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
                setFormData({ ...formData, climate: e.target.value })
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
                setFormData({ ...formData, hemisphere: e.target.value })
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
              onClick={onClose}
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
