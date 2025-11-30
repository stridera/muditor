import type { ZoneBounds, ZoneMapData } from './editor-types';

interface LightweightRoom {
  id: number;
  name: string;
  sector: string;
  zoneId: number;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
  exits?: Array<{
    id: number;
    direction: string;
    toZoneId: number | null;
    toRoomId: number | null;
  }>;
  // Optional fields added by auto-layout
  isOverlapping: boolean | null; // nullable to satisfy exactOptionalPropertyTypes
  group: string | null;
}

export interface FetchAllZonesDeps {
  authenticatedFetch: (url: string, init: RequestInit) => Promise<Response>;
  calculateZoneBounds: (zone: {
    id: number;
    name: string;
    climate: string;
    rooms: LightweightRoom[];
  }) => ZoneBounds;
  generateAutoLayout: (
    rooms: LightweightRoom[],
    startRoomId?: number
  ) => Map<
    number,
    { x: number; y: number; z: number; isOverlapping?: boolean; group?: string }
  >;
  log: {
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
  };
}

// Pure data loader used by world map; performs lightweight zone + room fetch and applies auto-layout to missing coords.
export async function fetchAllZonesExternal(
  deps: FetchAllZonesDeps
): Promise<ZoneMapData | null> {
  const { authenticatedFetch, calculateZoneBounds, generateAutoLayout, log } =
    deps;
  try {
    const zonesResponse = await authenticatedFetch(
      process.env.NEXT_PUBLIC_GRAPHQL_URL || '/graphql',
      {
        method: 'POST',
        body: JSON.stringify({
          query: `query GetAllZones { zones { id name climate } }`,
        }),
      }
    );
    const zonesData = await zonesResponse.json();
    if (zonesData.errors) {
      log.error('Failed to fetch zones:', zonesData.errors);
      return null;
    }
    const zones = zonesData.data.zones || [];

    const roomsResponse = await authenticatedFetch(
      process.env.NEXT_PUBLIC_GRAPHQL_URL || '/graphql',
      {
        method: 'POST',
        body: JSON.stringify({
          query: `query GetAllRooms($lightweight: Boolean) { rooms(take: 15000, lightweight: $lightweight) { id name sector zoneId layoutX layoutY layoutZ exits { id direction toZoneId toRoomId } } }`,
          variables: { lightweight: true },
        }),
      }
    );
    const roomsData = await roomsResponse.json();
    if (roomsData.errors) {
      log.error('Failed to fetch rooms:', roomsData.errors);
      const zoneBounds = zones.map(
        (z: { id: number; name: string; climate: string }) => ({
          ...z,
          rooms: [],
          minX: 0,
          minY: 0,
          maxX: 1,
          maxY: 1,
          centerX: 0.5,
          centerY: 0.5,
          roomCount: 0,
        })
      );
      return {
        zones: zoneBounds,
        rooms: [],
        globalBounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
      };
    }

    const allRooms: LightweightRoom[] = roomsData.data.rooms || [];
    const autoLayoutPositions = generateAutoLayout(allRooms, 3001);

    let roomsWithDbCoords = 0;
    let roomsWithAutoLayout = 0;
    const updatedRooms: LightweightRoom[] = allRooms.map(
      (room: LightweightRoom) => {
        if (room.layoutX !== null && room.layoutY !== null) {
          roomsWithDbCoords++;
          return room;
        }
        const pos = autoLayoutPositions.get(room.id);
        if (pos) {
          roomsWithAutoLayout++;
          return {
            ...room,
            layoutX: pos.x,
            layoutY: pos.y,
            layoutZ: pos.z || room.layoutZ || 0,
            isOverlapping: pos.isOverlapping ?? null,
            group: pos.group ?? null,
          };
        }
        return room;
      }
    );
    log.warn(
      `Room positioning: ${roomsWithDbCoords} db coords, ${roomsWithAutoLayout} auto-layout`
    );

    const roomsByZone = updatedRooms.reduce(
      (acc: Record<number, LightweightRoom[]>, room: LightweightRoom) => {
        if (!acc[room.zoneId]) acc[room.zoneId] = [];
        (acc[room.zoneId] as LightweightRoom[]).push(room);
        return acc;
      },
      {}
    );

    const zoneBounds = zones.map(
      (zone: { id: number; name: string; climate: string }) =>
        calculateZoneBounds({
          id: zone.id,
          name: zone.name,
          climate: zone.climate,
          rooms: roomsByZone[zone.id] || [],
        })
    );

    if (zoneBounds.length === 0) {
      return {
        zones: [],
        rooms: [],
        globalBounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
      };
    }

    const allMinX = Math.min(...zoneBounds.map((z: ZoneBounds) => z.minX));
    const allMaxX = Math.max(...zoneBounds.map((z: ZoneBounds) => z.maxX));
    const allMinY = Math.min(...zoneBounds.map((z: ZoneBounds) => z.minY));
    const allMaxY = Math.max(...zoneBounds.map((z: ZoneBounds) => z.maxY));

    return {
      zones: zoneBounds,
      rooms: updatedRooms,
      globalBounds: {
        minX: allMinX,
        minY: allMinY,
        maxX: allMaxX,
        maxY: allMaxY,
      },
    };
  } catch (err) {
    log.error('Error fetching all zones:', err);
    return null;
  }
}
