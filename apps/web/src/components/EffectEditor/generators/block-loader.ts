import type Blockly from 'blockly';
import type { AbilityEffectOutput } from './json-generator';
import {
  formatZoneId,
  getBlockTypeForEffectId,
  getFieldNamesForEffect,
} from '../blocks/data-registry';

/**
 * Effect ID to block type mapping is now loaded dynamically from the database
 * via getBlockTypeForEffectId() from data-registry.ts
 *
 * All effect types are defined in the Effect table and mapped to
 * Blockly block types using the convention: effect_{name}
 * (e.g., effect_damage, effect_stun, effect_stop_combat)
 */

/**
 * Maps gate types to Blockly block types
 */
const GATE_TYPE_TO_BLOCK: Record<string, string> = {
  check: 'gate_check',
  chance: 'gate_chance',
  saving_throw: 'gate_saving_throw',
  attack_roll: 'gate_attack_roll',
  contest: 'gate_contest',
};

/**
 * Gate block field mappings (gates are not effects, so not in Effect table)
 * Maps override param keys to Blockly field names
 */
const GATE_FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  gate_check: {
    condition: 'condition',
  },
  gate_chance: {
    percentage: 'percentage',
  },
  gate_saving_throw: {
    saveType: 'saveType',
    dc: 'dc',
  },
  gate_attack_roll: {
    bonus: 'bonus',
  },
  gate_contest: {
    casterStat: 'casterStat',
    targetStat: 'targetStat',
  },
};

/**
 * Get field mappings for a block type
 * Effect blocks: derive from database param_schema (param names = field names)
 * Gate blocks: use hardcoded mappings
 */
function getFieldMappingsForBlockType(
  blockType: string
): Record<string, string> {
  // Gate blocks have hardcoded mappings
  if (blockType.startsWith('gate_')) {
    return GATE_FIELD_MAPPINGS[blockType] || {};
  }

  // Effect blocks: get field names from param_schema
  // Since param names match field names, create identity mapping
  const fieldNames = getFieldNamesForEffect(blockType);
  const mapping: Record<string, string> = {};
  for (const fieldName of fieldNames) {
    mapping[fieldName] = fieldName;
  }
  return mapping;
}

/**
 * Set a field value on a block, handling type conversions
 */
function setBlockField(
  block: Blockly.Block,
  fieldName: string,
  value: unknown
): void {
  const field = block.getField(fieldName);
  if (!field) {
    console.warn(`Field "${fieldName}" not found on block "${block.type}"`);
    return;
  }

  // Handle different value types
  if (typeof value === 'boolean') {
    // Blockly checkboxes use 'TRUE'/'FALSE' strings
    field.setValue(value ? 'TRUE' : 'FALSE');
  } else if (typeof value === 'number') {
    field.setValue(String(value));
  } else if (typeof value === 'string') {
    field.setValue(value);
  } else if (typeof value === 'object' && value !== null) {
    // For JSON objects (like script args), stringify them
    field.setValue(JSON.stringify(value));
  }
}

/**
 * Create a block from an AbilityEffectOutput
 */
function createBlockFromEffect(
  workspace: Blockly.WorkspaceSvg,
  effect: AbilityEffectOutput
): Blockly.Block | null {
  let blockType: string | undefined;

  // Determine block type from effectId or gateType
  if (effect.effectId !== undefined) {
    blockType = getBlockTypeForEffectId(effect.effectId);
    if (!blockType) {
      console.warn(`Unknown effect ID: ${effect.effectId}`);
      return null;
    }
  } else if (effect.gateType) {
    blockType = GATE_TYPE_TO_BLOCK[effect.gateType];
    if (!blockType) {
      console.warn(`Unknown gate type: ${effect.gateType}`);
      return null;
    }
  } else {
    console.warn('Effect has neither effectId nor gateType');
    return null;
  }

  // Create the block
  const block = workspace.newBlock(blockType);

  // Set override params
  const fieldMapping = getFieldMappingsForBlockType(blockType);
  const params = effect.overrideParams || {};

  for (const [paramKey, fieldName] of Object.entries(fieldMapping)) {
    if (paramKey in params) {
      setBlockField(block, fieldName, params[paramKey]);
    }
  }

  // Handle special composite fields

  // Handle targetRoom for teleport
  if (blockType === 'effect_teleport' && params['targetRoom']) {
    const targetRoom = params['targetRoom'] as { zoneId: number; id: number };
    setBlockField(block, 'targetRoomZoneId', targetRoom.zoneId);
    setBlockField(block, 'targetRoomId', targetRoom.id);
  }

  // Handle mobRef for summon
  if (blockType === 'effect_summon' && params['mobZoneId'] !== undefined) {
    const mobRef = formatZoneId(
      Number(params['mobZoneId']),
      Number(params['mobId'] || 0)
    );
    setBlockField(block, 'mobRef', mobRef);
  }

  // Handle objectRef for create
  if (blockType === 'effect_create' && params['objectZoneId'] !== undefined) {
    const objectRef = formatZoneId(
      Number(params['objectZoneId']),
      Number(params['objectId'] || 0)
    );
    setBlockField(block, 'objectRef', objectRef);
  }

  // Handle objectRef for portal
  if (blockType === 'effect_portal' && params['objectZoneId'] !== undefined) {
    const objectRef = formatZoneId(
      Number(params['objectZoneId']),
      Number(params['objectId'] || 0)
    );
    setBlockField(block, 'objectRef', objectRef);
  }

  // Set common fields (trigger, chancePct) if the block has them
  if (effect.trigger) {
    const triggerField = block.getField('trigger');
    if (triggerField) {
      triggerField.setValue(effect.trigger);
    }
  }

  if (effect.chancePct !== undefined && effect.chancePct !== 100) {
    const chanceField = block.getField('chancePct');
    if (chanceField) {
      chanceField.setValue(String(effect.chancePct));
    }
  }

  // Initialize the block (required for proper rendering)
  block.initSvg();

  return block;
}

