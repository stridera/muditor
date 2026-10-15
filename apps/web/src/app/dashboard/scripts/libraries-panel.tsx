'use client';

import MonacoEditor from '@/components/MonacoEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { gql } from '@/generated/gql';
import { usePermissions } from '@/hooks/use-permissions';
import { extractErrorMessage } from '@/lib/error-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import { Eye, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// Libraries are small (a few KB of Lua each), so the list carries the source;
// that keeps search-inside-source and opening a library free of extra requests.
const GET_LIBRARIES = gql(`
  query GetScriptLibraries {
    scriptLibraries {
      id
      name
      zoneId
      description
      code
      lineCount
      createdAt
      updatedAt
      updatedBy
    }
  }
`);

const CREATE_LIBRARY = gql(`
  mutation CreateScriptLibrary($input: CreateScriptLibraryInput!) {
    createScriptLibrary(input: $input) {
      id
      name
    }
  }
`);

const UPDATE_LIBRARY = gql(`
  mutation UpdateScriptLibrary($id: Int!, $input: UpdateScriptLibraryInput!) {
    updateScriptLibrary(id: $id, input: $input) {
      id
      name
    }
  }
`);

const DELETE_LIBRARY = gql(`
  mutation DeleteScriptLibrary($id: Int!) {
    deleteScriptLibrary(id: $id) {
      id
    }
  }
`);

interface LibraryData {
  id: number;
  name: string;
  zoneId?: number | null;
  description?: string | null;
  code: string;
  lineCount: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

/** Must match the API rule (LIBRARY_NAME_PATTERN in script-library.dto.ts). */
const NAME_PATTERN = /^[a-z0-9_\-./]{1,64}$/;

const NEW_LIBRARY_TEMPLATE = `-- Library code runs once, the first time a script calls require("<name>").
-- Return a table (or function); every trigger gets the same value back.
local M = {}

return M
`;

interface LibrariesPanelProps {
  /** Tab switcher rendered above the page title in list mode. */
  header: ReactNode;
}

export default function LibrariesPanel({ header }: LibrariesPanelProps) {
  const { canEditZone, canEditAnyZone, isHeadBuilder } = usePermissions();
  const { resolvedTheme } = useTheme();
  const { data, loading, error, refetch } = useQuery(GET_LIBRARIES);
  const [createLibrary] = useMutation(CREATE_LIBRARY);
  const [updateLibrary] = useMutation(UPDATE_LIBRARY);
  const [deleteLibrary] = useMutation(DELETE_LIBRARY);

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<LibraryData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');

  const libraries: LibraryData[] = useMemo(
    () => (data?.scriptLibraries as LibraryData[]) ?? [],
    [data]
  );

  // A zone library follows the zone grants; a global one (no zone) is
  // HEAD_BUILDER+ only. The API enforces the same rule.
  const canEditLibrary = (zoneId?: number | null) =>
    zoneId == null ? isHeadBuilder : canEditZone(zoneId);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return libraries;
    return libraries.filter(
      l =>
        l.name.toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [libraries, searchTerm]);

  const readOnly =
    !isCreating && selected != null && !canEditLibrary(selected.zoneId);

  const openLibrary = (library: LibraryData) => {
    setSelected(library);
    setIsCreating(false);
    setName(library.name);
    setZone(library.zoneId == null ? '' : String(library.zoneId));
    setDescription(library.description ?? '');
    setCode(library.code);
    setIsEditing(true);
  };

  const startCreate = () => {
    setSelected(null);
    setIsCreating(true);
    setName('');
    setZone('');
    setDescription('');
    setCode(NEW_LIBRARY_TEMPLATE);
    setIsEditing(true);
  };

  const close = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelected(null);
  };

