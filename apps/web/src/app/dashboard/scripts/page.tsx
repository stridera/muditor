'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import ScriptEditor, { type Script } from '@/components/ScriptEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { gql } from '@/generated/gql';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  AlertTriangle,
  Check,
  Database,
  Edit,
  FileText,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

// GraphQL queries
const GET_TRIGGERS = gql(`
  query GetTriggersForScriptsPage {
    triggers {
      id
      name
      attachType
      numArgs
      argList
      commands
      zoneId
      mobId
      objectId
      flags
      needsReview
      syntaxError
      legacyVnum
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`);

const CREATE_TRIGGER = gql(`
  mutation CreateTriggerFromScriptsPage($input: CreateTriggerInput!) {
    createTrigger(input: $input) {
      id
      name
      attachType
      commands
      zoneId
      mobId
      objectId
      needsReview
    }
  }
`);

const UPDATE_TRIGGER = gql(`
  mutation UpdateTriggerFromScriptsPage($id: Float!, $input: UpdateTriggerInput!) {
    updateTrigger(id: $id, input: $input) {
      id
      name
      attachType
      commands
      zoneId
      mobId
      objectId
      needsReview
    }
  }
`);

const DELETE_TRIGGER = gql(`
  mutation DeleteTriggerFromScriptsPage($id: Float!) {
    deleteTrigger(id: $id) {
      id
    }
  }
`);

const MARK_REVIEWED = gql(`
  mutation MarkTriggerReviewedFromScriptsPage($triggerId: Int!) {
    markTriggerReviewed(triggerId: $triggerId) {
      id
      needsReview
    }
  }
`);

