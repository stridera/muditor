'use client';

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
import { useAuth } from '@/contexts/auth-context';
import { gql } from '@apollo/client';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  CheckCircle,
  Link,
  Loader2,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { OnlineStatus } from './online-status';

const GET_CHARACTER_LINKING_INFO = gql`
  query GetCharacterLinkingInfoInline($characterName: String!) {
    characterLinkingInfo(characterName: $characterName) {
      id
      name
      level
      race
      class
      lastLogin
      timePlayed
      isOnline
      isLinked
      hasPassword
    }
  }
`;

const LINK_CHARACTER_MUTATION = gql`
  mutation LinkCharacterInline($data: LinkCharacterInput!) {
    linkCharacter(data: $data) {
      id
      name
      level
      raceType
      playerClass
    }
  }
`;

const VALIDATE_CHARACTER_PASSWORD = gql`
  query ValidateCharacterPasswordInline(
    $characterName: String!
    $password: String!
  ) {
    validateCharacterPassword(
      characterName: $characterName
      password: $password
    )
  }
`;

interface CharacterLinkingInfo {
  id: string;
  name: string;
  level: number;
  race?: string;
  class?: string;
  lastLogin?: Date;
  timePlayed: number;
  isOnline: boolean;
  isLinked: boolean;
  hasPassword: boolean;
}

interface CharacterLinkingInfoQueryResult {
  characterLinkingInfo: CharacterLinkingInfo;
}

interface LinkCharacterMutationResult {
  linkCharacter: {
    id: string;
    name: string;
    level: number;
    raceType?: string;
    playerClass?: string;
  };
}

interface ValidatePasswordQueryResult {
  validateCharacterPassword: boolean;
}

interface CharacterLinkingFormProps {
  onCharacterLinked: () => void;
}

