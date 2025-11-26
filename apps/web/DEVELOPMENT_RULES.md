# Muditor Web App Development Rules

> **Purpose:** These rules ensure consistency, prevent common errors, and maintain architectural patterns across the codebase.

---

## 1. GraphQL Code Generation

### ✅ ALWAYS Use Codegen-Generated Code

**Rule:** Use GraphQL Codegen types, queries, and mutations instead of manually writing GraphQL.

**Why:** Type safety, automatic updates when schema changes, prevents typos and errors.

**Examples:**

✅ **Correct:**

```typescript
import { useQuery } from '@apollo/client/react';
import {
  GetZonesForSelectorDocument,
  type GetZonesForSelectorQuery,
} from '@/generated/graphql';

const { data } = useQuery(GetZonesForSelectorDocument);
type Zone = GetZonesForSelectorQuery['zones'][number];
```

❌ **Wrong:**

```typescript
import { gql } from '@apollo/client';

const GET_ZONES = gql`
  query GetZones {
    zones {
      id
      name
    }
  }
`;

interface Zone {
  id: number;
  name: string;
}
```

**When codegen is not available:**

1. Check if the query exists in `apps/api/src/**/*.graphql`
2. If not, add it to the appropriate `.graphql` file
3. Run `pnpm codegen` to generate types
4. Never use manual `gql` tags for production code

---

## 2. Server Management

### ✅ NEVER Kill or Restart Development Servers Automatically

**Rule:** Do not programmatically kill or restart `pnpm dev` processes. Instead, inform the user to restart manually.

**Why:**

- Prevents accidental data loss
- User may have custom server configurations
- Avoids port conflicts and zombie processes
- User maintains control over their development environment

**Examples:**

✅ **Correct:**

```
"The GraphQL schema has been updated. Please restart the development server:
1. Stop the server (Ctrl+C)
2. Run `pnpm dev` again"
```

❌ **Wrong:**

```bash
# Don't do this
pkill -f "pnpm dev"
pnpm dev &
```

**Exceptions:**

- Test environments (E2E tests can manage their own servers)
- Explicit user request: "please restart the server for me"

---

## 3. URL Parameter Naming Conventions

### ✅ ALWAYS Use Standardized Parameter Names

**Rule:** Use consistent, simple parameter names across all URLs and routes.

**Standard Names:**

- `zone` - Zone ID (NOT `zone_id`, `zoneId`)
- `room` - Room ID (NOT `room_id`, `roomId`)
- `id` - Entity ID for mobs, objects, shops, etc.

**Why:**

- Consistency prevents bugs
- Easier to remember and search
- Cleaner URLs
- Better user experience

**Examples:**

✅ **Correct:**

```typescript
// Zone editor
`/dashboard/zones/editor?zone=30&room=1`
// Mob editor
`/dashboard/mobs/editor?zone=30&id=45`
// Rooms list filtered by zone
`/dashboard/rooms?zone=30`;

// Reading parameters
const zone = searchParams.get('zone');
const room = searchParams.get('room');
```

❌ **Wrong:**

```typescript
// Inconsistent naming
`/dashboard/zones/editor?zone_id=30&room_id=1``/dashboard/mobs/editor?zoneId=30&mobId=45`;

const zone = searchParams.get('zone_id'); // Wrong parameter name
```

**Enforcement:**

- Run `grep -r "zone_id=" apps/` to check for violations
- All new URLs must follow this standard
- Update old URLs when touching related code

---

## 4. Composite Primary Keys

### ✅ ALWAYS Use Composite Keys (zone, vnum) for Entities

**Rule:** When specifying rooms, mobs, objects, or shops, always use the composite key format and validation helpers.

**Why:**

- Database uses composite primary keys `(zoneId, vnum)` for performance
- `room=0` is valid (room 0 exists in many zones)
- `Boolean(0)` is `false`, causing bugs if used as truthy check
- Validation helpers prevent invalid room references

**Database Schema:**

```sql
-- Rooms, Mobs, Objects, Shops all use composite keys
PRIMARY KEY (zoneId, id)
```

**Examples:**

✅ **Correct:**

