'use client';

import { isValidRoomId, isValidZoneId } from '@/lib/room-utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Node, ReactFlowInstance } from 'reactflow';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  gridToPixels,
  gridToPixelsY,
  pixelsToGrid,
  pixelsToGridY,
  snapToGrid,
} from './editor-constants';
import { useAutoLayout } from './hooks/useAutoLayout';
import { useUndoRedo } from './hooks/useUndoRedo';
import { PortalNode } from './PortalNode';
import { PropertyPanel } from './PropertyPanel';
import { RoomNode } from './RoomNode';

interface RoomExit {
  id: string;
  direction: string;
  toZoneId: number | null;
  toRoomId: number | null;
  description?: string | null;
  flags?: string[];
  keywords?: string[];
  key?: string | null;
}

interface Room {
  id: number;
  zoneId: number;
  name: string;
  sector: string;
  roomDescription?: string | null;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
  exits?: RoomExit[];
  mobs?: {
    id: number;
    name: string;
    level?: number | null;
    description?: string | null;
  }[];
  objects?: { id: number; name: string; description?: string | null }[];
}

// Mirror of PropertyPanel's Room shape (not exported there) for structural typing
interface PropertyPanelRoomExit {
  id: string;
  direction: string;
  toZoneId?: number | null;
  toRoomId?: number | null;
  description?: string;
  keywords?: string[];
  key?: string;
  flags?: string[];
}
interface PropertyPanelRoom {
  id: number;
  name: string;
  roomDescription: string;
  sector: string;
  zoneId: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: PropertyPanelRoomExit[];
  mobs?: {
    id: number;
    name: string;
    level: number;
    race?: string;
    mobClass?: string;
    zoneId?: number;
  }[];
  objects?: {
    id: number;
    name: string;
    type: string;
    keywords?: string[];
    zoneId?: number;
  }[];
  shops?: {
    id: number;
    buyProfit: number;
    sellProfit: number;
    keeperId: number;
    zoneId?: number;
  }[];
}

interface ZoneEditorOrchestratorProps {
  zoneId?: number | null | undefined; // allow undefined under exactOptionalPropertyTypes
  initialRoomId?: number | null | undefined;
  worldMapMode?: boolean; // retained for pages but not implemented here yet
}

