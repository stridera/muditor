'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import ScriptEditor, { type Script } from '@/components/ScriptEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlagBadge } from '@/components/ui/flag-badge';
import { Input } from '@/components/ui/input';
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
import { gql } from '@/generated/gql';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// GraphQL queries
const GET_TRIGGERS = gql(`
  query GetTriggersForScriptsPage {
    triggers {
      id
      zoneId
      name
      attachType
      numArgs
      argList
      commands
      mobZoneId
      mobId
      objectZoneId
      objectId
      flags
      needsReview
      syntaxError
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
      flags
      needsReview
    }
  }
`);

const UPDATE_TRIGGER = gql(`
  mutation UpdateTriggerFromScriptsPage($zoneId: Int!, $id: Int!, $input: UpdateTriggerInput!) {
    updateTrigger(zoneId: $zoneId, id: $id, input: $input) {
      id
      zoneId
      name
      attachType
      commands
      mobZoneId
      mobId
      objectZoneId
      objectId
      flags
      needsReview
    }
  }
`);

const DELETE_TRIGGER = gql(`
  mutation DeleteTriggerFromScriptsPage($zoneId: Int!, $id: Int!) {
    deleteTrigger(zoneId: $zoneId, id: $id) {
      id
      zoneId
    }
  }
`);

const MARK_REVIEWED = gql(`
  mutation MarkTriggerReviewedFromScriptsPage($zoneId: Int!, $id: Int!) {
    markTriggerReviewed(zoneId: $zoneId, id: $id) {
      id
      zoneId
      needsReview
    }
  }
`);

