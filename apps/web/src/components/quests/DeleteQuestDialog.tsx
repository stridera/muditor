'use client';

import { ColoredTextInline } from '@/components/ColoredTextViewer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DeleteQuestDocument } from '@/generated/graphql';
import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';

export interface QuestToDelete {
  zoneId: number;
  id: number;
  name: string;
}

interface DeleteQuestDialogProps {
  /** The quest awaiting confirmation; null keeps the dialog closed. */
  quest: QuestToDelete | null;
  onClose: () => void;
  /** Called after the server confirmed the deletion. */
  onDeleted: (quest: QuestToDelete) => void;
}

/**
 * Confirmation step for deleting a quest. The server enforces who may delete
 * (a BUILDER needs a WRITE grant on the quest's zone; HEAD_BUILDER and above
 * always may), so a refusal is shown in the dialog instead of closing it.
 */
export function DeleteQuestDialog({
  quest,
  onClose,
  onDeleted,
}: DeleteQuestDialogProps) {
  const [deleteQuest, { loading }] = useMutation(DeleteQuestDocument);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [quest?.zoneId, quest?.id]);

  const confirm = async () => {
    if (!quest) return;
    setError('');
    try {
      await deleteQuest({ variables: { zoneId: quest.zoneId, id: quest.id } });
      onDeleted(quest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quest.');
    }
  };

  return (
    <AlertDialog
      open={quest !== null}
      onOpenChange={open => {
        if (!open && !loading) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete quest</AlertDialogTitle>
          <AlertDialogDescription>
            Delete{' '}
            <strong>
              {quest ? <ColoredTextInline markup={quest.name} /> : null}
            </strong>{' '}
            ({quest?.zoneId}:{quest?.id})? Its phases, objectives, rewards and
            prerequisites are removed, and so is every player&apos;s progress on
            it. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={event => {
              // Keep the dialog open until the server answers.
              event.preventDefault();
              void confirm();
            }}
            className='bg-destructive hover:bg-destructive/90'
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
