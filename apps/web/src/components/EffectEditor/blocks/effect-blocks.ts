import * as Blockly from 'blockly';
import {
  getEffectOptions,
  getMobOptions,
  getMobOptionsByZone,
  getObjectOptions,
  getObjectOptionsByZone,
  getTriggerOptions,
  getZoneOptions,
} from './data-registry';

// Blockly menu option type: [displayText, value]
type MenuOption = [string, string];

/**
 * Damage types available in the system
 * Updated to match consolidated 18-effect schema
 */
const DAMAGE_TYPES: MenuOption[] = [
  ['Physical', 'physical'],
  ['Fire', 'fire'],
  ['Cold', 'cold'],
  ['Shock', 'shock'],
  ['Acid', 'acid'],
  ['Poison', 'poison'],
  ['Holy', 'holy'],
  ['Unholy', 'unholy'],
  ['Force', 'force'],
  ['Sonic', 'sonic'],
  ['Bleed', 'bleed'],
  ['Water', 'water'],
  ['Earth', 'earth'],
  ['Air', 'air'],
  ['Radiant', 'radiant'],
  ['Shadow', 'shadow'],
  ['Necrotic', 'necrotic'],
  ['Mental', 'mental'],
  ['Nature', 'nature'],
  ['Magic', 'magic'],
  ['Lifesteal', 'lifesteal'],
];

/**
 * Modify targets - consolidated from stat_mod, resource_mod, saving_mod, size_mod
 */
const MODIFY_TARGETS: MenuOption[] = [
  // Attributes
  ['Strength', 'str'],
  ['Dexterity', 'dex'],
  ['Constitution', 'con'],
  ['Intelligence', 'int'],
  ['Wisdom', 'wis'],
  ['Charisma', 'cha'],
  // Combat stats
  ['Hitroll', 'hitroll'],
  ['Damroll', 'damroll'],
  ['AC (Armor Class)', 'ac'],
  ['AP (Attack Power)', 'ap'],
  ['Focus', 'focus'],
  ['Accuracy', 'acc'],
  ['Evasion', 'eva'],
  ['Ward', 'ward'],
  // Resources (max values)
  ['Max HP', 'max_hp'],
  ['Max Mana', 'max_mana'],
  ['Max Move', 'max_move'],
  // Saving throws
  ['Save vs Spell', 'save_spell'],
  ['Save vs Paralysis', 'save_para'],
  ['Save vs Rod', 'save_rod'],
  ['Save vs Petrification', 'save_petri'],
  ['Save vs Breath', 'save_breath'],
  ['Save vs All', 'save_all'],
  // Other
  ['Size', 'size'],
  ['Speed', 'speed'],
  ['HP Regen', 'regen_hp'],
  ['Mana Regen', 'regen_mana'],
  ['Move Regen', 'regen_move'],
];

/**
 * Status flags - comprehensive list from consolidated schema
 */
const STATUS_FLAGS: MenuOption[] = [
  // Simple buffs
  ['Bless', 'bless'],
  ['Haste', 'haste'],
  ['Fly', 'fly'],
  ['Sanctuary', 'sanctuary'],
  ['Featherfall', 'featherfall'],
  ['Waterwalk', 'waterwalk'],
  ['Waterbreath', 'waterbreath'],
  ['Aware', 'aware'],
  ['Berserk', 'berserk'],
  ['Glowing', 'glowing'],
  ['Empowered', 'empowered'],
  ['Meditating', 'meditating'],
  // Crowd Control (use breakOnDamage for soft CC like mesmerize)
  ['Paralyzed', 'paralyzed'],
  ['Sleeping', 'sleeping'],
  ['Charmed', 'charmed'],
  ['Feared', 'feared'],
  ['Confused', 'confused'],
  ['Silenced', 'silenced'],
  ['Slowed', 'slowed'],
  ['Webbed', 'webbed'],
  ['Blinded', 'blinded'],
  // Stealth (use amount for bonus)
  ['Hidden', 'hidden'],
  ['Invisible', 'invisible'],
  // Detection
  ['Detect Invisible', 'detect_invisible'],
  ['Detect Magic', 'detect_magic'],
  ['Detect Align', 'detect_align'],
  ['Detect Poison', 'detect_poison'],
  ['Detect Life', 'detect_life'],
  ['Detect Hidden', 'detect_hidden'],
  ['Infravision', 'infravision'],
  ['Ultravision', 'ultravision'],
  // Parameterized flags (use type/amount)
  ['Resistance', 'resistance'],
  ['Vulnerability', 'vulnerability'],
  ['Reflect', 'reflect'],
  ['Elemental Hands', 'elemental_hands'],
  ['Lifesteal', 'lifesteal'],
  // Special
  ['Taunted', 'taunted'],
];

