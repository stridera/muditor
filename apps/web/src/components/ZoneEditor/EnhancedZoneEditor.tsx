'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './zone-editor.css';
import { useTheme } from 'next-themes';

import { RoomNode } from './RoomNode';
import { MobNode } from './MobNode';
import { ObjectNode } from './ObjectNode';
import { WorldMapZone } from './WorldMapZone';
import { WorldMapRoom } from './WorldMapRoom';
import { PortalNode } from './PortalNode';
import { WorldMapCanvas } from './WorldMapCanvas';
import { PropertyPanel } from './PropertyPanel';
import { EntityPalette, Mob, type Object as EntityObject } from './EntityPalette';
import { authenticatedFetch, authenticatedGraphQLFetch } from '@/lib/authenticated-fetch';
import { usePermissions } from '@/hooks/use-permissions';
import ZoneSelector from '../ZoneSelector';

// Grid Configuration
const GRID_SIZE = 180; // Grid cell size in pixels (matches room size)
const GRID_SCALE = 10; // Scale factor: 1 grid unit = 10 pixels
const ROOM_SPACING_MULTIPLIER = 1.5; // Multiply database coordinates for better spacing (rooms are ~200px wide × 120px tall) - reduced from 4.0 to bring rooms closer

// Helper functions
const snapToGrid = (value: number): number =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;
const pixelsToGrid = (pixels: number): number => Math.round(pixels / (GRID_SIZE * ROOM_SPACING_MULTIPLIER));
const gridToPixels = (grid: number): number => grid * GRID_SIZE * ROOM_SPACING_MULTIPLIER;
// Y-axis conversion helpers (inverted for screen coordinates)
const pixelsToGridY = (pixels: number): number => -pixelsToGrid(pixels); // Negate to convert screen Y back to world Y
const gridToPixelsY = (grid: number): number => gridToPixels(-grid); // Negate world Y to get screen Y



// World map types
interface ZoneBounds {
  id: number;
  name: string;
  climate: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
  roomCount: number;
}

interface WorldMapRoom {
  id: number;
  name: string;
  sector: string;
  zoneId: number;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
}

