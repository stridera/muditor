import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

/** Shared note about when AI rule edits take effect. */
export function AiHelp() {
  return (
    <Alert className='mb-4'>
      <Info className='h-4 w-4' />
      <AlertDescription>
        The game loads AI rules at startup, so changes apply after the next
        restart. The whole feature is switched by the game config flag{' '}
        <code className='font-mono'>mob_ai.enabled</code> (off by default).
        Rules run lowest priority number first; the first rule whose conditions
        hold and whose chance roll passes is used.
      </AlertDescription>
    </Alert>
  );
}
