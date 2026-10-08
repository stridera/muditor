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
import { useClasses } from '@/hooks/use-classes';
import { useRaces } from '@/hooks/use-races';
import type { Race } from '@/generated/graphql';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  User,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';

const CREATE_CHARACTER_MUTATION = gql`
  mutation CreateCharacterInline($data: CreateCharacterInput!) {
    createCharacter(data: $data) {
      id
      name
      level
      strength
      intelligence
      wisdom
      dexterity
      constitution
      charisma
      luck
    }
  }
`;

const ROLL_STATS_MUTATION = gql`
  mutation RollCharacterStats {
    rollCharacterStats {
      token
      values
      expiresAt
    }
  }
`;

interface RollStatsMutationResult {
  rollCharacterStats: { token: string; values: number[]; expiresAt: string };
}

export const STAT_FIELDS = [
  { key: 'strength', label: 'Strength (STR)' },
  { key: 'intelligence', label: 'Intelligence (INT)' },
  { key: 'wisdom', label: 'Wisdom (WIS)' },
  { key: 'dexterity', label: 'Dexterity (DEX)' },
  { key: 'constitution', label: 'Constitution (CON)' },
  { key: 'charisma', label: 'Charisma (CHA)' },
  { key: 'luck', label: 'Luck (LCK)' },
] as const;

export type StatKey = (typeof STAT_FIELDS)[number]['key'];

/** Which rolled value (index into the roll) each attribute currently holds. */
export type StatAssignment = Record<StatKey, number>;

/** Default assignment: rolled values in roll order. */
export function defaultAssignment(): StatAssignment {
  return Object.fromEntries(
    STAT_FIELDS.map((f, i) => [f.key, i])
  ) as StatAssignment;
}

/**
 * Give `stat` the rolled value at `index`. If another attribute already holds
 * that value, the two swap, so the assignment always stays a permutation of
 * the roll.
 */
export function assignRolledValue(
  current: StatAssignment,
  stat: StatKey,
  index: number
): StatAssignment {
  const next = { ...current };
  const holder = STAT_FIELDS.find(
    f => f.key !== stat && current[f.key] === index
  );
  if (holder) next[holder.key] = current[stat];
  next[stat] = index;
  return next;
}

interface CharacterCreationFormProps {
  onCharacterCreated: () => void;
}

interface CreateCharacterMutationResult {
  createCharacter: {
    id: string;
    name: string;
    level: number;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
  };
}

interface CreateCharacterData {
  name: string;
  gender: string;
  race: Race;
  classId: number | null;
  description?: string;
}

export function CharacterCreationForm({
  onCharacterCreated,
}: CharacterCreationFormProps) {
  const [formData, setFormData] = useState<CreateCharacterData>({
    name: '',
    gender: 'neutral',
    race: 'HUMAN',
    classId: null,
    description: '',
  });
  const [roll, setRoll] = useState<{
    token: string;
    values: number[];
  } | null>(null);
  const [assignment, setAssignment] =
    useState<StatAssignment>(defaultAssignment);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createCharacter, { loading }] =
    useMutation<CreateCharacterMutationResult>(CREATE_CHARACTER_MUTATION);

  const { races, loading: racesLoading } = useRaces();
  const { classes, loading: classesLoading } = useClasses();
  const playableRaces = races.filter(r => r.playable);

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'neutral', label: 'Neutral' },
  ];

  const handleInputChange = (
    field: keyof CreateCharacterData,
    value: string | number | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [rollStats, { loading: rolling }] =
    useMutation<RollStatsMutationResult>(ROLL_STATS_MUTATION);

  // Stats are rolled by the server (3d6 each); the player only chooses which
  // rolled value goes to which attribute.
  const handleRoll = async () => {
    setError(null);
    try {
      const result = await rollStats();
      const rolled = result.data?.rollCharacterStats;
      if (rolled) {
        setRoll({ token: rolled.token, values: rolled.values });
        setAssignment(defaultAssignment());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to roll stats');
    }
  };

  const getTotalStatPoints = () =>
    roll ? roll.values.reduce((sum, v) => sum + v, 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Character name is required');
      return;
    }

    if (formData.name.length < 3 || formData.name.length > 20) {
      setError('Character name must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z]+$/.test(formData.name)) {
      setError('Character name can only contain letters');
      return;
    }

    if (formData.classId === null) {
      setError('Please choose a class');
      return;
    }

    if (!roll) {
      setError('Roll your stats first');
      return;
    }

    const stats = Object.fromEntries(
      STAT_FIELDS.map(f => [f.key, roll.values[assignment[f.key]]])
    ) as Record<StatKey, number>;

    try {
      const result = await createCharacter({
        variables: {
          data: {
            ...formData,
            ...stats,
            statRollToken: roll.token,
            name:
              formData.name.charAt(0).toUpperCase() +
              formData.name.slice(1).toLowerCase(),
          },
        },
      });

      if (result.data?.createCharacter) {
        setSuccess(
          `Successfully created character ${result.data.createCharacter.name}!`
        );
        // Reset form
        setFormData({
          name: '',
          gender: 'neutral',
          race: 'HUMAN',
          classId: null,
          description: '',
        });
        setRoll(null);
        setAssignment(defaultAssignment());
        onCharacterCreated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create character');
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
              Basic details about your new character
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

              <div className='space-y-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={value => handleInputChange('gender', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map(gender => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='race'>Race</Label>
                <Select
                  value={formData.race}
                  onValueChange={value => handleInputChange('race', value)}
                  disabled={loading || racesLoading}
                >
                  <SelectTrigger id='race'>
                    <SelectValue placeholder='Select a race' />
                  </SelectTrigger>
                  <SelectContent>
                    {playableRaces.map(race => (
                      <SelectItem key={race.race} value={race.race}>
                        {race.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='class'>Class *</Label>
                <Select
                  value={
                    formData.classId === null ? '' : String(formData.classId)
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
          </CardContent>
        </Card>

        {/* Character Stats */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='h-5 w-5' />
                  Character Stats
                </CardTitle>
                <CardDescription>
                  {roll
                    ? `Rolled ${roll.values.join(', ')} (total ${getTotalStatPoints()}). Assign each rolled value to an attribute, or reroll.`
                    : 'Stats are rolled randomly (3d6 each). Roll, then assign the results to your attributes.'}
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={handleRoll}
                disabled={loading || rolling}
              >
                {rolling ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Wand2 className='h-4 w-4 mr-2' />
                )}
                {roll ? 'Reroll' : 'Roll Stats'}
              </Button>
            </div>
          </CardHeader>
          {roll && (
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {STAT_FIELDS.map(stat => (
                  <div key={stat.key} className='space-y-2'>
                    <Label htmlFor={stat.key}>{stat.label}</Label>
                    <Select
                      value={String(assignment[stat.key])}
                      onValueChange={value =>
                        setAssignment(prev =>
                          assignRolledValue(prev, stat.key, Number(value))
                        )
                      }
                      disabled={loading}
                    >
                      <SelectTrigger id={stat.key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roll.values.map((value, index) => (
                          <SelectItem key={index} value={String(index)}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-sm text-muted-foreground'>
                <p>
                  Picking a value already used by another attribute swaps the
                  two.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Submit */}
        <div className='flex gap-4'>
          <Button type='submit' disabled={loading || !roll} className='flex-1'>
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Plus className='h-4 w-4 mr-2' />
            )}
            Create Character
          </Button>
        </div>
      </form>
    </div>
  );
}
