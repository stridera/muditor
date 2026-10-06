'use client';

import { useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GetRoomsByZoneDocument, type Sector } from '@/generated/graphql';
import { type CreatedRoom, useCreateRoom } from '@/hooks/use-create-room';
import { useZonesForSelector } from '@/hooks/use-zones-for-selector';
import { nextFreeRoomId, validateNewRoomId } from '@/lib/room-utils';

export const SECTOR_OPTIONS: readonly Sector[] = [
  'STRUCTURE',
  'CITY',
  'ROAD',
  'FIELD',
  'FOREST',
  'HILLS',
  'MOUNTAIN',
  'SWAMP',
  'WATER',
  'SHALLOWS',
  'UNDERWATER',
  'BEACH',
  'CAVE',
  'UNDERDARK',
  'GRASSLANDS',
  'RUINS',
  'AIR',
  'AIRPLANE',
  'ASTRALPLANE',
  'AVERNUS',
  'EARTHPLANE',
  'ETHEREALPLANE',
  'FIREPLANE',
];

export const DEFAULT_ROOM_DESCRIPTION = 'An unfinished room.';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Zone to prefill (e.g. from the zone context). */
  zoneId?: number | null;
  /** When true the zone cannot be changed (e.g. inside the zone editor). */
  lockZone?: boolean;
  /** Called with the created room after the mutation succeeds. */
  onCreated?: (room: CreatedRoom) => void | Promise<void>;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
  zoneId = null,
  lockZone = false,
  onCreated,
}: CreateRoomDialogProps) {
  const { zones } = useZonesForSelector();
  const { createRoom, loading: creating } = useCreateRoom();

  const [zone, setZone] = useState<number | null>(zoneId);
  const [idText, setIdText] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [name, setName] = useState('');
  const [sector, setSector] = useState<Sector>('STRUCTURE');
  const [description, setDescription] = useState(DEFAULT_ROOM_DESCRIPTION);

  // Reset the form every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setZone(zoneId);
    setIdText('');
    setIdTouched(false);
    setName('');
    setSector('STRUCTURE');
    setDescription(DEFAULT_ROOM_DESCRIPTION);
  }, [open, zoneId]);

  const {
    data: roomsData,
    loading: loadingIds,
    error: idsError,
  } = useQuery(GetRoomsByZoneDocument, {
    variables: { zoneId: zone ?? 0, lightweight: true },
    skip: !open || zone == null,
    fetchPolicy: 'network-only',
  });

  const usedIds = useMemo(
    () => (roomsData?.roomsByZone ?? []).map(r => r.id),
    [roomsData?.roomsByZone]
  );
  const idsReady = zone != null && !loadingIds && !idsError && !!roomsData;

  // Prefill the next free id until the builder edits the field themselves.
  useEffect(() => {
    if (!idsReady || idTouched) return;
    setIdText(String(nextFreeRoomId(usedIds)));
  }, [idsReady, idTouched, usedIds]);

  const parsedId = idText.trim() === '' ? null : Number(idText);
  const idError =
    zone == null || !idsReady ? null : validateNewRoomId(parsedId, usedIds);
  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const canSubmit =
    zone != null &&
    idsReady &&
    !idError &&
    parsedId != null &&
    trimmedName.length > 0 &&
    trimmedDescription.length > 0 &&
    !creating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || zone == null || parsedId == null) return;
    const room = await createRoom({
      id: parsedId,
      zoneId: zone,
      name: trimmedName,
      description: trimmedDescription,
      sector,
    });
    if (!room) return;
    onOpenChange(false);
    await onCreated?.(room);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>New room</DialogTitle>
            <DialogDescription>
              Create a room. You can refine exits, flags and descriptions in the
              zone editor afterwards.
            </DialogDescription>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <Label htmlFor='create-room-zone'>Zone</Label>
              <Select
                value={zone != null ? String(zone) : ''}
                onValueChange={value => {
                  setZone(Number(value));
                  setIdTouched(false);
                  setIdText('');
                }}
                disabled={lockZone}
              >
                <SelectTrigger id='create-room-zone'>
                  <SelectValue placeholder='Select a zone' />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(z => (
                    <SelectItem key={z.id} value={String(z.id)}>
                      {z.id} - {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label htmlFor='create-room-id'>Room id</Label>
              <Input
                id='create-room-id'
                type='number'
                min={0}
                step={1}
                value={idText}
                disabled={zone == null || !idsReady}
                onChange={e => {
                  setIdTouched(true);
                  setIdText(e.target.value);
                }}
                aria-invalid={idError != null}
                aria-describedby='create-room-id-error'
              />
              <p
                id='create-room-id-error'
                className='text-xs text-destructive min-h-4'
                role={idError ? 'alert' : undefined}
              >
                {idError ??
                  (idsError ? 'Could not load existing room ids' : '')}
              </p>
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='create-room-name'>Name</Label>
            <Input
              id='create-room-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='e.g. The Rusty Tankard'
              autoFocus
            />
          </div>

          <div className='space-y-1'>
            <Label htmlFor='create-room-sector'>Sector</Label>
            <Select
              value={sector}
              onValueChange={value => setSector(value as Sector)}
            >
              <SelectTrigger id='create-room-sector'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='create-room-description'>Description</Label>
            <Textarea
              id='create-room-description'
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!canSubmit}>
              {creating ? 'Creating...' : 'Create room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
