'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  CreateRoomDialog,
  SECTOR_OPTIONS,
} from '@/components/rooms/CreateRoomDialog';
import { Button } from '@/components/ui/button';
import { FlagBadge } from '@/components/ui/flag-badge';
import { SectorBadge } from '@/components/ui/sector-badge';
import { useListState } from '@/hooks/use-list-state';
import { usePermissions } from '@/hooks/use-permissions';
import { extractErrorMessage } from '@/lib/error-utils';
import { gql } from '@apollo/client';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, Suspense } from 'react';

interface RoomExit {
  id: string;
  direction: string;
  description?: string;
  keywords?: string[];
  keyZoneId?: number | null;
  keyId?: number | null;
  toZoneId?: number;
  toRoomId?: number;
  flags?: string[];
}

interface RoomExtraDescription {
  id: string;
  keywords: string[];
  description: string;
}

interface Room {
  id: number;
  name: string;
  roomDescription: string;
  sector: string;
  zoneId: number;
  isPeaceful?: boolean;
  isDeathTrap?: boolean;
  allowsMagic?: boolean;
  allowsRecall?: boolean;
  allowsSummon?: boolean;
  allowsTeleport?: boolean;
  baseLightLevel?: number;
  capacity?: number;
  entryRestriction?: string | null;
  exits?: RoomExit[];
  extraDescs?: RoomExtraDescription[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  layoutX?: number;
  layoutY?: number;
  layoutZ?: number;
}

function RoomsPageContent() {
  return (
    <PermissionGuard requireImmortal={true}>
      <RoomsContent />
    </PermissionGuard>
  );
}

const ROOMS_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

// Filtering, searching and paging all happen on the server: with ~10k rooms a
// client-side filter over one page would silently miss most of them.
const ROOMS_PAGE_QUERY = gql`
  query RoomsPage(
    $zoneId: Int
    $search: String
    $sector: Sector
    $skip: Int
    $take: Int
  ) {
    rooms(
      zoneId: $zoneId
      search: $search
      sector: $sector
      skip: $skip
      take: $take
    ) {
      id
      zoneId
      name
      roomDescription
      sector
      isPeaceful
      isDeathTrap
    }
    roomsCount(zoneId: $zoneId, search: $search, sector: $sector)
  }
`;

const ROOM_DETAILS_QUERY = gql`
  query RoomDetails($zoneId: Int!, $id: Int!) {
    room(zoneId: $zoneId, id: $id) {
      id
      name
      roomDescription
      sector
      zoneId
      baseLightLevel
      capacity
      entryRestriction
      isPeaceful
      allowsMagic
      allowsRecall
      allowsSummon
      allowsTeleport
      isDeathTrap
      exits {
        id
        direction
        description
        keywords
        keyZoneId
        keyId
        toZoneId
        toRoomId
        flags
        defaultState
        hitPoints
      }
      extraDescs {
        id
        keywords
        description
      }
      createdAt
      updatedAt
      createdBy
      updatedBy
      layoutX
      layoutY
      layoutZ
    }
  }
`;

const roomKey = (room: { zoneId: number; id: number }) =>
  `${room.zoneId}-${room.id}`;

function RoomsContent() {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const { isBuilder } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const list = useListState();
  const selectedZone = list.zone;

  // Local state keeps typing responsive; it is mirrored into the URL below.
  const [searchTerm, setSearchTerm] = useState(() => list.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedSector, setSelectedSector] = useState(
    () => list.get('sector') ?? 'all'
  );
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, Partial<Room>>>({});

  // Mirror search text and sector into the URL (deep links, back-navigation).
  const { set: setListParams } = list;
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setListParams({
        q: searchTerm,
        sector: selectedSector === 'all' ? null : selectedSector,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSector, setListParams]);

  const page = list.page;
  const { loading, error, data } = useQuery<{
    rooms: Room[];
    roomsCount: number;
  }>(ROOMS_PAGE_QUERY, {
    variables: {
      zoneId: selectedZone ?? null,
      search: debouncedSearch.trim() || null,
      sector: selectedSector === 'all' ? null : selectedSector,
      skip: (page - 1) * ROOMS_PAGE_SIZE,
      take: ROOMS_PAGE_SIZE,
    },
    fetchPolicy: 'cache-and-network',
  });

  const roomsCount = data?.roomsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(roomsCount / ROOMS_PAGE_SIZE));
  const filteredRooms: Room[] = useMemo(
    () =>
      (data?.rooms ?? []).map(room => ({
        ...room,
        ...details[roomKey(room)],
      })),
    [data, details]
  );

