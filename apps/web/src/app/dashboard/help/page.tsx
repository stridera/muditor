'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  ColoredTextViewer,
  ColoredTextInline,
} from '@/components/ColoredTextViewer';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const GET_HELP_ENTRIES = gql`
  query GetHelpEntriesPage($filter: HelpEntryFilterInput) {
    helpEntries(filter: $filter) {
      id
      keywords
      title
      content
      minLevel
      category
      usage
      duration
      sphere
      classes
      sourceFile
      createdAt
      updatedAt
    }
    helpEntriesCount(filter: $filter)
    helpCategories
  }
`;

const SEARCH_HELP = gql`
  query SearchHelpPage($query: String!, $filter: HelpEntryFilterInput) {
    searchHelp(query: $query, filter: $filter) {
      id
      keywords
      title
      content
      minLevel
      category
      usage
      duration
      sphere
      classes
      sourceFile
    }
  }
`;

const GET_HELP_BY_KEYWORD = gql`
  query GetHelpByKeyword($keyword: String!) {
    helpByKeyword(keyword: $keyword) {
      id
      keywords
      title
      content
      minLevel
      category
      usage
      duration
      sphere
      classes
      sourceFile
    }
  }
`;

const CREATE_HELP_ENTRY = gql`
  mutation CreateHelpEntryPage($data: CreateHelpEntryInput!) {
    createHelpEntry(data: $data) {
      id
      keywords
      title
      content
      category
    }
  }
`;

const UPDATE_HELP_ENTRY = gql`
  mutation UpdateHelpEntryPage($id: ID!, $data: UpdateHelpEntryInput!) {
    updateHelpEntry(id: $id, data: $data) {
      id
      keywords
      title
      content
      minLevel
      category
      usage
      duration
      sphere
      classes
    }
  }
`;

const DELETE_HELP_ENTRY = gql`
  mutation DeleteHelpEntryPage($id: ID!) {
    deleteHelpEntry(id: $id)
  }
`;

type HelpEntry = {
  id: number;
  keywords: string[];
  title: string;
  content: string;
  minLevel: number;
  category?: string;
  usage?: string;
  duration?: string;
  sphere?: string;
  classes?: Record<string, number>;
  sourceFile?: string;
  createdAt?: string;
  updatedAt?: string;
};

type HelpEntriesQueryResult = {
  helpEntries: HelpEntry[];
  helpEntriesCount: number;
  helpCategories: string[];
};

type SearchHelpQueryResult = {
  searchHelp: HelpEntry[];
};

type HelpFormData = {
  keywords: string;
  title: string;
  content: string;
  minLevel: number;
  category: string;
  usage: string;
  duration: string;
  sphere: string;
};

const defaultFormData: HelpFormData = {
  keywords: '',
  title: '',
  content: '',
  minLevel: 0,
  category: '',
  usage: '',
  duration: '',
  sphere: '',
};

/**
 * Parse "See also:" references from help content and extract keywords
 */
function parseSeeAlso(content: string): string[] {
  const seeAlsoMatch = content.match(/See\s+also\s*:?\s*(.+?)(?:\n\n|\n$|$)/i);
  if (!seeAlsoMatch) return [];

  const seeAlsoText = seeAlsoMatch[1];
  // Split by commas, "and", or multiple spaces
  const references = seeAlsoText
    .split(/[,]|\s+and\s+|\s{2,}/)
    .map(ref => ref.trim().toLowerCase())
    .filter(ref => ref.length > 0 && ref !== 'and');

  return references;
}

/**
 * Component to render help content with clickable "See also" links
 */
