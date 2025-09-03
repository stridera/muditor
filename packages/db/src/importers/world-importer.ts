import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';
import type {
  WorldFile,
  ZoneJson,
  MobJson,
  ObjectJson,
  RoomJson,
  ShopJson,
  TriggerJson,
  ValidationError
} from '@muditor/types';
import { WorldParser } from '../parsers/world-parser';

export interface ImportResult {
  success: boolean;
  message: string;
  errors: ValidationError[];
  stats?: ImportStats;
}

export interface ImportStats {
  zones: number;
  rooms: number;
  mobs: number;
  objects: number;
  shops: number;
  triggers: number;
  mobResets: number;
  timeTaken: number;
}

export class WorldImporter {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Import a single world file into the database
   */
  async importWorldFile(filePath: string): Promise<ImportResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    
    try {
      // Read and parse the file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parseResult = WorldParser.parseAndNormalize(fileContent);
      
      if (!parseResult.success || !parseResult.data) {
        return {
          success: false,
          message: `Failed to parse world file: ${filePath}`,
          errors: parseResult.errors
        };
      }

      const worldFile = parseResult.data;
      
      // Validate zone integrity
      const integrityErrors = WorldParser.validateZoneIntegrity(worldFile);
      if (integrityErrors.length > 0) {
        errors.push(...integrityErrors);
        console.warn(`Zone integrity warnings for ${filePath}:`, integrityErrors);
      }

      // Import in transaction
      const stats = await this.prisma.$transaction(async (tx) => {
        return await this.importWorldData(tx, worldFile);
      });

      const timeTaken = Date.now() - startTime;
      
      return {
        success: true,
        message: `Successfully imported world file: ${filePath}`,
        errors,
        stats: { ...stats, timeTaken }
      };

    } catch (error) {
      return {
        success: false,
        message: `Import failed for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        errors
      };
    }
  }

  /**
   * Import all world files from a directory
   */
  async importAllWorldFiles(worldDir: string): Promise<ImportResult> {
    const startTime = Date.now();
    const allErrors: ValidationError[] = [];
    const allStats: ImportStats = {
      zones: 0,
      rooms: 0,
      mobs: 0,
      objects: 0,
      shops: 0,
      triggers: 0,
      mobResets: 0,
      timeTaken: 0
    };

    try {
      // Get all .json files in the world directory
      const files = await fs.readdir(worldDir);
      const jsonFiles = files
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => {
          // Sort numerically (0.json, 1.json, 10.json, etc.)
          const aNum = parseInt(a.replace('.json', ''), 10);
          const bNum = parseInt(b.replace('.json', ''), 10);
          return aNum - bNum;
        });

      console.log(`Found ${jsonFiles.length} world files to import`);

      // Import each file
      for (const file of jsonFiles) {
        const filePath = join(worldDir, file);
        console.log(`Importing ${file}...`);
        
        const result = await this.importWorldFile(filePath);
        
        if (result.errors.length > 0) {
          allErrors.push(...result.errors);
        }
        
        if (result.stats) {
          allStats.zones += result.stats.zones;
          allStats.rooms += result.stats.rooms;
          allStats.mobs += result.stats.mobs;
          allStats.objects += result.stats.objects;
          allStats.shops += result.stats.shops;
          allStats.triggers += result.stats.triggers;
          allStats.mobResets += result.stats.mobResets;
        }

        if (!result.success) {
          console.error(`Failed to import ${file}:`, result.message);
          // Continue with other files instead of failing completely
        } else {
          console.log(`✅ Imported ${file} successfully`);
        }
      }

      allStats.timeTaken = Date.now() - startTime;

      return {
        success: true,
        message: `Imported ${jsonFiles.length} world files`,
        errors: allErrors,
        stats: allStats
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to import world files: ${error instanceof Error ? error.message : String(error)}`,
        errors: allErrors
      };
    }
  }

  /**
   * Import world data within a transaction
   */
  private async importWorldData(tx: PrismaClient, worldFile: WorldFile): Promise<ImportStats> {
    const stats: ImportStats = {
      zones: 0,
      rooms: 0,
      mobs: 0,
      objects: 0,
      shops: 0,
      triggers: 0,
      mobResets: 0,
      timeTaken: 0
    };

    // Import zone
    const zoneId = WorldParser.normalizeZoneId(worldFile.zone.id);
    await this.importZone(tx, worldFile.zone, zoneId);
    stats.zones = 1;

    // Import mobs
    for (const mob of worldFile.mobs) {
      await this.importMob(tx, mob, zoneId);
      stats.mobs++;
    }

    // Import objects
    for (const object of worldFile.objects) {
      await this.importObject(tx, object, zoneId);
      stats.objects++;
    }

    // Import rooms
    for (const room of worldFile.rooms) {
      await this.importRoom(tx, room, zoneId);
      stats.rooms++;
    }

    // Import shops
    for (const shop of worldFile.shops) {
      await this.importShop(tx, shop, zoneId);
      stats.shops++;
    }

    // Import triggers
    for (const trigger of worldFile.triggers) {
      await this.importTrigger(tx, trigger, zoneId);
      stats.triggers++;
    }

    // Import mob resets
    if (worldFile.zone.resets.mob) {
      for (const reset of worldFile.zone.resets.mob) {
        await this.importMobReset(tx, reset, zoneId);
        stats.mobResets++;
      }
    }

    return stats;
  }

  /**
   * Import zone data
   */
  private async importZone(tx: PrismaClient, zone: ZoneJson, zoneId: number) {
    await tx.zone.upsert({
      where: { id: zoneId },
      update: {
        name: zone.name,
        top: zone.top,
        lifespan: zone.lifespan,
        resetMode: this.mapResetMode(zone.reset_mode),
        hemisphere: this.mapHemisphere(zone.hemisphere),
        climate: this.mapClimate(zone.climate),
        updatedAt: new Date(),
      },
      create: {
        id: zoneId,
        name: zone.name,
        top: zone.top,
        lifespan: zone.lifespan,
        resetMode: this.mapResetMode(zone.reset_mode),
        hemisphere: this.mapHemisphere(zone.hemisphere),
        climate: this.mapClimate(zone.climate),
      }
    });
  }

  /**
   * Import mob data
   */
  private async importMob(tx: PrismaClient, mob: MobJson, zoneId: number) {
    const mobData = WorldParser.normalizeMob(mob);
    
    await tx.mob.upsert({
      where: { id: mob.id },
      update: {
        keywords: mobData.keywords || mobData.name_list || '',
        mobClass: mob.mob_class,
        shortDesc: mobData.short_desc || mobData.short_description || '',
        longDesc: mobData.long_desc || mobData.long_description || '',
        desc: mobData.desc || mobData.description || '',
        mobFlags: mob.mob_flags.map(flag => this.mapMobFlag(flag)),
        effectFlags: mob.effect_flags.map(flag => this.mapEffectFlag(flag)),
        alignment: mob.alignment,
        level: mob.level,
        armorClass: mob.ac,
        hitRoll: mob.hit_roll,
        move: mob.move,
        hpDiceNum: mob.hp_dice.num,
        hpDiceSize: mob.hp_dice.size,
        hpDiceBonus: mob.hp_dice.bonus,
        damageDiceNum: mob.damage_dice.num,
        damageDiceSize: mob.damage_dice.size,
        damageDiceBonus: mob.damage_dice.bonus,
        copper: mob.money.copper,
        silver: mob.money.silver,
        gold: mob.money.gold,
        platinum: mob.money.platinum,
        position: this.mapPosition(mob.position),
        defaultPosition: this.mapPosition(mob.default_position),
        gender: this.mapGender(mob.gender),
        raceLegacy: this.mapRace(mob.race),
        raceAlign: mob.race_align,
        size: this.mapSize(mob.size),
        strength: mob.stats.strength,
        intelligence: mob.stats.intelligence,
        wisdom: mob.stats.wisdom,
        dexterity: mob.stats.dexterity,
        constitution: mob.stats.constitution,
        charisma: mob.stats.charisma,
        perception: mob.perception,
        concealment: mob.concealment,
        lifeForce: this.mapLifeForce(mob.life_force),
        composition: this.mapComposition(mob.composition),
        stance: this.mapStance(mob.stance),
        damageType: this.mapDamageType(mob.damage_type),
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: {
        id: mob.id,
        keywords: mobData.keywords || mobData.name_list || '',
        mobClass: mob.mob_class,
        shortDesc: mobData.short_desc || mobData.short_description || '',
        longDesc: mobData.long_desc || mobData.long_description || '',
        desc: mobData.desc || mobData.description || '',
        mobFlags: mob.mob_flags.map(flag => this.mapMobFlag(flag)),
        effectFlags: mob.effect_flags.map(flag => this.mapEffectFlag(flag)),
        alignment: mob.alignment,
        level: mob.level,
        armorClass: mob.ac,
        hitRoll: mob.hit_roll,
        move: mob.move,
        hpDiceNum: mob.hp_dice.num,
        hpDiceSize: mob.hp_dice.size,
        hpDiceBonus: mob.hp_dice.bonus,
        damageDiceNum: mob.damage_dice.num,
        damageDiceSize: mob.damage_dice.size,
        damageDiceBonus: mob.damage_dice.bonus,
        copper: mob.money.copper,
        silver: mob.money.silver,
        gold: mob.money.gold,
        platinum: mob.money.platinum,
        position: this.mapPosition(mob.position),
        defaultPosition: this.mapPosition(mob.default_position),
        gender: this.mapGender(mob.gender),
        raceLegacy: this.mapRace(mob.race),
        raceAlign: mob.race_align,
        size: this.mapSize(mob.size),
        strength: mob.stats.strength,
        intelligence: mob.stats.intelligence,
        wisdom: mob.stats.wisdom,
        dexterity: mob.stats.dexterity,
        constitution: mob.stats.constitution,
        charisma: mob.stats.charisma,
        perception: mob.perception,
        concealment: mob.concealment,
        lifeForce: this.mapLifeForce(mob.life_force),
        composition: this.mapComposition(mob.composition),
        stance: this.mapStance(mob.stance),
        damageType: this.mapDamageType(mob.damage_type),
        zoneId: zoneId,
      }
    });
  }

  /**
   * Import object data
   */
  private async importObject(tx: PrismaClient, object: ObjectJson, zoneId: number) {
    const objectData = WorldParser.normalizeObject(object);
    const objectId = parseInt(object.id, 10);
    
    await tx.object.upsert({
      where: { id: objectId },
      update: {
        type: this.mapObjectType(object.type),
        keywords: objectData.keywords || objectData.name_list || '',
        shortDesc: objectData.short_desc || objectData.short_description || '',
        description: object.description,
        actionDesc: object.action_description,
        flags: object.flags.map(flag => this.mapObjectFlag(flag)),
        effectFlags: object.effect_flags.map(flag => this.mapEffectFlag(flag)),
        wearFlags: object.wear_flags.map(flag => this.mapWearFlag(flag)),
        weight: typeof object.weight === 'string' ? parseFloat(object.weight) : object.weight,
        cost: typeof object.cost === 'string' ? parseInt(object.cost, 10) : object.cost,
        timer: typeof object.timer === 'string' ? parseInt(object.timer, 10) : object.timer,
        decomposeTimer: typeof object.decompose_timer === 'string' ? parseInt(object.decompose_timer, 10) : object.decompose_timer,
        level: typeof object.level === 'string' ? parseInt(object.level, 10) : object.level,
        concealment: object.concealment,
        values: object.values,
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: {
        id: objectId,
        type: this.mapObjectType(object.type),
        keywords: objectData.keywords || objectData.name_list || '',
        shortDesc: objectData.short_desc || objectData.short_description || '',
        description: object.description,
        actionDesc: object.action_description,
        flags: object.flags.map(flag => this.mapObjectFlag(flag)),
        effectFlags: object.effect_flags.map(flag => this.mapEffectFlag(flag)),
        wearFlags: object.wear_flags.map(flag => this.mapWearFlag(flag)),
        weight: typeof object.weight === 'string' ? parseFloat(object.weight) : object.weight,
        cost: typeof object.cost === 'string' ? parseInt(object.cost, 10) : object.cost,
        timer: typeof object.timer === 'string' ? parseInt(object.timer, 10) : object.timer,
        decomposeTimer: typeof object.decompose_timer === 'string' ? parseInt(object.decompose_timer, 10) : object.decompose_timer,
        level: typeof object.level === 'string' ? parseInt(object.level, 10) : object.level,
        concealment: object.concealment,
        values: object.values,
        zoneId: zoneId,
      }
    });

    // Import extra descriptions
    if (objectData.extra_descriptions && Array.isArray(objectData.extra_descriptions)) {
      // Delete existing extra descriptions
      await tx.objectExtraDescription.deleteMany({
        where: { objectId: objectId }
      });

      // Insert new extra descriptions
      for (const extraDesc of objectData.extra_descriptions) {
        await tx.objectExtraDescription.create({
          data: {
            keyword: extraDesc.keyword,
            description: extraDesc.desc,
            objectId: objectId
          }
        });
      }
    }

    // Import object affects
    if (object.affects && object.affects.length > 0) {
      // Delete existing affects
      await tx.objectAffect.deleteMany({
        where: { objectId: objectId }
      });

      // Insert new affects
      for (const affect of object.affects) {
        await tx.objectAffect.create({
          data: {
            location: affect.location,
            modifier: affect.modifier,
            objectId: objectId
          }
        });
      }
    }
  }

  /**
   * Import room data
   */
  private async importRoom(tx: PrismaClient, room: RoomJson, zoneId: number) {
    const roomId = parseInt(room.id, 10);
    
    await tx.room.upsert({
      where: { id: roomId },
      update: {
        name: room.name,
        description: room.description,
        sector: this.mapSector(room.sector),
        flags: room.flags.map(flag => this.mapRoomFlag(flag)),
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: {
        id: roomId,
        name: room.name,
        description: room.description,
        sector: this.mapSector(room.sector),
        flags: room.flags.map(flag => this.mapRoomFlag(flag)),
        zoneId: zoneId,
      }
    });

    // Import room exits
    if (room.exits) {
      // Delete existing exits
      await tx.roomExit.deleteMany({
        where: { roomId: roomId }
      });

      // Insert new exits
      for (const [direction, exit] of Object.entries(room.exits)) {
        await tx.roomExit.create({
          data: {
            direction: this.mapDirection(direction),
            description: exit.description,
            keyword: exit.keyword,
            key: exit.key === '-1' ? null : exit.key,
            destination: exit.destination === '-1' ? null : parseInt(exit.destination, 10),
            roomId: roomId
          }
        });
      }
    }

    // Import extra descriptions
    if (room.extra_descriptions) {
      // Delete existing extra descriptions
      await tx.roomExtraDescription.deleteMany({
        where: { roomId: roomId }
      });

      // Insert new extra descriptions
      for (const [keyword, description] of Object.entries(room.extra_descriptions)) {
        await tx.roomExtraDescription.create({
          data: {
            keyword,
            description,
            roomId: roomId
          }
        });
      }
    }
  }

  /**
   * Import shop data
   */
  private async importShop(tx: PrismaClient, shop: ShopJson, zoneId: number) {
    await tx.shop.upsert({
      where: { id: shop.id },
      update: {
        buyProfit: shop.buy_profit,
        sellProfit: shop.sell_profit,
        temper1: shop.temper1,
        flags: shop.flags.map(flag => this.mapShopFlag(flag)),
        tradesWithFlags: shop.trades_with.map(flag => this.mapShopTradesWith(flag)),
        noSuchItem1: shop.no_such_item1,
        noSuchItem2: shop.no_such_item2,
        doNotBuy: shop.do_not_buy,
        missingCash1: shop.missing_cash1,
        missingCash2: shop.missing_cash2,
        messageBuy: shop.message_buy,
        messageSell: shop.message_sell,
        keeperId: shop.keeper,
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: {
        id: shop.id,
        buyProfit: shop.buy_profit,
        sellProfit: shop.sell_profit,
        temper1: shop.temper1,
        flags: shop.flags.map(flag => this.mapShopFlag(flag)),
        tradesWithFlags: shop.trades_with.map(flag => this.mapShopTradesWith(flag)),
        noSuchItem1: shop.no_such_item1,
        noSuchItem2: shop.no_such_item2,
        doNotBuy: shop.do_not_buy,
        missingCash1: shop.missing_cash1,
        missingCash2: shop.missing_cash2,
        messageBuy: shop.message_buy,
        messageSell: shop.message_sell,
        keeperId: shop.keeper,
        zoneId: zoneId,
      }
    });

    // Import shop items
    if (shop.selling) {
      // Delete existing items
      await tx.shopItem.deleteMany({
        where: { shopId: shop.id }
      });

      // Insert new items
      for (const [objectIdStr, amount] of Object.entries(shop.selling)) {
        const objectId = parseInt(objectIdStr, 10);
        await tx.shopItem.create({
          data: {
            amount,
            shopId: shop.id,
            objectId: objectId
          }
        });
      }
    }

    // Import shop rooms
    if (shop.rooms && shop.rooms.length > 0) {
      // Delete existing room associations
      await tx.shopRoom.deleteMany({
        where: { shopId: shop.id }
      });

      // Insert new room associations
      for (const roomId of shop.rooms) {
        await tx.shopRoom.create({
          data: {
            roomId,
            shopId: shop.id
          }
        });
      }
    }

    // Import shop hours
    if (shop.hours && shop.hours.length > 0) {
      // Delete existing hours
      await tx.shopHour.deleteMany({
        where: { shopId: shop.id }
      });

      // Insert new hours
      for (const hour of shop.hours) {
        await tx.shopHour.create({
          data: {
            open: hour.open,
            close: hour.close,
            shopId: shop.id
          }
        });
      }
    }

    // Import shop accepts
    if (shop.accepts && shop.accepts.length > 0) {
      // Delete existing accepts
      await tx.shopAccept.deleteMany({
        where: { shopId: shop.id }
      });

      // Insert new accepts
      for (const accept of shop.accepts) {
        await tx.shopAccept.create({
          data: {
            type: accept.type,
            keywords: accept.keywords,
            shopId: shop.id
          }
        });
      }
    }
  }

  /**
   * Import trigger data
   */
  private async importTrigger(tx: PrismaClient, trigger: TriggerJson, zoneId: number) {
    await tx.trigger.upsert({
      where: { id: trigger.id },
      update: {
        name: trigger.name,
        attachType: this.mapScriptType(trigger.attach_type),
        flags: trigger.flags.map(flag => this.mapTriggerFlag(flag)),
        numArgs: parseInt(trigger.number_of_arguments, 10),
        argList: trigger.argument_list,
        commands: trigger.commands,
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: {
        id: trigger.id,
        name: trigger.name,
        attachType: this.mapScriptType(trigger.attach_type),
        flags: trigger.flags.map(flag => this.mapTriggerFlag(flag)),
        numArgs: parseInt(trigger.number_of_arguments, 10),
        argList: trigger.argument_list,
        commands: trigger.commands,
        zoneId: zoneId,
      }
    });
  }

  /**
   * Import mob reset data
   */
  private async importMobReset(tx: PrismaClient, reset: any, zoneId: number) {
    const mobReset = await tx.mobReset.create({
      data: {
        max: reset.max,
        name: reset.name,
        mobId: reset.id,
        roomId: reset.room,
        zoneId: zoneId,
      }
    });

    // Import carrying items
    if (reset.carrying) {
      for (const item of reset.carrying) {
        await tx.mobCarrying.create({
          data: {
            max: item.max,
            name: item.name,
            resetId: mobReset.id,
            objectId: item.id
          }
        });
      }
    }

    // Import equipped items
    if (reset.equipped) {
      for (const item of reset.equipped) {
        await tx.mobEquipped.create({
          data: {
            max: item.max,
            location: item.location,
            name: item.name,
            resetId: mobReset.id,
            objectId: item.id
          }
        });
      }
    }
  }

  // Mapping functions for enum conversions
  private mapResetMode(mode: string): 'NEVER' | 'EMPTY' | 'NORMAL' {
    switch (mode) {
      case 'Never': return 'NEVER';
      case 'Empty': return 'EMPTY';
      case 'Normal': return 'NORMAL';
      default: return 'NORMAL';
    }
  }

  private mapHemisphere(hemisphere: string): 'NORTHWEST' | 'NORTHEAST' | 'SOUTHWEST' | 'SOUTHEAST' {
    return hemisphere as any;
  }

  private mapClimate(climate: string): any {
    return climate as any;
  }

  private mapMobFlag(flag: string): any {
    return flag as any;
  }

  private mapEffectFlag(flag: string): any {
    return flag as any;
  }

  private mapPosition(position: string | number): any {
    if (typeof position === 'number') {
      const positionMap: Record<number, string> = {
        0: 'PRONE',
        1: 'SITTING', 
        2: 'KNEELING',
        3: 'STANDING',
        4: 'FLYING'
      };
      return positionMap[position] || 'STANDING';
    }
    return position as any;
  }

  private mapGender(gender: string | number): any {
    if (typeof gender === 'number') {
      const genderMap: Record<number, string> = {
        0: 'NEUTRAL',
        1: 'MALE',
        2: 'FEMALE',
        3: 'NON_BINARY'
      };
      return genderMap[gender] || 'NEUTRAL';
    }
    return gender as any;
  }

  private mapRace(race: string | number): any {
    if (typeof race === 'number') {
      const raceMap: Record<number, string> = {
        0: 'HUMAN', 1: 'ELF', 2: 'GNOME', 3: 'DWARF', 4: 'TROLL',
        5: 'DROW', 6: 'DUERGAR', 7: 'OGRE', 8: 'ORC', 9: 'HALF_ELF',
        10: 'BARBARIAN', 11: 'HALFLING', 12: 'PLANT', 13: 'HUMANOID', 14: 'ANIMAL',
        15: 'DRAGON_GENERAL', 16: 'GIANT', 17: 'OTHER', 18: 'GOBLIN', 19: 'DEMON',
        20: 'BROWNIE'
      };
      return raceMap[race] || 'HUMAN';
    }
    return race as any;
  }

  private mapSize(size: string | number): any {
    if (typeof size === 'number') {
      const sizeMap: Record<number, string> = {
        0: 'TINY', 1: 'SMALL', 2: 'MEDIUM', 3: 'LARGE', 4: 'HUGE',
        5: 'GIANT', 6: 'GARGANTUAN', 7: 'COLOSSAL', 8: 'TITANIC', 9: 'MOUNTAINOUS'
      };
      return sizeMap[size] || 'MEDIUM';
    }
    return size as any;
  }

  private mapLifeForce(lifeForce: string | number): any {
    if (typeof lifeForce === 'number') {
      const lifeForceMap: Record<number, string> = {
        0: 'LIFE', 1: 'UNDEAD', 2: 'MAGIC', 3: 'CELESTIAL', 4: 'DEMONIC', 5: 'ELEMENTAL'
      };
      return lifeForceMap[lifeForce] || 'LIFE';
    }
    // Handle string values - convert to uppercase
    return typeof lifeForce === 'string' ? lifeForce.toUpperCase() : lifeForce;
  }

  private mapComposition(composition: string | number): any {
    if (typeof composition === 'number') {
      const compositionMap: Record<number, string> = {
        0: 'FLESH', 1: 'EARTH', 2: 'AIR', 3: 'FIRE', 4: 'WATER', 5: 'ICE',
        6: 'MIST', 7: 'ETHER', 8: 'METAL', 9: 'STONE', 10: 'BONE', 11: 'LAVA', 12: 'PLANT'
      };
      return compositionMap[composition] || 'FLESH';
    }
    return typeof composition === 'string' ? composition.toUpperCase() : composition;
  }

  private mapStance(stance: string | number): any {
    if (typeof stance === 'number') {
      const stanceMap: Record<number, string> = {
        0: 'DEAD', 1: 'MORT', 2: 'INCAPACITATED', 3: 'STUNNED',
        4: 'SLEEPING', 5: 'RESTING', 6: 'ALERT', 7: 'FIGHTING'
      };
      return stanceMap[stance] || 'ALERT';
    }
    return typeof stance === 'string' ? stance.toUpperCase() : stance;
  }

  private mapDamageType(damageType: string | number): any {
    if (typeof damageType === 'number') {
      const damageTypeMap: Record<number, string> = {
        0: 'HIT', 1: 'STING', 2: 'WHIP', 3: 'SLASH', 4: 'BITE', 5: 'BLUDGEON',
        6: 'CRUSH', 7: 'POUND', 8: 'CLAW', 9: 'MAUL', 10: 'THRASH', 11: 'PIERCE',
        12: 'BLAST', 13: 'PUNCH', 14: 'STAB', 15: 'FIRE', 16: 'COLD', 17: 'ACID',
        18: 'SHOCK', 19: 'POISON', 20: 'ALIGN'
      };
      return damageTypeMap[damageType] || 'HIT';
    }
    return damageType as any;
  }

  private mapObjectType(type: string): any {
    // Handle DRINKCON alias
    if (type === 'DRINKCON') return 'DRINKCONTAINER';
    return type as any;
  }

  private mapObjectFlag(flag: string): any {
    return flag as any;
  }

  private mapWearFlag(flag: string): any {
    return flag as any;
  }

  private mapSector(sector: string): any {
    return sector as any;
  }

  private mapRoomFlag(flag: string): any {
    return flag as any;
  }

  private mapDirection(direction: string): any {
    return direction.toUpperCase() as any;
  }

  private mapShopFlag(flag: string): any {
    return flag as any;
  }

  private mapShopTradesWith(flag: string): any {
    return flag as any;
  }

  private mapScriptType(type: string): any {
    return type.toUpperCase() as any;
  }

  private mapTriggerFlag(flag: string): any {
    // Handle aliases
    if (flag === 'DEATH_TRIGGER') return 'DEATH';
    return flag as any;
  }
}