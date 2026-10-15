'use client';

import { Badge } from '@/components/ui/badge';
import { gql } from '@/generated/gql';
import { usePermissions } from '@/hooks/use-permissions';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';

const GET_TRIGGER_ATTACHMENTS = gql(`
  query GetTriggerAttachmentsForScriptsPage($zoneId: Int!, $id: Int!) {
    triggerAttachments(zoneId: $zoneId, id: $id) {
      kind
      zoneId
      id
      name
    }
  }
`);

interface Attachment {
  kind: string;
  zoneId: number;
  id: number;
  name: string;
}

/** Page of the mob / object / room an attachment points at. */
export function attachmentHref(a: Attachment, canEdit: boolean): string {
  switch (a.kind) {
    case 'MOB':
      return `/dashboard/mobs/${canEdit ? 'editor' : 'view'}?zone=${a.zoneId}&id=${a.id}`;
    case 'OBJECT':
      return `/dashboard/objects/${canEdit ? 'editor' : 'view'}?zone=${a.zoneId}&id=${a.id}`;
    default:
      return `/dashboard/zones/editor?zone=${a.zoneId}&room=${a.id}`;
  }
}

const KIND_LABEL: Record<string, string> = {
  MOB: 'Mob',
  OBJECT: 'Object',
  ROOM: 'Room',
};

/**
 * "Attached to" panel for the trigger editor: every mob, object and room that
 * uses this trigger, each linking to its own page. Mobs and objects open the
 * editor when the viewer can write that zone and the read-only view otherwise.
 */
export default function TriggerAttachments({
  zoneId,
  id,
}: {
  zoneId: number;
  id: number;
}) {
  const { canEditZone } = usePermissions();
  const { data, loading, error } = useQuery(GET_TRIGGER_ATTACHMENTS, {
    variables: { zoneId, id },
    fetchPolicy: 'cache-and-network',
  });
  const attachments: Attachment[] = data?.triggerAttachments ?? [];

  return (
    <section
      aria-label='Attached to'
      className='mt-4 rounded-lg border border-border bg-card p-3'
    >
      <h2 className='text-sm font-medium'>
        Attached to
        {!loading && !error && (
          <span className='ml-1 text-muted-foreground'>
            ({attachments.length})
          </span>
        )}
      </h2>
      {error ? (
        <p className='mt-1 text-sm text-destructive'>
          Could not load attachments.
        </p>
      ) : loading && attachments.length === 0 ? (
        <p className='mt-1 text-sm text-muted-foreground'>Loading...</p>
      ) : attachments.length === 0 ? (
        <p className='mt-1 text-sm text-muted-foreground'>
          Not attached to any mob, object or room.
        </p>
      ) : (
        <ul className='mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm'>
          {attachments.map(a => (
            <li
              key={`${a.kind}-${a.zoneId}-${a.id}`}
              className='flex items-center gap-1.5'
            >
              <Badge variant='outline' className='text-[10px] px-1 py-0'>
                {KIND_LABEL[a.kind] ?? a.kind}
              </Badge>
              <Link
                href={attachmentHref(a, canEditZone(a.zoneId))}
                className='hover:underline text-primary'
              >
                <span className='font-mono text-xs text-muted-foreground mr-1'>
                  {a.zoneId}:{a.id}
                </span>
                {a.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