// Minimal orchestrator: rooms display + selection + drag persistence + basic undo + optional world map zones view
const ZoneEditorOrchestratorFlow: React.FC<ZoneEditorOrchestratorProps> = ({
  zoneId,
  initialRoomId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  // Track active zone separately from prop to enable cross-zone portal navigation
  const [activeZoneId, setActiveZoneId] = useState<number | null>(
    zoneId ?? null
  );
  // Current Z-level being viewed (floor 0 is ground level)
  const [currentZLevel, setCurrentZLevel] = useState<number>(0);
  // Track which room is active in each overlap group (keyed by position)
  const [activeOverlapRooms, setActiveOverlapRooms] = useState<
    Record<string, number>
  >({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowRef = useRef<HTMLDivElement | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const dragOriginRef = useRef<Record<string, { x: number; y: number }>>({});
  const isDraggingRef = useRef<boolean>(false);
  const hasInitialZoomedRef = useRef<boolean>(false);
  const lastSyncedUrlRef = useRef<string>('');
  const previousZoneIdRef = useRef<number | null>(activeZoneId);
  // Routing helpers for URL param sync
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize from URL on mount only
  // After mount, state drives URL (not the other way around)
  useEffect(() => {
    try {
      const zoneParam = searchParams.get('zone_id');
      const roomParam = searchParams.get('room_id');

      if (zoneParam) {
        const z = parseInt(zoneParam, 10);
        if (!isNaN(z)) {
          setActiveZoneId(z);
        }
      }
      if (roomParam) {
        const r = parseInt(roomParam, 10);
        if (!isNaN(r)) {
          setSelectedRoomId(r);
        }
      }
    } catch {
      /* ignore */
    }
    // Only run on mount - deliberately empty deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to URL param changes for cross-zone portal navigation
  // Note: Only searchParams in dependencies - we read activeZoneId/selectedRoomId but don't
  // want to trigger on their changes (would cause circular updates when keyboard nav sets state)
  useEffect(() => {
    const currentUrl = searchParams.toString();

    // Skip if this is the same URL we just synced (prevent circular updates)
    if (currentUrl === lastSyncedUrlRef.current) {
      return;
    }

    const zoneParam = searchParams.get('zone_id');
    const roomParam = searchParams.get('room_id');

    const newZone = zoneParam ? parseInt(zoneParam, 10) : null;
    const newRoom = roomParam ? parseInt(roomParam, 10) : null;

    // Read current state values directly for comparison (but don't add to dependencies)
    const currentZone = activeZoneId;
    const currentRoom = selectedRoomId;
    const zoneChanged =
      newZone != null && !isNaN(newZone) && newZone !== currentZone;

    if (zoneChanged) {
      setActiveZoneId(newZone!);
      // When zone changes, always update room too (even if room ID is same)
      // because room IDs are scoped to zones
      if (newRoom != null && !isNaN(newRoom)) {
        setSelectedRoomId(newRoom);
      }
    } else if (newRoom != null && !isNaN(newRoom) && newRoom !== currentRoom) {
      // Only room changed (within same zone)
      setSelectedRoomId(newRoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only run when URL changes, not when state changes

  // Basic view mode handling: 'zone' or 'world-map'
  const [viewMode, setViewMode] = useState<'zone' | 'world-map'>('zone');
  const [worldZones, setWorldZones] = useState<
    { id: number; name: string; climate: string }[]
  >([]);
  const [managingExits, setManagingExits] = useState(false);
  // Panel sizing/collapse scaffold
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(384);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const resizingRef = useRef<{
    side: 'left' | 'right' | null;
    startX: number;
    startWidth: number;
  }>({
    side: null,
    startX: 0,
    startWidth: 0,
  });

  // Local authenticated fetch stub (replace with real implementation if available)
  const authenticatedFetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      // Prefer configurable base URL; fall back to localhost
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
      // Attempt CSRF token discovery from cookie (common names)
      let csrfToken: string | undefined;
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(
          /(?:^|; )(_?csrf|XSRF-TOKEN)=([^;]+)/i
        );
        if (match) csrfToken = decodeURIComponent(match[2] ?? '');
      }
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (csrfToken) {
        // Support common header spellings; server can accept one
        defaultHeaders['x-csrf-token'] = csrfToken;
        defaultHeaders['X-XSRF-TOKEN'] = csrfToken;
      }
      const headersInit = init?.headers;
      const mergedHeaders = {
        ...defaultHeaders,
        ...(headersInit && !(headersInit instanceof Headers)
          ? (headersInit as Record<string, string>)
          : {}),
      };
      const response: Response = await fetch(fullUrl, {
        credentials: 'include',
        mode: 'cors',
        ...init,
        headers: mergedHeaders,
      });
      return response;
    },
    []
  );

  // Fetch zone rooms (full data) when in zone mode using activeZoneId
  useEffect(() => {
    if (viewMode !== 'zone') return;
    let cancelled = false;
    // Reset initial zoom flag when zone changes
    hasInitialZoomedRef.current = false;
    const fetchRooms = async () => {
      if (!isValidZoneId(activeZoneId)) return;
      setLoading(true);
      setError(null);
      try {
        const response: Response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `query GetRooms($zoneId: Int!, $lightweight: Boolean){\n              roomsByZone(zoneId: $zoneId, lightweight: $lightweight){\n                id zoneId name description roomDescription sector layoutX layoutY layoutZ \n                exits{ id direction toZoneId toRoomId description keywords key flags }\n                mobs{ id name level roomDescription }\n                objects{ id name roomDescription }\n                shops{ id buyProfit sellProfit keeperId }\n              }\n            }`,
            variables: { zoneId: activeZoneId, lightweight: false },
          }),
        });
        const data = await response.json();
        if (response.ok && !data.errors) {
          type RawExit = {
            id?: string | number;
            direction: string;
            toZoneId?: number | null;
            toRoomId?: number | null;
            description?: string | null;
            flags?: string[] | null;
            keywords?: string[] | null;
            key?: string | null;
          };
          type RawMob = {
            id: number;
            name: string;
            level?: number | null;
            roomDescription?: string | null;
          };
          type RawObject = {
            id: number;
            name: string;
            roomDescription?: string | null;
          };
          type RawShop = {
            id: number;
            buyProfit: number;
            sellProfit: number;
            keeperId: number;
          };
          type RawRoom = {
            id: number;
            zoneId: number;
            name: string;
            description?: string | null;
            roomDescription?: string | null;
            sector?: string | null;
            layoutX: number | null;
            layoutY: number | null;
            layoutZ: number | null;
            exits?: RawExit[] | null;
            mobs?: RawMob[] | null;
            objects?: RawObject[] | null;
            shops?: RawShop[] | null;
          };
          const fetched: Room[] = (data.data.roomsByZone || []).map(
            (r: RawRoom) => ({
              id: r.id,
              zoneId: r.zoneId,
              name: r.name,
              sector: r.sector || 'UNSPECIFIED',
              roomDescription: r.roomDescription ?? r.description ?? null,
              layoutX: r.layoutX,
              layoutY: r.layoutY,
              layoutZ: r.layoutZ,
              exits: (r.exits || []).map((e: RawExit) => ({
                id: String(e.id ?? `${r.id}-${e.direction}`),
                direction: e.direction,
                toZoneId: e.toZoneId ?? null,
                toRoomId: e.toRoomId ?? null,
                description: e.description ?? null,
                flags: e.flags ?? undefined,
                keywords: e.keywords ?? undefined,
                key: e.key ?? null,
              })),
              mobs: (r.mobs || []).map(m => ({
                id: m.id,
                name: m.name,
                level: m.level ?? null,
                description: m.roomDescription ?? null,
              })),
              objects: (r.objects || []).map(o => ({
                id: o.id,
                name: o.name,
                description: o.roomDescription ?? null,
              })),
            })
          );
          if (!cancelled) setRooms(fetched);
        } else {
          if (!cancelled)
            setError(data.errors?.[0]?.message || 'Failed to load rooms');
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRooms();
    return () => {
      cancelled = true;
    };
  }, [activeZoneId, viewMode, authenticatedFetch]);

  // Fetch world zones when in world-map mode
  useEffect(() => {
    if (viewMode !== 'world-map') return;
    let cancelled = false;
    const fetchZones = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: Response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `query GetZones { zones { id name climate } }`,
          }),
        });
        const data = await response.json();
        if (response.ok && !data.errors) {
          if (!cancelled) setWorldZones(data.data.zones || []);
        } else {
          if (!cancelled)
            setError(data.errors?.[0]?.message || 'Failed to load zones');
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchZones();
    return () => {
      cancelled = true;
    };
  }, [viewMode, authenticatedFetch]);

  // Reset zoom flag when zone changes to allow initial zoom on new zone
  useEffect(() => {
    if (previousZoneIdRef.current !== activeZoneId) {
      previousZoneIdRef.current = activeZoneId;
      hasInitialZoomedRef.current = false;
    }
  }, [activeZoneId]);

  // Initialize selection from URL param once rooms load
  useEffect(() => {
    if (rooms.length === 0) return;
    if (initialRoomId !== null && initialRoomId !== undefined) {
      const match = rooms.find(r => r.id === initialRoomId);
      if (match) setSelectedRoomId(initialRoomId);
    }
  }, [rooms, initialRoomId]);

  // Fallback: auto select first room if none selected
  useEffect(() => {
    if (viewMode !== 'zone') return;
    // If a room_id is present in URL, do not override it
    const hasRoomParam = !!searchParams.get('room_id');
    if (rooms.length > 0 && selectedRoomId === null && !hasRoomParam) {
      const first = rooms[0];
      if (first) setSelectedRoomId(first.id);
    }
  }, [rooms, selectedRoomId, viewMode, searchParams]);

  // Ensure selectedRoomId points to a loaded room; if not, reconcile with URL param or fallback to first
  useEffect(() => {
    if (viewMode !== 'zone') return;
    if (rooms.length === 0) return;
    const currentExists =
      selectedRoomId != null && rooms.some(r => r.id === selectedRoomId);
    if (currentExists) return;
    // Try URL param first
    const param = searchParams.get('room_id');
    if (param) {
      const parsed = parseInt(param, 10);
      if (!isNaN(parsed)) {
        const match = rooms.find(r => r.id === parsed);
        if (match) {
          setSelectedRoomId(match.id);
          return;
        }
      }
    }
    // Fallback to first room (rooms.length > 0 ensured above)
    const firstRoom = rooms[0];
    if (firstRoom) setSelectedRoomId(firstRoom.id);
  }, [rooms, selectedRoomId, viewMode, searchParams]);

  // Keep URL params in sync with current selection
  // State is source of truth, URL follows state (one-way data flow)
  // Note: activeZoneId is managed independently from zoneId prop to support cross-zone navigation
  useEffect(() => {
    if (selectedRoomId == null) return;
    try {
      const params = new URLSearchParams();
      params.set('zone_id', String(activeZoneId ?? ''));
      params.set('room_id', String(selectedRoomId));
      const newUrl = params.toString();

      // Store the URL we're about to sync so the listener can ignore it
      lastSyncedUrlRef.current = newUrl;

      router.replace(`${pathname}?${newUrl}`, { scroll: false });
    } catch {
      /* silent */
    }
  }, [selectedRoomId, activeZoneId, router, pathname]);

  // Create a stable dependency key that changes only when room structure changes (not positions)
  // This prevents node regeneration when dragging
  const roomsStructureKey = useMemo(() => {
    return rooms
      .map(r => `${r.id}:${r.name}:${r.zoneId}:${r.exits?.length ?? 0}`)
      .join('|');
  }, [rooms]);

  // Generate React Flow nodes when data changes (with overlap + portal nodes)
  // IMPORTANT: Use useMemo to avoid regenerating nodes unnecessarily
  // Only regenerate when room structure changes (add/remove/data), not when positions change
  const generatedNodes = useMemo(() => {
    if (viewMode === 'zone') {
      const overlapGroups = new Map<string, Room[]>();
      rooms.forEach(r => {
        const key = `${r.layoutX ?? 0}:${r.layoutY ?? 0}:${r.layoutZ ?? 0}`;
        const list = overlapGroups.get(key) || [];
        list.push(r);
        overlapGroups.set(key, list);
      });
      const roomNodes = rooms.flatMap(room => {
        const baseX = gridToPixels(room.layoutX ?? 0);
        const baseY = gridToPixelsY(room.layoutY ?? 0);
        const roomZ = room.layoutZ ?? 0;
        const floorDifference = roomZ - currentZLevel;
        const isCurrentFloor = floorDifference === 0;

        // Z-level diagonal offset for different floors
        let offsetX = 0;
        let offsetY = 0;
        let opacity = 1;
        let zIndex = 100;

        if (!isCurrentFloor) {
          if (floorDifference > 0) {
            // Upper floors - northwest (up-left) diagonal offset
            opacity = Math.max(0.5, 1 - floorDifference * 0.15);
            offsetX = -floorDifference * 18; // Move up-left diagonally
            offsetY = -floorDifference * 18;
            zIndex = 100 - floorDifference; // Higher floors appear behind
          } else {
            // Lower floors - southeast (down-right) diagonal offset
            opacity = Math.max(0.5, 1 - Math.abs(floorDifference) * 0.15);
            offsetX = Math.abs(floorDifference) * 18; // Move down-right diagonally
            offsetY = Math.abs(floorDifference) * 18;
            zIndex = 100 - Math.abs(floorDifference); // Lower floors appear behind
          }
        }

        const x = baseX + offsetX;
        const y = baseY + offsetY;

        const key = `${room.layoutX ?? 0}:${room.layoutY ?? 0}:${room.layoutZ ?? 0}`;
        const group = overlapGroups.get(key) || [];
        const isOverlapping = group.length > 1;
        const overlapIndex = isOverlapping
          ? group.findIndex(g => g.id === room.id)
          : 0;

        // Calculate active overlap index for this room
        let activeOverlapIndex = overlapIndex;
        if (isOverlapping) {
          const overlappedRoomIds = group.map(g => g.id);
          const positionKey = `overlapped-${[...overlappedRoomIds].sort((a, b) => a - b).join('-')}`;
          const activeRoomId = activeOverlapRooms[positionKey];
          if (activeRoomId !== undefined) {
            const activeIdx = overlappedRoomIds.indexOf(activeRoomId);
            if (activeIdx !== -1) {
              activeOverlapIndex = activeIdx;
            }
          }
        }

        // Create overlap switching callback for this node
        const onSwitchOverlapRoom = isOverlapping
          ? (direction: 'next' | 'prev') => {
              const overlappedRoomIds = group.map(g => g.id);
              handleSwitchOverlapRoom(room.id, overlappedRoomIds, direction);
            }
          : undefined;

        const node: Node = {
          id: room.id.toString(),
          type: 'room',
          position: { x, y },
          data: {
            roomId: room.id,
            zoneId: room.zoneId,
            name: room.name,
            sector: room.sector,
            roomDescription: room.roomDescription || '',
            mobs: (room.mobs || []).map(m => ({
              id: m.id,
              name: m.name,
              level: m.level ?? 0,
            })),
            objects: (room.objects || []).map(o => ({
              id: o.id,
              name: o.name,
              type: 'OBJECT',
            })),
            shops: [],
            exits: room.exits || [],
            room,
            layoutZ: roomZ,
            isOverlapping,
            overlappedRooms: isOverlapping
              ? group.map(g => ({ id: g.id, name: g.name }))
              : undefined,
            totalOverlaps: isOverlapping ? group.length : undefined,
            overlapIndex: isOverlapping ? overlapIndex : undefined,
            activeOverlapIndex: isOverlapping ? activeOverlapIndex : undefined,
            onSwitchOverlapRoom,
            // Z-level visual properties
            opacity,
            zIndex,
            isCurrentFloor,
            floorDifference,
          },
          draggable: true,
          selectable: true,
          style: {
            opacity,
            zIndex,
          },
        };
        const out: Node[] = [node];
        // Portal nodes for cross-zone exits
        (room.exits || [])
          .filter(
            e =>
              e.toZoneId != null &&
              e.toZoneId !== room.zoneId &&
              e.toRoomId != null
          )
          .forEach(e => {
            const dir = e.direction.toUpperCase();
            const offset = 180;
            let px = x,
              py = y;

            // Position portal based on exit direction
            // Check for cardinal directions first, then diagonals
            if (dir === 'NORTH') {
              py -= offset;
            } else if (dir === 'SOUTH') {
              py += offset;
            } else if (dir === 'EAST') {
              px += offset;
            } else if (dir === 'WEST') {
              px -= offset;
            } else if (dir === 'NORTHEAST') {
              px += offset;
              py -= offset;
            } else if (dir === 'NORTHWEST') {
              px -= offset;
              py -= offset;
            } else if (dir === 'SOUTHEAST') {
              px += offset;
              py += offset;
            } else if (dir === 'SOUTHWEST') {
              px -= offset;
              py += offset;
            }

            // Look up zone name from worldZones
            const destZone = worldZones.find(z => z.id === e.toZoneId);
            const zoneName = destZone?.name || `Zone ${e.toZoneId}`;

            out.push({
              id: `portal-${room.id}-${e.id}`,
              type: 'portal',
              position: { x: px, y: py },
              data: {
                direction: e.direction,
                destZoneId: e.toZoneId!,
                destRoomId: e.toRoomId!,
                zoneName,
                isOneWayEntrance: false, // Could be calculated by checking if return exit exists
                sourceDirection: undefined,
              },
              draggable: false,
              selectable: true,
            });
          });
        return out;
      });
      return roomNodes;
    } else {
      // world-map: simple horizontal spacing of zones
      return worldZones.map((z, idx) => ({
        id: `zone-${z.id}`,
        type: 'default',
        position: { x: idx * 300, y: 0 },
        data: { label: `${z.name} (${z.climate})` },
        draggable: false,
        selectable: true,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    roomsStructureKey,
    worldZones,
    viewMode,
    currentZLevel,
    activeOverlapRooms,
  ]);

  // Apply generated nodes to React Flow state
  // This only runs when the memoized nodes actually change
  useEffect(() => {
    setNodes(generatedNodes);
    if (viewMode !== 'zone') {
      setEdges([]);
    }
  }, [generatedNodes, viewMode, setNodes, setEdges]);

  // Derive edges from room exits (zone view only) including portal edges
  useEffect(() => {
    if (viewMode !== 'zone') return;
    const roomMap = new Map<number, Room>();
    rooms.forEach(r => roomMap.set(r.id, r));

    // Map exit directions to source/target handle ids defined in RoomNode
    const sourceHandleMap: Record<string, string> = {
      NORTH: 'top',
      SOUTH: 'bottom',
      EAST: 'right',
      WEST: 'left',
      UP: 'up',
      DOWN: 'down',
      NORTHEAST: 'top', // Fallback until corner handles are added
      NORTHWEST: 'top',
      SOUTHEAST: 'bottom',
      SOUTHWEST: 'bottom',
    };
    const targetHandleMap: Record<string, string> = {
      NORTH: 'bottom-target',
      SOUTH: 'top-target',
      EAST: 'left-target',
      WEST: 'right-target',
      UP: 'up-target',
      DOWN: 'down-target',
      NORTHEAST: 'bottom-target',
      NORTHWEST: 'bottom-target',
      SOUTHEAST: 'top-target',
      SOUTHWEST: 'top-target',
    };
    // Portal target handles (opposite of room target handles since portal is beyond room)
    const portalTargetHandleMap: Record<string, string> = {
      NORTH: 'bottom-target', // North portal connects from its south side
      SOUTH: 'top-target', // South portal connects from its north side
      EAST: 'left-target', // East portal connects from its west side
      WEST: 'right-target', // West portal connects from its east side
      NORTHEAST: 'bottom-target',
      NORTHWEST: 'bottom-target',
      SOUTHEAST: 'top-target',
      SOUTHWEST: 'top-target',
    };

    const newEdges = rooms.flatMap(room => {
      const exits = room.exits || [];
      return exits
        .map(e => {
          // Skip UP/DOWN exits - they're shown via Z-level offset, not edges
          const dirUpper = e.direction.toUpperCase();
          if (dirUpper === 'UP' || dirUpper === 'DOWN') {
            return null;
          }

          // Portal edge
          if (
            e.toZoneId != null &&
            e.toZoneId !== room.zoneId &&
            e.toRoomId != null
          ) {
            return {
              id: `edge-${room.id}-${e.id}`,
              source: room.id.toString(),
              target: `portal-${room.id}-${e.id}`,
              type: 'straight',
              data: { direction: e.direction, portal: true },
              style: { strokeDasharray: '4 4', stroke: '#8b5cf6' },
              sourceHandle: sourceHandleMap[dirUpper] || 'top',
              targetHandle: portalTargetHandleMap[dirUpper] || 'bottom-target',
            };
          }
          if (!isValidRoomId(e.toRoomId)) return null;
          if (e.toZoneId != null && e.toZoneId !== room.zoneId) return null;
          if (!roomMap.has(e.toRoomId)) return null;
          return {
            id: e.id || `${room.id}-${e.direction}`,
            source: room.id.toString(),
            target: e.toRoomId!.toString(),
            type: 'straight',
            data: { direction: e.direction },
            sourceHandle: sourceHandleMap[e.direction] || 'top',
            targetHandle: targetHandleMap[e.direction] || 'bottom-target',
          };
        })
        .filter(Boolean) as Array<{
        id: string;
        source: string;
        target: string;
        type: string;
        data: { direction: string; portal?: boolean };
        style?: Record<string, unknown>;
        sourceHandle?: string;
        targetHandle?: string;
      }>;
    });
    setEdges(newEdges);
  }, [rooms, viewMode, setEdges]);

  // Floor layering: dim non-selected floors and propagate depth metadata
  // NOTE: This updates node data properties but preserves positions and selection state
  useEffect(() => {
    const currentZ =
      selectedRoomId != null
        ? (rooms.find(r => r.id === selectedRoomId)?.layoutZ ?? 0)
        : 0;
    setNodes(ns =>
      ns.map(n => {
        if (n.type !== 'room') return n; // skip portal nodes
        const z = (n.data?.layoutZ ?? 0) as number;
        return {
          ...n,
          data: {
            ...n.data,
            currentZLevel: currentZ,
            isCurrentFloor: z === currentZ,
            depthOpacity: z === currentZ ? 1 : 0.4,
          },
        };
      })
    );
  }, [selectedRoomId, rooms, setNodes]);

  // Zoom to selected room on initial zone load, or fit view if no selection
  useEffect(() => {
    // Only zoom on initial load, not on every update
    if (hasInitialZoomedRef.current) return;
    if (!reactFlowInstanceRef.current) return;
    if (nodes.length === 0) return;

    // CRITICAL: Ensure nodes are from current zone, not stale nodes from previous zone
    // Check if we have rooms loaded for the current zone
    if (rooms.length === 0) return;

    // Verify nodes match current zone's rooms
    const firstNode = nodes[0];
    const firstRoom = rooms.find(r => r.id.toString() === firstNode?.id);
    if (!firstRoom) return;

    // Mark that we've done the initial zoom
    hasInitialZoomedRef.current = true;

    // Use setTimeout to ensure the layout has settled
    setTimeout(() => {
      if (isValidRoomId(selectedRoomId)) {
        // Find the selected room node and zoom to it
        // Note: Don't check n.selected === true here, as that property may not be set yet
        const selectedNode = nodes.find(
          n => n.id === selectedRoomId.toString()
        );
        if (selectedNode) {
          const centerX = selectedNode.position.x + 100;
          const centerY = selectedNode.position.y + 50;
          reactFlowInstanceRef.current?.setCenter(
            centerX, // Offset by ~half node width
            centerY, // Offset by ~half node height
            { zoom: 1.2, duration: 800 }
          );
        } else {
          // Selected room not found, fit view instead
          reactFlowInstanceRef.current?.fitView({
            padding: 0.2,
            duration: 800,
          });
        }
      } else {
        // No selected room, fit view to show all nodes
        reactFlowInstanceRef.current?.fitView({ padding: 0.2, duration: 800 });
      }
    }, 150);
  }, [selectedRoomId, nodes, rooms, activeZoneId]);

  // Room selection
  const handleSelectRoom = useCallback((roomId: number) => {
    setSelectedRoomId(roomId);
  }, []);

  // Overlap room switching - cycle through overlapping rooms at the same position
  const handleSwitchOverlapRoom = useCallback(
    (
      currentRoomId: number,
      overlappedRoomIds: number[],
      direction: 'next' | 'prev'
    ) => {
      if (overlappedRoomIds.length <= 1) return;

      const currentIndex = overlappedRoomIds.indexOf(currentRoomId);
      if (currentIndex === -1) return;

      let newIndex: number;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % overlappedRoomIds.length;
      } else {
        newIndex =
          currentIndex === 0 ? overlappedRoomIds.length - 1 : currentIndex - 1;
      }

      const newActiveRoomId = overlappedRoomIds[newIndex];
      if (newActiveRoomId === undefined) return;

      // Create position key to track which room is active at this position
      const positionKey = `overlapped-${[...overlappedRoomIds].sort((a, b) => a - b).join('-')}`;

      setActiveOverlapRooms(prev => {
        const updated: Record<string, number> = { ...prev };
        updated[positionKey] = newActiveRoomId;
        return updated;
      });

      setSelectedRoomId(newActiveRoomId);
    },
    []
  );

  // Undo/Redo integration
  const { addToUndoHistory, canUndo, canRedo, handleUndo, handleRedo } =
    useUndoRedo<Room>({
      rooms,
      setRooms,
      setNodes,
      authenticatedFetch: (u, o) => authenticatedFetch(u, o),
      log: { error: () => {}, warn: () => {} },
    });

  // Auto-layout integration
  const { overlaps, showOverlapInfo, setShowOverlapInfo, handleAutoLayout } =
    useAutoLayout({
      rooms,
      setRooms,
      authenticatedFetch: (u, o) => authenticatedFetch(u, o),
      addToUndoHistory,
      setError,
    });

  // Keyboard shortcuts for undo/redo and navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      const lowered = key.toLowerCase();
      // Avoid interfering with typing in inputs/textareas/contentEditable
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true'
        ) {
          return; // ignore for typing contexts
        }
      }
      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && lowered === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && lowered === 'z') ||
        ((e.ctrlKey || e.metaKey) && lowered === 'y')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
      // Z-level control with Shift+PageUp/PageDown
      if (e.shiftKey && key === 'PageUp') {
        e.preventDefault();
        setCurrentZLevel(z => z + 1);
        return;
      }
      if (e.shiftKey && key === 'PageDown') {
        e.preventDefault();
        setCurrentZLevel(z => z - 1);
        return;
      }
      // Navigation (arrows / WASD) only in zone view
      if (viewMode !== 'zone') return;
      if (selectedRoomId == null) return;
      const current = rooms.find(r => r.id === selectedRoomId);
      if (!current) return;
      const exits = current.exits || [];
      const byDirection: Record<string, RoomExit | undefined> = {};
      exits.forEach(ex => {
        byDirection[ex.direction.toUpperCase()] = ex;
      });
      const pick = (
        ...dirs: string[]
      ): { roomId: number; zoneId: number | null } | null => {
        for (const d of dirs) {
          const ex = byDirection[d];
          if (ex && isValidRoomId(ex.toRoomId)) {
            return {
              roomId: ex.toRoomId,
              zoneId: ex.toZoneId ?? current.zoneId,
            };
          }
        }
        return null;
      };
      let nextDest: { roomId: number; zoneId: number | null } | null = null;
      switch (key) {
        case 'ArrowUp':
          // Only NORTH - no vertical movement on arrow keys
          nextDest = pick('NORTH');
          break;
        case 'ArrowDown':
          // Only SOUTH - no vertical movement on arrow keys
          nextDest = pick('SOUTH');
          break;
        case 'ArrowLeft':
          nextDest = pick('WEST');
          break;
        case 'ArrowRight':
          nextDest = pick('EAST');
          break;
        case 'PageUp':
          // Only UP - pure vertical movement
          nextDest = pick('UP');
          break;
        case 'PageDown':
          // Only DOWN - pure vertical movement
          nextDest = pick('DOWN');
          break;
        default:
          // WASD - horizontal only, diagonals available
          if (lowered === 'w') nextDest = pick('NORTH');
          else if (lowered === 's') nextDest = pick('SOUTH');
          else if (lowered === 'a') nextDest = pick('WEST');
          else if (lowered === 'd') nextDest = pick('EAST');
          else if (lowered === 'q') nextDest = pick('NORTHWEST');
          else if (lowered === 'e') nextDest = pick('NORTHEAST');
          else if (lowered === 'z') nextDest = pick('SOUTHWEST');
          else if (lowered === 'c') nextDest = pick('SOUTHEAST');
          break;
      }
      if (nextDest && nextDest.roomId !== selectedRoomId) {
        // Handle cross-zone transition
        if (nextDest.zoneId != null && nextDest.zoneId !== activeZoneId) {
          setActiveZoneId(nextDest.zoneId);
          // Clear rooms to avoid displaying stale room edges until fetch completes
          setRooms([]);
        }
        setSelectedRoomId(nextDest.roomId);

        // Update Z-level when navigating to a different room
        const destRoom = rooms.find(r => r.id === nextDest.roomId);
        if (
          destRoom &&
          destRoom.layoutZ != null &&
          destRoom.layoutZ !== currentZLevel
        ) {
          setCurrentZLevel(destRoom.layoutZ);
        }
        // Center view handled by separate zoom effect
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    handleUndo,
    handleRedo,
    rooms,
    selectedRoomId,
    viewMode,
    activeZoneId,
    currentZLevel,
  ]);

  // Reflect selectedRoomId into React Flow's node selected state for visual highlight
  // This updates ONLY the selected property without regenerating positions
  useEffect(() => {
    setNodes(ns => {
      return ns.map(n => {
        const nodeIdStr =
          selectedRoomId != null ? selectedRoomId.toString() : '';
        const isSelected = selectedRoomId != null && n.id === nodeIdStr;
        return {
          ...n,
          selected: isSelected,
        };
      });
    });
  }, [selectedRoomId, nodes.length, setNodes]);

  // Follow selected room during navigation (arrow keys, clicks)
  // Skip during initial zone load to avoid conflicting with the initial zoom effect
  useEffect(() => {
    // Skip if this is the initial zoom (handled by effect above)
    if (!hasInitialZoomedRef.current) return;
    if (!reactFlowInstanceRef.current) return;
    if (selectedRoomId == null) return;
    const inst = reactFlowInstanceRef.current;
    const node = inst.getNode(selectedRoomId.toString());
    if (!node) return;
    const targetZoom = Math.min(1.3, Math.max(inst.getZoom(), 1.15));
    inst.setCenter(
      node.position.x + (node.width || 0) / 2,
      node.position.y + (node.height || 0) / 2,
      { zoom: targetZoom, duration: 240 }
    );
  }, [selectedRoomId]);

  // Drag start capture original position
  const handleNodeDragStart = useCallback((_: unknown, node: Node) => {
    isDraggingRef.current = true;
    dragOriginRef.current[node.id] = { ...node.position };
  }, []);

  // Drag stop persistence with undo history
  const handleNodeDragStop = useCallback(
    async (_: unknown, node: Node) => {
      isDraggingRef.current = false;
      const roomId = parseInt(node.id, 10);
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;
      // Determine if movement is a click (below threshold) or an actual drag
      const origin = dragOriginRef.current[node.id];
      if (origin) {
        const dx = Math.abs(origin.x - node.position.x);
        const dy = Math.abs(origin.y - node.position.y);
        if (dx < 3 && dy < 3) {
          // Treat as click: revert any minor jitter and skip persistence
          setNodes(ns =>
            ns.map(n =>
              n.id === node.id ? { ...n, position: { ...origin } } : n
            )
          );
          return;
        }
      }
      // Snap position
      const snappedX = snapToGrid(node.position.x);
      const snappedY = snapToGrid(node.position.y);
      setNodes(ns =>
        ns.map(n =>
          n.id === node.id
            ? { ...n, position: { x: snappedX, y: snappedY } }
            : n
        )
      );
      try {
        await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation UpdateRoomPosition($id:Int!,$position:UpdateRoomPositionInput!){\n            updateRoomPosition(id:$id, position:$position){ id layoutX layoutY layoutZ }\n          }`,
            variables: {
              id: roomId,
              position: {
                layoutX: pixelsToGrid(snappedX),
                layoutY: pixelsToGridY(snappedY),
                layoutZ: room.layoutZ ?? 0,
              },
            },
          }),
        });
        // IMPORTANT: Update rooms state WITHOUT triggering node regeneration
        // The nodes already have the correct position from setNodes above
        setRooms(rs =>
          rs.map(r =>
            r.id === roomId
              ? {
                  ...r,
                  layoutX: pixelsToGrid(snappedX),
                  layoutY: pixelsToGridY(snappedY),
                }
              : r
          )
        );
        const original = dragOriginRef.current[node.id];
        if (original && (original.x !== snappedX || original.y !== snappedY)) {
          addToUndoHistory({
            type: 'MOVE_ROOM',
            timestamp: Date.now(),
            roomId,
            previousPosition: original,
            newPosition: { x: snappedX, y: snappedY },
          });
        }
      } catch {
        // TODO: surface persistence error via UI toast mechanism
      }
    },
    [rooms, setNodes, addToUndoHistory, authenticatedFetch]
  );

  const selectedRoom = useMemo(
    () => rooms.find(r => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  // Exit CRUD handlers
  const handleCreateExit = useCallback(
    async (exitData: {
      direction: string;
      toZoneId: number;
      toRoomId: number;
    }) => {
      if (!selectedRoom) return;
      setManagingExits(true);
      // Optimistic temp exit
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setRooms(rs =>
        rs.map(r =>
          r.id === selectedRoom.id
            ? {
                ...r,
                exits: [
                  ...(r.exits || []),
                  {
                    id: tempId,
                    direction: exitData.direction,
                    toZoneId: exitData.toZoneId,
                    toRoomId: exitData.toRoomId,
                  },
                ],
              }
            : r
        )
      );
      try {
        const response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation CreateRoomExit($data:CreateRoomExitInput!){ createRoomExit(data:$data){ id direction toZoneId toRoomId description keywords key flags } }`,
            variables: {
              data: {
                roomId: selectedRoom.id,
                roomZoneId: selectedRoom.zoneId,
                direction: exitData.direction,
                toZoneId: exitData.toZoneId,
                toRoomId: exitData.toRoomId,
              },
            },
          }),
        });
        const json = await response.json();
        if (response.ok && !json.errors) {
          const created = json.data.createRoomExit;
          setRooms(rs =>
            rs.map(r =>
              r.id === selectedRoom.id
                ? {
                    ...r,
                    exits: (r.exits || []).map(e =>
                      e.id === tempId
                        ? {
                            id: created.id,
                            direction: created.direction,
                            toZoneId: created.toZoneId ?? null,
                            toRoomId: created.toRoomId ?? null,
                            description: created.description ?? null,
                            flags: created.flags || [],
                            keywords: created.keywords || [],
                            key: created.key ?? null,
                          }
                        : e
                    ),
                  }
                : r
            )
          );
        } else {
          // Rollback optimistic exit
          setRooms(rs =>
            rs.map(r =>
              r.id === selectedRoom.id
                ? { ...r, exits: (r.exits || []).filter(e => e.id !== tempId) }
                : r
            )
          );
        }
      } catch {
        setRooms(rs =>
          rs.map(r =>
            r.id === selectedRoom.id
              ? { ...r, exits: (r.exits || []).filter(e => e.id !== tempId) }
              : r
          )
        );
      } finally {
        setManagingExits(false);
      }
    },
    [selectedRoom, authenticatedFetch]
  );

  const handleDeleteExit = useCallback(
    async (exitId: string) => {
      if (!selectedRoom) return;
      setManagingExits(true);
      const previous = rooms;
      // Optimistic removal
      setRooms(rs =>
        rs.map(r =>
          r.id === selectedRoom.id
            ? { ...r, exits: (r.exits || []).filter(e => e.id !== exitId) }
            : r
        )
      );
      // Attempt delete (exitId is string; API expects number)
      const numericId = parseInt(exitId, 10);
      try {
        const response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation DeleteRoomExit($exitId:Int!){ deleteRoomExit(exitId:$exitId){ id } }`,
            variables: { exitId: numericId },
          }),
        });
        const json = await response.json();
        if (!response.ok || json.errors) {
          setRooms(previous); // rollback
        }
      } catch {
        setRooms(previous);
      } finally {
        setManagingExits(false);
      }
    },
    [selectedRoom, rooms, authenticatedFetch]
  );

  const handleUpdateExit = useCallback(
    async (exitId: string, exitPatch: Partial<RoomExit>) => {
      if (!selectedRoom) return;
      setManagingExits(true);
      const room = selectedRoom;
      const existing = room.exits?.find(e => e.id === exitId);
      if (!existing) {
        setManagingExits(false);
        return;
      }
      const previous = rooms;
      try {
        // Delete existing
        const numericId = parseInt(exitId, 10);
        await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation DeleteRoomExit($exitId:Int!){ deleteRoomExit(exitId:$exitId){ id } }`,
            variables: { exitId: numericId },
          }),
        });
        // Create new exit with updated metadata
        const response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation CreateRoomExit($data:CreateRoomExitInput!){ createRoomExit(data:$data){ id direction toZoneId toRoomId description keywords key flags } }`,
            variables: {
              data: {
                roomId: room.id,
                roomZoneId: room.zoneId,
                direction: existing.direction,
                toZoneId: existing.toZoneId ?? undefined,
                toRoomId: existing.toRoomId ?? undefined,
                description:
                  exitPatch.description ?? existing.description ?? undefined,
                keywords: exitPatch.keywords ?? existing.keywords ?? undefined,
                key: exitPatch.key ?? existing.key ?? undefined,
              },
            },
          }),
        });
        const json = await response.json();
        if (response.ok && !json.errors) {
          const created = json.data.createRoomExit;
          setRooms(rs =>
            rs.map(r =>
              r.id === room.id
                ? {
                    ...r,
                    exits: (r.exits || [])
                      .filter(e => e.id !== exitId)
                      .concat([
                        {
                          id: created.id,
                          direction: created.direction,
                          toZoneId: created.toZoneId ?? null,
                          toRoomId: created.toRoomId ?? null,
                          description: created.description ?? null,
                          keywords: created.keywords || [],
                          key: created.key ?? null,
                          flags: created.flags || [],
                        },
                      ]),
                  }
                : r
            )
          );
        } else {
          setRooms(previous);
        }
      } catch {
        setRooms(previous);
      } finally {
        setManagingExits(false);
      }
    },
    [selectedRoom, rooms, authenticatedFetch]
  );

  const nodeTypes = useMemo(() => ({ room: RoomNode, portal: PortalNode }), []);

  // Resize logic
  const handlePointerMove = useCallback(
    (e: MouseEvent) => {
      const { side, startX, startWidth } = resizingRef.current;
      if (!side) return;
      const delta = e.clientX - startX;
      if (side === 'left' && !leftCollapsed) {
        const next = Math.min(480, Math.max(160, startWidth + delta));
        setLeftPanelWidth(next);
      } else if (side === 'right' && !rightCollapsed) {
        // Drag handle sits at left edge of right panel; moving left increases width
        const next = Math.min(560, Math.max(240, startWidth - delta));
        setRightPanelWidth(next);
      }
    },
    [leftCollapsed, rightCollapsed]
  );

  const handlePointerUp = useCallback(() => {
    if (resizingRef.current.side) {
      resizingRef.current.side = null;
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    }
  }, [handlePointerMove]);

  const beginResize = useCallback(
    (side: 'left' | 'right', e: React.MouseEvent) => {
      e.preventDefault();
      resizingRef.current = {
        side,
        startX: e.clientX,
        startWidth: side === 'left' ? leftPanelWidth : rightPanelWidth,
      };
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
    },
    [leftPanelWidth, rightPanelWidth, handlePointerMove, handlePointerUp]
  );

  useEffect(() => () => handlePointerUp(), [handlePointerUp]);

  return (
    <div className='flex h-full w-full overflow-hidden'>
      {viewMode === 'zone' && (
        <div
          className='h-full border-r flex flex-col bg-gray-50 dark:bg-gray-900 relative'
          style={{
            width: leftCollapsed ? 40 : leftPanelWidth,
            transition: 'width 120ms linear',
          }}
        >
          <div className='flex items-center justify-between px-2 py-1 border-b text-xs bg-gray-100 dark:bg-gray-800'>
            <span className='font-semibold'>
              {leftCollapsed ? '🗂️' : 'Panel'}
            </span>
            <div className='flex gap-1'>
              <button
                className='px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                onClick={() => setLeftCollapsed(c => !c)}
                title={
                  leftCollapsed ? 'Expand left panel' : 'Collapse left panel'
                }
              >
                {leftCollapsed ? '▶' : '◀'}
              </button>
            </div>
          </div>
          {!leftCollapsed && (
            <div className='flex-1 overflow-auto p-2 text-xs text-gray-600 dark:text-gray-300 space-y-2'>
              <p className='font-medium'>Entity/tools panel placeholder.</p>
              <p>Resize with handle; collapse to maximize canvas.</p>
            </div>
          )}
          <div
            onMouseDown={e => beginResize('left', e)}
            className='absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-300/40 active:bg-blue-400/40'
            title='Drag to resize'
          />
        </div>
      )}
      <div className='flex-1 h-full relative' ref={reactFlowRef}>
        <div className='absolute z-10 top-2 left-2 flex gap-2'>
          <button
            className='px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            onClick={() =>
              setViewMode(m => (m === 'zone' ? 'world-map' : 'zone'))
            }
            title='Toggle world map view'
          >
            {viewMode === 'zone' ? 'World Map' : 'Zone View'}
          </button>
          {loading && (
            <span className='px-2 py-1 text-xs text-gray-700 dark:text-gray-300'>
              Loading…
            </span>
          )}
          {error && (
            <span className='px-2 py-1 text-xs text-red-600' title={error}>
              Error
            </span>
          )}
          <button
            className='px-2 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
            onClick={() => handleAutoLayout(selectedRoomId)}
            title='Auto-layout rooms following exits (A)'
          >
            Auto-Layout
          </button>
          <div className='flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded'>
            <button
              className='px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              onClick={() => setCurrentZLevel(z => z + 1)}
              title='View floor above (Shift+PgUp)'
            >
              ↑
            </button>
            <span className='px-1 font-mono' title='Current floor level'>
              Z{currentZLevel}
            </span>
            <button
              className='px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              onClick={() => setCurrentZLevel(z => z - 1)}
              title='View floor below (Shift+PgDn)'
            >
              ↓
            </button>
          </div>
          <button
            className='px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            disabled={!canUndo}
            onClick={() => handleUndo()}
            title='Undo (Ctrl+Z)'
          >
            Undo
          </button>
          <button
            className='px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            disabled={!canRedo}
            onClick={() => handleRedo()}
            title='Redo (Ctrl+Shift+Z / Ctrl+Y)'
          >
            Redo
          </button>
          {overlaps.length > 0 && (
            <button
              className='px-2 py-1 text-xs rounded bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700'
              onClick={() => setShowOverlapInfo(!showOverlapInfo)}
              title={`${overlaps.length} overlapping positions detected`}
            >
              Overlaps: {overlaps.length}
            </button>
          )}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onNodeDragStart={handleNodeDragStart}
          onNodeClick={(_, node) => {
            const idNum = parseInt(node.id, 10);
            if (!isNaN(idNum)) {
              setSelectedRoomId(idNum);
              // Update Z-level to match clicked room's floor
              const clickedRoom = rooms.find(r => r.id === idNum);
              if (
                clickedRoom &&
                clickedRoom.layoutZ != null &&
                clickedRoom.layoutZ !== currentZLevel
              ) {
                setCurrentZLevel(clickedRoom.layoutZ);
              }
            }
          }}
          defaultEdgeOptions={{ type: 'straight' }}
          nodeTypes={nodeTypes}
          onInit={inst => {
            reactFlowInstanceRef.current = inst;
          }}
        >
          <Background gap={24} />
          <Controls />
          <MiniMap
            nodeColor={node => {
              // Color nodes based on type and selection state
              if (node.selected) return '#3b82f6'; // Blue for selected
              if (node.type === 'portal') return '#8b5cf6'; // Purple for portals
              return '#6b7280'; // Gray for regular rooms
            }}
            maskColor='rgba(0, 0, 0, 0.6)'
            style={{
              backgroundColor: 'rgba(17, 24, 39, 0.8)', // dark gray background
              border: '1px solid rgba(75, 85, 99, 0.5)',
              cursor: 'pointer', // Show pointer cursor to indicate clickability
            }}
            pannable
            zoomable
            onClick={(event, position) => {
              // When clicking on the minimap, center the view on that position
              if (reactFlowInstanceRef.current) {
                reactFlowInstanceRef.current.setCenter(position.x, position.y, {
                  zoom: reactFlowInstanceRef.current.getZoom(),
                  duration: 300,
                });
              }
            }}
          />
        </ReactFlow>
      </div>
      {viewMode === 'zone' && selectedRoom && (
        <div
          className='border-l bg-white dark:bg-gray-900 p-2 overflow-y-auto relative'
          style={{
            width: rightCollapsed ? 44 : rightPanelWidth,
            transition: 'width 120ms linear',
          }}
        >
          <div className='flex items-center justify-between mb-2 text-xs'>
            <span className='font-semibold'>
              {rightCollapsed ? '⚙️' : 'Properties'}
            </span>
            <button
              className='px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              onClick={() => setRightCollapsed(c => !c)}
              title={
                rightCollapsed ? 'Expand right panel' : 'Collapse right panel'
              }
            >
              {rightCollapsed ? '◀' : '▶'}
            </button>
          </div>
          {(() => {
            const panelRoom: PropertyPanelRoom = {
              id: selectedRoom.id,
              name: selectedRoom.name,
              roomDescription: selectedRoom.roomDescription || '',
              sector: selectedRoom.sector,
              zoneId: selectedRoom.zoneId,
              layoutX: selectedRoom.layoutX,
              layoutY: selectedRoom.layoutY,
              layoutZ: selectedRoom.layoutZ,
              exits: (selectedRoom.exits || []).map(e => {
                const base: Omit<PropertyPanelRoomExit, 'key'> & {
                  key?: string;
                } = {
                  id: e.id,
                  direction: e.direction,
                  toZoneId: e.toZoneId ?? null,
                  toRoomId: e.toRoomId ?? null,
                  description: e.description ?? '',
                  keywords: e.keywords ?? [],
                  flags: e.flags ?? [],
                };
                if (e.key) {
                  base.key = e.key;
                }
                return base as PropertyPanelRoomExit;
              }),
              mobs: (selectedRoom.mobs || []).map(m => ({
                id: m.id,
                name: m.name,
                level: m.level ?? 0,
              })),
              objects: (selectedRoom.objects || []).map(o => ({
                id: o.id,
                name: o.name,
                type: 'OBJECT',
              })),
              shops: [],
            };
            const panelAllRooms: PropertyPanelRoom[] = rooms.map(r => ({
              id: r.id,
              name: r.name,
              roomDescription: r.roomDescription || '',
              sector: r.sector,
              zoneId: r.zoneId,
              layoutX: r.layoutX,
              layoutY: r.layoutY,
              layoutZ: r.layoutZ,
              exits: (r.exits || []).map(e => {
                const base: Omit<PropertyPanelRoomExit, 'key'> & {
                  key?: string;
                } = {
                  id: e.id,
                  direction: e.direction,
                  toZoneId: e.toZoneId ?? null,
                  toRoomId: e.toRoomId ?? null,
                  description: e.description ?? '',
                  keywords: e.keywords ?? [],
                  flags: e.flags ?? [],
                };
                if (e.key) {
                  base.key = e.key;
                }
                return base as PropertyPanelRoomExit;
              }),
              mobs: (r.mobs || []).map(m => ({
                id: m.id,
                name: m.name,
                level: m.level ?? 0,
              })),
              objects: (r.objects || []).map(o => ({
                id: o.id,
                name: o.name,
                type: 'OBJECT',
              })),
              shops: [],
            }));
            return rightCollapsed ? null : (
              <PropertyPanel
                room={panelRoom}
                allRooms={panelAllRooms}
                onRoomChange={() => {}}
                onSaveRoom={() => {}}
                onCreateExit={handleCreateExit}
                onDeleteExit={handleDeleteExit}
                onUpdateExit={handleUpdateExit}
                onSelectRoom={handleSelectRoom}
                onNavigateToZone={() => {}}
                onUpdateZLevel={() => {}}
                onRemoveMob={() => {}}
                onRemoveObject={() => {}}
                saving={false}
                managingExits={managingExits}
                viewMode={'view'}
                onEntityClick={() => {}}
              />
            );
          })()}
          <div
            onMouseDown={e => beginResize('right', e)}
            className='absolute top-0 left-0 h-full w-2 -ml-2 cursor-col-resize hover:bg-blue-300/40 active:bg-blue-400/40'
            title='Drag to resize'
          />
        </div>
      )}
    </div>
  );
};

const ZoneEditorOrchestrator: React.FC<ZoneEditorOrchestratorProps> = props => (
  <ZoneEditorOrchestratorFlow {...props} />
);

export default ZoneEditorOrchestrator;
export { ZoneEditorOrchestrator };
