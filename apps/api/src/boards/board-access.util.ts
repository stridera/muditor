import { UserRole } from '@muditor/db';
import { isStaff, roleAtLeast } from '../auth/role.util';
import { calculateRoleFromLevel } from '../users/services/role-calculator.service';

/**
 * Board privilege slots, in `Board.privileges` order (see schema.prisma and
 * the legacy board files: `privilege: <slot> <rule>`).
 */
export const BoardPrivilege = {
  READ: 0,
  WRITE_NEW: 1,
  REMOVE_OWN: 2,
  EDIT_OWN: 3,
  REMOVE_ANY: 4,
  EDIT_ANY: 5,
  WRITE_STICKY: 6,
  LOCK: 7,
} as const;
export type BoardPrivilege =
  (typeof BoardPrivilege)[keyof typeof BoardPrivilege];

const PRIVILEGE_BY_NAME: Record<string, BoardPrivilege> = {
  read: 0,
  writenew: 1,
  write: 1,
  removeown: 2,
  editown: 3,
  removeany: 4,
  editany: 5,
  writesticky: 6,
  sticky: 6,
  lock: 7,
};

/**
 * Who is asking. `characterLevels` are the levels of the account's linked
 * characters; level rules (2-99) are checked against them, so callers that
 * evaluate boards for a logged-in player must supply them (absent = none).
 */
export type BoardViewer =
  | {
      role?: UserRole | null | undefined;
      characterLevels?: readonly number[] | undefined;
    }
  | null
  | undefined;
type Viewer = BoardViewer;

/** A `level <min> <max>` rule below the staff levels: needs a matching character. */
interface LevelNeed {
  minLevel: number;
  maxLevel: number;
}
type Need = UserRole | true | null | LevelNeed;

/** Normalise a rule's privilege slot: 0-7, or a name such as "Read" / "WRITE_NEW". */
function privilegeOf(kind: unknown): BoardPrivilege | null {
  if (typeof kind === 'number' && kind >= 0 && kind <= 7) {
    return kind as BoardPrivilege;
  }
  if (typeof kind === 'string') {
    return PRIVILEGE_BY_NAME[kind.replace(/[\s_-]/g, '').toLowerCase()] ?? null;
  }
  return null;
}

/** Levels at or below this are open to everyone (legacy: players start at 1). */
const OPEN_LEVEL = 1;

/**
 * Minimum role a rule demands: `true` = everyone (even anonymous), a role =
 * that role or above, `null` = the rule cannot be evaluated here (class/clan/
 * name rules), which only staff satisfy.
 */
function ruleRequirement(rule: Record<string, unknown>): Need {
  const minRole = rule.minRole;
  if (
    typeof minRole === 'string' &&
    (Object.values(UserRole) as string[]).includes(minRole)
  ) {
    return minRole as UserRole;
  }
  // Legacy `level <min> <max>` rule. Staff levels map to the role that level
  // grants (the site role is derived from character level). Levels 2-99 grant
  // no role, so they need a linked character whose level is in [min, max].
  const level = rule.minLevel ?? rule.level;
  if (typeof level === 'number' && Number.isFinite(level)) {
    if (level <= OPEN_LEVEL) return true;
    const role = calculateRoleFromLevel(level);
    if (role !== UserRole.PLAYER) return role;
    const max = rule.maxLevel ?? rule.max;
    return {
      minLevel: level,
      maxLevel:
        typeof max === 'number' && Number.isFinite(max) ? max : Infinity,
    };
  }
  // A bare slot number or a rule with no restriction fields: open.
  if (rule.rule === undefined) return true;
  return null;
}

/** Slot and role requirement of one privilege entry, or null if malformed. */
function parseEntry(
  entry: unknown
): { priv: BoardPrivilege; need: Need } | null {
  if (typeof entry === 'number') {
    return entry >= 0 && entry <= 7
      ? { priv: entry as BoardPrivilege, need: true }
      : null;
  }
  if (!entry || typeof entry !== 'object') return null;
  const rule = entry as Record<string, unknown>;
  const priv = privilegeOf(rule.privilege ?? rule.type ?? rule.access);
  return priv === null ? null : { priv, need: ruleRequirement(rule) };
}

function satisfies(need: true | UserRole | LevelNeed, viewer: Viewer): boolean {
  if (need === true) return true;
  if (typeof need === 'string') return roleAtLeast(viewer?.role, need);
  if (!viewer) return false;
  // Staff outrank every player-level rule, whatever their characters' levels.
  if (isStaff(viewer.role)) return true;
  return (viewer.characterLevels ?? []).some(
    l => l >= need.minLevel && l <= need.maxLevel
  );
}

/**
 * Whether `viewer` holds board privilege `priv`.
 *
 * The board's rules for that privilege decide: a rule is satisfied when the
 * viewer's role is at least the role its level/minRole maps to (level <= 1 is
 * open to everyone; levels 2-99 need a linked character in the level range). Staff (IMMORTAL+) can always READ, and hold any other
 * privilege only where the board has no evaluable rule for it (a board with
 * no rule grants nothing to anyone else).
 */
export function hasBoardPrivilege(
  privileges: unknown,
  priv: BoardPrivilege,
  viewer: Viewer
): boolean {
  const staff = isStaff(viewer?.role);
  if (priv === BoardPrivilege.READ && staff) return true;
  let evaluable = false;
  for (const entry of Array.isArray(privileges) ? privileges : []) {
    const parsed = parseEntry(entry);
    if (!parsed || parsed.priv !== priv || parsed.need === null) continue;
    evaluable = true;
    if (satisfies(parsed.need, viewer)) return true;
  }
  return !evaluable && staff;
}

/**
 * Who may read a board on the website. Boards that grant READ are public
 * (optionally with a `minRole` / `level`); everything else (god, code, quest,
 * ... boards) is limited to the roles their rules name, else IMMORTAL+ only.
 */
export function canReadBoard(privileges: unknown, viewer: Viewer): boolean {
  return hasBoardPrivilege(privileges, BoardPrivilege.READ, viewer);
}
