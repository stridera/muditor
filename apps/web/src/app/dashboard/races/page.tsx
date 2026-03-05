'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { CheckCircle, Loader2, Pencil, XCircle } from 'lucide-react';
import { useState } from 'react';

const GET_RACES = gql`
  query GetRacesInline {
    races {
      race
      name
      plainName
      playable
      humanoid
      magical
      defaultSize
      maxStrength
      maxDexterity
      maxIntelligence
      maxWisdom
      maxConstitution
      maxCharisma
      expFactor
      hpFactor
    }
    racesCount
  }
`;

const GET_RACE_SKILLS = gql`
  query GetRaceSkills($race: Race!) {
    raceSkills(race: $race) {
      id
      skillId
      skillName
      category
      bonus
    }
  }
`;

const UPDATE_RACE = gql`
  mutation UpdateRaceInline($race: Race!, $data: UpdateRaceInput!) {
    updateRace(race: $race, data: $data) {
      race
      name
      playable
      humanoid
      magical
      defaultSize
      maxStrength
      maxDexterity
      maxIntelligence
      maxWisdom
      maxConstitution
      maxCharisma
      expFactor
      hpFactor
    }
  }
`;

type RaceFormData = {
  playable: boolean;
  humanoid: boolean;
  magical: boolean;
  maxStrength: number;
  maxDexterity: number;
  maxIntelligence: number;
  maxWisdom: number;
  maxConstitution: number;
  maxCharisma: number;
  expFactor: number;
  hpFactor: number;
};

