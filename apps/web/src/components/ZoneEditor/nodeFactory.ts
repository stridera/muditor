import type { OverlapInfo } from '@muditor/types';
import { detectOneWayExits } from '@muditor/types';
import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';

// Minimal room & exit types (align with EnhancedZoneEditor locally)
export interface FactoryRoom {
  id: number;
  name: string;
  description: string;
  sector: string;
  zoneId: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: Array<{
    id?: string;
    direction: string;
    toRoomId: number | null;
    toZoneId?: number | null;
    description?: string | null;
  }>;
  mobs?: unknown[];
  objects?: unknown[];
  shops?: unknown[];
}

interface OneWayExitDescriptor {
  fromRoom: number;
  toRoom: number;
  isOneWay: boolean;
  reason?: string;
}

interface GenerateParams {
  rooms: FactoryRoom[];
  overlaps: OverlapInfo[];
  currentZLevel: number;
  selectedRoomId: number | null;
  nodePositionsRef: React.MutableRefObject<
    Record<string, { x: number; y: number }>
  >;
  gridToPixels: (grid: number) => number;
  gridToPixelsY: (grid: number) => number;
  getActiveOverlapIndex: (roomId: number, roomIds: number[]) => number;
  handleSwitchOverlapRoom: (
    roomId: number,
    roomIds: number[],
    direction: 'next' | 'prev'
  ) => void;
  viewMode: 'edit' | 'view';
  getThemeColor: (light: string, dark: string) => string;
}

interface GeneratedGraph {
  nodes: Node[];
  edges: Edge[];
  oneWayExits: OneWayExitDescriptor[];
}

// Internal layout representation for one-way exit detection
interface AutoLayoutRoom {
  id: number;
  name: string;
  description: string;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
  exits: Array<{ direction: string; toRoomId: number | null }>;
}