  const toggleRoomExpanded = async (target: Room) => {
    const key = roomKey(target);
    if (expandedRooms.has(key)) {
      setExpandedRooms(new Set([...expandedRooms].filter(k => k !== key)));
      return;
    }
    setExpandedRooms(new Set(expandedRooms).add(key));

    // Load detailed data once per room
    if (details[key]) return;
    setLoadingDetails(prev => new Set(prev).add(key));
    try {
      const result = await apolloClient.query<{ room: Room | null }>({
        query: ROOM_DETAILS_QUERY,
        variables: { zoneId: target.zoneId, id: target.id },
      });
      if (result.data?.room) {
        const loaded = result.data.room;
        setDetails(prev => ({ ...prev, [key]: loaded }));
      }
    } catch {
      /* the summary row stays usable without details */
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const sectorOptions: readonly string[] = SECTOR_OPTIONS;

  if (loading && !data) {
    return (
      <div className='animate-pulse'>
        <div className='h-8 bg-muted rounded w-1/4 mb-6'></div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='h-10 bg-muted rounded'></div>
          <div className='h-10 bg-muted rounded'></div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='bg-card p-4 rounded-lg shadow'>
              <div className='h-4 bg-muted rounded w-1/2 mb-2'></div>
              <div className='h-3 bg-muted rounded w-3/4 mb-1'></div>
              <div className='h-3 bg-muted rounded w-1/4'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        className='bg-red-50 border border-red-200 rounded-md p-4'
        data-testid='error-message'
      >
        <h3 className='text-red-800 font-medium'>Error loading rooms</h3>
        <p className='text-red-600 text-sm mt-1'>
          {extractErrorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold font-display text-foreground'>
            {selectedZone ? `Zone ${selectedZone} Rooms` : 'Rooms'}
          </h1>
          <p className='text-muted-foreground mt-1'>
            {roomsCount === 0
              ? '0 rooms'
              : `${(page - 1) * ROOMS_PAGE_SIZE + 1}-${(page - 1) * ROOMS_PAGE_SIZE + filteredRooms.length} of ${roomsCount} rooms`}
            {selectedZone && ' in this zone'}
          </p>
        </div>
        {isBuilder && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            New room
          </Button>
        )}
      </div>

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        zoneId={selectedZone}
        onCreated={room =>
          router.push(
            `/dashboard/zones/editor?zone=${room.zoneId}&room=${room.id}`
          )
        }
      />

      <div className='bg-card rounded-lg shadow mb-6 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Search rooms
            </label>
            <input
              type='text'
              id='search'
              placeholder='Search by name, ID, or description...'
              className='w-full px-3 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor='sector'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Filter by sector
            </label>
            <select
              id='sector'
              className='w-full px-3 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
            >
              <option value='all'>All sectors</option>
              {sectorOptions.map((sector, index) => (
                <option key={`sector-${index}`} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>
            No rooms found matching your criteria
          </p>
          <p className='text-muted-foreground text-sm mt-2'>
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredRooms.map(room => (
            <div
              key={`${room.zoneId}-${room.id}`}
              className='bg-card border border-border rounded-lg shadow hover:shadow-md transition-shadow'
            >
              <div
                className='p-4 cursor-pointer'
                onClick={() => toggleRoomExpanded(room)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-lg text-foreground'>
                        #{room.id} - {room.name}
                      </h3>
                      <span className='px-2 py-1 text-xs rounded-full font-medium bg-muted text-muted-foreground'>
                        {room.sector}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedRooms.has(roomKey(room)) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <p className='text-muted-foreground mb-2 line-clamp-2'>
                      {room.roomDescription}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <span>Room #{room.id}</span>
                      <span>Zone {room.zoneId}</span>
                      {room.isPeaceful && (
                        <>
                          <span>•</span>
                          <span>Peaceful</span>
                        </>
                      )}
                      {room.isDeathTrap && (
                        <>
                          <span>•</span>
                          <span>Death Trap</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-2 ml-4'>
                    <Link
                      href={`/dashboard/zones/${room.zoneId}`}
                      className='text-muted-foreground hover:text-foreground px-3 py-1 text-sm'
                      onClick={e => e.stopPropagation()}
                    >
                      Zone
                    </Link>
                    <Link
                      href={`/dashboard/zones/editor?zone=${room.zoneId}&room=${room.id}`}
                      className='text-primary hover:text-primary-foreground px-3 py-1 text-sm'
                      onClick={e => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRooms.has(roomKey(room)) && (
                <div className='border-t border-border p-4 bg-muted'>
                  {loadingDetails.has(roomKey(room)) ? (
                    <div className='text-center py-4'>
                      <div className='inline-flex items-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2'></div>
                        <span className='text-sm text-muted-foreground'>
                          Loading room details...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {/* Full Description */}
                      <div>
                        <h4 className='font-medium text-foreground mb-2'>
                          Full Description
                        </h4>
                        <p className='text-muted-foreground text-sm bg-card p-3 rounded border border-border'>
                          {room.roomDescription}
                        </p>
                      </div>

                      {/* Exits */}
                      {room.exits && room.exits.length > 0 && (
                        <div>
                          <h4 className='font-medium text-foreground mb-2'>
                            Exits ({room.exits.length})
                          </h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            {room.exits.map(exit => (
                              <div
                                key={exit.id}
                                className='bg-card p-3 rounded border border-border text-sm'
                              >
                                <div className='font-medium text-foreground'>
                                  {exit.direction.toUpperCase()}
                                </div>
                                {exit.toRoomId != null && (
                                  <div className='text-primary'>
                                    →{' '}
                                    {exit.toZoneId &&
                                    exit.toZoneId !== room.zoneId
                                      ? `Zone ${exit.toZoneId}, `
                                      : ''}
                                    Room {exit.toRoomId}
                                  </div>
                                )}
                                {exit.description && (
                                  <div className='text-muted-foreground mt-1'>
                                    {exit.description}
                                  </div>
                                )}
                                {exit.keywords && exit.keywords.length > 0 && (
                                  <div className='text-muted-foreground mt-1'>
                                    Keywords: {exit.keywords.join(', ')}
                                  </div>
                                )}
                                {exit.keyId != null && (
                                  <div className='text-accent mt-1'>
                                    Key Required: {exit.keyZoneId}:{exit.keyId}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extra Descriptions */}
                      {room.extraDescs && room.extraDescs.length > 0 && (
                        <div>
                          <h4 className='font-medium text-foreground mb-2'>
                            Extra Descriptions ({room.extraDescs.length})
                          </h4>
                          <div className='space-y-2'>
                            {room.extraDescs.map(desc => (
                              <div
                                key={desc.id}
                                className='bg-card p-3 rounded border border-border text-sm'
                              >
                                <div className='font-medium text-foreground'>
                                  "{desc.keywords.join(', ')}"
                                </div>
                                <div className='text-muted-foreground mt-1'>
                                  {desc.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Layout Coordinates */}
                      {(room.layoutX !== undefined ||
                        room.layoutY !== undefined ||
                        room.layoutZ !== undefined) && (
                        <div>
                          <h4 className='font-medium text-foreground mb-2'>
                            Layout Coordinates
                          </h4>
                          <div className='bg-card p-3 rounded border border-border text-sm'>
                            <div className='grid grid-cols-3 gap-4'>
                              <div>X: {room.layoutX ?? 'N/A'}</div>
                              <div>Y: {room.layoutY ?? 'N/A'}</div>
                              <div>Z: {room.layoutZ ?? 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Room Information */}
                      <div>
                        <h4 className='font-medium text-foreground mb-2'>
                          Room Information
                        </h4>
                        <div className='bg-card p-3 rounded border border-border text-sm space-y-2'>
                          <div className='flex justify-between items-center'>
                            <span className='text-muted-foreground'>
                              Sector Type:
                            </span>
                            <span className='font-medium'>
                              {room.sector ? (
                                <SectorBadge sector={room.sector} />
                              ) : (
                                'N/A'
                              )}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Zone ID:
                            </span>
                            <span>{room.zoneId ?? 'N/A'}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Exit Count:
                            </span>
                            <span>{room.exits?.length || 0}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Extra Descriptions:
                            </span>
                            <span>{room.extraDescs?.length || 0}</span>
                          </div>
                          {(() => {
                            const props: string[] = [];
                            if (room.isPeaceful) props.push('Peaceful');
                            if (room.isDeathTrap) props.push('Death Trap');
                            if (room.allowsMagic === false)
                              props.push('No Magic');
                            if (room.allowsRecall === false)
                              props.push('No Recall');
                            if (room.allowsSummon === false)
                              props.push('No Summon');
                            if (room.allowsTeleport === false)
                              props.push('No Teleport');
                            if ((room.baseLightLevel ?? 0) !== 0)
                              props.push(`Light: ${room.baseLightLevel}`);
                            if ((room.capacity ?? 10) !== 10)
                              props.push(`Capacity: ${room.capacity}`);
                            return props.length > 0 ? (
                              <div>
                                <span className='text-muted-foreground'>
                                  Properties:
                                </span>
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {props.map((prop: string) => (
                                    <FlagBadge key={prop} flag={prop} />
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                          <div className='border-t pt-2 mt-2'>
                            {room.createdAt && (
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>
                                  Created:
                                </span>
                                <span>
                                  {new Date(room.createdAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {room.updatedAt && (
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>
                                  Updated:
                                </span>
                                <span>
                                  {new Date(room.updatedAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-6'>
          <Button
            variant='outline'
            disabled={page <= 1}
            onClick={() => list.setPage(page - 1)}
          >
            Previous
          </Button>
          <span className='text-sm text-muted-foreground'>
            Page {page} of {totalPages}
          </span>
          <Button
            variant='outline'
            disabled={page >= totalPages}
            onClick={() => list.setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={<div className='p-6 text-muted-foreground'>Loading...</div>}
    >
      <RoomsPageContent />
    </Suspense>
  );
}
