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
import {
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from 'reactflow';
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
import { EditorToolbar, type EditorMode } from './EditorToolbar';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useRoomOverlaps } from './hooks/useRoomOverlaps';
import { PortalNode } from './PortalNode';
import { OverlapPanel } from './OverlapPanel';
import { PropertyPanel } from './PropertyPanel';
import { RoomNode } from './RoomNode';
import { usePermissions } from '@/hooks/use-permissions';
import { EntityPanel, type Mob, type GameObject } from './EntityPanel';
import type { EntityDetail } from './EntityDetailPanel';
import { GoToHint, HelpModal, useHelpModal } from '@/components/HelpModal';

// Portal positioning using center-to-center distances
// This ensures uniform spacing in all directions
const ROOM_SIZE = 180; // Room dimensions (rooms are 180x180px)
const PORTAL_SIZE = 80; // Portal dimensions (minWidth: 80px, roughly square)
const PORTAL_OFFSET = 150; // Distance from room center to portal center (increased for padding/content)

// Direction unit vectors for positioning portal centers relative to room center
// Diagonal vectors are normalized (divided by √2) to ensure uniform distance in all directions
const SQRT2 = Math.sqrt(2);
const PORTAL_DIRECTION_VECTORS: Record<string, { dx: number; dy: number }> = {
  NORTH: { dx: 0, dy: -1 },
  SOUTH: { dx: 0, dy: 1 },
  EAST: { dx: 1, dy: 0 },
  WEST: { dx: -1, dy: 0 },
  NORTHEAST: { dx: 1 / SQRT2, dy: -1 / SQRT2 },
  NORTHWEST: { dx: -1 / SQRT2, dy: -1 / SQRT2 },
  SOUTHEAST: { dx: 1 / SQRT2, dy: 1 / SQRT2 },
  SOUTHWEST: { dx: -1 / SQRT2, dy: 1 / SQRT2 },
  UP: { dx: -1 / SQRT2, dy: -1 / SQRT2 }, // Northwest diagonal (normalized)
  DOWN: { dx: 1 / SQRT2, dy: 1 / SQRT2 }, // Southeast diagonal (normalized)
};

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

type WorldMapRoom = {
  id: number;
  zoneId: number;
  name: string;
  sector: string;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
  exits?: RoomExit[];
};

type ZoneBounds = {
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
};

const SECTOR_COLORS: Record<string, string> = {
  STRUCTURE: '#475569',
  FIELD: '#4ade80',
  FOREST: '#16a34a',
  HILLS: '#ea580c',
  MOUNTAIN: '#6b7280',
  WATER: '#2563eb',
  SWAMP: '#0d9488',
  CITY: '#7c3aed',
  ROAD: '#ca8a04',
};

const getSectorColorHex = (sector: string): string => {
  const key = sector.toUpperCase();
  return SECTOR_COLORS[key] || '#94a3b8';
};

const zoneTintForId = (zoneId: number): string => {
  const hue = (zoneId * 47) % 360;
  return `hsla(${hue}, 70%, 65%, 0.15)`;
};

// World-map rendering scale (pixels per grid unit) to avoid gigantic coordinate space
const WORLD_SCALE = 12;
const worldGridToPixels = (grid: number) => grid * WORLD_SCALE;
const worldGridToPixelsY = (grid: number) => -grid * WORLD_SCALE;
const worldRoomNodeId = (zoneId: number, roomId: number) =>
  `world-room-${zoneId}-${roomId}`;

const DIRECTION_DELTAS: Record<
  string,
  { dx: number; dy: number; dz?: number }
> = {
  NORTH: { dx: 0, dy: 1 },
  SOUTH: { dx: 0, dy: -1 },
  EAST: { dx: 1, dy: 0 },
  WEST: { dx: -1, dy: 0 },
  NORTHEAST: { dx: 1, dy: 1 },
  NORTHWEST: { dx: -1, dy: 1 },
  SOUTHEAST: { dx: 1, dy: -1 },
  SOUTHWEST: { dx: -1, dy: -1 },
  UP: { dx: -0.8, dy: -0.8, dz: 1 }, // Behind and up-left (northwest)
  DOWN: { dx: 0.8, dy: 0.8, dz: -1 }, // Behind and down-right (southeast)
};

const REVERSE_DIRECTIONS: Record<string, string> = {
  NORTH: 'SOUTH',
  SOUTH: 'NORTH',
  EAST: 'WEST',
  WEST: 'EAST',
  NORTHEAST: 'SOUTHWEST',
  NORTHWEST: 'SOUTHEAST',
  SOUTHEAST: 'NORTHWEST',
  SOUTHWEST: 'NORTHEAST',
  UP: 'DOWN',
  DOWN: 'UP',
};

const computeZoneBounds = (
  zones: { id: number; name: string; climate: string }[],
  rooms: WorldMapRoom[]
): ZoneBounds[] => {
  const roomsByZone = new Map<number, WorldMapRoom[]>();
  rooms.forEach(r => {
    if (!roomsByZone.has(r.zoneId)) roomsByZone.set(r.zoneId, []);
    roomsByZone.get(r.zoneId)!.push(r);
  });

  return zones.map(z => {
    const zoneRooms = roomsByZone.get(z.id) || [];
    const xs = zoneRooms
      .map(r => r.layoutX)
      .filter((v): v is number => v !== null && !isNaN(v));
    const ys = zoneRooms
      .map(r => r.layoutY)
      .filter((v): v is number => v !== null && !isNaN(v));
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 1;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 1;
    return {
      id: z.id,
      name: z.name,
      climate: z.climate,
      minX,
      minY,
      maxX,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      roomCount: zoneRooms.length,
    };
  });
};

