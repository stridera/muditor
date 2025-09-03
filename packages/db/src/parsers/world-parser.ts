import { z } from 'zod';
import type {
  WorldFile,
  ZoneJson,
  MobJson,
  ObjectJson,
  RoomJson,
  ShopJson,
  TriggerJson,
  ParseResult,
  ValidationError
} from '@muditor/types';

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

// Enum validations
const resetModeSchema = z.enum(['Never', 'Empty', 'Normal']);
const hemisphereSchema = z.enum(['NORTHWEST', 'NORTHEAST', 'SOUTHWEST', 'SOUTHEAST']);
const climateSchema = z.enum(['NONE', 'SEMIARID', 'ARID', 'OCEANIC', 'TEMPERATE', 'SUBTROPICAL', 'TROPICAL', 'SUBARCTIC', 'ARCTIC', 'ALPINE']);

// Utility schemas
const diceExpressionSchema = z.object({
  num: z.number(),
  size: z.number(),
  bonus: z.number(),
});

const currencySchema = z.object({
  copper: z.number(),
  silver: z.number(),
  gold: z.number(),
  platinum: z.number(),
});

const mobStatsSchema = z.object({
  strength: z.number(),
  intelligence: z.number(),
  wisdom: z.number(),
  dexterity: z.number(),
  constitution: z.number(),
  charisma: z.number(),
});

// Reset schemas
const mobCarryingSchema = z.object({
  id: z.number(),
  max: z.number(),
  name: z.string(),
});

const mobEquippedSchema = z.object({
  id: z.number(),
  max: z.number(),
  location: z.string(),
  name: z.string(),
});

const mobResetSchema = z.object({
  id: z.number(),
  max: z.number(),
  room: z.number(),
  name: z.string(),
  carrying: z.array(mobCarryingSchema).optional(),
  equipped: z.array(mobEquippedSchema).optional(),
});

// Zone schema
const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  top: z.number(),
  lifespan: z.number(),
  reset_mode: resetModeSchema,
  hemisphere: hemisphereSchema,
  climate: climateSchema,
  resets: z.object({
    mob: z.array(mobResetSchema).optional(),
  }),
});

// Mob schema with flexible field names and numeric/string types
const mobSchema = z.object({
  id: z.number(),
  keywords: z.string().optional(),
  name_list: z.string().optional(),
  short_desc: z.string().optional(),
  short_description: z.string().optional(),
  long_desc: z.string().optional(),
  long_description: z.string().optional(),
  desc: z.string().optional(),
  description: z.string().optional(),
  mob_class: z.string(),
  mob_flags: z.array(z.string()),
  effect_flags: z.array(z.string()),
  alignment: z.number(),
  level: z.number(),
  hp_dice: diceExpressionSchema,
  move: z.number(),
  ac: z.number(),
  hit_roll: z.number(),
  damage_dice: diceExpressionSchema,
  money: currencySchema,
  position: z.union([z.string(), z.number()]),
  default_position: z.union([z.string(), z.number()]),
  gender: z.union([z.string(), z.number()]),
  race: z.union([z.string(), z.number()]),
  race_align: z.number(),
  size: z.union([z.string(), z.number()]),
  stats: mobStatsSchema,
  perception: z.number(),
  concealment: z.number(),
  life_force: z.union([z.string(), z.number()]),
  composition: z.union([z.string(), z.number()]),
  stance: z.union([z.string(), z.number()]),
  damage_type: z.union([z.string(), z.number()]),
});

// Object schema with flexible field names
const objectAffectSchema = z.object({
  location: z.string(),
  modifier: z.number(),
});

const extraDescriptionSchema = z.object({
  keyword: z.string(),
  desc: z.string(),
});

const objectSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.string(),
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
  name_list: z.union([z.string(), z.array(z.string())]).optional(),
  short_desc: z.string().optional(),
  short_description: z.string().optional(),
  short: z.string().optional(), // legacy field name
  description: z.string().optional(),
  ground: z.string().optional(), // legacy field name for description
  action_description: z.string().optional(),
  action_desc: z.string().optional(), // legacy field name
  extra_descriptions: z.union([z.array(extraDescriptionSchema), z.record(z.string())]).optional(),
  values: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  flags: z.array(z.string()).optional(),
  weight: z.union([z.string(), z.number()]),
  cost: z.union([z.string(), z.number()]),
  timer: z.union([z.string(), z.number()]),
  decompose_timer: z.union([z.string(), z.number()]).optional(),
  level: z.union([z.string(), z.number()]),
  effect_flags: z.array(z.string()).optional(),
  wear_flags: z.array(z.string()).optional(),
  concealment: z.number().optional(),
  affects: z.array(objectAffectSchema).optional(),
  applies: z.record(z.any()).optional(),
  spells: z.array(z.any()).optional(),
  triggers: z.array(z.any()).optional(),
  script_variables: z.record(z.any()).optional(),
  effects: z.array(z.any()).optional(),
});

// Room schema
const roomExitSchema = z.object({
  description: z.string().optional(),
  keyword: z.string().optional(),
  key: z.string(),
  destination: z.string(),
});

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  sector: z.string(),
  flags: z.array(z.string()),
  exits: z.record(roomExitSchema),
  extra_descriptions: z.record(z.string()).optional(),
});

// Shop schema
const shopAcceptSchema = z.object({
  type: z.string(),
  keywords: z.string(),
});

const shopHourSchema = z.object({
  open: z.number(),
  close: z.number(),
});

const shopSchema = z.object({
  id: z.number(),
  selling: z.record(z.number()),
  buy_profit: z.number(),
  sell_profit: z.number(),
  accepts: z.array(shopAcceptSchema),
  no_such_item1: z.string().optional(),
  no_such_item2: z.string().optional(),
  do_not_buy: z.string().optional(),
  missing_cash1: z.string().optional(),
  missing_cash2: z.string().optional(),
  message_buy: z.string().optional(),
  message_sell: z.string().optional(),
  temper1: z.number(),
  flags: z.array(z.string()),
  keeper: z.number(),
  trades_with: z.array(z.string()),
  rooms: z.array(z.number()),
  hours: z.array(shopHourSchema),
});

// Trigger schema
const triggerSchema = z.object({
  id: z.string(),
  name: z.string(),
  attach_type: z.string(),
  flags: z.array(z.string()),
  number_of_arguments: z.string(),
  argument_list: z.string(),
  commands: z.string(),
});

// Complete world file schema
const worldFileSchema = z.object({
  zone: zoneSchema,
  mobs: z.array(mobSchema),
  objects: z.array(objectSchema),
  rooms: z.array(roomSchema),
  shops: z.array(shopSchema),
  triggers: z.array(triggerSchema),
});

// ============================================================================
// Parser Class
// ============================================================================