export function CharacterLinkingForm({
  onCharacterLinked,
}: CharacterLinkingFormProps) {
  const { refetchUser } = useAuth();
  const [step, setStep] = useState<'search' | 'verify' | 'password'>('search');
  const [characterName, setCharacterName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [getCharacterInfo, { data: characterData, loading: searchLoading }] =
    useLazyQuery<CharacterLinkingInfoQueryResult>(GET_CHARACTER_LINKING_INFO);

  const [validatePassword, { loading: validatingPassword }] =
    useLazyQuery<ValidatePasswordQueryResult>(VALIDATE_CHARACTER_PASSWORD);

  const [linkCharacter, { loading: linkingCharacter }] =
    useMutation<LinkCharacterMutationResult>(LINK_CHARACTER_MUTATION);

  const character = characterData?.characterLinkingInfo;

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${Math.floor(seconds / 60)}m`;
    }
  };

  const handleSearch = async () => {
    if (!characterName.trim()) {
      setError('Please enter a character name');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await getCharacterInfo({
        variables: { characterName: characterName.trim() },
      });

      if (result.data?.characterLinkingInfo) {
        setStep('verify');
      }
    } catch (err: any) {
      setError(err.message || 'Character not found');
    }
  };

  const handleVerifyAndLink = async () => {
    if (!character) return;

    setError(null);
    setSuccess(null);

    try {
      if (character.hasPassword) {
        setStep('password');
        return;
      }

      // No password required, link directly
      await linkCharacter({
        variables: {
          data: {
            characterName: character.name,
            characterPassword: '', // Empty password for passwordless characters
          },
        },
      });

      setSuccess(
        `Successfully linked ${character.name} to your account! Your role has been updated.`
      );
      setStep('search');
      setCharacterName('');
      await refetchUser(); // Refresh user role
      onCharacterLinked();
    } catch (err: any) {
      setError(err.message || 'Failed to link character');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!character || !password.trim()) {
      setError('Please enter the character password');
      return;
    }

    setError(null);

    try {
      // First validate the password
      const validation = await validatePassword({
        variables: {
          characterName: character.name,
          password: password.trim(),
        },
      });

      if (!validation.data?.validateCharacterPassword) {
        setError('Invalid password for this character');
        return;
      }

      // Password is valid, now link the character
      await linkCharacter({
        variables: {
          data: {
            characterName: character.name,
            characterPassword: password.trim(),
          },
        },
      });

      setSuccess(
        `Successfully linked ${character.name} to your account! Your role has been updated.`
      );
      setStep('search');
      setCharacterName('');
      setPassword('');
      await refetchUser(); // Refresh user role
      onCharacterLinked();
    } catch (err: any) {
      setError(err.message || 'Failed to link character');
    }
  };

  const handleReset = () => {
    setStep('search');
    setCharacterName('');
    setPassword('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === 'search' && (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='characterName'>Character Name</Label>
            <div className='flex gap-2'>
              <Input
                id='characterName'
                placeholder="Enter your character's name"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                disabled={searchLoading}
              />
              <Button
                onClick={handleSearch}
                disabled={searchLoading || !characterName.trim()}
              >
                {searchLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Search className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          <div className='text-sm text-muted-foreground'>
            <p>
              Enter the name of your existing game character to link it to this
              account.
            </p>
            <p>Character names are case-insensitive.</p>
          </div>
        </div>
      )}

      {step === 'verify' && character && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Button variant='outline' size='sm' onClick={handleReset}>
              ← Back to Search
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Character Found: {character.name}
              </CardTitle>
              <CardDescription>
                Please verify this is your character before linking
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Level:
                    </span>
                    <span className='text-sm font-medium'>
                      {character.level}
                    </span>
                  </div>
                  {character.race && (
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Race:
                      </span>
                      <span className='text-sm font-medium'>
                        {character.race}
                      </span>
                    </div>
                  )}
                  {character.class && (
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Class:
                      </span>
                      <span className='text-sm font-medium'>
                        {character.class}
                      </span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Status:
                    </span>
                    <OnlineStatus
                      isOnline={character.isOnline}
                      lastLogin={character.lastLogin}
                      size='sm'
                    />
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Play Time:
                    </span>
                    <span className='text-sm font-medium'>
                      {formatPlayTime(character.timePlayed)}
                    </span>
                  </div>
                  {character.lastLogin && (
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Last Login:
                      </span>
                      <span className='text-sm font-medium'>
                        {formatDistanceToNow(new Date(character.lastLogin), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex items-center justify-between pt-4 border-t'>
                <div className='flex items-center gap-2'>
                  {character.hasPassword ? (
                    <Badge
                      variant='outline'
                      className='flex items-center gap-1'
                    >
                      <Shield className='h-3 w-3' />
                      Password Protected
                    </Badge>
                  ) : (
                    <Badge variant='secondary'>No Password</Badge>
                  )}

                  {character.isLinked ? (
                    <Badge variant='destructive'>Already Linked</Badge>
                  ) : (
                    <Badge variant='default'>Available</Badge>
                  )}
                </div>
              </div>

              {character.isLinked ? (
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    This character is already linked to another account and
                    cannot be linked again.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className='flex gap-2 pt-2'>
                  <Button
                    variant='outline'
                    onClick={handleReset}
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleVerifyAndLink} className='flex-1'>
                    {linkingCharacter ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : (
                      <Link className='h-4 w-4 mr-2' />
                    )}
                    {character.hasPassword ? 'Continue' : 'Link Character'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'password' && character && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setStep('verify')}
            >
              ← Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Character Password Required
              </CardTitle>
              <CardDescription>
                Enter the password for {character.name} to complete linking
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='password'>Character Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter character password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handlePasswordSubmit()}
                  disabled={validatingPassword || linkingCharacter}
                />
              </div>

              <div className='text-sm text-muted-foreground'>
                <p>
                  This is the password you set for your character in the game.
                </p>
                <p>Passwords are case-sensitive and required for security.</p>
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setStep('verify')}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordSubmit}
                  disabled={
                    validatingPassword || linkingCharacter || !password.trim()
                  }
                  className='flex-1'
                >
                  {validatingPassword || linkingCharacter ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <Link className='h-4 w-4 mr-2' />
                  )}
                  Link Character
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
