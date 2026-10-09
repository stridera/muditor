'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { AbilitySchool, Position } from '@/generated/graphql';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, type FC } from 'react';
import {
  ABILITY_TYPES,
  ELEMENT_TYPES,
  EMPTY_ABILITY_FORM,
  POSITIONS,
  SPELL_SPHERES,
  abilityToFormData,
  type AbilityFormData,
  type AbilityFormSource,
} from './ability-form';

interface AbilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The fully loaded ability being edited; null when creating or still loading. */
  ability: AbilityFormSource | null;
  isEditing: boolean;
  loadingAbility: boolean;
  loadError: string | null;
  schools: readonly AbilitySchool[];
  onSubmit: (data: AbilityFormData) => void;
  loading: boolean;
}

export const AbilityFormDialog: FC<AbilityFormDialogProps> = ({
  open,
  onOpenChange,
  ability,
  isEditing,
  loadingAbility,
  loadError,
  schools,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<AbilityFormData>(EMPTY_ABILITY_FORM);

  // Seed the form from the full ability, or reset it for a new one.
  useEffect(() => {
    setFormData(ability ? abilityToFormData(ability) : EMPTY_ABILITY_FORM);
  }, [ability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Never submit before the full ability has loaded.
    if (isEditing && !ability) return;
    onSubmit(formData);
  };

  if (isEditing && !ability) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Edit Ability</DialogTitle>
            <DialogDescription>
              {loadError
                ? 'The ability could not be loaded.'
                : 'Loading the full ability...'}
            </DialogDescription>
          </DialogHeader>
          <div
            className='flex items-center justify-center p-8'
            data-testid='ability-form-loading'
          >
            {loadError && !loadingAbility ? (
              <div className='text-destructive'>{loadError}</div>
            ) : (
              <Loader2 className='h-6 w-6 animate-spin' />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {ability ? 'Edit Ability' : 'Create New Ability'}
            </DialogTitle>
            <DialogDescription>
              {ability
                ? 'Update the ability details below'
                : 'Fill in the details to create a new ability'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Fireball'
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='abilityType'>Type *</Label>
              <Select
                value={formData.abilityType}
                onValueChange={value =>
                  setFormData({ ...formData, abilityType: value })
                }
              >
                <SelectTrigger id='abilityType'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ABILITY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Describe the ability...'
                rows={3}
              />
            </div>

            {(formData.abilityType === 'SPELL' ||
              formData.abilityType === 'CHANT') && (
              <div className='grid gap-2'>
                <Label htmlFor='schoolId'>School</Label>
                <Select
                  // Use sentinel 'NONE' instead of empty string to satisfy Radix requirement
                  value={
                    formData.schoolId != null
                      ? formData.schoolId.toString()
                      : 'NONE'
                  }
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      schoolId:
                        value === 'NONE' ? undefined : parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger id='schoolId'>
                    <SelectValue placeholder='Select a school (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='NONE'>None</SelectItem>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='castTimeRounds'>Cast Time (rounds)</Label>
                <Input
                  id='castTimeRounds'
                  type='number'
                  value={formData.castTimeRounds}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      castTimeRounds: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='cooldownMs'>Cooldown (ms)</Label>
                <Input
                  id='cooldownMs'
                  type='number'
                  value={formData.cooldownMs}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      cooldownMs: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='promptLetter'>Prompt Letter</Label>
              <Input
                id='promptLetter'
                value={formData.promptLetter}
                onChange={e =>
                  setFormData({
                    ...formData,
                    promptLetter: e.target.value.slice(0, 1),
                  })
                }
                maxLength={1}
                pattern='[A-Za-z]'
                placeholder='(none)'
                className='w-20 font-mono'
              />
              <p className='text-xs text-muted-foreground'>
                Single letter for the prompt cooldown bar (%d&lt;letter&gt;).
                Abilities may share a letter (the breath weapons share one). The
                game picks up changes on restart.
              </p>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='minPosition'>Minimum Position</Label>
              <Select
                value={formData.minPosition}
                onValueChange={value =>
                  setFormData({ ...formData, minPosition: value as Position })
                }
              >
                <SelectTrigger id='minPosition'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(pos => (
                    <SelectItem key={pos} value={pos}>
                      {pos.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='violent'
                  checked={formData.violent}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, violent: checked })
                  }
                />
                <Label htmlFor='violent' className='cursor-pointer'>
                  Violent (damages targets)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='combatOk'
                  checked={formData.combatOk}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, combatOk: checked })
                  }
                />
                <Label htmlFor='combatOk' className='cursor-pointer'>
                  Combat OK (can be used during combat)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isArea'
                  checked={formData.isArea}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isArea: checked })
                  }
                />
                <Label htmlFor='isArea' className='cursor-pointer'>
                  Area Effect (affects multiple targets)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='inCombatOnly'
                  checked={formData.inCombatOnly}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({
                      ...formData,
                      inCombatOnly: checked,
                    })
                  }
                />
                <Label htmlFor='inCombatOnly' className='cursor-pointer'>
                  Combat Only (can only be used in combat)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='questOnly'
                  checked={formData.questOnly}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, questOnly: checked })
                  }
                />
                <Label htmlFor='questOnly' className='cursor-pointer'>
                  Quest Only (restricted to quests)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='humanoidOnly'
                  checked={formData.humanoidOnly}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, humanoidOnly: checked })
                  }
                />
                <Label htmlFor='humanoidOnly' className='cursor-pointer'>
                  Humanoid Only (only available to humanoid races)
                </Label>
              </div>
            </div>

            {/* Spell Metadata - only show for spells */}
            {(formData.abilityType === 'SPELL' ||
              formData.abilityType === 'CHANT') && (
              <>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='sphere'>Sphere</Label>
                    <Select
                      value={formData.sphere || 'NONE'}
                      onValueChange={value =>
                        setFormData({
                          ...formData,
                          sphere: value === 'NONE' ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger id='sphere'>
                        <SelectValue placeholder='Select a sphere' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='NONE'>None</SelectItem>
                        {SPELL_SPHERES.map(sphere => (
                          <SelectItem key={sphere} value={sphere}>
                            {sphere}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='damageType'>Damage Type</Label>
                    <Select
                      value={formData.damageType || 'NONE'}
                      onValueChange={value =>
                        setFormData({
                          ...formData,
                          damageType: value === 'NONE' ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger id='damageType'>
                        <SelectValue placeholder='Select damage type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='NONE'>None</SelectItem>
                        {ELEMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='pages'>Spellbook Pages</Label>
                    <Input
                      id='pages'
                      type='number'
                      value={formData.pages || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          pages: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      min={0}
                      placeholder='Pages required to scribe'
                    />
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='memorizationTime'>
                      Extra Memorization Time
                    </Label>
                    <Input
                      id='memorizationTime'
                      type='number'
                      value={formData.memorizationTime}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          memorizationTime: parseInt(e.target.value) || 0,
                        })
                      }
                      min={0}
                      placeholder='Additional rounds'
                    />
                  </div>
                </div>
              </>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='notes'>Notes</Label>
              <Textarea
                id='notes'
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder='Additional notes about the ability...'
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {ability ? 'Updating...' : 'Creating...'}
                </>
              ) : ability ? (
                'Update Ability'
              ) : (
                'Create Ability'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
