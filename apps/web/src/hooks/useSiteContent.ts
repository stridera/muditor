'use client';

import {
  AdminSiteContentsDocument,
  CreateSiteContentDocument,
  DeleteSiteContentDocument,
  UpdateSiteContentDocument,
  type AdminSiteContentsQuery,
  type SiteContentKind,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';

export type SiteContentItem = AdminSiteContentsQuery['siteContents'][number];

/** Slugs of PAGE content that map to a non-obvious public route. */
const PAGE_ROUTES: Record<string, string> = {
  rules: '/rules',
  'newbie-guide': '/play',
};

/** Public website path for a content row, or null if it has no public page. */
export function publicPathFor(
  kind: SiteContentKind,
  slug: string
): string | null {
  if (!slug) return null;
  if (kind === 'LORE') return `/lore/${slug}`;
  if (kind === 'NEWS') return `/news/${slug}`;
  return PAGE_ROUTES[slug] ?? null;
}

/** All site content including drafts (BUILDER+), optionally filtered by kind. */
export function useSiteContentList(kind?: SiteContentKind) {
  const { data, loading, error, refetch } = useQuery(
    AdminSiteContentsDocument,
    {
      variables: kind ? { kind } : {},
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    items: data?.siteContents ?? [],
    loading,
    error,
    refetch,
  };
}

/** Finds one content row by id (the API has no by-id query). */
export function useSiteContentById(id: string) {
  const { items, loading, error, refetch } = useSiteContentList();
  return {
    item: items.find(i => i.id === id) ?? null,
    loading,
    error,
    refetch,
  };
}

export function useSiteContentMutations() {
  const refetchQueries = ['AdminSiteContents'];
  const [create, { loading: creating }] = useMutation(
    CreateSiteContentDocument,
    { refetchQueries, awaitRefetchQueries: true }
  );
  const [update, { loading: updating }] = useMutation(
    UpdateSiteContentDocument,
    { refetchQueries, awaitRefetchQueries: true }
  );
  const [remove, { loading: deleting }] = useMutation(
    DeleteSiteContentDocument,
    { refetchQueries, awaitRefetchQueries: true }
  );
  return {
    create,
    update,
    remove,
    saving: creating || updating,
    deleting,
  };
}
