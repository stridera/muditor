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
import { ColoredInput } from '@/components/ColoredInput';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const GET_SOCIALS = gql`
  query GetSocialsPage {
    socials {
      id
      name
      hide
      minVictimPosition
      charNoArg
      othersNoArg
      charFound
      othersFound
      victFound
      notFound
      charAuto
      othersAuto
    }
    socialsCount
  }
`;

const CREATE_SOCIAL = gql`
  mutation CreateSocialPage($data: CreateSocialInput!) {
    createSocial(data: $data) {
      id
      name
      hide
      minVictimPosition
    }
  }
`;

const UPDATE_SOCIAL = gql`
  mutation UpdateSocialPage($id: ID!, $data: UpdateSocialInput!) {
    updateSocial(id: $id, data: $data) {
      id
      name
      hide
      minVictimPosition
      charNoArg
      othersNoArg
      charFound
      othersFound
      victFound
      notFound
      charAuto
      othersAuto
    }
  }
`;

const DELETE_SOCIAL = gql`
  mutation DeleteSocialPage($id: ID!) {
    deleteSocial(id: $id)
  }
`;

// Position enum values
const POSITIONS = [
  'DEAD',
  'MORTALLY_WOUNDED',
  'INCAPACITATED',
  'STUNNED',
  'SLEEPING',
  'RESTING',
  'SITTING',
  'FIGHTING',
  'STANDING',
  'FLYING',
];

type SocialFormData = {
  name: string;
  hide: boolean;
  minVictimPosition: string;
  charNoArg: string;
  othersNoArg: string;
  charFound: string;
  othersFound: string;
  victFound: string;
  notFound: string;
  charAuto: string;
  othersAuto: string;
};

const defaultFormData: SocialFormData = {
  name: '',
  hide: false,
  minVictimPosition: 'STANDING',
  charNoArg: '',
  othersNoArg: '',
  charFound: '',
  othersFound: '',
  victFound: '',
  notFound: '',
  charAuto: '',
  othersAuto: '',
};

