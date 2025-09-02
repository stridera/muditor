// World-related types for Muditor
export interface Zone {
  id: number;
  name: string;
  description?: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  zoneId: number;
}

export interface Mob {
  id: number;
  name: string;
  description: string;
  zoneId: number;
}

export interface WorldObject {
  id: number;
  name: string;
  description: string;
  zoneId: number;
}