export class WorldParser {
  /**
   * Parse a world JSON file with validation
   */
  static parseWorldFile(jsonContent: string | object): ParseResult<WorldFile> {
    try {
      const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      
      const result = worldFileSchema.safeParse(data);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          errors: []
        };
      } else {
        const errors: ValidationError[] = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          value: err.code === 'invalid_type' ? err.received : undefined
        }));
        
        return {
          success: false,
          errors
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          path: 'root',
          message: error instanceof Error ? error.message : 'Unknown parsing error'
        }]
      };
    }
  }

  /**
   * Normalize field names for objects with multiple possible field names
   */
  static normalizeMob(mob: MobJson): MobJson {
    const normalized = { ...mob };
    
    // Normalize keywords field
    if (!normalized.keywords && normalized.name_list) {
      normalized.keywords = normalized.name_list;
    }
    
    // Normalize description fields
    if (!normalized.short_desc && normalized.short_description) {
      normalized.short_desc = normalized.short_description;
    }
    
    if (!normalized.long_desc && normalized.long_description) {
      normalized.long_desc = normalized.long_description;
    }
    
    if (!normalized.desc && normalized.description) {
      normalized.desc = normalized.description;
    }
    
    return normalized;
  }

  /**
   * Normalize field names for objects
   */
  static normalizeObject(object: ObjectJson): ObjectJson {
    const normalized = { ...object };
    
    // Normalize keywords field (convert array to string if needed)
    if (!normalized.keywords && normalized.name_list) {
      normalized.keywords = Array.isArray(normalized.name_list) 
        ? normalized.name_list.join(' ') 
        : normalized.name_list;
    } else if (Array.isArray(normalized.keywords)) {
      normalized.keywords = normalized.keywords.join(' ');
    }
    
    // Normalize description fields
    if (!normalized.short_desc && normalized.short_description) {
      normalized.short_desc = normalized.short_description;
    } else if (!normalized.short_desc && normalized.short) {
      normalized.short_desc = normalized.short;
    }
    
    // Normalize main description field
    if (!normalized.description && normalized.ground) {
      normalized.description = normalized.ground;
    }
    
    // Normalize action description field
    if (!normalized.action_description && normalized.action_desc) {
      normalized.action_description = normalized.action_desc;
    }
    
    // Convert extra_descriptions from object to array format if needed
    if (normalized.extra_descriptions && typeof normalized.extra_descriptions === 'object' && !Array.isArray(normalized.extra_descriptions)) {
      normalized.extra_descriptions = Object.entries(normalized.extra_descriptions).map(([keyword, desc]) => ({
        keyword,
        desc: desc as string
      }));
    }
    
    // Ensure required arrays exist with defaults
    if (!normalized.flags) normalized.flags = [];
    if (!normalized.effect_flags) normalized.effect_flags = [];
    if (!normalized.wear_flags) normalized.wear_flags = [];
    if (!normalized.affects) normalized.affects = [];
    if (!normalized.spells) normalized.spells = [];
    if (!normalized.triggers) normalized.triggers = [];
    if (!normalized.effects) normalized.effects = [];
    if (!normalized.values) normalized.values = {};
    
    // Set default concealment if missing
    if (normalized.concealment === undefined) normalized.concealment = 0;
    
    return normalized;
  }

  /**
   * Convert zone ID 0 to 1000 (modern system rejects ID 0)
   */
  static normalizeZoneId(zoneId: string): number {
    const id = parseInt(zoneId, 10);
    return id === 0 ? 1000 : id;
  }

  /**
   * Parse and normalize a complete world file with lenient validation
   */
  static parseAndNormalize(jsonContent: string | object): ParseResult<WorldFile> {
    try {
      const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      
      // Instead of strict validation, create a lenient normalized structure
      const normalized: WorldFile = this.createNormalizedWorldFile(data);
      
      return {
        success: true,
        data: normalized,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          path: 'root',
          message: error instanceof Error ? error.message : 'Unknown parsing error'
        }]
      };
    }
  }

  /**
   * Create normalized world file from raw data with defaults
   */
  private static createNormalizedWorldFile(data: any): WorldFile {
    // Normalize zone
    const zone = {
      id: String(data.zone?.id || '0'),
      name: data.zone?.name || 'Unnamed Zone',
      top: Number(data.zone?.top || 0),
      lifespan: Number(data.zone?.lifespan || 240),
      reset_mode: data.zone?.reset_mode || 'Normal',
      hemisphere: data.zone?.hemisphere || 'NORTHWEST',
      climate: data.zone?.climate || 'NONE',
      resets: data.zone?.resets || {}
    };

    // Normalize mobs with error handling
    const mobs = (data.mobs || []).map((mob: any) => {
      try {
        return this.normalizeMob(mob);
      } catch (error) {
        console.warn(`Failed to normalize mob ${mob?.id}:`, error);
        return null;
      }
    }).filter(Boolean);

    // Normalize objects with error handling
    const objects = (data.objects || []).map((obj: any) => {
      try {
        return this.normalizeObject(obj);
      } catch (error) {
        console.warn(`Failed to normalize object ${obj?.id}:`, error);
        return null;
      }
    }).filter(Boolean);

    // Normalize rooms
    const rooms = (data.rooms || []).map((room: any) => ({
      id: String(room.id || '0'),
      name: room.name || 'Unnamed Room',
      description: room.description || '',
      sector: room.sector || 'INSIDE',
      flags: room.flags || [],
      exits: room.exits || {},
      extra_descriptions: room.extra_descriptions || {}
    }));

    // Normalize shops
    const shops = (data.shops || []).map((shop: any) => ({
      id: Number(shop.id || 0),
      selling: shop.selling || {},
      buy_profit: Number(shop.buy_profit || 1.0),
      sell_profit: Number(shop.sell_profit || 1.0),
      accepts: shop.accepts || [],
      no_such_item1: shop.no_such_item1 || '',
      no_such_item2: shop.no_such_item2 || '',
      do_not_buy: shop.do_not_buy || '',
      missing_cash1: shop.missing_cash1 || '',
      missing_cash2: shop.missing_cash2 || '',
      message_buy: shop.message_buy || '',
      message_sell: shop.message_sell || '',
      temper1: Number(shop.temper1 || 0),
      flags: shop.flags || [],
      keeper: Number(shop.keeper || 0),
      trades_with: shop.trades_with || [],
      rooms: shop.rooms || [],
      hours: shop.hours || []
    }));

    // Normalize triggers
    const triggers = (data.triggers || []).map((trigger: any) => ({
      id: String(trigger.id || '0'),
      name: trigger.name || 'Unnamed Trigger',
      attach_type: trigger.attach_type || 'ROOM',
      flags: trigger.flags || [],
      number_of_arguments: String(trigger.number_of_arguments || '0'),
      argument_list: trigger.argument_list || '',
      commands: trigger.commands || ''
    }));

    const normalized: WorldFile = {
      zone,
      mobs,
      objects,
      rooms,
      shops,
      triggers
    };
    
    return normalized;
  }

  /**
   * Validate individual zone data
   */
  static validateZone(zone: any): ParseResult<ZoneJson> {
    const result = zoneSchema.safeParse(zone);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: []
      };
    } else {
      const errors: ValidationError[] = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        value: err.code === 'invalid_type' ? err.received : undefined
      }));
      
      return {
        success: false,
        errors
      };
    }
  }

  /**
   * Extract zone ID ranges for validation
   */
  static getZoneRanges(worldFile: WorldFile): { rooms: number[], mobs: number[], objects: number[] } {
    const ranges = {
      rooms: worldFile.rooms.map(room => parseInt(room.id, 10)),
      mobs: worldFile.mobs.map(mob => mob.id),
      objects: worldFile.objects.map(obj => parseInt(obj.id, 10))
    };
    
    return ranges;
  }

  /**
   * Validate zone integrity (room ranges, orphaned references, etc.)
   */
  static validateZoneIntegrity(worldFile: WorldFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const ranges = this.getZoneRanges(worldFile);
    const zoneTop = worldFile.zone.top;
    const zoneId = parseInt(worldFile.zone.id, 10);
    
    // Check if all rooms are within zone range
    const minRoomId = zoneId === 0 ? 0 : zoneId * 100; // Zone 0 is special case
    const maxRoomId = zoneTop;
    
    ranges.rooms.forEach(roomId => {
      if (roomId < minRoomId || roomId > maxRoomId) {
        errors.push({
          path: `rooms[${roomId}]`,
          message: `Room ID ${roomId} is outside zone range ${minRoomId}-${maxRoomId}`,
          value: roomId
        });
      }
    });
    
    // Check for room exit destinations that don't exist
    worldFile.rooms.forEach((room, index) => {
      Object.entries(room.exits || {}).forEach(([direction, exit]) => {
        const destId = parseInt(exit.destination, 10);
        if (destId !== -1 && !ranges.rooms.includes(destId)) {
          // Only warn about missing destinations outside this zone
          if (destId >= minRoomId && destId <= maxRoomId) {
            errors.push({
              path: `rooms[${index}].exits.${direction}.destination`,
              message: `Exit destination ${destId} does not exist in this zone`,
              value: destId
            });
          }
        }
      });
    });
    
    // Check mob resets reference valid rooms
    worldFile.zone.resets.mob?.forEach((reset, index) => {
      if (!ranges.rooms.includes(reset.room)) {
        errors.push({
          path: `zone.resets.mob[${index}].room`,
          message: `Mob reset references non-existent room ${reset.room}`,
          value: reset.room
        });
      }
    });
    
    return errors;
  }
}