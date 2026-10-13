'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { EffectEditorToolbar } from './EffectEditorToolbar';
import { buildToolbox, type ToolboxDefinition } from './toolbox';
import {
  generateJson,
  type AbilityEffectOutput,
} from './generators/json-generator';
import { loadEffectsIntoWorkspace } from './generators/block-loader';
import {
  useEffectValidation,
  formatValidationErrors,
} from './hooks/useEffectValidation';
import {
  setEffectEditorData,
  clearEffectEditorData,
  hasEffectsLoaded,
} from './blocks/data-registry';
import { GetEffectEditorOptionsDocument } from '@/generated/graphql';
import type Blockly from 'blockly';

// Dynamically import BlocklyWorkspace to avoid SSR issues
const BlocklyWorkspace = dynamic(
  () => import('react-blockly').then(mod => mod.BlocklyWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    ),
  }
);

export interface EffectEditorProps {
  /** Initial effects to load into the workspace */
  initialEffects?: AbilityEffectOutput[];
  /** Called when effects change */
  onChange?: (effects: AbilityEffectOutput[]) => void;
  /**
   * Called whenever the editor's blocking error changes: a message while the
   * editor holds state that must not be saved (the generator threw, the JSON
   * is invalid, or the blocks failed to load), null when it is safe to save.
   * While non-null, onChange does not fire and the last emitted effects are
   * stale.
   */
  onValidityChange?: (blockingError: string | null) => void;
  /** Called when save is requested */
  onSave?: (effects: AbilityEffectOutput[]) => void;
  /** Read-only mode for viewing */
  readOnly?: boolean;
  /** Height of the editor */
  height?: string;
  /** Available effects from database for linking */
  availableEffects?: Array<{ id: number; name: string; effectType: string }>;
  /** Current zone ID for filtering mobs/objects (shows current zone first, then others) */
  zoneId?: number;
}

// Base Blockly workspace configuration (theme-independent options)
const baseWorkspaceConfig = {
  // Sprites (checkboxes, zoom/trash icons), cursors and sounds are served from
  // public/blockly/media (copied from node_modules/blockly/media). Blockly's
  // default is an external host that the CSP (img-src 'self' data:) blocks.
  media: '/blockly/media/',
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2,
  },
  trashcan: true,
  sounds: false,
  oneBasedIndex: false,
  move: {
    scrollbars: true,
    drag: true,
    wheel: true,
  },
};

// We'll create Blockly themes dynamically after Blockly is loaded
// These are the component style values we want to apply
const lightThemeStyles = {
  workspaceBackgroundColour: '#f8fafc',
  toolboxBackgroundColour: '#f1f5f9',
  toolboxForegroundColour: '#1e293b',
  flyoutBackgroundColour: '#f1f5f9',
  flyoutForegroundColour: '#1e293b',
  flyoutOpacity: 0.95,
  scrollbarColour: 'transparent',
  scrollbarOpacity: 0,
  insertionMarkerColour: '#3b82f6',
  insertionMarkerOpacity: 0.5,
  cursorColour: '#3b82f6',
};

const darkThemeStyles = {
  workspaceBackgroundColour: '#1e1e2e',
  toolboxBackgroundColour: '#11111b',
  toolboxForegroundColour: '#cdd6f4',
  flyoutBackgroundColour: '#181825',
  flyoutForegroundColour: '#cdd6f4',
  flyoutOpacity: 0.95,
  scrollbarColour: 'transparent',
  scrollbarOpacity: 0,
  insertionMarkerColour: '#89b4fa',
  insertionMarkerOpacity: 0.5,
  cursorColour: '#89b4fa',
};

// Light theme workspace configuration
const lightWorkspaceConfig = {
  ...baseWorkspaceConfig,
  grid: {
    spacing: 20,
    length: 3,
    colour: '#e0e0e0',
    snap: true,
  },
  renderer: 'zelos',
};

// Dark theme workspace configuration
const darkWorkspaceConfig = {
  ...baseWorkspaceConfig,
  grid: {
    spacing: 20,
    length: 3,
    colour: '#374151',
    snap: true,
  },
  renderer: 'zelos',
};

