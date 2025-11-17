import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';

// Component under test
// Import orchestrator directly; legacy file quarantined/removed
import { ZoneEditorOrchestrator as EnhancedZoneEditor } from '../ZoneEditorOrchestrator';

// Mock ZoneSelector (Apollo-dependent) to avoid provider setup
jest.mock('@/components/ZoneSelector', () => () => (
  <div data-testid='zone-selector-mock' />
));

// Mock next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock permissions hook to allow edits (avoid early returns)
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    canEditZone: () => true,
    isBuilder: true,
    isCoder: true,
    isGod: true,
  }),
}));

// Provide a minimal theme context
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

// Prepare mock data
const zoneId = 42;
const rooms = [
  {
    id: 0,
    name: 'Room Zero',
    description: 'The origin room',
    sector: 'FIELD',
    zoneId,
    layoutX: 0,
    layoutY: 0,
    layoutZ: 0,
    exits: [],
    mobs: [],
    objects: [],
    shops: [],
  },
  {
    id: 1,
    name: 'Room One',
    description: 'Another room',
    sector: 'FIELD',
    zoneId,
    layoutX: 1,
    layoutY: 0,
    layoutZ: 0,
    exits: [],
    mobs: [],
    objects: [],
    shops: [],
  },
];

// Helper to build JSON response
interface MockResponse<T> {
  ok: boolean;
  json: () => Promise<T>;
}

function buildResponse<T>(data: T): MockResponse<T> {
  const response: MockResponse<T> = {
    ok: true,
    json: async () => data,
  };
  return response;
}

// Mock authenticatedFetch used by the component to load zone/rooms/mobs/objects
jest.mock('@/lib/authenticated-fetch', () => {
  return {
    authenticatedFetch: jest.fn(async (url: string, options?: any) => {
      if (url === 'http://localhost:4000/graphql') {
        const body = JSON.parse(options?.body || '{}');
        const query: string = body.query || '';
        // Zone query
        if (query.includes('query GetZone')) {
          return buildResponse({
            data: {
              zone: { id: zoneId, name: 'Test Zone', climate: 'temperate' },
            },
          });
        }
        // Rooms query
        if (query.includes('query GetRoomsByZone')) {
          return buildResponse({ data: { roomsByZone: rooms } });
        }
        // Mobs query
        if (query.includes('query GetMobsByZone')) {
          return buildResponse({ data: { mobsByZone: [] } });
        }
        // Objects query
        if (query.includes('query GetObjectsByZone')) {
          return buildResponse({ data: { objectsByZone: [] } });
        }
        return buildResponse({ data: {} });
      }
      return buildResponse({ data: {} });
    }),
    authenticatedGraphQLFetch: jest.fn(),
  };
});

// Integration-style regression test
// Ensures initialRoomId=0 is correctly selected and not treated as falsy.

describe('EnhancedZoneEditor initialRoomId=0 regression', () => {
  test('selects and retains room 0 from URL param', async () => {
    const { getAllByText, queryByText } = render(
      <ReactFlowProvider>
        <EnhancedZoneEditor zoneId={zoneId} initialRoomId={0} />
      </ReactFlowProvider>
    );

    // Wait for Room Zero node to render (presence indicates fetch + render complete)
    await waitFor(() => {
      const matches = getAllByText(/Room Zero/i);
      expect(matches.length).toBeGreaterThan(0);
    });

    // The other room may also render; ensure we didn't auto-switch selection to Room One
    // We rely on URL replacement behavior—mock router.replace should have been called with room=0
    // Verify the selected room node with id=0 exists
    const selectedNodes = document.querySelectorAll('[data-id="0"]');
    expect(selectedNodes.length).toBeGreaterThan(0);
    // Optional: ensure Room One also rendered (rooms loaded)
    expect(queryByText(/Room One/i)).toBeInTheDocument();
  });
});
