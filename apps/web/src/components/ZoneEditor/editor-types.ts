// Shared type definitions extracted from EnhancedZoneEditor

export interface ZoneBounds {
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

export interface WorldMapRoom {
  id: number;
  name: string;
  sector: string;
  zoneId: number;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
}

export interface ZoneMapData {
  zones: ZoneBounds[];
  rooms: WorldMapRoom[];
  globalBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export type ViewMode = 'world-map' | 'zone-overview' | 'room-detail';

export interface WorldMapZoneNode {
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

export interface WorldMapRoomNode {
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

// Room & related types (editor-local)
export interface RoomExit {
  id: string;
  direction: string;
  toZoneId: number | null;
  toRoomId: number | null;
  description?: string;
  keyword?: string;
}

export interface ShopRef {
  id: number;
  buyProfit: number;
  sellProfit: number;
  keeperId: number;
  zoneId: number;
}

export interface ZoneSummary {
  id: number;
  name: string;
  climate: string;
}
