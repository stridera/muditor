'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import type { CharacterDto, Race } from '@/generated/graphql';
import { useClasses } from '@/hooks/use-classes';
import { useRaces } from '@/hooks/use-races';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  User,
  Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const UPDATE_CHARACTER_MUTATION = gql`
  mutation UpdateCharacterInline($id: ID!, $data: UpdateCharacterInput!) {
    updateCharacter(id: $id, data: $data) {
      id
      name
      level
      race
      classId
      description
      title
      strength
      intelligence
      wisdom
      dexterity
      constitution
      charisma
      luck
      hitPoints
      hitPointsMax
      movement
      movementMax
      alignment
    }
  }
`;

interface CharacterEditFormProps {
  character: CharacterDto;
  onCharacterUpdated: () => void;
  onCancel?: () => void;
}

interface UpdateCharacterMutationResult {
  updateCharacter: CharacterDto;
}

interface UpdateCharacterData {
  name?: string;
  level?: number;
  gender?: string;
  description?: string;
  title?: string;
  strength?: number;
  intelligence?: number;
  wisdom?: number;
  dexterity?: number;
  constitution?: number;
  charisma?: number;
  luck?: number;
  hitPoints?: number;
  hitPointsMax?: number;
  movement?: number;
  movementMax?: number;
  alignment?: number;
  // Staff-only (IMMORTAL+); owners never send these.
  race?: string | undefined;
  classId?: number | null;
}

