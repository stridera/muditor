import type Blockly from 'blockly';
import {
  parseZoneId,
  getEffectIdForBlockType,
  getEffectIdToTypeMap,
  hasEffectsLoaded,
  getFieldNamesForEffect,
} from '../blocks/data-registry';

/**
 * Output format for ability effects and gates
 * Effects have effectId, gates have gateType
 */
export interface AbilityEffectOutput {
  /** Foreign key to Effect template (for effects, undefined for gates) */
  effectId?: number;
  /** Gate type (for gates, undefined for effects) */
  gateType?: 'check' | 'chance' | 'saving_throw' | 'attack_roll' | 'contest';
  /** Block field values that override effect defaults, or gate params with onPass/onFail */
  overrideParams: Record<string, unknown>;
  /** Sequence position in the effect pipeline */
  order: number;
  /** When the effect triggers: on_cast, on_hit, on_miss, etc. */
  trigger?: string | undefined;
  /** Chance percentage (0-100) */
  chancePct: number;
  /** Lua expression for conditional execution */
  condition?: string | undefined;
}

/**
 * Effect ID mapping is now loaded dynamically from the database
 * via getEffectIdForBlockType() from data-registry.ts
 *
 * The 18-effect schema is defined in the Effect table:
 * 1. damage  - Deal damage (instant/periodic/chain)
 * 2. heal    - Restore resources
 * 3. modify  - Change any numeric value
 * 4. status  - Apply/remove flags
 * 5. cleanse - Remove conditions
 * 6. dispel  - Remove magical effects
 * 7. reveal  - One-time show hidden
 * 8. teleport - Move characters
 * 9. extract - Remove mob/object from game
 * 10. move   - Forced movement (knockback/pull/swap)
 * 11. interrupt - Stop casting/channeling
 * 12. transform - Change form (shapechange)
 * 13. resurrect - Bring back dead
 * 14. create - Create object
 * 15. summon - Create creature
 * 16. enchant - Apply effect to object
 * 17. globe  - Spell immunity by circle
 * 18. room   - Room-wide effects/barriers
 */

/**
 * Maps Blockly gate block types to gate type strings
 */
const GATE_BLOCK_TO_TYPE: Record<string, AbilityEffectOutput['gateType']> = {
  gate_check: 'check',
  gate_chance: 'chance',
  gate_saving_throw: 'saving_throw',
  gate_attack_roll: 'attack_roll',
  gate_contest: 'contest',
};

/**
 * Extract parameters from a block based on its type
 */
function extractBlockParams(block: Blockly.Block): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const blockType = block.type;

  // Get all field values from the block
  const fieldNames = getFieldNamesForBlockType(blockType);

  for (const fieldName of fieldNames) {
    const value = block.getFieldValue(fieldName);
    if (value !== null && value !== undefined) {
      // Handle combined "zoneId:id" ref fields - split them into separate fields
      if (fieldName === 'mobRef' && typeof value === 'string') {
        const { zoneId, id } = parseZoneId(value);
        params['mobZoneId'] = zoneId;
        params['mobId'] = id;
      } else if (fieldName === 'objectRef' && typeof value === 'string') {
        const { zoneId, id } = parseZoneId(value);
        params['objectZoneId'] = zoneId;
        params['objectId'] = id;
      } else if (
        fieldName === 'targetRoomZoneId' ||
        fieldName === 'targetRoomId'
      ) {
        // Nest teleport target room fields into targetRoom object
        if (!params['targetRoom']) {
          params['targetRoom'] = { zoneId: 0, id: 0 };
        }
        const targetRoom = params['targetRoom'] as {
          zoneId: number;
          id: number;
        };
        if (fieldName === 'targetRoomZoneId') {
          targetRoom.zoneId = Number(value);
        } else {
          targetRoom.id = Number(value);
        }
      } else {
        // Skip empty string values for optional fields
        if (value === '' && isOptionalField(blockType, fieldName)) {
          continue;
        }
        params[fieldName] = value;
      }
    }
  }

  return params;
}

/**
 * Check if a field is optional (can be empty)
 */
function isOptionalField(blockType: string, fieldName: string): boolean {
  const optionalFields: Record<string, string[]> = {
    effect_status: ['type', 'contestedBy', 'source'],
    effect_enchant: ['flag'],
    effect_damage: ['interval', 'duration', 'maxJumps', 'attenuation'],
  };
  return optionalFields[blockType]?.includes(fieldName) ?? false;
}

/**
 * UI-specific fields that are not in the database param_schema
 * These are convenience fields for the block editor that get transformed
 * during JSON generation (e.g., mobRef -> mobZoneId + mobId)
 */
const UI_EXTRA_FIELDS: Record<string, string[]> = {
  effect_teleport: ['targetRoomZoneId', 'targetRoomId'], // UI splits targetRoom into separate fields
  effect_create: ['objectRef'], // UI uses combined ref, transforms to objectZoneId + objectId
  effect_summon: ['mobRef'], // UI uses combined ref, transforms to mobZoneId + mobId
  effect_script: ['scriptId', 'args'], // Script effect has special fields
};

/**
 * Gate block fields (gates are not effects, so they're not in the Effect table)
 */
const GATE_FIELDS: Record<string, string[]> = {
  gate_check: ['condition'],
  gate_chance: ['percentage'],
  gate_saving_throw: ['saveType', 'dc'],
  gate_attack_roll: ['bonus'],
  gate_contest: ['casterStat', 'targetStat'],
};

/**
 * Get field names for a specific block type
 * Loads effect fields from database param_schema, with UI-specific overrides
 */