interface TriggerData {
  id: number;
  name: string;
  attachType: string;
  numArgs: number;
  argList: string[];
  commands: string;
  zoneId?: number | null;
  mobId?: number | null;
  objectId?: number | null;
  flags: string[];
  needsReview: boolean;
  syntaxError?: string | null;
  legacyVnum?: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

// Convert TriggerData to ScriptEditor's Script interface
const convertTriggerToScript = (trigger: TriggerData): Script => ({
  id: trigger.id.toString(),
  name: trigger.name,
  attachType: trigger.attachType,
  numArgs: trigger.numArgs,
  argList: trigger.argList?.join(', '),
  commands: trigger.commands,
  variables: {},
  zoneId: trigger.zoneId ?? undefined,
  mobId: trigger.mobId ?? undefined,
  objectId: trigger.objectId ?? undefined,
});

function ScriptsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterReview, setFilterReview] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerData | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch triggers from API
  const { data, loading, error, refetch } = useQuery(GET_TRIGGERS);
  const [createTrigger] = useMutation(CREATE_TRIGGER);
  const [updateTrigger] = useMutation(UPDATE_TRIGGER);
  const [deleteTrigger] = useMutation(DELETE_TRIGGER);
  const [markReviewed] = useMutation(MARK_REVIEWED);

  const triggers: TriggerData[] = (data?.triggers as TriggerData[]) ?? [];

  const filteredTriggers = triggers.filter(trigger => {
    const matchesSearch =
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.commands.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trigger.legacyVnum?.toString().includes(searchTerm) ?? false);
    const matchesType =
      filterType === 'all' || trigger.attachType === filterType;
    const matchesReview =
      filterReview === 'all' ||
      (filterReview === 'needs_review' && trigger.needsReview) ||
      (filterReview === 'reviewed' && !trigger.needsReview);
    return matchesSearch && matchesType && matchesReview;
  });

  const handleNewScript = () => {
    setSelectedTrigger(null);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEditScript = (trigger: TriggerData) => {
    setSelectedTrigger(trigger);
    setIsCreating(false);
    setIsEditing(true);
  };

  const handleSaveScript = async (script: Partial<Script>) => {
    try {
      if (isCreating) {
        await createTrigger({
          variables: {
            input: {
              name: script.name || 'New Script',
              attachType:
                (script.attachType as 'MOB' | 'OBJECT' | 'WORLD') || 'MOB',
              commands: script.commands || '-- New script\n',
              argList: script.argList?.split(',').map(s => s.trim()) || [],
            },
          },
        });
      } else if (selectedTrigger) {
        await updateTrigger({
          variables: {
            id: selectedTrigger.id,
            input: {
              name: script.name,
              attachType: script.attachType as 'MOB' | 'OBJECT' | 'WORLD',
              commands: script.commands,
              argList: script.argList?.split(',').map(s => s.trim()),
            },
          },
        });
      }
      await refetch();
      setIsEditing(false);
      setSelectedTrigger(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to save script:', err);
    }
  };

  const handleDeleteScript = async (id: number) => {
    if (confirm('Are you sure you want to delete this script?')) {
      try {
        await deleteTrigger({ variables: { id } });
        await refetch();
      } catch (err) {
        console.error('Failed to delete script:', err);
      }
    }
  };

  const handleMarkReviewed = async (triggerId: number) => {
    try {
      await markReviewed({ variables: { triggerId } });
      await refetch();
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MOB':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'OBJECT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'WORLD':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getAttachmentLabel = (trigger: TriggerData) => {
    if (trigger.mobId) return `Mob ${trigger.zoneId}:${trigger.mobId}`;
    if (trigger.objectId) return `Object ${trigger.zoneId}:${trigger.objectId}`;
    if (trigger.zoneId) return `Zone ${trigger.zoneId}`;
    return 'Unattached';
  };

  if (isEditing) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>
              {isCreating ? 'New Script' : 'Edit Script'}
            </h1>
            <div className='space-x-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditing(false);
                  setSelectedTrigger(null);
                  setIsCreating(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        <ScriptEditor
          script={
            selectedTrigger
              ? convertTriggerToScript(selectedTrigger)
              : undefined
          }
          onSave={handleSaveScript}
        />
      </div>
    );
  }

  const needsReviewCount = triggers.filter(t => t.needsReview).length;

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Scripts</h1>
            <p className='text-muted-foreground mt-1'>
              Manage Lua scripts for mobs, objects, and zones
              {needsReviewCount > 0 && (
                <span className='ml-2 text-yellow-600 dark:text-yellow-400'>
                  ({needsReviewCount} need review)
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleNewScript}>
            <Plus className='w-4 h-4 mr-2' />
            New Script
          </Button>
        </div>
      </div>

      <div className='mb-6 flex gap-4 flex-wrap'>
        <div className='relative flex-1 min-w-[200px]'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, content, or legacy vnum...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Types</SelectItem>
            <SelectItem value='MOB'>Mob</SelectItem>
            <SelectItem value='OBJECT'>Object</SelectItem>
            <SelectItem value='WORLD'>World/Zone</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterReview} onValueChange={setFilterReview}>
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Scripts</SelectItem>
            <SelectItem value='needs_review'>Needs Review</SelectItem>
            <SelectItem value='reviewed'>Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='text-muted-foreground mt-2'>Loading scripts...</p>
        </div>
      ) : error ? (
        <div className='text-center py-8 text-destructive'>
          <p>Error loading scripts: {error.message}</p>
          <Button variant='outline' className='mt-4' onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTriggers.length === 0 ? (
            <div className='col-span-full text-center py-8 text-muted-foreground'>
              <FileText className='w-12 h-12 mx-auto mb-2 opacity-50' />
              <p>No scripts found matching your criteria</p>
            </div>
          ) : (
            filteredTriggers.map(trigger => (
              <Card
                key={trigger.id}
                className={`hover:shadow-md transition-shadow ${
                  trigger.needsReview
                    ? 'border-yellow-500 dark:border-yellow-600'
                    : ''
                }`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1 flex-1 min-w-0'>
                      <CardTitle className='text-base truncate'>
                        {trigger.name}
                      </CardTitle>
                      <div className='flex gap-2 flex-wrap'>
                        <Badge className={getTypeColor(trigger.attachType)}>
                          {trigger.attachType}
                        </Badge>
                        {trigger.needsReview && (
                          <Badge
                            variant='outline'
                            className='text-yellow-600 border-yellow-600 dark:text-yellow-400 dark:border-yellow-400'
                          >
                            <AlertTriangle className='w-3 h-3 mr-1' />
                            Review
                          </Badge>
                        )}
                        {trigger.legacyVnum && (
                          <Badge variant='secondary' className='text-xs'>
                            v{trigger.legacyVnum}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className='flex space-x-1'>
                      {trigger.needsReview && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleMarkReviewed(trigger.id)}
                          title='Mark as reviewed'
                        >
                          <Check className='w-4 h-4 text-green-600' />
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEditScript(trigger)}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteScript(trigger.id)}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='space-y-2'>
                    <div className='flex items-center text-sm text-muted-foreground'>
                      <Database className='w-3 h-3 mr-1' />
                      {getAttachmentLabel(trigger)}
                    </div>
                    {trigger.syntaxError && (
                      <div className='text-xs text-destructive bg-destructive/10 p-2 rounded'>
                        {trigger.syntaxError}
                      </div>
                    )}
                    <div className='bg-muted rounded p-2 text-xs font-mono text-foreground max-h-20 overflow-hidden'>
                      {trigger.commands.split('\n').slice(0, 3).join('\n')}
                      {trigger.commands.split('\n').length > 3 && '\n...'}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Updated {new Date(trigger.updatedAt).toLocaleDateString()}
                      {trigger.updatedBy && ` by ${trigger.updatedBy}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Summary stats */}
      {!loading && !error && triggers.length > 0 && (
        <div className='mt-6 text-sm text-muted-foreground text-center'>
          Showing {filteredTriggers.length} of {triggers.length} scripts
        </div>
      )}
    </div>
  );
}

export default function ScriptsPage() {
  return (
    <PermissionGuard requireCoder={true}>
      <ScriptsPageContent />
    </PermissionGuard>
  );
}