```typescript
import {
  isValidRoomId,
  isValidZoneId,
  parseRoomReference,
} from '@/lib/room-utils';

// Parsing room references
const roomRef = '30:0'; // "zone:room" format
const { zoneId, roomId } = parseRoomReference(roomRef);

// Validating room IDs (handles room=0 correctly)
if (isValidRoomId(roomId)) {
  // ✅ Returns true for 0
  // Safe to use room
}

// Wrong - Boolean check fails for room 0
if (roomId) {
  // ❌ False for room=0!
  // This code won't run for valid room 0
}

// GraphQL queries with composite keys
const { data } = useQuery(GetRoomDocument, {
  variables: { zoneId: 30, id: 0 }, // ✅ Both parts of composite key
});

// URL format for room references
`/dashboard/zones/editor?zone=30&room=0`; // ✅ Separate parameters
```

❌ **Wrong:**

```typescript
// Wrong - Single ID without zone context
const roomId = 0;
if (roomId) {
  // ❌ Fails for room 0
  // Code won't execute
}

// Wrong - Truthy check on room ID
if (room) {
  // ❌ room=0 is valid but falsy
  fetchRoomData(room);
}

// Wrong - Missing zone context
`/dashboard/rooms/${roomId}`; // ❌ Which zone?
```

**Validation Helpers:**

```typescript
// Available in @/lib/room-utils
isValidZoneId(zoneId: number): boolean
isValidRoomId(roomId: number): boolean  // ✅ Returns true for 0
parseRoomReference(ref: string): { zoneId: number; roomId: number }
formatRoomReference(zoneId: number, roomId: number): string
```

**Common Patterns:**

```typescript
// ✅ Checking if room is defined (not if it's truthy)
if (roomId !== null && roomId !== undefined) {
  // Safe - handles room=0
}

// ✅ Using helper functions
if (isValidRoomId(roomId)) {
  // Safe - explicitly validates
}

// ✅ Composite key in React Flow nodes
const nodeId = `room-${zoneId}-${roomId}`; // ✅ Includes both IDs

// ✅ GraphQL mutations with composite keys
updateRoom({
  variables: {
    zoneId,
    id: roomId, // Can be 0
    data: { name: 'New Name' },
  },
});
```

---

## 5. Custom Hooks for Data Fetching

### ✅ ALWAYS Use Custom Hooks for Repeated GraphQL Queries

**Rule:** When the same GraphQL query is used in multiple components, create a custom hook.

**Why:**

- Prevents duplicate code
- Consistent caching via Apollo
- Automatic memoization prevents infinite renders
- Single source of truth

**Examples:**

✅ **Correct:**

```typescript
// hooks/use-zones-for-selector.ts
export function useZonesForSelector() {
  const { data, loading, error } = useQuery(GetZonesForSelectorDocument, {
    fetchPolicy: 'cache-first',
  });

  const zones = useMemo(() => data?.zones || [], [data?.zones]);

  return { zones, loading, error };
}

// Usage in components
const { zones, loading } = useZonesForSelector();
```

❌ **Wrong:**

```typescript
// Duplicated in every component
const { data } = useQuery(GetZonesForSelectorDocument);
const zones = data?.zones || []; // ❌ Creates new array every render
```

**When to Create a Hook:**

- Query used in 2+ components
- Data needs memoization
- Complex query logic
- Consistent error handling needed

**Hook Naming Convention:**

- `useZonesForSelector` - fetches data for selectors
- `useRoomsForZone` - fetches rooms for a specific zone
- `useMobsForZone` - fetches mobs for a specific zone

---

## 6. State Management Patterns

### ✅ Use Context for State, Hooks for Data

**Rule:** Separate application state (Context) from server data (Hooks + Apollo).

**Pattern:**

```typescript
// ✅ Context for USER STATE (what's selected)
const { selectedZone, setSelectedZone } = useZone();

// ✅ Hook for SERVER DATA (what exists)
const { zones, loading } = useZonesForSelector();
```

**When to Use Context:**

- Current user selection (selectedZone, selectedRoom)
- UI state (editMode, viewMode)
- User preferences (theme, layout)
- Authentication state

**When to Use Custom Hooks:**

- Fetching data from GraphQL
- Caching server responses
- Data transformations
- Loading states

❌ **Anti-pattern:**

```typescript
// Don't fetch data in Context
const ZoneProvider = () => {
  const [zones, setZones] = useState([]);
  useEffect(() => {
    fetch('/api/zones').then(setZones); // ❌ Wrong place
  }, []);
};
```

