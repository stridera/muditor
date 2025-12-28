/**
 * Data registry for EffectEditor block dropdowns.
 *
 * This module stores the dropdown options that are fetched from the database
 * and makes them available to Blockly block definitions.
 */

// Blockly menu option type: [displayText, value]
type MenuOption = [string, string];

export interface EffectParamSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
}

export interface EffectOption {
  id: number;
  name: string;
  effectType: string;
  paramSchema?: EffectParamSchema | null;
}

export interface MobOption {
  id: number;
  zoneId: number;
  name: string;
}

export interface ObjectOption {
  id: number;
  zoneId: number;
  name: string;
}

export interface TriggerOption {
  id: number;
  name: string;
  zoneId: number;
}

export interface ZoneOption {
  id: number;
  name: string;
}

interface EffectEditorData {
  effects: EffectOption[];
  mobs: MobOption[];
  objects: ObjectOption[];
  triggers: TriggerOption[];
  zones: ZoneOption[];
  currentZoneId: number | null;
}

// Default empty data
const defaultData: EffectEditorData = {
  effects: [],
  mobs: [],
  objects: [],
  triggers: [],
  zones: [],
  currentZoneId: null,
};

// The registry - stores dropdown options
let registryData: EffectEditorData = { ...defaultData };

/**
 * Deduplicate array by composite key
 */
