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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AssignSkillToClassDocument,
  CreateClassCircleDocument,
  GetAllAbilitiesDocument,
  GetClassCirclesDocument,
  GetClassesDocument,
  GetClassSkillsDocument,
  RemoveClassCircleDocument,
  RemoveClassSkillDocument,
  UpdateClassDocument,
  type AssignSkillToClassMutation,
  type AssignSkillToClassMutationVariables,
  type CreateClassCircleMutation,
  type CreateClassCircleMutationVariables,
  type GetAllAbilitiesQuery,
  type GetClassCirclesQuery,
  type GetClassesQuery,
  type GetClassSkillsQuery,
  type RemoveClassCircleMutation,
  type RemoveClassCircleMutationVariables,
  type RemoveClassSkillMutation,
  type RemoveClassSkillMutationVariables,
  type UpdateClassMutation,
  type UpdateClassMutationVariables,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ColoredText } from '@/components/ColoredText';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';

// Helper function to ensure numeric IDs
const toNumericId = (id: number | string): number => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
  if (isNaN(numId)) {
    throw new Error(`Invalid ID: ${id}`);
  }
  return numId;
};
// Inline GraphQL operations removed; using generated documents.

type ClassData = {
  id: string;
  name: string;
  description?: string | null;
  hitDice: string;
  primaryStat?: string | null;
};

// Derived type aliases for improved type safety
type ClassSkill = GetClassSkillsQuery['classSkills'][number];
type Ability = GetAllAbilitiesQuery['abilities'][number];
type ClassCircle = GetClassCirclesQuery['classCirclesList'][number];
type CircleSpell = NonNullable<ClassCircle['spells']>[number];

