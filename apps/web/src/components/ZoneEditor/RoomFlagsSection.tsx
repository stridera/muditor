'use client';

import {
  EXTRA_ROOM_FLAGS,
  pickRoomFlags,
  type RoomFlagFields,
} from '@/lib/room-flags';

interface RoomFlagsSectionProps {
  room: RoomFlagFields;
  onChange: (
    field: keyof RoomFlagFields,
    value: boolean | string | null
  ) => void;
}

/**
 * The room flags the editor did not offer before: indoors, soundproof, arena,
 * guildhall, who may enter / track / portal / scan, and inn settings.
 */
export function RoomFlagsSection({ room, onChange }: RoomFlagsSectionProps) {
  const flags = pickRoomFlags(room);
  return (
    <div className='p-3 rounded-lg border border-border bg-muted/50'>
      <h5 className='text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground'>
        Room Flags
      </h5>
      <div className='grid grid-cols-2 gap-2'>
        {EXTRA_ROOM_FLAGS.map(def => (
          <label
            key={def.field}
            title={def.desc}
            className='flex items-center gap-2 p-2 rounded cursor-pointer text-foreground hover:bg-accent'
          >
            <input
              type='checkbox'
              checked={flags[def.field]}
              onChange={e => onChange(def.field, e.target.checked)}
              className='rounded border-input'
            />
            <span className='text-xs'>{def.label}</span>
          </label>
        ))}
      </div>
      {flags.isInn ? (
        <div className='mt-2'>
          <label className='block text-xs font-medium mb-1 text-muted-foreground'>
            Inn name
          </label>
          <input
            type='text'
            aria-label='Inn name'
            value={flags.innName ?? ''}
            onChange={e => onChange('innName', e.target.value || null)}
            placeholder='e.g. The Rusty Boar'
            className='w-full px-2 py-1.5 text-xs border border-input rounded bg-background text-foreground'
          />
        </div>
      ) : null}
    </div>
  );
}