/**
 * Resources that can be healed or damaged
 */
const RESOURCE_OPTIONS: MenuOption[] = [
  ['HP', 'hp'],
  ['Mana', 'mana'],
  ['Move', 'move'],
];

/**
 * Effect trigger options
 */
const TRIGGER_OPTIONS: MenuOption[] = [
  ['On Cast', 'on_cast'],
  ['On Hit', 'on_hit'],
  ['On Miss', 'on_miss'],
  ['On Crit', 'on_crit'],
  ['On Kill', 'on_kill'],
  ['On Take Damage', 'on_take_damage'],
  ['On Tick', 'on_tick'],
];

/**
 * Cleanse condition options
 */
const CLEANSE_CONDITIONS: MenuOption[] = [
  ['Poison', 'poison'],
  ['Disease', 'disease'],
  ['Blindness', 'blindness'],
  ['Paralysis', 'paralysis'],
  ['Curse', 'curse'],
  ['Fear', 'fear'],
  ['Silence', 'silence'],
  ['All Negative', 'all'],
];

/**
 * Reveal type options
 */
const REVEAL_TYPES: MenuOption[] = [
  ['Invisible', 'invisible'],
  ['Hidden', 'hidden'],
  ['Magic', 'magic'],
  ['All', 'all'],
];

/**
 * Movement direction options for move effect
 */
const MOVE_DIRECTIONS: MenuOption[] = [
  ['Away (Knockback)', 'away'],
  ['Toward (Pull)', 'toward'],
  ['Swap Positions', 'swap'],
  ['Random', 'random'],
];

/**
 * Form options for transform effect
 */
const FORM_OPTIONS: MenuOption[] = [
  ['Wolf', 'wolf'],
  ['Bear', 'bear'],
  ['Eagle', 'eagle'],
  ['Cat', 'cat'],
  ['Toad', 'toad'],
  ['Frog', 'frog'],
  ['Dragon', 'dragon'],
  ['Elemental', 'elemental'],
  ['Undead', 'undead'],
];

/**
 * Room effect subtypes
 */
const ROOM_SUBTYPES: MenuOption[] = [
  ['Effect', 'effect'],
  ['Barrier', 'barrier'],
];

/**
 * Room effect types
 */
const ROOM_EFFECT_TYPES: MenuOption[] = [
  ['Darkness', 'darkness'],
  ['Light', 'light'],
  ['Silence', 'silence'],
  ['Fog', 'fog'],
  ['Fire', 'fire'],
  ['Ice', 'ice'],
  ['Wall of Force', 'wall_force'],
  ['Wall of Fire', 'wall_fire'],
  ['Wall of Ice', 'wall_ice'],
  ['Wall of Stone', 'wall_stone'],
];

/**
 * Register all effect blocks - Consolidated 18-Effect Schema
 */