  const handleSave = async () => {
    if (!NAME_PATTERN.test(name)) {
      toast.error(
        'Name must be 1-64 characters: lowercase letters, digits, "_", "-", "." or "/".'
      );
      return;
    }
    const trimmedZone = zone.trim();
    const zoneId = trimmedZone === '' ? null : parseInt(trimmedZone, 10);
    if (zoneId !== null && (!Number.isInteger(zoneId) || zoneId < 0)) {
      toast.error('Zone must be a number, or empty for a global library.');
      return;
    }
    if (!canEditLibrary(zoneId)) {
      toast.error(
        zoneId == null
          ? 'Only a head builder can save a global library (no zone).'
          : `You do not have write access to zone ${zoneId}.`
      );
      return;
    }
    try {
      if (isCreating) {
        await createLibrary({
          variables: {
            input: { name, zoneId, description: description || null, code },
          },
        });
      } else if (selected) {
        await updateLibrary({
          variables: {
            id: selected.id,
            input: { name, zoneId, description: description || null, code },
          },
        });
      }
      await refetch();
      close();
    } catch (err) {
      toast.error(`Could not save the library: ${extractErrorMessage(err)}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, library: LibraryData) => {
    e.stopPropagation();
    if (
      !confirm(
        `Delete library "${library.name}"? Scripts that require it will fail until it is recreated.`
      )
    ) {
      return;
    }
    try {
      await deleteLibrary({ variables: { id: library.id } });
      await refetch();
    } catch (err) {
      toast.error(`Could not delete the library: ${extractErrorMessage(err)}`);
    }
  };

  if (isEditing) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>
            {isCreating
              ? 'New Library'
              : readOnly
                ? 'View Library'
                : 'Edit Library'}
            {selected && (
              <span className='text-muted-foreground font-mono text-lg ml-2'>
                {selected.name}
              </span>
            )}
          </h1>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={close}>
              Cancel
            </Button>
            {!readOnly && <Button onClick={handleSave}>Save</Button>}
          </div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-[1fr_8rem_2fr]'>
          <label className='text-sm text-muted-foreground'>
            Name
            <Input
              aria-label='Library name'
              value={name}
              disabled={readOnly}
              onChange={e => setName(e.target.value)}
              placeholder='wand-quest'
              className='mt-1 font-mono'
            />
          </label>
          <label className='text-sm text-muted-foreground'>
            Zone
            <Input
              aria-label='Library zone'
              type='number'
              min={0}
              value={zone}
              disabled={readOnly}
              onChange={e => setZone(e.target.value)}
              placeholder='global'
              className='mt-1'
            />
          </label>
          <label className='text-sm text-muted-foreground'>
            Description
            <Input
              aria-label='Library description'
              value={description}
              disabled={readOnly}
              onChange={e => setDescription(e.target.value)}
              className='mt-1'
            />
          </label>
        </div>
        <p className='mb-3 text-xs text-muted-foreground'>
          Scripts load this with{' '}
          <code className='font-mono'>
            local lib = require(&quot;{name || 'name'}&quot;)
          </code>
          . The code runs once per game boot (and after a trigger reload); every
          script gets the same returned value, so return data and functions, not
          per-call state. Libraries cannot call <code>wait()</code> at top
          level. A library without a zone can only be edited by a head builder.
        </p>

        <div className='h-[600px] border border-border rounded-lg overflow-hidden'>
          <MonacoEditor
            height='100%'
            defaultLanguage='lua'
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
            value={code}
            onChange={value => setCode(value ?? '')}
            options={{
              readOnly,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 14,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {header}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Script Libraries</h1>
          <p className='text-muted-foreground mt-1'>
            Reusable Lua modules that scripts load with{' '}
            <code className='font-mono'>require(&quot;name&quot;)</code>
            {canEditAnyZone ? '' : ' (read-only)'}
          </p>
        </div>
        {canEditAnyZone && (
          <Button onClick={startCreate}>
            <Plus className='w-4 h-4 mr-2' />
            New Library
          </Button>
        )}
      </div>

      <div className='mb-6 relative max-w-md'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search by name, description, or code...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      {loading ? (
        <p className='text-center py-8 text-muted-foreground'>
          Loading libraries...
        </p>
      ) : error ? (
        <div className='text-center py-8 text-destructive'>
          <p>Error loading libraries: {error.message}</p>
          <Button variant='outline' className='mt-4' onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          <FileText className='w-12 h-12 mx-auto mb-2 opacity-50' />
          <p>No libraries found</p>
        </div>
      ) : (
        <div className='border border-border rounded-lg overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className='w-[100px]'>Zone</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='w-[70px]'>Lines</TableHead>
                <TableHead className='w-[100px]'>Updated</TableHead>
                <TableHead className='w-[90px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(library => {
                const editable = canEditLibrary(library.zoneId);
                return (
                  <TableRow
                    key={library.id}
                    className='cursor-pointer'
                    onClick={() => openLibrary(library)}
                  >
                    <TableCell className='font-mono font-medium'>
                      {library.name}
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {library.zoneId == null
                        ? 'global'
                        : `Zone ${library.zoneId}`}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {library.description ?? ''}
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground tabular-nums'>
                      {library.lineCount}
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {new Date(library.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-0.5'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 w-7 p-0'
                          title={editable ? 'Edit' : 'View'}
                          onClick={e => {
                            e.stopPropagation();
                            openLibrary(library);
                          }}
                        >
                          {editable ? (
                            <Pencil className='w-3.5 h-3.5' />
                          ) : (
                            <Eye className='w-3.5 h-3.5' />
                          )}
                        </Button>
                        {editable && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 text-destructive hover:text-destructive/80'
                            title='Delete'
                            onClick={e => handleDelete(e, library)}
                          >
                            <Trash2 className='w-3.5 h-3.5' />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
