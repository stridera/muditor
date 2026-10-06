'use client';

import { useQuery } from '@apollo/client/react';

import {
  PublicServerStatusDocument,
  PublicSiteContentDocument,
  PublicSiteContentsDocument,
  type SiteContentKind,
} from '@/generated/graphql';

export function useSiteContents(kind: SiteContentKind) {
  const { data, loading, error, refetch } = useQuery(
    PublicSiteContentsDocument,
    { variables: { kind } }
  );
  return { items: data?.siteContents ?? [], loading, error, refetch };
}

export function useSiteContent(slug: string) {
  const { data, loading, error, refetch } = useQuery(
    PublicSiteContentDocument,
    { variables: { slug } }
  );
  return { content: data?.siteContent ?? null, loading, error, refetch };
}

export function usePublicServerStatus() {
  const { data, loading, error } = useQuery(PublicServerStatusDocument, {
    pollInterval: 30_000,
    errorPolicy: 'all',
  });
  return { status: data?.publicServerStatus ?? null, loading, error };
}
