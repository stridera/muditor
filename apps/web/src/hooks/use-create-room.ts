'use client';

import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  CreateRoomDocument,
  type CreateRoomInput,
  type CreateRoomMutation,
} from '@/generated/graphql';

export type CreatedRoom = CreateRoomMutation['createRoom'];

/** Active queries refetched after a room is created. */
const REFETCH_QUERIES = ['GetRoomsByZone', 'GetZone'];

/**
 * Creates a room via the `createRoom` mutation, toasts the outcome and
 * refetches the active room lists. Resolves to the created room, or null when
 * creation failed (the error is toasted and returned via `error`).
 */
export function useCreateRoom() {
  const [mutate, { loading, error }] = useMutation(CreateRoomDocument, {
    refetchQueries: REFETCH_QUERIES,
  });

  const createRoom = useCallback(
    async (data: CreateRoomInput): Promise<CreatedRoom | null> => {
      try {
        const result = await mutate({ variables: { data } });
        const room = result.data?.createRoom ?? null;
        if (!room) {
          throw new Error('Room was not created');
        }
        toast.success(`Created room #${room.id} in zone ${room.zoneId}`);
        return room;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to create room'
        );
        return null;
      }
    },
    [mutate]
  );

  return { createRoom, loading, error };
}
