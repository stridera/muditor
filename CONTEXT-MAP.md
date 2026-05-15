# Context Map

Monorepo of five projects sharing one PostgreSQL database. Each
sub-project has its own domain language, but the **schema** itself is
shared vocabulary owned by Muditor (the schema source of truth lives
at `packages/db/prisma/schema.prisma`). Schema terms are defined in
[Muditor's CONTEXT.md](./CONTEXT.md); other contexts conform.

This file lives inside the Muditor repo for version-control
purposes but describes the broader `~/Code/mud/` monorepo.
Relative paths to sibling projects use `../`.

## Contexts

- [**Muditor**](./CONTEXT.md) — TypeScript/Next.js web editor for world building. Owns the shared Prisma schema and the canonical schema vocabulary (StatModifier, Effect, etc.).
- **fierymud-rs** (`../fierymud-rs/`) — Rust ECS rewrite of the live game server. In-progress replacement for the C++ FieryMUD. CONTEXT.md created lazily.
- **fierylib** (`../fierylib/`) — Python one-time importer that converts legacy CircleMUD text files into the shared Postgres database. CONTEXT.md created lazily.
- **fierymud** (`../fierymud/`) — C++23 MUD server (the current live runtime). Slated for replacement by fierymud-rs. CONTEXT.md created lazily.
- **fierymud_legacy** (`../fierymud_legacy/`) — Original CircleMUD codebase. Read-only reference; not part of active development.

## Relationships

- **fierylib → Postgres**: fierylib parses legacy `lib/` files and writes them into the shared DB. One-shot, not a sync loop. Conversion of legacy → modern values happens *here* (see [[project-legacy-value-removal]]); the DB never stores legacy values.
- **Muditor ↔ Postgres**: Muditor is the authoring UI. Reads and writes the shared DB.
- **fierymud-rs ← Postgres**: fierymud-rs loads world data at startup. Persists player state back to the DB.
- **fierymud ← Postgres**: same as above; the C++ runtime and the Rust runtime both read the same world data and write to the same player tables. They are NOT run simultaneously.
- **Muditor ↔ fierymud-rs**: admin operations on a running fierymud-rs server go through its HTTP admin port (`127.0.0.1:8080`, `mcp__fierymud__*` tools). Plain HTTP/JSON under `/api/admin/*`; bearer auth via `ADMIN_TOKEN`.

## Notes

- This is a pre-release dev project. No backwards-compatibility layers anywhere — see [[project-legacy-value-removal]] and [[project-predeployment]].
- The composite primary key `(zoneId, id)` is universal across world entities. Legacy ID `3045` → `(zoneId: 30, id: 45)`. Zone 0 maps to zone 1000.
