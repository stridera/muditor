import type { SearchFilters } from '@/components/EnhancedSearch';
import type { ObjectType } from '@/generated/graphql';

/**
 * Translate EnhancedSearch filters into the server-side arguments of the paged
 * mob/object list queries. Anything the server cannot express is dropped, so
 * every filter the UI offers is applied before paging.
 */

/** Rows per page unless the URL says otherwise (`?per=`). */
export const DEFAULT_PAGE_SIZE = 50;

/** Level at which the "High Level Mobs" custom filter starts. */
export const HIGH_LEVEL_MIN = 50;
/** Level at which the "Newbie Friendly" custom filter ends. */
export const NEWBIE_LEVEL_MAX = 10;

export interface LevelRange {
  levelMin: number | null;
  levelMax: number | null;
}

function narrowRange(
  filters: SearchFilters,
  customMin: number | null,
  customMax: number | null
): LevelRange {
  const mins = [filters.levelMin, customMin].filter(
    (n): n is number => n != null
  );
  const maxs = [filters.levelMax, customMax].filter(
    (n): n is number => n != null
  );
  return {
    levelMin: mins.length ? Math.max(...mins) : null,
    levelMax: maxs.length ? Math.min(...maxs) : null,
  };
}

const isOn = (filters: SearchFilters, key: string) => {
  const v = filters.customFilters?.[key];
  return v === true || v === 'true';
};

/** Tri-state boolean filter: true/false when set (including 'false'), else null. */
export const boolFilter = (
  filters: SearchFilters,
  key: string
): boolean | null => {
  const v = filters.customFilters?.[key];
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return null;
};

/** Search text sent to the server (blank becomes null). */
export function searchText(filters: SearchFilters): string | null {
  return filters.searchTerm?.trim() || null;
}

export function mobFilterVars(filters: SearchFilters): LevelRange {
  return narrowRange(
    filters,
    isOn(filters, 'isHighLevel') ? HIGH_LEVEL_MIN : null,
    isOn(filters, 'isNewbie') ? NEWBIE_LEVEL_MAX : null
  );
}

export interface ObjectFilterVars extends LevelRange {
  types: ObjectType[] | null;
  costMin: number | null;
  weightMin: number | null;
  weightMax: number | null;
}

export function objectFilterVars(filters: SearchFilters): ObjectFilterVars {
  return {
    ...narrowRange(filters, null, null),
    types:
      filters.types && filters.types.length
        ? (filters.types.filter(t => t in OBJECT_TYPE_FLAGS) as ObjectType[])
        : null,
    costMin: isOn(filters, 'isValuable') ? 1000 : null,
    weightMin: isOn(filters, 'isHeavy') ? 50 : null,
    weightMax: isOn(filters, 'isLightweight') ? 5 : null,
  };
}

/** Page size from `?per=`, restricted to the offered options. */
export function pageSizeFrom(raw: string | null): number {
  const n = parseInt(raw ?? '', 10);
  return [10, 25, 50, 100].includes(n) ? n : DEFAULT_PAGE_SIZE;
}

export interface PageWindow {
  totalPages: number;
  /** 1-based index of the first row shown (0 when there are none). */
  startItem: number;
  endItem: number;
}

export function pageWindow(
  page: number,
  pageSize: number,
  total: number,
  shown: number
): PageWindow {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset = (page - 1) * pageSize;
  return {
    totalPages,
    startItem: shown > 0 ? offset + 1 : 0,
    endItem: offset + shown,
  };
}

// Keyed by ObjectType so the compiler flags any enum value added without a
// matching entry here (the paged list cannot discover types from loaded rows).
const OBJECT_TYPE_FLAGS: Record<ObjectType, true> = {
  ARMOR: true,
  BOARD: true,
  BOAT: true,
  CONTAINER: true,
  CORPSE: true,
  DISGUISE: true,
  DRINKCONTAINER: true,
  FIREWEAPON: true,
  FOOD: true,
  FOUNTAIN: true,
  INSTRUMENT: true,
  KEY: true,
  KIT: true,
  LIGHT: true,
  MISSILE: true,
  MONEY: true,
  NOTE: true,
  NOTHING: true,
  OTHER: true,
  PEN: true,
  PERFUME: true,
  POISON: true,
  PORTAL: true,
  POTION: true,
  ROPE: true,
  SCROLL: true,
  SPELLBOOK: true,
  STAFF: true,
  TOUCHSTONE: true,
  TRAP: true,
  TRASH: true,
  TREASURE: true,
  VEHICLE: true,
  WALL: true,
  WAND: true,
  WEAPON: true,
  WINGS: true,
  WORN: true,
};

/** Every object type, for the list page's type filter. */
export const OBJECT_TYPES_ALL = Object.keys(OBJECT_TYPE_FLAGS) as ObjectType[];
