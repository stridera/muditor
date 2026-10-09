import { UserRole } from '@muditor/db';
import { isStaff, roleAtLeast } from '../auth/role.util';

/** Privilege slot 0 in `Board.privileges` is READ (see schema.prisma). */
const BPRIV_READ = 0;

type Viewer = { role?: UserRole | null | undefined } | null | undefined;

/** True when a privilege entry grants READ: the bare number 0 or a rule object. */
function grantsRead(entry: unknown): UserRole | true | null {
  if (entry === BPRIV_READ) return true;
  if (entry && typeof entry === 'object') {
    const rule = entry as Record<string, unknown>;
    const kind = rule.privilege ?? rule.type ?? rule.access;
    if (kind === BPRIV_READ || kind === 'READ') {
      const minRole = rule.minRole;
      if (
        typeof minRole === 'string' &&
        (Object.values(UserRole) as string[]).includes(minRole)
      ) {
        return minRole as UserRole;
      }
      return true;
    }
  }
  return null;
}

/**
 * Who may read a board on the website. Boards that list the READ privilege are
 * public (optionally with a `minRole`); everything else (god, code, quest, ...
 * boards import with no privileges) is IMMORTAL+ only. Staff can read all.
 */
export function canReadBoard(privileges: unknown, viewer: Viewer): boolean {
  if (isStaff(viewer?.role)) return true;
  if (!Array.isArray(privileges)) return false;
  for (const entry of privileges) {
    const grant = grantsRead(entry);
    if (grant === true) return true;
    if (grant && roleAtLeast(viewer?.role, grant)) return true;
  }
  return false;
}
