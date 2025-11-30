// Centralized GraphQL mutations for ZoneEditor
// NOTE: Keep minimal types to avoid tight coupling; callers update local state.

export type AuthenticatedFetch = (
  url: string,
  init?: RequestInit
) => Promise<Response>;

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

interface UpdateRoomPositionArgs {
  id: number;
  position: { layoutX?: number; layoutY?: number; layoutZ?: number };
}

export async function updateRoomPositionMutation(
  fetchFn: AuthenticatedFetch,
  { id, position }: UpdateRoomPositionArgs
) {
  const response = await fetchFn(GRAPHQL_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query: `mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
        updateRoomPosition(id: $id, position: $position) {
          id
          layoutX
          layoutY
          layoutZ
        }
      }`,
      variables: { id, position },
    }),
  });
  const data = await response.json();
  if (!response.ok || data.errors)
    throw new Error(data.errors?.[0]?.message || `HTTP ${response.status}`);
  return data.data.updateRoomPosition;
}

interface UpdateRoomArgs {
  id: number;
  data: { name: string; description: string; sector: string };
}

export async function updateRoomMutation(
  fetchFn: AuthenticatedFetch,
  { id, data }: UpdateRoomArgs
) {
  const response = await fetchFn(GRAPHQL_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query: `mutation UpdateRoom($id: Int!, $data: UpdateRoomInput!) {
        updateRoom(id: $id, data: $data) {
          id
          name
          roomDescription
          sector
        }
      }`,
      variables: { id, data },
    }),
  });
  const json = await response.json();
  if (!response.ok || json.errors)
    throw new Error(json.errors?.[0]?.message || `HTTP ${response.status}`);
  return json.data.updateRoom;
}

interface CreateRoomArgs {
  data: {
    id: number;
    name: string;
    description: string;
    sector: string;
    zoneId: number | null;
  };
}

export async function createRoomMutation(
  fetchFn: AuthenticatedFetch,
  { data }: CreateRoomArgs
) {
  const response = await fetchFn(GRAPHQL_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query: `mutation CreateRoom($data: CreateRoomInput!) {
        createRoom(data: $data) {
          id
          name
          roomDescription
          sector
          layoutX
          layoutY
          layoutZ
          exits { id direction toZoneId toRoomId }
        }
      }`,
      variables: { data },
    }),
  });
  const json = await response.json();
  if (!response.ok || json.errors)
    throw new Error(json.errors?.[0]?.message || `HTTP ${response.status}`);
  return json.data.createRoom;
}

export async function deleteRoomMutation(
  fetchFn: AuthenticatedFetch,
  id: number
) {
  const response = await fetchFn(GRAPHQL_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query: `mutation DeleteRoom($id: Int!) { deleteRoom(id: $id) { id name } }`,
      variables: { id },
    }),
  });
  const json = await response.json();
  if (!response.ok || json.errors)
    throw new Error(json.errors?.[0]?.message || `HTTP ${response.status}`);
  return json.data.deleteRoom;
}
