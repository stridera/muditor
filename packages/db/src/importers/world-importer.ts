import { PrismaClient, Prisma } from '@prisma/client';
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
  ValidationError,
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
        console.error(`   Parse failed for ${filePath}`);
        if (parseResult.errors.length > 0) {
          console.error(
            `   Parse errors:`,
            parseResult.errors.slice(0, 3).map(e => e.message)
          );
        }
        return {
          success: false,
          message: `Failed to parse world file: ${filePath}`,
          errors: parseResult.errors,
        };
      }

      const worldFile = parseResult.data;

      // Validate zone integrity
      const integrityErrors = WorldParser.validateZoneIntegrity(worldFile);
      if (integrityErrors.length > 0) {
        errors.push(...integrityErrors);
        console.warn(
          `Zone integrity warnings for ${filePath}:`,
          integrityErrors
        );
      }

      // Import in transaction
      console.log(`   Starting transaction for ${filePath}...`);
      const stats = await this.prisma.$transaction(async tx => {
        const result = await this.importWorldData(tx, worldFile);
        console.log(`   Transaction completed for ${filePath}, stats:`, result);
        return result;
      });

      // Handle constraint-prone operations outside the main transaction
      await this.importConstraintProneData(
        worldFile,
        stats.zones > 0
          ? worldFile.zone.id === '0'
            ? 1000
            : parseInt(worldFile.zone.id)
          : 0
      );

      const timeTaken = Date.now() - startTime;

      return {
        success: true,
        message: `Successfully imported world file: ${filePath}`,
        errors,
        stats: { ...stats, timeTaken },
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        errors,
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
      timeTaken: 0,
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
          console.error(`❌ Failed to import ${file}:`, result.message);
          if (result.errors.length > 0) {
            console.error(
              `   Errors:`,
              result.errors.slice(0, 3).map(e => e.message)
            );
          }
          // Continue with other files instead of failing completely
        } else {
          console.log(`✅ Imported ${file} successfully`);
          if (result.stats) {
            console.log(
              `   Stats: ${result.stats.zones} zones, ${result.stats.rooms} rooms, ${result.stats.mobs} mobs, ${result.stats.objects} objects`
            );
          }
        }
      }

      allStats.timeTaken = Date.now() - startTime;

      return {
        success: true,
        message: `Imported ${jsonFiles.length} world files`,
        errors: allErrors,
        stats: allStats,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import world files: ${error instanceof Error ? error.message : String(error)}`,
        errors: allErrors,
      };
    }
  }

  /**
   * Import world data within a transaction
   */
  private async importWorldData(
    tx: any,
    worldFile: WorldFile
  ): Promise<ImportStats> {
    const stats: ImportStats = {
      zones: 0,
      rooms: 0,
      mobs: 0,
      objects: 0,
      shops: 0,
      triggers: 0,
      mobResets: 0,
      timeTaken: 0,
    };

    // Import zone
    const zoneId = WorldParser.normalizeZoneId(worldFile.zone.id);
    console.log(
      `     Importing zone ${worldFile.zone.id} → ${zoneId}: ${worldFile.zone.name}`
    );
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

    // Import triggers
    for (const trigger of worldFile.triggers) {
      await this.importTrigger(tx, trigger, zoneId);
      stats.triggers++;
    }

    // Note: Shops and mob resets are imported separately to avoid transaction aborts from constraint violations

    return stats;
  }

  /**
   * Import constraint-prone data that could cause transaction aborts
   * These operations are done outside the main transaction with individual error handling
   */
  private async importConstraintProneData(
    worldFile: WorldFile,
    zoneId: number
  ): Promise<void> {
    console.log(`   Importing constraint-prone data for zone ${zoneId}...`);

    // Import shops with individual error handling
    for (const shop of worldFile.shops) {
      try {
        await this.importShopSafely(shop, zoneId);
      } catch (error) {
        console.warn(
          `⚠️ Failed to import shop ${shop.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Import mob resets with individual error handling
    if (worldFile.zone.resets.mob) {
      for (const reset of worldFile.zone.resets.mob) {
        try {
          await this.importMobResetSafely(reset, zoneId);
        } catch (error) {
          console.warn(
            `⚠️ Failed to import mob reset ${reset.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  /**
   * Import shop data safely with individual transaction and error handling
   */
  private async importShopSafely(shop: any, zoneId: number): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await this.importShop(tx, shop, zoneId);
    });
  }

  /**
   * Import mob reset data safely with individual transaction and error handling
   */
  private async importMobResetSafely(
    reset: any,
    zoneId: number
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await this.importMobReset(tx, reset, zoneId);
    });
  }

  /**
   * Import zone data
   */
  private async importZone(tx: any, zone: ZoneJson, zoneId: number) {
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
      },
    });
  }

  /**
   * Import mob data
   */
  private async importMob(tx: any, mob: MobJson, zoneId: number) {
    const mobData = WorldParser.normalizeMob(mob);

    await tx.mob.upsert({
      where: { id: mob.id },
      update: {
        vnum: mob.id % 1000 || 1000, // Calculate vnum from mob ID, ensuring positive value
        keywords: mobData.keywords || mobData.name_list || '',
        mobClass: mob.mob_class,
        shortDesc: mobData.short_desc || mobData.short_description || '',
        longDesc: mobData.long_desc || mobData.long_description || '',
        desc: mobData.desc || mobData.description || '',
        mobFlags: mob.mob_flags
          .map(flag => this.mapMobFlag(flag))
          .filter(flag => flag !== null) as any,
        effectFlags: mob.effect_flags
          .map(flag => this.mapEffectFlag(flag))
          .filter(flag => flag !== null),
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
        vnum: mob.id % 1000 || 1000, // Calculate vnum from mob ID, ensuring positive value
        keywords: mobData.keywords || mobData.name_list || '',
        mobClass: mob.mob_class,
        shortDesc: mobData.short_desc || mobData.short_description || '',
        longDesc: mobData.long_desc || mobData.long_description || '',
        desc: mobData.desc || mobData.description || '',
        mobFlags: mob.mob_flags
          .map(flag => this.mapMobFlag(flag))
          .filter(flag => flag !== null) as any,
        effectFlags: mob.effect_flags
          .map(flag => this.mapEffectFlag(flag))
          .filter(flag => flag !== null),
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
      },
    });
  }

  /**
   * Import object data
   */
  private async importObject(tx: any, object: ObjectJson, zoneId: number) {
    const objectData = WorldParser.normalizeObject(object);
    const objectId = parseInt(object.id, 10);

    await tx.object.upsert({
      where: { id: objectId },
      update: {
        vnum: objectId % 1000 || 1000, // Calculate vnum from object ID, ensuring positive value
        type: this.mapObjectType(object.type),
        keywords: objectData.keywords || objectData.name_list || '',
        shortDesc: objectData.short_desc || objectData.short_description || '',
        description: object.description,
        actionDesc: object.action_description,
        flags: object.flags.map(flag => this.mapObjectFlag(flag)),
        effectFlags: object.effect_flags.map(flag => this.mapEffectFlag(flag)),
        wearFlags: object.wear_flags.map(flag => this.mapWearFlag(flag)),
        weight:
          typeof object.weight === 'string'
            ? parseFloat(object.weight)
            : object.weight,
        cost:
          typeof object.cost === 'string'
            ? parseInt(object.cost, 10)
            : object.cost,
        timer:
          typeof object.timer === 'string'
            ? parseInt(object.timer, 10)
            : object.timer,
        decomposeTimer:
          typeof object.decompose_timer === 'string'
            ? parseInt(object.decompose_timer, 10)
            : object.decompose_timer,
        level:
          typeof object.level === 'string'
            ? parseInt(object.level, 10)
            : object.level,
        concealment: object.concealment,
        values: object.values,
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: {
        id: objectId,
        vnum: objectId % 1000 || 1000, // Calculate vnum from object ID, ensuring positive value
        type: this.mapObjectType(object.type),
        keywords: objectData.keywords || objectData.name_list || '',
        shortDesc: objectData.short_desc || objectData.short_description || '',
        description: object.description,
        actionDesc: object.action_description,
        flags: object.flags.map(flag => this.mapObjectFlag(flag)),
        effectFlags: object.effect_flags.map(flag => this.mapEffectFlag(flag)),
        wearFlags: object.wear_flags.map(flag => this.mapWearFlag(flag)),
        weight:
          typeof object.weight === 'string'
            ? parseFloat(object.weight)
            : object.weight,
        cost:
          typeof object.cost === 'string'
            ? parseInt(object.cost, 10)
            : object.cost,
        timer:
          typeof object.timer === 'string'
            ? parseInt(object.timer, 10)
            : object.timer,
        decomposeTimer:
          typeof object.decompose_timer === 'string'
            ? parseInt(object.decompose_timer, 10)
            : object.decompose_timer,
        level:
          typeof object.level === 'string'
            ? parseInt(object.level, 10)
            : object.level,
        concealment: object.concealment,
        values: object.values,
        zoneId: zoneId,
      },
    });

    // Import extra descriptions
    if (
      objectData.extra_descriptions &&
      Array.isArray(objectData.extra_descriptions)
    ) {
      // Delete existing extra descriptions
      await tx.objectExtraDescription.deleteMany({
        where: { objectId: objectId },
      });

      // Insert new extra descriptions
      for (const extraDesc of objectData.extra_descriptions) {
        await tx.objectExtraDescription.create({
          data: {
            keyword: extraDesc.keyword,
            description: extraDesc.desc,
            objectId: objectId,
          },
        });
      }
    }

    // Import object affects
    if (object.affects && object.affects.length > 0) {
      // Delete existing affects
      await tx.objectAffect.deleteMany({
        where: { objectId: objectId },
      });

      // Insert new affects
      for (const affect of object.affects) {
        await tx.objectAffect.create({
          data: {
            location: this.mapEquipLocation(affect.location),
            modifier: affect.modifier,
            objectId: objectId,
          },
        });
      }
    }
  }

  /**
   * Import room data
   */
  private async importRoom(tx: any, room: any, zoneId: number): Promise<void> {
    // Map and filter room flags
    const mappedFlags =
      room.flags
        ?.map((flag: string) => this.mapRoomFlag(flag))
        .filter((flag: string | null) => flag !== null) || [];

    const roomData: Prisma.RoomCreateInput = {
      id: parseInt(room.id),
      vnum: parseInt(room.id) % 1000 || 1000,
      name: room.name || '',
      description: room.description || '',
      sector: room.sector || 'INSIDE',
      flags: mappedFlags,
      zone: {
        connect: { id: zoneId },
      },
    };

    await tx.room.upsert({
      where: { id: parseInt(room.id) },
      update: {
        vnum: parseInt(room.id) % 1000 || 1000,
        name: room.name || '',
        description: room.description || '',
        sector: room.sector || 'INSIDE',
        flags: mappedFlags,
        zoneId: zoneId,
        updatedAt: new Date(),
      },
      create: roomData,
    });

    // Handle exits
    if (room.exits) {
      for (const [direction, exit] of Object.entries(room.exits) as [
        string,
        any,
      ][]) {
        await this.importExit(tx, parseInt(room.id), direction, exit);
      }
    }
  }

  /**
   * Import exit data for a room
   */
  private async importExit(
    tx: any,
    roomId: number,
    direction: string,
    exit: any
  ): Promise<void> {
    // Map direction strings to enum values
    const directionMap: Record<string, string> = {
      North: 'NORTH',
      East: 'EAST',
      South: 'SOUTH',
      West: 'WEST',
      Up: 'UP',
      Down: 'DOWN',
    };

    const mappedDirection = directionMap[direction];
    if (!mappedDirection) {
      console.warn(`Unknown direction: ${direction} - skipping exit`);
      return;
    }

    await tx.roomExit.upsert({
      where: {
        roomId_direction: {
          roomId: roomId,
          direction: mappedDirection as any,
        },
      },
      update: {
        description: exit.description || null,
        keyword: exit.keyword || null,
        key: exit.key === '-1' ? null : exit.key,
        destination: exit.destination ? parseInt(exit.destination) : null,
      },
      create: {
        direction: mappedDirection as any,
        description: exit.description || null,
        keyword: exit.keyword || null,
        key: exit.key === '-1' ? null : exit.key,
        destination: exit.destination ? parseInt(exit.destination) : null,
        roomId: roomId,
      },
    });
  }

  /**
   * Import shop data
   */
  private async importShop(tx: any, shop: ShopJson, zoneId: number) {
    try {
      await tx.shop.upsert({
        where: { id: shop.id },
        update: {
          vnum: shop.id % 1000 || 1000,
          buyProfit: shop.buy_profit,
          sellProfit: shop.sell_profit,
          temper1: shop.temper1,
          flags: shop.flags.map(flag => this.mapShopFlag(flag)),
          tradesWithFlags: shop.trades_with
            .map(flag => this.mapShopTradesWith(flag))
            .filter(flag => flag !== null),
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
          vnum: shop.id % 1000 || 1000,
          buyProfit: shop.buy_profit,
          sellProfit: shop.sell_profit,
          temper1: shop.temper1,
          flags: shop.flags.map(flag => this.mapShopFlag(flag)),
          tradesWithFlags: shop.trades_with
            .map(flag => this.mapShopTradesWith(flag))
            .filter(flag => flag !== null),
          noSuchItem1: shop.no_such_item1,
          noSuchItem2: shop.no_such_item2,
          doNotBuy: shop.do_not_buy,
          missingCash1: shop.missing_cash1,
          missingCash2: shop.missing_cash2,
          messageBuy: shop.message_buy,
          messageSell: shop.message_sell,
          keeperId: shop.keeper,
          zoneId: zoneId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003' || error.message?.includes('keeperId_fkey')) {
        console.warn(
          `⚠️ Skipping shop ${shop.id} - keeper mob ${shop.keeper} not found`
        );
        return; // Skip this shop, don't fail the entire transaction
      }
      throw error; // Re-throw other errors
    }

    // Import shop items
    if (shop.selling) {
      // Delete existing items
      await tx.shopItem.deleteMany({
        where: { shopId: shop.id },
      });

      // Insert new items
      for (const [objectIdStr, amount] of Object.entries(shop.selling)) {
        const objectId = parseInt(objectIdStr, 10);
        try {
          await tx.shopItem.create({
            data: {
              amount,
              shopId: shop.id,
              objectId: objectId,
            },
          });
        } catch (error: any) {
          if (
            error.code === 'P2003' ||
            error.message?.includes('objectId_fkey')
          ) {
            console.warn(
              `⚠️ Skipping shop item - object ${objectId} not found for shop ${shop.id}`
            );
            continue; // Skip this shop item, continue with others
          }
          throw error; // Re-throw other errors
        }
      }
    }

    // Import shop rooms
    if (shop.rooms && shop.rooms.length > 0) {
      // Delete existing room associations
      await tx.shopRoom.deleteMany({
        where: { shopId: shop.id },
      });

      // Insert new room associations
      for (const roomId of shop.rooms) {
        await tx.shopRoom.create({
          data: {
            roomId,
            shopId: shop.id,
          },
        });
      }
    }

    // Import shop hours
    if (shop.hours && shop.hours.length > 0) {
      // Delete existing hours
      await tx.shopHour.deleteMany({
        where: { shopId: shop.id },
      });

      // Insert new hours
      for (const hour of shop.hours) {
        await tx.shopHour.create({
          data: {
            open: hour.open,
            close: hour.close,
            shopId: shop.id,
          },
        });
      }
    }

    // Import shop accepts
    if (shop.accepts && shop.accepts.length > 0) {
      // Delete existing accepts
      await tx.shopAccept.deleteMany({
        where: { shopId: shop.id },
      });

      // Insert new accepts
      for (const accept of shop.accepts) {
        await tx.shopAccept.create({
          data: {
            type: accept.type,
            keywords: accept.keywords,
            shopId: shop.id,
          },
        });
      }
    }
  }

  /**
   * Import trigger data
   */
  private async importTrigger(tx: any, trigger: TriggerJson, zoneId: number) {
    await tx.trigger.upsert({
      where: { id: trigger.id.toString() },
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
        id: trigger.id.toString(),
        name: trigger.name,
        attachType: this.mapScriptType(trigger.attach_type),
        flags: trigger.flags.map(flag => this.mapTriggerFlag(flag)),
        numArgs: parseInt(trigger.number_of_arguments, 10),
        argList: trigger.argument_list,
        commands: trigger.commands,
        zoneId: zoneId,
      },
    });
  }

  /**
   * Import mob reset data
   */
  private async importMobReset(tx: any, reset: any, zoneId: number) {
    let mobReset;
    try {
      mobReset = await tx.mobReset.create({
        data: {
          max: reset.max,
          name: reset.name,
          mobId: reset.id,
          roomId: reset.room,
          zoneId: zoneId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        if (error.message?.includes('mobId_fkey')) {
          console.warn(`⚠️ Skipping mob reset - mob ${reset.id} not found`);
          return; // Skip this entire mob reset
        }
        if (error.message?.includes('roomId_fkey')) {
          console.warn(`⚠️ Skipping mob reset - room ${reset.room} not found`);
          return; // Skip this entire mob reset
        }
      }
      throw error; // Re-throw other errors
    }

    // Import carrying items
    if (reset.carrying) {
      for (const item of reset.carrying) {
        try {
          await tx.mobCarrying.create({
            data: {
              max: item.max,
              name: item.name,
              resetId: mobReset.id,
              objectId: item.id,
            },
          });
        } catch (error: any) {
          if (
            error.code === 'P2003' ||
            error.message?.includes('objectId_fkey')
          ) {
            console.warn(
              `⚠️ Skipping carrying item - object ${item.id} not found for mob ${reset.mob}`
            );
            continue; // Skip this carrying item, continue with others
          }
          throw error; // Re-throw other errors
        }
      }
    }

    // Import equipped items
    if (reset.equipped) {
      for (const item of reset.equipped) {
        try {
          await tx.mobEquipped.create({
            data: {
              max: item.max,
              location: this.mapEquipLocation(item.location),
              name: item.name,
              resetId: mobReset.id,
              objectId: item.id,
            },
          });
        } catch (error: any) {
          if (
            error.code === 'P2003' ||
            error.message?.includes('objectId_fkey')
          ) {
            console.warn(
              `⚠️ Skipping equipped item - object ${item.id} not found for mob ${reset.mob}`
            );
            continue; // Skip this equipped item, continue with others
          }
          throw error; // Re-throw other errors
        }
      }
    }
  }

  // Mapping functions for enum conversions
  private mapResetMode(mode: string): 'NEVER' | 'EMPTY' | 'NORMAL' {
    switch (mode) {
      case 'Never':
        return 'NEVER';
      case 'Empty':
        return 'EMPTY';
      case 'Normal':
        return 'NORMAL';
      default:
        return 'NORMAL';
    }
  }

  private mapHemisphere(
    hemisphere: string
  ): 'NORTHWEST' | 'NORTHEAST' | 'SOUTHWEST' | 'SOUTHEAST' {
    return hemisphere as any;
  }

  private mapClimate(climate: string): any {
    return climate as any;
  }

  private mapPosition(position: string | number): any {
    if (typeof position === 'number') {
      const positionMap: Record<number, string> = {
        0: 'PRONE',
        1: 'SITTING',
        2: 'KNEELING',
        3: 'STANDING',
        4: 'FLYING',
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
        3: 'NON_BINARY',
      };
      return genderMap[gender] || 'NEUTRAL';
    }
    return gender as any;
  }

  private mapRace(race: string | number): any {
    if (typeof race === 'number') {
      const raceMap: Record<number, string> = {
        0: 'HUMAN',
        1: 'ELF',
        2: 'GNOME',
        3: 'DWARF',
        4: 'TROLL',
        5: 'DROW',
        6: 'DUERGAR',
        7: 'OGRE',
        8: 'ORC',
        9: 'HALF_ELF',
        10: 'BARBARIAN',
        11: 'HALFLING',
        12: 'PLANT',
        13: 'HUMANOID',
        14: 'ANIMAL',
        15: 'DRAGON_GENERAL',
        16: 'GIANT',
        17: 'OTHER',
        18: 'GOBLIN',
        19: 'DEMON',
        20: 'BROWNIE',
      };
      return raceMap[race] || 'HUMAN';
    }
    return race as any;
  }

  private mapSize(size: string | number): any {
    if (typeof size === 'number') {
      const sizeMap: Record<number, string> = {
        0: 'TINY',
        1: 'SMALL',
        2: 'MEDIUM',
        3: 'LARGE',
        4: 'HUGE',
        5: 'GIANT',
        6: 'GARGANTUAN',
        7: 'COLOSSAL',
        8: 'TITANIC',
        9: 'MOUNTAINOUS',
      };
      return sizeMap[size] || 'MEDIUM';
    }
    return size as any;
  }

  private mapLifeForce(lifeForce: string | number): any {
    if (typeof lifeForce === 'number') {
      const lifeForceMap: Record<number, string> = {
        0: 'LIFE',
        1: 'UNDEAD',
        2: 'MAGIC',
        3: 'CELESTIAL',
        4: 'DEMONIC',
        5: 'ELEMENTAL',
      };
      return lifeForceMap[lifeForce] || 'LIFE';
    }
    // Handle string values - convert to uppercase
    return typeof lifeForce === 'string' ? lifeForce.toUpperCase() : lifeForce;
  }

  private mapComposition(composition: string | number): any {
    if (typeof composition === 'number') {
      const compositionMap: Record<number, string> = {
        0: 'FLESH',
        1: 'EARTH',
        2: 'AIR',
        3: 'FIRE',
        4: 'WATER',
        5: 'ICE',
        6: 'MIST',
        7: 'ETHER',
        8: 'METAL',
        9: 'STONE',
        10: 'BONE',
        11: 'LAVA',
        12: 'PLANT',
      };
      return compositionMap[composition] || 'FLESH';
    }
    return typeof composition === 'string'
      ? composition.toUpperCase()
      : composition;
  }

  private mapStance(stance: string | number): any {
    if (typeof stance === 'number') {
      const stanceMap: Record<number, string> = {
        0: 'DEAD',
        1: 'MORT',
        2: 'INCAPACITATED',
        3: 'STUNNED',
        4: 'SLEEPING',
        5: 'RESTING',
        6: 'ALERT',
        7: 'FIGHTING',
      };
      return stanceMap[stance] || 'ALERT';
    }
    return typeof stance === 'string' ? stance.toUpperCase() : stance;
  }

  private mapDamageType(damageType: string | number): any {
    if (typeof damageType === 'number') {
      const damageTypeMap: Record<number, string> = {
        0: 'HIT',
        1: 'STING',
        2: 'WHIP',
        3: 'SLASH',
        4: 'BITE',
        5: 'BLUDGEON',
        6: 'CRUSH',
        7: 'POUND',
        8: 'CLAW',
        9: 'MAUL',
        10: 'THRASH',
        11: 'PIERCE',
        12: 'BLAST',
        13: 'PUNCH',
        14: 'STAB',
        15: 'FIRE',
        16: 'COLD',
        17: 'ACID',
        18: 'SHOCK',
        19: 'POISON',
        20: 'ALIGN',
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
    const upperFlag = flag.toUpperCase();

    // Known aliases - map legacy names to schema names
    const aliases: Record<string, string> = {
      NORENT: 'NO_RENT',
      NOBURN: 'NO_BURN',
      NODROP: 'NO_DROP',
      NOSELL: 'NO_SELL',
      NOINVIS: 'NO_INVISIBLE',
      DECOMP: 'DECOMPOSING',
      NOFALL: 'NO_FALL',
      NOLOCATE: 'NO_LOCATE',
    };

    if (aliases[upperFlag]) {
      console.log(`Mapped object flag ${upperFlag} → ${aliases[upperFlag]}`);
      return aliases[upperFlag];
    }

    return upperFlag;
  }

  private mapWearFlag(flag: string): any {
    const upperFlag = flag.toUpperCase();

    // Known aliases - map legacy names to schema names
    const aliases: Record<string, string> = {
      '2HWIELD': 'TWO_HAND_WIELD', // Map 2-handed wield to proper enum value
      BELT: 'WAIST', // Map belt to waist
    };

    if (aliases[upperFlag]) {
      console.log(`Mapped wear flag ${upperFlag} → ${aliases[upperFlag]}`);
      return aliases[upperFlag];
    }

    return upperFlag;
  }

  private mapSector(sector: string): any {
    return sector as any;
  }

  private mapRoomFlag(flag: string): string | null {
    const upperFlag = flag.toUpperCase();

    // Validate against known schema enum values
    const validRoomFlags = [
      'DARK',
      'DEATH',
      'NOMOB',
      'INDOORS',
      'PEACEFUL',
      'SOUNDPROOF',
      'NOTRACK',
      'NOMAGIC',
      'TUNNEL',
      'PRIVATE',
      'GODROOM',
      'HOUSE',
      'HOUSECRASH',
      'ATRIUM',
      'OLC',
      'BFS_MARK',
      'WORLDMAP',
      'FERRY_DEST',
      'ISOLATED',
      'ARENA',
      'NOSCAN',
      'UNDERDARK',
      'NOSHIFT',
      'NORECALL',
      'ALT_EXIT',
      'OBSERVATORY',
      'HOUSE_CRASH',
      'LARGE',
      'MEDIUM_LARGE',
      'MEDIUM',
      'MEDIUM_SMALL',
      'SMALL',
      'VERY_SMALL',
      'ONE_PERSON',
      'EFFECTS_NEXT',
      'ALWAYSLIT',
      'GUILDHALL',
      'NOWELL',
      'NOSUMMON',
    ];

    if (validRoomFlags.includes(upperFlag)) {
      return upperFlag;
    }

    // Check for other flags that might need to be added to schema later
    const unknownFlags = ['NORECALL', 'NOTELEPORT'];
    if (unknownFlags.includes(upperFlag)) {
      console.warn(
        `Unknown room flag: ${upperFlag} - may need to be added to schema`
      );
      return null;
    }

    console.warn(`Unknown room flag: ${upperFlag} - skipping`);
    return null;
  }

  private mapDirection(direction: string): any {
    return direction.toUpperCase() as any;
  }

  private mapShopFlag(flag: string): any {
    return flag as any;
  }

  private mapShopTradesWith(flag: string): string | null {
    const upperFlag = flag.toUpperCase();

    const knownTradesWithFlags = [
      'ALIGNMENT',
      'RACE',
      'CLASS',
      'TRADE_NOGOOD',
      'TRADE_NOEVIL',
      'TRADE_NONEUTRAL',
      'TRADE_NOCLERIC',
      'TRADE_NOTHIEF',
      'TRADE_NOWARRIOR',
    ];

    if (knownTradesWithFlags.includes(upperFlag)) {
      return upperFlag;
    }

    console.warn(
      `Skipping unknown shop trades with flag: ${upperFlag} (add to schema if needed)`
    );
    return null;
  }

  private mapScriptType(type: string): any {
    const upperType = type.toUpperCase();

    // Known aliases - map legacy names to schema names
    const aliases: Record<string, string> = {
      ROOM: 'WORLD', // Map room triggers to world triggers
      MOBILE: 'MOB', // Map mobile triggers to mob triggers
    };

    if (aliases[upperType]) {
      console.log(`Mapped script type ${upperType} → ${aliases[upperType]}`);
      return aliases[upperType];
    }

    return upperType;
  }

  private mapTriggerFlag(flag: string): any {
    // Handle aliases
    if (flag === 'DEATH_TRIGGER') return 'DEATH';
    if (flag === 'HitPercentage') return 'HitPrcnt';
    return flag as any;
  }

  private mapEquipLocation(location: number | string): string {
    if (typeof location === 'string') return location;

    const locationMap: Record<number, string> = {
      1: 'LIGHT',
      2: 'RIGHT_FINGER',
      3: 'LEFT_FINGER',
      4: 'NECK_1',
      5: 'NECK_2',
      6: 'BODY',
      7: 'HEAD',
      8: 'LEGS',
      9: 'FEET',
      10: 'HANDS',
      11: 'ARMS',
      12: 'SHIELD',
      13: 'ABOUT_BODY',
      14: 'WAIST',
      15: 'RIGHT_WRIST',
      16: 'LEFT_WRIST',
      17: 'WIELD',
      18: 'HOLD',
      19: 'TWO_HANDED',
      20: 'SECOND_WIELD',
      21: 'RANGED',
      22: 'EAR',
      23: 'FACE',
      24: 'ANKLE',
      25: 'BADGE',
      26: 'TATTOO',
      27: 'EYES',
      28: 'FLOATING',
    };

    return locationMap[location] || `UNKNOWN_${location}`;
  }

  private mapMobFlag(flag: string): string | null {
    const upperFlag = flag.toUpperCase();

    // Map flag aliases to schema enum values
    const aliases: Record<string, string> = {
      NOCHARM: 'NO_CHARM',
      NOSUMMON: 'NO_SUMMOM', // Note: schema has typo NO_SUMMOM
      NOSLEEP: 'NO_SLEEP',
      NOBLIND: 'NO_BLIND',
      NOBASH: 'NO_BASH',
      AGGR_EVIL: 'AGGRO_EVIL',
      AGGR_GOOD: 'AGGRO_GOOD',
      AGGR_NEUTRAL: 'AGGRO_NEUTRAL',
      AGGR_EVIL_RACE: 'AGGRO_EVIL', // Map race-specific to general
      AGGR_GOOD_RACE: 'AGGRO_GOOD', // Map race-specific to general
    };

    // Use alias if it exists, otherwise use the original flag
    const mappedFlag = aliases[upperFlag] || upperFlag;

    // Validate against known schema enum values
    const validMobFlags = [
      'SPEC',
      'SENTINEL',
      'SCAVENGER',
      'ISNPC',
      'AWARE',
      'AGGRESSIVE',
      'STAY_ZONE',
      'WIMPY',
      'AGGRO_EVIL',
      'AGGRO_GOOD',
      'AGGRO_NEUTRAL',
      'MEMORY',
      'HELPER',
      'NO_CHARM',
      'NO_SUMMOM',
      'NO_SLEEP',
      'NO_BASH',
      'NO_BLIND',
      'MOUNT',
      'STAY_SECT',
      'HATES_SUN',
      'NO_KILL',
      'TRACK',
      'ILLUSION',
      'POISON_BITE',
      'THIEF',
      'WARRIOR',
      'SORCERER',
      'CLERIC',
      'PALADIN',
      'ANTI_PALADIN',
      'RANGER',
      'DRUID',
      'SHAMAN',
      'ASSASSIN',
      'MERCENARY',
      'NECROMANCER',
      'CONJURER',
      'MONK',
      'BERSERKER',
      'DIABOLIST',
      'SLOW_TRACK',
      'NOSILENCE',
      'PEACEFUL',
      'PROTECTOR',
      'PEACEKEEPER',
      'HASTE',
      'BLUR',
      'TEACHER',
      'MOUNTABLE',
      'NOVICIOUS',
      'NO_CLASS_AI',
      'FAST_TRACK',
      'AQUATIC',
      'NO_EQ_RESTRICT',
      'SUMMONED_MOUNT',
      'NOPOISON',
    ];

    if (validMobFlags.includes(mappedFlag)) {
      return mappedFlag;
    }

    console.warn(
      `Unknown mob flag: ${upperFlag} (mapped to ${mappedFlag}) - skipping`
    );
    return null;
  }

  private mapEffectFlag(flag: string): string | null {
    const upperFlag = flag.toUpperCase();

    // Remove EFF_ prefix if present
    const normalizedFlag = upperFlag.startsWith('EFF_')
      ? upperFlag.substring(4)
      : upperFlag;

    // Known aliases for effect flags
    const aliases: Record<string, string> = {
      FLY: 'FLYING',
      NOTRACK: 'NO_TRACK',
    };

    if (aliases[normalizedFlag]) {
      console.log(
        `Mapped effect flag ${normalizedFlag} → ${aliases[normalizedFlag]}`
      );
      return aliases[normalizedFlag];
    }

    // Skip unknown flags
    const knownFlags = [
      'BLIND',
      'INVISIBLE',
      'DETECT_ALIGN',
      'DETECT_INVIS',
      'DETECT_MAGIC',
      'SENSE_LIFE',
      'WATERWALK',
      'SANCTUARY',
      'GROUP',
      'CURSE',
      'INFRAVISION',
      'POISON',
      'PROTECT_EVIL',
      'PROTECT_GOOD',
      'SLEEP',
      'NO_TRACK',
      'SNEAK',
      'HIDE',
      'CHARM',
      'FLYING',
      'WATERBREATH',
      'ANGELIC_AURA',
      'ETHEREAL',
      'MAGICONLY',
      'NEXTPARTIAL',
      'NEXTNOATTACK',
      'SPELL_TURNING',
      'COMPREHEND_LANG',
      'FIRESHIELD',
      'DEATH_FIELD',
      'MAJOR_PARALYSIS',
      'MINOR_PARALYSIS',
      'DRAGON_RIDE',
      'COSMIC_TRAVEL',
      'MENTAL_BARRIER',
      'VITALITY',
      'HASTE',
      'SLOW',
      'CONFUSION',
      'MIST_WALK',
      'BURNING_HANDS',
      'FAERIE_FIRE',
      'DARKNESS',
      'INVISIBLE_STALKER',
      'FEBLEMIND',
      'FLUORESCENCE',
      'RESTLESS',
      'ASH_EYES',
      'DILATE_PUPILS',
      'FLAME_SHROUD',
      'BARKSKIN',
      'ULTRA_DAMAGE',
      'SHILLELAGH',
      'SUN_RAY',
      'WITHER_LIMB',
      'PETRIFY',
      'DISEASE',
      'PLAGUE',
      'SCOURGE',
      'VAMPIRIC_DRAIN',
      'MOON_BEAM',
      'TORNADO',
      'EARTHMAW',
      'CYCLONE',
      'FLOOD',
      'METEOR',
      'FIRESTORM',
      'SILENCE',
      'CALM',
      'ENTANGLE',
      'ANIMAL_KIN',
      'BLUR',
      'ULTRAVISION',
      'LIGHT',
      'PROT_COLD',
      'PROT_AIR',
      'PROT_FIRE',
      'PROT_EARTH',
      'FARSEE',
      'STONE_SKIN',
      'DETECT_POISON',
      'SOULSHIELD',
      'TAMED',
      'GLORY',
      'STEALTH',
      'NEGATE_HEAT',
      'NEGATE_EARTH',
      'NEGATE_COLD',
      'NEGATE_AIR',
      'MAJOR_GLOBE',
      'INSANITY',
      'COLDSHIELD',
      'CAMOUFLAGED',
      'UNUSED',
      'REMOTE_AGGR',
      'MESMERIZED',
      'HARNESS',
      'FAMILIARITY',
      'DISPLACEMENT',
      'BLESS',
      'AWARE',
    ];

    if (knownFlags.includes(normalizedFlag)) {
      return normalizedFlag;
    }

    console.warn(
      `Skipping unknown effect flag: ${normalizedFlag} (add to schema if needed)`
    );
    return null;
  }
}