export default function RacesPage() {
  const { isBuilder, isCoder } = usePermissions();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<any>(null);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<RaceFormData>({
    playable: false,
    humanoid: false,
    magical: false,
    maxStrength: 76,
    maxDexterity: 76,
    maxIntelligence: 76,
    maxWisdom: 76,
    maxConstitution: 76,
    maxCharisma: 76,
    expFactor: 100,
    hpFactor: 100,
  });

  const { data, loading, error, refetch } = useQuery(GET_RACES);

  const {
    data: raceSkillsData,
    loading: loadingSkills,
    refetch: refetchSkills,
  } = useQuery(GET_RACE_SKILLS, {
    skip: !selectedRace,
    variables: { race: selectedRace?.race },
  });

  const [updateRace, { loading: updating }] = useMutation(UPDATE_RACE, {
    onCompleted: () => {
      setSuccessMessage('Race updated successfully');
      setErrorMessage('');
      setIsEditOpen(false);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const handleRaceClick = (race: any) => {
    setSelectedRace(race);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (race: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setEditingRace(race);
    setFormData({
      playable: race.playable,
      humanoid: race.humanoid,
      magical: race.magical,
      maxStrength: race.maxStrength,
      maxDexterity: race.maxDexterity,
      maxIntelligence: race.maxIntelligence,
      maxWisdom: race.maxWisdom,
      maxConstitution: race.maxConstitution,
      maxCharisma: race.maxCharisma,
      expFactor: race.expFactor,
      hpFactor: race.hpFactor,
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      playable: formData.playable,
      humanoid: formData.humanoid,
      magical: formData.magical,
      maxStrength: formData.maxStrength,
      maxDexterity: formData.maxDexterity,
      maxIntelligence: formData.maxIntelligence,
      maxWisdom: formData.maxWisdom,
      maxConstitution: formData.maxConstitution,
      maxCharisma: formData.maxCharisma,
      expFactor: formData.expFactor,
      hpFactor: formData.hpFactor,
    };

    await updateRace({
      variables: {
        race: editingRace.race,
        data: input,
      },
    });
  };

  const canEdit = isBuilder || isCoder;

  const filteredRaces = (data as any)?.races?.filter((race: any) =>
    race.plainName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Alert className='bg-destructive/10 border-destructive/30'>
          <XCircle className='h-4 w-4 text-destructive' />
          <AlertDescription className='text-destructive'>
            Error loading races: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Races</h1>
        <p className='text-muted-foreground'>
          Edit race attributes and statistics
        </p>
      </div>

      {successMessage && (
        <Alert className='mb-4 bg-green-950/20 border-green-800/30'>
          <CheckCircle className='h-4 w-4 text-green-500' />
          <AlertDescription className='text-green-400'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className='mb-4 bg-destructive/10 border-destructive/30'>
          <XCircle className='h-4 w-4 text-destructive' />
          <AlertDescription className='text-destructive'>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between items-center mb-4'>
        <Input
          placeholder='Search races...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead>Max Stats</TableHead>
              <TableHead>Factors</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRaces && filteredRaces.length > 0 ? (
              filteredRaces.map((race: any) => (
                <TableRow
                  key={race.race}
                  className='cursor-pointer hover:bg-accent'
                  onClick={() => handleRaceClick(race)}
                >
                  <TableCell className='font-medium'>
                    {race.plainName}
                  </TableCell>
                  <TableCell>
                    <span className='text-sm'>{race.defaultSize}</span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      {race.playable && (
                        <span className='text-xs bg-green-950/30 text-green-400 px-2 py-0.5 rounded'>
                          Playable
                        </span>
                      )}
                      {race.humanoid && (
                        <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded'>
                          Humanoid
                        </span>
                      )}
                      {race.magical && (
                        <span className='text-xs bg-purple-950/30 text-purple-400 px-2 py-0.5 rounded'>
                          Magical
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-xs space-y-0.5'>
                      <div>
                        STR:{race.maxStrength} DEX:{race.maxDexterity} CON:
                        {race.maxConstitution}
                      </div>
                      <div>
                        INT:{race.maxIntelligence} WIS:{race.maxWisdom} CHA:
                        {race.maxCharisma}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-xs'>
                      <div>HP: {race.hpFactor}%</div>
                      <div>XP: {race.expFactor}%</div>
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={e => handleEditClick(race, e)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 6 : 5}
                  className='text-center text-muted-foreground py-8'
                >
                  No races found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Race: {editingRace?.plainName}</DialogTitle>
              <DialogDescription>
                Update race attributes and statistics
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='flags' className='mt-4'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='flags'>Flags</TabsTrigger>
                <TabsTrigger value='stats'>Stats</TabsTrigger>
                <TabsTrigger value='factors'>Factors</TabsTrigger>
              </TabsList>

              <TabsContent value='flags' className='space-y-4 mt-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='playable'
                    checked={formData.playable}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, playable: checked })
                    }
                  />
                  <Label htmlFor='playable' className='cursor-pointer'>
                    Playable (available for player character creation)
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='humanoid'
                    checked={formData.humanoid}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, humanoid: checked })
                    }
                  />
                  <Label htmlFor='humanoid' className='cursor-pointer'>
                    Humanoid (has humanoid body structure)
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='magical'
                    checked={formData.magical}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, magical: checked })
                    }
                  />
                  <Label htmlFor='magical' className='cursor-pointer'>
                    Magical (innate magical nature)
                  </Label>
                </div>
              </TabsContent>

              <TabsContent value='stats' className='space-y-4 mt-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='maxStrength'>Max Strength</Label>
                    <Input
                      id='maxStrength'
                      type='number'
                      value={formData.maxStrength}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxStrength: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={200}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='maxDexterity'>Max Dexterity</Label>
                    <Input
                      id='maxDexterity'
                      type='number'
                      value={formData.maxDexterity}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxDexterity: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={200}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='maxConstitution'>Max Constitution</Label>
                    <Input
                      id='maxConstitution'
                      type='number'
                      value={formData.maxConstitution}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxConstitution: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={200}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='maxIntelligence'>Max Intelligence</Label>
                    <Input
                      id='maxIntelligence'
                      type='number'
                      value={formData.maxIntelligence}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxIntelligence: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={200}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='maxWisdom'>Max Wisdom</Label>
                    <Input
                      id='maxWisdom'
                      type='number'
                      value={formData.maxWisdom}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxWisdom: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={200}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='maxCharisma'>Max Charisma</Label>
                    <Input
                      id='maxCharisma'
                      type='number'
                      value={formData.maxCharisma}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxCharisma: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={200}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='factors' className='space-y-4 mt-4'>
                <div>
                  <Label htmlFor='hpFactor'>HP Factor (%)</Label>
                  <Input
                    id='hpFactor'
                    type='number'
                    value={formData.hpFactor}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        hpFactor: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    required
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Hit point multiplier (100 = standard)
                  </p>
                </div>

                <div>
                  <Label htmlFor='expFactor'>XP Factor (%)</Label>
                  <Input
                    id='expFactor'
                    type='number'
                    value={formData.expFactor}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        expFactor: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    required
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Experience point multiplier (100 = standard)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updating}>
                {updating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{selectedRace?.plainName}</DialogTitle>
            <DialogDescription>{selectedRace?.name}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue='info' className='mt-4'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='info'>Information</TabsTrigger>
              <TabsTrigger value='effects'>Permanent Effects</TabsTrigger>
              <TabsTrigger value='abilities'>Abilities & Spells</TabsTrigger>
            </TabsList>

            <TabsContent value='info' className='space-y-4 mt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-semibold text-sm mb-2'>Attributes</h3>
                  <div className='space-y-1 text-sm'>
                    <div className='flex items-center gap-2'>
                      {selectedRace?.playable && (
                        <span className='text-xs bg-green-950/30 text-green-400 px-2 py-0.5 rounded'>
                          Playable
                        </span>
                      )}
                      {selectedRace?.humanoid && (
                        <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded'>
                          Humanoid
                        </span>
                      )}
                      {selectedRace?.magical && (
                        <span className='text-xs bg-purple-950/30 text-purple-400 px-2 py-0.5 rounded'>
                          Magical
                        </span>
                      )}
                    </div>
                    <div>Size: {selectedRace?.defaultSize}</div>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-sm mb-2'>Factors</h3>
                  <div className='space-y-1 text-sm'>
                    <div>HP Factor: {selectedRace?.hpFactor}%</div>
                    <div>XP Factor: {selectedRace?.expFactor}%</div>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-sm mb-2'>Maximum Stats</h3>
                  <div className='space-y-1 text-xs'>
                    <div>Strength: {selectedRace?.maxStrength}</div>
                    <div>Dexterity: {selectedRace?.maxDexterity}</div>
                    <div>Constitution: {selectedRace?.maxConstitution}</div>
                  </div>
                </div>

                <div className='space-y-1 text-xs mt-6'>
                  <div>Intelligence: {selectedRace?.maxIntelligence}</div>
                  <div>Wisdom: {selectedRace?.maxWisdom}</div>
                  <div>Charisma: {selectedRace?.maxCharisma}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='effects' className='space-y-4 mt-4'>
              <div>
                <h3 className='font-semibold text-sm mb-2'>
                  Permanent Effects
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Effect management via junction tables coming soon (Phase 3).
                </p>
              </div>
            </TabsContent>

            <TabsContent value='abilities' className='space-y-4 mt-4'>
              <div>
                <h3 className='font-semibold text-sm mb-2'>
                  Racial Abilities & Spells
                </h3>
                {loadingSkills ? (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                ) : (raceSkillsData as any)?.raceSkills &&
                  (raceSkillsData as any).raceSkills.length > 0 ? (
                  <div className='space-y-2'>
                    {(raceSkillsData as any).raceSkills.map((skill: any) => (
                      <div
                        key={skill.id}
                        className='flex items-center justify-between p-2 bg-muted rounded'
                      >
                        <div>
                          <div className='font-medium text-sm'>
                            {skill.skillName}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {skill.category}
                          </div>
                        </div>
                        {skill.bonus > 0 && (
                          <span className='text-xs bg-green-950/30 text-green-400 px-2 py-1 rounded'>
                            +{skill.bonus} bonus
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No abilities or spells assigned
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className='mt-6'>
            {canEdit && (
              <Button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsEditOpen(true);
                  setEditingRace(selectedRace);
                  setFormData({
                    playable: selectedRace.playable,
                    humanoid: selectedRace.humanoid,
                    magical: selectedRace.magical,
                    maxStrength: selectedRace.maxStrength,
                    maxDexterity: selectedRace.maxDexterity,
                    maxIntelligence: selectedRace.maxIntelligence,
                    maxWisdom: selectedRace.maxWisdom,
                    maxConstitution: selectedRace.maxConstitution,
                    maxCharisma: selectedRace.maxCharisma,
                    expFactor: selectedRace.expFactor,
                    hpFactor: selectedRace.hpFactor,
                  });
                }}
              >
                <Pencil className='h-4 w-4 mr-2' />
                Edit Race
              </Button>
            )}
            <Button variant='outline' onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
