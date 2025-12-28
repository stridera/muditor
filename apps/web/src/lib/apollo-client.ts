import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Configure cache with composite keys for entities that use (zoneId, id)
const cache = new InMemoryCache({
  typePolicies: {
    // Entities with composite primary keys (zoneId + id)
    MobDto: {
      keyFields: ['zoneId', 'id'],
    },
    ObjectDto: {
      keyFields: ['zoneId', 'id'],
    },
    RoomDto: {
      keyFields: ['zoneId', 'id'],
    },
    TriggerDto: {
      keyFields: ['zoneId', 'id'],
    },
    ShopDto: {
      keyFields: ['zoneId', 'id'],
    },
  },
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