const computeOrbitOffsets = (
  bounds: ZoneBounds[],
  roomsByZone: Map<number, WorldMapRoom[]>
): Map<number, { dx: number; dy: number }> => {
  const orphans = bounds.filter(b => {
    const rooms = roomsByZone.get(b.id) || [];
    const hasCrossZoneExit = rooms.some(r =>
      (r.exits || []).some(
        ex => ex.toZoneId != null && ex.toZoneId !== r.zoneId
      )
    );
    const nearOrigin = Math.hypot(b.centerX, b.centerY) < 2;
    return nearOrigin && !hasCrossZoneExit;
  });
  const offsets = new Map<number, { dx: number; dy: number }>();
  const radius = 50; // grid units away from origin
  orphans.forEach((zone, idx) => {
    const angle = (idx / Math.max(1, orphans.length)) * Math.PI * 2;
    offsets.set(zone.id, {
      dx: Math.cos(angle) * (radius + idx * 5),
      dy: Math.sin(angle) * (radius + idx * 5),
    });
  });
  return offsets;
};

const WorldRoomDotNode: React.FC<
  NodeProps<{
    zoneId: number;
    roomId: number;
    zoneName?: string;
    sector: string;
    color: string;
  }>
> = ({ data, selected }) => {
  return (
    <div
      title={`${data.zoneName || 'Zone'} (${data.zoneId})`}
      style={{
        width: 8,
        height: 8,
        backgroundColor: data.color,
        border: selected ? '1px solid #2563eb' : '1px solid rgba(0,0,0,0.35)',
        borderRadius: 2,
        boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
      }}
    />
  );
};

const ZoneBoundaryNode: React.FC<
  NodeProps<{
    zoneId: number;
    name: string;
    climate: string;
    roomCount: number;
    width: number;
    height: number;
    tint: string;
  }>