export function registerEffectBlocks(): void {
  // ============================================
  // DAMAGE COMPONENT BLOCK (for multi-element damage)
  // ============================================
  Blockly.Blocks['damage_component'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DAMAGE_TYPES), 'type')
        .appendField('at')
        .appendField(new Blockly.FieldNumber(100, 1, 100), 'percent')
        .appendField('%');
      this.setPreviousStatement(true, 'damage_component');
      this.setNextStatement(true, 'damage_component');
      this.setColour('#c62828');
      this.setTooltip(
        'A damage component with type and percentage. All components should sum to 100%.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 1. DAMAGE BLOCK (consolidated: instant + DoT + chain + resource drain)
  // ============================================
  Blockly.Blocks['effect_damage'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Damage')
        .appendField(
          new Blockly.FieldDropdown([
            ['(use components)', ''],
            ...DAMAGE_TYPES,
          ] as MenuOption[]),
          'type'
        );
      // Multi-element damage components (optional - use instead of single type)
      this.appendStatementInput('components')
        .setCheck('damage_component')
        .appendField('Components');
      this.appendDummyInput()
        .appendField('Amount')
        .appendField(new Blockly.FieldTextInput('1d6'), 'amount')
        .appendField('Scaling')
        .appendField(new Blockly.FieldTextInput('level'), 'scaling');
      this.appendDummyInput()
        .appendField('Resource')
        .appendField(
          new Blockly.FieldDropdown([
            ['HP (default)', 'hp'],
            ['Mana', 'mana'],
            ['Move', 'move'],
          ] as MenuOption[]),
          'resource'
        );
      // DoT parameters (optional)
      this.appendDummyInput()
        .appendField('DoT: Interval')
        .appendField(new Blockly.FieldNumber(0, 0, 60), 'interval')
        .appendField('Duration')
        .appendField(new Blockly.FieldNumber(0, 0, 600), 'duration');
      // Chain parameters (optional)
      this.appendDummyInput()
        .appendField('Chain: Max Jumps')
        .appendField(new Blockly.FieldNumber(0, 0, 10), 'maxJumps')
        .appendField('Attenuation')
        .appendField(new Blockly.FieldNumber(1, 0, 1), 'attenuation');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#e53935');
      this.setTooltip(
        'Deal damage. Use single type OR add component blocks for multi-element. Set interval/duration for DoT. Set maxJumps for chain lightning.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 2. HEAL BLOCK
  // ============================================
  Blockly.Blocks['effect_heal'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Heal');
      this.appendDummyInput()
        .appendField('Resource')
        .appendField(new Blockly.FieldDropdown(RESOURCE_OPTIONS), 'resource');
      this.appendDummyInput()
        .appendField('Amount')
        .appendField(new Blockly.FieldTextInput('2d6'), 'amount')
        .appendField('Scaling')
        .appendField(new Blockly.FieldTextInput('wis'), 'scaling');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#43a047');
      this.setTooltip('Restore a resource (HP, mana, move)');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 3. MODIFY BLOCK (consolidated: stat_mod + resource_mod + saving_mod + size_mod)
  // ============================================
  Blockly.Blocks['effect_modify'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Modify')
        .appendField(new Blockly.FieldDropdown(MODIFY_TARGETS), 'target');
      this.appendDummyInput()
        .appendField('Amount')
        .appendField(new Blockly.FieldTextInput('4'), 'amount');
      this.appendDummyInput()
        .appendField('Duration')
        .appendField(new Blockly.FieldTextInput('level'), 'duration');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#1e88e5');
      this.setTooltip(
        'Modify any numeric value (stats, resources, saving throws, size).'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 4. STATUS BLOCK (consolidated: simple + CC + stealth + detection + resistance + etc.)
  // ============================================
  Blockly.Blocks['effect_status'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Apply Status')
        .appendField(new Blockly.FieldDropdown(STATUS_FLAGS), 'flag');
      this.appendDummyInput()
        .appendField('Duration')
        .appendField(new Blockly.FieldTextInput('level * 2'), 'duration');
      // Optional parameters for parameterized flags (resistance, vulnerability, reflect, elemental_hands, lifesteal)
      this.appendDummyInput()
        .appendField('Type (for resist/vuln/reflect/elemental)')
        .appendField(
          new Blockly.FieldDropdown([
            ['(none)', ''],
            ...DAMAGE_TYPES,
          ] as MenuOption[]),
          'type'
        );
      this.appendDummyInput()
        .appendField('Amount %')
        .appendField(new Blockly.FieldNumber(0, 0, 200), 'amount');
      // CC parameters
      this.appendDummyInput()
        .appendField('Break On Damage')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'breakOnDamage')
        .appendField('Contested By')
        .appendField(new Blockly.FieldTextInput(''), 'contestedBy');
      // Empowered parameter
      this.appendDummyInput()
        .appendField('Consume On Cast')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'consumeOnCast');
      this.appendDummyInput()
        .appendField('Source')
        .appendField(
          new Blockly.FieldDropdown([
            ['(none)', ''],
            ['Caster', 'caster'],
            ['Target', 'target'],
          ] as MenuOption[]),
          'source'
        );
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#8e24aa');
      this.setTooltip(
        'Apply status flags (buffs, CC, stealth, detection, resistance, etc.).'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 5. CLEANSE BLOCK (renamed from cure)
  // ============================================
  Blockly.Blocks['effect_cleanse'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Cleanse')
        .appendField(
          new Blockly.FieldDropdown(CLEANSE_CONDITIONS),
          'condition'
        );
      this.appendDummyInput()
        .appendField('Scope')
        .appendField(
          new Blockly.FieldDropdown([
            ['Single', 'single'],
            ['All', 'all'],
          ] as MenuOption[]),
          'scope'
        );
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#8e24aa');
      this.setTooltip('Remove negative conditions from target');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 6. DISPEL BLOCK
  // ============================================
  Blockly.Blocks['effect_dispel'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Dispel')
        .appendField(
          new Blockly.FieldDropdown([
            ['Magic', 'magic'],
            ['Buffs', 'buffs'],
            ['Debuffs', 'debuffs'],
            ['All', 'all'],
          ] as MenuOption[]),
          'filter'
        );
      this.appendDummyInput()
        .appendField('Power')
        .appendField(new Blockly.FieldTextInput('level'), 'power');
      this.appendDummyInput()
        .appendField('Scope')
        .appendField(
          new Blockly.FieldDropdown([
            ['Single', 'single'],
            ['All', 'all'],
          ] as MenuOption[]),
          'scope'
        );
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#8e24aa');
      this.setTooltip('Remove magical effects');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 7. REVEAL BLOCK
  // ============================================
  Blockly.Blocks['effect_reveal'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Reveal')
        .appendField(new Blockly.FieldDropdown(REVEAL_TYPES), 'type');
      this.appendDummyInput()
        .appendField('Depth')
        .appendField(
          new Blockly.FieldDropdown([
            ['Room', 'room'],
            ['Area', 'area'],
            ['Zone', 'zone'],
          ] as MenuOption[]),
          'depth'
        );
      this.appendDummyInput()
        .appendField('Auto Dispel')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'autoDispel');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#5e35b1');
      this.setTooltip('One-time reveal of hidden/invisible entities');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 8. TELEPORT BLOCK
  // ============================================
  Blockly.Blocks['effect_teleport'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Teleport to')
        .appendField(
          new Blockly.FieldDropdown([
            ['Home/Recall', 'home'],
            ['Random in Zone', 'zone_random'],
            ['Random in World', 'world_random'],
            ['Anchor Point', 'anchor'],
            ['Specific Room', 'target'],
          ] as MenuOption[]),
          'destination'
        );
      this.appendDummyInput()
        .appendField('Scope')
        .appendField(
          new Blockly.FieldDropdown([
            ['Self', 'self'],
            ['Target', 'target'],
            ['Group', 'group'],
          ] as MenuOption[]),
          'scope'
        );
      this.appendDummyInput()
        .appendField('Target Room')
        .appendField('Zone')
        .appendField(new Blockly.FieldNumber(0, 0), 'targetRoomZoneId')
        .appendField('ID')
        .appendField(new Blockly.FieldNumber(0, 0), 'targetRoomId');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00897b');
      this.setTooltip(
        'Teleport to a location. Room/zone NO_TELEPORT flags apply.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 9. EXTRACT BLOCK (simplified from banish)
  // ============================================
  Blockly.Blocks['effect_extract'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Extract')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mob', 'mob'],
            ['Object', 'object'],
          ] as MenuOption[]),
          'target'
        );
      this.appendDummyInput()
        .appendField('Destroy Equipment')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'destroyEquipment');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00897b');
      this.setTooltip(
        'Remove mob/object from game (no XP). Use gates for tiered banishment.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 10. MOVE BLOCK (NEW - forced movement)
  // ============================================
  Blockly.Blocks['effect_move'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Force Move')
        .appendField(new Blockly.FieldDropdown(MOVE_DIRECTIONS), 'direction');
      this.appendDummyInput()
        .appendField('Distance')
        .appendField(new Blockly.FieldNumber(1, 0, 10), 'distance');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00897b');
      this.setTooltip('Forced movement: knockback, pull, or swap positions');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 11. INTERRUPT BLOCK (NEW - stop casting/channeling)
  // ============================================
  Blockly.Blocks['effect_interrupt'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Interrupt');
      this.appendDummyInput()
        .appendField('Power')
        .appendField(new Blockly.FieldTextInput('skill'), 'power');
      this.appendDummyInput()
        .appendField('Filter')
        .appendField(
          new Blockly.FieldDropdown([
            ['All', 'all'],
            ['Magic Only', 'magic'],
            ['Skills Only', 'skills'],
          ] as MenuOption[]),
          'filter'
        );
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#f4511e');
      this.setTooltip(
        'Stop spellcasting/channeling. Contested by concentration.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 12. TRANSFORM BLOCK (NEW - shapechange)
  // ============================================
  Blockly.Blocks['effect_transform'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Transform into')
        .appendField(new Blockly.FieldDropdown(FORM_OPTIONS), 'form');
      this.appendDummyInput()
        .appendField('Duration')
        .appendField(new Blockly.FieldTextInput('level * 2'), 'duration');
      this.appendDummyInput()
        .appendField('Hostile (unwanted)')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'hostile');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#6d4c41');
      this.setTooltip('Shapechange. Set hostile=true for baleful polymorph.');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 13. RESURRECT BLOCK
  // ============================================
  Blockly.Blocks['effect_resurrect'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Resurrect');
      this.appendDummyInput()
        .appendField('HP %')
        .appendField(new Blockly.FieldNumber(10, 1, 100), 'hpPercent');
      this.appendDummyInput()
        .appendField('XP Penalty %')
        .appendField(new Blockly.FieldNumber(10, 0, 100), 'expPenalty');
      this.appendDummyInput()
        .appendField('Transfer Equipment')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'equipTransfer');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#6d4c41');
      this.setTooltip('Bring back the dead');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 14. CREATE BLOCK (renamed from create_object)
  // ============================================
  Blockly.Blocks['effect_create'] = {
    init: function (this: Blockly.Block) {
      // Zone dropdown with validator that updates object dropdown
      const objectDropdown = new Blockly.FieldDropdown(getObjectOptions);
      const zoneDropdown = new Blockly.FieldDropdown(getZoneOptions, function (
        this: Blockly.FieldDropdown,
        newValue: string
      ) {
        const block = this.getSourceBlock();
        if (block) {
          const objectField = block.getField(
            'objectRef'
          ) as Blockly.FieldDropdown;
          if (objectField) {
            const zoneId = newValue === '-1' ? null : Number(newValue);
            const newOptions = getObjectOptionsByZone(zoneId);
            objectField.menuGenerator_ = newOptions;
            const currentValue = objectField.getValue();
            const hasCurrentValue = newOptions.some(
              ([, val]) => val === currentValue
            );
            if (!hasCurrentValue && newOptions.length > 0 && newOptions[0]) {
              objectField.setValue(newOptions[0][1]);
            }
          }
        }
        return newValue;
      });

      this.appendDummyInput().appendField('Create Object');
      this.appendDummyInput()
        .appendField('Type')
        .appendField(
          new Blockly.FieldDropdown([
            ['Template', 'template'],
            ['Food', 'food'],
            ['Water', 'water'],
            ['Light', 'light'],
            ['Spring', 'spring'],
          ] as MenuOption[]),
          'objectType'
        );
      this.appendDummyInput()
        .appendField('Zone')
        .appendField(zoneDropdown, 'objectZoneFilter');
      this.appendDummyInput()
        .appendField('Template')
        .appendField(objectDropdown, 'objectRef');
      this.appendDummyInput()
        .appendField('Quantity')
        .appendField(new Blockly.FieldNumber(1, 1, 99), 'quantity')
        .appendField('Decay (hours)')
        .appendField(new Blockly.FieldNumber(24, 0, 168), 'decay');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00897b');
      this.setTooltip('Create objects - select zone to filter template list');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 15. SUMMON BLOCK
  // ============================================
  Blockly.Blocks['effect_summon'] = {
    init: function (this: Blockly.Block) {
      const mobDropdown = new Blockly.FieldDropdown(getMobOptions);
      const zoneDropdown = new Blockly.FieldDropdown(getZoneOptions, function (
        this: Blockly.FieldDropdown,
        newValue: string
      ) {
        const block = this.getSourceBlock();
        if (block) {
          const mobField = block.getField('mobRef') as Blockly.FieldDropdown;
          if (mobField) {
            const zoneId = newValue === '-1' ? null : Number(newValue);
            const newOptions = getMobOptionsByZone(zoneId);
            mobField.menuGenerator_ = newOptions;
            const currentValue = mobField.getValue();
            const hasCurrentValue = newOptions.some(
              ([, val]) => val === currentValue
            );
            if (!hasCurrentValue && newOptions.length > 0 && newOptions[0]) {
              mobField.setValue(newOptions[0][1]);
            }
          }
        }
        return newValue;
      });

      this.appendDummyInput().appendField('Summon Mob');
      this.appendDummyInput()
        .appendField('Mob Type')
        .appendField(new Blockly.FieldTextInput('elemental'), 'mobType');
      this.appendDummyInput()
        .appendField('Zone')
        .appendField(zoneDropdown, 'mobZoneFilter');
      this.appendDummyInput()
        .appendField('Mob Template')
        .appendField(mobDropdown, 'mobRef');
      this.appendDummyInput()
        .appendField('Max Count')
        .appendField(new Blockly.FieldNumber(1, 1, 10), 'maxCount')
        .appendField('Duration')
        .appendField(new Blockly.FieldNumber(100, 0, 86400), 'duration');
      this.appendDummyInput()
        .appendField('Consumes Corpse')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'consumesCorpse');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00897b');
      this.setTooltip('Summon creatures - select zone to filter mob list');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 16. ENCHANT BLOCK (NEW - apply effects to objects)
  // ============================================
  Blockly.Blocks['effect_enchant'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Enchant Object');
      this.appendDummyInput()
        .appendField('Effect')
        .appendField(
          new Blockly.FieldDropdown([
            ['Damage', 'damage'],
            ['Status', 'status'],
          ] as MenuOption[]),
          'effect'
        );
      this.appendDummyInput()
        .appendField('Type')
        .appendField(new Blockly.FieldDropdown(DAMAGE_TYPES), 'type');
      this.appendDummyInput()
        .appendField('Flag (for status)')
        .appendField(
          new Blockly.FieldDropdown([
            ['(none)', ''],
            ...STATUS_FLAGS,
          ] as MenuOption[]),
          'flag'
        );
      this.appendDummyInput()
        .appendField('Amount')
        .appendField(new Blockly.FieldTextInput('skill * 2'), 'amount');
      this.appendDummyInput()
        .appendField('Duration (time-based, 0=perm)')
        .appendField(new Blockly.FieldNumber(0, 0, 86400), 'duration');
      this.appendDummyInput()
        .appendField('Charges (hit-based, 0=unlimited)')
        .appendField(new Blockly.FieldNumber(0, 0, 1000), 'charges');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#6d4c41');
      this.setTooltip(
        'Apply effects to objects. Set duration and/or charges for expiry.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 17. GLOBE BLOCK
  // ============================================
  Blockly.Blocks['effect_globe'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Globe of Protection');
      this.appendDummyInput()
        .appendField('Max Circle Blocked')
        .appendField(new Blockly.FieldNumber(3, 1, 10), 'maxCircle');
      this.appendDummyInput()
        .appendField('Duration')
        .appendField(new Blockly.FieldTextInput('level'), 'duration');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#43a047');
      this.setTooltip(
        'Block violent spells up to maxCircle. Dispel always bypasses.'
      );
      this.setHelpUrl('');
    },
  };

  // ============================================
  // 18. ROOM BLOCK (consolidated: room_effect + room_barrier)
  // ============================================
  Blockly.Blocks['effect_room'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Room')
        .appendField(new Blockly.FieldDropdown(ROOM_SUBTYPES), 'subtype');
      this.appendDummyInput()
        .appendField('Type')
        .appendField(new Blockly.FieldDropdown(ROOM_EFFECT_TYPES), 'type');
      this.appendDummyInput()
        .appendField('Duration')
        .appendField(new Blockly.FieldNumber(60, 0, 86400), 'duration');
      // For barriers
      this.appendDummyInput()
        .appendField('Barrier HP')
        .appendField(new Blockly.FieldNumber(0, 0, 10000), 'hp');
      this.appendDummyInput()
        .appendField('Traversal')
        .appendField(
          new Blockly.FieldDropdown([
            ['Blocked', 'blocked'],
            ['Damage', 'damage'],
            ['Slow', 'slow'],
            ['None', 'none'],
          ] as MenuOption[]),
          'traversalRules'
        );
      // For damage effects
      this.appendDummyInput()
        .appendField('Damage/Tick')
        .appendField(new Blockly.FieldTextInput('0'), 'damagePerTick')
        .appendField('Damage On Move')
        .appendField(new Blockly.FieldTextInput('0'), 'damageOnMovement');
      this.appendDummyInput()
        .appendField('Trigger')
        .appendField(new Blockly.FieldDropdown(TRIGGER_OPTIONS), 'trigger')
        .appendField('Chance %')
        .appendField(new Blockly.FieldNumber(100, 0, 100), 'chancePct');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#f4511e');
      this.setTooltip('Room-wide effects or barriers');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // SCRIPT BLOCK (custom Lua)
  // ============================================
  Blockly.Blocks['effect_script'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Run Script');
      this.appendDummyInput()
        .appendField('Script')
        .appendField(new Blockly.FieldDropdown(getTriggerOptions), 'scriptId');
      this.appendDummyInput()
        .appendField('Args (JSON)')
        .appendField(new Blockly.FieldTextInput('{}'), 'args');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#6d4c41');
      this.setTooltip('Execute a Lua script');
      this.setHelpUrl('');
    },
  };

  // ============================================
  // GATE BLOCKS (Conditional Execution)
  // ============================================

  // Gate Check Block
  Blockly.Blocks['gate_check'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('If')
        .appendField(new Blockly.FieldTextInput('target.hp > 50'), 'condition');
      this.appendStatementInput('onPass')
        .setCheck('effect')
        .appendField('Then');
      this.appendStatementInput('onFail')
        .setCheck('effect')
        .appendField('Else');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00acc1');
      this.setTooltip('Conditional execution based on a Lua expression');
      this.setHelpUrl('');
    },
  };

  // Gate Chance Block
  Blockly.Blocks['gate_chance'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Chance')
        .appendField(new Blockly.FieldNumber(50, 0, 100), 'percentage')
        .appendField('%');
      this.appendStatementInput('onPass')
        .setCheck('effect')
        .appendField('Success');
      this.appendStatementInput('onFail')
        .setCheck('effect')
        .appendField('Failure');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00acc1');
      this.setTooltip('Random chance to execute effects');
      this.setHelpUrl('');
    },
  };

  // Gate Saving Throw Block
  Blockly.Blocks['gate_saving_throw'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Saving Throw')
        .appendField(
          new Blockly.FieldDropdown([
            ['Breath', 'breath'],
            ['Paralysis', 'para'],
            ['Petrification', 'petri'],
            ['Rod', 'rod'],
            ['Spell', 'spell'],
          ] as MenuOption[]),
          'saveType'
        );
      this.appendDummyInput()
        .appendField('DC')
        .appendField(new Blockly.FieldTextInput('10 + level / 2'), 'dc');
      this.appendStatementInput('onPass')
        .setCheck('effect')
        .appendField('Save');
      this.appendStatementInput('onFail')
        .setCheck('effect')
        .appendField('Fail');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00acc1');
      this.setTooltip('Target makes a saving throw');
      this.setHelpUrl('');
    },
  };

  // Gate Attack Roll Block
  Blockly.Blocks['gate_attack_roll'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Attack Roll');
      this.appendDummyInput()
        .appendField('Bonus')
        .appendField(new Blockly.FieldTextInput('acc + level'), 'bonus');
      this.appendStatementInput('onPass').setCheck('effect').appendField('Hit');
      this.appendStatementInput('onFail')
        .setCheck('effect')
        .appendField('Miss');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00acc1');
      this.setTooltip('Make an attack roll against target');
      this.setHelpUrl('');
    },
  };

  // Gate Contest Block
  Blockly.Blocks['gate_contest'] = {
    init: function (this: Blockly.Block) {
      const STAT_OPTIONS: MenuOption[] = [
        ['Strength', 'str'],
        ['Dexterity', 'dex'],
        ['Constitution', 'con'],
        ['Intelligence', 'int'],
        ['Wisdom', 'wis'],
        ['Charisma', 'cha'],
      ];
      this.appendDummyInput().appendField('Contest');
      this.appendDummyInput()
        .appendField('Caster')
        .appendField(new Blockly.FieldDropdown(STAT_OPTIONS), 'casterStat')
        .appendField('vs Target')
        .appendField(new Blockly.FieldDropdown(STAT_OPTIONS), 'targetStat');
      this.appendStatementInput('onPass').setCheck('effect').appendField('Win');
      this.appendStatementInput('onFail')
        .setCheck('effect')
        .appendField('Lose');
      this.setPreviousStatement(true, 'effect');
      this.setNextStatement(true, 'effect');
      this.setColour('#00acc1');
      this.setTooltip('Opposed stat check');
      this.setHelpUrl('');
    },
  };

  console.log(
    'Effect blocks registered successfully (18 consolidated effects + gates)'
  );
}
