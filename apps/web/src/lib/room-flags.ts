// Room flags beyond the core set the zone editor always had (peaceful, death
// trap, magic, recall, summon, teleport). Each maps 1:1 to a `Room` column.

export interface RoomFlagFields {
  isIndoors?: boolean;
  isSoundproof?: boolean;
  isArena?: boolean;
  isGuildhall?: boolean;
  allowsMobs?: boolean;
  allowsTracking?: boolean;
  allowsPortals?: boolean;
  allowsScanning?: boolean;
  isInn?: boolean;
  innName?: string | null;
}

type BooleanRoomFlag = Exclude<keyof RoomFlagFields, 'innName'>;

export interface RoomFlagDef {
  field: BooleanRoomFlag;
  label: string;
  desc: string;
  defaultVal: boolean;
  /** true = the flag restricts something when it is OFF (shown red when off) */
  restrictsWhenOff: boolean;
}

export const EXTRA_ROOM_FLAGS: readonly RoomFlagDef[] = [
  {
    field: 'isIndoors',
    label: 'Indoors',
    desc: 'Weather and time of day do not reach this room',
    defaultVal: false,
    restrictsWhenOff: false,
  },
  {
    field: 'isSoundproof',
    label: 'Soundproof',
    desc: 'Shouts and gossip do not get in or out',
    defaultVal: false,
    restrictsWhenOff: false,
  },
  {
    field: 'isArena',
    label: 'Arena',
    desc: 'Safe player-vs-player room',
    defaultVal: false,
    restrictsWhenOff: false,
  },
  {
    field: 'isGuildhall',
    label: 'Guildhall',
    desc: 'Guild hall room',
    defaultVal: false,
    restrictsWhenOff: false,
  },
  {
    field: 'allowsMobs',
    label: 'Mobs can enter',
    desc: 'When off, wandering mobs stay out',
    defaultVal: true,
    restrictsWhenOff: true,
  },
  {
    field: 'allowsTracking',
    label: 'Tracking works',
    desc: 'The track spell can follow someone through this room',
    defaultVal: true,
    restrictsWhenOff: true,
  },
  {
    field: 'allowsPortals',
    label: 'Portals work',
    desc: 'Moonwell and portal spells can open here',
    defaultVal: true,
    restrictsWhenOff: true,
  },
  {
    field: 'allowsScanning',
    label: 'Scanning works',
    desc: 'The scan spell can see into this room',
    defaultVal: true,
    restrictsWhenOff: true,
  },
  {
    field: 'isInn',
    label: 'Inn',
    desc: 'Sells rentable rest',
    defaultVal: false,
    restrictsWhenOff: false,
  },
];

/** Every extra flag with its default filled in, from a possibly partial room. */
export function pickRoomFlags(
  r: RoomFlagFields
): Required<Omit<RoomFlagFields, 'innName'>> & { innName: string | null } {
  return {
    isIndoors: r.isIndoors ?? false,
    isSoundproof: r.isSoundproof ?? false,
    isArena: r.isArena ?? false,
    isGuildhall: r.isGuildhall ?? false,
    allowsMobs: r.allowsMobs ?? true,
    allowsTracking: r.allowsTracking ?? true,
    allowsPortals: r.allowsPortals ?? true,
    allowsScanning: r.allowsScanning ?? true,
    isInn: r.isInn ?? false,
    innName: r.innName ?? null,
  };
}

const FLAG_KEYS = [
  'isIndoors',
  'isSoundproof',
  'isArena',
  'isGuildhall',
  'allowsMobs',
  'allowsTracking',
  'allowsPortals',
  'allowsScanning',
  'isInn',
  'innName',
] as const;

/** The changed extra flags of a pending room edit, ready for `UpdateRoomInput`. */
export function collectRoomFlagEdits(
  edits: RoomFlagFields
): Record<string, boolean | string | null> {
  const out: Record<string, boolean | string | null> = {};
  for (const key of FLAG_KEYS) {
    const v = edits[key];
    if (v !== undefined) out[key] = v;
  }
  return out;
}