> = ({ data, selected }) => {
  return (
    <div
      title={`${data.name} • ${data.roomCount} rooms`}
      style={{
        width: data.width,
        height: data.height,
        background: `radial-gradient(70% 70% at 50% 50%, ${data.tint} 0%, rgba(0,0,0,0.02) 68%, rgba(0,0,0,0) 100%)`,
        border: selected
          ? '1px solid rgba(37,99,235,0.4)'
          : '1px solid rgba(15,23,42,0.1)',
        borderRadius: 28,
        boxShadow:
          '0 0 32px 12px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    />
  );
};

// Minimal orchestrator: rooms display + selection + drag persistence + basic undo + optional world map zones view
const ZoneEditorOrchestratorFlow: React.FC<ZoneEditorOrchestratorProps> = ({
  zoneId,
  initialRoomId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  // Entity panel state
  const [selectedEntity, setSelectedEntity] = useState<EntityDetail | null>(
    null
  );
  const [draggedMob, setDraggedMob] = useState<Mob | null>(null);
  const [draggedObject, setDraggedObject] = useState<GameObject | null>(null);
  // Track active zone separately from prop to enable cross-zone portal navigation
  const [activeZoneId, setActiveZoneId] = useState<number | null>(
    zoneId ?? null
  );
  // Current Z-level being viewed (floor 0 is ground level)
  const [currentZLevel, setCurrentZLevel] = useState<number>(0);
  // Hide rooms not on current floor (false = show with reduced opacity, true = completely hide)
  const [hideOtherFloors, setHideOtherFloors] = useState<boolean>(false);
  // Track which room is active in each overlap group (keyed by position)
  const [activeOverlapRooms, setActiveOverlapRooms] = useState<
    Record<string, number>
  >({});
  const [editorMode, setEditorMode] = useState<EditorMode>('view');
  const { canEditZone } = usePermissions();
  const {
    open: helpOpen,
    setOpen: setHelpOpen,
    showGoToHint,
  } = useHelpModal('zone-editor');
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

  // Sync activeZoneId with zoneId prop when the PROP changes (not when state diverges)
  // This allows cross-zone navigation while still responding to external prop changes
  const prevZoneIdRef = useRef<number | undefined>(zoneId);
  useEffect(() => {
    // Only sync if the prop itself changed, not if activeZoneId changed independently
    if (zoneId !== prevZoneIdRef.current) {
      prevZoneIdRef.current = zoneId;
      if (zoneId !== undefined) {
        setActiveZoneId(zoneId ?? null);
      }
    }
  }, [zoneId]);

  // Initialize from URL on mount only
  // After mount, state drives URL (not the other way around)
  useEffect(() => {
    try {
      const zoneParam = searchParams.get('zone');
      const roomParam = searchParams.get('room');

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

    const zoneParam = searchParams.get('zone');
    const roomParam = searchParams.get('room');

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
  const [worldRooms, setWorldRooms] = useState<WorldMapRoom[]>([]);
  const [worldZoneBounds, setWorldZoneBounds] = useState<ZoneBounds[]>([]);
  const [worldOrbitOffsets, setWorldOrbitOffsets] = useState<
    Map<number, { dx: number; dy: number }>
  >(new Map());
  const canEditCurrentZone = canEditZone(activeZoneId ?? undefined);
  const isEditing =
    viewMode === 'zone' && editorMode === 'edit' && canEditCurrentZone;
  const [managingExits, setManagingExits] = useState(false);

  useEffect(() => {
    if (editorMode === 'edit' && !canEditCurrentZone) {
      setEditorMode('view');
    }
  }, [editorMode, canEditCurrentZone]);
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
  const { overlaps, showOverlapInfo, toggleOverlapInfo } =
    useRoomOverlaps(rooms);
  const [viewportZoom, setViewportZoom] = useState(1);
  // Track full viewport for virtualization (x, y, zoom)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  // Throttle viewport updates to reduce recalculation frequency
  const lastViewportUpdateRef = useRef<number>(0);
  const pendingViewportRef = useRef<{
    x: number;
    y: number;
    zoom: number;
  } | null>(null);
  // Track rendering state for static preview mode
  const [isFullyInteractive, setIsFullyInteractive] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled viewport update with separate handling for zoom vs pan
  // Zoom updates immediately (responsive), pan updates throttled (performance)
  // In static preview mode: even more aggressive throttling for instant feel
  const updateViewportThrottled = useCallback(
    (vp: { x: number; y: number; zoom: number }) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastViewportUpdateRef.current;

      // More aggressive throttle during static preview (instant pan/zoom on static image)
      const throttleInterval = isFullyInteractive ? 150 : 300;

      // Always update zoom immediately for smooth zoom experience
      setViewportZoom(vp.zoom);

      // Throttle only the position updates (x, y) for performance
      if (timeSinceLastUpdate >= throttleInterval) {
        // Immediate position update
        lastViewportUpdateRef.current = now;
        setViewport(vp);
        pendingViewportRef.current = null;
      } else {
        // Store pending position update
        pendingViewportRef.current = vp;

        // Schedule deferred position update
        const remainingTime = throttleInterval - timeSinceLastUpdate;
        setTimeout(() => {
          if (pendingViewportRef.current) {
            lastViewportUpdateRef.current = Date.now();
            setViewport(pendingViewportRef.current);
            pendingViewportRef.current = null;
          }
        }, remainingTime);
      }
    },
    [isFullyInteractive]
  );

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
    console.log(
      '[Zone Fetch Debug] useEffect triggered, activeZoneId:',
      activeZoneId,
      'viewMode:',
      viewMode
    );
    if (viewMode !== 'zone') return;
    let cancelled = false;
    // Reset initial zoom flag when zone changes (room/z-level handled by URL or auto-select)
    hasInitialZoomedRef.current = false;
    const fetchRooms = async () => {
      if (!isValidZoneId(activeZoneId)) return;
      console.log('[Zone Fetch Debug] Fetching rooms for zone:', activeZoneId);
      setLoading(true);
      setError(null);
      try {
        const response: Response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `query GetRooms($zoneId: Int!, $lightweight: Boolean){
              zones { id name climate }
              roomsByZone(zoneId: $zoneId, lightweight: $lightweight){
                id zoneId name description roomDescription sector layoutX layoutY layoutZ
                exits{ id direction toZoneId toRoomId description keywords key flags }
                mobs{ id name level roomDescription }
                objects{ id name roomDescription }
                shops{ id buyProfit sellProfit keeperId }
              }
            }`,
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
          // Extract zones data for cross-zone exit lookups
          const zones = data.data.zones || [];
          if (!cancelled) setWorldZones(zones);

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

  // Fetch world map data (zones + lightweight rooms) in world-map mode
  useEffect(() => {
    if (viewMode !== 'world-map') return;
    let cancelled = false;
    const fetchWorld = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: Response = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `query WorldMap($take:Int){ 
              zones { id name climate } 
              rooms(lightweight:true, take:$take){ id name sector zoneId layoutX layoutY layoutZ exits { id direction toZoneId toRoomId } } 
            }`,
            variables: { take: 120000 },
          }),
        });
        const data = await response.json();
        if (response.ok && !data.errors) {
          if (cancelled) return;
          const zones = data.data.zones || [];
          const rooms: WorldMapRoom[] = (data.data.rooms || []).map(
            (r: any) => ({
              id: r.id,
              name: r.name,
              sector: r.sector || 'STRUCTURE',
              zoneId: r.zoneId,
              layoutX: r.layoutX,
              layoutY: r.layoutY,
              layoutZ: r.layoutZ,
              exits: (r.exits || []).map((e: any) => ({
                id: String(e.id ?? `${r.id}-${e.direction}`),
                direction: e.direction,
                toZoneId: e.toZoneId ?? null,
                toRoomId: e.toRoomId ?? null,
              })),
            })
          );
          setWorldZones(zones);
          setWorldRooms(rooms);
          const bounds = computeZoneBounds(zones, rooms);
          setWorldZoneBounds(bounds);
          const roomsByZone = new Map<number, WorldMapRoom[]>();
          rooms.forEach((room: WorldMapRoom) => {
            if (!roomsByZone.has(room.zoneId)) roomsByZone.set(room.zoneId, []);
            roomsByZone.get(room.zoneId)!.push(room);
          });
          setWorldOrbitOffsets(computeOrbitOffsets(bounds, roomsByZone));
        } else if (!cancelled) {
          setError(data.errors?.[0]?.message || 'Failed to load world map');
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWorld();
    return () => {
      cancelled = true;
    };
  }, [viewMode, authenticatedFetch]);

  // Reset zoom flag and clear nodes when zone changes to allow initial zoom on new zone
  useEffect(() => {
    if (previousZoneIdRef.current !== activeZoneId) {
      previousZoneIdRef.current = activeZoneId;
      hasInitialZoomedRef.current = false;
      // Clear stale nodes immediately to prevent zoom from using old zone's data
      setNodes([]);
    }
  }, [activeZoneId, setNodes]);

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
    // If a room is present in URL, do not override it
    const hasRoomParam = !!searchParams.get('room');
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
    const param = searchParams.get('room');
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
      params.set('zone', String(activeZoneId ?? ''));
      params.set('room', String(selectedRoomId));
      const newUrl = params.toString();

      // Store the URL we're about to sync so the listener can ignore it
      lastSyncedUrlRef.current = newUrl;

      router.replace(`${pathname}?${newUrl}`, { scroll: false });
    } catch {
      /* silent */
    }
  }, [selectedRoomId, activeZoneId, router, pathname]);

  // Calculate floor range (min/max Z levels with actual rooms)
  // Used to disable floor navigation buttons when no rooms exist above/below
  const floorRange = useMemo(() => {
    if (rooms.length === 0) return { min: 0, max: 0 };
    const zLevels = rooms
      .map(r => r.layoutZ ?? 0)
      .filter((z): z is number => z !== null && z !== undefined);
    return {
      min: Math.min(...zLevels),
      max: Math.max(...zLevels),
    };
  }, [rooms]);

  // Aggregate all mobs from all rooms for EntityPanel
  const allMobs = useMemo(() => {
    const mobMap = new Map<number, Mob>();
    rooms.forEach(room => {
      room.mobs?.forEach(mob => {
        if (!mobMap.has(mob.id)) {
          mobMap.set(mob.id, {
            id: mob.id,
            name: mob.name,
            level: mob.level ?? 0,
            roomId: room.id,
            description: mob.description ?? undefined,
          });
        }
      });
    });
    return Array.from(mobMap.values());
  }, [rooms]);

  // Aggregate all objects from all rooms for EntityPanel
  const allObjects = useMemo(() => {
    const objMap = new Map<number, GameObject>();
    rooms.forEach(room => {
      room.objects?.forEach(obj => {
        if (!objMap.has(obj.id)) {
          objMap.set(obj.id, {
            id: obj.id,
            name: obj.name,
            type: 'unknown', // We'll need to fetch this from a more detailed query
            roomId: room.id,
            description: obj.description ?? undefined,
          });
        }
      });
    });
    return Array.from(objMap.values());
  }, [rooms]);

  // Create a stable dependency key that changes only when room structure changes (not positions)
  // This prevents node regeneration when dragging
  // Optimized: Only track structural changes (ID, zone, exit count), not content (name, descriptions)
  const roomsStructureKey = useMemo(() => {
    // Use a more efficient key that only includes structural data
    // Name changes don't require node regeneration (handled by RoomNode memo)
    return rooms.map(r => `${r.id}:${r.exits?.length ?? 0}`).join('|');
  }, [rooms]);

  // Filter rooms based on hideOtherFloors setting
  const visibleRooms = useMemo(() => {
    if (hideOtherFloors) {
      return rooms.filter(room => (room.layoutZ ?? 0) === currentZLevel);
    }
    return rooms;
  }, [rooms, hideOtherFloors, currentZLevel]);

  // Viewport virtualization removed - not needed for individual zones
  // Rooms now render synchronously to ensure proper initial zoom timing

  // Generate React Flow nodes when data changes (with overlap + portal nodes)
  // IMPORTANT: Use useMemo to avoid regenerating nodes unnecessarily
  // Only regenerate when room structure changes (add/remove/data), not when positions change
  const generatedNodes = useMemo(() => {
    if (viewMode === 'zone') {
      const overlapGroups = new Map<string, Room[]>();
      visibleRooms.forEach(r => {
        const key = `${r.layoutX ?? 0}:${r.layoutY ?? 0}:${r.layoutZ ?? 0}`;
        const list = overlapGroups.get(key) || [];
        list.push(r);
        overlapGroups.set(key, list);
      });
      const roomNodes = visibleRooms.flatMap(room => {
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
            opacity = Math.max(0.3, 1 - floorDifference * 0.3); // More dramatic opacity change
            offsetX = -floorDifference * 50; // Larger offset for visibility
            offsetY = -floorDifference * 50;
            zIndex = 100 - floorDifference; // Higher floors appear behind
          } else {
            // Lower floors - southeast (down-right) diagonal offset
            opacity = Math.max(0.3, 1 - Math.abs(floorDifference) * 0.3); // More dramatic opacity change
            offsetX = Math.abs(floorDifference) * 50; // Larger offset for visibility
            offsetY = Math.abs(floorDifference) * 50;
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
            depthOpacity: opacity, // RoomNode uses this for visual opacity
            zIndex,
            isCurrentFloor,
            floorDifference,
          },
          draggable: isEditing,
          selectable: true,
          style: {
            opacity,
            zIndex,
          },
        };
        const out: Node[] = [node];
        // Portal nodes for cross-zone exits
        const crossZoneExits = (room.exits || []).filter(
          e =>
            e.toZoneId != null &&
            e.toZoneId !== room.zoneId &&
            e.toRoomId != null
        );
        crossZoneExits.forEach(e => {
          const dir = e.direction.toUpperCase();
          const dirVector = PORTAL_DIRECTION_VECTORS[dir] || { dx: 0, dy: 0 };

          // Portal floor visibility logic:
          // All portals appear on the same floor as their source room
          // This allows you to see all exits when viewing a room
          // (UP/DOWN use diagonal positioning to indicate vertical direction)
          if (roomZ !== currentZLevel) {
            return; // Only show portals for rooms on current floor
          }

          // Center-based positioning for uniform spacing in all directions
          // 1. Calculate room center (rooms are positioned by top-left, size 180x180)
          const roomCenterX = baseX + ROOM_SIZE / 2;
          const roomCenterY = baseY + ROOM_SIZE / 2;

          // 2. Calculate portal center using direction vector and offset
          const portalCenterX = roomCenterX + dirVector.dx * PORTAL_OFFSET;
          const portalCenterY = roomCenterY + dirVector.dy * PORTAL_OFFSET;

          // 3. Convert to top-left position (React Flow positions nodes by top-left)
          const px = portalCenterX - PORTAL_SIZE / 2;
          const py = portalCenterY - PORTAL_SIZE / 2;

          // Look up zone name from worldZones
          const destZone = worldZones.find(z => z.id === e.toZoneId);
          const zoneName = destZone?.name || `Zone ${e.toZoneId}`;

          const portalNode = {
            id: `portal-${room.id}-${e.id}`,
            type: 'portal',
            position: { x: px, y: py },
            data: {
              direction: e.direction,
              destZoneId: e.toZoneId!,
              destRoomId: e.toRoomId!,
              zoneName,
              isOneWayEntrance: false,
              sourceDirection: undefined,
            },
            draggable: false,
            selectable: true,
            style: {
              opacity: 0.9, // Slightly transparent to distinguish from rooms
              zIndex: 110, // Above rooms (rooms are zIndex 100)
            },
          };
          out.push(portalNode);
        });
        return out;
      });
      return roomNodes;
    } else {
      // world-map: render zones + all room dots (exits hidden for perf)
      const nodes: Node[] = [];
      const roomsByZone = new Map<number, WorldMapRoom[]>();
      worldRooms.forEach(r => {
        if (!roomsByZone.has(r.zoneId)) roomsByZone.set(r.zoneId, []);
        roomsByZone.get(r.zoneId)!.push(r);
      });

      // Zone boundary backdrops
      worldZoneBounds.forEach(zone => {
        const offset = worldOrbitOffsets.get(zone.id) || { dx: 0, dy: 0 };
        const zoneRooms = roomsByZone.get(zone.id) || [];
        const points = zoneRooms
          .filter(r => r.layoutX !== null && r.layoutY !== null)
          .map(r => ({
            x: worldGridToPixels((r.layoutX ?? 0) + offset.dx),
            y: worldGridToPixelsY((r.layoutY ?? 0) + offset.dy),
          }));
        // Fallback to zone bounds if no room coords
        if (points.length === 0) {
          points.push({
            x: worldGridToPixels(zone.minX + offset.dx),
            y: worldGridToPixelsY(zone.minY + offset.dy),
          });
        }
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minXPx = Math.min(...xs);
        const maxXPx = Math.max(...xs);
        const minYPx = Math.min(...ys);
        const maxYPx = Math.max(...ys);
        const centerX = (minXPx + maxXPx) / 2;
        const centerY = (minYPx + maxYPx) / 2;
        const padding = 50;
        const halfWidth = Math.max(80, (maxXPx - minXPx) / 2 + padding);
        const halfHeight = Math.max(80, (maxYPx - minYPx) / 2 + padding);
        const width = halfWidth * 2;
        const height = halfHeight * 2;
        const posX = centerX - halfWidth;
        const posY = centerY - halfHeight;
        nodes.push({
          id: `zone-${zone.id}`,
          type: 'zoneBoundary',
          position: { x: posX, y: posY },
          data: {
            zoneId: zone.id,
            name: zone.name,
            climate: zone.climate,
            roomCount: zone.roomCount,
            width,
            height,
            tint: zoneTintForId(zone.id),
            isZoneBoundary: true,
          },
          draggable: false,
          selectable: true,
          style: { zIndex: 0 },
        });
      });

      // Viewport virtualization for world-map: only render rooms in visible viewport
      // Calculate viewport bounds in world coordinates
      const viewportWidth = reactFlowRef.current?.offsetWidth ?? 2000;
      const viewportHeight = reactFlowRef.current?.offsetHeight ?? 1600;
      const bufferMultiplier = 2.0; // Larger buffer for world-map (zoomed out more)
      const minX =
        -viewport.x / viewport.zoom - viewportWidth * bufferMultiplier;
      const maxX =
        -viewport.x / viewport.zoom + viewportWidth * (1 + bufferMultiplier);
      const minY =
        -viewport.y / viewport.zoom - viewportHeight * bufferMultiplier;
      const maxY =
        -viewport.y / viewport.zoom + viewportHeight * (1 + bufferMultiplier);

      // Filter and render rooms in a single pass (avoid duplicate calculations)
      worldRooms
        .filter(r => r.layoutX !== null && r.layoutY !== null)
        .forEach(room => {
          const offset = worldOrbitOffsets.get(room.zoneId) || { dx: 0, dy: 0 };
          const x = worldGridToPixels((room.layoutX ?? 0) + offset.dx);
          const y = worldGridToPixelsY((room.layoutY ?? 0) + offset.dy);

          // Skip rooms outside viewport bounds (viewport virtualization)
          if (x < minX || x > maxX || y < minY || y > maxY) {
            return;
          }
          const zoneName =
            worldZoneBounds.find(z => z.id === room.zoneId)?.name ||
            `Zone ${room.zoneId}`;
          nodes.push({
            id: worldRoomNodeId(room.zoneId, room.id),
            type: 'worldRoomDot',
            position: { x, y },
            data: {
              roomId: room.id,
              zoneId: room.zoneId,
              sector: room.sector,
              zoneName,
              color: getSectorColorHex(room.sector),
            },
            draggable: false,
            selectable: false,
            style: { zIndex: 2, cursor: 'default', pointerEvents: 'none' },
            className: 'world-room-dot',
          });
        });

      return nodes;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    roomsStructureKey,
    visibleRooms, // Synchronous room rendering for proper zoom timing
    worldZones,
    worldRooms,
    worldZoneBounds,
    worldOrbitOffsets,
    viewMode,
    currentZLevel,
    activeOverlapRooms,
    isEditing,
  ]);

  // Apply generated nodes to React Flow state
  // This only runs when the memoized nodes actually change
  useEffect(() => {
    setNodes(generatedNodes);

    // Enable static preview mode: show nodes immediately but defer full interactivity
    // This makes initial load feel instant while heavy calculations happen in background
    // Static preview will hide automatically when isFullyInteractive becomes true
    setIsFullyInteractive(false);

    // Clear any pending timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // Enable full interactivity after nodes are rendered (300ms delay)
    // This allows visual rendering to complete before enabling expensive features
    renderTimeoutRef.current = setTimeout(() => {
      setIsFullyInteractive(true);
    }, 300);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [generatedNodes, setNodes]);

  // Generate base edges from room structure (no zoom dependency)
  // Synchronous rendering ensures all rooms are available for edge generation
  const baseEdges = useMemo(() => {
    if (viewMode !== 'zone') return [];

    const roomMap = new Map<number, Room>();
    // Use all visible rooms synchronously
    visibleRooms.forEach(r => roomMap.set(r.id, r));

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

    // Use all visible rooms synchronously
    return visibleRooms.flatMap(room => {
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
  }, [visibleRooms, viewMode]);

  // Apply zoom-based visibility to edges (separate from generation)
  // This only updates styles, doesn't regenerate edges
  useEffect(() => {
    const shouldHideEdges = viewportZoom < 0.4;
    const edgesWithVisibility = baseEdges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        display: shouldHideEdges ? 'none' : 'block',
      },
    }));
    setEdges(edgesWithVisibility);
  }, [baseEdges, viewportZoom, setEdges]);

  // World-map edges (lightweight: only connect rooms that exist in payload; allow cross-zone now that IDs are composite)
  useEffect(() => {
    if (viewMode !== 'world-map') return;
    // Rooms hidden in world view for performance; hide edges too
    setEdges([]);
  }, [viewMode, worldRooms, setEdges]);

  // Update currentZLevel when selected room changes to match its Z-level
  // Only update if currentZLevel doesn't match the selected room's Z-level
  // NOTE: currentZLevel NOT in deps - only sync when room selection changes, not when floor buttons are used
  useEffect(() => {
    if (viewMode !== 'zone') return;
    if (selectedRoomId == null) return;
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    if (
      selectedRoom &&
      selectedRoom.layoutZ != null &&
      selectedRoom.layoutZ !== currentZLevel
    ) {
      setCurrentZLevel(selectedRoom.layoutZ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId, rooms, viewMode]);

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
    if (hasInitialZoomedRef.current) {
      return;
    }
    if (!reactFlowInstanceRef.current) {
      return;
    }
    if (nodes.length === 0) {
      return;
    }

    // CRITICAL: Ensure nodes are from current zone, not stale nodes from previous zone
    // Check if we have rooms loaded for the current zone
    if (rooms.length === 0) {
      return;
    }

    // CRITICAL: Verify rooms are actually from the active zone, not stale data
    const firstRoom = rooms[0];
    if (firstRoom?.zoneId !== activeZoneId) {
      return;
    }

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

  // Fit world view to all zones/rooms when entering world-map
  useEffect(() => {
    if (viewMode !== 'world-map') return;
    if (!reactFlowInstanceRef.current) return;
    if (worldZoneBounds.length === 0 && worldRooms.length === 0) return;
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.1, duration: 600 });
    }, 120);
  }, [viewMode, worldZoneBounds, worldRooms]);

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

  const selectedRoom = useMemo(
    () => rooms.find(r => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const handleKeyboardMoveRoom = useCallback(
    async (direction: string) => {
      if (!isEditing) return;
      if (!selectedRoom) return;
      const delta = DIRECTION_DELTAS[direction];
      if (!delta) return;
      const currentLayoutX = selectedRoom.layoutX ?? 0;
      const currentLayoutY = selectedRoom.layoutY ?? 0;
      const currentLayoutZ = selectedRoom.layoutZ ?? 0;
      const nextX = currentLayoutX + delta.dx;
      const nextY = currentLayoutY + delta.dy;
      const nextZ = currentLayoutZ + (delta.dz ?? 0);
      const previousPosition = {
        x: gridToPixels(currentLayoutX),
        y: gridToPixelsY(currentLayoutY),
      };
      const newPosition = {
        x: gridToPixels(nextX),
        y: gridToPixelsY(nextY),
      };
      setNodes(ns =>
        ns.map(n =>
          n.id === selectedRoom.id.toString()
            ? { ...n, position: newPosition }
            : n
        )
      );
      setRooms(rs =>
        rs.map(r =>
          r.id === selectedRoom.id
            ? { ...r, layoutX: nextX, layoutY: nextY, layoutZ: nextZ }
            : r
        )
      );
      addToUndoHistory({
        type: 'MOVE_ROOM',
        timestamp: Date.now(),
        roomId: selectedRoom.id,
        previousPosition,
        newPosition,
      });
      setCurrentZLevel(nextZ);
      try {
        await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation UpdateRoomPosition($id:Int!,$position:UpdateRoomPositionInput!){ updateRoomPosition(id:$id, position:$position){ id layoutX layoutY layoutZ } }`,
            variables: {
              id: selectedRoom.id,
              position: {
                layoutX: nextX,
                layoutY: nextY,
                layoutZ: nextZ,
              },
            },
          }),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update room position'
        );
      }
    },
    [
      isEditing,
      selectedRoom,
      setNodes,
      setRooms,
      addToUndoHistory,
      authenticatedFetch,
    ]
  );

  const handleCreateRoomInDirection = useCallback(
    async (direction: string) => {
      if (!isEditing) return;
      if (!selectedRoom) return;
      const delta = DIRECTION_DELTAS[direction];
      if (!delta) return;
      const baseX = selectedRoom.layoutX ?? 0;
      const baseY = selectedRoom.layoutY ?? 0;
      const baseZ = selectedRoom.layoutZ ?? 0;
      const targetX = baseX + delta.dx;
      const targetY = baseY + delta.dy;
      const targetZ = baseZ + (delta.dz ?? 0);
      const existing = rooms.find(
        r =>
          r.zoneId === selectedRoom.zoneId &&
          (r.layoutX ?? 0) === targetX &&
          (r.layoutY ?? 0) === targetY &&
          (r.layoutZ ?? 0) === targetZ
      );
      if (existing) {
        setSelectedRoomId(existing.id);
        setCurrentZLevel(targetZ);
        return;
      }
      const newId = Math.max(0, ...rooms.map(r => r.id)) + 1;
      const tempRoom: Room = {
        id: newId,
        zoneId: selectedRoom.zoneId,
        name: `New Room ${newId}`,
        sector: selectedRoom.sector,
        roomDescription: 'An unfinished room awaits construction.',
        layoutX: targetX,
        layoutY: targetY,
        layoutZ: targetZ,
        exits: [],
        mobs: [],
        objects: [],
      };
      setRooms(rs => [...rs, tempRoom]);
      setSelectedRoomId(newId);
      setCurrentZLevel(targetZ);
      let roomCreated = false;
      try {
        const createResponse = await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation CreateRoom($data:CreateRoomInput!){ createRoom(data:$data){ id name roomDescription sector } }`,
            variables: {
              data: {
                id: newId,
                name: tempRoom.name,
                description: tempRoom.roomDescription || '',
                sector: tempRoom.sector,
                zoneId: tempRoom.zoneId,
              },
            },
          }),
        });
        const createJson = await createResponse.json();
        if (!createResponse.ok || createJson.errors) {
          throw new Error(
            createJson.errors?.[0]?.message || 'Failed to create room'
          );
        }
        roomCreated = true;
        await authenticatedFetch('/graphql', {
          method: 'POST',
          body: JSON.stringify({
            query: `mutation UpdateRoomPosition($id:Int!,$position:UpdateRoomPositionInput!){ updateRoomPosition(id:$id, position:$position){ id layoutX layoutY layoutZ } }`,
            variables: {
              id: newId,
              position: {
                layoutX: targetX,
                layoutY: targetY,
                layoutZ: targetZ,
              },
            },
          }),
        });

        const persistExit = async (
          fromRoomId: number,
          toRoomId: number,
          directionName: string
        ) => {
          const response = await authenticatedFetch('/graphql', {
            method: 'POST',
            body: JSON.stringify({
              query: `mutation CreateRoomExit($data:CreateRoomExitInput!){ createRoomExit(data:$data){ id direction toZoneId toRoomId description keywords key flags } }`,
              variables: {
                data: {
                  roomId: fromRoomId,
                  roomZoneId: selectedRoom.zoneId,
                  direction: directionName,
                  toZoneId: selectedRoom.zoneId,
                  toRoomId,
                },
              },
            }),
          });
          const json = await response.json();
          if (!response.ok || json.errors) {
            throw new Error(
              json.errors?.[0]?.message || 'Failed to create exit'
            );
          }
          const created = json.data.createRoomExit;
          setRooms(rs =>
            rs.map(r =>
              r.id === fromRoomId
                ? {
                    ...r,
                    exits: [
                      ...(r.exits || []),
                      {
                        id: created.id,
                        direction: created.direction,
                        toZoneId: created.toZoneId ?? null,
                        toRoomId: created.toRoomId ?? null,
                        description: created.description ?? null,
                        keywords: created.keywords ?? [],
                        key: created.key ?? null,
                        flags: created.flags ?? [],
                      },
                    ],
                  }
                : r
            )
          );
        };

        await persistExit(selectedRoom.id, newId, direction);
        const reverse = REVERSE_DIRECTIONS[direction];
        if (reverse) {
          await persistExit(newId, selectedRoom.id, reverse);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create room with exit'
        );
        if (!roomCreated) {
          setRooms(rs => rs.filter(r => r.id !== newId));
          setSelectedRoomId(selectedRoom.id);
          setCurrentZLevel(baseZ);
        } else {
          setSelectedRoomId(newId);
          setCurrentZLevel(targetZ);
        }
      }
    },
    [
      isEditing,
      selectedRoom,
      rooms,
      authenticatedFetch,
      setRooms,
      setSelectedRoomId,
      setCurrentZLevel,
    ]
  );

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
      const resolveDirection = (): string | null => {
        switch (key) {
          case 'ArrowUp':
            return 'NORTH';
          case 'ArrowDown':
            return 'SOUTH';
          case 'ArrowLeft':
            return 'WEST';
          case 'ArrowRight':
            return 'EAST';
          case 'PageUp':
            return 'UP';
          case 'PageDown':
            return 'DOWN';
          default:
            if (lowered === 'w') return 'NORTH';
            if (lowered === 's') return 'SOUTH';
            if (lowered === 'a') return 'WEST';
            if (lowered === 'd') return 'EAST';
            if (lowered === 'q') return 'NORTHWEST';
            if (lowered === 'e') return 'NORTHEAST';
            if (lowered === 'z') return 'SOUTHWEST';
            if (lowered === 'c') return 'SOUTHEAST';
            return null;
        }
      };

      const direction = resolveDirection();

      if (editorMode === 'edit' && isEditing && direction) {
        e.preventDefault();
        if (e.shiftKey) {
          handleCreateRoomInDirection(direction);
        } else {
          handleKeyboardMoveRoom(direction);
        }
        return;
      }

      if (editorMode === 'edit') return;
      // Navigation (arrows / WASD) only in zone view
      if (viewMode !== 'zone') return;
      if (!direction) return;
      if (!selectedRoom) return;
      const exits = selectedRoom.exits || [];
      console.log(
        '[Navigation Debug] Selected room exits:',
        selectedRoom.id,
        exits.map(e => ({
          dir: e.direction,
          toZone: e.toZoneId,
          toRoom: e.toRoomId,
        }))
      );
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
            const result = {
              roomId: ex.toRoomId,
              zoneId: ex.toZoneId ?? selectedRoom.zoneId,
            };
            console.log(
              '[Navigation Debug] Pick direction:',
              d,
              'exit:',
              ex,
              'result:',
              result,
              'current zone:',
              activeZoneId
            );
            return result;
          }
        }
        return null;
      };
      let nextDest: { roomId: number; zoneId: number | null } | null = null;
      switch (direction) {
        case 'NORTH':
          nextDest = pick('NORTH');
          break;
        case 'SOUTH':
          nextDest = pick('SOUTH');
          break;
        case 'WEST':
          nextDest = pick('WEST');
          break;
        case 'EAST':
          nextDest = pick('EAST');
          break;
        case 'UP':
          nextDest = pick('UP');
          break;
        case 'DOWN':
          nextDest = pick('DOWN');
          break;
        case 'NORTHWEST':
          nextDest = pick('NORTHWEST');
          break;
        case 'NORTHEAST':
          nextDest = pick('NORTHEAST');
          break;
        case 'SOUTHWEST':
          nextDest = pick('SOUTHWEST');
          break;
        case 'SOUTHEAST':
          nextDest = pick('SOUTHEAST');
          break;
      }
      if (nextDest && nextDest.roomId !== selectedRoomId) {
        console.log(
          '[Navigation Debug] Moving to:',
          nextDest,
          'from zone:',
          activeZoneId
        );
        // Handle cross-zone transition
        if (nextDest.zoneId != null && nextDest.zoneId !== activeZoneId) {
          console.log(
            '[Navigation Debug] Zone switch triggered:',
            activeZoneId,
            '→',
            nextDest.zoneId
          );
          console.log(
            '[Navigation Debug] Before setState - activeZoneId:',
            activeZoneId
          );
          setActiveZoneId(nextDest.zoneId);
          console.log('[Navigation Debug] After setActiveZoneId called');
          // Clear rooms to avoid displaying stale room edges until fetch completes
          setRooms([]);
        } else {
          console.log('[Navigation Debug] No zone switch:', {
            destZone: nextDest.zoneId,
            activeZone: activeZoneId,
            condition1: nextDest.zoneId != null,
            condition2: nextDest.zoneId !== activeZoneId,
          });
        }
        console.log(
          '[Navigation Debug] Before setSelectedRoomId:',
          nextDest.roomId
        );
        setSelectedRoomId(nextDest.roomId);
        console.log('[Navigation Debug] After setSelectedRoomId called');

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
    selectedRoom,
    viewMode,
    activeZoneId,
    currentZLevel,
    editorMode,
    isEditing,
    handleKeyboardMoveRoom,
    handleCreateRoomInDirection,
  ]);

  // Reflect selectedRoomId into React Flow's node selected state for visual highlight
  // This updates ONLY the selected property without regenerating positions
  useEffect(() => {
    setNodes(ns => {
      const nodeIdStr = selectedRoomId != null ? selectedRoomId.toString() : '';
      const updated = ns.map(n => {
        const isSelected = selectedRoomId != null && n.id === nodeIdStr;
        return {
          ...n,
          selected: isSelected,
        };
      });
      return updated;
    });
  }, [selectedRoomId, generatedNodes, setNodes]);

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
  const handleNodeDragStart = useCallback(
    (_: unknown, node: Node) => {
      if (!isEditing) return;
      isDraggingRef.current = true;
      dragOriginRef.current[node.id] = { ...node.position };
    },
    [isEditing]
  );

  // Drag stop persistence with undo history
  const handleNodeDragStop = useCallback(
    async (_: unknown, node: Node) => {
      if (!isEditing) return;
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
    [rooms, setNodes, addToUndoHistory, authenticatedFetch, isEditing]
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

  const nodeTypes = useMemo(
    () => ({
      room: RoomNode,
      portal: PortalNode,
      worldRoomDot: WorldRoomDotNode,
      zoneBoundary: ZoneBoundaryNode,
    }),
    []
  );

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
              {leftCollapsed ? '🗂️' : 'Entities'}
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
          {!leftCollapsed && activeZoneId !== null && (
            <EntityPanel
              mobs={allMobs}
              objects={allObjects}
              zoneId={activeZoneId}
              selectedEntity={selectedEntity}
              onSelectEntity={setSelectedEntity}
              onClearSelection={() => setSelectedEntity(null)}
              onMobDragStart={setDraggedMob}
              onObjectDragStart={setDraggedObject}
              viewMode={editorMode}
              panelWidth={leftPanelWidth}
            />
          )}
          <div
            onMouseDown={e => beginResize('left', e)}
            className='absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-300/40 active:bg-blue-400/40'
            title='Drag to resize'
          />
        </div>
      )}
      <div className='flex-1 h-full relative' ref={reactFlowRef}>
        <div className='absolute z-10 top-0 left-0 right-0'>
          <EditorToolbar
            viewMode={viewMode}
            onToggleViewMode={() =>
              setViewMode(m => (m === 'zone' ? 'world-map' : 'zone'))
            }
            loading={loading}
            error={error}
            currentZLevel={currentZLevel}
            onChangeZLevel={delta => setCurrentZLevel(z => z + delta)}
            minZLevel={floorRange.min}
            maxZLevel={floorRange.max}
            hideOtherFloors={hideOtherFloors}
            onToggleHideOtherFloors={() => setHideOtherFloors(h => !h)}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            editorMode={editorMode}
            onModeChange={mode => setEditorMode(mode)}
            canEdit={canEditCurrentZone}
            overlapCount={overlaps.length}
            showOverlapButton={isEditing && overlaps.length > 0}
            onToggleOverlapInfo={toggleOverlapInfo}
          />
        </div>
        <OverlapPanel
          visible={showOverlapInfo && isEditing && overlaps.length > 0}
          overlaps={overlaps}
          rooms={rooms.map(r => ({ id: r.id, name: r.name }))}
          onClose={toggleOverlapInfo}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodesDraggable={isEditing && isFullyInteractive}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onNodeDragStart={handleNodeDragStart}
          minZoom={viewMode === 'world-map' ? 0.02 : 0.1}
          maxZoom={viewMode === 'world-map' ? 6 : 2}
          onMove={(_, vp) => updateViewportThrottled(vp)}
          elementsSelectable={viewMode === 'zone' && isFullyInteractive}
          nodesConnectable={false}
          nodesFocusable={isFullyInteractive}
          onNodeClick={(_, node) => {
            if (viewMode === 'world-map') {
              const data = node.data as any;
              if (data?.zoneId != null && data?.isZoneBoundary) {
                setActiveZoneId(data.zoneId);
                setViewMode('zone');
                setSelectedRoomId(null);
                setCurrentZLevel(0);
                hasInitialZoomedRef.current = false;
                return;
              }
              if (data?.roomId != null && data?.zoneId != null) {
                setActiveZoneId(data.zoneId);
                setSelectedRoomId(data.roomId);
                setViewMode('zone');
                hasInitialZoomedRef.current = false;
                return;
              }
              return;
            }
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
          {loading && viewMode === 'world-map' && (
            <div className='absolute inset-0 z-20 flex items-center justify-center pointer-events-none'>
              <div className='flex items-center space-x-2 px-3 py-2 rounded-md bg-black/60 text-white text-xs shadow-lg'>
                <div className='animate-spin h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent' />
                <span>Rendering world…</span>
              </div>
            </div>
          )}
          {!isFullyInteractive && !loading && viewMode === 'zone' && (
            <div className='absolute top-4 right-4 z-20 pointer-events-none'>
              <div className='flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-500/80 text-white text-xs shadow-lg'>
                <div className='animate-pulse h-2 w-2 rounded-full bg-white' />
                <span>Initializing interactive mode…</span>
              </div>
            </div>
          )}
          <Background gap={24} />
          <Controls />
          <MiniMap
            nodeColor={node => {
              // Color nodes based on type and selection state
              if (node.selected) return '#3b82f6'; // Blue for selected
              if (node.type === 'worldRoomDot' && (node.data as any)?.color)
                return (node.data as any).color as string;
              if (node.type === 'zoneBoundary') return '#94a3b8';
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
                zones={worldZones}
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
                viewMode={editorMode}
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

      {/* Context-aware help modal */}
      <HelpModal
        open={helpOpen}
        onOpenChange={setHelpOpen}
        context='zone-editor'
      />

      {/* Go-to hint popup */}
      <GoToHint show={showGoToHint} />
    </div>
  );
};

const ZoneEditorOrchestrator: React.FC<ZoneEditorOrchestratorProps> = props => (
  <ZoneEditorOrchestratorFlow {...props} />
);

export default ZoneEditorOrchestrator;
export { ZoneEditorOrchestrator };
