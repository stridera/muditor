'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

import { QueryError, QueryLoading } from '@/components/public/QueryState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGamePasswordStatus,
  useSetGamePassword,
} from '@/hooks/use-game-login';
import { extractErrorMessage } from '@/lib/error-utils';

const ALL = '__all__';
const MIN_LENGTH = 8;

export function GamePasswordCard() {
  const { statuses, loading, error, refetch } = useGamePasswordStatus();
  const [setGamePassword, { loading: saving }] = useSetGamePassword();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [target, setTarget] = useState(ALL);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    if (password.length < MIN_LENGTH) {
      setFormError(`Game password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }
    try {
      await setGamePassword({
        variables: {
          password,
          characterName: target === ALL ? null : target,
        },
      });
      setSuccess(
        target === ALL
          ? 'Game password set for all your characters.'
          : `Game password set for ${target}.`
      );
      setPassword('');
      setConfirm('');
      await refetch();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game password</CardTitle>
        <CardDescription>
          This is the password you type into your game client when you connect.
          It is separate from your website password and must be different from
          it. You can also skip it by typing <code>code</code> at the game
          password prompt and approving the login on the{' '}
          <Link href='/verify' className='text-primary hover:underline'>
            verify page
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {loading ? (
          <QueryLoading text='Loading characters...' />
        ) : error ? (
          <QueryError
            message={extractErrorMessage(error)}
            onRetry={() => void refetch()}
          />
        ) : statuses.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            You have no characters linked to this account yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Character</TableHead>
                <TableHead>Game password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map(s => (
                <TableRow key={s.characterName}>
                  <TableCell className='font-medium'>
                    {s.characterName}
                  </TableCell>
                  <TableCell>
                    {!s.isSet ? (
                      <Badge variant='outline'>Not set</Badge>
                    ) : s.isLegacyHash ? (
                      <Badge variant='destructive'>
                        Legacy hash - please reset
                      </Badge>
                    ) : (
                      <Badge variant='secondary'>Set</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <form onSubmit={submit} className='space-y-4'>
          {success && (
            <Alert role='status'>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {formError && (
            <Alert variant='destructive' role='alert'>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='game-password-target'>Apply to</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger id='game-password-target'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All my characters</SelectItem>
                {statuses.map(s => (
                  <SelectItem key={s.characterName} value={s.characterName}>
                    {s.characterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='game-password'>New game password</Label>
            <Input
              id='game-password'
              type='password'
              autoComplete='new-password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={saving}
              required
              minLength={MIN_LENGTH}
            />
            <p className='text-xs text-muted-foreground'>
              At least {MIN_LENGTH} characters, and different from your website
              password.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='game-password-confirm'>Confirm game password</Label>
            <Input
              id='game-password-confirm'
              type='password'
              autoComplete='new-password'
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <Button type='submit' disabled={saving || statuses.length === 0}>
            {saving ? 'Saving...' : 'Set game password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