export function generateNodesAndEdges({
  rooms,
  overlaps,
  currentZLevel,
  selectedRoomId,
  nodePositionsRef,
  gridToPixels,
  gridToPixelsY,
  getActiveOverlapIndex,
  handleSwitchOverlapRoom,
  viewMode,
  getThemeColor,
}: GenerateParams): GeneratedGraph {
  // Helper to derive persistent node position
  const getNodePosition = (room: FactoryRoom, index: number, total: number) => {
    const cacheKey = `${room.zoneId}-${room.id}`;
    if (nodePositionsRef.current[cacheKey])
      return nodePositionsRef.current[cacheKey];
    if (room.layoutX !== null && room.layoutY !== null) {
      const position = {
        x: gridToPixels(room.layoutX!),
        y: gridToPixelsY(room.layoutY!),
      };
      nodePositionsRef.current[cacheKey] = position;
      return position;
    }
    if (total === 1) {
      const position = { x: gridToPixels(2), y: gridToPixels(1) };
      nodePositionsRef.current[cacheKey] = position;
      return position;
    }
    const cols = Math.max(3, Math.ceil(Math.sqrt(total * 1.2)));
    const col = index % cols;
    const row = Math.floor(index / cols);
    const position = {
      x: gridToPixels(col * 3 + 1),
      y: gridToPixels(row * 3 + 1),
    };
    nodePositionsRef.current[cacheKey] = position;
    return position;
  };

  // Nodes
  const nodes: Node[] = rooms.map((room, index): Node => {
    const overlappingWith = overlaps.find(o => o.roomIds.includes(room.id));
    const roomZ = room.layoutZ ?? 0;
    const floorDiff = roomZ - currentZLevel;
    const isCurrentFloor = floorDiff === 0;
    const isSelected = room.id === selectedRoomId;

    let opacity = 1;
    let offsetX = 0;
    let offsetY = 0;
    let zIndex = 100;
    if (!isCurrentFloor) {
      opacity = 0.4;
      if (floorDiff > 0) {
        offsetX = -floorDiff * 18;
        offsetY = -floorDiff * 18;
      } else {
        offsetX = Math.abs(floorDiff) * 18;
        offsetY = Math.abs(floorDiff) * 18;
      }
      zIndex = 100 - Math.abs(floorDiff);
    }

    let totalOverlaps = 1;
    if (overlappingWith && overlappingWith.roomIds.length > 1) {
      const overlapIndex = overlappingWith.roomIds.indexOf(room.id);
      totalOverlaps = overlappingWith.roomIds.length;
      const STACK_OFFSET = 15;
      offsetX += overlapIndex * STACK_OFFSET;
      zIndex += overlapIndex;
    }

    if (isSelected) zIndex = 1000;
    const nodePosition = getNodePosition(room, index, rooms.length);

    const node: Node = {
      id: room.id.toString(),
      type: 'room',
      position: { x: nodePosition.x + offsetX, y: nodePosition.y + offsetY },
      width: 180,
      height: 140,
      data: {
        roomId: room.id,
        zoneId: room.zoneId,
        name: room.name,
        sector: room.sector,
        description: room.description,
        exits: room.exits,
        mobs: room.mobs || [],
        objects: room.objects || [],
        shops: room.shops || [],
        layoutZ: room.layoutZ,
        room,
        isOverlapping: !!overlappingWith,
        overlapInfo: overlappingWith,
        currentZLevel,
        isCurrentFloor,
        depthOpacity: opacity,
        isSelected,
        overlappedRooms:
          overlappingWith?.roomIds?.map(id => {
            const r = rooms.find(rm => rm.id === id);
            return { id, name: r?.name || `Room ${id}` };
          }) || [],
        overlapIndex: overlappingWith
          ? overlappingWith.roomIds.indexOf(room.id)
          : undefined,
        totalOverlaps: totalOverlaps > 1 ? totalOverlaps : undefined,
        activeOverlapIndex: getActiveOverlapIndex(
          room.id,
          overlappingWith?.roomIds || []
        ),
        onSwitchOverlapRoom: (direction: 'next' | 'prev') =>
          handleSwitchOverlapRoom(
            room.id,
            overlappingWith?.roomIds || [],
            direction
          ),
      },
      draggable: viewMode === 'edit' && isCurrentFloor,
      className: overlappingWith ? 'room-overlapping' : undefined,
      style: {
        zIndex,
        filter: !isCurrentFloor ? 'grayscale(0.3)' : undefined,
      },
    } as Node;
    return node;
  });

  // One-way exits detection
  const layoutRooms: AutoLayoutRoom[] = rooms.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    layoutX: r.layoutX ?? null,
    layoutY: r.layoutY ?? null,
    layoutZ: r.layoutZ ?? null,
    exits: r.exits.map(e => ({ direction: e.direction, toRoomId: e.toRoomId })),
  }));
  const oneWayExits = detectOneWayExits(layoutRooms) as OneWayExitDescriptor[];

  // Edges
  const edges: Edge[] = [];
  rooms.forEach(room => {
    const roomZLevel = room.layoutZ ?? 0;
    const floorDiff = Math.abs(currentZLevel - roomZLevel);
    const edgeZIndex = 100 - floorDiff;

    room.exits.forEach(exit => {
      if (exit.direction === 'UP' || exit.direction === 'DOWN') return;
      const targetZoneId = exit.toZoneId ?? room.zoneId;
      const targetRoom = rooms.find(
        r => r.zoneId === targetZoneId && r.id === exit.toRoomId
      );
      if (exit.toRoomId != null && targetRoom) {
        const isOverlappingEdge = overlaps.some(
          o => o.roomIds.includes(room.id) || o.roomIds.includes(exit.toRoomId!)
        );
        const oneWayExit = oneWayExits.find(
          owe => owe.fromRoom === room.id && owe.toRoom === exit.toRoomId
        );
        const isOneWay = oneWayExit?.isOneWay || false;
        let edgeColor = getThemeColor('#6b7280', '#9ca3af');
        let strokeWidth = 2;
        let strokeDasharray: string | undefined;
        let animated = false;
        if (isOverlappingEdge) {
          edgeColor = getThemeColor('#ea580c', '#f97316');
          strokeWidth = 3;
        } else if (isOneWay) {
          edgeColor = getThemeColor('#dc2626', '#ef4444');
          strokeWidth = 2.5;
          strokeDasharray = '8,4';
          animated = true;
        }
        if (!exit.description) strokeDasharray = strokeDasharray || '5,5';
        const edgeOpacity =
          floorDiff === 0 ? 1.0 : Math.max(0.15, 1 - floorDiff * 0.35);
        const edge: Edge = {
          id: `${room.id}-${exit.toRoomId}-${exit.direction}`,
          source: room.id.toString(),
          target: exit.toRoomId!.toString(),
          type: 'straight',
          animated,
          style: {
            stroke: edgeColor,
            strokeWidth,
            strokeDasharray,
            opacity: edgeOpacity,
            zIndex: edgeZIndex,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: isOneWay ? 18 : 15,
            height: isOneWay ? 18 : 15,
            color: edgeColor,
          },
          label: isOneWay
            ? `🚫 One-way (${oneWayExit?.reason?.replace('_', ' ')})`
            : undefined,
          // labelStyle omitted for strict typing
          sourceHandle: null,
          targetHandle: null,
        };
        edges.push(edge);
      }
    });
  });

  return { nodes, edges, oneWayExits };
}