interface ZoneMapData {
  zones: ZoneBounds[];
  rooms: WorldMapRoom[];
  globalBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

type ViewMode = 'world-map' | 'zone-overview' | 'room-detail';

interface WorldMapZone {
  id: string;
  type: 'zone';
  data: {
    zoneId: number;
    name: string;
    climate: string;
    roomCount: number;
    bounds: ZoneBounds;
  };
  position: { x: number; y: number };
  style?: React.CSSProperties;
}

interface WorldMapRoomNode {
  id: string;
  type: 'worldRoom';
  data: {
    roomId: number;
    name: string;
    sector: string;
    zoneId: number;
    zoneName: string;
    onRoomSelect?: (roomId: number) => void;
  };
  position: { x: number; y: number };
  style?: React.CSSProperties;
}


// Import shared auto-layout utilities
import { autoLayoutRooms as sharedAutoLayoutRooms, resolveOverlaps as sharedResolveOverlaps, detectOverlaps as sharedDetectOverlaps, detectOneWayExits, LayoutPosition, OverlapInfo, AutoLayoutRoom, AutoLayoutExit } from '@muditor/types';

// Adapter function to convert editor Room type to shared AutoLayoutRoom type
const convertToAutoLayoutRoom = (room: Room): AutoLayoutRoom => ({
  id: room.id,
  name: room.name,
  description: room.description,
  layoutX: room.layoutX,
  layoutY: room.layoutY,
  layoutZ: room.layoutZ,
  exits: room.exits.map(exit => ({
    direction: exit.direction,
    toRoomId: exit.toRoomId
  }))
});

// Wrapper function for the shared algorithm
const autoLayoutRooms = (rooms: Room[], startRoomId?: number): Record<number, LayoutPosition> => {
  // Convert rooms to the shared format
  const sharedRooms = rooms.map(convertToAutoLayoutRoom);
  // Call the shared algorithm
  return sharedAutoLayoutRooms(sharedRooms, startRoomId);
};

// Wrapper for overlap detection
const detectOverlaps = (positions: Record<number, LayoutPosition>): OverlapInfo[] => {
  return sharedDetectOverlaps(positions);
};

// Wrapper for overlap resolution
const resolveOverlaps = (positions: Record<number, LayoutPosition>): Record<number, LayoutPosition> => {
  return sharedResolveOverlaps(positions);
};



// Types
interface Room {
  id: number;
  name: string;
  description: string;
  sector: string;
  zoneId: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: RoomExit[];
  mobs?: Mob[];
  objects?: EntityObject[];
  shops?: Array<{ id: number; buyProfit: number; sellProfit: number; keeperId: number; zoneId: number }>;
}

interface RoomExit {
  id: string;
  direction: string;
  toZoneId: number | null;
  toRoomId: number | null;
  description?: string;
  keyword?: string;
}

interface Zone {
  id: number;
  name: string;
  climate: string;
}

// Using imported Object interface from EntityPalette instead

interface EnhancedZoneEditorProps {
  zoneId?: number; // Optional for world map mode
  initialRoomId?: number; // Initial room to select from URL
  worldMapMode?: boolean; // Enable world map viewing all zones
}

const nodeTypes = {
  room: RoomNode,
  mob: MobNode,
  object: ObjectNode,
  zone: WorldMapZone,
  worldRoom: WorldMapRoom,
  portal: PortalNode,
};

const EnhancedZoneEditorFlow: React.FC<EnhancedZoneEditorProps> = ({
  zoneId,
  initialRoomId,
  worldMapMode = false,
}) => {
  const router = useRouter();
  const reactFlowInstance = useReactFlow();
  const { canEditZone, isBuilder, isCoder, isGod } = usePermissions();
  const { theme } = useTheme();

  // State
  const [zone, setZone] = useState<Zone | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mobs, setMobs] = useState<Mob[]>([]);
  const [objects, setObjects] = useState<EntityObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Wrapper for setSelectedRoomId
  const handleSelectRoom = useCallback((roomId: number) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    setEditedRoom(room ? { ...room } : null);

    // Auto-switch to the selected room's floor so it's fully visible
    if (room) {
      const roomFloor = room.layoutZ ?? 0;
      setCurrentZLevel(roomFloor);
      console.log(`🏢 Auto-switched to floor Z${roomFloor} for selected room ${roomId}`);
    }

    // Update URL to include room parameter for refresh persistence
    if (zoneId) {
      const newUrl = `/dashboard/zones/editor?zone=${zoneId}&room=${roomId}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [rooms, zoneId, router]);

  // Handler for cross-zone navigation
  const handleNavigateToZone = useCallback((targetZoneId: number, targetRoomId: number) => {
    console.log(`🌐 Navigating to zone ${targetZoneId}, room ${targetRoomId}`);
    // Navigate to the target zone with the room selected
    router.push(`/dashboard/zones/editor?zone=${targetZoneId}&room=${targetRoomId}`);
  }, [router]);

  const [editedRoom, setEditedRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [managingExits, setManagingExits] = useState(false);
  const [showEntityPalette, setShowEntityPalette] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('view');
  const [currentZLevel, setCurrentZLevel] = useState<number>(0); // Current floor being viewed
  const hasInitializedZLevel = useRef<boolean>(false); // Track if Z-level has been initialized
  const hasPerformedInitialFit = useRef<boolean>(false); // Track if initial fit has been performed

  // World map state
  const [allZones, setAllZones] = useState<Zone[]>([]);
  const [zoneMapData, setZoneMapData] = useState<ZoneMapData | null>(null);
  const [useCanvasRendering, setUseCanvasRendering] = useState(false);
  const [canvasClusters, setCanvasClusters] = useState<Array<{
    rooms: WorldMapRoom[];
    centerX: number;
    centerY: number;
    dominantSector: string;
    size: number;
  }>>([]);

  // Performance optimization and caching
  const lastLODUpdate = useRef<number>(0);
  const LOD_THROTTLE_MS = 300; // Further increased throttle for better performance
  const lastViewportRef = useRef<{ x: number; y: number; zoom: number } | null>(null);
  const worldNodesCache = useRef<Map<string, { nodes: Node[]; timestamp: number }>>(new Map());
  const CACHE_DURATION = 120000; // Cache world nodes for 2 minutes for better performance
  const viewModeTransitionRef = useRef<NodeJS.Timeout | null>(null);
  const worldMapTransitionRef = useRef<boolean>(false);
  const customZoneTransitionDone = useRef<boolean>(false);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>('room-detail');
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(zoneId);
  const [overlaps, setOverlaps] = useState<OverlapInfo[]>([]);
  const [showOverlapInfo, setShowOverlapInfo] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showLayoutTools, setShowLayoutTools] = useState(false);

  // Overlap management state - tracks which room is currently active in each overlapped position
  const [activeOverlapRooms, setActiveOverlapRooms] = useState<Record<string, number>>({});

  // Theme-aware color helpers
  const isDark = theme === 'dark';
  const getThemeColor = useCallback((lightColor: string, darkColor: string) => {
    return isDark ? darkColor : lightColor;
  }, [isDark]);

  // Helper functions for overlap management
  const getPositionKey = (x: number, y: number, z: number = 0) => `${x},${y},${z}`;

  const getActiveOverlapIndex = useCallback((roomId: number, overlappedRoomIds: number[]) => {
    if (!overlappedRoomIds.includes(roomId)) return 0;

    const positionKey = `overlapped-${overlappedRoomIds.join('-')}`;
    const activeRoomId = activeOverlapRooms[positionKey];

    if (activeRoomId && overlappedRoomIds.includes(activeRoomId)) {
      return overlappedRoomIds.indexOf(activeRoomId);
    }

    // Default to first room if no active room is set
    return overlappedRoomIds.indexOf(roomId);
  }, [activeOverlapRooms]);

  const handleSwitchOverlapRoom = useCallback((roomId: number, overlappedRoomIds: number[], direction: 'next' | 'prev') => {
    if (overlappedRoomIds.length <= 1) return;

    const currentIndex = overlappedRoomIds.indexOf(roomId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % overlappedRoomIds.length;
    } else {
      newIndex = currentIndex === 0 ? overlappedRoomIds.length - 1 : currentIndex - 1;
    }

    const newActiveRoomId = overlappedRoomIds[newIndex];
    const positionKey = `overlapped-${overlappedRoomIds.join('-')}`;

    setActiveOverlapRooms(prev => ({
      ...prev,
      [positionKey]: newActiveRoomId
    }));

    // Update selected room to the new active room
    setSelectedRoomId(newActiveRoomId);

    console.log(`🔄 Switched overlap room from ${roomId} to ${newActiveRoomId} (direction: ${direction})`);
  }, [activeOverlapRooms, setSelectedRoomId]);

  // Undo system for room positions
  interface UndoAction {
    type: 'MOVE_ROOM' | 'MOVE_MULTIPLE_ROOMS';
    timestamp: number;
    roomId?: number;
    roomIds?: number[];
    previousPosition?: { x: number; y: number };
    previousPositions?: Record<number, { x: number; y: number }>;
    newPosition?: { x: number; y: number };
    newPositions?: Record<number, { x: number; y: number }>;
  }

  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const [undoIndex, setUndoIndex] = useState(-1);
  const MAX_UNDO_HISTORY = 50;

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Track current node positions to prevent position loss during re-renders
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Store original positions for reset functionality
  const [originalPositions, setOriginalPositions] = useState<Record<number, { x: number; y: number }>>({});

  // Undo/Redo functionality (defined early to avoid initialization order issues)
  const addToUndoHistory = useCallback((action: UndoAction) => {
    setUndoHistory(prevHistory => {
      // Remove any redo history if we're not at the end
      const newHistory = prevHistory.slice(0, undoIndex + 1);
      newHistory.push(action);

      // Limit history size
      if (newHistory.length > MAX_UNDO_HISTORY) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setUndoIndex(prevIndex => Math.min(prevIndex + 1, MAX_UNDO_HISTORY - 1));
  }, [undoIndex]);

  const canUndo = undoIndex >= 0;
  const canRedo = undoIndex < undoHistory.length - 1;

  const handleUndo = useCallback(async () => {
    if (!canUndo || undoIndex < 0) return;

    const action = undoHistory[undoIndex];
    // console.log('🔄 Undoing action:', action.type);

    try {
      if (action.type === 'MOVE_ROOM' && action.roomId && action.previousPosition) {
        // Undo single room move
        const roomId = action.roomId;
        const prevPos = action.previousPosition;
        const currentRoom = rooms.find(r => r.id === roomId);
        const currentZ = currentRoom?.layoutZ ?? 0;

        // Update database using exact same pattern as working onNodeDragStop
        const response = await authenticatedFetch(
          'http://localhost:4000/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
              mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
                updateRoomPosition(id: $id, position: $position) {
                  id
                  layoutX
                  layoutY
                  layoutZ
                }
              }
            `,
              variables: {
                id: roomId,
                position: {
                  layoutX: pixelsToGrid(prevPos.x),
                  layoutY: pixelsToGridY(prevPos.y),
                  layoutZ: currentZ,
                },
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            // Update React Flow nodes
            setNodes(nodes =>
              nodes.map(node =>
                node.id === roomId.toString()
                  ? { ...node, position: prevPos }
                  : node
              )
            );

            // Update local room state
            setRooms(prevRooms =>
              prevRooms.map(room =>
                room.id === roomId
                  ? {
                    ...room,
                    layoutX: pixelsToGrid(prevPos.x),
                    layoutY: pixelsToGridY(prevPos.y),
                  }
                  : room
              )
            );

            // console.log(`✅ Undid movement for room ${roomId}`);
          } else {
            console.error(`❌ GraphQL error for undo room ${roomId}:`, data.errors[0].message);
          }
        } else {
          console.error(`❌ HTTP error for undo room ${roomId}:`, response.status);
        }
      } else if (action.type === 'MOVE_MULTIPLE_ROOMS' && action.previousPositions) {
        // Undo multiple room moves (from auto-layout) using batch update
        const updates = Object.entries(action.previousPositions).map(([roomIdStr, prevPos]) => {
          const roomId = parseInt(roomIdStr);
          const currentRoom = rooms.find(r => r.id === roomId);
          const currentZ = currentRoom?.layoutZ ?? 0;

          return {
            roomId,
            layoutX: pixelsToGrid(prevPos.x),
            layoutY: pixelsToGridY(prevPos.y),
            layoutZ: currentZ,
          };
        });

        // console.log(`🔄 Batch undoing ${updates.length} room positions...`);

        const response = await authenticatedFetch(
          'http://localhost:4000/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
                mutation BatchUpdateRoomPositions($input: BatchUpdateRoomPositionsInput!) {
                  batchUpdateRoomPositions(input: $input) {
                    updatedCount
                    errors
                  }
                }
              `,
              variables: {
                input: {
                  updates,
                },
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            const result = data.data.batchUpdateRoomPositions;
            // console.log(`✅ Batch undid ${result.updatedCount} room positions successfully`);

            if (result.errors && result.errors.length > 0) {
              console.warn(`⚠️ Some undo operations had issues:`, result.errors);
            }

            // Update React Flow nodes
            setNodes(nodes =>
              nodes.map(node => {
                const prevPos = action.previousPositions?.[parseInt(node.id)];
                return prevPos ? { ...node, position: prevPos } : node;
              })
            );

            // Update local room state
            setRooms(prevRooms =>
              prevRooms.map(room => {
                const prevPos = action.previousPositions?.[room.id];
                if (prevPos) {
                  return {
                    ...room,
                    layoutX: pixelsToGrid(prevPos.x),
                    layoutY: pixelsToGridY(prevPos.y),
                  };
                }
                return room;
              })
            );
          } else {
            console.error(`❌ GraphQL error in batch undo:`, data.errors[0].message);
            throw new Error(data.errors[0].message);
          }
        } else {
          console.error(`❌ HTTP error in batch undo:`, response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      setUndoIndex(prevIndex => prevIndex - 1);
    } catch (error) {
      console.error('❌ Failed to undo:', error);
    }
  }, [canUndo, undoIndex, undoHistory, rooms, setNodes, setRooms]);

  const handleRedo = useCallback(async () => {
    if (!canRedo) return;

    const nextIndex = undoIndex + 1;
    const action = undoHistory[nextIndex];
    // console.log('🔄 Redoing action:', action.type);

    try {
      if (action.type === 'MOVE_ROOM' && action.roomId && action.newPosition) {
        // Redo single room move
        const roomId = action.roomId;
        const newPos = action.newPosition;
        const currentRoom = rooms.find(r => r.id === roomId);
        const currentZ = currentRoom?.layoutZ ?? 0;

        // Update database using exact same pattern as working onNodeDragStop
        const response = await authenticatedFetch(
          'http://localhost:4000/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
              mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
                updateRoomPosition(id: $id, position: $position) {
                  id
                  layoutX
                  layoutY
                  layoutZ
                }
              }
            `,
              variables: {
                id: roomId,
                position: {
                  layoutX: pixelsToGrid(newPos.x),
                  layoutY: pixelsToGridY(newPos.y),
                  layoutZ: currentZ,
                },
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            // Update React Flow nodes
            setNodes(nodes =>
              nodes.map(node =>
                node.id === roomId.toString()
                  ? { ...node, position: newPos }
                  : node
              )
            );

            // Update local room state
            setRooms(prevRooms =>
              prevRooms.map(room =>
                room.id === roomId
                  ? {
                    ...room,
                    layoutX: pixelsToGrid(newPos.x),
                    layoutY: pixelsToGrid(newPos.y),
                  }
                  : room
              )
            );

            // console.log(`✅ Redid movement for room ${roomId}`);
          } else {
            console.error(`❌ GraphQL error for redo room ${roomId}:`, data.errors[0].message);
          }
        } else {
          console.error(`❌ HTTP error for redo room ${roomId}:`, response.status);
        }
      } else if (action.type === 'MOVE_MULTIPLE_ROOMS' && action.newPositions) {
        // Redo multiple room moves (from auto-layout) using batch update
        const updates = Object.entries(action.newPositions).map(([roomIdStr, newPos]) => {
          const roomId = parseInt(roomIdStr);
          const currentRoom = rooms.find(r => r.id === roomId);
          const currentZ = currentRoom?.layoutZ ?? 0;

          return {
            roomId,
            layoutX: pixelsToGrid(newPos.x),
            layoutY: pixelsToGridY(newPos.y),
            layoutZ: currentZ,
          };
        });

        // console.log(`🔄 Batch redoing ${updates.length} room positions...`);

        const response = await authenticatedFetch(
          'http://localhost:4000/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
                mutation BatchUpdateRoomPositions($input: BatchUpdateRoomPositionsInput!) {
                  batchUpdateRoomPositions(input: $input) {
                    updatedCount
                    errors
                  }
                }
              `,
              variables: {
                input: {
                  updates,
                },
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            const result = data.data.batchUpdateRoomPositions;
            // console.log(`✅ Batch redid ${result.updatedCount} room positions successfully`);

            if (result.errors && result.errors.length > 0) {
              console.warn(`⚠️ Some redo operations had issues:`, result.errors);
            }

            // Update React Flow nodes
            setNodes(nodes =>
              nodes.map(node => {
                const redoPos = action.newPositions?.[parseInt(node.id)];
                return redoPos ? { ...node, position: redoPos } : node;
              })
            );

            // Update local room state
            setRooms(prevRooms =>
              prevRooms.map(room => {
                const redoPos = action.newPositions?.[room.id];
                if (redoPos) {
                  return {
                    ...room,
                    layoutX: pixelsToGrid(redoPos.x),
                    layoutY: pixelsToGridY(redoPos.y),
                  };
                }
                return room;
              })
            );
          } else {
            console.error(`❌ GraphQL error in batch redo:`, data.errors[0].message);
            throw new Error(data.errors[0].message);
          }
        } else {
          console.error(`❌ HTTP error in batch redo:`, response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      setUndoIndex(nextIndex);
    } catch (error) {
      console.error('❌ Failed to redo:', error);
    }
  }, [canRedo, undoIndex, undoHistory, rooms, setNodes, setRooms]);

  const handleResetLayout = useCallback(async () => {
    if (!rooms || rooms.length === 0 || Object.keys(originalPositions).length === 0) return;

    try {
      // console.log(`🔄 Resetting layout to original load positions...`);

      // Store current positions for undo
      const previousPositions: Record<number, { x: number; y: number }> = {};
      nodes.forEach(node => {
        previousPositions[parseInt(node.id)] = { ...node.position };
      });

      // Reset nodes to their original positions from when zone was first loaded
      const resetNodes = nodes.map(node => {
        const roomId = parseInt(node.id);
        const originalPosition = originalPositions[roomId];

        if (originalPosition) {
          // Update position ref with zone-specific key
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            const cacheKey = `${room.zoneId}-${room.id}`;
            nodePositionsRef.current[cacheKey] = originalPosition;
          }

          return {
            ...node,
            position: originalPosition,
          };
        }

        // Should not happen, but fallback to current position if no original found
        console.warn(`⚠️ No original position found for room ${roomId}`);
        return node;
      });

      // Add to undo history
      addToUndoHistory({
        type: 'MOVE_MULTIPLE_ROOMS',
        timestamp: Date.now(),
        roomIds: rooms.map(r => r.id),
        previousPositions,
        newPositions: Object.fromEntries(
          resetNodes.map(node => [
            parseInt(node.id),
            node.position,
          ])
        ),
      });

      // Update React Flow nodes
      setNodes(resetNodes);

      // Clear overlaps and overlap info
      setOverlaps([]);
      setShowOverlapInfo(false);

      // console.log(`✅ Layout reset to original load positions for ${resetNodes.length} rooms`);

    } catch (error) {
      console.error('❌ Failed to reset layout:', error);
    }
  }, [rooms, nodes, setNodes, addToUndoHistory, originalPositions]);

  // Auto-layout algorithm for systematic room positioning
  const generateAutoLayout = useCallback((allRooms: WorldMapRoom[], startRoomId: number = 3001): Map<number, { x: number; y: number; z: number; zoneId: number; isOverlapping?: boolean; group?: string }> => {
    // console.log('🗺️ Starting auto-layout algorithm from room', startRoomId);

    // Create room lookup maps
    const roomById = new Map(allRooms.map(room => [room.id, room]));
    const roomsByZone = new Map<number, WorldMapRoom[]>();
    allRooms.forEach(room => {
      if (!roomsByZone.has(room.zoneId)) {
        roomsByZone.set(room.zoneId, []);
      }
      roomsByZone.get(room.zoneId)!.push(room);
    });

    // Create exit lookup map
    const exitsByRoom = new Map<number, { direction: string; toRoomId: number | null }[]>();
    allRooms.forEach(room => {
      const exits: Array<{ direction: string; toRoomId: number | null }> = [];
      // Parse exits from room data - assuming they're in a property like 'exits'
      if ((room as any).exits && Array.isArray((room as any).exits)) {
        (room as any).exits.forEach((exit: any) => {
          if (exit.toRoomId) {
            exits.push({ direction: exit.direction, toRoomId: exit.toRoomId });
          }
        });
      }
      exitsByRoom.set(room.id, exits);
    });

    // Direction vectors: North=+Y, South=-Y, East=+X, West=-X, Up=+Z, Down=-Z
    const directionVectors = {
      'NORTH': { x: 0, y: 1, z: 0 },
      'SOUTH': { x: 0, y: -1, z: 0 },
      'EAST': { x: 1, y: 0, z: 0 },
      'WEST': { x: -1, y: 0, z: 0 },
      'UP': { x: 0, y: 0, z: 1 },
      'DOWN': { x: 0, y: 0, z: -1 }
    };

    // Final layout positions
    const layout = new Map<number, { x: number; y: number; z: number; zoneId: number; isOverlapping?: boolean; group?: string }>();
    const processedRooms = new Set<number>();
    const roomQueue: Array<{ roomId: number; x: number; y: number; z: number }> = [];
    const zoneOffsets = new Map<number, { x: number; y: number; z: number }>();

    // Find starting room
    const startRoom = roomById.get(startRoomId);
    if (!startRoom) {
      console.warn(`⚠️ Start room ${startRoomId} not found, using first available room`);
      const firstRoom = allRooms[0];
      if (firstRoom) {
        roomQueue.push({ roomId: firstRoom.id, x: 0, y: 0, z: 0 });
        layout.set(firstRoom.id, { x: 0, y: 0, z: 0, zoneId: firstRoom.zoneId });
        processedRooms.add(firstRoom.id);
        zoneOffsets.set(firstRoom.zoneId, { x: 0, y: 0, z: 0 });
      }
    } else {
      // Start from room 3001 at origin
      roomQueue.push({ roomId: startRoomId, x: 0, y: 0, z: 0 });
      layout.set(startRoomId, { x: 0, y: 0, z: 0, zoneId: startRoom.zoneId });
      processedRooms.add(startRoomId);
      zoneOffsets.set(startRoom.zoneId, { x: 0, y: 0, z: 0 });
      // console.log(`📍 Placed start room ${startRoomId} at (0,0,0) in zone ${startRoom.zoneId}`);
    }

    // Process rooms using BFS to maintain connectivity
    while (roomQueue.length > 0) {
      const current = roomQueue.shift()!;
      const currentRoom = roomById.get(current.roomId);
      if (!currentRoom) continue;

      const exits = exitsByRoom.get(current.roomId) || [];

      for (const exit of exits) {
        if (!exit.toRoomId) continue;

        const destinationRoom = roomById.get(exit.toRoomId);
        if (!destinationRoom || processedRooms.has(exit.toRoomId)) continue;

        const direction = exit.direction.toUpperCase();
        const vector = directionVectors[direction as keyof typeof directionVectors];
        if (!vector) continue;

        let newX = current.x + vector.x;
        let newY = current.y + vector.y;
        let newZ = current.z + vector.z;

        // Check for zone boundary crossing
        if (destinationRoom.zoneId !== currentRoom.zoneId) {
          // This is a zone transition - no buffer, zones should touch naturally
          const currentZoneOffset = zoneOffsets.get(currentRoom.zoneId) || { x: 0, y: 0, z: 0 };

          if (!zoneOffsets.has(destinationRoom.zoneId)) {
            // Calculate new zone offset with natural connection (no separation)
            const newZoneOffset = {
              x: currentZoneOffset.x + vector.x,
              y: currentZoneOffset.y + vector.y,
              z: currentZoneOffset.z + vector.z
            };
            zoneOffsets.set(destinationRoom.zoneId, newZoneOffset);
            // console.log(`🌉 Zone transition: ${currentRoom.zoneId} → ${destinationRoom.zoneId} at offset (${newZoneOffset.x},${newZoneOffset.y},${newZoneOffset.z})`);
          }

          const destZoneOffset = zoneOffsets.get(destinationRoom.zoneId)!;
          newX = destZoneOffset.x;
          newY = destZoneOffset.y;
          newZ = destZoneOffset.z;
        }

        // Check for overlaps
        const existingRoom = Array.from(layout.values()).find(pos =>
          pos.x === newX && pos.y === newY && pos.z === newZ
        );

        if (existingRoom) {
          // Mark both rooms as overlapping
          const existingRoomId = Array.from(layout.entries()).find(([_, pos]) =>
            pos.x === newX && pos.y === newY && pos.z === newZ
          )?.[0];

          if (existingRoomId) {
            layout.get(existingRoomId)!.isOverlapping = true;
            console.log(`⚠️ Overlap detected at (${newX},${newY},${newZ}): rooms ${existingRoomId} and ${exit.toRoomId}`);
          }

          // Move overlapping room to a new Z level
          newZ += 10; // Move up by 10 levels to create separation
        }

        layout.set(exit.toRoomId, {
          x: newX,
          y: newY,
          z: newZ,
          zoneId: destinationRoom.zoneId,
          isOverlapping: !!existingRoom
        });
        processedRooms.add(exit.toRoomId);
        roomQueue.push({ roomId: exit.toRoomId, x: newX, y: newY, z: newZ });
      }
    }

    // Handle unconnected rooms - move them to unused Z levels by zone
    let unconnectedZLevel = 1000; // Start unconnected rooms at Z=1000
    allRooms.forEach(room => {
      if (!processedRooms.has(room.id)) {
        // Group unconnected rooms by zone
        const zoneRooms = roomsByZone.get(room.zoneId) || [];
        const zoneUnconnected = zoneRooms.filter(r => !processedRooms.has(r.id));

        if (zoneUnconnected.length > 0) {
          const zoneOffset = zoneOffsets.get(room.zoneId) || { x: 0, y: 0, z: unconnectedZLevel };
          if (!zoneOffsets.has(room.zoneId)) {
            zoneOffsets.set(room.zoneId, zoneOffset);
          }

          // Arrange unconnected rooms in a grid pattern at the zone's Z level
          const gridSize = Math.ceil(Math.sqrt(zoneUnconnected.length));
          zoneUnconnected.forEach((unconnectedRoom, index) => {
            if (!processedRooms.has(unconnectedRoom.id)) {
              const gridX = index % gridSize;
              const gridY = Math.floor(index / gridSize);

              layout.set(unconnectedRoom.id, {
                x: zoneOffset.x + gridX * 10,
                y: zoneOffset.y + gridY * 10,
                z: unconnectedZLevel,
                zoneId: unconnectedRoom.zoneId,
                group: 'unconnected'
              });
              processedRooms.add(unconnectedRoom.id);
            }
          });

          unconnectedZLevel += 100; // Space out unconnected zone levels
          console.log(`🏝️ Placed ${zoneUnconnected.length} unconnected rooms from zone ${room.zoneId} at Z=${unconnectedZLevel - 100}`);
        }
      }
    });

    // console.log(`✅ Auto-layout complete: ${layout.size} rooms positioned, ${Array.from(layout.values()).filter(p => p.isOverlapping).length} overlaps detected`);
    return layout;
  }, []);

  // World map helper functions
  const calculateZoneBounds = useCallback((zoneData: { id: number; name: string; climate: string; rooms: Room[] }): ZoneBounds => {
    const { id, name, climate, rooms } = zoneData;

    if (rooms.length === 0) {
      return {
        id,
        name,
        climate,
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        centerX: 0,
        centerY: 0,
        roomCount: 0,
      };
    }

    // Filter out rooms with null coordinates and get valid coordinates
    const roomsWithCoords = rooms.filter(r => r.layoutX !== null && r.layoutY !== null);

    if (roomsWithCoords.length === 0) {
      // No rooms have valid coordinates, use default bounds
      return {
        id,
        name,
        climate,
        minX: 0,
        minY: 0,
        maxX: 1,
        maxY: 1,
        centerX: 0.5,
        centerY: 0.5,
        roomCount: rooms.length,
      };
    }

    // Get coordinates from rooms that have valid positions
    const xs = roomsWithCoords.map(r => r.layoutX!);
    const ys = roomsWithCoords.map(r => r.layoutY!);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Ensure minimum bounds size for better visualization with adequate padding
    const boundsPadding = Math.max(2, Math.sqrt(roomsWithCoords.length)); // Dynamic padding based on room count
    const finalMinX = minX - boundsPadding * 0.5;
    const finalMaxX = Math.max(maxX + boundsPadding * 0.5, minX + boundsPadding);
    const finalMinY = minY - boundsPadding * 0.5;
    const finalMaxY = Math.max(maxY + boundsPadding * 0.5, minY + boundsPadding);

    return {
      id,
      name,
      climate,
      minX: finalMinX,
      minY: finalMinY,
      maxX: finalMaxX,
      maxY: finalMaxY,
      centerX: (finalMinX + finalMaxX) / 2,
      centerY: (finalMinY + finalMaxY) / 2,
      roomCount: rooms.length,
    };
  }, []);

  const fetchAllZones = useCallback(async (): Promise<ZoneMapData | null> => {
    try {
      // First, fetch all zones
      const zonesResponse = await authenticatedFetch('http://localhost:4000/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: `
            query GetAllZones {
              zones {
                id
                name
                climate
              }
            }
          `,
        }),
      });

      const zonesData = await zonesResponse.json();
      if (zonesData.errors) {
        console.error('Failed to fetch zones:', zonesData.errors);
        return null;
      }

      const zones = zonesData.data.zones || [];
      // console.log('🌍 Fetched zones:', zones.length);

      // Then, fetch all rooms with lightweight query for world map
      // Note: We can't use roomsByZone with lightweight here because we need ALL zones
      // So we fetch each zone's rooms separately with lightweight mode
      const roomsResponse = await authenticatedFetch('http://localhost:4000/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: `
            query GetAllRooms($lightweight: Boolean) {
              rooms(take: 15000, lightweight: $lightweight) {
                id
                name
                sector
                zoneId
                layoutX
                layoutY
                layoutZ
                exits {
                  id
                  direction
                  toZoneId
                  toRoomId
                }
              }
            }
          `,
          variables: { lightweight: true },
        }),
      });

      const roomsData = await roomsResponse.json();
      if (roomsData.errors) {
        console.error('Failed to fetch rooms:', roomsData.errors);
        // Continue with zones only, using default bounds
        const zoneBounds = zones.map((zone: any) => ({
          ...zone,
          rooms: [],
          minX: 0,
          minY: 0,
          maxX: 1,
          maxY: 1,
          centerX: 0.5,
          centerY: 0.5,
          roomCount: 0,
        }));

        return {
          zones: zoneBounds,
          rooms: [],
          globalBounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        };
      }

      const allRooms = roomsData.data.rooms || [];
      // console.log('🌍 Fetched rooms:', allRooms.length);

      // Apply auto-layout algorithm to position rooms systematically
      const autoLayoutPositions = generateAutoLayout(allRooms, 3001);
      // console.log('🔄 Applied auto-layout to', autoLayoutPositions.size, 'rooms');

      // Update room positions with auto-layout results ONLY for rooms without existing coordinates
      let roomsWithDbCoords = 0;
      let roomsWithAutoLayout = 0;
      const updatedRooms = allRooms.map((room: any) => {
        // If room already has valid database coordinates, use them
        if (room.layoutX !== null && room.layoutY !== null) {
          roomsWithDbCoords++;
          return room;
        }

        // Otherwise, use auto-layout positions
        const layoutPos = autoLayoutPositions.get(room.id);
        if (layoutPos) {
          roomsWithAutoLayout++;
          return {
            ...room,
            layoutX: layoutPos.x,
            layoutY: layoutPos.y,
            layoutZ: layoutPos.z || room.layoutZ || 0,
            isOverlapping: layoutPos.isOverlapping,
            group: layoutPos.group
          };
        }
        return room;
      });
      console.log(`🗺️ Room positioning: ${roomsWithDbCoords} using DB coords, ${roomsWithAutoLayout} using auto-layout`);

      // Group updated rooms by zoneId
      const roomsByZone = updatedRooms.reduce((acc: any, room: any) => {
        if (!acc[room.zoneId]) {
          acc[room.zoneId] = [];
        }
        acc[room.zoneId].push(room);
        return acc;
      }, {});

      // Calculate bounds for each zone using updated positions
      const zoneBounds = zones.map((zone: any) => {
        const zoneRooms = roomsByZone[zone.id] || [];
        return calculateZoneBounds({
          id: zone.id,
          name: zone.name,
          climate: zone.climate,
          rooms: zoneRooms,
        });
      });

      // Calculate global bounds
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

      // console.log('🌍 Calculated global bounds:', { allMinX, allMaxX, allMinY, allMaxY });

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
    } catch (error) {
      console.error('Error fetching all zones:', error);
      return null;
    }
  }, [calculateZoneBounds]);

  // Zoom level detection with hysteresis to prevent bouncing
  const detectViewMode = useCallback((zoom: number, currentMode?: ViewMode): ViewMode => {
    // Use different thresholds based on current mode to prevent bouncing (hysteresis)
    if (currentMode === 'world-map') {
      // Coming FROM world map - need higher zoom to switch to zone
      if (zoom < 0.25) return 'world-map';
      if (zoom < 1.2) return 'zone-overview';
      return 'room-detail';
    } else if (currentMode === 'zone-overview') {
      // Coming FROM zone - need MUCH lower zoom to switch to world map (allow whole zone viewing)
      if (zoom < 0.05) return 'world-map'; // Very low threshold to allow full zone viewing
      if (zoom < 1.2) return 'zone-overview';
      return 'room-detail';
    } else {
      // Default thresholds (room-detail or initial)
      if (zoom < 0.1) return 'world-map'; // Lower default threshold
      if (zoom < 1.2) return 'zone-overview';
      return 'room-detail';
    }
  }, []);

  // Zone selection handler with smooth transition
  const handleZoneSelect = useCallback((newZoneId: number) => {
    setSelectedZoneId(newZoneId);

    // If we're in world map mode, zoom into the selected zone (any zone)
    if (worldMapMode || currentViewMode === 'world-map') {
      const zoneBounds = zoneMapData?.zones.find(z => z.id === newZoneId);
      if (zoneBounds && reactFlowInstance) {
        // Store session data for smooth transition
        sessionStorage.setItem('selectedZoneFromWorldMap', newZoneId.toString());
        sessionStorage.setItem('lastWorldMapViewport', JSON.stringify({
          x: reactFlowInstance.getViewport().x,
          y: reactFlowInstance.getViewport().y,
          zoom: reactFlowInstance.getViewport().zoom
        }));

        // If it's a different zone, navigate to it
        if (newZoneId !== zoneId) {
          router.push(`/dashboard/zones/editor?zone=${newZoneId}`);
        } else {
          // If it's the same zone, navigate back to the zone editor
          router.push(`/dashboard/zones/editor?zone=${newZoneId}`);
          setCurrentViewMode('zone-overview');
          // Force a reload of the zone data to ensure proper centering
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({
                padding: 0.2,
                minZoom: 0.15, // Stay above world map threshold (0.05)
                maxZoom: 1.5,
                duration: 800,
              });
            }
          }, 100);
        }
        return;
      }
    } else if (newZoneId !== zoneId) {
      // If not in world map mode and different zone, navigate
      sessionStorage.setItem('selectedZoneFromWorldMap', newZoneId.toString());
      router.push(`/dashboard/zones/editor?zone=${newZoneId}`);
    }
  }, [zoneId, zoneMapData, reactFlowInstance, worldMapMode, router]);

  // Smooth transition to world map view
  const transitionToWorldMap = useCallback(() => {
    if (reactFlowInstance && zoneMapData) {
      // console.log('🌍 Transitioning to world map view');

      // Set transition flag to prevent expensive operations during transition
      worldMapTransitionRef.current = true;

      // Calculate world bounds
      const { globalBounds } = zoneMapData;
      const ZONE_SCALE = 200;

      const centerX = ((globalBounds.minX + globalBounds.maxX) / 2) * ZONE_SCALE;
      const centerY = ((globalBounds.minY + globalBounds.maxY) / 2) * ZONE_SCALE;
      const worldWidth = (globalBounds.maxX - globalBounds.minX) * ZONE_SCALE;
      const worldHeight = (globalBounds.maxY - globalBounds.minY) * ZONE_SCALE;

      // Calculate zoom to fit all zones
      const containerWidth = 1200; // Approximate container width
      const containerHeight = 800; // Approximate container height
      const targetZoom = Math.min(
        containerWidth / (worldWidth + 400), // Add padding
        containerHeight / (worldHeight + 400),
        0.2 // Maximum zoom out for world view
      );

      // console.log('🎯 Transitioning to world center:', {
      //   x: centerX,
      //   y: centerY,
      //   zoom: targetZoom,
      //   bounds: globalBounds
      // });

      reactFlowInstance.setCenter(centerX, centerY, {
        duration: 800, // Reduced duration for better performance
        zoom: targetZoom
      });

      // Update view mode after transition and clear transition flag
      setTimeout(() => {
        setCurrentViewMode('world-map');
        worldMapTransitionRef.current = false;
      }, 850);
    }
  }, [reactFlowInstance, zoneMapData]);

  // Fetch world map data when in world map mode
  useEffect(() => {
    const fetchWorldMapData = async () => {
      if (!worldMapMode) return;

      try {
        setLoading(true);
        const mapData = await fetchAllZones();
        if (mapData) {
          setZoneMapData(mapData);
          setAllZones(mapData.zones.map(z => ({ id: z.id, name: z.name, climate: z.climate })));
        }
      } catch (error) {
        console.error('Failed to fetch world map data:', error);
        setError('Failed to load world map data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorldMapData();
  }, [worldMapMode, fetchAllZones]);

  // Fetch world map data when view mode changes to world-map (for zoom-out functionality)
  useEffect(() => {
    const fetchWorldMapDataForZoom = async () => {
      if (currentViewMode === 'world-map' && !zoneMapData && !worldMapMode) {
        // console.log('🌍 Fetching world map data for zoom-out functionality...');

        try {
          const mapData = await fetchAllZones();
          if (mapData) {
            setZoneMapData(mapData);
            setAllZones(mapData.zones.map(z => ({ id: z.id, name: z.name, climate: z.climate })));
            // console.log('🌍 World map data loaded for zoom-out:', mapData.zones.length, 'zones');
          }
        } catch (error) {
          console.error('Failed to fetch world map data for zoom:', error);
        }
      }
    };

    fetchWorldMapDataForZoom();
  }, [currentViewMode, zoneMapData, worldMapMode, fetchAllZones]);

  // Fetch single zone data
  useEffect(() => {
    const fetchData = async () => {
      if (!zoneId || worldMapMode) return;

      try {
        setLoading(true);

        // Fetch zone, rooms, mobs, and objects in parallel
        const [zoneResponse, roomsResponse, mobsResponse, objectsResponse] =
          await Promise.allSettled([
            authenticatedFetch('http://localhost:4000/graphql', {
              method: 'POST',
              body: JSON.stringify({
                query: `
                query GetZone($id: Int!) {
                  zone(id: $id) {
                    id
                    name
                    climate
                  }
                }
              `,
                variables: { id: zoneId },
              }),
            }),
            authenticatedFetch('http://localhost:4000/graphql', {
              method: 'POST',
              body: JSON.stringify({
                query: `
                query GetRoomsByZone($zoneId: Int!, $lightweight: Boolean) {
                  roomsByZone(zoneId: $zoneId, lightweight: $lightweight) {
                    id
                    zoneId
                    name
                    roomDescription
                    sector
                    layoutX
                    layoutY
                    layoutZ
                    exits {
                      id
                      direction
                      toZoneId
                      toRoomId
                    }
                    mobs {
                      id
                      name
                      level
                      race
                      mobClass
                      zoneId
                    }
                    objects {
                      id
                      name
                      type
                      keywords
                      zoneId
                    }
                    shops {
                      id
                      buyProfit
                      sellProfit
                      keeperId
                      zoneId
                    }
                  }
                }
              `,
                variables: { zoneId: zoneId, lightweight: false },
              }),
            }),
            authenticatedFetch('http://localhost:4000/graphql', {
              method: 'POST',
              body: JSON.stringify({
                query: `
                query GetMobsByZone($zoneId: Int!) {
                  mobsByZone(zoneId: $zoneId) {
                    id
                    keywords
                    roomDescription
                    examineDescription
                    level
                    mobFlags
                    lifeForce
                    race
                  }
                }
              `,
                variables: { zoneId: zoneId },
              }),
            }),
            authenticatedFetch('http://localhost:4000/graphql', {
              method: 'POST',
              body: JSON.stringify({
                query: `
                query GetObjectsByZone($zoneId: Int!) {
                  objectsByZone(zoneId: $zoneId) {
                    id
                    keywords
                    roomDescription
                    examineDescription
                    type
                    cost
                    weight
                    level
                  }
                }
              `,
                variables: { zoneId: zoneId },
              }),
            }),
          ]);

        // Process zone data
        if (zoneResponse.status === 'fulfilled') {
          const zoneData = await zoneResponse.value.json();
          if (!zoneData.errors) {
            setZone(zoneData.data.zone);
          }
        }

        // Process rooms data
        if (roomsResponse.status === 'fulfilled') {
          const roomsData = await roomsResponse.value.json();
          if (!roomsData.errors) {
            const loadedRooms = roomsData.data.roomsByZone || [];

            // Transform rooms to ensure mobs, objects, and shops arrays exist
            const transformedRooms = loadedRooms.map((room: any) => ({
              ...room,
              mobs: room.mobs || [],
              objects: room.objects || [],
              shops: room.shops || [],
            }));
            setRooms(transformedRooms);

            // Store original positions for reset functionality
            const originals: Record<number, { x: number; y: number }> = {};
            transformedRooms.forEach((room: Room, index: number) => {
              // Use the same position logic as getNodePosition
              if (room.layoutX !== null && room.layoutY !== null) {
                // Use saved database position
                originals[room.id] = {
                  x: gridToPixels(room.layoutX!),
                  y: gridToPixels(room.layoutY!),
                };
              } else {
                // Use fallback grid layout position
                const total = transformedRooms.length;
                if (total === 1) {
                  originals[room.id] = { x: gridToPixels(2), y: gridToPixels(1) };
                } else {
                  const cols = Math.max(3, Math.ceil(Math.sqrt(total * 1.2)));
                  const col = index % cols;
                  const row = Math.floor(index / cols);
                  originals[room.id] = {
                    x: gridToPixels(col * 2 + 1),
                    y: gridToPixels(row * 2 + 1),
                  };
                }
              }
            });
            setOriginalPositions(originals);
            // console.log(`📍 Stored original positions for ${Object.keys(originals).length} rooms for reset functionality`);
          }
        }

        // Process mobs data
        if (mobsResponse.status === 'fulfilled') {
          const mobsData = await mobsResponse.value.json();
          if (!mobsData.errors && mobsData.data?.mobsByZone) {
            // Transform API data to match our interface
            const transformedMobs = mobsData.data.mobsByZone.map(
              (mob: any) => ({
                id: mob.id,
                name: mob.roomDescription,
                level: mob.level,
                race: mob.race || 'HUMAN',
                class: mob.mobClass,
                hitpoints: 0, // Not available in current schema
                alignment: mob.lifeForce,
                difficulty:
                  mob.level > 40
                    ? 'boss'
                    : mob.level > 20
                      ? 'hard'
                      : mob.level > 10
                        ? 'medium'
                        : 'easy',
              })
            );
            setMobs(transformedMobs);
          } else {
            console.error('Failed to fetch mobs:', mobsData.errors);
            setMobs([]);
          }
        } else {
          console.error('Mobs API request failed:', mobsResponse.reason);
          setMobs([]);
        }

        // Process objects data
        if (objectsResponse.status === 'fulfilled') {
          const objectsData = await objectsResponse.value.json();
          if (!objectsData.errors && objectsData.data?.objectsByZone) {
            // Transform API data to match our interface
            const transformedObjects = objectsData.data.objectsByZone.map(
              (obj: any) => ({
                id: obj.id,
                name: obj.roomDescription,
                type: obj.type,
                value: obj.cost,
                weight: obj.weight,
                level: obj.level,
                material: 'unknown', // Not available in current schema
                condition: 'good',
                rarity:
                  obj.level > 30
                    ? 'epic'
                    : obj.level > 20
                      ? 'rare'
                      : obj.level > 10
                        ? 'uncommon'
                        : 'common',
              })
            );
            setObjects(transformedObjects);
          } else {
            console.error('Failed to fetch objects:', objectsData.errors);
            setObjects([]);
          }
        } else {
          console.error('Objects API request failed:', objectsResponse.reason);
          setObjects([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zoneId]);

  // Select initial room from URL parameter
  useEffect(() => {
    if (initialRoomId && rooms.length > 0 && !selectedRoomId) {
      const room = rooms.find(r => r.id === initialRoomId);
      if (room) {
        console.log(`📍 Selecting initial room from URL: ${initialRoomId}`);
        handleSelectRoom(initialRoomId);
      }
    }
  }, [initialRoomId, rooms, selectedRoomId, handleSelectRoom]);

  // Generate world map nodes for zone viewing
  const generateWorldMapNodes = useCallback((mapData: ZoneMapData): Node[] => {
    const ZONE_SCALE = 200; // Scale factor for world map positioning

    return mapData.zones.map((zoneBounds) => {
      const centerX = zoneBounds.centerX * ZONE_SCALE;
      const centerY = zoneBounds.centerY * ZONE_SCALE;

      return {
        id: `zone-${zoneBounds.id}`,
        type: 'zone',
        position: { x: centerX, y: centerY },
        data: {
          zoneId: zoneBounds.id,
          name: zoneBounds.name,
          climate: zoneBounds.climate,
          roomCount: zoneBounds.roomCount,
          bounds: zoneBounds,
          onZoneSelect: handleZoneSelect,
        },
        draggable: false,
        selectable: true,
      };
    });
  }, [handleZoneSelect]);

  // Generate world map room nodes with enhanced Level of Detail (LOD) system
  const generateWorldMapRoomNodes = useCallback((mapData: ZoneMapData, zoom: number = 0.5): Node[] => {
    const performanceStart = performance.now();

    // Dynamic scaling based on zoom level for better visibility
    const ROOM_SCALE = zoom < 0.3 ? 200 : zoom < 0.5 ? 100 : 50; // Much larger scale for world view
    const MIN_ZONE_PADDING = 200; // Minimum padding between zone boundaries

    const zoneNameMap = mapData.zones.reduce((acc, zone) => {
      acc[zone.id] = zone.name;
      return acc;
    }, {} as Record<number, string>);

    // Create a smart zone-based layout that prevents overlapping using actual zone bounds
    const zonePositions = new Map<number, { x: number; y: number }>();

    // Calculate actual zone dimensions in world coordinates
    const zoneMetrics = mapData.zones.map(zone => ({
      id: zone.id,
      width: (zone.maxX - zone.minX) * ROOM_SCALE,
      height: (zone.maxY - zone.minY) * ROOM_SCALE,
      bounds: zone
    }));

    // Sort zones by area (largest first) for better packing
    const sortedZones = [...zoneMetrics].sort((a, b) => (b.width * b.height) - (a.width * a.height));

    // Use a simple but effective bin-packing algorithm
    const placedZones: Array<{ id: number; x: number; y: number; width: number; height: number }> = [];

    sortedZones.forEach(zone => {
      let bestPosition = { x: 0, y: 0 };
      let bestWaste = Infinity;

      // Try to find the best position that minimizes wasted space
      for (let x = 0; x <= 5000; x += 100) { // Reasonable search space
        for (let y = 0; y <= 5000; y += 100) {
          // Check if this position would cause overlap
          const wouldOverlap = placedZones.some(placed => {
            const overlap = !(
              x >= placed.x + placed.width + MIN_ZONE_PADDING ||
              x + zone.width + MIN_ZONE_PADDING <= placed.x ||
              y >= placed.y + placed.height + MIN_ZONE_PADDING ||
              y + zone.height + MIN_ZONE_PADDING <= placed.y
            );
            return overlap;
          });

          if (!wouldOverlap) {
            // Calculate waste (distance from origin - prefer positions closer to origin)
            const waste = Math.sqrt(x * x + y * y);
            if (waste < bestWaste) {
              bestWaste = waste;
              bestPosition = { x, y };
            }
          }
        }
      }

      // Place the zone at the best position found
      placedZones.push({
        id: zone.id,
        x: bestPosition.x,
        y: bestPosition.y,
        width: zone.width,
        height: zone.height
      });

      // Store the position offset for this zone (center the zone content)
      zonePositions.set(zone.id, {
        x: bestPosition.x + zone.width / 2,
        y: bestPosition.y + zone.height / 2,
      });
    });

    // Enhanced Level of Detail based on zoom level with performance optimization
    let clusterSize = 1; // Default: show individual rooms
    let maxNodes = 10000; // Maximum nodes to render
    let lodLevel = 'detailed';

    if (zoom < 0.1) {
      // Extreme zoom out: use Canvas rendering for ultimate performance (disabled for now)
      clusterSize = 32;
      maxNodes = 100;
      lodLevel = 'canvas-micro';
      setUseCanvasRendering(false); // Temporarily disabled
    } else if (zoom < 0.2) {
      // Ultra zoomed out: maximum clustering for overview
      clusterSize = 16;
      maxNodes = 200;
      lodLevel = 'ultra-overview';
      setUseCanvasRendering(false);
    } else if (zoom < 0.3) {
      // Very zoomed out: cluster rooms heavily
      clusterSize = 8;
      maxNodes = 500;
      lodLevel = 'overview';
      setUseCanvasRendering(false);
    } else if (zoom < 0.5) {
      // Moderately zoomed out: some clustering
      clusterSize = 4;
      maxNodes = 1500;
      lodLevel = 'medium';
      setUseCanvasRendering(false);
    } else if (zoom < 0.8) {
      // Somewhat zoomed in: minimal clustering
      clusterSize = 2;
      maxNodes = 3000;
      lodLevel = 'detailed';
      setUseCanvasRendering(false);
    } else {
      // zoom >= 0.8: show all individual rooms (full detail)
      setUseCanvasRendering(false);
    }

    const validRooms = mapData.rooms.filter(room =>
      room.layoutX !== null && room.layoutY !== null
    );

    // Enhanced clustering algorithm for better performance and visual organization
    if (clusterSize > 1) {
      const clusters = new Map<string, {
        rooms: WorldMapRoom[];
        centerX: number;
        centerY: number;
        dominantSector: string;
        sectorDistribution: Record<string, number>;
      }>();

      // Group rooms into clusters with zone-based positioning
      validRooms.forEach(room => {
        const zonePos = zonePositions.get(room.zoneId) || { x: 0, y: 0 };

        // Get the zone bounds to calculate the origin offset from center
        const zoneBounds = mapData.zones.find(z => z.id === room.zoneId);
        if (!zoneBounds) return; // Skip rooms without zone bounds

        // Calculate zone origin from center position
        const zoneWidth = (zoneBounds.maxX - zoneBounds.minX) * ROOM_SCALE;
        const zoneHeight = (zoneBounds.maxY - zoneBounds.minY) * ROOM_SCALE;
        const zoneOriginX = zonePos.x - zoneWidth / 2;
        const zoneOriginY = zonePos.y - zoneHeight / 2;

        // Use room's local coordinates within the zone
        const roomLocalX = (room.layoutX || 0) - zoneBounds.minX;
        const roomLocalY = (room.layoutY || 0) - zoneBounds.minY;

        const clusterX = Math.floor(roomLocalX / clusterSize) * clusterSize;
        const clusterY = Math.floor(roomLocalY / clusterSize) * clusterSize;
        const clusterKey = `${room.zoneId}-${clusterX},${clusterY}`;

        if (!clusters.has(clusterKey)) {
          clusters.set(clusterKey, {
            rooms: [],
            centerX: zoneOriginX + (clusterX + clusterSize / 2) * ROOM_SCALE,
            centerY: zoneOriginY + (clusterY + clusterSize / 2) * ROOM_SCALE,
            dominantSector: room.sector,
            sectorDistribution: {},
          });
        }

        const cluster = clusters.get(clusterKey)!;
        cluster.rooms.push(room);

        // Track sector distribution for better visualization
        cluster.sectorDistribution[room.sector] = (cluster.sectorDistribution[room.sector] || 0) + 1;
      });

      // Convert clusters to nodes with improved visual differentiation
      const clusterNodes = Array.from(clusters.entries()).map(([key, cluster], index) => {
        // Use the sector distribution to find the most dominant sector
        const dominantSector = Object.entries(cluster.sectorDistribution)
          .sort(([, a], [, b]) => b - a)[0][0];

        const x = cluster.centerX;
        const y = cluster.centerY;

        // Use the first room's zone info for the cluster
        const firstRoom = cluster.rooms[0];

        // Calculate cluster size based on room count and LOD level - very large for easy interaction
        const baseSize = lodLevel === 'canvas-micro' ? 32 :
          lodLevel === 'ultra-overview' ? 80 :
            lodLevel === 'overview' ? 100 :
              lodLevel === 'medium' ? 120 : 140;

        const clusterNodeSize = Math.min(baseSize + 32, baseSize + Math.floor(cluster.rooms.length * 1.5));

        return {
          id: `cluster-${key}`,
          type: 'worldRoom',
          position: { x, y },
          data: {
            roomId: firstRoom.id, // Representative room
            name: `${cluster.rooms.length} rooms`,
            sector: dominantSector,
            zoneId: firstRoom.zoneId,
            zoneName: zoneNameMap[firstRoom.zoneId] || `Zone ${firstRoom.zoneId}`,
            onRoomSelect: handleRoomSelect,
          },
          draggable: false,
          selectable: true,
          style: {
            width: clusterNodeSize,
            height: clusterNodeSize,
            opacity: 0.9,
            minWidth: clusterNodeSize,
            minHeight: clusterNodeSize,
          },
        } as Node;
      });

      const finalClusterNodes = clusterNodes.slice(0, maxNodes);
      const performanceEnd = performance.now();

      // For canvas rendering mode, also set the canvas clusters
      if (lodLevel === 'canvas-micro') {
        const canvasClusterData = Array.from(clusters.entries()).map(([key, cluster]) => ({
          rooms: cluster.rooms,
          centerX: cluster.centerX,
          centerY: cluster.centerY,
          dominantSector: Object.entries(cluster.sectorDistribution)
            .sort(([, a], [, b]) => b - a)[0][0],
          size: Math.max(16, Math.min(48, cluster.rooms.length * 3)),
        }));
        setCanvasClusters(canvasClusterData);
      }

      // Performance logging disabled to reduce console spam during interactions
      // console.log(`🎯 LOD ${lodLevel}: zoom=${zoom.toFixed(2)}, clusterSize=${clusterSize}, ` +
      //             `clusters=${finalClusterNodes.length}/${clusters.size}, ` +
      //             `rooms=${validRooms.length}, time=${(performanceEnd - performanceStart).toFixed(1)}ms`);

      return finalClusterNodes;
    }

    // No clustering: show individual rooms (but respect maxNodes limit)
    const limitedRooms = validRooms.slice(0, maxNodes);
    const roomNodes = limitedRooms.map((room) => {
      const zonePos = zonePositions.get(room.zoneId) || { x: 0, y: 0 };

      // Get the zone bounds to calculate the origin offset from center
      const zoneBounds = mapData.zones.find(z => z.id === room.zoneId);
      if (!zoneBounds) {
        // Fallback to simple positioning if zone bounds not found
        const x = zonePos.x + (room.layoutX || 0) * ROOM_SCALE;
        const y = zonePos.y + (room.layoutY || 0) * ROOM_SCALE;
        return {
          id: `room-${room.id}`,
          type: 'worldRoom',
          position: { x, y },
          data: {
            roomId: room.id,
            name: room.name || `Room ${room.id}`,
            sector: room.sector || 'UNKNOWN',
            zoneId: room.zoneId,
            zoneName: zoneNameMap[room.zoneId] || `Zone ${room.zoneId}`,
            onRoomSelect: handleRoomSelect,
          },
          draggable: false,
          selectable: true,
          style: {
            width: 8,
            height: 8,
            backgroundColor: getThemeColor('#10b981', '#10b981'), // Green color for rooms
            border: `1px solid ${getThemeColor('#374151', '#6b7280')}`,
            borderRadius: '2px',
            opacity: 0.9,
          },
        } as Node;
      }

      // Calculate zone origin from center position
      const zoneWidth = (zoneBounds.maxX - zoneBounds.minX) * ROOM_SCALE;
      const zoneHeight = (zoneBounds.maxY - zoneBounds.minY) * ROOM_SCALE;
      const zoneOriginX = zonePos.x - zoneWidth / 2;
      const zoneOriginY = zonePos.y - zoneHeight / 2;

      // Position room relative to zone origin, accounting for zone's internal coordinate system
      const roomLocalX = (room.layoutX || 0) - zoneBounds.minX;
      const roomLocalY = (room.layoutY || 0) - zoneBounds.minY;
      const x = zoneOriginX + roomLocalX * ROOM_SCALE;
      const y = zoneOriginY + roomLocalY * ROOM_SCALE;

      return {
        id: `worldroom-${room.id}`,
        type: 'worldRoom',
        position: { x, y },
        data: {
          roomId: room.id,
          name: room.name,
          sector: room.sector,
          zoneId: room.zoneId,
          zoneName: zoneNameMap[room.zoneId] || `Zone ${room.zoneId}`,
          onRoomSelect: handleRoomSelect,
        },
        draggable: false,
        selectable: true,
        style: {
          width: 80,
          height: 80,
          minWidth: 80,
          minHeight: 80,
          opacity: 1.0,
        },
      } as Node;
    });

    const performanceEnd = performance.now();
    // Performance logging disabled to reduce console spam during interactions
    // console.log(`🎯 LOD ${lodLevel}: zoom=${zoom.toFixed(2)}, individual rooms=${roomNodes.length}/${validRooms.length}, ` +
    //             `time=${(performanceEnd - performanceStart).toFixed(1)}ms`);

    return roomNodes;
  }, []);

  // Handle room selection in world map mode
  const handleRoomSelect = useCallback((roomId: number) => {
    // Navigate to the room's zone editor
    const room = zoneMapData?.rooms.find(r => r.id === roomId);
    if (room) {
      window.location.href = `/dashboard/zones/editor?zone=${room.zoneId}&room=${roomId}`;
    }
  }, [zoneMapData]);

  // Generate enhanced world map with zone boundaries spread out based on XYZ ranges
  // Memoize the expensive world map calculation
  const generateEnhancedWorldMapNodes = useCallback((mapData: ZoneMapData, zoom: number = 0.5): Node[] => {
    console.log(`🔍 generateEnhancedWorldMapNodes called with:`, {
      zones: mapData.zones?.length || 0,
      rooms: mapData.rooms?.length || 0,
      zoom: zoom.toFixed(3)
    });

    if (!mapData.zones || mapData.zones.length === 0) {
      console.error(`❌ No zones in mapData!`, mapData);
      return [];
    }

    // Improved cache system for better performance
    const zoomLevel = Math.round(zoom * 5) / 5; // Round to nearest 0.2 for better cache efficiency
    const cacheKey = `${mapData.zones.length}-${zoomLevel}`;
    const cached = worldNodesCache.current.get(cacheKey);

    console.log(`📋 Cache key: ${cacheKey}, has cached: ${!!cached}, cached nodes: ${cached?.nodes?.length || 'none'}`);

    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`🔄 Returning cached world map nodes: ${cached.nodes.length}`);
      return cached.nodes;
    }

    // More aggressive throttling for world map generation, but allow initial generation
    console.log(`⏱️ Checking throttle: timeSince=${now - lastLODUpdate.current}ms, threshold=${LOD_THROTTLE_MS}ms, zoom=${zoom}, hasCached=${!!cached}`);
    if (now - lastLODUpdate.current < LOD_THROTTLE_MS && zoom < 1.0 && cached?.nodes?.length > 0) {
      console.log(`⏸️ Throttling world map generation - returning cached: ${cached.nodes.length}`);
      return cached.nodes; // Only throttle if we have valid cached nodes
    }
    lastLODUpdate.current = now;

    console.log(`🚀 Starting fresh world map node generation...`);
    const ZONE_SCALE = 100; // Scale factor for positioning
    const ZONE_SPACING = 200; // Minimum spacing between zones
    const nodes: Node[] = [];

    // Calculate zone positions using a proper layout algorithm
    const calculateZonePositions = (zones: typeof mapData.zones) => {
      const positions = new Map<number, { x: number; y: number }>();

      // Sort zones by size (largest first) for better packing
      const sortedZones = [...zones].sort((a, b) => {
        const aSize = (a.maxX - a.minX) * (a.maxY - a.minY);
        const bSize = (b.maxX - b.minX) * (b.maxY - b.minY);
        return bSize - aSize;
      });

      // Place zones using a grid-based approach with proper spacing
      const placedZones: Array<{
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
      }> = [];

      sortedZones.forEach((zone, index) => {
        const zoneWidth = (zone.maxX - zone.minX) * ZONE_SCALE + ZONE_SPACING;
        const zoneHeight = (zone.maxY - zone.minY) * ZONE_SCALE + ZONE_SPACING;

        let placed = false;
        let attempts = 0;
        const maxAttempts = 1000;

        // Try to find a non-overlapping position
        while (!placed && attempts < maxAttempts) {
          let x, y;

          if (index === 0) {
            // Place first zone at origin
            x = 0;
            y = 0;
          } else {
            // For subsequent zones, try positions around existing zones
            const gridSize = Math.ceil(Math.sqrt(sortedZones.length));
            const row = Math.floor(attempts / gridSize);
            const col = attempts % gridSize;

            x = col * (zoneWidth + ZONE_SPACING);
            y = row * (zoneHeight + ZONE_SPACING);

            // Add some randomness to avoid perfect grid
            if (attempts > gridSize * gridSize) {
              x += (Math.random() - 0.5) * ZONE_SPACING;
              y += (Math.random() - 0.5) * ZONE_SPACING;
            }
          }

          // Check for overlaps with existing zones
          const overlaps = placedZones.some(existing => {
            const dx = Math.abs(x - existing.x);
            const dy = Math.abs(y - existing.y);
            const minDistX = (zoneWidth + existing.width) / 2;
            const minDistY = (zoneHeight + existing.height) / 2;
            return dx < minDistX && dy < minDistY;
          });

          if (!overlaps) {
            positions.set(zone.id, { x, y });
            placedZones.push({ id: zone.id, x, y, width: zoneWidth, height: zoneHeight });
            placed = true;
          }

          attempts++;
        }

        // Fallback: place in a spiral if we can't find a good position
        if (!placed) {
          const spiralRadius = Math.ceil(Math.sqrt(index)) * (zoneWidth + ZONE_SPACING);
          const angle = (index * 137.5) % 360; // Golden angle for nice distribution
          const x = spiralRadius * Math.cos(angle * Math.PI / 180);
          const y = spiralRadius * Math.sin(angle * Math.PI / 180);
          positions.set(zone.id, { x, y });
        }
      });

      return positions;
    };

    const zonePositions = calculateZonePositions(mapData.zones);
    console.log(`🗺️ Zone positions calculated for ${zonePositions.size} zones:`, Array.from(zonePositions.entries()).slice(0, 3));

    // First pass: calculate room positions and determine actual zone bounds
    const zoneRoomPositions = new Map<number, Array<{ roomId: number; x: number; y: number }>>();

    console.log(`📍 Starting first pass: calculating room positions for ${mapData.zones.length} zones`);
    mapData.zones.forEach((zoneBounds) => {
      const zonePos = zonePositions.get(zoneBounds.id) || { x: 0, y: 0 };
      const zoneRooms = mapData.rooms.filter(room => room.zoneId === zoneBounds.id);
      const roomPositions: Array<{ roomId: number; x: number; y: number }> = [];

      // Calculate room positions first - only for rooms with valid layout coordinates
      zoneRooms
        .filter(room => room.layoutX !== null && room.layoutY !== null)
        .forEach((room) => {
          const roomLocalX = room.layoutX! - zoneBounds.minX;
          const roomLocalY = room.layoutY! - zoneBounds.minY;

          // Normalize room position to [0,1] range within zone
          const normalizedX = zoneBounds.maxX !== zoneBounds.minX ? roomLocalX / (zoneBounds.maxX - zoneBounds.minX) : 0.5;
          const normalizedY = zoneBounds.maxY !== zoneBounds.minY ? roomLocalY / (zoneBounds.maxY - zoneBounds.minY) : 0.5;

          // Calculate room position relative to zone position
          const baseWidth = Math.max((zoneBounds.maxX - zoneBounds.minX) * ZONE_SCALE, 120);
          const baseHeight = Math.max((zoneBounds.maxY - zoneBounds.minY) * ZONE_SCALE, 120);

          const x = zonePos.x + (normalizedX - 0.5) * baseWidth;
          const y = zonePos.y + (normalizedY - 0.5) * baseHeight;

          roomPositions.push({ roomId: room.id, x, y });
        });

      zoneRoomPositions.set(zoneBounds.id, roomPositions);
    });

    console.log(`📍 First pass complete. Zone room positions: ${zoneRoomPositions.size} zones processed`);

    // Second pass: create zone boundaries that encompass all rooms
    console.log(`🏗️ Starting second pass: creating ${mapData.zones.length} zone boundary nodes`);
    mapData.zones.forEach((zoneBounds, zoneIndex) => {
      const zonePos = zonePositions.get(zoneBounds.id) || { x: 0, y: 0 };
      const roomPositions = zoneRoomPositions.get(zoneBounds.id) || [];

      // Calculate actual bounds from room positions
      let minX = zonePos.x, maxX = zonePos.x, minY = zonePos.y, maxY = zonePos.y;

      if (roomPositions.length > 0) {
        // Get all actual room positions to properly calculate bounds
        const allRoomPositions: Array<{ x: number; y: number }> = [];

        // Recalculate all room positions to ensure we capture everything
        // Only include rooms with valid layout coordinates (matching zone bounds calculation)
        mapData.rooms
          .filter(room => room.zoneId === zoneBounds.id && room.layoutX !== null && room.layoutY !== null)
          .forEach((room) => {
            const roomLocalX = room.layoutX! - zoneBounds.minX;
            const roomLocalY = room.layoutY! - zoneBounds.minY;

            // Normalize room position to [0,1] range within zone
            const normalizedX = zoneBounds.maxX !== zoneBounds.minX ? roomLocalX / (zoneBounds.maxX - zoneBounds.minX) : 0.5;
            const normalizedY = zoneBounds.maxY !== zoneBounds.minY ? roomLocalY / (zoneBounds.maxY - zoneBounds.minY) : 0.5;

            // Calculate room position relative to zone position
            const baseWidth = Math.max((zoneBounds.maxX - zoneBounds.minX) * ZONE_SCALE, 120);
            const baseHeight = Math.max((zoneBounds.maxY - zoneBounds.minY) * ZONE_SCALE, 120);

            const x = zonePos.x + (normalizedX - 0.5) * baseWidth;
            const y = zonePos.y + (normalizedY - 0.5) * baseHeight;

            allRoomPositions.push({ x, y });
          });

        if (allRoomPositions.length > 0) {
          const roomXs = allRoomPositions.map(r => r.x);
          const roomYs = allRoomPositions.map(r => r.y);
          minX = Math.min(...roomXs);
          maxX = Math.max(...roomXs);
          minY = Math.min(...roomYs);
          maxY = Math.max(...roomYs);
        }
      }

      // Add generous padding around the room positions to ensure visibility
      const padding = 60; // Increased padding for better visibility
      const zoneWidth = Math.max(maxX - minX + 2 * padding, 160); // Increased minimum width
      const zoneHeight = Math.max(maxY - minY + 2 * padding, 120); // Increased minimum height

      // Center the zone boundary around the room cluster
      const zoneCenterX = (minX + maxX) / 2;
      const zoneCenterY = (minY + maxY) / 2;

      // Create zone boundary node using the WorldMapZone component
      console.log(`🏗️ Creating zone boundary node ${zoneIndex + 1}/${mapData.zones.length}: Zone ${zoneBounds.id} (${zoneBounds.name})`);
      nodes.push({
        id: `zone-boundary-${zoneBounds.id}`,
        type: 'zone',
        position: { x: zoneCenterX - zoneWidth / 2, y: zoneCenterY - zoneHeight / 2 }, // Position top-left for React Flow
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
        style: {
          zIndex: 1, // Zone boundaries behind rooms
        },
      });

      // Add room nodes positioned within the zone boundary (optimize based on zoom level)
      // PERFORMANCE: Only show individual rooms at very high zoom levels (0.8+) to prevent lag
      if (zoom > 0.8) { // Much more restrictive zoom threshold for room visibility
        // Limit room count per zone for performance (show max 20 rooms per zone)
        const maxRoomsPerZone = 20;
        const limitedRoomPositions = roomPositions.slice(0, maxRoomsPerZone);
        console.log(`🏠 Adding ${limitedRoomPositions.length}/${roomPositions.length} room nodes for zone ${zoneBounds.id} at zoom ${zoom}`);

        limitedRoomPositions.forEach(({ roomId }) => {
          const room = mapData.rooms.find(r => r.id === roomId);
          if (!room || room.layoutX === null || room.layoutY === null) return;

          // Calculate room position within the zone boundary
          const roomLocalX = room.layoutX - zoneBounds.minX;
          const roomLocalY = room.layoutY - zoneBounds.minY;

          // Normalize room position to [0,1] range within zone
          const normalizedX = zoneBounds.maxX !== zoneBounds.minX ? roomLocalX / (zoneBounds.maxX - zoneBounds.minX) : 0.5;
          const normalizedY = zoneBounds.maxY !== zoneBounds.minY ? roomLocalY / (zoneBounds.maxY - zoneBounds.minY) : 0.5;

          // Position within the actual zone boundary with padding
          const zonePadding = 20; // Padding inside zone boundary
          const roomX = (zoneCenterX - zoneWidth / 2) + zonePadding + normalizedX * (zoneWidth - 2 * zonePadding);
          const roomY = (zoneCenterY - zoneHeight / 2) + zonePadding + normalizedY * (zoneHeight - 2 * zonePadding);

          // Room size based on zoom level - smaller for world map performance
          const roomSize = 3; // Fixed small size for world map

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
              width: roomSize,
              height: roomSize,
              backgroundColor: getThemeColor('#10b981', '#10b981'), // Green for normal rooms in world map
              border: `1px solid ${getThemeColor('#374151', '#6b7280')}`,
              borderRadius: '3px',
              zIndex: 10, // Ensure rooms appear above zone boundaries
              opacity: zoom > 0.4 ? 1.0 : 0.8, // Better visibility control
            },
          });
        });
      }
    });

    console.log(`✅ World map generation complete: ${nodes.length} total nodes created`);

    // Cache the generated nodes for better performance
    worldNodesCache.current.set(cacheKey, { nodes, timestamp: now });

    // Clean up old cache entries (keep only last 5)
    if (worldNodesCache.current.size > 5) {
      const entries = Array.from(worldNodesCache.current.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      worldNodesCache.current.clear();
      entries.slice(0, 5).forEach(([key, value]) => {
        worldNodesCache.current.set(key, value);
      });
    }

    return nodes;
  }, [handleZoneSelect, handleRoomSelect]);

  // Reset flags and cached positions when zone changes
  useEffect(() => {
    hasInitializedZLevel.current = false;
    hasPerformedInitialFit.current = false;
    // Clear cached node positions so new zone uses its own layout
    nodePositionsRef.current = {};
    // Always clear selected room when zone changes - initialRoomId useEffect will set it properly
    setSelectedRoomId(null);
    setEditedRoom(null);
    console.log(`🧹 Cleared cached state for zone change to ${zoneId}`);
  }, [zoneId]);

  // Initialize Z-level to the most populated floor when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && !hasInitializedZLevel.current) {
      // Count rooms per Z-level
      const zLevelCounts = new Map<number, number>();
      rooms.forEach(room => {
        const z = room.layoutZ ?? 0;
        zLevelCounts.set(z, (zLevelCounts.get(z) || 0) + 1);
      });

      // Find the Z-level with the most rooms
      let maxCount = 0;
      let mostPopulatedZ = 0;
      zLevelCounts.forEach((count, z) => {
        if (count > maxCount) {
          maxCount = count;
          mostPopulatedZ = z;
        }
      });

      console.log(`🏢 Setting default Z-level to ${mostPopulatedZ} (${maxCount} rooms)`);
      setCurrentZLevel(mostPopulatedZ);
      hasInitializedZLevel.current = true;
    }
  }, [rooms]);

  // Initial positioning when rooms are loaded
  useEffect(() => {
    console.log(`📍 Initial positioning useEffect: rooms=${rooms.length}, nodes=${nodes.length}, reactFlow=${!!reactFlowInstance}, worldMapMode=${worldMapMode}, currentViewMode=${currentViewMode}, transitionFlag=${worldMapTransitionRef.current}, customTransitionDone=${customZoneTransitionDone.current}, hasPerformedInitialFit=${hasPerformedInitialFit.current}, initialRoomId=${initialRoomId}`);

    // Only perform initial fit once - don't re-trigger on Z-level changes
    // Also need nodes to be ready for positioning
    if (rooms.length > 0 && nodes.length > 0 && reactFlowInstance && !worldMapMode && currentViewMode !== 'world-map' && !worldMapTransitionRef.current && !customZoneTransitionDone.current && !hasPerformedInitialFit.current) {
      console.log(`🎯 Running initial positioning logic with initialRoomId=${initialRoomId}`);
      // Check if we came from world map (session storage flag)
      const cameFromWorldMap = sessionStorage.getItem('selectedZoneFromWorldMap');

      // Add a delay to ensure React Flow has rendered the nodes properly
      const timer = setTimeout(() => {
        if (cameFromWorldMap) {
          // console.log('🎯 Centering view from world map transition');
          // If coming from world map, center on rooms at the current Z-level (largest cluster)
          const roomNodes = nodes.filter(node =>
            node.type === 'room' &&
            node.position &&
            node.data.isCurrentFloor // Only center on rooms at current Z-level
          );

          if (roomNodes.length > 0) {
            // Calculate bounds of all rooms for better centering
            const roomBounds = roomNodes.map(node => ({
              minX: node.position.x,
              maxX: node.position.x + (node.width || 180),
              minY: node.position.y,
              maxY: node.position.y + (node.height || 120)
            }));

            const minX = Math.min(...roomBounds.map(b => b.minX));
            const maxX = Math.max(...roomBounds.map(b => b.maxX));
            const minY = Math.min(...roomBounds.map(b => b.minY));
            const maxY = Math.max(...roomBounds.map(b => b.maxY));

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            // Calculate appropriate zoom to fit all rooms with better padding
            const contentWidth = maxX - minX + 600; // Increased padding for better overview
            const contentHeight = maxY - minY + 400; // Increased padding for better overview

            // Get actual container dimensions from React Flow instance
            const rfWrapper = document.querySelector('.react-flow__viewport');
            const containerWidth = rfWrapper?.clientWidth || 1200;
            const containerHeight = rfWrapper?.clientHeight || 800;

            const targetZoom = Math.min(
              containerWidth / contentWidth,
              containerHeight / contentHeight,
              0.8 // Reduced maximum zoom for better overview
            );

            // console.log('🎯 Centering on zone rooms:', {
            //   center: { x: centerX, y: centerY },
            //   zoom: Math.max(targetZoom, 0.3),
            //   roomCount: roomNodes.length
            // });

            // Set center with calculated zoom for optimal zone view
            reactFlowInstance.setCenter(centerX, centerY, {
              zoom: Math.max(targetZoom, 0.15), // Minimum zoom of 0.15 to stay above world map threshold (0.05)
              duration: 1000 // Slightly longer transition for better UX
            });
          } else {
            // console.log('🎯 No room nodes found, using fitView fallback');
            // Fallback to fitView if no room nodes
            reactFlowInstance.fitView({
              padding: 0.3,
              minZoom: 0.15, // Stay above world map threshold (0.05)
              maxZoom: 0.8,
              duration: 1000
            });
          }

          // Clear the flag after using it
          sessionStorage.removeItem('selectedZoneFromWorldMap');
        } else {
          // Check if we should center on a specific initial room
          if (initialRoomId) {
            const targetRoomNode = nodes.find(node =>
              node.type === 'room' &&
              parseInt(node.id) === initialRoomId
            );

            if (targetRoomNode && targetRoomNode.position) {
              // Center on the specific room with a comfortable zoom level
              const centerX = targetRoomNode.position.x + (targetRoomNode.width || 180) / 2;
              const centerY = targetRoomNode.position.y + (targetRoomNode.height || 120) / 2;

              console.log(`🎯 Centering on initial room ${initialRoomId}: center=(${centerX.toFixed(1)}, ${centerY.toFixed(1)}), zoom=1.0`);

              reactFlowInstance.setCenter(centerX, centerY, {
                zoom: 1.0, // Comfortable zoom level to see the room and its neighbors
                duration: 800 // Smooth animation to the target room
              });
            } else {
              console.log(`⚠️ Initial room ${initialRoomId} not found in nodes, falling back to zone view`);
              // Fall through to normal zone centering below
            }
          }

          // Normal fitView for regular navigation - center on rooms at current Z-level
          // (only runs if no initialRoomId or room not found)
          if (!initialRoomId || !nodes.find(n => n.type === 'room' && parseInt(n.id) === initialRoomId)) {
            const roomNodes = nodes.filter(node =>
              node.type === 'room' &&
              node.position &&
              node.data.isCurrentFloor // Only center on rooms at current Z-level
            );

            if (roomNodes.length > 0) {
              // Use same bounds calculation as first entry for consistent behavior
              const roomBounds = roomNodes.map(node => ({
                minX: node.position.x,
                maxX: node.position.x + (node.width || 180),
                minY: node.position.y,
                maxY: node.position.y + (node.height || 120)
              }));

              const minX = Math.min(...roomBounds.map(b => b.minX));
              const maxX = Math.max(...roomBounds.map(b => b.maxX));
              const minY = Math.min(...roomBounds.map(b => b.minY));
              const maxY = Math.max(...roomBounds.map(b => b.maxY));

              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;

              // Calculate appropriate zoom to fit all rooms with same logic as first entry
              const contentWidth = maxX - minX + 600; // Same padding as first entry
              const contentHeight = maxY - minY + 400; // Same padding as first entry

              const rfWrapper = document.querySelector('.react-flow__viewport');
              const containerWidth = rfWrapper?.clientWidth || 1200;
              const containerHeight = rfWrapper?.clientHeight || 800;

              const targetZoom = Math.min(
                containerWidth / contentWidth,
                containerHeight / contentHeight,
                0.8 // Same maximum zoom as first entry
              );

              console.log(`🔄 Regular navigation using same centering logic: zoom=${Math.max(targetZoom, 0.15).toFixed(3)}, center=(${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);

              // Use setCenter like first entry for consistent behavior
              reactFlowInstance.setCenter(centerX, centerY, {
                zoom: Math.max(targetZoom, 0.15), // Same minimum zoom as first entry
                duration: 0 // No animation for regular navigation
              });
            } else {
              // Fallback to fitView if no room nodes
              reactFlowInstance.fitView({
                padding: 0.2,
                minZoom: 0.15, // Stay above world map threshold (0.05)
                maxZoom: 1.2,
                duration: 0
              });
            }
          }
        }

