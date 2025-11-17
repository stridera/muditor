import type { Node } from 'reactflow';
import type { ZoneMapData } from './editor-types';

type LogFn = (...args: unknown[]) => void;
export interface WorldMapGenerationDeps {
  handleZoneSelect: (zoneId: number) => void;
  handleRoomSelect: (roomId: number) => void;
  getThemeColor: (light: string, dark: string) => string;
  log: { info?: LogFn; warn: LogFn; error: LogFn };
}

interface CacheEntry {
  nodes: Node[];
  timestamp: number;
}

export function generateEnhancedWorldMapNodesExternal(
  mapData: ZoneMapData,
  zoom: number,
  deps: WorldMapGenerationDeps,
  cache: Map<string, CacheEntry>,
  lastLODUpdate: { current: number },
  constants: { CACHE_DURATION: number; LOD_THROTTLE_MS: number }
): Node[] {
  const { handleZoneSelect, handleRoomSelect, getThemeColor, log } = deps;
  const { CACHE_DURATION, LOD_THROTTLE_MS } = constants;

  log.info?.('worldMap:generate:start', {
    zones: mapData.zones?.length || 0,
    rooms: mapData.rooms?.length || 0,
    zoom: Number(zoom.toFixed(3)),
  });

  if (!mapData.zones || mapData.zones.length === 0) {
    log.error('worldMap:no-zones', mapData);
    return [];
  }

  // Cache key rounds zoom for better hit rate
  const zoomLevel = Math.round(zoom * 5) / 5;
  const cacheKey = `${mapData.zones.length}-${zoomLevel}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    log.info?.('worldMap:cache:hit', {
      key: cacheKey,
      count: cached.nodes.length,
    });
    return cached.nodes;
  }

  const now = Date.now();
  if (
    cached &&
    now - lastLODUpdate.current < LOD_THROTTLE_MS &&
    zoom < 1.0 &&
    cached.nodes.length > 0
  ) {
    log.info?.('worldMap:throttle:return-cached', {
      key: cacheKey,
      count: cached.nodes.length,
    });
    return cached.nodes;
  }
  lastLODUpdate.current = now;

  // Constants for positioning
  const ZONE_SCALE = 100;
  const ZONE_SPACING = 200;
  const nodes: Node[] = [];

  // Layout zones
  const calculateZonePositions = (zones: typeof mapData.zones) => {
    const positions = new Map<number, { x: number; y: number }>();
    const sortedZones = [...zones].sort((a, b) => {
      const aSize = (a.maxX - a.minX) * (a.maxY - a.minY);
      const bSize = (b.maxX - b.minX) * (b.maxY - b.minY);
      return bSize - aSize;
    });
    const placed: Array<{
      id: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    sortedZones.forEach((zone, index) => {
      const zoneWidth = (zone.maxX - zone.minX) * ZONE_SCALE + ZONE_SPACING;
      const zoneHeight = (zone.maxY - zone.minY) * ZONE_SCALE + ZONE_SPACING;
      let placedOk = false;
      let attempts = 0;
      const maxAttempts = 1000;
      while (!placedOk && attempts < maxAttempts) {
        let x: number, y: number;
        if (index === 0) {
          x = 0;
          y = 0;
        } else {
          const gridSize = Math.ceil(Math.sqrt(sortedZones.length));
          const row = Math.floor(attempts / gridSize);
          const col = attempts % gridSize;
          x = col * (zoneWidth + ZONE_SPACING);
          y = row * (zoneHeight + ZONE_SPACING);
          if (attempts > gridSize * gridSize) {
            x += (Math.random() - 0.5) * ZONE_SPACING;
            y += (Math.random() - 0.5) * ZONE_SPACING;
          }
        }
        const overlaps = placed.some(existing => {
          const dx = Math.abs(x - existing.x);
          const dy = Math.abs(y - existing.y);
          const minDistX = (zoneWidth + existing.width) / 2;
          const minDistY = (zoneHeight + existing.height) / 2;
          return dx < minDistX && dy < minDistY;
        });
        if (!overlaps) {
          positions.set(zone.id, { x, y });
          placed.push({
            id: zone.id,
            x,
            y,
            width: zoneWidth,
            height: zoneHeight,
          });
          placedOk = true;
        }
        attempts++;
      }
      if (!placedOk) {
        const spiralRadius =
          Math.ceil(Math.sqrt(index)) * (zoneWidth + ZONE_SPACING);
        const angle = (index * 137.5) % 360;
        const x = spiralRadius * Math.cos((angle * Math.PI) / 180);
        const y = spiralRadius * Math.sin((angle * Math.PI) / 180);
        positions.set(zone.id, { x, y });
      }
    });
    return positions;
  };

  const zonePositions = calculateZonePositions(mapData.zones);
  log.info?.('worldMap:zone-positions', { count: zonePositions.size });

  // First pass: room positions
  const zoneRoomPositions = new Map<
    number,
    Array<{ roomId: number; x: number; y: number }>
  >();
  mapData.zones.forEach(zoneBounds => {
    const zonePos = zonePositions.get(zoneBounds.id) || { x: 0, y: 0 };
    const zoneRooms = mapData.rooms.filter(r => r.zoneId === zoneBounds.id);
    const roomPositions: Array<{ roomId: number; x: number; y: number }> = [];
    zoneRooms
      .filter(r => r.layoutX !== null && r.layoutY !== null)
      .forEach(room => {
        const roomLocalX = (room.layoutX || 0) - zoneBounds.minX;
        const roomLocalY = (room.layoutY || 0) - zoneBounds.minY;
        const normalizedX =
          zoneBounds.maxX !== zoneBounds.minX
            ? roomLocalX / (zoneBounds.maxX - zoneBounds.minX)
            : 0.5;
        const normalizedY =
          zoneBounds.maxY !== zoneBounds.minY
            ? roomLocalY / (zoneBounds.maxY - zoneBounds.minY)
            : 0.5;
        const baseWidth = Math.max(
          (zoneBounds.maxX - zoneBounds.minX) * ZONE_SCALE,
          120
        );
        const baseHeight = Math.max(
          (zoneBounds.maxY - zoneBounds.minY) * ZONE_SCALE,
          120
        );
        const x = zonePos.x + (normalizedX - 0.5) * baseWidth;
        const y = zonePos.y + (normalizedY - 0.5) * baseHeight;
        roomPositions.push({ roomId: room.id, x, y });
      });
    zoneRoomPositions.set(zoneBounds.id, roomPositions);
  });

  // Second pass: zone boundary nodes + (optional) rooms
  mapData.zones.forEach(zoneBounds => {
    const zonePos = zonePositions.get(zoneBounds.id) || { x: 0, y: 0 };
    const roomPositions = zoneRoomPositions.get(zoneBounds.id) || [];
    let minX = zonePos.x,
      maxX = zonePos.x,
      minY = zonePos.y,
      maxY = zonePos.y;
    if (roomPositions.length > 0) {
      const allRoomPositions: Array<{ x: number; y: number }> = [];
      mapData.rooms
        .filter(
          r =>
            r.zoneId === zoneBounds.id &&
            r.layoutX !== null &&
            r.layoutY !== null
        )
        .forEach(room => {
          const roomLocalX = (room.layoutX || 0) - zoneBounds.minX;
          const roomLocalY = (room.layoutY || 0) - zoneBounds.minY;
          const normalizedX =
            zoneBounds.maxX !== zoneBounds.minX
              ? roomLocalX / (zoneBounds.maxX - zoneBounds.minX)
              : 0.5;
          const normalizedY =
            zoneBounds.maxY !== zoneBounds.minY
              ? roomLocalY / (zoneBounds.maxY - zoneBounds.minY)
              : 0.5;
          const baseWidth = Math.max(
            (zoneBounds.maxX - zoneBounds.minX) * ZONE_SCALE,
            120
          );
          const baseHeight = Math.max(
            (zoneBounds.maxY - zoneBounds.minY) * ZONE_SCALE,
            120
          );
          const x = zonePos.x + (normalizedX - 0.5) * baseWidth;
          const y = zonePos.y + (normalizedY - 0.5) * baseHeight;
          allRoomPositions.push({ x, y });
        });
      if (allRoomPositions.length) {
        const xs = allRoomPositions.map(r => r.x);
        const ys = allRoomPositions.map(r => r.y);
        minX = Math.min(...xs);
        maxX = Math.max(...xs);
        minY = Math.min(...ys);
        maxY = Math.max(...ys);
      }
    }
    const padding = 60;
    const zoneWidth = Math.max(maxX - minX + 2 * padding, 160);
    const zoneHeight = Math.max(maxY - minY + 2 * padding, 120);
    const zoneCenterX = (minX + maxX) / 2;
    const zoneCenterY = (minY + maxY) / 2;
    nodes.push({
      id: `zone-boundary-${zoneBounds.id}`,
      type: 'zone',
      position: {
        x: zoneCenterX - zoneWidth / 2,
        y: zoneCenterY - zoneHeight / 2,
      },
      data: {
        zoneId: zoneBounds.id,
        name: zoneBounds.name,
        climate: zoneBounds.climate,
        roomCount: zoneBounds.roomCount,
        bounds: zoneBounds,
        width: zoneWidth,
        height: zoneHeight,
        onZoneSelect: handleZoneSelect,
      },
      draggable: false,
      selectable: true,
      style: { zIndex: 1 },
    });

    // Only render room nodes at deep zoom (>0.8)
    if (zoom > 0.8) {
      const limitedRooms = roomPositions.slice(0, 20);
      limitedRooms.forEach(({ roomId }) => {
        const room = mapData.rooms.find(r => r.id === roomId);
        if (!room || room.layoutX === null || room.layoutY === null) return;
        const roomLocalX = (room.layoutX || 0) - zoneBounds.minX;
        const roomLocalY = (room.layoutY || 0) - zoneBounds.minY;
        const normalizedX =
          zoneBounds.maxX !== zoneBounds.minX
            ? roomLocalX / (zoneBounds.maxX - zoneBounds.minX)
            : 0.5;
        const normalizedY =
          zoneBounds.maxY !== zoneBounds.minY
            ? roomLocalY / (zoneBounds.maxY - zoneBounds.minY)
            : 0.5;
        const roomX =
          zoneCenterX - zoneWidth / 2 + 20 + normalizedX * (zoneWidth - 40);
        const roomY =
          zoneCenterY - zoneHeight / 2 + 20 + normalizedY * (zoneHeight - 40);
        nodes.push({
          id: `room-${room.id}`,
          type: 'worldRoom',
          position: { x: roomX, y: roomY },
          data: {
            roomId: room.id,
            name: room.name,
            sector: room.sector,
            zoneId: room.zoneId,
            zoneName: zoneBounds.name,
            onRoomSelect: handleRoomSelect,
          },
          draggable: false,
          selectable: true,
          style: {
            width: 3,
            height: 3,
            backgroundColor: getThemeColor('#10b981', '#10b981'),
            border: `1px solid ${getThemeColor('#374151', '#6b7280')}`,
            borderRadius: '3px',
            zIndex: 10,
            opacity: zoom > 0.4 ? 1.0 : 0.8,
          },
        });
      });
    }
  });

  log.info?.('worldMap:generated', { nodes: nodes.length, cacheKey });

  cache.set(cacheKey, { nodes, timestamp: Date.now() });
  if (cache.size > 5) {
    const entries = Array.from(cache.entries()).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );
    cache.clear();
    entries.slice(0, 5).forEach(([k, v]) => cache.set(k, v));
  }

  return nodes;
}
