/**
 * Blockly toolbox for the effect editor.
 *
 * The toolbox is always built from block types that are actually registered,
 * so a block missing from the registry can never leave the flyout (or
 * Blockly.inject) with a broken definition.
 */

export interface ToolboxBlockItem {
  kind: 'block';
  type: string;
}

export interface ToolboxCategory {
  kind: 'category';
  name: string;
  colour: string;
  contents: ToolboxBlockItem[];
}

export interface ToolboxDefinition {
  kind: 'categoryToolbox';
  contents: ToolboxCategory[];
}

// Effect details are defined in the Effect database table.
const toolboxCategories: ToolboxCategory[] = [
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
      { kind: 'block', type: 'effect_inspect' }, // Identify item properties
    ],
  },
  {
    kind: 'category',
    name: 'Movement & Position',
    colour: '#00897b',
    contents: [
      { kind: 'block', type: 'effect_teleport' }, // Move to location
      { kind: 'block', type: 'effect_move' }, // Forced movement: knockback, pull, swap
      { kind: 'block', type: 'effect_drag' }, // Force target to move with you
      { kind: 'block', type: 'effect_extract' }, // Remove mob/object from game
      { kind: 'block', type: 'effect_dismount' }, // Force off mount
      { kind: 'block', type: 'effect_stop_combat' }, // End combat / disengage
    ],
  },
  {
    kind: 'category',
    name: 'Combat',
    colour: '#1e88e5',
    contents: [
      { kind: 'block', type: 'effect_interrupt' }, // Stop casting/channeling
      { kind: 'block', type: 'effect_stun' }, // Daze, unable to act
      { kind: 'block', type: 'effect_knockdown' }, // Knock to ground
      { kind: 'block', type: 'effect_intercept' }, // Bodyguard / redirect attacks
      { kind: 'block', type: 'effect_redirect' }, // Reflect damage
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
      { kind: 'block', type: 'effect_conceal_item' }, // Hide item from detection
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
      { kind: 'block', type: 'effect_portal' }, // Bidirectional portal
      { kind: 'block', type: 'effect_generic' }, // Any effect without a dedicated block (JSON params)
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
];

/**
 * Build the toolbox, dropping blocks (and then empty categories) that are not
 * registered with Blockly. Never returns null/undefined.
 */
export function buildToolbox(
  isRegistered: (blockType: string) => boolean
): ToolboxDefinition {
  const contents = toolboxCategories
    .map(category => ({
      ...category,
      contents: category.contents.filter(item => isRegistered(item.type)),
    }))
    .filter(category => category.contents.length > 0);
  return { kind: 'categoryToolbox', contents };
}

/** Block types the toolbox offers (used by tests). */
export function toolboxBlockTypes(): string[] {
  return toolboxCategories.flatMap(c => c.contents.map(i => i.type));
}
