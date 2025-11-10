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
      raceType
      playerClass
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

interface CharacterCreationFormProps {
  onCharacterCreated: () => void;
}

interface CreateCharacterMutationResult {
  createCharacter: {
    id: string;
    name: string;
    level: number;
    raceType?: string;
    playerClass?: string;
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
  raceType: string;
  playerClass: string;
  gender: string;
  description?: string;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  luck: number;
}

export function CharacterCreationForm({
  onCharacterCreated,
}: CharacterCreationFormProps) {
  const [formData, setFormData] = useState<CreateCharacterData>({
    name: '',
    raceType: 'human',
    playerClass: 'fighter',
    gender: 'neutral',
    description: '',
    strength: 13,
    intelligence: 13,
    wisdom: 13,
    dexterity: 13,
    constitution: 13,
    charisma: 13,
    luck: 13,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createCharacter, { loading }] =
    useMutation<CreateCharacterMutationResult>(CREATE_CHARACTER_MUTATION);

  const races = [
    { value: 'human', label: 'Human' },
    { value: 'elf', label: 'Elf' },
    { value: 'dwarf', label: 'Dwarf' },
    { value: 'halfling', label: 'Halfling' },
    { value: 'gnome', label: 'Gnome' },
    { value: 'half-elf', label: 'Half-Elf' },
    { value: 'orc', label: 'Orc' },
    { value: 'troll', label: 'Troll' },
  ];

  const classes = [
    { value: 'fighter', label: 'Fighter' },
    { value: 'cleric', label: 'Cleric' },
    { value: 'magic-user', label: 'Magic User' },
    { value: 'thief', label: 'Thief' },
    { value: 'ranger', label: 'Ranger' },
    { value: 'paladin', label: 'Paladin' },
    { value: 'barbarian', label: 'Barbarian' },
    { value: 'sorcerer', label: 'Sorcerer' },
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'neutral', label: 'Neutral' },
  ];

  const handleInputChange = (
    field: keyof CreateCharacterData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatChange = (stat: keyof CreateCharacterData, value: number) => {
    // Ensure stats stay within valid range (1-18 for character creation)
    const clampedValue = Math.max(1, Math.min(18, value));
    setFormData(prev => ({
      ...prev,
      [stat]: clampedValue,
    }));
  };

  const rollRandomStats = () => {
    const rollStat = () => {
      // Roll 3d6 for each stat (classic D&D style)
      return (
        Math.floor(Math.random() * 6) +
        Math.floor(Math.random() * 6) +
        Math.floor(Math.random() * 6) +
        3
      );
    };

    setFormData(prev => ({
      ...prev,
      strength: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      charisma: rollStat(),
      luck: rollStat(),
    }));
  };

  const getTotalStatPoints = () => {
    return (
      formData.strength +
      formData.intelligence +
      formData.wisdom +
      formData.dexterity +
      formData.constitution +
      formData.charisma +
      formData.luck
    );
  };

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

    try {
      const result = await createCharacter({
        variables: {
          data: {
            ...formData,
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
          raceType: 'human',
          playerClass: 'fighter',
          gender: 'neutral',
          description: '',
          strength: 13,
          intelligence: 13,
          wisdom: 13,
          dexterity: 13,
          constitution: 13,
          charisma: 13,
          luck: 13,
        });
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

              <div className='space-y-2'>
                <Label htmlFor='race'>Race</Label>
                <Select
                  value={formData.raceType}
                  onValueChange={value => handleInputChange('raceType', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {races.map(race => (
                      <SelectItem key={race.value} value={race.value}>
                        {race.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='class'>Class</Label>
                <Select
                  value={formData.playerClass}
                  onValueChange={value =>
                    handleInputChange('playerClass', value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.value} value={cls.value}>
                        {cls.label}
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
                  Set your character's core attributes (Total:{' '}
                  {getTotalStatPoints()})
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={rollRandomStats}
                disabled={loading}
              >
                <Wand2 className='h-4 w-4 mr-2' />
                Roll Random
              </Button>
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
                    max='18'
                    value={
                      formData[stat.key as keyof CreateCharacterData] as number
                    }
                    onChange={e =>
                      handleStatChange(
                        stat.key as keyof CreateCharacterData,
                        parseInt(e.target.value) || 1
                      )
                    }
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
            <div className='mt-4 text-sm text-muted-foreground'>
              <p>Valid range: 1-18 for each stat. Higher values are better.</p>
              <p>Recommended total: 70-100 points for balanced characters.</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex gap-4'>
          <Button type='submit' disabled={loading} className='flex-1'>
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