interface TriggerData {
  id: number;
  zoneId: number;
  name: string;
  attachType: string;
  numArgs: number;
  argList: string[];
  commands: string;
  mobZoneId?: number | null;
  mobId?: number | null;
  objectZoneId?: number | null;
  objectId?: number | null;
  flags: string[];
  needsReview: boolean;
  syntaxError?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

type SortKey =
  | 'id'
  | 'name'
  | 'attachType'
  | 'flags'
  | 'attachment'
  | 'lines'
  | 'updatedAt';
type SortDir = 'asc' | 'desc';

// Convert TriggerData to ScriptEditor's Script interface
const convertTriggerToScript = (trigger: TriggerData): Script => {
  const script: Script = {
    id: String(trigger.id),
    name: trigger.name,
    attachType: trigger.attachType,
    numArgs: trigger.numArgs,
    argList: trigger.argList?.join(', '),
    commands: trigger.commands,
    variables: {},
    flags: trigger.flags,
  };
  if (trigger.zoneId != null) script.zoneId = trigger.zoneId;
  if (trigger.mobId != null) script.mobId = trigger.mobId;
  if (trigger.objectId != null) script.objectId = trigger.objectId;
  return script;
};

function getLineCount(commands: string): number {
  return commands.split('\n').filter(l => l.trim().length > 0).length;
}

function getAttachmentLabel(trigger: TriggerData): string {
  if (trigger.mobId)
    return `Mob ${trigger.mobZoneId ?? trigger.zoneId}:${trigger.mobId}`;
  if (trigger.objectId)
    return `Obj ${trigger.objectZoneId ?? trigger.zoneId}:${trigger.objectId}`;
  return `Zone ${trigger.zoneId}`;
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'MOB':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'OBJECT':
      return 'bg-purple-500/10 text-purple-400';
    case 'WORLD':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function SortIcon({
  columnKey,
  sortKey,
  sortDir,
}: {
  columnKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== columnKey)
    return <ArrowUpDown className='w-3 h-3 ml-1 opacity-40' />;
  return sortDir === 'asc' ? (
    <ArrowUp className='w-3 h-3 ml-1' />
  ) : (
    <ArrowDown className='w-3 h-3 ml-1' />
  );
}

function ScriptsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterReview, setFilterReview] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerData | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data, loading, error, refetch } = useQuery(GET_TRIGGERS);
  const [createTrigger] = useMutation(CREATE_TRIGGER);
  const [updateTrigger] = useMutation(UPDATE_TRIGGER);
  const [deleteTrigger] = useMutation(DELETE_TRIGGER);
  const [markReviewed] = useMutation(MARK_REVIEWED);

  const triggers: TriggerData[] = (data?.triggers as TriggerData[]) ?? [];

  const filteredTriggers = useMemo(() => {
    return triggers.filter(trigger => {
      const matchesSearch =
        trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trigger.commands.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trigger.id.toString().includes(searchTerm) ||
        trigger.flags.some(f =>
          f.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesType =
        filterType === 'all' || trigger.attachType === filterType;
      const matchesReview =
        filterReview === 'all' ||
        (filterReview === 'needs_review' && trigger.needsReview) ||
        (filterReview === 'reviewed' && !trigger.needsReview);
      return matchesSearch && matchesType && matchesReview;
    });
  }, [triggers, searchTerm, filterType, filterReview]);

  const sortedTriggers = useMemo(() => {
    const sorted = [...filteredTriggers];
    const dir = sortDir === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'id': {
          const za = a.zoneId - b.zoneId;
          return za !== 0 ? za * dir : (a.id - b.id) * dir;
        }
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'attachType':
          return a.attachType.localeCompare(b.attachType) * dir;
        case 'flags':
          return (a.flags.length - b.flags.length) * dir;
        case 'attachment':
          return (
            getAttachmentLabel(a).localeCompare(getAttachmentLabel(b)) * dir
          );
        case 'lines':
          return (getLineCount(a.commands) - getLineCount(b.commands)) * dir;
        case 'updatedAt':
          return (
            (new Date(a.updatedAt).getTime() -
              new Date(b.updatedAt).getTime()) *
            dir
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredTriggers, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSelectedTrigger(null);
    setIsCreating(false);
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditing, handleCancel]);

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
      const flagsArray = script.flags ?? [];
      if (isCreating) {
        await createTrigger({
          variables: {
            input: {
              zoneId: script.zoneId || 1,
              name: script.name || 'New Script',
              attachType:
                (script.attachType as 'MOB' | 'OBJECT' | 'WORLD') || 'MOB',
              commands: script.commands || '-- New script\n',
              argList:
                script.argList
                  ?.split(',')
                  .map(s => s.trim())
                  .filter(Boolean) || [],
              flags: flagsArray,
            },
          },
        });
      } else if (selectedTrigger) {
        await updateTrigger({
          variables: {
            zoneId: selectedTrigger.zoneId,
            id: selectedTrigger.id,
            input: {
              name: script.name,
              attachType: script.attachType as 'MOB' | 'OBJECT' | 'WORLD',
              commands: script.commands,
              argList: script.argList
                ?.split(',')
                .map(s => s.trim())
                .filter(Boolean),
              flags: flagsArray,
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

  const handleDeleteScript = async (
    e: React.MouseEvent,
    trigger: TriggerData
  ) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this script?')) {
      try {
        await deleteTrigger({
          variables: { zoneId: trigger.zoneId, id: trigger.id },
        });
        await refetch();
      } catch (err) {
        console.error('Failed to delete script:', err);
      }
    }
  };

  const handleMarkReviewed = async (
    e: React.MouseEvent,
    trigger: TriggerData
  ) => {
    e.stopPropagation();
    try {
      await markReviewed({
        variables: { zoneId: trigger.zoneId, id: trigger.id },
      });
      await refetch();
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  if (isEditing) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>
              {isCreating ? 'New Script' : 'Edit Script'}
              {selectedTrigger && (
                <span className='text-muted-foreground font-mono text-lg ml-2'>
                  {selectedTrigger.zoneId}:{selectedTrigger.id}
                </span>
              )}
            </h1>
            <div className='space-x-2'>
              <Button
                variant='outline'
                onClick={handleCancel}
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
                <span className='ml-2 text-yellow-500'>
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
            placeholder='Search by name, content, flags, or vnum...'
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
      ) : sortedTriggers.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          <FileText className='w-12 h-12 mx-auto mb-2 opacity-50' />
          <p>No scripts found matching your criteria</p>
        </div>
      ) : (
        <div className='border border-border rounded-lg overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className='w-[90px] cursor-pointer select-none'
                  onClick={() => handleSort('id')}
                >
                  <span className='flex items-center'>
                    ID
                    <SortIcon
                      columnKey='id'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none'
                  onClick={() => handleSort('name')}
                >
                  <span className='flex items-center'>
                    Name
                    <SortIcon
                      columnKey='name'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className='w-[100px] cursor-pointer select-none'
                  onClick={() => handleSort('attachType')}
                >
                  <span className='flex items-center'>
                    Type
                    <SortIcon
                      columnKey='attachType'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className='max-w-[280px] cursor-pointer select-none'
                  onClick={() => handleSort('flags')}
                >
                  <span className='flex items-center'>
                    Flags
                    <SortIcon
                      columnKey='flags'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className='w-[130px] cursor-pointer select-none'
                  onClick={() => handleSort('attachment')}
                >
                  <span className='flex items-center'>
                    Attachment
                    <SortIcon
                      columnKey='attachment'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className='w-[70px] cursor-pointer select-none'
                  onClick={() => handleSort('lines')}
                >
                  <span className='flex items-center'>
                    Lines
                    <SortIcon
                      columnKey='lines'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className='w-[100px] cursor-pointer select-none'
                  onClick={() => handleSort('updatedAt')}
                >
                  <span className='flex items-center'>
                    Updated
                    <SortIcon
                      columnKey='updatedAt'
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead className='w-[110px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTriggers.map(trigger => (
                <TableRow
                  key={`${trigger.zoneId}-${trigger.id}`}
                  className={`cursor-pointer ${
                    trigger.needsReview
                      ? 'bg-yellow-500/5 hover:bg-yellow-500/10'
                      : ''
                  }`}
                  onClick={() => handleEditScript(trigger)}
                >
                  <TableCell className='font-mono text-xs text-muted-foreground'>
                    {trigger.zoneId}:{trigger.id}
                  </TableCell>
                  <TableCell className='font-medium'>{trigger.name}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1.5'>
                      <Badge className={getTypeColor(trigger.attachType)}>
                        {trigger.attachType}
                      </Badge>
                      {trigger.needsReview && (
                        <Badge
                          variant='outline'
                          className='text-yellow-500 border-yellow-500 text-[10px] px-1 py-0'
                        >
                          <AlertTriangle className='w-2.5 h-2.5' />
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[280px]'>
                    {trigger.flags.length > 0 ? (
                      <div className='flex flex-wrap gap-1'>
                        {trigger.flags.map(flag => (
                          <FlagBadge key={flag} flag={flag} />
                        ))}
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground/50'>
                        --
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {getAttachmentLabel(trigger)}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground tabular-nums'>
                    {getLineCount(trigger.commands)}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {new Date(trigger.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-0.5'>
                      {trigger.needsReview && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 w-7 p-0'
                          onClick={e => handleMarkReviewed(e, trigger)}
                          title='Mark as reviewed'
                        >
                          <Check className='w-3.5 h-3.5 text-emerald-500' />
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0'
                        onClick={e => {
                          e.stopPropagation();
                          handleEditScript(trigger);
                        }}
                        title='Edit'
                      >
                        <Pencil className='w-3.5 h-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0 text-destructive hover:text-destructive/80'
                        onClick={e => handleDeleteScript(e, trigger)}
                        title='Delete'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && !error && triggers.length > 0 && (
        <div className='mt-4 text-sm text-muted-foreground text-center'>
          Showing {sortedTriggers.length} of {triggers.length} scripts
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
