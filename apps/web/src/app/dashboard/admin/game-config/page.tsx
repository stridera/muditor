'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Pencil,
  RefreshCw,
  Settings,
  FileText,
  Layers,
  MessageSquare,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// ============================================
// GraphQL Queries
// ============================================

const GET_GAME_CONFIGS = gql`
  query GetGameConfigs {
    gameConfigs {
      id
      category
      key
      value
      valueType
      description
      minValue
      maxValue
      isSecret
      restartReq
    }
    gameConfigCategories
  }
`;

const UPDATE_GAME_CONFIG = gql`
  mutation UpdateGameConfig(
    $category: String!
    $key: String!
    $data: UpdateGameConfigInput!
  ) {
    updateGameConfig(category: $category, key: $key, data: $data) {
      id
      value
    }
  }
`;

const GET_LEVEL_DEFINITIONS = gql`
  query GetLevelDefinitions {
    levelDefinitions {
      level
      name
      expRequired
      hpGain
      staminaGain
      isImmortal
      permissions
    }
    availablePermissions
  }
`;

const UPDATE_LEVEL_DEFINITION = gql`
  mutation UpdateLevelDefinition(
    $level: Int!
    $data: UpdateLevelDefinitionInput!
  ) {
    updateLevelDefinition(level: $level, data: $data) {
      level
      name
      expRequired
      hpGain
      staminaGain
      permissions
    }
  }
`;

const GET_SYSTEM_TEXTS = gql`
  query GetSystemTexts {
    systemTexts {
      id
      key
      category
      title
      content
      minLevel
      isActive
    }
  }
`;

const UPDATE_SYSTEM_TEXT = gql`
  mutation UpdateSystemText($id: ID!, $data: UpdateSystemTextInput!) {
    updateSystemText(id: $id, data: $data) {
      id
      content
      title
      isActive
    }
  }
`;

const GET_LOGIN_MESSAGES = gql`
  query GetLoginMessages {
    loginMessages {
      id
      stage
      variant
      message
      isActive
    }
  }
`;

const UPDATE_LOGIN_MESSAGE = gql`
  mutation UpdateLoginMessage($id: ID!, $data: UpdateLoginMessageInput!) {
    updateLoginMessage(id: $id, data: $data) {
      id
      message
      isActive
    }
  }
`;

// ============================================
// Types
// ============================================

interface GameConfig {
  id: number;
  category: string;
  key: string;
  value: string;
  valueType: string;
  description?: string;
  minValue?: string;
  maxValue?: string;
  isSecret: boolean;
  restartReq: boolean;
}

interface LevelDefinition {
  level: number;
  name?: string;
  expRequired: number;
  hpGain: number;
  staminaGain: number;
  isImmortal: boolean;
  permissions: string[];
}

interface SystemText {
  id: number;
  key: string;
  category: string;
  title?: string;
  content: string;
  minLevel: number;
  isActive: boolean;
}

interface LoginMessage {
  id: number;
  stage: string;
  variant: string;
  message: string;
  isActive: boolean;
}

// ============================================
// Config Tab Component
// ============================================

type SortField = 'category' | 'key' | 'value' | 'valueType';
type SortDirection = 'asc' | 'desc';

interface GameConfigsQueryResult {
  gameConfigs: GameConfig[];
  gameConfigCategories: string[];
}

