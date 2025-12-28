import { authenticatedFetch } from '@/lib/authenticated-fetch';

interface UpdateMobInput {
  id: number;
  zoneId: number;
  data: {
    name?: string;
    level?: number;
    examineDescription?: string;
    roomDescription?: string;
    description?: string; // not in schema; kept for local mapping
  };
}

interface UpdateObjectInput {
  id: number;
  zoneId: number;
  data: {
    name?: string;
    level?: number;
    examineDescription?: string;
    roomDescription?: string;
  };
}

export async function updateMob(input: UpdateMobInput) {
  const { id, zoneId, data } = input;
  const gqlInput: Record<string, string | number> = {};
  if (data.name !== undefined) gqlInput.name = data.name;
  if (data.level !== undefined) gqlInput.level = data.level;
  if (data.examineDescription !== undefined)
    gqlInput.examineDescription = data.examineDescription;
  if (data.roomDescription !== undefined)
    gqlInput.roomDescription = data.roomDescription;
  // description maps to roomDescription if provided
  if (
    data.description !== undefined &&
    gqlInput.roomDescription === undefined
  ) {
    gqlInput.roomDescription = data.description;
  }

  const res = await authenticatedFetch(
    process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: `mutation UpdateMob($id: Int!, $zoneId: Int!, $data: UpdateMobInput!) {\n  updateMob(id: $id, zoneId: $zoneId, data: $data) {\n    id\n    name\n    level\n    roomDescription\n    examineDescription\n  }\n}`,
        variables: { id, zoneId, data: gqlInput },
      }),
    }
  );

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message || 'Mob update failed');
  }
  return json.data.updateMob;
}

export async function updateObject(input: UpdateObjectInput) {
  const { id, zoneId, data } = input;
  const gqlInput: Record<string, string | number> = {};
  if (data.name !== undefined) gqlInput.name = data.name;
  if (data.level !== undefined) gqlInput.level = data.level;
  if (data.examineDescription !== undefined)
    gqlInput.examineDescription = data.examineDescription;
  if (data.roomDescription !== undefined)
    gqlInput.roomDescription = data.roomDescription;

  const res = await authenticatedFetch(
    process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: `mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {\n  updateObject(id: $id, zoneId: $zoneId, data: $data) {\n    id\n    name\n    level\n    roomDescription\n    examineDescription\n  }\n}`,
        variables: { id, zoneId, data: gqlInput },
      }),
    }
  );

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message || 'Object update failed');
  }
  return json.data.updateObject;
}