export function CharacterEditForm({
  character,
  onCharacterUpdated,
  onCancel,
}: CharacterEditFormProps) {
  const { user } = useAuth();
  // Race/class changes are staff-only on the API (IMMORTAL+).
  const isStaff = !!user && user.role !== 'PLAYER';
  const { races, loading: racesLoading } = useRaces();
  const { classes, loading: classesLoading } = useClasses();
  const [formData, setFormData] = useState<UpdateCharacterData>({
    name: character.name,
    level: character.level,
    description: character.description || '',
    title: character.title || '',
    strength: character.strength,
    intelligence: character.intelligence,
    wisdom: character.wisdom,
    dexterity: character.dexterity,
    constitution: character.constitution,
    charisma: character.charisma,
    luck: character.luck,
    hitPoints: character.hitPoints,
    hitPointsMax: character.hitPointsMax,
    movement: character.movement,
    movementMax: character.movementMax,
    alignment: character.alignment,
    race: character.race ?? undefined,
    classId: character.classId ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [updateCharacter, { loading }] =
    useMutation<UpdateCharacterMutationResult>(UPDATE_CHARACTER_MUTATION);

  // Reset form when character changes
  useEffect(() => {
    setFormData({
      name: character.name,
      level: character.level,
      description: character.description || '',
      title: character.title || '',
      strength: character.strength,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      dexterity: character.dexterity,
      constitution: character.constitution,
      charisma: character.charisma,
      luck: character.luck,
      hitPoints: character.hitPoints,
      hitPointsMax: character.hitPointsMax,
      movement: character.movement,
      movementMax: character.movementMax,
      alignment: character.alignment,
      race: character.race ?? undefined,
      classId: character.classId ?? null,
    });
  }, [character]);

  const handleInputChange = (
    field: keyof UpdateCharacterData,
    value: string | number | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatChange = (stat: keyof UpdateCharacterData, value: number) => {
    // Ensure stats stay within valid range (1-25 for editing, allowing for magic items)
    const clampedValue = Math.max(1, Math.min(25, value));
    setFormData(prev => ({
      ...prev,
      [stat]: clampedValue,
    }));
  };

  const getTotalStatPoints = () => {
    return (
      (formData.strength || 0) +
      (formData.intelligence || 0) +
      (formData.wisdom || 0) +
      (formData.dexterity || 0) +
      (formData.constitution || 0) +
      (formData.charisma || 0) +
      (formData.luck || 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (formData.name && formData.name.trim().length === 0) {
      setError('Character name cannot be empty');
      return;
    }

    if (
      formData.name &&
      (formData.name.length < 3 || formData.name.length > 20)
    ) {
      setError('Character name must be between 3 and 20 characters');
      return;
    }

    if (formData.name && !/^[a-zA-Z]+$/.test(formData.name)) {
      setError('Character name can only contain letters');
      return;
    }

    const name = formData.name
      ? formData.name.charAt(0).toUpperCase() +
        formData.name.slice(1).toLowerCase()
      : undefined;
    // Owners may only send the self-editable fields the API allows
    // (SELF_EDITABLE_CHARACTER_FIELDS); everything else is staff-only.
    const { race, classId, ...staffCommon } = formData;
    const data: Record<string, unknown> = isStaff
      ? {
          ...staffCommon,
          ...(race ? { race: race as Race } : {}),
          ...(classId != null ? { classId } : {}),
          name,
        }
      : {
          name,
          title: formData.title,
          description: formData.description,
        };

    try {
      const result = await updateCharacter({
        variables: {
          id: character.id,
          data,
        },
      });

      if (result.data?.updateCharacter) {
        setSuccess(
          `Successfully updated character ${result.data.updateCharacter.name}!`
        );
        setTimeout(() => {
          onCharacterUpdated();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update character');
    }
  };

  return (
    <div className='space-y-6'>
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

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Character Information
            </CardTitle>
            <CardDescription>
              Update basic details about your character
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Character Name *</Label>
                <Input
                  id='name'
                  placeholder='Enter character name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  maxLength={20}
                />
                <p className='text-xs text-muted-foreground'>
                  3-20 characters, letters only
                </p>
              </div>

              {isStaff && (
                <div className='space-y-2'>
                  <Label htmlFor='level'>Level</Label>
                  <Input
                    id='level'
                    type='number'
                    min='1'
                    max='100'
                    value={formData.level}
                    onChange={e =>
                      handleInputChange('level', parseInt(e.target.value) || 1)
                    }
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {isStaff && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='race'>Race</Label>
                  <Select
                    value={formData.race ?? ''}
                    onValueChange={value => handleInputChange('race', value)}
                    disabled={loading || racesLoading}
                  >
                    <SelectTrigger id='race'>
                      <SelectValue placeholder='Select a race' />
                    </SelectTrigger>
                    <SelectContent>
                      {races.map(race => (
                        <SelectItem key={race.race} value={race.race}>
                          {race.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='class'>Class</Label>
                  <Select
                    value={
                      formData.classId == null ? '' : String(formData.classId)
                    }
                    onValueChange={value =>
                      handleInputChange('classId', parseInt(value, 10))
                    }
                    disabled={loading || classesLoading}
                  >
                    <SelectTrigger id='class'>
                      <SelectValue placeholder='Select a class' />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.plainName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='title'>Title (Optional)</Label>
              <Input
                id='title'
                placeholder='Enter character title'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                disabled={loading}
                maxLength={100}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                placeholder="Describe your character's appearance or background..."
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={500}
              />
              <p className='text-xs text-muted-foreground'>
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            {isStaff && (
              <div className='space-y-2'>
                <Label htmlFor='alignment'>Alignment</Label>
                <Input
                  id='alignment'
                  type='number'
                  min='-1000'
                  max='1000'
                  value={formData.alignment}
                  onChange={e =>
                    handleInputChange(
                      'alignment',
                      parseInt(e.target.value) || 0
                    )
                  }
                  disabled={loading}
                />
                <p className='text-xs text-muted-foreground'>
                  -1000 (Demonic) to 1000 (Saintly)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Character Stats */}
        {isStaff && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <Wand2 className='h-5 w-5' />
                    Character Stats
                  </CardTitle>
                  <CardDescription>
                    Update your character's core attributes (Total:{' '}
                    {getTotalStatPoints()})
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {[
                  { key: 'strength', label: 'Strength (STR)' },
                  { key: 'intelligence', label: 'Intelligence (INT)' },
                  { key: 'wisdom', label: 'Wisdom (WIS)' },
                  { key: 'dexterity', label: 'Dexterity (DEX)' },
                  { key: 'constitution', label: 'Constitution (CON)' },
                  { key: 'charisma', label: 'Charisma (CHA)' },
                  { key: 'luck', label: 'Luck (LCK)' },
                ].map(stat => (
                  <div key={stat.key} className='space-y-2'>
                    <Label htmlFor={stat.key}>{stat.label}</Label>
                    <Input
                      id={stat.key}
                      type='number'
                      min='1'
                      max='25'
                      value={
                        formData[
                          stat.key as keyof UpdateCharacterData
                        ] as number
                      }
                      onChange={e =>
                        handleStatChange(
                          stat.key as keyof UpdateCharacterData,
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
              <div className='mt-4 text-sm text-muted-foreground'>
                <p>
                  Valid range: 1-25 for each stat. Higher values are better.
                </p>
                <p>
                  Normal range: 1-18, values above 18 typically from magic
                  items.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health & Movement */}
        {isStaff && (
          <Card>
            <CardHeader>
              <CardTitle>Health & Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='hitPoints'>Current Hit Points</Label>
                  <Input
                    id='hitPoints'
                    type='number'
                    min='0'
                    max={formData.hitPointsMax}
                    value={formData.hitPoints}
                    onChange={e =>
                      handleInputChange(
                        'hitPoints',
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={loading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='hitPointsMax'>Max Hit Points</Label>
                  <Input
                    id='hitPointsMax'
                    type='number'
                    min='1'
                    max='10000'
                    value={formData.hitPointsMax}
                    onChange={e =>
                      handleInputChange(
                        'hitPointsMax',
                        parseInt(e.target.value) || 1
                      )
                    }
                    disabled={loading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='movement'>Current Movement</Label>
                  <Input
                    id='movement'
                    type='number'
                    min='0'
                    max={formData.movementMax}
                    value={formData.movement}
                    onChange={e =>
                      handleInputChange(
                        'movement',
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={loading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='movementMax'>Max Movement</Label>
                  <Input
                    id='movementMax'
                    type='number'
                    min='1'
                    max='10000'
                    value={formData.movementMax}
                    onChange={e =>
                      handleInputChange(
                        'movementMax',
                        parseInt(e.target.value) || 1
                      )
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className='flex gap-4'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={loading}
              className='flex-1'
            >
              Cancel
            </Button>
          )}
          <Button type='submit' disabled={loading} className='flex-1'>
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Save className='h-4 w-4 mr-2' />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
