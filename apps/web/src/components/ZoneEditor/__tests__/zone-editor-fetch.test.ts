/**
 * The zone editor must send `Authorization: Bearer <token>` (the only
 * credential the API accepts) like every other authenticated call.
 */
import { graphqlRequestBody } from '@/lib/authenticated-fetch';
import { ZoneEditorUpdateRoomPositionDocument } from '@/generated/graphql';
import { zoneEditorFetch } from '../zone-editor-fetch';

describe('zoneEditorFetch', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;
    localStorage.setItem('auth-token', 'tok-123');
  });

  afterEach(() => localStorage.clear());

  it('attaches the Bearer token and resolves relative URLs against the API', async () => {
    await zoneEditorFetch('/graphql', { method: 'POST', body: '{}' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^http.*\/graphql$/);
    expect(init.headers.authorization).toBe('Bearer tok-123');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('omits Authorization when no token is stored', async () => {
    localStorage.clear();
    await zoneEditorFetch('/graphql');
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
  });

  it('serializes generated documents including the required zoneId', () => {
    const body = JSON.parse(
      graphqlRequestBody(ZoneEditorUpdateRoomPositionDocument, {
        zoneId: 30,
        id: 1,
        position: { layoutX: 1 },
      })
    );
    expect(body.query).toContain('mutation ZoneEditorUpdateRoomPosition');
    expect(body.query).toContain('$zoneId: Int!');
    expect(body.variables.zoneId).toBe(30);
  });
});
