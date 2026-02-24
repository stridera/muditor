import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const graphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql';

const httpLink = createHttpLink({
  uri: graphqlUrl,
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

// WebSocket link for GraphQL subscriptions
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: graphqlUrl.replace(/^http/, 'ws'),
          connectionParams: () => {
            const token = localStorage.getItem('auth-token');
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        })
      )
    : null;

// Split link: subscriptions go through WebSocket, everything else through HTTP
const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

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
    QuestDto: {
      keyFields: ['zoneId', 'id'],
    },
    QuestPhaseDto: {
      keyFields: ['questZoneId', 'questId', 'id'],
    },
    QuestObjectiveDto: {
      keyFields: ['questZoneId', 'questId', 'phaseId', 'id'],
    },
  },
});

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
});
