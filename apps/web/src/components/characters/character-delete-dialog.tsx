'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

const DELETE_CHARACTER_MUTATION = gql`
  mutation DeleteCharacterInline($id: ID!) {
    deleteCharacter(id: $id) {
      id
      name
    }
  }
`;

interface CharacterDeleteDialogProps {
  characterId: string;
  characterName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCharacterDeleted: () => void;
}

interface DeleteCharacterMutationResult {
  deleteCharacter: {
    id: string;
    name: string;
  };
}

export function CharacterDeleteDialog({
  characterId,
  characterName,
  open,
  onOpenChange,
  onCharacterDeleted,
}: CharacterDeleteDialogProps) {
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [deleteCharacter, { loading }] =
    useMutation<DeleteCharacterMutationResult>(DELETE_CHARACTER_MUTATION);

  const handleDelete = async () => {
    setError(null);

    // Require exact name match for confirmation
    if (confirmName !== characterName) {
      setError(
        `Please type the character name "${characterName}" exactly to confirm deletion.`
      );
      return;
    }

    try {
      await deleteCharacter({
        variables: { id: characterId },
      });

      // Reset state
      setConfirmName('');
      onOpenChange(false);
      onCharacterDeleted();
    } catch (err: any) {
      setError(err.message || 'Failed to delete character');
    }
  };

  const handleCancel = () => {
    setConfirmName('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
            <Trash2 className='h-5 w-5' />
            Delete Character
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-4'>
            <p>
              You are about to permanently delete the character{' '}
              <span className='font-bold'>{characterName}</span>. This action
              cannot be undone.
            </p>
            <p className='text-sm'>
              All character data including items, effects, and progression will
              be lost forever.
            </p>

            <div className='space-y-2'>
              <Label htmlFor='confirmName'>
                Type <span className='font-bold'>{characterName}</span> to
                confirm:
              </Label>
              <Input
                id='confirmName'
                value={confirmName}
                onChange={e => {
                  setConfirmName(e.target.value);
                  setError(null);
                }}
                placeholder={characterName}
                disabled={loading}
                autoComplete='off'
              />
            </div>

            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={loading || confirmName !== characterName}
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Character
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
