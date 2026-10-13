'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EffectsEditActionsProps {
  /** Why the editor's current state cannot be saved, or null when it can. */
  blockingError: string | null;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Cancel / Save buttons for the ability effect editor. Save stays disabled
 * while the editor reports a blocking error, so a failed block-to-JSON
 * generation or invalid JSON can never save the last valid snapshot as if the
 * edits had been applied.
 */
export function EffectsEditActions({
  blockingError,
  saving,
  onCancel,
  onSave,
}: EffectsEditActionsProps) {
  return (
    <div className='flex items-center gap-2'>
      {blockingError && (
        <span
          role='alert'
          data-testid='effects-save-blocked'
          className='max-w-sm truncate text-sm text-destructive'
          title={blockingError}
        >
          Cannot save: {blockingError}
        </span>
      )}
      <Button variant='outline' size='sm' onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button
        size='sm'
        onClick={onSave}
        disabled={saving || blockingError !== null}
      >
        {saving ? (
          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
        ) : (
          <CheckCircle className='h-4 w-4 mr-2' />
        )}
        Save Effects
      </Button>
    </div>
  );
}