export function EffectEditor({
  initialEffects = [],
  onChange,
  onValidityChange,
  onSave,
  readOnly = false,
  height = '500px',
  availableEffects = [],
  zoneId,
}: EffectEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'blocks' | 'json'>('blocks');
  const [jsonValue, setJsonValue] = useState<string>(
    JSON.stringify(initialEffects, null, 2)
  );
  const [effects, setEffects] = useState<AbilityEffectOutput[]>(initialEffects);
  const [error, setError] = useState<string | null>(null);
  // Result of the last Validate click when nothing blocks saving.
  const [notice, setNotice] = useState<string | null>(null);
  // Set while the editor holds state that must not be saved (see
  // onValidityChange). Distinct from `error`, which also carries the
  // non-blocking results of the Validate button.
  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [blocksRegistered, setBlocksRegistered] = useState(false);
  // The live Blockly workspace, and the workspace the current `effects` were
  // last loaded into. A workspace is replaced whenever the theme or read-only
  // mode changes (see workspaceKey), so loading is tracked per workspace.
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [loadedWorkspace, setLoadedWorkspace] =
    useState<Blockly.WorkspaceSvg | null>(null);
  const [toolbox, setToolbox] = useState<ToolboxDefinition | null>(null);
  const [blocklyThemes, setBlocklyThemes] = useState<{
    light: unknown;
    dark: unknown;
  } | null>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  // JSON of the effects most recently passed to onChange (see sync effect).
  const lastEmittedJsonRef = useRef<string | null>(null);
  // Set when loading the effects into a workspace threw partway: the
  // workspace holds only some of the effects, so its changes are not emitted.
  const loadFailedRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;

  // Blocking = structural problems (blockingError) or values that fail the
  // Effect catalog check; both disable Save in the parent.
  const [validationBlock, setValidationBlock] = useState<string | null>(null);
  const reportedBlock = blockingError ?? validationBlock;
  useEffect(() => {
    onValidityChangeRef.current?.(reportedBlock);
  }, [reportedBlock]);
  // The editor going away (e.g. leaving edit mode) leaves nothing to block.
  useEffect(() => () => onValidityChangeRef.current?.(null), []);

  // Fetch dropdown options for blocks
  const { data: optionsData } = useQuery(GetEffectEditorOptionsDocument);

  // Populate data registry when options load
  useEffect(() => {
    if (optionsData) {
      setEffectEditorData({
        effects:
          optionsData.effects?.map(e => ({
            id: Number(e.id),
            name: e.name,
            effectType: e.effectType,
            defaultParams: (e.defaultParams ?? null) as Record<
              string,
              unknown
            > | null,
          })) ?? [],
        mobs:
          optionsData.mobs?.map(m => ({
            id: m.id,
            zoneId: m.zoneId,
            name: m.plainName,
          })) ?? [],
        objects:
          optionsData.objects?.map(o => ({
            id: o.id,
            zoneId: o.zoneId,
            name: o.plainName,
          })) ?? [],
        triggers:
          optionsData.triggers?.map(t => ({
            id: Number(t.id),
            name: t.name,
            zoneId: t.zoneId ?? 0,
          })) ?? [],
        zones:
          optionsData.zones?.map(z => ({
            id: z.id,
            name: z.name,
          })) ?? [],
        currentZoneId: zoneId ?? null,
      });
    }
    return () => {
      clearEffectEditorData();
    };
  }, [optionsData, zoneId]);

  // Effect rows the check validates against (Effect.default_params is the schema)
  const effectCatalog = useMemo(
    () =>
      optionsData?.effects?.length
        ? optionsData.effects.map(e => ({
            id: Number(e.id),
            name: e.name,
            defaultParams: (e.defaultParams ?? null) as Record<
              string,
              unknown
            > | null,
          }))
        : null,
    [optionsData]
  );
  const { validate, errors: validationErrors } = useEffectValidation(
    effects,
    effectCatalog
  );
  // A Validate result describes the effects as they were; edits invalidate it.
  useEffect(() => {
    setNotice(null);
  }, [effects]);
  useEffect(() => {
    if (validationErrors.length === 0) {
      setValidationBlock(null);
      return;
    }
    const first = formatValidationErrors(validationErrors.slice(0, 1))[0]!;
    setValidationBlock(
      `${validationErrors.length} problem${validationErrors.length === 1 ? '' : 's'} in the effects: ${first.replace(/^\[ERROR\] /, '')}`
    );
  }, [validationErrors]);

  // Sync state when initialEffects prop changes (e.g., when data loads after mount)
  // Use JSON comparison to avoid unnecessary updates from new array references
  const initialEffectsJson = JSON.stringify(initialEffects);
  useEffect(() => {
    // The parent echoing back what this editor just emitted (onChange ->
    // initialEffects) is not new data. Reloading the blocks then would wipe
    // the block being edited and close its field editor after every keystroke.
    if (initialEffectsJson === lastEmittedJsonRef.current) return;
    lastEmittedJsonRef.current = null;
    // New data replaces whatever was wrong with the old; the reload below
    // reports a load failure again if there still is one.
    loadFailedRef.current = null;
    setBlockingError(null);
    setError(null);
    const parsed = JSON.parse(initialEffectsJson) as AbilityEffectOutput[];
    setEffects(parsed);
    setJsonValue(
      initialEffectsJson.length > 2
        ? JSON.stringify(parsed, null, 2)
        : initialEffectsJson
    );
    // Force a reload of the blocks when initialEffects changes
    setLoadedWorkspace(null);
  }, [initialEffectsJson]);

  // Handle hydration mismatch with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in dark mode (default to dark during SSR/unresolved)
  // This ensures Blockly matches the page when theme hasn't been resolved yet
  const isDark = !mounted || resolvedTheme !== 'light';

  const workspaceKey = `${isDark ? 'dark' : 'light'}-${readOnly ? 'ro' : 'rw'}`;

  // Select workspace configuration based on theme
  const workspaceConfiguration = useMemo(() => {
    const baseConfig = isDark ? darkWorkspaceConfig : lightWorkspaceConfig;
    const currentTheme = blocklyThemes
      ? isDark
        ? blocklyThemes.dark
        : blocklyThemes.light
      : undefined;
    if (currentTheme) {
      return {
        ...baseConfig,
        readOnly,
        theme: currentTheme as Blockly.Theme,
      };
    }
    return {
      ...baseConfig,
      readOnly,
    };
  }, [isDark, readOnly, blocklyThemes]);

  // Register custom blocks and create themes on mount
  useEffect(() => {
    const registerBlocks = async () => {
      try {
        const [{ registerAllBlocks }, BlocklyModule] = await Promise.all([
          import('./blocks'),
          import('blockly'),
        ]);

        registerAllBlocks();

        // Create light and dark themes using Blockly's Theme API
        const lightTheme = BlocklyModule.Theme.defineTheme(
          'effectEditorLight',
          {
            name: 'effectEditorLight',
            base: BlocklyModule.Themes.Classic,
            componentStyles: lightThemeStyles,
          }
        );

        const darkTheme = BlocklyModule.Theme.defineTheme('effectEditorDark', {
          name: 'effectEditorDark',
          base: BlocklyModule.Themes.Classic,
          componentStyles: darkThemeStyles,
        });

        setBlocklyThemes({ light: lightTheme, dark: darkTheme });
        // Build the toolbox from registered blocks before any workspace is
        // injected: Blockly cannot add a toolbox to a workspace later.
        setToolbox(buildToolbox(type => type in BlocklyModule.Blocks));
        setBlocksRegistered(true);
      } catch (err) {
        console.error('Failed to register blocks:', err);
        setError('Failed to initialize effect editor blocks');
      }
    };
    registerBlocks();
  }, []);

  // Track when registry data is ready (must be separate from optionsData check)
  const [registryReady, setRegistryReady] = useState(false);

  // Update registryReady when optionsData changes and registry is populated
  useEffect(() => {
    if (optionsData?.effects && optionsData.effects.length > 0) {
      // Small delay to ensure setEffectEditorData has run
      const timer = setTimeout(() => {
        if (hasEffectsLoaded()) {
          setRegistryReady(true);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [optionsData]);

  // Load the current effects into the live workspace whenever a workspace is
  // (re)created: first mount, theme change, read-only <-> editing switch, or
  // coming back from the JSON view. Must wait for registry data so the effect
  // ID -> block type mapping is available.
  useEffect(() => {
    if (
      blocksRegistered &&
      workspace &&
      loadedWorkspace !== workspace &&
      registryReady &&
      hasEffectsLoaded()
    ) {
      try {
        loadEffectsIntoWorkspace(workspace, effects);
        if (loadFailedRef.current !== null) {
          loadFailedRef.current = null;
          setBlockingError(null);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load effects into workspace:', err);
        // Part of the effects never made it into the workspace. Emitting its
        // next change would hand the parent a truncated list.
        loadFailedRef.current = workspace;
        const message = `Failed to load effects into the editor: ${
          err instanceof Error ? err.message : String(err)
        }. Saving is disabled; edit the JSON view or reopen the ability.`;
        setError(message);
        setBlockingError(message);
      }
      setLoadedWorkspace(workspace);
    }
  }, [blocksRegistered, workspace, loadedWorkspace, registryReady, effects]);

  // Update workspace theme when theme changes
  useEffect(() => {
    if (workspaceRef.current && blocklyThemes) {
      const theme = isDark ? blocklyThemes.dark : blocklyThemes.light;
      if (theme) {
        workspaceRef.current.setTheme(theme as Blockly.Theme);
      }
    }
  }, [isDark, blocklyThemes]);

  // Handle workspace changes
  const handleWorkspaceChange = useCallback(
    (changed: Blockly.WorkspaceSvg) => {
      workspaceRef.current = changed;
      setWorkspace(prev => (prev === changed ? prev : changed));

      // Skip state updates until this workspace has its blocks loaded; the
      // empty workspace must not overwrite the effects before they are loaded.
      if (loadedWorkspace !== changed) {
        return;
      }
      if (loadFailedRef.current === changed) {
        return;
      }

      try {
        const generatedEffects = generateJson(changed);
        lastEmittedJsonRef.current = JSON.stringify(generatedEffects);
        setEffects(generatedEffects);
        setJsonValue(JSON.stringify(generatedEffects, null, 2));
        setError(null);
        setBlockingError(null);
        onChange?.(generatedEffects);
      } catch (err) {
        console.error('Error generating effects:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to generate effects';
        setError(message);
        setBlockingError(message);
      }
    },
    [onChange, loadedWorkspace]
  );

  // The workspace is gone (disposed on re-inject or unmount).
  const handleWorkspaceDispose = useCallback(
    (disposed: Blockly.WorkspaceSvg) => {
      if (workspaceRef.current === disposed) workspaceRef.current = null;
      setWorkspace(prev => (prev === disposed ? null : prev));
    },
    []
  );

  // Handle JSON editing
  const handleJsonChange = useCallback(
    (newJson: string) => {
      setJsonValue(newJson);
      try {
        const parsed = JSON.parse(newJson) as AbilityEffectOutput[];
        if (!Array.isArray(parsed)) throw new Error('Effects must be an array');
        lastEmittedJsonRef.current = JSON.stringify(parsed);
        setEffects(parsed);
        setError(null);
        loadFailedRef.current = null;
        setBlockingError(null);
        onChange?.(parsed);
      } catch {
        setError('Invalid JSON format');
        setBlockingError('Invalid JSON format');
      }
    },
    [onChange]
  );

  // Handle save
  const handleSave = useCallback(() => {
    if (reportedBlock) return;
    onSave?.(effects);
  }, [reportedBlock, effects, onSave]);

  // Handle validation: every effect, every field; the result stays visible.
  const handleValidate = useCallback(() => {
    if (blockingError) {
      setNotice(null);
      setError(blockingError);
      return false;
    }
    const result = validate();
    if (!result.valid) {
      setNotice(null);
      setError(
        formatValidationErrors([...result.errors, ...result.warnings]).join(
          '\n'
        )
      );
      return false;
    }
    setError(null);
    setNotice(
      result.warnings.length > 0
        ? formatValidationErrors(result.warnings).join('\n')
        : `No problems found in ${effects.length} effect${effects.length === 1 ? '' : 's'}.`
    );
    return true;
  }, [validate, blockingError, effects.length]);

  if (!blocksRegistered || !toolbox) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center h-96'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading effect editor...
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Effect Pipeline</CardTitle>
          <EffectEditorToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSave={onSave ? handleSave : undefined}
            onValidate={handleValidate}
            readOnly={readOnly}
            effectCount={effects.length}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription className='whitespace-pre-line'>
              {error}
            </AlertDescription>
          </Alert>
        ) : !readOnly && validationErrors.length > 0 ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription className='whitespace-pre-line'>
              {formatValidationErrors(validationErrors.slice(0, 5)).join('\n')}
              {validationErrors.length > 5
                ? `\n...and ${validationErrors.length - 5} more`
                : ''}
            </AlertDescription>
          </Alert>
        ) : notice ? (
          <Alert className='mb-4'>
            <AlertDescription className='whitespace-pre-line'>
              {notice}
            </AlertDescription>
          </Alert>
        ) : null}

        {viewMode === 'blocks' ? (
          <div style={{ height }} className='border rounded-md overflow-hidden'>
            <BlocklyWorkspace
              // react-blockly only reads the workspace/toolbox configuration at
              // inject time (a read-only workspace has no toolbox and cannot
              // gain one later), so changing theme or read-only mode must
              // inject a fresh workspace.
              key={workspaceKey}
              className='w-full h-full'
              toolboxConfiguration={toolbox}
              workspaceConfiguration={workspaceConfiguration}
              onWorkspaceChange={handleWorkspaceChange}
              onDispose={handleWorkspaceDispose}
            />
          </div>
        ) : (
          <div style={{ height }} className='border rounded-md overflow-hidden'>
            <textarea
              className='w-full h-full p-4 font-mono text-sm bg-muted text-foreground resize-none focus:outline-none'
              value={jsonValue}
              onChange={e => handleJsonChange(e.target.value)}
              readOnly={readOnly}
              placeholder='[]'
            />
          </div>
        )}

        {effects.length > 0 && (
          <div className='mt-2 text-sm text-muted-foreground'>
            {effects.length} effect{effects.length !== 1 ? 's' : ''} in pipeline
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EffectEditor;
