import { print, type DocumentNode } from 'graphql';

export function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  return {
    'Content-Type': 'application/json',
    ...(token && { authorization: `Bearer ${token}` }),
  };
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Serialize a codegen-generated document (or raw string) plus variables into
 * a GraphQL-over-HTTP JSON request body.
 */
export function graphqlRequestBody(
  query: string | DocumentNode,
  variables?: unknown
): string {
  return JSON.stringify({
    query: typeof query === 'string' ? query : print(query),
    variables,
  });
}

export async function authenticatedGraphQLFetch(
  query: string | DocumentNode,
  variables?: any
): Promise<any> {
  const response = await authenticatedFetch(
    process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    {
      method: 'POST',
      body: graphqlRequestBody(query, variables),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data;
}