---

## 7. Error Handling

### ✅ ALWAYS Handle GraphQL Errors Gracefully

**Rule:** Display user-friendly error messages and provide recovery options.

**Examples:**

✅ **Correct:**

```typescript
const { data, loading, error } = useQuery(GetZonesDocument);

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return (
    <ErrorDisplay
      message="Failed to load zones"
      action={
        <button onClick={() => refetch()}>
          Try Again
        </button>
      }
    />
  );
}
```

❌ **Wrong:**

```typescript
const { data } = useQuery(GetZonesDocument);
// No loading state
// No error handling
// Will crash if query fails
```

---

## 8. Import Organization

### ✅ Group Imports by Type

**Rule:** Organize imports in a consistent order.

**Order:**

1. React and Next.js
2. Third-party libraries
3. GraphQL codegen
4. Internal hooks and utils
5. Components
6. Types
7. Styles

**Example:**

```typescript
// 1. React/Next.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { useQuery } from '@apollo/client/react';

// 3. GraphQL codegen
import { GetZonesDocument, type Zone } from '@/generated/graphql';

// 4. Hooks and utils
import { useZone } from '@/contexts/zone-context';
import { isValidRoomId } from '@/lib/room-utils';

// 5. Components
import { ZoneSelector } from '@/components/ZoneSelector';

// 6. Types (if not from codegen)
import type { CustomType } from './types';
```

---

## 9. Accessibility

### ✅ ALWAYS Include Accessibility Attributes

**Rule:** All interactive elements must have proper ARIA labels and keyboard support.

**Requirements:**

- Buttons must have descriptive labels
- Links must have clear destinations
- Forms must have proper labels
- Keyboard navigation must work
- Focus states must be visible

**Examples:**

✅ **Correct:**

```typescript
<button
  onClick={handleClick}
  aria-label="Edit room 0 in zone 30"
  title="Edit this room"
>
  Edit
</button>
```

❌ **Wrong:**

```typescript
<div onClick={handleClick}>Edit</div>  // ❌ Not keyboard accessible
```

---

## 10. Performance

### ✅ Memoize Expensive Computations

**Rule:** Use `useMemo` for expensive calculations and `useCallback` for functions passed as props.

**Examples:**

✅ **Correct:**

```typescript
const filteredRooms = useMemo(() => {
  return rooms.filter(room => room.zoneId === selectedZone);
}, [rooms, selectedZone]);

const handleRoomClick = useCallback(
  (roomId: number) => {
    if (isValidRoomId(roomId)) {
      selectRoom(roomId);
    }
  },
  [selectRoom]
);
```

❌ **Wrong:**

```typescript
// Recalculates every render
const filteredRooms = rooms.filter(room => room.zoneId === selectedZone);
```

---

## Quick Reference Checklist

Before submitting code, verify:

- [ ] Using GraphQL codegen types (not manual `gql` tags)
- [ ] Not killing/restarting dev servers programmatically
- [ ] URL parameters use `zone`, `room`, `id` (not `zone_id`, etc.)
- [ ] Room validation uses `isValidRoomId()` (not truthy checks)
- [ ] Composite keys used for all entity queries
- [ ] Common queries extracted to custom hooks
- [ ] Proper loading and error states
- [ ] Accessibility attributes included
- [ ] Expensive computations memoized
- [ ] Context used for state, hooks for data

---

## Enforcement

Run these checks before committing:

```bash
# Check for URL parameter violations
grep -r "zone_id=" apps/ | grep -v ".map"
grep -r "room_id=" apps/ | grep -v ".map"

# Check for manual GraphQL (should use codegen)
grep -r "const.*gql\`" apps/web/src/ | grep -v "test"

# Check for truthy room checks (should use isValidRoomId)
grep -r "if (room[^I]" apps/web/src/  # Catches "if (room)" but not "if (roomId)"
```

---

## Resources

- GraphQL Schema: `apps/api/src/**/*.graphql`
- Codegen Config: `apps/web/codegen.ts`
- Room Utils: `apps/web/src/lib/room-utils.ts`
- Context Providers: `apps/web/src/contexts/`
- Custom Hooks: `apps/web/src/hooks/`

---

**Last Updated:** 2024-11-25