        // Mark initial fit as performed to prevent re-triggering
        hasPerformedInitialFit.current = true;
      }, 300); // Further increased delay to ensure proper rendering

      return () => clearTimeout(timer);
    }
  }, [rooms.length, nodes.length, reactFlowInstance, worldMapMode, currentViewMode, zoneId, initialRoomId]);

  // Memoized world map nodes to prevent unnecessary recalculations
  const worldMapNodes = useMemo(() => {
    console.log(`🌐 worldMapNodes memoization: worldMapMode=${worldMapMode}, currentViewMode=${currentViewMode}, hasZoneMapData=${!!zoneMapData}, hasReactFlow=${!!reactFlowInstance}`);

    if ((worldMapMode || currentViewMode === 'world-map') && zoneMapData) {
      const currentZoom = reactFlowInstance?.getZoom() || 0.5;
      console.log(`🌐 Generating world map nodes with zoom=${currentZoom}`);

      try {
        const nodes = generateEnhancedWorldMapNodes(zoneMapData, currentZoom);
        console.log(`🌐 Generated ${nodes.length} world map nodes`);
        return nodes;
      } catch (error) {
        console.error(`🌐 Error generating world map nodes:`, error);
        return [];
      }
    }

    console.log(`🌐 Not generating world map nodes - conditions not met`);
    return [];
  }, [worldMapMode, currentViewMode, zoneMapData, generateEnhancedWorldMapNodes]);

  // Convert rooms to React Flow nodes and edges
  useEffect(() => {
    console.log(`🔄 Node generation useEffect: worldMapMode=${worldMapMode}, currentViewMode=${currentViewMode}, worldMapNodes=${worldMapNodes.length}, zoneMapData=${!!zoneMapData}, rooms=${rooms.length}`);

    // Handle world map mode OR world-map view mode
    if (worldMapMode || currentViewMode === 'world-map') {
      console.log(`🌍 Should show world map view - checking nodes...`);
      if (worldMapNodes.length > 0) {
        console.log(`✅ Setting ${worldMapNodes.length} world map nodes`);
        setNodes(worldMapNodes);
        setEdges([]); // No edges in world map view

        // Check if we need to center on a specific zone after world map nodes are set
        const centerOnZone = sessionStorage.getItem('centerOnZoneInWorldMap');
        if (centerOnZone && reactFlowInstance && zoneMapData && !worldMapTransitionRef.current) {
          console.log(`🎯 Post-generation centering on zone ${centerOnZone}`);

          // Find the zone node and center on it
          const targetZoneId = parseInt(centerOnZone);
          const currentZoneNode = worldMapNodes.find(node =>
            node.id === `zone-boundary-${targetZoneId}`
          );

          if (currentZoneNode) {
            const targetZoom = 0.15;
            const zoneCenterX = currentZoneNode.position.x + (currentZoneNode.data?.width || 200) / 2;
            const zoneCenterY = currentZoneNode.position.y + (currentZoneNode.data?.height || 120) / 2;

            setTimeout(() => {
              reactFlowInstance.setCenter(zoneCenterX, zoneCenterY, {
                zoom: targetZoom,
                duration: 300
              });
              sessionStorage.removeItem('centerOnZoneInWorldMap');
            }, 100);
          }
        }
      } else if (!zoneMapData) {
        console.log(`❌ No zone data - setting empty nodes`);
        // If we're switching to world-map view but don't have zone data yet, show empty
        setNodes([]);
        setEdges([]);
      } else {
        console.log(`⚠️ Have zone data but no world map nodes generated`);
      }
      return;
    }

    console.log(`🏠 Should show zone room view with ${rooms.length} rooms`);

    if (rooms.length === 0) {
      console.log(`⚠️ No rooms to generate nodes from - setting empty`);
      setNodes([]);
      setEdges([]);
      return;
    }

    // Grid-based layout algorithm with saved position support
    const getNodePosition = (room: Room, index: number, total: number) => {
      // Use zone-specific cache key to prevent cross-zone position pollution
      const cacheKey = `${room.zoneId}-${room.id}`;

      // First priority: Use current position from ref (preserves drag positions)
      if (nodePositionsRef.current[cacheKey]) {
        return nodePositionsRef.current[cacheKey];
      }

      // Second priority: Use saved grid position if available (convert to pixels)
      if (room.layoutX !== null && room.layoutY !== null) {
        const position = {
          x: gridToPixels(room.layoutX!),
          y: gridToPixelsY(room.layoutY!), // Use Y-inverted helper so NORTH goes up on screen
        };
        // Store in ref for future use
        nodePositionsRef.current[cacheKey] = position;
        return position;
      }

      // Third priority: Fallback to auto-layout algorithm (grid-snapped)
      if (total === 1) {
        const position = { x: gridToPixels(2), y: gridToPixels(1) }; // Center position
        nodePositionsRef.current[cacheKey] = position;
        return position;
      }

      // Place rooms on grid based on exits
      const cols = Math.max(3, Math.ceil(Math.sqrt(total * 1.2)));
      const col = index % cols;
      const row = Math.floor(index / cols);

      const position = {
        x: gridToPixels(col * 3 + 1), // 3 grid spacing (540px) with 1 grid offset - more space for exits
        y: gridToPixels(row * 3 + 1), // 3 grid spacing (540px) with 1 grid offset - more space for exits
      };
      nodePositionsRef.current[cacheKey] = position;
      return position;
    };

    // Create room nodes with enhanced data and depth effects
    const newNodes: Node[] = rooms.map((room, index) => {
      // Check if this room is involved in any overlaps
      const overlappingWith = overlaps.find(overlap =>
        overlap.roomIds.includes(room.id)
      );

      // Calculate depth effects based on current floor
      const roomZ = room.layoutZ ?? 0;
      const floorDifference = roomZ - currentZLevel;
      const isCurrentFloor = floorDifference === 0;
      const isSelected = room.id === selectedRoomId;

      // Visual depth effects
      let opacity = 1;
      let offsetX = 0;
      let offsetY = 0;
      let zIndex = 100;

      // Z-level offset for different floors (diagonal: up-left for upper, down-right for lower)
      if (!isCurrentFloor) {
        if (floorDifference > 0) {
          // Upper floors - reduced opacity, northwest (up-left) diagonal offset
          opacity = Math.max(0.5, 1 - (floorDifference * 0.15)); // Gentler opacity reduction (0.5 min instead of 0.3)
          offsetX = -floorDifference * 18;  // Move up-left diagonally (reduced to 18px to prevent neighbor overlap)
          offsetY = -floorDifference * 18;
          zIndex = 100 - floorDifference; // Higher floors appear behind (lower z-index)
        } else {
          // Lower floors - reduced opacity, southeast (down-right) diagonal offset
          opacity = Math.max(0.5, 1 - (Math.abs(floorDifference) * 0.15));
          offsetX = Math.abs(floorDifference) * 18;  // Move down-right diagonally (reduced to 18px)
          offsetY = Math.abs(floorDifference) * 18;
          zIndex = 100 - Math.abs(floorDifference); // Lower floors appear behind (lower z-index) - FIXED: was 100 + abs
        }
      }

      // Overlap offset for rooms at same position on same floor (horizontal only to distinguish from Z-level diagonal)
      let overlapOffset = 0;
      let totalOverlaps = 1;
      if (overlappingWith && overlappingWith.roomIds.length > 1) {
        // Find index of this room in the overlap stack
        const overlapIndex = overlappingWith.roomIds.indexOf(room.id);
        totalOverlaps = overlappingWith.roomIds.length;

        // Calculate horizontal stack offset (15px per room - horizontal only, not diagonal)
        const STACK_OFFSET = 15;
        overlapOffset = overlapIndex * STACK_OFFSET;

        // Apply offset horizontally only (right direction) to distinguish from Z-level diagonal offset
        offsetX += overlapOffset;
        // No Y offset for same-floor overlaps - keeps them horizontally aligned

        // Adjust z-index for stacking (higher index = on top)
        zIndex += overlapIndex;
      }

      // Selected room should always be on top
      if (isSelected) {
        zIndex = 1000; // High z-index for selected room
      }

      const nodePosition = getNodePosition(room, index, rooms.length);

      return {
        id: room.id.toString(),
        type: 'room',
        position: {
          x: nodePosition.x + offsetX,
          y: nodePosition.y + offsetY,
        },
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
          room: room,
          isOverlapping: !!overlappingWith,
          overlapInfo: overlappingWith,
          currentZLevel,
          isCurrentFloor,
          depthOpacity: opacity,
          isSelected: room.id === selectedRoomId,
          // New overlap management properties
          overlappedRooms: overlappingWith?.roomIds?.map(id => {
            const r = rooms.find(room => room.id === id);
            return { id, name: r?.name || `Room ${id}` };
          }) || [],
          overlapIndex: overlappingWith ? overlappingWith.roomIds.indexOf(room.id) : undefined,
          totalOverlaps: totalOverlaps > 1 ? totalOverlaps : undefined,
          activeOverlapIndex: getActiveOverlapIndex(room.id, overlappingWith?.roomIds || []),
          onSwitchOverlapRoom: (direction: 'next' | 'prev') => handleSwitchOverlapRoom(room.id, overlappingWith?.roomIds || [], direction),
        },
        draggable: viewMode === 'edit' && isCurrentFloor, // Only allow dragging rooms on current floor
        className: overlappingWith ? 'room-overlapping' : undefined,
        style: {
          // Don't set opacity here - RoomNode handles it internally based on isCurrentFloor
          zIndex,
          filter: !isCurrentFloor ? 'grayscale(0.3)' : undefined,
        },
      };
    });

    // Detect one-way exits for enhanced visualization
    const autoLayoutRooms: AutoLayoutRoom[] = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      layoutX: room.layoutX,
      layoutY: room.layoutY,
      layoutZ: room.layoutZ,
      exits: room.exits.map(exit => ({
        direction: exit.direction,
        toRoomId: exit.toRoomId
      }))
    }));

    const oneWayExits = detectOneWayExits(autoLayoutRooms);

    // Create edges from exits with enhanced styling for one-way exits
    const newEdges: Edge[] = [];
    const portalNodes: Node[] = []; // Portal nodes for cross-zone exits
    const exitDirections = { NORTH: 0, SOUTH: 0, EAST: 0, WEST: 0, NORTHEAST: 0, NORTHWEST: 0, SOUTHEAST: 0, SOUTHWEST: 0, UP: 0, DOWN: 0 };

    rooms.forEach(room => {
      room.exits.forEach(exit => {
        // Find target room by matching BOTH zone ID and room ID
        // This correctly handles both intra-zone and cross-zone exits
        const targetZoneId = exit.toZoneId ?? room.zoneId;
        const targetRoom = rooms.find(r => r.zoneId === targetZoneId && r.id === exit.toRoomId);

        if (exit.toRoomId && targetRoom) {
          // Count exits by direction for analysis
          exitDirections[exit.direction as keyof typeof exitDirections]++;

          // Debug logging for exit processing (commented out to prevent spam)
          // console.log(`🔍 Creating edge: Room ${room.id} → Room ${exit.toRoomId} via ${exit.direction}`);
          // console.log(`   Source room position: (${room.layoutX}, ${room.layoutY})`);
          // console.log(`   Target room position: (${targetRoom.layoutX}, ${targetRoom.layoutY})`);

          // Check if source or target room is in an overlap
          const isOverlappingEdge = overlaps.some(overlap =>
            overlap.roomIds.includes(room.id) ||
            overlap.roomIds.includes(exit.toRoomId!)
          );

          // Check if this is a one-way exit
          const oneWayExit = oneWayExits.find(owe =>
            owe.fromRoom === room.id && owe.toRoom === exit.toRoomId
          );
          const isOneWay = oneWayExit?.isOneWay || false;

          // Enhanced styling for different exit types
          let edgeColor = getThemeColor('#6b7280', '#9ca3af'); // Default gray
          let strokeWidth = 2;
          let strokeDasharray = undefined;
          let animated = false;

          if (isOverlappingEdge) {
            edgeColor = getThemeColor('#ea580c', '#f97316'); // Orange for overlapping edges
            strokeWidth = 3;
          } else if (isOneWay) {
            edgeColor = getThemeColor('#dc2626', '#ef4444'); // Red for one-way exits
            strokeWidth = 2.5;
            strokeDasharray = '8,4'; // Dashed line for one-way
            animated = true; // Subtle animation for one-way exits
          }

          if (!exit.description) {
            strokeDasharray = strokeDasharray || '5,5'; // Dotted for exits without description
          }

          const edgeStyle = {
            stroke: edgeColor,
            strokeWidth,
            strokeDasharray,
          };

          const edge = {
            id: `${room.id}-${exit.toRoomId}-${exit.direction}`,
            source: room.id.toString(),
            target: exit.toRoomId.toString(),
            type: 'straight',
            animated,
            style: edgeStyle,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: isOneWay ? 18 : 15, // Larger arrow for one-way exits
              height: isOneWay ? 18 : 15,
              color: edgeColor,
            },
            // Add label for one-way exits with reason
            label: isOneWay ? `🚫 One-way (${oneWayExit?.reason?.replace('_', ' ')})` : undefined,
            labelStyle: isOneWay ? {
              fill: getThemeColor('#dc2626', '#ef4444'),
              fontWeight: 'bold',
              fontSize: '11px',
              background: getThemeColor('rgba(255,255,255,0.9)', 'rgba(0,0,0,0.9)'),
              padding: '2px 4px',
              borderRadius: '3px'
            } : undefined,
            // Add source/target handles for proper directional connections
            sourceHandle: exit.direction === 'EAST' ? 'right' :
              exit.direction === 'WEST' ? 'left' :
                exit.direction === 'NORTH' ? 'top' :
                  exit.direction === 'SOUTH' ? 'bottom' :
                    exit.direction === 'UP' ? 'up' :
                      exit.direction === 'DOWN' ? 'down' : undefined,
            targetHandle: exit.direction === 'EAST' ? 'left-target' :
              exit.direction === 'WEST' ? 'right-target' :
                exit.direction === 'NORTH' ? 'bottom-target' :
                  exit.direction === 'SOUTH' ? 'top-target' :
                    exit.direction === 'UP' ? 'down-target' :
                      exit.direction === 'DOWN' ? 'up-target' : undefined,
          };

          newEdges.push(edge);
          // console.log(`✅ Edge added: ${edge.id} (${exit.direction}${isOneWay ? ' - ONE-WAY' : ''})`);
        } else if (exit.toRoomId && exit.toZoneId && exit.toZoneId !== room.zoneId) {
          // Cross-zone exit - create a portal node
          const roomNode = newNodes.find(n => n.id === room.id.toString());
          if (roomNode) {
            // Calculate portal position based on exit direction
            const directionOffsets = {
              NORTH: { x: 0, y: -120 },
              SOUTH: { x: 0, y: 120 },
              EAST: { x: 200, y: 0 },
              WEST: { x: -200, y: 0 },
              NORTHEAST: { x: 140, y: -85 },
              NORTHWEST: { x: -140, y: -85 },
              SOUTHEAST: { x: 140, y: 85 },
              SOUTHWEST: { x: -140, y: 85 },
              UP: { x: 0, y: -100 },
              DOWN: { x: 0, y: 100 },
            };

            const offset = directionOffsets[exit.direction as keyof typeof directionOffsets] || { x: 0, y: 0 };
            const portalId = `portal-${room.zoneId}-${room.id}-${exit.direction}-${exit.toZoneId}-${exit.toRoomId}`;

            // Create portal node
            const portalNode: Node = {
              id: portalId,
              type: 'portal',
              position: {
                x: roomNode.position.x + offset.x,
                y: roomNode.position.y + offset.y,
              },
              data: {
                direction: exit.direction,
                destZoneId: exit.toZoneId,
                destRoomId: exit.toRoomId,
                zoneName: `Zone ${exit.toZoneId}`,
              },
              draggable: false,
            };

            portalNodes.push(portalNode);

            // Create edge from room to portal
            const portalEdge: Edge = {
              id: `${room.id}-${portalId}-${exit.direction}`,
              source: room.id.toString(),
              target: portalId,
              type: 'straight',
              animated: true,
              style: {
                stroke: getThemeColor('#8b5cf6', '#a78bfa'), // Purple for portals
                strokeWidth: 2.5,
                strokeDasharray: '8,4',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 18,
                height: 18,
                color: getThemeColor('#8b5cf6', '#a78bfa'),
              },
              sourceHandle: exit.direction === 'EAST' ? 'right' :
                exit.direction === 'WEST' ? 'left' :
                  exit.direction === 'NORTH' ? 'top' :
                    exit.direction === 'SOUTH' ? 'bottom' :
                      exit.direction === 'UP' ? 'up' :
                        exit.direction === 'DOWN' ? 'down' : null,
              targetHandle: exit.direction === 'EAST' ? 'left-target' :
                exit.direction === 'WEST' ? 'right-target' :
                  exit.direction === 'NORTH' ? 'bottom-target' :
                    exit.direction === 'SOUTH' ? 'top-target' :
                      exit.direction === 'UP' ? 'down-target' :
                        exit.direction === 'DOWN' ? 'up-target' : null,
            };

            newEdges.push(portalEdge);
            console.log(`🌀 Created portal: Room ${room.zoneId}:${room.id} → Zone ${exit.toZoneId}:${exit.toRoomId} via ${exit.direction}`);
          }
        }
      });
    });

    // Append portal nodes to the nodes array
    const allNodes = [...newNodes, ...portalNodes];

    console.log(`✅ Generated ${newNodes.length} room nodes, ${portalNodes.length} portal nodes, and ${newEdges.length} edges for zone view`);
    setNodes(allNodes);
    setEdges(newEdges);
  }, [rooms, viewMode, setNodes, setEdges, currentZLevel, overlaps, selectedRoomId, worldMapMode, worldMapNodes, currentViewMode]);

  // Detect overlaps when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && !worldMapMode && currentViewMode !== 'world-map') {
      // Build position map from room layoutX, layoutY, layoutZ
      const positions: Record<number, { x: number; y: number; z?: number }> = {};
      rooms.forEach(room => {
        if (room.layoutX !== null && room.layoutX !== undefined &&
            room.layoutY !== null && room.layoutY !== undefined) {
          positions[room.id] = {
            x: room.layoutX,
            y: room.layoutY,
            z: room.layoutZ ?? 0,
          };
        }
      });

      // Detect overlaps
      const detectedOverlaps = detectOverlaps(positions);

      // Only update if overlaps changed to avoid infinite loops
      if (JSON.stringify(detectedOverlaps) !== JSON.stringify(overlaps)) {
        setOverlaps(detectedOverlaps);
        // Don't auto-show the panel - let user toggle it with the button
      }
    }
  }, [rooms, worldMapMode, currentViewMode]); // Removed overlaps from dependencies to avoid infinite loop

  // Event handlers
  const onConnect = useCallback(
    (params: Connection) => setEdges(els => addEdge(params, els)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent event propagation to avoid multiple handlers
      event.stopPropagation();

      // Prevent unnecessary event handling for world map room clicks to avoid console spam
      if (node.type === 'worldRoom' && worldMapMode) {
        // Only handle room selection in world map, don't trigger drag events
        const roomId = node.data.roomId;
        handleRoomSelect(roomId);
        return;
      }

      if (node.type === 'room') {
        const roomId = parseInt(node.id);

        // Only update selected room if it's actually different
        if (selectedRoomId !== roomId) {
          setSelectedRoomId(roomId);
          const room = rooms.find(r => r.id === roomId);
          setEditedRoom(room ? { ...room } : null);

          // Auto-switch to the selected room's floor so it's fully visible
          if (room) {
            const roomFloor = room.layoutZ ?? 0;
            setCurrentZLevel(roomFloor);
            console.log(`🏢 Auto-switched to floor Z${roomFloor} for selected room ${roomId}`);
          }

          // Center and zoom to the selected room with animation
          if (reactFlowInstance && node.position) {
            const centerX = node.position.x + (node.width || 180) / 2;
            const centerY = node.position.y + (node.height || 120) / 2;

            reactFlowInstance.setCenter(centerX, centerY, {
              zoom: 1.0, // Comfortable zoom level to see the room and its neighbors
              duration: 800 // Smooth animation to the target room
            });
          }

          // Update URL to mark room as active
          router.push(`/dashboard/zones/editor?zone=${zoneId}&room=${roomId}`);
        }
      } else if (node.type === 'zone') {
        // Handle zone selection in world map mode
        const zoneId = node.data.zoneId;
        handleZoneSelect(zoneId);
      }
    },
    [rooms, handleZoneSelect, handleRoomSelect, worldMapMode, selectedRoomId, router, zoneId, reactFlowInstance]
  );

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      // Prevent drag handling for world map nodes and non-room nodes in world map mode
      if (worldMapMode || (node.type !== 'room' && viewMode !== 'edit')) {
        return;
      }

      if (viewMode === 'edit') {
        const originalPosition = dragStartPositions.current[node.id];

        // Check if the node was actually moved (not just clicked)
        if (!originalPosition ||
          (Math.abs(originalPosition.x - node.position.x) < 5 &&
            Math.abs(originalPosition.y - node.position.y) < 5)) {
          // No significant movement, this was likely just a click
          return;
        }

        // Snap to grid and convert to grid coordinates
        const snappedX = snapToGrid(node.position.x);
        const snappedY = snapToGrid(node.position.y);
        const gridX = pixelsToGrid(snappedX);
        const gridY = pixelsToGrid(snappedY);

        // Only log significant moves to reduce spam (increased threshold) and only in edit mode
        // Removed console.log to prevent spam during room selection/movement
        // if (viewMode === 'edit' && originalPosition && (Math.abs(originalPosition.x - snappedX) > 100 || Math.abs(originalPosition.y - snappedY) > 100)) {
        //   console.log(`🚚 Room ${node.id} moved to grid: (${gridX}, ${gridY})`);
        // }

        // Update node position to snapped position
        setNodes(nodes =>
          nodes.map(n =>
            n.id === node.id
              ? { ...n, position: { x: snappedX, y: snappedY } }
              : n
          )
        );

        // Save grid coordinates to backend
        try {
          const currentRoom = rooms.find(r => r.id === parseInt(node.id));

          // Update the ref to preserve position during re-renders (with zone-specific key)
          if (currentRoom) {
            const cacheKey = `${currentRoom.zoneId}-${currentRoom.id}`;
            nodePositionsRef.current[cacheKey] = { x: snappedX, y: snappedY };
          }
          const currentZ = currentRoom?.layoutZ ?? 0;

          const response = await authenticatedFetch(
            'http://localhost:4000/graphql',
            {
              method: 'POST',
              body: JSON.stringify({
                query: `
              mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
                updateRoomPosition(id: $id, position: $position) {
                  id
                  layoutX
                  layoutY
                  layoutZ
                }
              }
            `,
                variables: {
                  id: parseInt(node.id),
                  position: {
                    layoutX: gridX,
                    layoutY: gridY,
                    layoutZ: currentZ, // Preserve current Z level
                  },
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (!data.errors) {
              // Update the local rooms state with saved position
              setRooms(prevRooms =>
                prevRooms.map(room =>
                  room.id === parseInt(node.id)
                    ? {
                      ...room,
                      layoutX: gridX,
                      layoutY: gridY,
                      layoutZ: currentZ,
                    }
                    : room
                )
              );
              // Add to undo history if position actually changed
              if (originalPosition && (
                Math.abs(originalPosition.x - snappedX) > 1 ||
                Math.abs(originalPosition.y - snappedY) > 1
              )) {
                addToUndoHistory({
                  type: 'MOVE_ROOM',
                  timestamp: Date.now(),
                  roomId: parseInt(node.id),
                  previousPosition: originalPosition,
                  newPosition: { x: snappedX, y: snappedY },
                });
              }

              // Clean up drag start position
              delete dragStartPositions.current[node.id];

              // Only log successful saves for significant moves to reduce spam
            } else {
              console.error(
                `❌ Failed to save room ${node.id} position:`,
                data.errors[0].message
              );
            }
          } else {
            console.error(
              `❌ Failed to save room ${node.id} position:`,
              await response.text()
            );
          }
        } catch (error) {
          console.error(`❌ Error saving room ${node.id} position:`, error);
        }
      }
    },
    [viewMode, setNodes, setRooms, rooms, addToUndoHistory]
  );

  const handleRoomChange = useCallback(
    (field: keyof Room, value: string) => {
      if (editedRoom) {
        setEditedRoom({ ...editedRoom, [field]: value });
      }
    },
    [editedRoom]
  );

  const handleSaveRoom = async () => {
    if (!editedRoom || !selectedRoomId) return;
    if (!canEditZone(zoneId)) {
      setError('You do not have permission to edit this zone.');
      return;
    }

    setSaving(true);
    try {
      const response = await authenticatedFetch(
        'http://localhost:4000/graphql',
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
            mutation UpdateRoom($id: Int!, $data: UpdateRoomInput!) {
              updateRoom(id: $id, data: $data) {
                id
                name
                roomDescription
                sector
              }
            }
          `,
            variables: {
              id: selectedRoomId,
              data: {
                name: editedRoom.name,
                description: editedRoom.description,
                sector: editedRoom.sector,
              },
            },
          }),
        }
      );

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId ? { ...room, ...editedRoom } : room
        )
      );

      console.log('Room saved successfully');
    } catch (err) {
      console.error('Error saving room:', err);
      alert(
        'Error saving room: ' +
        (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExit = async (exitData: {
    direction: string;
    toRoomId: number;
  }) => {
    if (!selectedRoomId) return;
    if (!canEditZone(zoneId)) {
      setError('You do not have permission to edit this zone.');
      return;
    }

    setManagingExits(true);
    try {
      // Mock API call for now
      const newExit = {
        id: `exit_${selectedRoomId}_${exitData.toRoomId}_${Date.now()}`,
        direction: exitData.direction,
        toRoomId: exitData.toRoomId,
        description: '',
        keyword: '',
      };

      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId
            ? { ...room, exits: [...room.exits, newExit] }
            : room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev =>
          prev ? { ...prev, exits: [...prev.exits, newExit] } : null
        );
      }

      console.log('Exit created successfully:', newExit);
    } catch (err) {
      console.error('Error creating exit:', err);
    } finally {
      setManagingExits(false);
    }
  };

  const handleDeleteExit = async (exitId: string) => {
    if (!selectedRoomId) return;
    if (!canEditZone(zoneId)) {
      setError('You do not have permission to edit this zone.');
      return;
    }

    setManagingExits(true);
    try {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId
            ? { ...room, exits: room.exits.filter(exit => exit.id !== exitId) }
            : room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev =>
          prev
            ? {
              ...prev,
              exits: prev.exits.filter(exit => exit.id !== exitId),
            }
            : null
        );
      }

      console.log('Exit deleted successfully');
    } catch (err) {
      console.error('Error deleting exit:', err);
    } finally {
      setManagingExits(false);
    }
  };

  const handleUpdateExit = async (exitId: string, exitData: any) => {
    if (!selectedRoomId) return;
    if (!canEditZone(zoneId)) {
      setError('You do not have permission to edit this zone.');
      return;
    }

    setManagingExits(true);
    try {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId
            ? {
              ...room,
              exits: room.exits.map(exit =>
                exit.id === exitId ? { ...exit, ...exitData } : exit
              ),
            }
            : room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev =>
          prev
            ? {
              ...prev,
              exits: prev.exits.map(exit =>
                exit.id === exitId ? { ...exit, ...exitData } : exit
              ),
            }
            : null
        );
      }

      console.log('Exit updated successfully');
    } catch (err) {
      console.error('Error updating exit:', err);
    } finally {
      setManagingExits(false);
    }
  };

  const handleRemoveMob = async (mobId: number) => {
    if (!selectedRoomId || !canEditZone(zoneId)) {
      setError('You do not have permission to edit this zone.');
      return;
    }

    try {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId
            ? {
              ...room,
              mobs: room.mobs?.filter(mob => mob.id !== mobId) || [],
            }
            : room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev =>
          prev
            ? {
              ...prev,
              mobs: prev.mobs?.filter(mob => mob.id !== mobId) || [],
            }
            : null
        );
      }

      console.log('Mob removed successfully from room:', mobId);
    } catch (err) {
      console.error('Error removing mob:', err);
    }
  };

  const handleRemoveObject = async (objectId: number) => {
    if (!selectedRoomId || !canEditZone(zoneId)) {
      setError('You do not have permission to edit this zone.');
      return;
    }

    try {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        // Objects are managed separately, no need to update editedRoom
      }

      console.log('Object removed successfully from room:', objectId);
    } catch (err) {
      console.error('Error removing object:', err);
    }
  };

  // Helper function to find the nearest room to a position
  const findNearestRoom = useCallback((position: { x: number; y: number }) => {
    let nearestRoom = null;
    let minDistance = Infinity;

    rooms.forEach(room => {
      const roomX = room.layoutX ?? 0;
      const roomY = room.layoutY ?? 0;
      const distance = Math.sqrt(Math.pow(position.x - roomX, 2) + Math.pow(position.y - roomY, 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearestRoom = room;
      }
    });

    return nearestRoom;
  }, [rooms]);

  // Handler to add a mob to a room
  const handleAddMobToRoom = useCallback(async (roomId: number, mob: any) => {
    try {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === roomId
            ? {
              ...room,
              mobs: [...(room.mobs || []), { ...mob, roomId }],
            }
            : room
        )
      );

      // Also update editedRoom if it's the target room
      if (editedRoom?.id === roomId) {
        setEditedRoom(prev =>
          prev
            ? {
              ...prev,
              mobs: [...(prev.mobs || []), { ...mob, roomId }],
            }
            : null
        );
      }

      console.log(`✅ Added mob "${mob.name}" to room ${roomId}`);
    } catch (err) {
      console.error('Error adding mob to room:', err);
      setError('Failed to add mob to room.');
    }
  }, [editedRoom]);

  // Handler to add an object to a room
  const handleAddObjectToRoom = useCallback(async (roomId: number, object: any) => {
    try {
      // Objects are managed separately at the zone level, not per room

      console.log(`✅ Added object "${object.name}" to room ${roomId}`);
    } catch (err) {
      console.error('Error adding object to room:', err);
      setError('Failed to add object to room.');
    }
  }, [editedRoom]);

  const handleUpdateZLevel = async (roomId: number, newZLevel: number) => {
    console.log(`Updating room ${roomId} Z-level to ${newZLevel}`);

    try {
      const response = await authenticatedFetch(
        'http://localhost:4000/graphql',
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
            mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
              updateRoomPosition(id: $id, position: $position) {
                id
                layoutX
                layoutY
                layoutZ
              }
            }
          `,
            variables: {
              id: roomId,
              position: {
                layoutZ: newZLevel,
              },
            },
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === roomId ? { ...room, layoutZ: newZLevel } : room
          )
        );

        // Update nodes with new Z-level data
        setNodes(prevNodes =>
          prevNodes.map(node =>
            parseInt(node.id) === roomId
              ? { ...node, data: { ...node.data, layoutZ: newZLevel } }
              : node
          )
        );

        // Update edited room if it's the current room
        if (editedRoom?.id === roomId) {
          setEditedRoom(prev =>
            prev ? { ...prev, layoutZ: newZLevel } : null
          );
        }

        console.log(`✅ Room ${roomId} Z-level updated to ${newZLevel}`);
      } else {
        console.error(
          `❌ Failed to update room ${roomId} Z-level:`,
          await response.text()
        );
      }
    } catch (error) {
      console.error(`❌ Error updating room ${roomId} Z-level:`, error);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!canEditZone(zoneId)) {
      console.log('⚠️ You do not have permission to delete rooms in this zone');
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete room ${roomId}: "${room.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      console.log(`🗑️ Deleting room ${roomId}...`);

      const response = await authenticatedFetch(
        'http://localhost:4000/graphql',
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
            mutation DeleteRoom($id: Int!) {
              deleteRoom(id: $id) {
                id
                name
              }
            }
          `,
            variables: { id: roomId },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.errors) {
          // Remove room from local state
          setRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));

          // Remove node from React Flow
          setNodes(prevNodes => prevNodes.filter(n => parseInt(n.id) !== roomId));

          // Remove edges connected to this room
          setEdges(prevEdges =>
            prevEdges.filter(e =>
              e.source !== roomId.toString() && e.target !== roomId.toString()
            )
          );

          // Clear selection if deleted room was selected
          if (selectedRoomId === roomId) {
            setSelectedRoomId(null);
            setEditedRoom(null);
          }

          console.log(`✅ Room ${roomId} deleted successfully`);
        } else {
          console.error(`❌ GraphQL error deleting room ${roomId}:`, data.errors[0].message);
          alert(`Failed to delete room: ${data.errors[0].message}`);
        }
      } else {
        console.error(`❌ HTTP error deleting room ${roomId}:`, response.status);
        alert(`Failed to delete room: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error deleting room ${roomId}:`, error);
      alert(`Failed to delete room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateNewRoom = async (direction?: string) => {
    if (!canEditZone(zoneId)) {
      console.log('⚠️ You do not have permission to create rooms in this zone');
      return;
    }

    // Prompt for direction if not provided and a room is selected
    let selectedDirection = direction;
    if (!selectedDirection && selectedRoomId) {
      const availableDirections = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST', 'UP', 'DOWN'];
      const currentRoom = rooms.find(r => r.id === selectedRoomId);
      const usedDirections = currentRoom?.exits.map(e => e.direction) || [];
      const unusedDirections = availableDirections.filter(d => !usedDirections.includes(d));

      if (unusedDirections.length > 0) {
        const promptResult = prompt(
          `Create new room in which direction from room ${selectedRoomId}?\n\nAvailable directions: ${unusedDirections.join(', ')}`
        );
        selectedDirection = promptResult || undefined;

        if (selectedDirection && !unusedDirections.includes(selectedDirection.toUpperCase())) {
          alert(`Invalid direction. Available directions: ${unusedDirections.join(', ')}`);
          return;
        }
      }
    }

    const roomName = prompt('Enter name for the new room:');
    if (!roomName) return;

    const roomDescription = prompt('Enter description for the new room:') || '';

    // Find next available room ID
    const maxId = Math.max(...rooms.map(r => r.id), 0);
    const newRoomId = maxId + 1;

    try {
      console.log(`➕ Creating new room ${newRoomId}...`);

      const response = await authenticatedFetch(
        'http://localhost:4000/graphql',
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
            mutation CreateRoom($data: CreateRoomInput!) {
              createRoom(data: $data) {
                id
                name
                roomDescription
                sector
                layoutX
                layoutY
                layoutZ
                exits {
                  id
                  direction
                  toZoneId
                  toRoomId
                }
              }
            }
          `,
            variables: {
              data: {
                id: newRoomId,
                id: newRoomId,
                name: roomName,
                description: roomDescription,
                sector: 'STRUCTURE',
                zoneId: zoneId,
              },
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.errors) {
          const newRoom = data.data.createRoom;

          // Add room to local state
          setRooms(prevRooms => [...prevRooms, newRoom]);

          // Select the new room
          setSelectedRoomId(newRoom.id);
          setEditedRoom({ ...newRoom });

          console.log(`✅ Room ${newRoom.id} created successfully`);

          // TODO: Add exit creation functionality between rooms when direction is specified
          if (selectedRoomId && selectedDirection && selectedDirection.trim()) {
            console.log(`📝 Note: Would create ${selectedDirection} exit from room ${selectedRoomId} to new room ${newRoom.id}`);
          }
        } else {
          console.error(`❌ GraphQL error creating room:`, data.errors[0].message);
          alert(`Failed to create room: ${data.errors[0].message}`);
        }
      } else {
        console.error(`❌ HTTP error creating room:`, response.status);
        alert(`Failed to create room: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error creating room:`, error);
      alert(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Auto-layout functionality  
  const handleAutoLayout = useCallback(async () => {
    // Only allow auto-layout in edit mode
    if (viewMode !== 'edit') {
      console.log('⚠️ Auto-layout is only available in edit mode');
      return;
    }

    // Check permissions
    if (!canEditZone(zoneId)) {
      console.log('⚠️ You do not have permission to edit this zone');
      return;
    }

    // Store current positions for undo
    const previousPositions: Record<number, { x: number; y: number }> = {};
    nodes.forEach(node => {
      previousPositions[parseInt(node.id)] = { ...node.position };
    });
    console.log(`🔍 Current node positions:`, previousPositions);
    if (!rooms || rooms.length === 0) return;

    // Check if we have authentication token
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (!token) {
      console.error('❌ No auth token found - cannot perform auto-layout');
      return;
    }

    try {
      // Generate new positions using auto-layout algorithm
      const newPositions = autoLayoutRooms(rooms);

      const resolvedPositions = resolveOverlaps(newPositions);

      // Prepare batch updates
      const updates = Object.entries(resolvedPositions).map(([roomIdStr, pos]) => {
        const roomId = parseInt(roomIdStr);
        const currentRoom = rooms.find(r => r.id === roomId);

        // Use Z-level from auto-layout calculation if available, otherwise keep current
        const newZ = pos.z !== undefined ? pos.z : (currentRoom?.layoutZ ?? 0);

        return {
          roomId,
          layoutX: pos.x,
          layoutY: pos.y,
          layoutZ: newZ,
        };
      });

      console.log(`🔄 Batch updating ${updates.length} room positions...`);

      try {
        // Use batch update mutation
        const response = await authenticatedFetch(
          'http://localhost:4000/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
                mutation BatchUpdateRoomPositions($input: BatchUpdateRoomPositionsInput!) {
                  batchUpdateRoomPositions(input: $input) {
                    updatedCount
                    errors
                  }
                }
              `,
              variables: {
                input: {
                  updates,
                },
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            const result = data.data.batchUpdateRoomPositions;
            console.log(`✅ Batch updated ${result.updatedCount} rooms successfully`);

            if (result.errors && result.errors.length > 0) {
              console.warn(`⚠️ Some updates had issues:`, result.errors);
            }

            // Assume all updates were successful if no errors returned
            const successful = updates.length;
            const failed = result.errors ? result.errors.length : 0;

            console.log(`📊 Batch update completed: ${successful} successful, ${failed} failed`);
          } else {
            console.error(`❌ GraphQL error in batch update:`, data.errors[0].message);
            throw new Error(data.errors[0].message);
          }
        } else {
          console.error(`❌ HTTP error in batch update:`, response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Batch update failed:`, error);
        return; // Don't update local state if batch update failed
      }

      // Update local state for all rooms (batch update succeeded)
      setRooms(prevRooms => {
        return prevRooms.map(room => {
          const newPos = resolvedPositions[room.id];
          if (newPos) {
            const newZ = newPos.z !== undefined ? newPos.z : (room.layoutZ ?? 0);
            return {
              ...room,
              layoutX: newPos.x,
              layoutY: newPos.y,
              layoutZ: newZ,
            };
          }
          return room;
        });
      });

      // Update nodes in React Flow
      const updatedNodes = nodes.map(node => {
        const roomId = parseInt(node.id);
        const newPos = resolvedPositions[roomId];
        if (newPos) {
          return {
            ...node,
            position: {
              x: gridToPixels(newPos.x),
              y: gridToPixels(newPos.y),
            },
          };
        }
        return node;
      });

      // Clear the node position ref so useEffect will use the new database positions
      Object.keys(resolvedPositions).forEach(roomIdStr => {
        const roomId = parseInt(roomIdStr);
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          const cacheKey = `${room.zoneId}-${room.id}`;
          delete nodePositionsRef.current[cacheKey];
        }
      });

      setNodes(updatedNodes);

      // Check for any remaining overlaps
      const remainingOverlaps = detectOverlaps(resolvedPositions);
      setOverlaps(remainingOverlaps);
      // Don't auto-show the panel - let user toggle it with the button

      // Add to undo history (batch update succeeded)
      const finalPositions: Record<number, { x: number; y: number }> = {};
      updatedNodes.forEach(node => {
        finalPositions[parseInt(node.id)] = { ...node.position };
      });

      addToUndoHistory({
        type: 'MOVE_MULTIPLE_ROOMS',
        timestamp: Date.now(),
        previousPositions,
        newPositions: finalPositions,
      });

      console.log(`✅ Auto-layout applied: ${updates.length} rooms updated successfully`);
      if (remainingOverlaps.length > 0) {
        console.log(`⚠️ ${remainingOverlaps.length} overlaps detected and marked`);
      }
    } catch (error) {
      console.error('❌ Failed to apply auto-layout:', error);
    }
  }, [rooms, nodes, setNodes, addToUndoHistory, viewMode, canEditZone, zoneId]);

  // Comprehensive keyboard shortcuts for zone editor
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input field
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      // Global shortcuts (work regardless of selected room or mode)

      // Undo/Redo shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          if (canUndo) {
            handleUndo();
            console.log(`🔄 Undo triggered (${undoHistory.length - undoIndex} actions remaining)`);
          } else {
            console.log('⚠️ No actions to undo');
          }
          return;
        }

        if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault();
          if (canRedo) {
            handleRedo();
            console.log(`🔄 Redo triggered`);
          } else {
            console.log('⚠️ No actions to redo');
          }
          return;
        }
      }

      // Mode switching shortcuts (only for users with edit permissions)
      if (canEditZone(zoneId)) {
        if (event.key.toLowerCase() === 'e') {
          event.preventDefault();
          setViewMode('edit');
          console.log('✏️ Switched to Edit mode');
          return;
        }

        if (event.key.toLowerCase() === 'v') {
          event.preventDefault();
          setViewMode('view');
          console.log('👁️ Switched to View mode');
          return;
        }
      }

      // Layout shortcuts (only in edit mode with permissions)
      if (viewMode === 'edit' && canEditZone(zoneId)) {
        if (event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          handleAutoLayout();
          console.log('🔄 Auto-layout triggered');
          return;
        }

        if (event.key.toLowerCase() === 'r' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          handleResetLayout();
          console.log('🔄 Reset layout triggered');
          return;
        }

        // New room creation
        if (event.key.toLowerCase() === 'n') {
          event.preventDefault();
          handleCreateNewRoom();
          console.log('➕ New room creation triggered');
          return;
        }
      }

      // Floor navigation shortcuts
      if (event.key === 'Home') {
        event.preventDefault();
        setCurrentZLevel(0);
        console.log('🏠 Navigated to ground floor');
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        // Find the highest Z-level in current zone
        const maxZ = Math.max(...rooms.map(r => r.layoutZ ?? 0));
        setCurrentZLevel(maxZ);
        console.log(`🔼 Navigated to top floor (Z${maxZ})`);
        return;
      }

      if (event.key === 'PageUp' && !event.ctrlKey && !event.metaKey) {
        // Only if not in navigation mode (view mode uses PageUp for room navigation)
        if (viewMode === 'edit' || !selectedRoomId) {
          event.preventDefault();
          setCurrentZLevel(currentZLevel + 1);
          console.log(`⬆️ Moved to floor Z${currentZLevel + 1}`);
          return;
        }
      }

      if (event.key === 'PageDown' && !event.ctrlKey && !event.metaKey) {
        // Only if not in navigation mode (view mode uses PageDown for room navigation)
        if (viewMode === 'edit' || !selectedRoomId) {
          event.preventDefault();
          setCurrentZLevel(currentZLevel - 1);
          console.log(`⬇️ Moved to floor Z${currentZLevel - 1}`);
          return;
        }
      }

      // Room-specific shortcuts (require a selected room)
      if (!selectedRoomId) return;

      const room = rooms.find(r => r.id === selectedRoomId);
      if (!room) return;

      const currentZ = room.layoutZ ?? 0;

      // Delete room (only in edit mode with permissions)
      if (viewMode === 'edit' && canEditZone(zoneId)) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault();
          handleDeleteRoom(selectedRoomId);
          console.log(`🗑️ Delete room triggered for room ${selectedRoomId}`);
          return;
        }
      }

      // Handle room navigation in view mode (arrow keys without modifiers)
      if (
        viewMode === 'view' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        const directionMap: { [key: string]: string } = {
          ArrowUp: 'NORTH',
          ArrowDown: 'SOUTH',
          ArrowLeft: 'WEST',
          ArrowRight: 'EAST',
          PageUp: 'UP',
          PageDown: 'DOWN',
        };

        const direction = directionMap[event.key];
        if (direction) {
          event.preventDefault();

          // Find exit in that direction
          const exit = room.exits.find(e => e.direction === direction);
          if (exit && exit.toRoomId) {
            // Check if destination room exists with matching zone ID and room ID
            const targetZoneId = exit.toZoneId ?? room.zoneId;
            const destinationRoom = rooms.find(r => r.zoneId === targetZoneId && r.id === exit.toRoomId);
            if (destinationRoom) {
              console.log(
                `🧭 Navigating ${direction.toLowerCase()} to room ${exit.toRoomId}: "${destinationRoom.name}"`
              );
              setSelectedRoomId(exit.toRoomId);
              setEditedRoom({ ...destinationRoom });

              // Auto-switch to the destination room's floor so it's fully visible
              const roomFloor = destinationRoom.layoutZ ?? 0;
              setCurrentZLevel(roomFloor);
              console.log(`🏢 Auto-switched to floor Z${roomFloor} for navigation to room ${exit.toRoomId}`);

              // Update URL to include room parameter for refresh persistence
              if (zoneId) {
                const newUrl = `/dashboard/zones/editor?zone=${zoneId}&room=${exit.toRoomId}`;
                router.replace(newUrl, { scroll: false });
              }

              // Auto-focus the node in the viewport
              const targetNode = nodes.find(
                n => n.id === exit.toRoomId!.toString()
              );
              if (targetNode && reactFlowInstance) {
                reactFlowInstance.setCenter(
                  targetNode.position.x + 90, // Center of room node
                  targetNode.position.y + 60,
                  { zoom: 1.2, duration: 800 }
                );
              }
            } else {
              // Check if it's a cross-zone exit
              if (targetZoneId !== room.zoneId) {
                console.log(
                  `🌐 Navigating ${direction} to Zone ${targetZoneId}, Room ${exit.toRoomId} (cross-zone portal)`
                );
                // Navigate to the destination zone and room
                router.push(`/dashboard/zones/editor?zone=${targetZoneId}&room=${exit.toRoomId}`);
              } else {
                console.log(
                  `🚫 Cannot navigate ${direction.toLowerCase()}: destination room ${exit.toRoomId} not found`
                );
              }
            }
          } else {
            console.log(
              `🚫 No exit ${direction.toLowerCase()} from room ${selectedRoomId}`
            );
          }
        }
        return;
      }

      // Handle Z-level shortcuts for selected room (with Ctrl/Cmd modifier) - only in edit mode
      if ((event.ctrlKey || event.metaKey) && viewMode === 'edit' && canEditZone(zoneId)) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            handleUpdateZLevel(selectedRoomId, currentZ + 1);
            console.log(`🔼 Z-level increased to ${currentZ + 1} for room ${selectedRoomId}`);
            break;
          case 'ArrowDown':
            event.preventDefault();
            handleUpdateZLevel(selectedRoomId, currentZ - 1);
            console.log(`🔽 Z-level decreased to ${currentZ - 1} for room ${selectedRoomId}`);
            break;
          case '0':
            event.preventDefault();
            handleUpdateZLevel(selectedRoomId, 0); // Ground level
            console.log(`🏠 Z-level reset to ground level (0) for room ${selectedRoomId}`);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedRoomId,
    rooms,
    handleUpdateZLevel,
    viewMode,
    nodes,
    reactFlowInstance,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    undoHistory,
    undoIndex,
    canEditZone,
    zoneId,
    handleAutoLayout,
    handleResetLayout,
    handleCreateNewRoom,
    handleDeleteRoom,
    setViewMode,
    setCurrentZLevel,
    currentZLevel,
    setSelectedRoomId,
    setEditedRoom,
  ]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      try {
        const rawData = JSON.parse(event.dataTransfer.getData('application/json'));
        const type = rawData.type as 'mob' | 'object';
        const entity = rawData.entity as any;

        if (type === 'mob') {
          // Handle mob drop - place in nearest room
          const mobEntity: any = entity;
          console.log('Dropped mob:', mobEntity, 'at position:', position);
          const nearestRoom = findNearestRoom(position);
          if (nearestRoom && canEditZone(zoneId)) {
            // @ts-ignore - Entity type inference issue
            handleAddMobToRoom(nearestRoom.id, mobEntity);
          }
        } else if (type === 'object') {
          // Handle object drop - place in nearest room
          const objectEntity: any = entity;
          console.log('Dropped object:', objectEntity, 'at position:', position);
          const nearestRoom = findNearestRoom(position);
          if (nearestRoom && canEditZone(zoneId)) {
            // @ts-ignore - Entity type inference issue
            handleAddObjectToRoom(nearestRoom.id, objectEntity);
          }
        }
      } catch (error) {
        console.warn('Invalid drop data:', error);
      }
    },
    [reactFlowInstance, findNearestRoom, handleAddMobToRoom, handleAddObjectToRoom, canEditZone, zoneId]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const selectedRoom = useMemo(() => editedRoom || null, [editedRoom]);

  // Auto-layout helper functions
  const autoLayoutRooms = useCallback((rooms: Room[]) => {
    const positions: Record<number, { x: number; y: number; z?: number }> = {};
    const visited = new Set<number>();
    const queue: Array<{ roomId: number; x: number; y: number; z: number }> = [];

    // Start with the first room at origin
    const startRoom = rooms[0];
    if (startRoom) {
      queue.push({ roomId: startRoom.id, x: 0, y: 0, z: startRoom.layoutZ ?? 0 });

      // Direction mappings for layout
      const directionOffsets: Record<string, { x: number; y: number; z: number }> = {
        NORTH: { x: 0, y: -2, z: 0 },
        SOUTH: { x: 0, y: 2, z: 0 },
        EAST: { x: 2, y: 0, z: 0 },
        WEST: { x: -2, y: 0, z: 0 },
        NORTHEAST: { x: 2, y: -2, z: 0 },
        NORTHWEST: { x: -2, y: -2, z: 0 },
        SOUTHEAST: { x: 2, y: 2, z: 0 },
        SOUTHWEST: { x: -2, y: 2, z: 0 },
        UP: { x: 0, y: 0, z: 1 },
        DOWN: { x: 0, y: 0, z: -1 },
      };

      while (queue.length > 0) {
        const { roomId, x, y, z } = queue.shift()!;

        if (visited.has(roomId)) continue;
        visited.add(roomId);

        positions[roomId] = { x, y, z };

        // Find this room and its exits
        const room = rooms.find(r => r.id === roomId);
        if (room?.exits) {
          room.exits.forEach(exit => {
            if (exit.toRoomId && !visited.has(exit.toRoomId)) {
              const offset = directionOffsets[exit.direction] || { x: 1, y: 1, z: 0 };
              queue.push({
                roomId: exit.toRoomId,
                x: x + offset.x,
                y: y + offset.y,
                z: z + offset.z,
              });
            }
          });
        }
      }

      // Position any remaining unconnected rooms
      let gridX = 0;
      let gridY = 4; // Below the connected rooms
      const roomsPerRow = Math.ceil(Math.sqrt(rooms.length));

      rooms.forEach(room => {
        if (!positions[room.id]) {
          positions[room.id] = {
            x: gridX * 2,
            y: gridY * 2,
            z: room.layoutZ ?? 0,
          };
          gridX++;
          if (gridX >= roomsPerRow) {
            gridX = 0;
            gridY++;
          }
        }
      });
    }

    return positions;
  }, []);

  const detectOverlaps = useCallback((positions: Record<number, { x: number; y: number; z?: number }>) => {
    const overlaps: OverlapInfo[] = [];
    const positionMap = new Map<string, number[]>();

    // Group rooms by position (including Z-level - rooms on different floors aren't overlapping)
    Object.entries(positions).forEach(([roomIdStr, pos]) => {
      const roomId = parseInt(roomIdStr);
      const key = `${pos.x},${pos.y},${pos.z ?? 0}`; // Include Z-level in position key
      if (!positionMap.has(key)) {
        positionMap.set(key, []);
      }
      positionMap.get(key)!.push(roomId);
    });

    // Find overlaps
    positionMap.forEach((roomIds, posKey) => {
      if (roomIds.length > 1) {
        const [x, y] = posKey.split(',').map(Number);
        overlaps.push({
          roomIds,
          position: { x, y },
          count: roomIds.length,
        });
      }
    });

    return overlaps;
  }, []);

  const resolveOverlaps = useCallback((positions: Record<number, { x: number; y: number; z?: number }>) => {
    const resolved = { ...positions };
    const overlaps = detectOverlaps(positions);

    // Simple overlap resolution: spread overlapping rooms in a small grid
    overlaps.forEach(overlap => {
      const { roomIds, position } = overlap;
      roomIds.forEach((roomId, index) => {
        if (index > 0) { // Keep first room in original position
          const offsetX = (index % 2) === 0 ? -1 : 1;
          const offsetY = Math.floor(index / 2);
          resolved[roomId] = {
            ...resolved[roomId],
            x: position.x + offsetX,
            y: position.y + offsetY,
          };
        }
      });
    });

    return resolved;
  }, [detectOverlaps]);

  // Track drag start positions for undo
  const dragStartPositions = useRef<Record<string, { x: number; y: number }>>({});

  const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
    if (viewMode === 'edit') {
      // Store the original position before drag starts
      dragStartPositions.current[node.id] = { ...node.position };
    }
  }, [viewMode]);

  // Loading and error states
  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading zone editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='text-red-600 text-xl mb-2'>⚠️</div>
          <p className='text-red-600 font-medium'>Error loading zone</p>
          <p className='text-gray-600 text-sm mt-1'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Entity Palette - Only show for users with edit permissions */}
      {showEntityPalette && canEditZone(zoneId) && (
        <EntityPalette
          mobs={mobs}
          objects={objects}
          onMobDragStart={(mob) => {
            // Drag data is handled in the drag event handlers
          }}
          onObjectDragStart={(obj) => {
            // Drag data is handled in the drag event handlers
          }}
          zoneId={zoneId || 0}
        />
      )}

      {/* Main React Flow Area */}
      <div className='flex-1 relative'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMove={(event, viewport) => {
            const now = Date.now();
            const lastViewport = lastViewportRef.current;

            // Store mouse position for potential zoom-in centering
            if (event && event.type === 'wheel' && event.currentTarget) {
              try {
                const rect = event.currentTarget.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Convert to world coordinates
                const worldX = (-viewport.x + mouseX) / viewport.zoom;
                const worldY = (-viewport.y + mouseY) / viewport.zoom;

                // Store for use in zone transition - use a more reliable reference
                if (reactFlowInstance) {
                  (reactFlowInstance as any).lastMouseWorldPos = { x: worldX, y: worldY };
                }
              } catch (error) {
                console.warn('Could not capture mouse position for zoom centering:', error);
              }
            }

            // More aggressive early return for better performance
            if (lastViewport &&
              Math.abs((lastViewport.zoom || 1) - viewport.zoom) < 0.05 &&
              Math.abs((lastViewport.x || 0) - viewport.x) < 25 &&
              Math.abs((lastViewport.y || 0) - viewport.y) < 25) {
              return;
            }

            // Debounce expensive operations during transitions
            if (worldMapTransitionRef.current) {
              // Add timestamp to track how long transition has been active
              if (typeof worldMapTransitionRef.current === 'boolean') {
                worldMapTransitionRef.current = { active: true, startTime: now };
              }

              const transitionDuration = now - (worldMapTransitionRef.current as any).startTime;
              console.log(`🚫 Skipping zoom detection - transition in progress (${transitionDuration}ms)`);

              // Failsafe: Clear transition flag after 3 seconds to prevent permanent lock
              if (transitionDuration > 3000) {
                console.log(`⚠️ Transition flag stuck for >3s - force clearing`);
                worldMapTransitionRef.current = false;
                customZoneTransitionDone.current = false;
              } else {
                return;
              }
            }

            // Handle view mode detection for both world map and single zone
            // Skip automatic view mode detection during initial positioning to prevent unwanted world map transitions
            if (now - lastLODUpdate.current > LOD_THROTTLE_MS && hasPerformedInitialFit.current) {
              const newViewMode = detectViewMode(viewport.zoom, currentViewMode);
              console.log(`🔍 Zoom detection: zoom=${viewport.zoom.toFixed(3)}, currentMode=${currentViewMode}, newMode=${newViewMode}, transitionFlag=${worldMapTransitionRef.current}`);

              if (newViewMode !== currentViewMode) {
                console.log(`🔄 View mode change detected: ${currentViewMode} → ${newViewMode}`);

                // Debounce view mode changes to prevent rapid switching
                if (viewModeTransitionRef.current) {
                  clearTimeout(viewModeTransitionRef.current);
                  console.log(`⏱️ Cleared existing transition timeout`);
                }
                viewModeTransitionRef.current = setTimeout(() => {
                  console.log(`✅ Executing view mode change: ${currentViewMode} → ${newViewMode}`);
                  setCurrentViewMode(newViewMode);

                  // When transitioning from world-map to zone-overview, find and select the closest zone
                  console.log(`🔍 Checking zone transition conditions:`, {
                    currentViewMode,
                    newViewMode,
                    worldMapMode,
                    hasZoneMapData: !!zoneMapData,
                    hasReactFlowInstance: !!reactFlowInstance
                  });

                  if (currentViewMode === 'world-map' && newViewMode === 'zone-overview' && zoneMapData && reactFlowInstance) {
                    console.log(`🎯 Starting zone-overview transition from world map`);
                    // Set transition flag to prevent zoom feedback loop
                    worldMapTransitionRef.current = { active: true, startTime: Date.now() };
                    customZoneTransitionDone.current = true;

                    const currentViewport = reactFlowInstance.getViewport();

                    // Try to get the actual mouse/cursor position first
                    const mouseWorldPos = (reactFlowInstance as any).lastMouseWorldPos;
                    let detectionX, detectionY;

                    if (mouseWorldPos) {
                      // Use cursor position for more accurate zone detection
                      detectionX = mouseWorldPos.x;
                      detectionY = mouseWorldPos.y;
                      console.log(`🎯 Using cursor position for zone detection: (${detectionX.toFixed(1)}, ${detectionY.toFixed(1)})`);
                    } else {
                      // Fallback to viewport center if no cursor position available
                      detectionX = (-currentViewport.x + window.innerWidth / 2) / currentViewport.zoom;
                      detectionY = (-currentViewport.y + window.innerHeight / 2) / currentViewport.zoom;
                      console.log(`📍 Using viewport center for zone detection: (${detectionX.toFixed(1)}, ${detectionY.toFixed(1)})`);
                    }

                    // Find the zone that contains the detection point (instead of closest to center)
                    let selectedZone = null;
                    let closestZone = null;
                    let closestDistance = Infinity;

                    console.log(`🔍 Checking ${zoneMapData.zones.length} zones for detection point...`);

                    for (const zone of zoneMapData.zones) {
                      // Check if the detection point is actually INSIDE this zone's boundary
                      // Convert detection point to world map coordinates to match zone positioning
                      const worldMapNodes = generateEnhancedWorldMapNodes(zoneMapData, 0.5);
                      const zoneNode = worldMapNodes.find(node => node.id === `zone-boundary-${zone.id}`);

                      if (zoneNode) {
                        const zoneBounds = {
                          left: zoneNode.position.x,
                          right: zoneNode.position.x + (zoneNode.data?.width || 200),
                          top: zoneNode.position.y,
                          bottom: zoneNode.position.y + (zoneNode.data?.height || 120)
                        };

                        // Check if detection point is inside this zone's world map boundary
                        if (detectionX >= zoneBounds.left && detectionX <= zoneBounds.right &&
                          detectionY >= zoneBounds.top && detectionY <= zoneBounds.bottom) {
                          selectedZone = zone;
                          console.log(`✅ Found zone containing cursor: ${zone.id} (${zone.name})`);
                          break;
                        }
                      }

                      // Also calculate distance as fallback
                      const zoneCenterX = zoneNode ? (zoneNode.position.x + (zoneNode.data?.width || 200) / 2) :
                        (zone.minX + zone.maxX) / 2 * GRID_SCALE;
                      const zoneCenterY = zoneNode ? (zoneNode.position.y + (zoneNode.data?.height || 120) / 2) :
                        (zone.minY + zone.maxY) / 2 * GRID_SCALE;

                      const distance = Math.sqrt(
                        Math.pow(detectionX - zoneCenterX, 2) +
                        Math.pow(detectionY - zoneCenterY, 2)
                      );

                      if (distance < closestDistance) {
                        closestDistance = distance;
                        closestZone = zone;
                      }
                    }

                    // Use the zone that contains the cursor, or fallback to closest
                    const targetZone = selectedZone || closestZone;

                    // Select the detected zone and center viewport on it
                    if (targetZone) {
                      if (selectedZone) {
                        console.log(`🎯 Selected zone containing cursor: ${targetZone.id} (${targetZone.name})`);
                      } else {
                        console.log(`🏴 Using closest zone as fallback: ${targetZone.id} (${targetZone.name})`);
                      }
                      console.log(`🔄 Current URL zone: ${zoneId}, transitioning to zone: ${targetZone.id}`);

                      // If it's a different zone, navigate to it
                      if (targetZone.id !== zoneId) {
                        console.log(`🚀 Navigating to zone ${targetZone.id} (different from current ${zoneId})`);
                        router.push(`/dashboard/zones/editor?zone=${targetZone.id}`);
                        return; // Let the new page load handle the positioning
                      }

                      setSelectedZoneId(targetZone.id);

                      // Try to get the cursor position for more precise centering
                      const mouseWorldPos = (reactFlowInstance as any).lastMouseWorldPos;
                      let targetCenterX, targetCenterY;

                      if (mouseWorldPos && zoneMapData?.rooms) {
                        console.log(`🎯 Using cursor position for centering: (${mouseWorldPos.x.toFixed(1)}, ${mouseWorldPos.y.toFixed(1)})`);

                        // Find the room closest to the cursor position within the selected zone
                        const zoneRooms = zoneMapData.rooms.filter(room =>
                          room.zoneId === targetZone.id &&
                          room.layoutX !== null &&
                          room.layoutY !== null
                        );

                        if (zoneRooms.length > 0) {
                          let closestRoom = null;
                          let closestRoomDistance = Infinity;

                          for (const room of zoneRooms) {
                            const roomX = room.layoutX! * GRID_SCALE;
                            const roomY = room.layoutY! * GRID_SCALE;
                            const distance = Math.sqrt(
                              Math.pow(mouseWorldPos.x - roomX, 2) +
                              Math.pow(mouseWorldPos.y - roomY, 2)
                            );

                            if (distance < closestRoomDistance) {
                              closestRoomDistance = distance;
                              closestRoom = room;
                            }
                          }

                          if (closestRoom) {
                            targetCenterX = closestRoom.layoutX! * GRID_SCALE;
                            targetCenterY = closestRoom.layoutY! * GRID_SCALE;
                            console.log(`🎯 Centering on closest room: ${closestRoom.id} (${closestRoom.name || 'Unnamed'})`);
                            console.log(`   Room coordinates: layoutX=${closestRoom.layoutX}, layoutY=${closestRoom.layoutY}`);
                            console.log(`   Scaled coordinates: (${targetCenterX}, ${targetCenterY})`);
                            console.log(`   GRID_SCALE=${GRID_SCALE}`);
                          }
                        }
                      }

                      // Fallback to zone center if no cursor position or room found
                      if (!targetCenterX || !targetCenterY) {
                        targetCenterX = (targetZone.minX + targetZone.maxX) / 2 * GRID_SCALE;
                        targetCenterY = (targetZone.minY + targetZone.maxY) / 2 * GRID_SCALE;
                        console.log(`🎯 Using zone center fallback: (${targetCenterX}, ${targetCenterY})`);
                      }
                      const zoneWidth = (targetZone.maxX - targetZone.minX) * GRID_SCALE;
                      const zoneHeight = (targetZone.maxY - targetZone.minY) * GRID_SCALE;

                      // Calculate appropriate zoom to fit the zone with some padding
                      const padding = 100;
                      const viewportWidth = window.innerWidth;
                      const viewportHeight = window.innerHeight;
                      const zoomX = viewportWidth / (zoneWidth + padding * 2);
                      const zoomY = viewportHeight / (zoneHeight + padding * 2);
                      const targetZoom = Math.max(0.3, Math.min(zoomX, zoomY, 1.1)); // Ensure zoom stays above hysteresis threshold and cap at 1.1

                      console.log(`📐 Zone transition: center=(${targetCenterX}, ${targetCenterY}), targetZoom=${targetZoom.toFixed(3)}`);

                      // Set the viewport to center on the target (room or zone center) - try both approaches
                      console.log(`🔧 Attempting viewport centering with setViewport...`);

                      // Try setViewport first
                      reactFlowInstance.setViewport({
                        x: -targetCenterX * targetZoom + viewportWidth / 2,
                        y: -targetCenterY * targetZoom + viewportHeight / 2,
                        zoom: targetZoom
                      }, { duration: 300 });

                      // Backup approach: use setCenter after a short delay
                      setTimeout(() => {
                        console.log(`🔧 Backup: Using setCenter approach...`);
                        reactFlowInstance.setCenter(targetCenterX, targetCenterY, {
                          zoom: targetZoom,
                          duration: 100
                        });

                        // Debug and fix: center on actual rendered room positions
                        setTimeout(() => {
                          const currentNodes = reactFlowInstance.getNodes();
                          console.log(`🔍 Current nodes after centering: ${currentNodes.length}`);

                          if (currentNodes.length > 0) {
                            const roomNodes = currentNodes.filter(n => n.type === 'room');
                            console.log(`   Room nodes found: ${roomNodes.length}`);

                            if (roomNodes.length > 0) {
                              // Calculate the center of all room nodes
                              const roomPositions = roomNodes.map(node => node.position);
                              const minX = Math.min(...roomPositions.map(p => p.x));
                              const maxX = Math.max(...roomPositions.map(p => p.x));
                              const minY = Math.min(...roomPositions.map(p => p.y));
                              const maxY = Math.max(...roomPositions.map(p => p.y));

                              const actualRoomCenterX = (minX + maxX) / 2;
                              const actualRoomCenterY = (minY + maxY) / 2;

                              console.log(`🎯 Fixing center using actual room positions:`);
                              console.log(`   Room bounds: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`);
                              console.log(`   Calculated center: (${actualRoomCenterX}, ${actualRoomCenterY})`);

                              // Validate that the center point is reasonable before applying
                              const roomBoundsCheck = {
                                minX: minX - 500, // Use already calculated bounds with 500px padding
                                maxX: maxX + 500,
                                minY: minY - 500,
                                maxY: maxY + 500
                              };

                              // Clamp the center point to reasonable bounds
                              const clampedCenterX = Math.max(roomBoundsCheck.minX, Math.min(roomBoundsCheck.maxX, actualRoomCenterX));
                              const clampedCenterY = Math.max(roomBoundsCheck.minY, Math.min(roomBoundsCheck.maxY, actualRoomCenterY));

                              if (clampedCenterX !== actualRoomCenterX || clampedCenterY !== actualRoomCenterY) {
                                console.log(`⚠️ Clamped center from (${actualRoomCenterX}, ${actualRoomCenterY}) to (${clampedCenterX}, ${clampedCenterY})`);
                              }

                              // Use the validated center for final centering
                              reactFlowInstance.setCenter(clampedCenterX, clampedCenterY, {
                                zoom: targetZoom,
                                duration: 200
                              });

                              setTimeout(() => {
                                const finalViewport = reactFlowInstance.getViewport();
                                console.log(`   Final viewport: x=${finalViewport.x.toFixed(1)}, y=${finalViewport.y.toFixed(1)}, zoom=${finalViewport.zoom.toFixed(3)}`);
                              }, 250);
                            }
                          }
                        }, 200);
                      }, 350);

                      // Clear transition flag after animation completes - extended time to prevent interference
                      setTimeout(() => {
                        console.log(`🔓 Clearing transition flag after animation`);
                        worldMapTransitionRef.current = false;
                      }, 1500); // Extended to 1.5s to prevent competing viewport changes
                    } else {
                      console.log(`❌ No closest zone found`);
                      // Clear transition flag if no zone found
                      worldMapTransitionRef.current = false;
                    }
                  }

                  // When transitioning from zone-overview to world-map, center on the current zone
                  if (currentViewMode === 'zone-overview' && newViewMode === 'world-map' && zoneMapData && reactFlowInstance && zoneId) {
                    console.log(`🔙 Transitioning from zone ${zoneId} to world map - centering on zone position`);

                    // Set transition flag to prevent interference
                    worldMapTransitionRef.current = { active: true, startTime: Date.now() };

                    // Store the current zone ID for centering
                    sessionStorage.setItem('centerOnZoneInWorldMap', zoneId.toString());

                    setTimeout(() => {
                      if (reactFlowInstance && zoneMapData) {
                        // Find the zone node in the world map
                        const zoneWorldNodes = generateEnhancedWorldMapNodes(zoneMapData, 0.3); // Use 0.3 zoom for calculation
                        const currentZoneNode = zoneWorldNodes.find(node =>
                          node.id === `zone-boundary-${zoneId}`
                        );

                        if (currentZoneNode) {
                          console.log(`🎯 Centering world map on zone ${zoneId} at position:`, currentZoneNode.position);
                          // Center on the zone's position in world map with better zoom level
                          const targetZoom = 0.15; // Lower zoom for better context viewing
                          const zoneCenterX = currentZoneNode.position.x + (currentZoneNode.data?.width || 200) / 2;
                          const zoneCenterY = currentZoneNode.position.y + (currentZoneNode.data?.height || 120) / 2;

                          reactFlowInstance.setCenter(zoneCenterX, zoneCenterY, {
                            zoom: targetZoom,
                            duration: 500
                          });

                          // Clear the flag after centering is complete
                          setTimeout(() => {
                            worldMapTransitionRef.current = false;
                            sessionStorage.removeItem('centerOnZoneInWorldMap');
                          }, 600);
                        } else {
                          console.log(`⚠️ Could not find zone node for centering zone ${zoneId}`);
                          // Clear transition flag even if centering fails
                          worldMapTransitionRef.current = false;
                          sessionStorage.removeItem('centerOnZoneInWorldMap');
                        }
                      }
                    }, 500); // Increased delay to ensure world map nodes are generated first
                  }

                  viewModeTransitionRef.current = null;
                }, 100);
              }
              lastLODUpdate.current = now;
              lastViewportRef.current = { x: viewport.x, y: viewport.y, zoom: viewport.zoom };
            }

            // Handle world map LOD updates with improved throttling
            if (worldMapMode && zoneMapData && worldMapNodes.length > 0) {
              // Use already memoized world map nodes instead of generating new ones
              // This prevents expensive recalculations during zoom/pan
            }
          }}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.1, minZoom: 0.01, maxZoom: 2 }}
          snapToGrid={true}
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          minZoom={0.01}
          maxZoom={4}
          className={isDark ? 'bg-gray-900' : 'bg-gray-50'}
        >
          <Controls position='top-left' />
          <MiniMap
            position='top-right'
            nodeColor={node => {
              if (node.type === 'room') return getThemeColor('#374151', '#6b7280');
              if (node.type === 'mob') return getThemeColor('#dc2626', '#ef4444');
              if (node.type === 'object') return getThemeColor('#2563eb', '#3b82f6');
              if (node.type === 'zone') {
                // Color zones by climate
                const climate = node.data?.climate || 'NONE';
                const colors = {
                  TEMPERATE: '#4ade80',
                  DESERT: '#f59e0b',
                  ARID: '#f59e0b',
                  ARCTIC: '#06b6d4',
                  SUBARCTIC: '#0891b2',
                  SWAMP: '#84cc16',
                  TROPICAL: '#eab308',
                  SUBTROPICAL: '#facc15',
                  OCEANIC: '#3b82f6',
                  ALPINE: '#8b5cf6',
                  SEMIARID: '#f97316',
                  NONE: '#6b7280',
                };
                return colors[climate as keyof typeof colors] || '#6b7280';
              }
              return getThemeColor('#6b7280', '#9ca3af');
            }}
            onNodeClick={(event, node) => {
              // Enhanced minimap navigation with intelligent zoom
              if (reactFlowInstance) {
                const currentZoom = reactFlowInstance.getZoom();
                let targetZoom = currentZoom;

                // Intelligent zoom based on node type and current zoom
                if (node.type === 'zone' && currentZoom < 0.8) {
                  targetZoom = 0.8; // Zoom in to see zone better
                } else if (node.type === 'room' && currentZoom < 1.5) {
                  targetZoom = 1.5; // Zoom in to see room details
                } else if (node.type === 'worldRoom' && currentZoom < 1.0) {
                  targetZoom = 1.0; // Moderate zoom for world rooms
                } else {
                  targetZoom = Math.max(currentZoom, 1.2); // Minimum zoom
                }

                reactFlowInstance.setCenter(
                  node.position.x + (node.width || 90) / 2,
                  node.position.y + (node.height || 60) / 2,
                  { zoom: targetZoom, duration: 800 }
                );

                // If clicking on a zone in world map, also trigger zone selection
                if (node.type === 'zone' && node.data?.zoneId) {
                  setTimeout(() => {
                    handleZoneSelect(node.data.zoneId);
                  }, 200); // Small delay after navigation
                }
              }
            }}
            onClick={(event, position) => {
              // Handle clicking on empty areas of the minimap to navigate
              if (reactFlowInstance && position) {
                const currentZoom = reactFlowInstance.getZoom();
                reactFlowInstance.setCenter(position.x, position.y, {
                  zoom: currentZoom,
                  duration: 600
                });
              }
            }}
            maskColor={getThemeColor('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')}
            style={{
              backgroundColor: getThemeColor('#f9fafb', '#1f2937'),
              border: `1px solid ${getThemeColor('#e5e7eb', '#374151')}`
            }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            color={getThemeColor('#d1d5db', '#4b5563')}
            gap={GRID_SIZE}
            size={1.5}
          />

          {/* Top Panel */}
          <Panel
            position='top-center'
            className={`shadow-lg rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {worldMapMode || currentViewMode === 'world-map'
                        ? 'World Map View'
                        : `${zone?.name} (Zone ${zoneId})`}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {worldMapMode || currentViewMode === 'world-map'
                        ? `View Mode: ${currentViewMode} • ${allZones.length} zones, ${rooms.length} rooms total`
                        : `Climate: ${zone?.climate} • ${rooms.length} rooms • ${mobs.length} mobs • ${objects.length} objects`}
                    </p>
                  </div>

                  {/* Zone Selector - show always for easy zone switching */}
                  <div className="ml-auto">
                    <ZoneSelector
                      selectedZone={zoneId}
                      onZoneChange={(newZoneId) => {
                        if (newZoneId && newZoneId !== zoneId) {
                          router.push(`/dashboard/zones/editor?zone=${newZoneId}`);
                        }
                      }}
                      className="min-w-[200px]"
                    />
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {/* Role/Permission Indicator */}
                  {!canEditZone(zoneId) && (
                    <div className='px-3 py-1.5 text-sm text-amber-700 bg-amber-100 rounded-lg'>
                      👁️ Read-Only Access
                    </div>
                  )}


                  {/* View Mode Toggle */}
                  <div className={`flex p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {[
                      ...(canEditZone(zoneId)
                        ? [{ key: 'edit', label: 'Edit', icon: '✏️' }]
                        : []),
                      { key: 'view', label: 'View', icon: '👁️' },
                    ].map(mode => (
                      <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key as any)}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === mode.key
                          ? isDark ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-700 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <span className='mr-1'>{mode.icon}</span>
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Floor Navigation Controls */}
                  <div className={`flex items-center gap-2 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Floor:</span>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={() => setCurrentZLevel(currentZLevel + 1)}
                        className='px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors'
                        title='View upper floor'
                      >
                        ⬆️
                      </button>
                      <span className={`px-2 py-1 text-sm font-medium rounded border min-w-[3rem] text-center ${isDark ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'}`}>
                        {currentZLevel === 0 ? 'Ground' : `${currentZLevel > 0 ? '+' : ''}${currentZLevel}`}
                      </span>
                      <button
                        onClick={() => setCurrentZLevel(currentZLevel - 1)}
                        className='px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors'
                        title='View lower floor'
                      >
                        ⬇️
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentZLevel(0)}
                      className='px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors'
                      title='Go to ground floor'
                    >
                      🏠
                    </button>
                  </div>

                  {/* World Map Toggle */}
                  {!worldMapMode && currentViewMode !== 'world-map' && (
                    <button
                      onClick={transitionToWorldMap}
                      className='px-3 py-1.5 text-sm font-medium rounded transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200'
                      title='View world map of all zones'
                    >
                      🌍 World Map
                    </button>
                  )}

                  {/* Back from World Map */}
                  {(worldMapMode || currentViewMode === 'world-map') && (
                    <button
                      onClick={() => {
                        // Restore previous viewport if available
                        const savedViewport = sessionStorage.getItem('lastWorldMapViewport');
                        if (savedViewport && reactFlowInstance) {
                          try {
                            const viewport = JSON.parse(savedViewport);
                            reactFlowInstance.setViewport(viewport, { duration: 500 });
                          } catch (e) {
                            // Fallback to fit view
                            reactFlowInstance.fitView({ padding: 0.2, duration: 500, minZoom: 0.15 });
                          }
                        } else if (reactFlowInstance) {
                          reactFlowInstance.fitView({ padding: 0.2, duration: 500, minZoom: 0.15 });
                        }
                        setCurrentViewMode('room-detail');
                        sessionStorage.removeItem('lastWorldMapViewport');
                      }}
                      className='px-3 py-1.5 text-sm font-medium rounded transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200'
                      title='Return to zone view'
                    >
                      ← Back to Zone
                    </button>
                  )}

                  {/* Toggle Layout Tools - Only show for users with edit permissions */}
                  {canEditZone(zoneId) && viewMode === 'edit' && (
                    <button
                      onClick={() => setShowLayoutTools(!showLayoutTools)}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${showLayoutTools
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                        }`}
                      title='Toggle layout tools'
                    >
                      🔧 Layout
                    </button>
                  )}

                  {/* Toggle Entity Palette - Only show for users with edit permissions */}
                  {canEditZone(zoneId) && (
                    <button
                      onClick={() => setShowEntityPalette(!showEntityPalette)}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${showEntityPalette
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      🎨 Palette
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          {/* Layout Tools Panel - Toggleable panel below main zone info (only in edit mode) */}
          {viewMode === 'edit' && canEditZone(zoneId) && showLayoutTools && (
            <Panel
              position='top-center'
              className={`shadow-lg rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{ marginTop: '120px' }} // Position below the main panel
            >
              <div className='px-6 py-3'>
                <div className='flex items-center justify-between'>
                  <h3 className={`text-md font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Layout Tools</h3>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                      className={`px-2 py-1 text-sm rounded transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                      title='Show keyboard shortcuts'
                    >
                      ⌨️ Help
                    </button>
                    <button
                      onClick={() => setShowLayoutTools(false)}
                      className={`px-2 py-1 text-sm rounded transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                      title='Close Layout Tools panel'
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className='mt-3 flex flex-wrap items-center gap-4'>
                  {/* Auto Layout and Reset */}
                  <div className='flex items-center gap-2'>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Layout:</span>
                    <button
                      onClick={handleAutoLayout}
                      className='px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                      title='Automatically arrange rooms following exits from the first room (Ctrl+A)'
                    >
                      🔄 Auto Layout
                    </button>
                    <button
                      onClick={handleResetLayout}
                      className='px-3 py-1.5 text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
                      title='Reset all rooms to their original positions from when the zone was first loaded (Ctrl+R)'
                    >
                      🔄 Reset
                    </button>
                  </div>

                  {/* Room Actions */}
                  <div className='flex items-center gap-2'>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rooms:</span>
                    <button
                      onClick={() => handleCreateNewRoom()}
                      className='px-3 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
                      title='Create a new room (N key)'
                    >
                      ➕ New Room
                    </button>
                    {selectedRoomId && (
                      <button
                        onClick={() => handleDeleteRoom(selectedRoomId)}
                        className='px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors'
                        title='Delete selected room (Delete key)'
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>

                  {/* Undo/Redo Controls */}
                  <div className='flex items-center gap-2'>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>History:</span>
                    <div className={`flex items-center gap-1 border rounded-lg p-1 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                      <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`px-2 py-1 text-sm rounded transition-colors ${canUndo
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        title={`Undo last action (Ctrl+Z)${canUndo ? ` - ${undoHistory.length - undoIndex} actions available` : ''}`}
                      >
                        ↺ Undo
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`px-2 py-1 text-sm rounded transition-colors ${canRedo
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        title='Redo last undone action (Ctrl+Shift+Z or Ctrl+Y)'
                      >
                        ↻ Redo
                      </button>
                    </div>
                  </div>

                  {/* Selected Room Controls */}
                  {selectedRoomId && (
                    <div className='flex items-center gap-2'>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Selected Room:</span>
                      <div className='flex items-center gap-1'>
                        <button
                          onClick={() => {
                            const room = rooms.find(r => r.id === selectedRoomId);
                            if (room) {
                              const newZ = (room.layoutZ ?? 0) + 1;
                              handleUpdateZLevel(selectedRoomId, newZ);
                              setCurrentZLevel(newZ); // Follow the room to its new floor
                            }
                          }}
                          className='px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors'
                          title='Move selected room up one floor'
                        >
                          ⬆️ Move Up
                        </button>
                        <button
                          onClick={() => {
                            const room = rooms.find(r => r.id === selectedRoomId);
                            if (room) {
                              const newZ = (room.layoutZ ?? 0) - 1;
                              handleUpdateZLevel(selectedRoomId, newZ);
                              setCurrentZLevel(newZ); // Follow the room to its new floor
                            }
                          }}
                          className='px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors'
                          title='Move selected room down one floor'
                        >
                          ⬇️ Move Down
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Issues/Overlaps */}
                  {overlaps.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Issues:</span>
                      <button
                        onClick={() => setShowOverlapInfo(!showOverlapInfo)}
                        className='px-3 py-1.5 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors'
                        title={`${overlaps.length} room overlaps detected - click to ${showOverlapInfo ? 'hide' : 'show'} details`}
                      >
                        ⚠️ {overlaps.length} Overlaps
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          )}

          {/* Keyboard Shortcuts Help Panel */}
          {showKeyboardHelp && (
            <div className={`absolute top-48 left-4 border rounded-lg shadow-lg p-4 max-w-lg z-20 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className='flex items-center justify-between mb-3'>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>⌨️ Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
                >
                  ✕
                </button>
              </div>

              <div className='space-y-4 text-sm'>
                {/* Mode & Navigation */}
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Mode & Navigation</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className='flex justify-between'><span>Switch to Edit mode:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>E</kbd></div>
                    <div className='flex justify-between'><span>Switch to View mode:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>V</kbd></div>
                    <div className='flex justify-between'><span>Navigate room (View mode):</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Arrow Keys</kbd></div>
                    <div className='flex justify-between'><span>Navigate Up/Down:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Page Up/Down</kbd></div>
                  </div>
                </div>

                {/* Floor Navigation */}
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Floor Navigation</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className='flex justify-between'><span>Ground floor:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Home</kbd></div>
                    <div className='flex justify-between'><span>Top floor:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>End</kbd></div>
                    <div className='flex justify-between'><span>Floor up/down:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Page Up/Down</kbd></div>
                  </div>
                </div>

                {/* Room Editing */}
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Room Editing (Edit Mode)</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className='flex justify-between'><span>New room:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>N</kbd></div>
                    <div className='flex justify-between'><span>Delete selected room:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Delete</kbd></div>
                    <div className='flex justify-between'><span>Move room Z-level:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + ↑/↓</kbd></div>
                    <div className='flex justify-between'><span>Room to ground level:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + 0</kbd></div>
                  </div>
                </div>

                {/* Layout Actions */}
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Layout Actions (Edit Mode)</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className='flex justify-between'><span>Auto layout:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + A</kbd></div>
                    <div className='flex justify-between'><span>Reset layout:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + R</kbd></div>
                    <div className='flex justify-between'><span>Undo:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + Z</kbd></div>
                    <div className='flex justify-between'><span>Redo:</span><kbd className={`px-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + Y</kbd></div>
                  </div>
                </div>

                <div className={`text-xs mt-4 pt-3 border-t ${isDark ? 'text-gray-500 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                  💡 Tip: Most shortcuts work only when not typing in text fields
                </div>
              </div>
            </div>
          )}

          {/* Overlap Info Panel */}
          {showOverlapInfo && overlaps.length > 0 && (
            <div className={`absolute top-48 right-4 border rounded-lg shadow-lg p-4 max-w-md z-10 ${isDark ? 'bg-gray-800 border-orange-700' : 'bg-white border-orange-200'}`}>
              <div className='flex items-center justify-between mb-3'>
                <h3 className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-800'}`}>Room Overlaps Detected</h3>
                <button
                  onClick={() => setShowOverlapInfo(false)}
                  className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
                >
                  ✕
                </button>
              </div>
              <div className='space-y-2'>
                {overlaps.map((overlap, index) => (
                  <div key={index} className={`p-2 rounded border-l-4 ${isDark ? 'bg-orange-900/30 border-orange-600' : 'bg-orange-50 border-orange-400'}`}>
                    <div className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-800'}`}>
                      Position ({overlap.position.x}, {overlap.position.y})
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
                      {overlap.count} rooms: {overlap.roomIds.map(id => {
                        const room = rooms.find(r => r.id === id);
                        return room ? `#${id} ${room.name}` : `#${id}`;
                      }).join(', ')}
                    </div>
                    <div className='mt-2 flex gap-2'>
                      {overlap.roomIds.map(roomId => (
                        <button
                          key={roomId}
                          onClick={() => {
                            setSelectedRoomId(roomId);
                            // Focus on the room in the viewport
                            const roomNode = nodes.find(n => n.id === roomId.toString());
                            if (roomNode && reactFlowInstance) {
                              reactFlowInstance.setCenter(roomNode.position.x + 90, roomNode.position.y + 60, { zoom: 1.2 });
                            }
                          }}
                          className='px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors'
                        >
                          Select #{roomId}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-3 text-xs text-orange-600'>
                💡 Tip: Use the Auto Layout button again to try resolving overlaps automatically, or manually drag rooms to new positions.
              </div>
            </div>
          )}

          {/* Canvas-based rendering overlay for ultra-dense views */}
          {useCanvasRendering && canvasClusters.length > 0 && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
              <WorldMapCanvas
                clusters={canvasClusters}
                zoom={reactFlowInstance?.getZoom() || 0.1}
                onRoomClick={handleRoomSelect}
                className="pointer-events-auto"
              />
            </div>
          )}
        </ReactFlow>
      </div>

      {/* Zone Overview minimap removed - redundant since minimap already exists in top right */}

      {/* Property Panel */}
      {selectedRoom && (
        <PropertyPanel
          room={selectedRoom}
          allRooms={rooms}
          onRoomChange={handleRoomChange}
          onSaveRoom={handleSaveRoom}
          onCreateExit={handleCreateExit}
          onDeleteExit={handleDeleteExit}
          onUpdateExit={handleUpdateExit}
          onSelectRoom={handleSelectRoom}
          onNavigateToZone={handleNavigateToZone}
          onUpdateZLevel={handleUpdateZLevel}
          onRemoveMob={handleRemoveMob}
          onRemoveObject={handleRemoveObject}
          saving={saving}
          managingExits={managingExits}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

// Mock data generators removed - now using real API data

// Wrapper component with ReactFlowProvider
export const EnhancedZoneEditor: React.FC<EnhancedZoneEditorProps> = props => {
  return (
    <ReactFlowProvider>
      <EnhancedZoneEditorFlow {...props} />
    </ReactFlowProvider>
  );
};