export default function SocialsPage() {
  const { isGod } = usePermissions();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<any>(null);
  const [selectedSocial, setSelectedSocial] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<SocialFormData>(defaultFormData);

  const { data, loading, error, refetch } = useQuery(GET_SOCIALS);

  const [createSocial, { loading: creating }] = useMutation(CREATE_SOCIAL, {
    onCompleted: () => {
      setSuccessMessage('Social created successfully');
      setErrorMessage('');
      setIsCreateOpen(false);
      setFormData(defaultFormData);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const [updateSocial, { loading: updating }] = useMutation(UPDATE_SOCIAL, {
    onCompleted: () => {
      setSuccessMessage('Social updated successfully');
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

  const [deleteSocial, { loading: deleting }] = useMutation(DELETE_SOCIAL, {
    onCompleted: () => {
      setSuccessMessage('Social deleted successfully');
      setErrorMessage('');
      setIsDeleteOpen(false);
      setSelectedSocial(null);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const filteredSocials = useMemo(() => {
    const socials = (data as any)?.socials || [];
    if (!searchQuery) return socials;
    return socials.filter((social: any) =>
      social.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleSocialClick = (social: any) => {
    setSelectedSocial(social);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (social: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSocial(social);
    setFormData({
      name: social.name,
      hide: social.hide,
      minVictimPosition: social.minVictimPosition,
      charNoArg: social.charNoArg || '',
      othersNoArg: social.othersNoArg || '',
      charFound: social.charFound || '',
      othersFound: social.othersFound || '',
      victFound: social.victFound || '',
      notFound: social.notFound || '',
      charAuto: social.charAuto || '',
      othersAuto: social.othersAuto || '',
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (social: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSocial(social);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSocial({
      variables: {
        data: {
          name: formData.name.toLowerCase().trim(),
          hide: formData.hide,
          minVictimPosition: formData.minVictimPosition,
          charNoArg: formData.charNoArg || null,
          othersNoArg: formData.othersNoArg || null,
          charFound: formData.charFound || null,
          othersFound: formData.othersFound || null,
          victFound: formData.victFound || null,
          notFound: formData.notFound || null,
          charAuto: formData.charAuto || null,
          othersAuto: formData.othersAuto || null,
        },
      },
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSocial({
      variables: {
        id: editingSocial.id,
        data: {
          hide: formData.hide,
          minVictimPosition: formData.minVictimPosition,
          charNoArg: formData.charNoArg || null,
          othersNoArg: formData.othersNoArg || null,
          charFound: formData.charFound || null,
          othersFound: formData.othersFound || null,
          victFound: formData.victFound || null,
          notFound: formData.notFound || null,
          charAuto: formData.charAuto || null,
          othersAuto: formData.othersAuto || null,
        },
      },
    });
  };

  const handleDeleteConfirm = async () => {
    await deleteSocial({
      variables: { id: selectedSocial.id },
    });
  };

  const canEdit = isGod;

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
        <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            Error loading socials: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>Socials</h1>
        <p className='text-muted-foreground'>
          Manage social commands (emotes/actions) -{' '}
          {(data as any)?.socialsCount || 0} total
        </p>
      </div>

      {successMessage && (
        <Alert className='mb-4 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'>
          <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
          <AlertDescription className='text-green-800 dark:text-green-300'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className='mb-4 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between items-center mb-4 gap-4'>
        <Input
          placeholder='Search socials...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
        {canEdit && (
          <Button
            onClick={() => {
              setFormData(defaultFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Social
          </Button>
        )}
      </div>

      <div className='border border-border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>No-Arg Message</TableHead>
              <TableHead>Target Message</TableHead>
              <TableHead>Flags</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSocials.length > 0 ? (
              filteredSocials.map((social: any) => (
                <TableRow
                  key={social.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleSocialClick(social)}
                >
                  <TableCell className='font-medium font-mono text-foreground'>
                    {social.name}
                  </TableCell>
                  <TableCell className='max-w-xs truncate text-sm font-mono'>
                    {social.charNoArg ? (
                      <ColoredTextInline markup={social.charNoArg} />
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell className='max-w-xs truncate text-sm font-mono'>
                    {social.charFound ? (
                      <ColoredTextInline markup={social.charFound} />
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      {social.hide && (
                        <span className='text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded'>
                          Hidden
                        </span>
                      )}
                      <span className='text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded'>
                        {social.minVictimPosition}
                      </span>
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={e => handleEditClick(social, e)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={e => handleDeleteClick(social, e)}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
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
                  {searchQuery
                    ? 'No socials match your search'
                    : 'No socials found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-mono'>
              {selectedSocial?.name}
            </DialogTitle>
            <DialogDescription>
              Social command details and message templates
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue='no-target' className='mt-4'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='no-target'>No Target</TabsTrigger>
              <TabsTrigger value='with-target'>With Target</TabsTrigger>
              <TabsTrigger value='self-target'>Self Target</TabsTrigger>
            </TabsList>

            <TabsContent value='no-target' className='space-y-4 mt-4'>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Actor
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.charNoArg ? (
                    <ColoredTextInline markup={selectedSocial.charNoArg} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Room
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.othersNoArg ? (
                    <ColoredTextInline markup={selectedSocial.othersNoArg} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='with-target' className='space-y-4 mt-4'>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Actor
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.charFound ? (
                    <ColoredTextInline markup={selectedSocial.charFound} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Room
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.othersFound ? (
                    <ColoredTextInline markup={selectedSocial.othersFound} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Target
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.victFound ? (
                    <ColoredTextInline markup={selectedSocial.victFound} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Target Not Found
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.notFound ? (
                    <ColoredTextInline markup={selectedSocial.notFound} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='self-target' className='space-y-4 mt-4'>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Actor
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.charAuto ? (
                    <ColoredTextInline markup={selectedSocial.charAuto} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Message to Room
                </Label>
                <div className='text-sm bg-muted p-2 rounded mt-1 font-mono'>
                  {selectedSocial?.othersAuto ? (
                    <ColoredTextInline markup={selectedSocial.othersAuto} />
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Not set
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className='mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
            <h4 className='text-sm font-medium text-blue-800 dark:text-blue-300 mb-2'>
              Template Variables
            </h4>
            <div className='text-xs text-blue-700 dark:text-blue-400 grid grid-cols-2 gap-1'>
              <span>
                <code>{'{actor.name}'}</code> - Actor&apos;s name
              </span>
              <span>
                <code>{'{target.name}'}</code> - Target&apos;s name
              </span>
              <span>
                <code>{'{actor.pronoun.subjective}'}</code> - he/she/they
              </span>
              <span>
                <code>{'{actor.pronoun.objective}'}</code> - him/her/them
              </span>
              <span>
                <code>{'{actor.pronoun.possessive}'}</code> - his/her/their
              </span>
              <span>
                <code>{'{actor.pronoun.reflexive}'}</code> -
                himself/herself/themselves
              </span>
            </div>
          </div>

          <DialogFooter className='mt-6'>
            {canEdit && (
              <Button
                variant='outline'
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleEditClick(selectedSocial, {
                    stopPropagation: () => {},
                  } as React.MouseEvent);
                }}
              >
                <Pencil className='h-4 w-4 mr-2' />
                Edit
              </Button>
            )}
            <Button variant='outline' onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create Social</DialogTitle>
              <DialogDescription>
                Add a new social command with message templates
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              {/* Settings Section */}
              <div className='p-4 border border-border rounded-lg bg-muted/30'>
                <h3 className='text-sm font-semibold text-foreground mb-3'>
                  Settings
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='name'>Command Name</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='e.g., wave, bow, hug'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='minVictimPosition'>
                      Min Target Position
                    </Label>
                    <Select
                      value={formData.minVictimPosition}
                      onValueChange={value =>
                        setFormData({ ...formData, minVictimPosition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map(pos => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='flex items-center space-x-2 mt-3'>
                  <Checkbox
                    id='hide'
                    checked={formData.hide}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, hide: checked })
                    }
                  />
                  <Label htmlFor='hide' className='cursor-pointer'>
                    Hide initiator (don&apos;t show who performed the action)
                  </Label>
                </div>
              </div>

              {/* Messages Section */}
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-3'>
                  Messages
                </h3>
                <Tabs defaultValue='no-target'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='no-target'>No Target</TabsTrigger>
                    <TabsTrigger value='with-target'>With Target</TabsTrigger>
                    <TabsTrigger value='self-target'>Self Target</TabsTrigger>
                  </TabsList>

                  <TabsContent value='no-target' className='space-y-4 mt-4'>
                    <div>
                      <Label htmlFor='charNoArg'>Message to Actor</Label>
                      <ColoredInput
                        id='charNoArg'
                        value={formData.charNoArg}
                        onChange={value =>
                          setFormData({ ...formData, charNoArg: value })
                        }
                        placeholder='e.g., You wave.'
                      />
                    </div>
                    <div>
                      <Label htmlFor='othersNoArg'>Message to Room</Label>
                      <ColoredInput
                        id='othersNoArg'
                        value={formData.othersNoArg}
                        onChange={value =>
                          setFormData({ ...formData, othersNoArg: value })
                        }
                        placeholder='e.g., {actor.name} waves.'
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='with-target' className='space-y-4 mt-4'>
                    <div>
                      <Label htmlFor='charFound'>Message to Actor</Label>
                      <ColoredInput
                        id='charFound'
                        value={formData.charFound}
                        onChange={value =>
                          setFormData({ ...formData, charFound: value })
                        }
                        placeholder='e.g., You wave at {target.name}.'
                      />
                    </div>
                    <div>
                      <Label htmlFor='othersFound'>Message to Room</Label>
                      <ColoredInput
                        id='othersFound'
                        value={formData.othersFound}
                        onChange={value =>
                          setFormData({ ...formData, othersFound: value })
                        }
                        placeholder='e.g., {actor.name} waves at {target.name}.'
                      />
                    </div>
                    <div>
                      <Label htmlFor='victFound'>Message to Target</Label>
                      <ColoredInput
                        id='victFound'
                        value={formData.victFound}
                        onChange={value =>
                          setFormData({ ...formData, victFound: value })
                        }
                        placeholder='e.g., {actor.name} waves at you.'
                      />
                    </div>
                    <div>
                      <Label htmlFor='notFound'>Target Not Found</Label>
                      <ColoredInput
                        id='notFound'
                        value={formData.notFound}
                        onChange={value =>
                          setFormData({ ...formData, notFound: value })
                        }
                        placeholder='e.g., Wave at who?'
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='self-target' className='space-y-4 mt-4'>
                    <div>
                      <Label htmlFor='charAuto'>Message to Actor</Label>
                      <ColoredInput
                        id='charAuto'
                        value={formData.charAuto}
                        onChange={value =>
                          setFormData({ ...formData, charAuto: value })
                        }
                        placeholder='e.g., You wave at yourself like a fool.'
                      />
                    </div>
                    <div>
                      <Label htmlFor='othersAuto'>Message to Room</Label>
                      <ColoredInput
                        id='othersAuto'
                        value={formData.othersAuto}
                        onChange={value =>
                          setFormData({ ...formData, othersAuto: value })
                        }
                        placeholder='e.g., {actor.name} waves at {actor.pronoun.reflexive}.'
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={creating}>
                {creating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Social: {editingSocial?.name}</DialogTitle>
              <DialogDescription>
                Update social command message templates
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              {/* Settings Section */}
              <div className='p-4 border border-border rounded-lg bg-muted/30'>
                <h3 className='text-sm font-semibold text-foreground mb-3'>
                  Settings
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Command Name</Label>
                    <Input
                      value={editingSocial?.name || ''}
                      disabled
                      className='bg-muted'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Name cannot be changed
                    </p>
                  </div>
                  <div>
                    <Label htmlFor='editMinVictimPosition'>
                      Min Target Position
                    </Label>
                    <Select
                      value={formData.minVictimPosition}
                      onValueChange={value =>
                        setFormData({ ...formData, minVictimPosition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map(pos => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='flex items-center space-x-2 mt-3'>
                  <Checkbox
                    id='editHide'
                    checked={formData.hide}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, hide: checked })
                    }
                  />
                  <Label htmlFor='editHide' className='cursor-pointer'>
                    Hide initiator (don&apos;t show who performed the action)
                  </Label>
                </div>
              </div>

              {/* Messages Section */}
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-3'>
                  Messages
                </h3>
                <Tabs defaultValue='no-target'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='no-target'>No Target</TabsTrigger>
                    <TabsTrigger value='with-target'>With Target</TabsTrigger>
                    <TabsTrigger value='self-target'>Self Target</TabsTrigger>
                  </TabsList>

                  <TabsContent value='no-target' className='space-y-4 mt-4'>
                    <div>
                      <Label htmlFor='editCharNoArg'>Message to Actor</Label>
                      <ColoredInput
                        id='editCharNoArg'
                        value={formData.charNoArg}
                        onChange={value =>
                          setFormData({ ...formData, charNoArg: value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='editOthersNoArg'>Message to Room</Label>
                      <ColoredInput
                        id='editOthersNoArg'
                        value={formData.othersNoArg}
                        onChange={value =>
                          setFormData({ ...formData, othersNoArg: value })
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='with-target' className='space-y-4 mt-4'>
                    <div>
                      <Label htmlFor='editCharFound'>Message to Actor</Label>
                      <ColoredInput
                        id='editCharFound'
                        value={formData.charFound}
                        onChange={value =>
                          setFormData({ ...formData, charFound: value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='editOthersFound'>Message to Room</Label>
                      <ColoredInput
                        id='editOthersFound'
                        value={formData.othersFound}
                        onChange={value =>
                          setFormData({ ...formData, othersFound: value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='editVictFound'>Message to Target</Label>
                      <ColoredInput
                        id='editVictFound'
                        value={formData.victFound}
                        onChange={value =>
                          setFormData({ ...formData, victFound: value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='editNotFound'>Target Not Found</Label>
                      <ColoredInput
                        id='editNotFound'
                        value={formData.notFound}
                        onChange={value =>
                          setFormData({ ...formData, notFound: value })
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='self-target' className='space-y-4 mt-4'>
                    <div>
                      <Label htmlFor='editCharAuto'>Message to Actor</Label>
                      <ColoredInput
                        id='editCharAuto'
                        value={formData.charAuto}
                        onChange={value =>
                          setFormData({ ...formData, charAuto: value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='editOthersAuto'>Message to Room</Label>
                      <ColoredInput
                        id='editOthersAuto'
                        value={formData.othersAuto}
                        onChange={value =>
                          setFormData({ ...formData, othersAuto: value })
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-red-500' />
              Delete Social
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the social command &quot;
              {selectedSocial?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