/**
 * Recursively create blocks for nested gate branches
 */
function createNestedBlocks(
  workspace: Blockly.WorkspaceSvg,
  effects: AbilityEffectOutput[]
): Blockly.Block[] {
  const blocks: Blockly.Block[] = [];
  let previousBlock: Blockly.Block | null = null;

  for (const effect of effects) {
    const block = createBlockFromEffect(workspace, effect);
    if (!block) continue;

    // Handle nested gate branches
    if (effect.gateType) {
      const onPass = effect.overrideParams['onPass'] as
        | AbilityEffectOutput[]
        | undefined;
      const onFail = effect.overrideParams['onFail'] as
        | AbilityEffectOutput[]
        | undefined;

      if (onPass && onPass.length > 0) {
        const passBlocks = createNestedBlocks(workspace, onPass);
        const firstPassBlock = passBlocks[0];
        if (firstPassBlock) {
          const statementInput = block.getInput('onPass');
          if (statementInput?.connection && firstPassBlock.previousConnection) {
            statementInput.connection.connect(
              firstPassBlock.previousConnection
            );
          }
        }
      }

      if (onFail && onFail.length > 0) {
        const failBlocks = createNestedBlocks(workspace, onFail);
        const firstFailBlock = failBlocks[0];
        if (firstFailBlock) {
          const statementInput = block.getInput('onFail');
          if (statementInput?.connection && firstFailBlock.previousConnection) {
            statementInput.connection.connect(
              firstFailBlock.previousConnection
            );
          }
        }
      }
    }

    // Connect to previous block
    if (previousBlock) {
      const previousConnection = previousBlock.nextConnection;
      const currentConnection = block.previousConnection;
      if (previousConnection && currentConnection) {
        previousConnection.connect(currentConnection);
      }
    }

    blocks.push(block);
    previousBlock = block;
  }

  return blocks;
}

/**
 * Load effects into a Blockly workspace
 * Creates blocks and connects them in order
 */
export function loadEffectsIntoWorkspace(
  workspace: Blockly.WorkspaceSvg,
  effects: AbilityEffectOutput[]
): void {
  // Clear existing blocks
  workspace.clear();

  if (effects.length === 0) {
    return;
  }

  // Sort effects by order
  const sortedEffects = [...effects].sort((a, b) => a.order - b.order);

  // Create blocks recursively (handles nested gates)
  const blocks = createNestedBlocks(workspace, sortedEffects);

  // Position the first block
  const firstBlock = blocks[0];
  if (firstBlock) {
    firstBlock.moveBy(50, 50);
  }

  // Render the workspace to update all blocks
  workspace.render();
}

/**
 * Convert a workspace XML string to effects
 * Useful for undo/redo or saving workspace state
 */
export function workspaceToXml(workspace: Blockly.WorkspaceSvg): string {
  const Blockly = workspace.getBlockById('')
    ? (window as unknown as { Blockly: typeof import('blockly') }).Blockly
    : null;

  if (!Blockly) {
    console.warn('Blockly not available for XML serialization');
    return '';
  }

  const xml = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToText(xml);
}

/**
 * Load a workspace from XML string
 */
export function xmlToWorkspace(
  workspace: Blockly.WorkspaceSvg,
  xml: string
): void {
  const Blockly = workspace.getBlockById('')
    ? (window as unknown as { Blockly: typeof import('blockly') }).Blockly
    : null;

  if (!Blockly) {
    console.warn('Blockly not available for XML deserialization');
    return;
  }

  workspace.clear();
  const dom = Blockly.utils.xml.textToDom(xml);
  Blockly.Xml.domToWorkspace(dom, workspace);
}

export default loadEffectsIntoWorkspace;
