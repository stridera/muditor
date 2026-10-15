# Muditor permissions reference

Who can view and edit what. Derived from the actual guards in `apps/api/src`
(`@MinimumRole`, `@Roles`, `@RequireZoneWrite`, `OptionalJwtAuthGuard`) and the
gating in `apps/web/src`. The API is the source of truth: the web UI only hides
controls, the API refuses the write regardless.

Last audited: 2026-10-14. Re-derive when adding a resolver (see "Keeping this
current" at the bottom).

## Roles and game levels

A user's role is the highest role implied by the maximum level of their linked
characters (`apps/api/src/users/services/role-calculator.service.ts`,
`calculateRoleFromLevel`). Roles are a ladder: every check is "this role or
above" (`apps/api/src/auth/role.util.ts`, `apps/web/src/lib/roles.ts`); never
compare a role with `===`.

| Role         | Game level | Notes                                                                |
| ------------ | ---------- | -------------------------------------------------------------------- |
| PLAYER       | below 100  | Public site and own characters only                                  |
| IMMORTAL     | 100        | Staff. Reads everything below; no world writes                       |
| BUILDER      | 101-102    | Writes only in zones they hold a WRITE/ADMIN grant on                |
| HEAD_BUILDER | 103        | Bypasses zone grants; manages grants and class/race content          |
| CODER        | 104        | Game systems (effects, socials, system messages, game config), users |
| IMPLEMENTOR  | 105+       | Everything; the only role that can mint or demote IMPLEMENTORs       |

A role is only ever lowered automatically by recalculation; a raise happens
when a user proves ownership of a character by linking it (see the class doc
in `role-calculator.service.ts`).

## Zone grants

Builders (101-102) can only change content inside zones they have been granted.
Grants live in `UserGrants` (resource type ZONE) and are managed on the Zone
Grants admin page (HEAD_BUILDER+).

- Permissions are `READ`, `WRITE`, `DELETE`, `ADMIN`. `ADMIN` implies all of
  them. A grant may have an expiry; an expired grant counts as no grant.
- `@RequireZoneWrite()` (`common/decorators/zone-scope.decorator.ts`) puts
  `MinimumRole(BUILDER)` plus `ZonePermissionGuard` on a mutation:
  - HEAD_BUILDER and above: allowed, grants are bypassed.
  - BUILDER: needs a live `WRITE` (or `ADMIN`) grant on every zone the mutation
    touches. The zones are read from the mutation arguments (`zoneId`, or the
    keys named in the decorator, or a surrogate-id lookup such as a reset or
    room-exit id). If no zone can be derived the request is denied (fail
    closed). A builder with no grants at all gets "No zone grants assigned".
  - IMMORTAL and PLAYER: denied.
- In the web UI `usePermissions().canEditZone(zoneId)` mirrors this rule and
  `canEditAnyZone` is true for HEAD_BUILDER+ or a builder with at least one live
  WRITE/ADMIN grant.
- Only `WRITE` and `ADMIN` have any effect. `READ` and `DELETE` grants are
  stored but no guard looks at them (reads are public, see below).
- Creating a zone as a BUILDER auto-grants the creator `ADMIN` on it.
- The god-zone and internal-zone flags on a zone can only be changed by
  HEAD_BUILDER+, even with a WRITE grant.

## Reads: public API, staff UI

World-content reads are served with `OptionalJwtAuthGuard`: they work without a
token (the public site, the world map, and the mob/object editors depend on
them), and the token, when present, only decides what is hidden.

- Trigger/script reads (`triggers`, `trigger`, by-zone, by-attachment,
  needs-review) are public at the API level. The mob and object editors and the
  TriggerManager call them. The restriction is on the **Scripts page** (staff
  only) and on **writes**, not on the queries.
- God zones (`Zones.isGodZone`) are hidden from anonymous callers and PLAYER
  accounts, for zones and for everything inside them (rooms, mobs, objects,
  shops, quests, dialogue trees, resets, triggers). The rule is one function,
  `common/god-zone-visibility.ts` (`hidesGodZones` = not `isStaff`, where staff
  is IMMORTAL or above). The game uses the same rule
  (`fierymud-rs/crates/mud-server/src/room_access.rs`: `is_immortal` = account
  role at least Immortal, and god-zone rooms, `where`, `vlist` are hidden from
  mortals). So an IMMORTAL sees god zones in Muditor exactly as they would in
  game.

## What each role can do, by area

"View" is the lowest role that sees it in the UI; the API read column says what
the API itself requires. "Edit" is the API requirement for the write.
`zone-W` means BUILDER with a WRITE/ADMIN grant on the zone, or HEAD_BUILDER+.

| Area                                                                              | API read                                                           | View in UI                      | Edit (API)                                                       | Notes                                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Zones                                                                             | public (god zones: IMMORTAL+)                                      | IMMORTAL                        | create/update/delete: zone-W; god/internal flag: HEAD_BUILDER    | New-zone page is HEAD_BUILDER only in the UI                                                                                      |
| Rooms, exits, room positions                                                      | public (god zones: IMMORTAL+)                                      | IMMORTAL                        | zone-W                                                           |                                                                                                                                   |
| Mobs, mob resets, mob default effects                                             | public (god zones: IMMORTAL+)                                      | IMMORTAL                        | zone-W                                                           | `mobCombatDefaults` read needs BUILDER                                                                                            |
| Objects, object resets, abilities, effects, resistances                           | public (god zones: IMMORTAL+)                                      | IMMORTAL                        | zone-W                                                           |                                                                                                                                   |
| Shops                                                                             | public (god zones: IMMORTAL+)                                      | IMMORTAL                        | zone-W                                                           |                                                                                                                                   |
| Quests, phases, dialogue trees, rewards                                           | public (god zones: IMMORTAL+)                                      | IMMORTAL                        | zone-W (zone of the quest)                                       | `findCharacterQuests`/available quests need login (own data)                                                                      |
| Scripts (triggers)                                                                | public (god zones: IMMORTAL+)                                      | IMMORTAL (all zones, read-only) | create/update/delete/attach/mark reviewed: zone-W                | Scripts page: list, open and read for any IMMORTAL+; edit, new, delete, mark-reviewed controls only on zones the viewer can write |
| Mob AI rules (per mob)                                                            | IMMORTAL                                                           | IMMORTAL                        | zone-W                                                           |                                                                                                                                   |
| Class AI rules                                                                    | IMMORTAL                                                           | IMMORTAL                        | HEAD_BUILDER                                                     |                                                                                                                                   |
| Abilities (spells and skills), targeting, saving throws, messages, sphere colours | IMMORTAL                                                           | IMMORTAL                        | update/delete: BUILDER; create: CODER                            | Not zone-scoped: any BUILDER edits any ability                                                                                    |
| Effect-type definitions (Effects page)                                            | IMMORTAL                                                           | IMMORTAL                        | create/update/delete: CODER                                      |                                                                                                                                   |
| Effect auras                                                                      | IMMORTAL                                                           | IMMORTAL                        | BUILDER                                                          |                                                                                                                                   |
| Creation recipes                                                                  | IMMORTAL                                                           | IMMORTAL                        | BUILDER                                                          |                                                                                                                                   |
| Status flag values                                                                | IMMORTAL                                                           | IMMORTAL                        | BUILDER                                                          |                                                                                                                                   |
| Spell syllables                                                                   | IMMORTAL                                                           | IMMORTAL                        | BUILDER                                                          |                                                                                                                                   |
| Spell circles (recover time)                                                      | IMMORTAL                                                           | IMMORTAL                        | BUILDER                                                          |                                                                                                                                   |
| Weather text                                                                      | IMMORTAL                                                           | IMMORTAL                        | BUILDER                                                          |                                                                                                                                   |
| Mount types                                                                       | IMMORTAL                                                           | no UI page                      | CODER                                                            | API only                                                                                                                          |
| Classes (and class skills, circles)                                               | public                                                             | any                             | update/delete/skills/circles: HEAD_BUILDER; create: CODER        | UI shows edit controls to BUILDER+, see inconsistencies                                                                           |
| Races (and race skills)                                                           | public                                                             | any                             | update/delete/skills: HEAD_BUILDER; create: CODER                | same UI mismatch as classes                                                                                                       |
| Commands                                                                          | list: BUILDER; one command / immortal commands: CODER              | BUILDER                         | help text: BUILDER; flags/permissions: CODER                     |                                                                                                                                   |
| Socials                                                                           | IMMORTAL                                                           | CODER (nav)                     | CODER                                                            |                                                                                                                                   |
| System messages                                                                   | IMMORTAL                                                           | CODER (nav)                     | CODER                                                            |                                                                                                                                   |
| Help entries                                                                      | public                                                             | any                             | create/update: BUILDER; delete: CODER                            |                                                                                                                                   |
| Site content (public pages)                                                       | public                                                             | public site                     | BUILDER                                                          |                                                                                                                                   |
| Boards                                                                            | public                                                             | any                             | login required; per-board rules in `boards/board-access.util.ts` |                                                                                                                                   |
| Game config: configs, levels, system text, login messages                         | CODER                                                              | CODER                           | CODER                                                            | `settings.resolver.ts`, whole class is CODER except commands                                                                      |
| Reports (player bug reports)                                                      | IMMORTAL                                                           | IMMORTAL                        | HEAD_BUILDER                                                     |                                                                                                                                   |
| Reserved names                                                                    | HEAD_BUILDER                                                       | HEAD_BUILDER                    | HEAD_BUILDER                                                     |                                                                                                                                   |
| Zone grants (list, create, update, delete, grant/revoke)                          | list all/mine: BUILDER; per-user and grantable users: HEAD_BUILDER | HEAD_BUILDER                    | HEAD_BUILDER                                                     | Builders can read their own grants (`myZoneGrants`)                                                                               |
| Accounts page (users, ban history)                                                | IMMORTAL                                                           | IMMORTAL                        | ban/unban: IMMORTAL (must outrank target)                        | Read-only for non-CODER                                                                                                           |
| Users admin (role, delete, unlink character, reset link, update user)             | IMMORTAL                                                           | CODER (Users nav)               | CODER                                                            | Rank rules: CODER only below own role; only IMPLEMENTOR mints roles on lower ranks, never touches another IMPLEMENTOR             |
| Validation                                                                        | BUILDER                                                            | IMMORTAL                        | n/a                                                              | See inconsistencies                                                                                                               |
| Game bridge (live chat, admin commands, events)                                   | PLAYER+ for chat/events                                            | per feature                     | admin commands: BUILDER or CODER                                 | `bridge/*.resolver.ts`                                                                                                            |

## Web UI gating at a glance

`PermissionGuard` pages: zones list/detail/world-map, rooms, mobs, objects,
shops, quests, quests editor, effects (all IMMORTAL); zones editor and new zone
(BUILDER, the new-zone page then requires HEAD_BUILDER); validation
(`canViewValidation`); users (`canManageUsers`). Scripts uses its own gate
(IMMORTAL). Other pages (abilities, races, classes, help, socials, ...) have no
page guard and show or hide edit controls from `isBuilder` / `isHeadBuilder` /
`isCoder`; the API is what actually enforces.

The Scripts page (this is the rule since the staff read-only change):

- IMMORTAL (100) and above: sidebar entry, list, search (including script
  source), open and read any script in any zone, including god zones.
- Edit, New Script, Delete, and Mark as reviewed appear only for zones the
  viewer can write (`canEditZone`). A script in another zone opens read-only
  (Monaco read-only, properties disabled, no Save).
- The API enforces the same rule on every trigger write (`@RequireZoneWrite`).

## Inconsistencies found in this audit

1. Classes and races: the UI shows edit controls to BUILDER and above
   (`canEdit = isBuilder || isCoder`), but the API requires HEAD_BUILDER for
   update/delete/skill changes and CODER for create. A builder sees buttons
   that fail.
2. Validation: the page and the `canViewValidation` flag open it to IMMORTAL,
   but the API resolver requires BUILDER, so an immortal sees the page and its
   queries are refused.
3. Zone delete: `deleteZone` only needs a WRITE grant (or ADMIN), so a builder
   with a plain WRITE grant can delete the whole zone. `DELETE` grants are not
   consulted anywhere.
4. Zone create by a BUILDER: `createZone` runs `@RequireZoneWrite({keys:['id']})`,
   so the builder must already hold a WRITE grant on the id being created; the
   auto-ADMIN grant afterwards only helps if the zone id was pre-granted. The
   UI sidesteps this by limiting the new-zone page to HEAD_BUILDER.
5. Read levels differ between sibling tables without a stated reason: commands
   list needs BUILDER while abilities, socials and system messages need IMMORTAL;
   socials and system messages are IMMORTAL-readable at the API but their nav
   entries are CODER only.
6. Ability edits are not zone-scoped: any BUILDER can edit any ability's
   targeting, messages and effects; only creating one needs CODER.
7. Public trigger reads include the Lua source for any non-god zone. This is
   deliberate (editors depend on it) but means script text is world-readable.
8. `READ` and `DELETE` zone-grant permissions are accepted by the grants admin
   but have no effect.

## Keeping this current

Re-derive the table when resolvers change:

```bash
grep -rnE "@MinimumRole|@Roles|@RequireZoneWrite|OptionalJwtAuthGuard" apps/api/src --include=*.resolver.ts
```

Resolver guard tests live next to each resolver (`*.guards.spec.ts`,
`*.authz.spec.ts`, `common/test/resolver-guard-assertions.ts`).