export default function ClassesPage() {
  const { isBuilder, isCoder, isGod } = usePermissions();
  const apolloClient = useApolloClient();

  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Class details state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hitDice: '',
    primaryStat: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Skills state
  const [classSkills, setClassSkills] = useState<
    GetClassSkillsQuery['classSkills']
  >([]);
  const [availableSkills, setAvailableSkills] = useState<
    GetAllAbilitiesQuery['abilities']
  >([]);
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillId: '',
    category: 'SECONDARY',
    minLevel: 1,
    maxLevel: 100,
  });

  // Circles state
  const [classCircles, setClassCircles] = useState<
    GetClassCirclesQuery['classCirclesList']
  >([]);
  const [addingCircle, setAddingCircle] = useState(false);
  const [newCircle, setNewCircle] = useState({ circle: 1, minLevel: 1 });
  // Track expanded circle IDs (GraphQL returns string IDs, normalize to string)
  const [expandedCircles, setExpandedCircles] = useState<Set<string>>(
    new Set()
  );
  // Track which circle (string ID) is currently getting a new spell
  const [addingSpellToCircle, setAddingSpellToCircle] = useState<string | null>(
    null
  );
  const [availableSpells, setAvailableSpells] = useState<
    GetAllAbilitiesQuery['abilities']
  >([]);
  const [newSpell, setNewSpell] = useState({
    spellId: '',
    minLevel: 1,
    proficiencyGain: 15,
  });

  const {
    data: classesData,
    loading: classesLoading,
    refetch: refetchClasses,
  } = useQuery<GetClassesQuery>(GetClassesDocument);
  const { data: allSkillsData } = useQuery<GetAllAbilitiesQuery>(
    GetAllAbilitiesDocument,
    { variables: { abilityType: 'SKILL' } }
  );
  const { data: allSpellsData } = useQuery<GetAllAbilitiesQuery>(
    GetAllAbilitiesDocument,
    { variables: { abilityType: 'SPELL' } }
  );

  const [updateClass, { loading: updating }] = useMutation<
    UpdateClassMutation,
    UpdateClassMutationVariables
  >(UpdateClassDocument, {
    onCompleted: () => {
      setSuccessMessage('Class updated successfully');
      setIsEditing(false);
      refetchClasses();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const [assignSkillToClass] = useMutation<
    AssignSkillToClassMutation,
    AssignSkillToClassMutationVariables
  >(AssignSkillToClassDocument, {
    onCompleted: () => {
      if (selectedClass) {
        void loadClassData(Number(selectedClass.id));
      }
      setAddingSkill(false);
      setNewSkill({
        skillId: '',
        category: 'SECONDARY',
        minLevel: 1,
        maxLevel: 100,
      });
      setSuccessMessage('Skill assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const [removeClassSkill] = useMutation<
    RemoveClassSkillMutation,
    RemoveClassSkillMutationVariables
  >(RemoveClassSkillDocument, {
    onCompleted: data => {
      setClassSkills(
        classSkills.filter(s => s.id !== String(data.removeClassSkill))
      );
      setSuccessMessage('Skill removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const [createClassCircle] = useMutation<
    CreateClassCircleMutation,
    CreateClassCircleMutationVariables
  >(CreateClassCircleDocument, {
    onCompleted: () => {
      if (selectedClass) {
        void loadClassData(Number(selectedClass.id));
      }
      setAddingCircle(false);
      setNewCircle({ circle: 1, minLevel: 1 });
      setSuccessMessage('Spell circle added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const [removeClassCircle] = useMutation<
    RemoveClassCircleMutation,
    RemoveClassCircleMutationVariables
  >(RemoveClassCircleDocument, {
    onCompleted: data => {
      setClassCircles(
        classCircles.filter(c => c.id !== String(data.removeClassCircle))
      );
      setSuccessMessage('Spell circle removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const [assignSpellToClass] = useMutation<
    AssignSkillToClassMutation,
    AssignSkillToClassMutationVariables
  >(AssignSkillToClassDocument, {
    onCompleted: () => {
      // Reload the circle data to get updated spell list
      if (selectedClass) {
        void loadClassData(Number(selectedClass.id));
      }
      setAddingSpellToCircle(null);
      setNewSpell({ spellId: '', minLevel: 1, proficiencyGain: 15 });
      setSuccessMessage('Spell assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const [removeSpellClassCircle] = useMutation<
    RemoveClassSkillMutation,
    RemoveClassSkillMutationVariables
  >(RemoveClassSkillDocument, {
    onCompleted: () => {
      // Reload the circle data to get updated spell list
      if (selectedClass) {
        void loadClassData(Number(selectedClass.id));
      }
      setSuccessMessage('Spell removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  // Update available skills when data loads
  useEffect(() => {
    if (allSkillsData?.abilities) {
      setAvailableSkills(allSkillsData.abilities);
    }
  }, [allSkillsData]);

  // Update available spells when data loads
  useEffect(() => {
    if (allSpellsData?.abilities) {
      setAvailableSpells(allSpellsData.abilities);
    }
  }, [allSpellsData]);

  const loadClassData = useCallback(
    async (classId: number) => {
      try {
        const [skillsResult, circlesResult] = await Promise.all([
          apolloClient.query<GetClassSkillsQuery>({
            query: GetClassSkillsDocument,
            variables: { classId },
            fetchPolicy: 'network-only',
          }),
          apolloClient.query<GetClassCirclesQuery>({
            query: GetClassCirclesDocument,
            variables: { classId },
            fetchPolicy: 'network-only',
          }),
        ]);
        setClassSkills(skillsResult.data?.classSkills ?? []);
        setClassCircles(circlesResult.data?.classCirclesList ?? []);
      } catch (error) {
        console.error('Error loading class data:', error);
        setErrorMessage('Failed to load class data');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    },
    [apolloClient]
  );

  // Load class skills and circles when class is selected
  useEffect(() => {
    if (selectedClass) {
      void loadClassData(Number(selectedClass.id));
    }
  }, [selectedClass, loadClassData]);

  const handleClassSelect = (cls: ClassData) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      description: cls.description || '',
      hitDice: cls.hitDice,
      primaryStat: cls.primaryStat || '',
    });
    setIsEditing(false);
    setActiveTab('details');
  };

  const handleSaveDetails = async () => {
    if (!selectedClass) return;

    await updateClass({
      variables: {
        id: selectedClass.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          hitDice: formData.hitDice,
          primaryStat: formData.primaryStat || undefined,
        },
      },
    });
  };

  const handleAddSkill = () => {
    if (!newSkill.skillId || !selectedClass) return;

    assignSkillToClass({
      variables: {
        data: {
          classId: toNumericId(selectedClass.id),
          abilityId: parseInt(newSkill.skillId),
          minLevel: newSkill.minLevel,
        },
      },
    });
  };

  const handleAddCircle = () => {
    if (!selectedClass) return;

    createClassCircle({
      variables: {
        data: {
          classId: toNumericId(selectedClass.id),
          circle: newCircle.circle,
          minLevel: newCircle.minLevel,
        },
      },
    });
  };

  const handleAddSpell = () => {
    if (!newSpell.spellId || !selectedClass) return;

    assignSpellToClass({
      variables: {
        data: {
          abilityId: parseInt(newSpell.spellId),
          classId: toNumericId(selectedClass.id),
          minLevel: newSpell.minLevel,
        },
      },
    });
  };

  const toggleCircleExpanded = (circleId: string | number) => {
    const idStr = String(circleId);
    setExpandedCircles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idStr)) {
        newSet.delete(idStr);
      } else {
        newSet.add(idStr);
      }
      return newSet;
    });
  };

  const filteredClasses = useMemo(
    () =>
      classesData?.classes?.filter(cls =>
        (cls.plainName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      ) ?? [],
    [classesData, searchQuery]
  );

  const canEdit = isBuilder || isCoder || isGod;

  if (classesLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='flex h-[calc(100vh-4rem)]'>
      {/* Sidebar - Class List */}
      <div className='w-80 border-r bg-muted flex flex-col'>
        <div className='p-4 border-b bg-card'>
          <h2 className='text-lg font-semibold mb-2'>Classes</h2>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search classes...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-8'
            />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {filteredClasses?.map(cls => (
            <button
              key={cls.id}
              onClick={() => handleClassSelect(cls)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-accent transition-colors ${
                selectedClass?.id === cls.id
                  ? 'bg-accent border-l-4 border-l-primary'
                  : ''
              }`}
            >
              <div className='font-medium text-card-foreground'>
                {cls.plainName}
              </div>
              <div className='text-sm text-muted-foreground'>{cls.hitDice}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {successMessage && (
          <Alert className='mx-6 mt-4 bg-green-50 border-green-200'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <AlertDescription className='text-green-800'>
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className='mx-6 mt-4 bg-red-50 border-red-200'>
            <XCircle className='h-4 w-4 text-red-600' />
            <AlertDescription className='text-red-800'>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {selectedClass ? (
          <div className='flex-1 overflow-y-auto p-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className='flex justify-between items-center mb-4'>
                <TabsList>
                  <TabsTrigger value='details'>Details</TabsTrigger>
                  <TabsTrigger value='skills'>
                    Skills ({classSkills.length})
                  </TabsTrigger>
                  <TabsTrigger value='circles'>
                    Spell Circles ({classCircles.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value='details'>
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardTitle>
                          <ColoredText text={selectedClass.name} />
                        </CardTitle>
                        <CardDescription>
                          Class details and attributes
                        </CardDescription>
                      </div>
                      {canEdit && (
                        <div className='flex gap-2'>
                          {isEditing ? (
                            <>
                              <Button
                                variant='outline'
                                onClick={() => {
                                  setIsEditing(false);
                                  setFormData({
                                    name: selectedClass.name,
                                    description:
                                      selectedClass.description || '',
                                    hitDice: selectedClass.hitDice,
                                    primaryStat:
                                      selectedClass.primaryStat || '',
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveDetails}
                                disabled={updating}
                              >
                                {updating && (
                                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                )}
                                <Save className='h-4 w-4 mr-2' />
                                Save Changes
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => setIsEditing(true)}>
                              Edit
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='name'>Name (with color codes)</Label>
                      {isEditing ? (
                        <ColoredTextEditor
                          value={formData.name}
                          onChange={markup =>
                            setFormData({ ...formData, name: markup })
                          }
                          placeholder='e.g. <b:magenta>Sorcerer</>'
                          maxLength={100}
                          showPreview={true}
                        />
                      ) : (
                        <div className='p-3 border rounded-md bg-muted/30 min-h-[50px]'>
                          <ColoredText text={formData.name} />
                        </div>
                      )}
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='hitDice'>Hit Dice</Label>
                      <Input
                        id='hitDice'
                        value={formData.hitDice}
                        onChange={e =>
                          setFormData({ ...formData, hitDice: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='primaryStat'>Primary Stat</Label>
                      <Input
                        id='primaryStat'
                        value={formData.primaryStat}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            primaryStat: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder='e.g., Strength'
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='description'>Description</Label>
                      <Textarea
                        id='description'
                        value={formData.description}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        rows={6}
                        placeholder='Describe the class...'
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='skills'>
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardTitle>Class Skills</CardTitle>
                        <CardDescription>
                          Skills available to the {selectedClass.name} class
                        </CardDescription>
                      </div>
                      {canEdit && !addingSkill && (
                        <Button onClick={() => setAddingSkill(true)}>
                          <Plus className='h-4 w-4 mr-2' />
                          Add Skill
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {addingSkill && (
                      <div className='border rounded-lg p-4 mb-4 bg-muted space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='grid gap-2'>
                            <Label>Skill</Label>
                            <Select
                              value={newSkill.skillId}
                              onValueChange={value =>
                                setNewSkill({ ...newSkill, skillId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select a skill' />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSkills.map((skill: Ability) => (
                                  <SelectItem
                                    key={skill.id}
                                    value={skill.id.toString()}
                                  >
                                    {skill.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='grid gap-2'>
                            <Label>Category</Label>
                            <Select
                              value={newSkill.category}
                              onValueChange={value =>
                                setNewSkill({ ...newSkill, category: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='PRIMARY'>Primary</SelectItem>
                                <SelectItem value='SECONDARY'>
                                  Secondary
                                </SelectItem>
                                <SelectItem value='TERTIARY'>
                                  Tertiary
                                </SelectItem>
                                <SelectItem value='FORBIDDEN'>
                                  Forbidden
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          <div className='grid gap-2'>
                            <Label>Min Level</Label>
                            <Input
                              type='number'
                              min='1'
                              value={newSkill.minLevel}
                              onChange={e =>
                                setNewSkill({
                                  ...newSkill,
                                  minLevel: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label>Max Level</Label>
                            <Input
                              type='number'
                              min='1'
                              value={newSkill.maxLevel}
                              onChange={e =>
                                setNewSkill({
                                  ...newSkill,
                                  maxLevel: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            onClick={() => {
                              setAddingSkill(false);
                              setNewSkill({
                                skillId: '',
                                category: 'SECONDARY',
                                minLevel: 1,
                                maxLevel: 100,
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddSkill}
                            disabled={!newSkill.skillId}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className='border rounded-lg'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Skill</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Min Level</TableHead>
                            <TableHead>Max Level</TableHead>
                            {canEdit && (
                              <TableHead className='text-right'>
                                Actions
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classSkills.length > 0 ? (
                            classSkills.map((skill: ClassSkill) => (
                              <TableRow key={skill.id}>
                                <TableCell className='font-medium'>
                                  {skill.skillName}
                                </TableCell>
                                <TableCell>
                                  <span className='capitalize'>
                                    {(skill.category ?? '').toLowerCase() ||
                                      '—'}
                                  </span>
                                </TableCell>
                                <TableCell>{skill.minLevel}</TableCell>
                                <TableCell>{skill.maxLevel}</TableCell>
                                {canEdit && (
                                  <TableCell className='text-right'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        removeClassSkill({
                                          variables: { id: skill.id },
                                        })
                                      }
                                    >
                                      <Trash2 className='h-4 w-4 text-red-600' />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={canEdit ? 5 : 4}
                                className='text-center text-muted-foreground py-8'
                              >
                                No skills assigned to this class
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='circles'>
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardTitle>Spell Circles</CardTitle>
                        <CardDescription>
                          Spell progression for the {selectedClass.name} class
                        </CardDescription>
                      </div>
                      {canEdit && !addingCircle && (
                        <Button onClick={() => setAddingCircle(true)}>
                          <Plus className='h-4 w-4 mr-2' />
                          Add Circle
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {addingCircle && (
                      <div className='border rounded-lg p-4 mb-4 bg-muted space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='grid gap-2'>
                            <Label>Circle Number</Label>
                            <Input
                              type='number'
                              min='1'
                              max='9'
                              value={newCircle.circle}
                              onChange={e =>
                                setNewCircle({
                                  ...newCircle,
                                  circle: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label>Min Level</Label>
                            <Input
                              type='number'
                              min='1'
                              value={newCircle.minLevel}
                              onChange={e =>
                                setNewCircle({
                                  ...newCircle,
                                  minLevel: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            onClick={() => {
                              setAddingCircle(false);
                              setNewCircle({ circle: 1, minLevel: 1 });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddCircle}>Add</Button>
                        </div>
                      </div>
                    )}

                    <div className='border rounded-lg'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='w-12'></TableHead>
                            <TableHead>Circle</TableHead>
                            <TableHead>Min Level</TableHead>
                            <TableHead>Spells</TableHead>
                            {canEdit && (
                              <TableHead className='text-right'>
                                Actions
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classCircles.length > 0 ? (
                            classCircles.map((circle: ClassCircle) => {
                              const isExpanded = expandedCircles.has(circle.id);
                              return (
                                <Fragment key={circle.id}>
                                  <TableRow className='hover:bg-muted'>
                                    <TableCell>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          toggleCircleExpanded(circle.id)
                                        }
                                        className='h-6 w-6 p-0'
                                      >
                                        {isExpanded ? (
                                          <ChevronDown className='h-4 w-4' />
                                        ) : (
                                          <ChevronRight className='h-4 w-4' />
                                        )}
                                      </Button>
                                    </TableCell>
                                    <TableCell className='font-medium'>
                                      Circle {circle.circle}
                                    </TableCell>
                                    <TableCell>{circle.minLevel}</TableCell>
                                    <TableCell>
                                      <span className='text-sm text-muted-foreground'>
                                        {circle.spells?.length || 0} spells
                                      </span>
                                    </TableCell>
                                    {canEdit && (
                                      <TableCell className='text-right'>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            removeClassCircle({
                                              variables: { id: circle.id },
                                            })
                                          }
                                        >
                                          <Trash2 className='h-4 w-4 text-red-600' />
                                        </Button>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                  {isExpanded && (
                                    <TableRow key={`${circle.id}-spells`}>
                                      <TableCell
                                        colSpan={canEdit ? 5 : 4}
                                        className='bg-muted p-0'
                                      >
                                        <div className='px-4 py-3'>
                                          <div className='flex justify-between items-center mb-2'>
                                            <div className='text-sm font-medium text-foreground'>
                                              Spells in Circle {circle.circle}
                                            </div>
                                            {canEdit &&
                                              addingSpellToCircle !==
                                                String(circle.id) && (
                                                <Button
                                                  size='sm'
                                                  variant='outline'
                                                  onClick={() =>
                                                    setAddingSpellToCircle(
                                                      String(circle.id)
                                                    )
                                                  }
                                                >
                                                  <Plus className='h-3 w-3 mr-1' />
                                                  Add Spell
                                                </Button>
                                              )}
                                          </div>

                                          {addingSpellToCircle ===
                                            String(circle.id) && (
                                            <div className='border rounded-lg p-3 mb-3 bg-white space-y-2'>
                                              <div className='grid grid-cols-3 gap-2'>
                                                <div className='grid gap-1'>
                                                  <Label className='text-xs'>
                                                    Spell
                                                  </Label>
                                                  <Select
                                                    value={newSpell.spellId}
                                                    onValueChange={value =>
                                                      setNewSpell({
                                                        ...newSpell,
                                                        spellId: value,
                                                      })
                                                    }
                                                  >
                                                    <SelectTrigger className='h-8 text-xs'>
                                                      <SelectValue placeholder='Select spell' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {availableSpells.map(
                                                        (spell: Ability) => (
                                                          <SelectItem
                                                            key={spell.id}
                                                            value={spell.id.toString()}
                                                          >
                                                            {spell.name}
                                                          </SelectItem>
                                                        )
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className='grid gap-1'>
                                                  .{' '}
                                                  <Label className='text-xs'>
                                                    Min Level
                                                  </Label>
                                                  <Input
                                                    type='number'
                                                    min='1'
                                                    className='h-8 text-xs'
                                                    value={newSpell.minLevel}
                                                    onChange={e =>
                                                      setNewSpell({
                                                        ...newSpell,
                                                        minLevel: parseInt(
                                                          e.target.value
                                                        ),
                                                      })
                                                    }
                                                  />
                                                </div>
                                                <div className='grid gap-1'>
                                                  <Label className='text-xs'>
                                                    Proficiency Gain
                                                  </Label>
                                                  <Input
                                                    type='number'
                                                    min='0'
                                                    className='h-8 text-xs'
                                                    value={
                                                      newSpell.proficiencyGain
                                                    }
                                                    onChange={e =>
                                                      setNewSpell({
                                                        ...newSpell,
                                                        proficiencyGain:
                                                          parseInt(
                                                            e.target.value
                                                          ),
                                                      })
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className='flex justify-end gap-2'>
                                                <Button
                                                  size='sm'
                                                  variant='outline'
                                                  onClick={() => {
                                                    setAddingSpellToCircle(
                                                      null
                                                    );
                                                    setNewSpell({
                                                      spellId: '',
                                                      minLevel: 1,
                                                      proficiencyGain: 15,
                                                    });
                                                  }}
                                                >
                                                  Cancel
                                                </Button>
                                                <Button
                                                  size='sm'
                                                  onClick={() =>
                                                    handleAddSpell()
                                                  }
                                                  disabled={!newSpell.spellId}
                                                >
                                                  Add
                                                </Button>
                                              </div>
                                            </div>
                                          )}

                                          {circle.spells &&
                                          circle.spells.length > 0 ? (
                                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                                              {circle.spells.map(
                                                (spell: CircleSpell) => (
                                                  <div
                                                    key={spell.id}
                                                    className='flex items-center justify-between p-2 bg-white rounded border'
                                                  >
                                                    <div className='flex-1'>
                                                      <span className='text-sm'>
                                                        {spell.spellName}
                                                      </span>
                                                      {spell.minLevel && (
                                                        <span className='text-xs text-muted-foreground ml-2'>
                                                          Lv {spell.minLevel}
                                                        </span>
                                                      )}
                                                    </div>
                                                    {canEdit && (
                                                      <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-6 w-6 p-0'
                                                        onClick={() =>
                                                          removeSpellClassCircle(
                                                            {
                                                              variables: {
                                                                id: spell.id,
                                                              },
                                                            }
                                                          )
                                                        }
                                                      >
                                                        <Trash2 className='h-3 w-3 text-red-600' />
                                                      </Button>
                                                    )}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            !addingSpellToCircle && (
                                              <div className='text-sm text-muted-foreground text-center py-2'>
                                                No spells configured for this
                                                circle
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Fragment>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={canEdit ? 5 : 4}
                                className='text-center text-muted-foreground py-8'
                              >
                                No spell circles configured for this class
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center text-muted-foreground'>
            <div className='text-center'>
              <div className='text-lg font-medium'>No class selected</div>
              <div className='text-sm'>
                Select a class from the sidebar to view details
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
