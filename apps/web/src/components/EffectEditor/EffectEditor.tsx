'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { EffectEditorToolbar } from './EffectEditorToolbar';
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

// Toolbox configuration - consolidated 18-effect schema
// Effect details are defined in the Effect database table
const toolboxCategories = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Damage & Healing',
      colour: '#e53935',
      contents: [
        { kind: 'block', type: 'effect_damage' }, // Includes instant, DoT (interval), chain (maxJumps), lifesteal type
        { kind: 'block', type: 'damage_component' }, // For multi-element damage (e.g., 50% fire + 50% cold)
        { kind: 'block', type: 'effect_heal' },
      ],
    },
    {
      kind: 'category',
      name: 'Status & Buffs',
      colour: '#8e24aa',
      contents: [
        { kind: 'block', type: 'effect_status' }, // All flags: buffs, CC, stealth, detection, resistance, vulnerability, reflect
        { kind: 'block', type: 'effect_modify' }, // Stats, saves, resources, size
        { kind: 'block', type: 'effect_globe' }, // Spell immunity by circle
      ],
    },
    {
      kind: 'category',
      name: 'Cleansing & Dispel',
      colour: '#43a047',
      contents: [
        { kind: 'block', type: 'effect_cleanse' }, // Remove conditions (poison, curse, etc.)
        { kind: 'block', type: 'effect_dispel' }, // Remove magical effects
        { kind: 'block', type: 'effect_reveal' }, // Show hidden creatures/objects
      ],
    },
    {
      kind: 'category',
      name: 'Movement & Position',
      colour: '#00897b',
      contents: [
        { kind: 'block', type: 'effect_teleport' }, // Move to location
        { kind: 'block', type: 'effect_move' }, // Forced movement: knockback, pull, swap
        { kind: 'block', type: 'effect_extract' }, // Remove mob/object from game
      ],
    },
    {
      kind: 'category',
      name: 'Combat',
      colour: '#1e88e5',
      contents: [
        { kind: 'block', type: 'effect_interrupt' }, // Stop casting/channeling
        { kind: 'block', type: 'effect_transform' }, // Shapechange
      ],
    },
    {
      kind: 'category',
      name: 'Creation & Summoning',
      colour: '#5e35b1',
      contents: [
        { kind: 'block', type: 'effect_summon' }, // Create creature
        { kind: 'block', type: 'effect_create' }, // Create object
        { kind: 'block', type: 'effect_enchant' }, // Apply effect to object
      ],
    },
    {
      kind: 'category',
      name: 'Room Effects',
      colour: '#f4511e',
      contents: [
        { kind: 'block', type: 'effect_room' }, // Includes both room effects and barriers (subtype param)
      ],
    },
    {
      kind: 'category',
      name: 'Special',
      colour: '#6d4c41',
      contents: [
        { kind: 'block', type: 'effect_resurrect' },
        { kind: 'block', type: 'effect_script' }, // Custom Lua scripts
      ],
    },
    {
      kind: 'category',
      name: 'Gates (Conditions)',
      colour: '#00acc1',
      contents: [
        { kind: 'block', type: 'gate_check' },
        { kind: 'block', type: 'gate_chance' },
        { kind: 'block', type: 'gate_saving_throw' },
        { kind: 'block', type: 'gate_attack_roll' },
        { kind: 'block', type: 'gate_contest' },
      ],
    },
  ],
};