function dedupeByKey<T extends { zoneId: number; id: number }>(
  items: T[]
): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = `${item.zoneId}:${item.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Sort items by zone - current zone first, then alphabetically by name
 */
function sortByZone<T extends { zoneId: number; name: string }>(
  items: T[],
  currentZoneId: number | null
): T[] {
  return [...items].sort((a, b) => {
    // Current zone items come first
    if (currentZoneId !== null) {
      const aInZone = a.zoneId === currentZoneId;
      const bInZone = b.zoneId === currentZoneId;
      if (aInZone && !bInZone) return -1;
      if (!aInZone && bInZone) return 1;
    }
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Update the registry with new data
 */
export function setEffectEditorData(data: Partial<EffectEditorData>): void {
  // Deduplicate to prevent accumulation from re-renders
  const cleanedData: Partial<EffectEditorData> = {};
  const zoneId = data.currentZoneId ?? registryData.currentZoneId;

  if (data.effects) cleanedData.effects = data.effects;
  if (data.mobs) {
    cleanedData.mobs = sortByZone(dedupeByKey(data.mobs), zoneId);
  }
  if (data.objects)
    cleanedData.objects = sortByZone(dedupeByKey(data.objects), zoneId);
  if (data.triggers) cleanedData.triggers = data.triggers;
  if (data.zones) cleanedData.zones = data.zones;
  if (data.currentZoneId !== undefined)
    cleanedData.currentZoneId = data.currentZoneId;

  registryData = {
    ...defaultData, // Reset to defaults first to prevent accumulation
    ...cleanedData,
  };
}

/**
 * Clear all registry data
 */
export function clearEffectEditorData(): void {
  registryData = { ...defaultData };
}

/**
 * Strip ANSI color codes from a string for clean display
 */
function stripAnsiCodes(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Convert snake_case or kebab-case to Title Case
 */
function toTitleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Get effects as menu options for Blockly dropdowns
 */
export function getEffectOptions(): MenuOption[] {
  if (registryData.effects.length === 0) {
    return [['(No effects loaded)', '0']];
  }
  return registryData.effects.map(e => [
    toTitleCase(stripAnsiCodes(e.name)),
    String(e.id),
  ]);
}

/**
 * Get effects filtered by type as menu options
 */
export function getEffectOptionsByType(effectType: string): MenuOption[] {
  const filtered = registryData.effects.filter(
    e => e.effectType === effectType
  );
  if (filtered.length === 0) {
    return [['(No matching effects)', '0']];
  }
  return filtered.map(e => [toTitleCase(stripAnsiCodes(e.name)), String(e.id)]);
}

/**
 * Get mobs as menu options for Blockly dropdowns
 * Format: "Name [Zone:ID]"
 * Includes a "(No specific mob)" option for effects that don't require a specific mob
 */
export function getMobOptions(): MenuOption[] {
  if (registryData.mobs.length === 0) {
    return [
      ['(No specific mob)', ''],
      ['(No mobs loaded)', '0:0'],
    ];
  }
  return [
    ['(No specific mob)', ''],
    ...registryData.mobs.map(m => [
      `${stripAnsiCodes(m.name)} [${m.zoneId}:${m.id}]`,
      `${m.zoneId}:${m.id}`,
    ]),
  ] as MenuOption[];
}

/**
 * Get objects as menu options for Blockly dropdowns
 * Format: "Name [Zone:ID]"
 */
export function getObjectOptions(): MenuOption[] {
  if (registryData.objects.length === 0) {
    return [['(No objects loaded)', '0:0']];
  }
  return registryData.objects.map(o => [
    `${stripAnsiCodes(o.name)} [${o.zoneId}:${o.id}]`,
    `${o.zoneId}:${o.id}`,
  ]);
}

/**
 * Get triggers/scripts as menu options for Blockly dropdowns
 */
export function getTriggerOptions(): MenuOption[] {
  if (registryData.triggers.length === 0) {
    return [['(No scripts loaded)', '0']];
  }
  return registryData.triggers.map(t => [
    `${toTitleCase(stripAnsiCodes(t.name))} [${t.zoneId}:${t.id}]`,
    String(t.id),
  ]);
}

/**
 * Get zones as menu options for Blockly dropdowns
 */
export function getZoneOptions(): MenuOption[] {
  if (registryData.zones.length === 0) {
    return [['(No zones loaded)', '-1']];
  }
  // Sort zones by ID
  const sorted = [...registryData.zones].sort((a, b) => a.id - b.id);
  return [
    ['All Zones', '-1'] as MenuOption,
    ...sorted.map(
      z => [`${stripAnsiCodes(z.name)} (${z.id})`, String(z.id)] as MenuOption
    ),
  ];
}

/**
 * Get mobs filtered by zone as menu options
 * Includes a "(No specific mob)" option for effects that don't require a specific mob
 */
export function getMobOptionsByZone(zoneId: number | null): MenuOption[] {
  let mobs = registryData.mobs;

  // Filter by zone if specified (zoneId !== -1 and not null)
  if (zoneId !== null && zoneId !== -1) {
    mobs = mobs.filter(m => m.zoneId === zoneId);
  }

  if (mobs.length === 0) {
    return [
      ['(No specific mob)', ''],
      ['(No mobs in zone)', '0:0'],
    ];
  }

  // Sort by zoneId, then by id within zone
  const sorted = [...mobs].sort((a, b) => {
    if (a.zoneId !== b.zoneId) return a.zoneId - b.zoneId;
    return a.id - b.id;
  });
  return [
    ['(No specific mob)', ''],
    ...sorted.map(m => [
      `${stripAnsiCodes(m.name)} [${m.zoneId}:${m.id}]`,
      `${m.zoneId}:${m.id}`,
    ]),
  ] as MenuOption[];
}

/**
 * Get objects filtered by zone as menu options
 */
export function getObjectOptionsByZone(zoneId: number | null): MenuOption[] {
  let objects = registryData.objects;

  // Filter by zone if specified
  if (zoneId !== null && zoneId !== -1) {
    objects = objects.filter(o => o.zoneId === zoneId);
  }

  if (objects.length === 0) {
    return [['(No objects in zone)', '0:0']];
  }

  // Sort by zoneId, then by id within zone
  const sorted = [...objects].sort((a, b) => {
    if (a.zoneId !== b.zoneId) return a.zoneId - b.zoneId;
    return a.id - b.id;
  });
  return sorted.map(o => [
    `${stripAnsiCodes(o.name)} [${o.zoneId}:${o.id}]`,
    `${o.zoneId}:${o.id}`,
  ]);
}

/**
 * Parse a "zoneId:id" string into separate values
 */
export function parseZoneId(value: string): { zoneId: number; id: number } {
  const [zoneId, id] = value.split(':').map(Number);
  return { zoneId: zoneId || 0, id: id || 0 };
}

/**
 * Format zone and id into a combined string
 */
export function formatZoneId(zoneId: number, id: number): string {
  return `${zoneId}:${id}`;
}

/**
 * Build a mapping from block type (e.g., "effect_damage") to effect ID
 * This replaces the hardcoded EFFECT_TYPE_TO_ID constant
 */
export function getEffectTypeToIdMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const effect of registryData.effects) {
    // Block type is "effect_" + lowercase name (e.g., "effect_damage")
    const blockType = `effect_${effect.name.toLowerCase()}`;
    map[blockType] = effect.id;
  }
  return map;
}

/**
 * Build a mapping from effect ID to block type (e.g., 1 -> "effect_damage")
 * This replaces the hardcoded EFFECT_ID_TO_TYPE constant
 */
export function getEffectIdToTypeMap(): Record<number, string> {
  const map: Record<number, string> = {};
  for (const effect of registryData.effects) {
    // Block type is "effect_" + lowercase name (e.g., "effect_damage")
    const blockType = `effect_${effect.name.toLowerCase()}`;
    map[effect.id] = blockType;
  }
  return map;
}

/**
 * Get effect ID from block type, with fallback for unknown types
 * Returns undefined if not found
 */
export function getEffectIdForBlockType(blockType: string): number | undefined {
  const map = getEffectTypeToIdMap();
  return map[blockType];
}

/**
 * Get block type from effect ID, with fallback for unknown IDs
 * Returns undefined if not found
 */
export function getBlockTypeForEffectId(effectId: number): string | undefined {
  const map = getEffectIdToTypeMap();
  return map[effectId];
}

/**
 * Check if effects have been loaded into the registry
 */
export function hasEffectsLoaded(): boolean {
  return registryData.effects.length > 0;
}

/**
 * Get field names for a block type from the effect's paramSchema
 * Falls back to empty array if effect not found or no schema
 */
export function getFieldNamesForEffect(blockType: string): string[] {
  // Extract effect name from block type (e.g., "effect_damage" -> "damage")
  if (!blockType.startsWith('effect_')) {
    return [];
  }

  const effectName = blockType.replace('effect_', '');
  const effect = registryData.effects.find(
    e => e.name.toLowerCase() === effectName
  );

  if (!effect?.paramSchema?.properties) {
    return [];
  }

  // Return the property names from the schema
  return Object.keys(effect.paramSchema.properties);
}

/**
 * Get the full param schema for a block type
 * Useful for field validation and enum options
 */
export function getParamSchemaForEffect(
  blockType: string
): EffectParamSchema | null {
  if (!blockType.startsWith('effect_')) {
    return null;
  }

  const effectName = blockType.replace('effect_', '');
  const effect = registryData.effects.find(
    e => e.name.toLowerCase() === effectName
  );

  return effect?.paramSchema ?? null;
}