function HelpContent({
  content,
  onLinkClick,
}: {
  content: string;
  onLinkClick: (keyword: string) => void;
}) {
  // Check if content has color markup (XML-Lite tags like <red>, &1, etc.)
  const hasColorMarkup = /<[a-z]+>|&[0-9]/i.test(content);

  // Extract "See also" section
  const seeAlsoMatch = content.match(/(\n\s*See\s+also\s*:?\s*)(.+?)$/is);
  const mainContent = seeAlsoMatch
    ? content.substring(0, seeAlsoMatch.index)
    : content;
  const seeAlsoReferences = parseSeeAlso(content);

  return (
    <div className='space-y-4'>
      {/* Main content with color support */}
      {hasColorMarkup ? (
        <ColoredTextViewer markup={mainContent} className='text-sm' />
      ) : (
        <div className='bg-muted/50 p-4 rounded whitespace-pre-wrap font-mono text-sm'>
          {mainContent}
        </div>
      )}

      {/* See also links */}
      {seeAlsoReferences.length > 0 && (
        <div className='border-t border-border pt-3'>
          <span className='text-sm text-muted-foreground'>See also: </span>
          <div className='flex flex-wrap gap-2 mt-1'>
            {seeAlsoReferences.map((ref, i) => (
              <Button
                key={i}
                variant='link'
                size='sm'
                className='h-auto p-0 text-primary hover:underline'
                onClick={() => onLinkClick(ref)}
              >
                {ref}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const { isBuilder, isGod } = usePermissions();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HelpEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HelpEntry | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState<HelpFormData>(defaultFormData);
  const [historyStack, setHistoryStack] = useState<HelpEntry[]>([]);

  const { data, loading, error, refetch } = useQuery<HelpEntriesQueryResult>(
    GET_HELP_ENTRIES,
    {
      variables: {
        filter:
          categoryFilter !== 'all' ? { category: categoryFilter } : undefined,
      },
    }
  );

  const { data: searchData, loading: searching } =
    useQuery<SearchHelpQueryResult>(SEARCH_HELP, {
      variables: {
        query: searchQuery,
        filter:
          categoryFilter !== 'all' ? { category: categoryFilter } : undefined,
      },
      skip: !searchQuery,
    });

  const [lookupByKeyword, { loading: lookingUp }] = useLazyQuery(
    GET_HELP_BY_KEYWORD,
    {
      onCompleted: data => {
        if (data?.helpByKeyword) {
          // Push current entry to history before navigating
          if (selectedEntry) {
            setHistoryStack(prev => [...prev, selectedEntry]);
          }
          setSelectedEntry(data.helpByKeyword);
        }
      },
      onError: err => {
        setErrorMessage(`No help found for that topic: ${err.message}`);
        setTimeout(() => setErrorMessage(''), 3000);
      },
    }
  );

  const [createEntry, { loading: creating }] = useMutation(CREATE_HELP_ENTRY, {
    onCompleted: () => {
      setSuccessMessage('Help entry created successfully');
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

  const [updateEntry, { loading: updating }] = useMutation(UPDATE_HELP_ENTRY, {
    onCompleted: () => {
      setSuccessMessage('Help entry updated successfully');
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

  const [deleteEntry, { loading: deleting }] = useMutation(DELETE_HELP_ENTRY, {
    onCompleted: () => {
      setSuccessMessage('Help entry deleted successfully');
      setErrorMessage('');
      setIsDeleteOpen(false);
      setSelectedEntry(null);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const entries = useMemo(() => {
    if (searchQuery && searchData?.searchHelp) {
      return searchData.searchHelp as HelpEntry[];
    }
    return (data?.helpEntries as HelpEntry[]) || [];
  }, [data, searchData, searchQuery]);

  const categories = useMemo(() => {
    return (data?.helpCategories as string[]) || [];
  }, [data]);

  const handleEntryClick = (entry: HelpEntry) => {
    setHistoryStack([]); // Clear history when opening from list
    setSelectedEntry(entry);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (entry: HelpEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry);
    setFormData({
      keywords: entry.keywords.join(', '),
      title: entry.title,
      content: entry.content,
      minLevel: entry.minLevel,
      category: entry.category || '',
      usage: entry.usage || '',
      duration: entry.duration || '',
      sphere: entry.sphere || '',
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (entry: HelpEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEntry(entry);
    setIsDeleteOpen(true);
  };

  const handleLinkClick = useCallback(
    (keyword: string) => {
      lookupByKeyword({ variables: { keyword } });
    },
    [lookupByKeyword]
  );

  const handleBackClick = useCallback(() => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack(prev => prev.slice(0, -1));
      setSelectedEntry(prev);
    }
  }, [historyStack]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    await createEntry({
      variables: {
        data: {
          keywords,
          title: formData.title,
          content: formData.content,
          minLevel: formData.minLevel,
          category: formData.category || null,
          usage: formData.usage || null,
          duration: formData.duration || null,
          sphere: formData.sphere || null,
        },
      },
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    await updateEntry({
      variables: {
        id: editingEntry?.id,
        data: {
          keywords,
          title: formData.title,
          content: formData.content,
          minLevel: formData.minLevel,
          category: formData.category || null,
          usage: formData.usage || null,
          duration: formData.duration || null,
          sphere: formData.sphere || null,
        },
      },
    });
  };

  const handleDeleteConfirm = async () => {
    await deleteEntry({
      variables: { id: selectedEntry?.id },
    });
  };

  // Quick lookup from search bar (like typing "help fireball")
  const handleQuickLookup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // If exact match found in current results, open it
      const exactMatch = entries.find(
        entry =>
          entry.keywords.some(
            kw => kw.toLowerCase() === searchQuery.toLowerCase()
          ) || entry.title.toLowerCase() === searchQuery.toLowerCase()
      );
      if (exactMatch) {
        handleEntryClick(exactMatch);
      } else if (entries.length === 1) {
        // If only one result, open it
        handleEntryClick(entries[0]);
      }
    }
  };

  const canEdit = isBuilder || isGod;
  const canDelete = isGod;

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
            Error loading help entries: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>Help</h1>
        <p className='text-muted-foreground'>
          Search and browse in-game help documentation -{' '}
          {data?.helpEntriesCount || 0} entries available
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
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search for help topic... (press Enter to lookup)'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleQuickLookup}
              className='pl-10 w-96'
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='All categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searching || lookingUp) && (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setFormData(defaultFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Entry
          </Button>
        )}
      </div>

      <div className='border border-border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              {(canEdit || canDelete) && (
                <TableHead className='text-right'>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length > 0 ? (
              entries.map((entry: HelpEntry) => (
                <TableRow
                  key={entry.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleEntryClick(entry)}
                >
                  <TableCell className='font-medium text-foreground'>
                    <ColoredTextInline markup={entry.title} />
                  </TableCell>
                  <TableCell className='text-sm font-mono text-muted-foreground max-w-xs truncate'>
                    {entry.keywords.slice(0, 3).join(', ')}
                    {entry.keywords.length > 3 &&
                      ` +${entry.keywords.length - 3}`}
                  </TableCell>
                  <TableCell>
                    {entry.category ? (
                      <Badge variant='outline' className='capitalize'>
                        {entry.category}
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.minLevel > 0 ? (
                      <Badge
                        variant={
                          entry.minLevel >= 100 ? 'destructive' : 'secondary'
                        }
                      >
                        {entry.minLevel}+
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground'>All</span>
                    )}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell className='text-right'>
                      {canEdit && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={e => handleEditClick(entry, e)}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={e => handleDeleteClick(entry, e)}
                        >
                          <Trash2 className='h-4 w-4 text-red-500' />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canEdit || canDelete ? 5 : 4}
                  className='text-center text-muted-foreground py-8'
                >
                  {searchQuery
                    ? 'No help entries match your search'
                    : 'No help entries found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog
        open={isDetailsOpen}
        onOpenChange={open => {
          setIsDetailsOpen(open);
          if (!open) setHistoryStack([]);
        }}
      >
        <DialogContent className='sm:max-w-[900px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              {historyStack.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBackClick}
                  className='h-8 w-8 p-0'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              )}
              <DialogTitle className='flex-1'>
                <ColoredTextInline markup={selectedEntry?.title || ''} />
              </DialogTitle>
            </div>
            <DialogDescription>
              <div className='flex gap-2 flex-wrap mt-1'>
                {selectedEntry?.category && (
                  <Badge variant='outline' className='capitalize'>
                    {selectedEntry.category}
                  </Badge>
                )}
                {selectedEntry?.sphere && (
                  <Badge variant='secondary' className='capitalize'>
                    {selectedEntry.sphere}
                  </Badge>
                )}
                {selectedEntry && selectedEntry.minLevel > 0 && (
                  <Badge
                    variant={
                      selectedEntry.minLevel >= 100
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    Level {selectedEntry.minLevel}+
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 mt-4'>
            {/* Keywords */}
            <div>
              <Label className='text-sm text-muted-foreground'>Keywords</Label>
              <div className='flex flex-wrap gap-1 mt-1'>
                {selectedEntry?.keywords.map((kw, i) => (
                  <Badge
                    key={i}
                    variant='outline'
                    className='font-mono text-xs'
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Usage */}
            {selectedEntry?.usage && (
              <div>
                <Label className='text-sm text-muted-foreground'>Usage</Label>
                <div className='bg-muted p-2 rounded mt-1 font-mono text-sm'>
                  <ColoredTextInline markup={selectedEntry.usage} />
                </div>
              </div>
            )}

            {/* Duration */}
            {selectedEntry?.duration && (
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Duration
                </Label>
                <div className='text-sm mt-1'>{selectedEntry.duration}</div>
              </div>
            )}

            {/* Classes */}
            {selectedEntry?.classes &&
              Object.keys(selectedEntry.classes).length > 0 && (
                <div>
                  <Label className='text-sm text-muted-foreground'>
                    Classes
                  </Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {Object.entries(selectedEntry.classes).map(
                      ([cls, level]) => (
                        <Badge key={cls} variant='secondary'>
                          {cls}: Circle {level}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Content with color support and clickable links */}
            <div>
              <Label className='text-sm text-muted-foreground'>Content</Label>
              <div className='mt-1'>
                {selectedEntry && (
                  <HelpContent
                    content={selectedEntry.content}
                    onLinkClick={handleLinkClick}
                  />
                )}
              </div>
            </div>

            {/* Source file (admin only) */}
            {canEdit && selectedEntry?.sourceFile && (
              <div className='text-xs text-muted-foreground'>
                Source: {selectedEntry.sourceFile}
              </div>
            )}
          </div>

          <DialogFooter className='mt-6'>
            {canEdit && (
              <Button
                variant='outline'
                onClick={() => {
                  setIsDetailsOpen(false);
                  if (selectedEntry) {
                    handleEditClick(selectedEntry, {
                      stopPropagation: () => {},
                    } as React.MouseEvent);
                  }
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
              <DialogTitle>Create Help Entry</DialogTitle>
              <DialogDescription>
                Add a new help entry for in-game documentation
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='title'>Title</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder='e.g., Fireball'
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>None</SelectItem>
                      <SelectItem value='spell'>Spell</SelectItem>
                      <SelectItem value='skill'>Skill</SelectItem>
                      <SelectItem value='chant'>Chant</SelectItem>
                      <SelectItem value='command'>Command</SelectItem>
                      <SelectItem value='class'>Class</SelectItem>
                      <SelectItem value='race'>Race</SelectItem>
                      <SelectItem value='area'>Area</SelectItem>
                      <SelectItem value='reference'>Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor='keywords'>Keywords (comma-separated)</Label>
                <Input
                  id='keywords'
                  value={formData.keywords}
                  onChange={e =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder='e.g., fireball, fire ball, fire'
                  required
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='minLevel'>Min Level</Label>
                  <Input
                    id='minLevel'
                    type='number'
                    value={formData.minLevel}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        minLevel: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor='sphere'>Sphere</Label>
                  <Input
                    id='sphere'
                    value={formData.sphere}
                    onChange={e =>
                      setFormData({ ...formData, sphere: e.target.value })
                    }
                    placeholder='e.g., fire'
                  />
                </div>
                <div>
                  <Label htmlFor='duration'>Duration</Label>
                  <Input
                    id='duration'
                    value={formData.duration}
                    onChange={e =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder='e.g., Instant'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='usage'>Usage</Label>
                <Input
                  id='usage'
                  value={formData.usage}
                  onChange={e =>
                    setFormData({ ...formData, usage: e.target.value })
                  }
                  placeholder="e.g., cast 'fireball' <target>"
                />
              </div>

              <div>
                <Label htmlFor='content'>Content</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={e =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder='Full help text content...'
                  rows={10}
                  required
                />
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
              <DialogTitle>Edit Help Entry</DialogTitle>
              <DialogDescription>
                Update help entry content and metadata
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editTitle'>Title</Label>
                  <Input
                    id='editTitle'
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='editCategory'>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>None</SelectItem>
                      <SelectItem value='spell'>Spell</SelectItem>
                      <SelectItem value='skill'>Skill</SelectItem>
                      <SelectItem value='chant'>Chant</SelectItem>
                      <SelectItem value='command'>Command</SelectItem>
                      <SelectItem value='class'>Class</SelectItem>
                      <SelectItem value='race'>Race</SelectItem>
                      <SelectItem value='area'>Area</SelectItem>
                      <SelectItem value='reference'>Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor='editKeywords'>Keywords (comma-separated)</Label>
                <Input
                  id='editKeywords'
                  value={formData.keywords}
                  onChange={e =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  required
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='editMinLevel'>Min Level</Label>
                  <Input
                    id='editMinLevel'
                    type='number'
                    value={formData.minLevel}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        minLevel: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor='editSphere'>Sphere</Label>
                  <Input
                    id='editSphere'
                    value={formData.sphere}
                    onChange={e =>
                      setFormData({ ...formData, sphere: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='editDuration'>Duration</Label>
                  <Input
                    id='editDuration'
                    value={formData.duration}
                    onChange={e =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='editUsage'>Usage</Label>
                <Input
                  id='editUsage'
                  value={formData.usage}
                  onChange={e =>
                    setFormData({ ...formData, usage: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor='editContent'>Content</Label>
                <Textarea
                  id='editContent'
                  value={formData.content}
                  onChange={e =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                  required
                />
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
              Delete Help Entry
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the help entry &quot;
              {selectedEntry?.title}&quot;? This action cannot be undone.
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