export function EffectEditor({
  initialEffects = [],
  onChange,
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
  const [blocksRegistered, setBlocksRegistered] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [blocklyThemes, setBlocklyThemes] = useState<{
    light: unknown;
    dark: unknown;
  } | null>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

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
            paramSchema: e.paramSchema as {
              type: string;
              properties?: Record<string, unknown>;
              required?: string[];
            } | null,
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

  // Use validation hook
  const { validate, errors: validationErrors } = useEffectValidation(effects);

  // Sync state when initialEffects prop changes (e.g., when data loads after mount)
  // Use JSON comparison to avoid unnecessary updates from new array references
  const initialEffectsJson = JSON.stringify(initialEffects);
  useEffect(() => {
    const parsed = JSON.parse(initialEffectsJson) as AbilityEffectOutput[];
    setEffects(parsed);
    setJsonValue(
      initialEffectsJson.length > 2
        ? JSON.stringify(parsed, null, 2)
        : initialEffectsJson
    );
    // Reset initialLoaded so blocks can be reloaded when initialEffects changes
    setInitialLoaded(false);
  }, [initialEffectsJson]);

  // Handle hydration mismatch with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in dark mode (default to dark during SSR/unresolved)
  // This ensures Blockly matches the page when theme hasn't been resolved yet
  const isDark = !mounted || resolvedTheme !== 'light';

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

  // Load initial effects into workspace when ready
  // Must wait for registry data to be populated so the effect ID -> block type mapping is available
  useEffect(() => {
    if (
      blocksRegistered &&
      workspaceRef.current &&
      initialEffects.length > 0 &&
      !initialLoaded &&
      registryReady &&
      hasEffectsLoaded()
    ) {
      try {
        loadEffectsIntoWorkspace(workspaceRef.current, initialEffects);
        setInitialLoaded(true);
      } catch (err) {
        console.error('Failed to load initial effects:', err);
      }
    }
  }, [blocksRegistered, initialEffects, initialLoaded, registryReady]);

  // Track previous view mode to detect when switching to blocks view
  const [prevViewMode, setPrevViewMode] = useState<'blocks' | 'json'>(viewMode);

  // Reload blocks when switching from JSON view to blocks view
  useEffect(() => {
    if (
      prevViewMode === 'json' &&
      viewMode === 'blocks' &&
      blocksRegistered &&
      workspaceRef.current &&
      registryReady &&
      hasEffectsLoaded()
    ) {
      try {
        // Reload the workspace with current effects state (which may have been edited in JSON view)
        loadEffectsIntoWorkspace(workspaceRef.current, effects);
      } catch (err) {
        console.error('Failed to reload effects after view switch:', err);
      }
    }
    setPrevViewMode(viewMode);
  }, [viewMode, blocksRegistered, registryReady, effects, prevViewMode]);

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
    (workspace: Blockly.WorkspaceSvg) => {
      workspaceRef.current = workspace;

      // Skip state updates if we have initial effects but haven't loaded them yet
      // This prevents the empty workspace from overwriting state before blocks are loaded
      if (initialEffects.length > 0 && !initialLoaded) {
        return;
      }

      try {
        const generatedEffects = generateJson(workspace);
        setEffects(generatedEffects);
        setJsonValue(JSON.stringify(generatedEffects, null, 2));
        setError(null);
        onChange?.(generatedEffects);
      } catch (err) {
        console.error('Error generating effects:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to generate effects'
        );
      }
    },
    [onChange, initialEffects.length, initialLoaded]
  );

  // Handle JSON editing
  const handleJsonChange = useCallback(
    (newJson: string) => {
      setJsonValue(newJson);
      try {
        const parsed = JSON.parse(newJson) as AbilityEffectOutput[];
        setEffects(parsed);
        setError(null);
        onChange?.(parsed);
      } catch {
        setError('Invalid JSON format');
      }
    },
    [onChange]
  );

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(effects);
  }, [effects, onSave]);

  // Handle validation
  const handleValidate = useCallback(() => {
    const result = validate();
    if (result.valid) {
      setError(null);
      return true;
    } else {
      const errorMessages = formatValidationErrors(result.errors);
      setError(errorMessages.join('\n'));
      return false;
    }
  }, [validate]);

  if (!blocksRegistered) {
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
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {viewMode === 'blocks' ? (
          <div style={{ height }} className='border rounded-md overflow-hidden'>
            <BlocklyWorkspace
              key={isDark ? 'dark' : 'light'} // Force re-render on theme change
              className='w-full h-full'
              toolboxConfiguration={toolboxCategories}
              workspaceConfiguration={workspaceConfiguration}
              onWorkspaceChange={handleWorkspaceChange}
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