function ConfigTab() {
  const { data, loading, error, refetch } =
    useQuery<GameConfigsQueryResult>(GET_GAME_CONFIGS);
  const [updateConfig] = useMutation(UPDATE_GAME_CONFIG);
  const [editConfig, setEditConfig] = useState<GameConfig | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const configs: GameConfig[] = data?.gameConfigs || [];
  const categories: string[] = data?.gameConfigCategories || [];

  const filteredAndSortedConfigs = useMemo(() => {
    let result = configs;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.key.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.value.toLowerCase().includes(query)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = a[sortField]?.toString().toLowerCase() ?? '';
      const bVal = b[sortField]?.toString().toLowerCase() ?? '';
      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [configs, selectedCategory, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className='w-4 h-4 ml-1 opacity-50' />;
    return sortDirection === 'asc' ? (
      <ArrowUp className='w-4 h-4 ml-1' />
    ) : (
      <ArrowDown className='w-4 h-4 ml-1' />
    );
  };

  if (loading)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin' /> Loading configurations...
      </div>
    );
  if (error)
    return (
      <Alert variant='destructive'>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );

  const handleEdit = (config: GameConfig) => {
    setEditConfig(config);
    setEditValue(config.value);
  };

  const handleSave = async () => {
    if (!editConfig) return;
    setSaving(true);
    try {
      await updateConfig({
        variables: {
          category: editConfig.category,
          key: editConfig.key,
          data: { value: editValue },
        },
      });
      await refetch();
      setEditConfig(null);
    } catch (err) {
      console.error('Failed to update config:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4 flex-wrap'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search configs...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9 w-64'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Label>Category:</Label>
          <select
            className='border rounded px-3 py-1.5 bg-background'
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value='all'>All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          <RefreshCw className='w-4 h-4 mr-2' /> Refresh
        </Button>
        <span className='text-sm text-muted-foreground ml-auto'>
          {filteredAndSortedConfigs.length} of {configs.length} configs
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className='cursor-pointer hover:bg-muted/50 select-none'
              onClick={() => handleSort('category')}
            >
              <div className='flex items-center'>
                Category
                <SortIcon field='category' />
              </div>
            </TableHead>
            <TableHead
              className='cursor-pointer hover:bg-muted/50 select-none'
              onClick={() => handleSort('key')}
            >
              <div className='flex items-center'>
                Key
                <SortIcon field='key' />
              </div>
            </TableHead>
            <TableHead
              className='cursor-pointer hover:bg-muted/50 select-none'
              onClick={() => handleSort('value')}
            >
              <div className='flex items-center'>
                Value
                <SortIcon field='value' />
              </div>
            </TableHead>
            <TableHead
              className='cursor-pointer hover:bg-muted/50 select-none'
              onClick={() => handleSort('valueType')}
            >
              <div className='flex items-center'>
                Type
                <SortIcon field='valueType' />
              </div>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedConfigs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='h-24 text-center text-muted-foreground'
              >
                No configurations found
                {searchQuery && ` matching "${searchQuery}"`}
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedConfigs.map(config => (
              <TableRow key={config.id}>
                <TableCell>
                  <Badge variant='outline'>{config.category}</Badge>
                </TableCell>
                <TableCell className='font-mono text-sm'>
                  {config.key}
                </TableCell>
                <TableCell className='font-mono'>
                  {config.isSecret ? '******' : config.value}
                  {config.restartReq && (
                    <Badge variant='secondary' className='ml-2 text-xs'>
                      restart required
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>{config.valueType}</Badge>
                </TableCell>
                <TableCell className='text-sm text-muted-foreground max-w-xs truncate'>
                  {config.description}
                </TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleEdit(config)}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!editConfig}
        onOpenChange={open => !open && setEditConfig(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription>
              {editConfig?.category}.{editConfig?.key}
              {editConfig?.description && (
                <span className='block mt-1 text-sm'>
                  {editConfig.description}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Value ({editConfig?.valueType})</Label>
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder={`Enter ${editConfig?.valueType?.toLowerCase()} value`}
              />
              {editConfig?.minValue && editConfig?.maxValue && (
                <p className='text-xs text-muted-foreground'>
                  Range: {editConfig.minValue} - {editConfig.maxValue}
                </p>
              )}
            </div>
            {editConfig?.restartReq && (
              <Alert>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  This setting requires a server restart to take effect.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditConfig(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Levels Tab Component
// ============================================

interface LevelDefinitionsQueryResult {
  levelDefinitions: LevelDefinition[];
  availablePermissions: string[];
}

function LevelsTab() {
  const { data, loading, error, refetch } =
    useQuery<LevelDefinitionsQueryResult>(GET_LEVEL_DEFINITIONS);
  const [updateLevel] = useMutation(UPDATE_LEVEL_DEFINITION);
  const [editLevel, setEditLevel] = useState<LevelDefinition | null>(null);
  const [editData, setEditData] = useState({
    expRequired: 0,
    hpGain: 0,
    staminaGain: 0,
    permissions: '',
  });
  const [saving, setSaving] = useState(false);
  const [showMortal, setShowMortal] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  if (loading)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin' /> Loading levels...
      </div>
    );
  if (error)
    return (
      <Alert variant='destructive'>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );

  const levels: LevelDefinition[] = data?.levelDefinitions || [];
  const availablePermissions: string[] = data?.availablePermissions || [];
  const filteredLevels = showMortal
    ? levels.filter(l => !l.isImmortal)
    : levels.filter(l => l.isImmortal);

  const handleEdit = (level: LevelDefinition) => {
    setEditLevel(level);
    setEditData({
      expRequired: level.expRequired,
      hpGain: level.hpGain,
      staminaGain: level.staminaGain,
      permissions: level.permissions.join(', '),
    });
  };

  const handleSave = async () => {
    if (!editLevel) return;
    setSaving(true);
    try {
      // Parse permissions from comma-separated string
      const permissions = editData.permissions
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      await updateLevel({
        variables: {
          level: editLevel.level,
          data: {
            expRequired: editData.expRequired,
            hpGain: editData.hpGain,
            staminaGain: editData.staminaGain,
            ...(editLevel.isImmortal && { permissions }),
          },
        },
      });
      await refetch();
      setEditLevel(null);
    } catch (err) {
      console.error('Failed to update level:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Button
          variant={showMortal ? 'default' : 'outline'}
          size='sm'
          onClick={() => setShowMortal(true)}
        >
          Mortal Levels (1-99)
        </Button>
        <Button
          variant={!showMortal ? 'default' : 'outline'}
          size='sm'
          onClick={() => setShowMortal(false)}
        >
          Immortal Levels (100+)
        </Button>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          <RefreshCw className='w-4 h-4 mr-2' /> Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {!showMortal && <TableHead className='w-[40px]'></TableHead>}
            <TableHead className='w-[80px]'>Level</TableHead>
            <TableHead>Name</TableHead>
            {showMortal && (
              <>
                <TableHead className='text-right'>XP Required</TableHead>
                <TableHead className='text-right'>HP Gain</TableHead>
                <TableHead className='text-right'>Stamina Gain</TableHead>
              </>
            )}
            {!showMortal && <TableHead>Allowed Commands</TableHead>}
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLevels.map(level => (
            <React.Fragment key={level.level}>
              <TableRow
                className={
                  !showMortal ? 'cursor-pointer hover:bg-muted/50' : undefined
                }
                onClick={() => {
                  if (!showMortal) {
                    setExpandedLevels(prev => {
                      const next = new Set(prev);
                      if (next.has(level.level)) {
                        next.delete(level.level);
                      } else {
                        next.add(level.level);
                      }
                      return next;
                    });
                  }
                }}
              >
                {!showMortal && (
                  <TableCell className='w-[40px]'>
                    {expandedLevels.has(level.level) ? (
                      <ChevronDown className='w-4 h-4 text-muted-foreground' />
                    ) : (
                      <ChevronRight className='w-4 h-4 text-muted-foreground' />
                    )}
                  </TableCell>
                )}
                <TableCell className='font-bold'>{level.level}</TableCell>
                <TableCell>{level.name || '-'}</TableCell>
                {showMortal && (
                  <>
                    <TableCell className='text-right font-mono'>
                      {level.expRequired.toLocaleString()}
                    </TableCell>
                    <TableCell className='text-right text-green-600'>
                      +{level.hpGain}
                    </TableCell>
                    <TableCell className='text-right text-yellow-600'>
                      +{level.staminaGain}
                    </TableCell>
                  </>
                )}
                {!showMortal && (
                  <TableCell>
                    <span className='text-sm text-muted-foreground'>
                      {level.permissions.length === 0 ? (
                        <span className='italic'>No commands</span>
                      ) : (
                        `${level.permissions.length} command${level.permissions.length !== 1 ? 's' : ''}`
                      )}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleEdit(level);
                    }}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>
                </TableCell>
              </TableRow>
              {!showMortal && expandedLevels.has(level.level) && (
                <TableRow key={`${level.level}-expanded`}>
                  <TableCell colSpan={4} className='bg-muted/30 py-3'>
                    <div className='pl-10'>
                      {level.permissions.length === 0 ? (
                        <p className='text-sm text-muted-foreground italic'>
                          No commands assigned to this level.
                        </p>
                      ) : (
                        <div className='flex flex-wrap gap-2'>
                          {level.permissions.map(perm => (
                            <Badge
                              key={perm}
                              variant='outline'
                              className='font-mono text-xs'
                            >
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!editLevel}
        onOpenChange={open => !open && setEditLevel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Level {editLevel?.level}</DialogTitle>
            <DialogDescription>
              {editLevel?.name || `Level ${editLevel?.level}`}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            {!editLevel?.isImmortal && (
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>XP Required</Label>
                  <Input
                    type='number'
                    value={editData.expRequired}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        expRequired: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>HP Gain</Label>
                  <Input
                    type='number'
                    value={editData.hpGain}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        hpGain: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Stamina Gain</Label>
                  <Input
                    type='number'
                    value={editData.staminaGain}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        staminaGain: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            )}
            {editLevel?.isImmortal && (
              <div className='space-y-2'>
                <Label>Allowed Commands</Label>
                <Textarea
                  value={editData.permissions}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      permissions: e.target.value,
                    }))
                  }
                  placeholder='shutdown, force, snoop, teleport, ban, ...'
                  className='font-mono text-sm'
                  rows={4}
                />
                {availablePermissions.length > 0 ? (
                  <div className='space-y-1'>
                    <p className='text-xs text-muted-foreground'>
                      Comma-separated permission flags. Click to add:
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {availablePermissions.map(perm => (
                        <Badge
                          key={perm}
                          variant='outline'
                          className='text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                          onClick={() => {
                            const current = editData.permissions
                              .split(',')
                              .map(p => p.trim())
                              .filter(p => p.length > 0);
                            if (!current.includes(perm)) {
                              const updated = [...current, perm].join(', ');
                              setEditData(prev => ({
                                ...prev,
                                permissions: updated,
                              }));
                            }
                          }}
                        >
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className='text-xs text-muted-foreground'>
                    No commands defined yet. Add commands in the Commands table
                    first.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditLevel(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// System Text Tab Component
// ============================================

interface SystemTextsQueryResult {
  systemTexts: SystemText[];
}

function SystemTextTab() {
  const { data, loading, error, refetch } =
    useQuery<SystemTextsQueryResult>(GET_SYSTEM_TEXTS);
  const [updateText] = useMutation(UPDATE_SYSTEM_TEXT);
  const [editText, setEditText] = useState<SystemText | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin' /> Loading text...
      </div>
    );
  if (error)
    return (
      <Alert variant='destructive'>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );

  const texts: SystemText[] = data?.systemTexts || [];

  const handleEdit = (text: SystemText) => {
    setEditText(text);
    setEditContent(text.content);
  };

  const handleSave = async () => {
    if (!editText) return;
    setSaving(true);
    try {
      await updateText({
        variables: {
          id: editText.id,
          data: { content: editContent },
        },
      });
      await refetch();
      setEditText(null);
    } catch (err) {
      console.error('Failed to update text:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          <RefreshCw className='w-4 h-4 mr-2' /> Refresh
        </Button>
      </div>

      <div className='grid gap-4'>
        {texts.map(text => (
          <Card key={text.id}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg'>
                    {text.title || text.key}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant='outline' className='mr-2'>
                      {text.category}
                    </Badge>
                    <span className='text-xs'>Key: {text.key}</span>
                    {text.minLevel > 0 && (
                      <Badge variant='secondary' className='ml-2'>
                        Level {text.minLevel}+
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleEdit(text)}
                >
                  <Pencil className='w-4 h-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className='text-xs bg-muted p-3 rounded overflow-x-auto max-h-32'>
                {text.content.substring(0, 300)}
                {text.content.length > 300 && '...'}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!editText}
        onOpenChange={open => !open && setEditText(null)}
      >
        <DialogContent className='max-w-3xl max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle>Edit {editText?.title || editText?.key}</DialogTitle>
            <DialogDescription>
              {editText?.category} - {editText?.key}
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className='min-h-[300px] font-mono text-sm'
              placeholder='Enter text content...'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditText(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Login Messages Tab Component
// ============================================

interface LoginMessagesQueryResult {
  loginMessages: LoginMessage[];
}

function LoginMessagesTab() {
  const { data, loading, error, refetch } =
    useQuery<LoginMessagesQueryResult>(GET_LOGIN_MESSAGES);
  const [updateMessage] = useMutation(UPDATE_LOGIN_MESSAGE);
  const [editMessage, setEditMessage] = useState<LoginMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin' /> Loading messages...
      </div>
    );
  if (error)
    return (
      <Alert variant='destructive'>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );

  const messages: LoginMessage[] = data?.loginMessages || [];

  const handleEdit = (msg: LoginMessage) => {
    setEditMessage(msg);
    setEditContent(msg.message);
  };

  const handleSave = async () => {
    if (!editMessage) return;
    setSaving(true);
    try {
      await updateMessage({
        variables: {
          id: editMessage.id,
          data: { message: editContent },
        },
      });
      await refetch();
      setEditMessage(null);
    } catch (err) {
      console.error('Failed to update message:', err);
    } finally {
      setSaving(false);
    }
  };

  const stageDescription: Record<string, string> = {
    WELCOME_BANNER: 'Initial welcome screen shown on connection',
    USERNAME_PROMPT: 'Prompt for username/email',
    PASSWORD_PROMPT: 'Prompt for password',
    INVALID_LOGIN: 'Message shown on failed login',
    TOO_MANY_ATTEMPTS: 'Message shown after too many failed attempts',
    CHARACTER_SELECT: 'Character selection menu',
    CREATE_NAME_PROMPT: 'Prompt for new character name',
    CREATE_PASSWORD: 'Prompt for new password',
    CONFIRM_PASSWORD: 'Password confirmation prompt',
    SELECT_CLASS: 'Class selection menu',
    SELECT_RACE: 'Race selection menu',
    CREATION_COMPLETE: 'Character creation success message',
    RECONNECT_MESSAGE: 'Message shown on session reconnect',
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          <RefreshCw className='w-4 h-4 mr-2' /> Refresh
        </Button>
      </div>

      <div className='grid gap-4'>
        {messages.map(msg => (
          <Card key={msg.id}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg font-mono'>
                    {msg.stage}
                  </CardTitle>
                  <CardDescription>
                    {stageDescription[msg.stage] || 'Login flow message'}
                    {msg.variant !== 'default' && (
                      <Badge variant='secondary' className='ml-2'>
                        variant: {msg.variant}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleEdit(msg)}
                >
                  <Pencil className='w-4 h-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className='text-xs bg-muted p-3 rounded overflow-x-auto max-h-32 whitespace-pre-wrap'>
                {msg.message.substring(0, 300)}
                {msg.message.length > 300 && '...'}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!editMessage}
        onOpenChange={open => !open && setEditMessage(null)}
      >
        <DialogContent className='max-w-3xl max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle>Edit {editMessage?.stage}</DialogTitle>
            <DialogDescription>
              {editMessage && stageDescription[editMessage.stage]}
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className='min-h-[300px] font-mono text-sm'
              placeholder='Enter message content...'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditMessage(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function SettingsPage() {
  const { isGod, loading: permLoading } = usePermissions();

  if (permLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  if (!isGod) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            You do not have permission to access game settings. GOD-level access
            required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Game Settings</h1>
        <p className='text-muted-foreground'>
          Configure server settings, level definitions, and system text.
        </p>
      </div>

      <Tabs defaultValue='config' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='config' className='flex items-center gap-2'>
            <Settings className='w-4 h-4' />
            Configuration
          </TabsTrigger>
          <TabsTrigger value='levels' className='flex items-center gap-2'>
            <Layers className='w-4 h-4' />
            Levels
          </TabsTrigger>
          <TabsTrigger value='text' className='flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            System Text
          </TabsTrigger>
          <TabsTrigger value='login' className='flex items-center gap-2'>
            <MessageSquare className='w-4 h-4' />
            Login Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value='config' className='mt-6'>
          <ConfigTab />
        </TabsContent>

        <TabsContent value='levels' className='mt-6'>
          <LevelsTab />
        </TabsContent>

        <TabsContent value='text' className='mt-6'>
          <SystemTextTab />
        </TabsContent>

        <TabsContent value='login' className='mt-6'>
          <LoginMessagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
