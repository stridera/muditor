'use client';

import MonacoEditor from '@/components/MonacoEditor';
import {
  LuaToolButtons,
  LuaValidationResults,
  useLuaEditorTools,
} from '@/components/lua-editor-tools';
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
import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSaveShortcut } from '@/hooks/use-save-shortcut';
import {
  hasActiveUnsavedChanges,
  useUnsavedChangesGuard,
} from '@/hooks/use-unsaved-changes-guard';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { useScriptsUrl, useUrlTextFilter } from './use-scripts-url';

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

interface LibraryDraft {
  name: string;
  zone: string;
  description: string;
  code: string;
}

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

  // What is open lives in the URL (?library=<name> or ?new=1) so Back/Forward,
  // reload and deep links work; the draft fields below are the editor's state.
  const url = useScriptsUrl();
  const urlLibrary = url.get('library');
  const urlNew = url.get('new') === '1';
  const [searchTerm, setSearchTerm] = useUrlTextFilter(url, 'q');

  const [selected, setSelected] = useState<LibraryData | null>(null);
  // Which record the draft was initialised from: 'new', 'lib:<id>' or null.
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  // The values the editor opened with; dirty is measured against these.
  const [loaded, setLoaded] = useState<LibraryDraft | null>(null);
  const [saving, setSaving] = useState<'save' | 'close' | null>(null);
  const lua = useLuaEditorTools(code);

  const isCreating = urlNew;
  const isEditing = draftKey !== null && (urlNew || urlLibrary != null);

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

  const isDirty =
    isEditing &&
    !readOnly &&
    loaded != null &&
    (name !== loaded.name ||
      zone !== loaded.zone ||
      description !== loaded.description ||
      code.replace(/\r\n?/g, '\n') !== loaded.code.replace(/\r\n?/g, '\n'));
  const { guard } = useUnsavedChangesGuard(isDirty);

  const initDraft = useCallback((key: string, library: LibraryData | null) => {
    const draft: LibraryDraft = library
      ? {
          name: library.name,
          zone: library.zoneId == null ? '' : String(library.zoneId),
          description: library.description ?? '',
          code: library.code,
        }
      : { name: '', zone: '', description: '', code: NEW_LIBRARY_TEMPLATE };
    setSelected(library);
    setName(draft.name);
    setZone(draft.zone);
    setDescription(draft.description);
    setCode(draft.code);
    setLoaded(draft);
    setDraftKey(key);
  }, []);

  // Keep the draft in step with the URL: open the library named there, start
  // a new one, or drop the draft when the URL is back at the list.
  useEffect(() => {
    if (urlNew) {
      if (draftKey !== 'new') initDraft('new', null);
      return;
    }
    if (!urlLibrary) {
      if (draftKey !== null) {
        setDraftKey(null);
        setSelected(null);
        setLoaded(null);
      }
      return;
    }
    const library = libraries.find(l => l.name === urlLibrary);
    if (!library) return; // still loading, or renamed while open
    if (draftKey !== `lib:${library.id}`)
      initDraft(`lib:${library.id}`, library);
  }, [urlNew, urlLibrary, libraries, draftKey, initDraft]);

  const openLibrary = (library: LibraryData) =>
    url.update({ library: library.name, new: null });

  const startCreate = () => url.update({ library: null, new: '1' });

  // Leaving the editor from the editor: if the unsaved-changes guard has put a
  // sentinel entry on top of the history, replace it instead of stacking.
  const close = () =>
    url.update(
      { library: null, new: null },
      { history: hasActiveUnsavedChanges() ? 'replace' : 'push' }
    );
  // Cancel asks first when there are unsaved edits; saving closes directly.
  const cancel = guard(close);

  const handleSave = async (closeAfter: boolean) => {
    if (saving || readOnly || !isEditing) return;
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
    setSaving(closeAfter ? 'close' : 'save');
    try {
      const input = { name, zoneId, description: description || null, code };
      let savedId: number | undefined = selected?.id;
      if (isCreating) {
        const result = await createLibrary({ variables: { input } });
        savedId = result?.data?.createScriptLibrary?.id;
      } else if (selected) {
        await updateLibrary({ variables: { id: selected.id, input } });
      }
      await refetch();
      toast.success(`Saved library "${name}"`);
      if (closeAfter || savedId == null) {
        close();
      } else {
        // Stay on the page: the saved values are the new baseline, and a
        // new/renamed library gets its own address.
        const draft: LibraryDraft = {
          name,
          zone: trimmedZone,
          description,
          code,
        };
        setLoaded(draft);
        setDraftKey(`lib:${savedId}`);
        setSelected({
          ...(selected ?? {
            id: savedId,
            lineCount: 0,
            createdAt: '',
            updatedAt: '',
          }),
          id: savedId,
          name,
          zoneId,
          description: description || null,
          code,
        });
        url.update({ library: name, new: null }, { history: 'replace' });
      }
    } catch (err) {
      toast.error(`Could not save the library: ${extractErrorMessage(err)}`);
    } finally {
      setSaving(null);
    }
  };

  // Ctrl/Cmd+S saves without closing.
  useSaveShortcut(() => void handleSave(false), isEditing && !readOnly);

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
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={cancel}>
              Cancel
            </Button>
            <LuaToolButtons
              onValidate={lua.validate}
              onFormat={lua.format}
              isValidating={lua.isValidating}
              readOnly={readOnly}
            />
            {!readOnly && (
              <>
                <Button
                  onClick={() => void handleSave(false)}
                  disabled={saving !== null}
                  title='Save and keep editing (Ctrl+S)'
                >
                  {saving === 'save' && (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  )}
                  {saving === 'save' ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  onClick={() => void handleSave(true)}
                  disabled={saving !== null}
                  title='Save and return to the list'
                >
                  {saving === 'close' && (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  )}
                  {saving === 'close' ? 'Saving…' : 'Save & Close'}
                </Button>
              </>
            )}
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
            onChange={value => {
              setCode(value ?? '');
              lua.clearValidation();
            }}
            onMount={lua.handleEditorDidMount}
            options={{
              readOnly,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 14,
            }}
          />
        </div>
        <LuaValidationResults errors={lua.validationErrors} />
      </div>
    );
  }

  const notFound =
    urlLibrary != null &&
    !urlNew &&
    !loading &&
    !error &&
    !libraries.some(l => l.name === urlLibrary);

  return (
    <div className='container mx-auto p-6'>
      {header}
      {notFound && (
        <div
          role='alert'
          className='mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm'
        >
          There is no library named{' '}
          <code className='font-mono'>{urlLibrary}</code>.
        </div>
      )}
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
                      <Link
                        href={`?tab=libraries&library=${encodeURIComponent(library.name)}`}
                        onClick={e => e.stopPropagation()}
                        className='hover:underline'
                      >
                        {library.name}
                      </Link>
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