function getFieldNamesForBlockType(blockType: string): string[] {
  // Gate blocks have hardcoded fields (not in Effect table)
  if (blockType.startsWith('gate_')) {
    return GATE_FIELDS[blockType] || [];
  }

  // Effect blocks: get fields from database param_schema
  const schemaFields = getFieldNamesForEffect(blockType);

  // Add any UI-specific extra fields
  const extraFields = UI_EXTRA_FIELDS[blockType] || [];

  // Combine schema fields with UI extras (avoid duplicates)
  const allFields = [...schemaFields];
  for (const field of extraFields) {
    if (!allFields.includes(field)) {
      allFields.push(field);
    }
  }

  return allFields;
}

/**
 * Check if a block is an effect block (not a gate block)
 */
function isEffectBlock(block: Blockly.Block): boolean {
  return block.type.startsWith('effect_');
}

/**
 * Check if a block is a gate block (conditional)
 */
function isGateBlock(block: Blockly.Block): boolean {
  return block.type.startsWith('gate_');
}

/**
 * Process a chain of blocks starting from a given block
 * Returns an array of effect outputs
 */
function processBlockChain(
  startBlock: Blockly.Block | null,
  orderRef: { value: number }
): AbilityEffectOutput[] {
  const effects: AbilityEffectOutput[] = [];
  let currentBlock = startBlock;

  while (currentBlock) {
    const effectId = getEffectIdForBlockType(currentBlock.type);
    const gateType = GATE_BLOCK_TO_TYPE[currentBlock.type];

    if (effectId || gateType) {
      const params = extractBlockParams(currentBlock);

      // For gate blocks, also process onPass and onFail branches
      if (gateType) {
        const onPassBlock = currentBlock.getInputTargetBlock('onPass');
        const onFailBlock = currentBlock.getInputTargetBlock('onFail');

        // Recursively process nested blocks
        const onPassEffects = processBlockChain(onPassBlock, orderRef);
        const onFailEffects = processBlockChain(onFailBlock, orderRef);

        // Include branch contents in params
        if (onPassEffects.length > 0) {
          params['onPass'] = onPassEffects;
        }
        if (onFailEffects.length > 0) {
          params['onFail'] = onFailEffects;
        }

        // Create gate output
        const gate: AbilityEffectOutput = {
          gateType,
          overrideParams: params,
          order: orderRef.value++,
          chancePct: 100,
        };
        effects.push(gate);
      } else if (effectId !== undefined) {
        // Create effect output
        const effect: AbilityEffectOutput = {
          effectId,
          overrideParams: params,
          order: orderRef.value++,
          chancePct: 100,
        };

        // Check for trigger field (on effect blocks)
        const trigger = currentBlock.getFieldValue('trigger');
        if (trigger) {
          effect.trigger = trigger;
        }

        // Check for chance field (on effect blocks)
        const chance = currentBlock.getFieldValue('chancePct');
        if (chance !== null && chance !== undefined) {
          effect.chancePct = Number(chance);
        }

        effects.push(effect);
      }
    }

    // Move to the next connected block
    currentBlock = currentBlock.getNextBlock();
  }

  return effects;
}

/**
 * Generate JSON array from Blockly workspace
 * Traverses all top-level blocks and their connections
 */
export function generateJson(
  workspace: Blockly.WorkspaceSvg
): AbilityEffectOutput[] {
  const effects: AbilityEffectOutput[] = [];
  const topBlocks = workspace.getTopBlocks(true);
  const orderRef = { value: 0 };

  for (const block of topBlocks) {
    const chainEffects = processBlockChain(block, orderRef);
    effects.push(...chainEffects);
  }

  return effects;
}

/**
 * Validate an effects array against basic requirements
 */
export function validateEffects(effects: AbilityEffectOutput[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Get valid effect IDs from the database
  const validEffectIds = hasEffectsLoaded()
    ? new Set(Object.keys(getEffectIdToTypeMap()).map(Number))
    : null;

  function validateItem(item: AbilityEffectOutput, path: string) {
    // Must have either effectId or gateType
    if (!item.effectId && !item.gateType) {
      errors.push(`${path}: Missing both effectId and gateType`);
    }

    // Effects must have valid effectId (check against database if loaded)
    if (item.effectId !== undefined) {
      if (item.effectId <= 0) {
        errors.push(`${path}: Invalid effectId ${item.effectId}`);
      } else if (validEffectIds && !validEffectIds.has(item.effectId)) {
        errors.push(`${path}: Unknown effectId ${item.effectId}`);
      }
    }

    // Gates must have valid gateType
    if (item.gateType !== undefined) {
      const validGateTypes = [
        'check',
        'chance',
        'saving_throw',
        'attack_roll',
        'contest',
      ];
      if (!validGateTypes.includes(item.gateType)) {
        errors.push(`${path}: Invalid gateType "${item.gateType}"`);
      }

      // Recursively validate nested effects in gates
      const onPass = item.overrideParams['onPass'] as
        | AbilityEffectOutput[]
        | undefined;
      const onFail = item.overrideParams['onFail'] as
        | AbilityEffectOutput[]
        | undefined;

      if (onPass) {
        onPass.forEach((nested, j) =>
          validateItem(nested, `${path}.onPass[${j}]`)
        );
      }
      if (onFail) {
        onFail.forEach((nested, j) =>
          validateItem(nested, `${path}.onFail[${j}]`)
        );
      }
    }

    if (item.chancePct < 0 || item.chancePct > 100) {
      errors.push(`${path}: chancePct must be between 0 and 100`);
    }

    if (item.order < 0) {
      errors.push(`${path}: order must be non-negative`);
    }
  }

  effects.forEach((effect, i) => validateItem(effect, `Effect[${i}]`));

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default generateJson;
