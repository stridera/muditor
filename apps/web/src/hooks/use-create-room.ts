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

export interface CreateRoomResult {
  room: CreatedRoom | null;
  /** Server/client error message when creation failed. */
  error: string | null;
}

/**
 * Creates a room via the `createRoom` mutation, toasts the outcome and
 * refetches the active room lists. Resolves to `{ room }` on success or
 * `{ room: null, error }` on failure (the error is also toasted).
 */
export function useCreateRoom() {
  const [mutate, { loading, error }] = useMutation(CreateRoomDocument, {
    refetchQueries: REFETCH_QUERIES,
  });

  const createRoom = useCallback(
    async (data: CreateRoomInput): Promise<CreateRoomResult> => {
      try {
        const result = await mutate({ variables: { data } });
        const room = result.data?.createRoom ?? null;
        if (!room) {
          throw new Error('Room was not created');
        }
        toast.success(`Created room #${room.id} in zone ${room.zoneId}`);
        return { room, error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create room';
        toast.error(message);
        return { room: null, error: message };
      }
    },
    [mutate]
  );

  return { createRoom, loading, error };
}
