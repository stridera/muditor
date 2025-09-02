import { PrismaClient, Prisma } from '@prisma/client';
import { 
  ResetMode, 
  Hemisphere, 
  Climate, 
  Sector, 
  Direction, 
  ObjectType, 
  ScriptType 
} from '@prisma/client';

interface WorldFileData {
  zone: any;
  mobs?: any[];
  objects?: any[];
  rooms?: any[];
  shops?: any[];
  triggers?: any[];
}

interface ParseResult {
  zonesCreated: number;
  roomsCreated: number;
  mobsCreated: number;
  objectsCreated: number;
  shopsCreated: number;
  triggersCreated: number;
}

export class WorldFileParser {
  constructor(private prisma: PrismaClient) {}

  async parseWorldFile(data: WorldFileData, zoneId: number): Promise<ParseResult> {
    const result: ParseResult = {
      zonesCreated: 0,
      roomsCreated: 0,
      mobsCreated: 0,
      objectsCreated: 0,
      shopsCreated: 0,
      triggersCreated: 0,
    };

    // Parse zone
    if (data.zone) {
      await this.parseZone(data.zone, zoneId);
      result.zonesCreated = 1;
    }

    // Parse mobs
    if (data.mobs && Array.isArray(data.mobs)) {
      for (const mob of data.mobs) {
        await this.parseMob(mob, zoneId);
        result.mobsCreated++;
      }
    }

    // Parse objects
    if (data.objects && Array.isArray(data.objects)) {
      for (const obj of data.objects) {
        await this.parseObject(obj, zoneId);
        result.objectsCreated++;
      }
    }

    // Parse rooms
    if (data.rooms && Array.isArray(data.rooms)) {
      for (const room of data.rooms) {
        await this.parseRoom(room, zoneId);
        result.roomsCreated++;
      }
    }

    // Parse shops
    if (data.shops && Array.isArray(data.shops)) {
      for (const shop of data.shops) {
        await this.parseShop(shop, zoneId);
        result.shopsCreated++;
      }
    }

    // Parse triggers
    if (data.triggers && Array.isArray(data.triggers)) {
      for (const trigger of data.triggers) {
        await this.parseTrigger(trigger, zoneId);
        result.triggersCreated++;
      }
    }

    // Parse mob resets (from zone.resets.mob)
    if (data.zone?.resets?.mob && Array.isArray(data.zone.resets.mob)) {
      for (const mobReset of data.zone.resets.mob) {
        await this.parseMobReset(mobReset, zoneId);
      }
    }

    return result;
  }

  private async parseZone(zone: any, zoneId: number) {
    const zoneData: Prisma.ZoneCreateInput = {
      id: zoneId,
      name: zone.name || `Zone ${zoneId}`,
      top: zone.top || 0,
      lifespan: zone.lifespan || 30,
      resetMode: this.mapResetMode(zone.reset_mode),
      hemisphere: this.mapHemisphere(zone.hemisphere),
      climate: this.mapClimate(zone.climate),
    };

    await this.prisma.zone.upsert({
      where: { id: zoneId },
      update: zoneData,
      create: zoneData,
    });
  }

  private async parseMob(mob: any, zoneId: number) {
    const mobData: Prisma.MobCreateInput = {
      id: mob.id,
      keywords: this.ensureString(mob.keywords || mob.name_list || ''),
      mobClass: mob.mob_class || mob.class || 'Layman',
      shortDesc: mob.short_desc || mob.short_description || '',
      longDesc: mob.long_desc || mob.long_description || '',
      desc: mob.desc || mob.description || '',
      mobFlags: this.ensureArray(mob.mob_flags),
      effectFlags: this.ensureArray(mob.effect_flags),
      alignment: mob.alignment || 0,
      level: mob.level || 1,
      armorClass: mob.ac || 0,
      hitRoll: mob.hit_roll || 0,
      move: mob.move || 0,
      
      // Hit Points (dice-based)
      hpDiceNum: mob.hp_dice?.num || 0,
      hpDiceSize: mob.hp_dice?.size || 0,
      hpDiceBonus: mob.hp_dice?.bonus || 0,
      
      // Damage (dice-based)
      damageDiceNum: mob.damage_dice?.num || 0,
      damageDiceSize: mob.damage_dice?.size || 0,
      damageDiceBonus: mob.damage_dice?.bonus || 0,
      
      // Currency
      copper: mob.money?.copper || 0,
      silver: mob.money?.silver || 0,
      gold: mob.money?.gold || 0,
      platinum: mob.money?.platinum || 0,
      
      // Attributes
      position: mob.position || 3,
      defaultPosition: mob.default_position || 3,
      gender: mob.gender || 0,
      race: mob.race || 0,
      raceAlign: mob.race_align || 0,
      size: mob.size || 2,
      
      // Stats
      strength: mob.stats?.strength || 13,
      intelligence: mob.stats?.intelligence || 13,
      wisdom: mob.stats?.wisdom || 13,
      dexterity: mob.stats?.dexterity || 13,
      constitution: mob.stats?.constitution || 13,
      charisma: mob.stats?.charisma || 13,
      
      // Skills
      perception: mob.perception || 0,
      concealment: mob.concealment || 0,
      
      // Essence
      lifeForce: mob.life_force || 'Life',
      composition: mob.composition || 'Flesh',
      stance: mob.stance || 'Alert',
      damageType: mob.damage_type || 'HIT',
      
      zone: {
        connect: { id: zoneId }
      },
    };

    await this.prisma.mob.upsert({
      where: { id: mob.id },
      update: mobData,
      create: mobData,
    });
  }

  private async parseObject(obj: any, zoneId: number) {
    const objectData: Prisma.ObjectCreateInput = {
      id: parseInt(obj.id.toString()),
      type: this.mapObjectType(obj.type),
      keywords: this.ensureString(obj.name_list || obj.keywords || ''),
      shortDesc: obj.short_description || obj.short_desc || '',
      description: obj.description || '',
      actionDesc: obj.action_description || obj.action_desc || null,
      flags: this.ensureArray(obj.flags),
      effectFlags: this.ensureArray(obj.effect_flags),
      wearFlags: this.ensureArray(obj.wear_flags),
      weight: parseFloat(obj.weight?.toString() || '0'),
      cost: parseInt(obj.cost?.toString() || '0'),
      timer: parseInt(obj.timer?.toString() || '0'),
      decomposeTimer: parseInt(obj.decompose_timer?.toString() || '0'),
      level: parseInt(obj.level?.toString() || '1'),
      concealment: obj.concealment || 0,
      values: obj.values || {},
      zone: {
        connect: { id: zoneId }
      },
    };

    const createdObject = await this.prisma.object.upsert({
      where: { id: parseInt(obj.id.toString()) },
      update: objectData,
      create: objectData,
    });

    // Parse extra descriptions
    if (obj.extra_descriptions && Array.isArray(obj.extra_descriptions)) {
      for (const extraDesc of obj.extra_descriptions) {
        await this.prisma.objectExtraDescription.create({
          data: {
            keyword: extraDesc.keyword,
            description: extraDesc.desc || extraDesc.description,
            objectId: createdObject.id,
          },
        });
      }
    }

    // Parse affects
    if (obj.affects && Array.isArray(obj.affects)) {
      for (const affect of obj.affects) {
        await this.prisma.objectAffect.create({
          data: {
            location: affect.location,
            modifier: affect.modifier,
            objectId: createdObject.id,
          },
        });
      }
    }

    // Parse spells
    if (obj.spells && Array.isArray(obj.spells)) {
      for (const spell of obj.spells) {
        await this.prisma.objectSpell.create({
          data: {
            spell: spell.spell || spell.name || spell,
            level: spell.level || 1,
            objectId: createdObject.id,
          },
        });
      }
    }
  }

  private async parseRoom(room: any, zoneId: number) {
    const roomData: Prisma.RoomCreateInput = {
      id: parseInt(room.id.toString()),
      name: room.name || `Room ${room.id}`,
      description: room.description || '',
      sector: this.mapSector(room.sector),
      flags: this.ensureArray(room.flags),
      zone: {
        connect: { id: zoneId }
      },
    };

    const createdRoom = await this.prisma.room.upsert({
      where: { id: parseInt(room.id.toString()) },
      update: roomData,
      create: roomData,
    });

    // Parse exits
    if (room.exits && typeof room.exits === 'object') {
      for (const [direction, exit] of Object.entries(room.exits)) {
        const exitData = exit as any;
        await this.prisma.roomExit.create({
          data: {
            direction: this.mapDirection(direction),
            description: exitData.description || null,
            keyword: exitData.keyword || null,
            key: exitData.key === '-1' ? null : exitData.key,
            destination: exitData.destination ? parseInt(exitData.destination.toString()) : null,
            roomId: createdRoom.id,
          },
        });
      }
    }

    // Parse extra descriptions
    if (room.extra_descriptions && typeof room.extra_descriptions === 'object') {
      for (const [keyword, description] of Object.entries(room.extra_descriptions)) {
        await this.prisma.roomExtraDescription.create({
          data: {
            keyword,
            description: description as string,
            roomId: createdRoom.id,
          },
        });
      }
    }
  }

  private async parseShop(shop: any, zoneId: number) {
    const shopData: Prisma.ShopCreateInput = {
      id: shop.id,
      buyProfit: shop.buy_profit || 1.0,
      sellProfit: shop.sell_profit || 1.0,
      temper1: shop.temper1 || 0,
      flags: this.ensureArray(shop.flags),
      tradesWithFlags: this.ensureArray(shop.trades_with),
      noSuchItem1: shop.no_such_item1 || null,
      noSuchItem2: shop.no_such_item2 || null,
      doNotBuy: shop.do_not_buy || null,
      missingCash1: shop.missing_cash1 || null,
      missingCash2: shop.missing_cash2 || null,
      messageBuy: shop.message_buy || null,
      messageSell: shop.message_sell || null,
      zone: {
        connect: { id: zoneId }
      },
    };

    // Connect keeper if it exists
    if (shop.keeper) {
      shopData.keeper = {
        connect: { id: shop.keeper }
      };
    }

    const createdShop = await this.prisma.shop.upsert({
      where: { id: shop.id },
      update: shopData,
      create: shopData,
    });

    // Parse shop items
    if (shop.selling && typeof shop.selling === 'object') {
      for (const [objectId, amount] of Object.entries(shop.selling)) {
        await this.prisma.shopItem.create({
          data: {
            amount: amount as number,
            shopId: createdShop.id,
            objectId: parseInt(objectId),
          },
        });
      }
    }

    // Parse shop accepts
    if (shop.accepts && Array.isArray(shop.accepts)) {
      for (const accept of shop.accepts) {
        await this.prisma.shopAccept.create({
          data: {
            type: accept.type,
            keywords: accept.keywords || null,
            shopId: createdShop.id,
          },
        });
      }
    }

    // Parse shop rooms
    if (shop.rooms && Array.isArray(shop.rooms)) {
      for (const roomId of shop.rooms) {
        await this.prisma.shopRoom.create({
          data: {
            roomId: parseInt(roomId.toString()),
            shopId: createdShop.id,
          },
        });
      }
    }

    // Parse shop hours
    if (shop.hours && Array.isArray(shop.hours)) {
      for (const hour of shop.hours) {
        await this.prisma.shopHour.create({
          data: {
            open: hour.open,
            close: hour.close,
            shopId: createdShop.id,
          },
        });
      }
    }
  }

  private async parseTrigger(trigger: any, zoneId: number) {
    const triggerData: Prisma.TriggerCreateInput = {
      name: trigger.name || 'unnamed_trigger',
      attachType: this.mapScriptType(trigger.attach_type),
      flags: this.ensureArray(trigger.flags),
      numArgs: trigger.number_of_arguments || trigger.num_args || 0,
      argList: trigger.argument_list || trigger.arg_list || null,
      commands: trigger.commands || '',
      variables: trigger.script_variables || {},
      zone: {
        connect: { id: zoneId }
      },
    };

    await this.prisma.trigger.create({
      data: triggerData,
    });
  }

  private async parseMobReset(mobReset: any, zoneId: number) {
    const resetData: Prisma.MobResetCreateInput = {
      max: mobReset.max || 1,
      name: mobReset.name || null,
      mob: {
        connect: { id: mobReset.id }
      },
      room: {
        connect: { id: mobReset.room }
      },
      zone: {
        connect: { id: zoneId }
      },
    };

    const createdReset = await this.prisma.mobReset.create({
      data: resetData,
    });

    // Parse carrying items
    if (mobReset.carrying && Array.isArray(mobReset.carrying)) {
      for (const item of mobReset.carrying) {
        await this.prisma.mobCarrying.create({
          data: {
            max: item.max || 1,
            name: item.name || null,
            resetId: createdReset.id,
            objectId: item.id,
          },
        });
      }
    }

    // Parse equipped items
    if (mobReset.equipped && Array.isArray(mobReset.equipped)) {
      for (const item of mobReset.equipped) {
        await this.prisma.mobEquipped.create({
          data: {
            max: item.max || 1,
            location: item.location,
            name: item.name || null,
            resetId: createdReset.id,
            objectId: item.id,
          },
        });
      }
    }
  }

  // Mapping utility functions
  private mapResetMode(resetMode: string): ResetMode {
    switch (resetMode?.toUpperCase()) {
      case 'NEVER': return ResetMode.NEVER;
      case 'EMPTY': return ResetMode.EMPTY;
      case 'NORMAL': return ResetMode.NORMAL;
      default: return ResetMode.NORMAL;
    }
  }

  private mapHemisphere(hemisphere: string): Hemisphere {
    switch (hemisphere?.toUpperCase()) {
      case 'NORTHWEST': return Hemisphere.NORTHWEST;
      case 'NORTHEAST': return Hemisphere.NORTHEAST;
      case 'SOUTHWEST': return Hemisphere.SOUTHWEST;
      case 'SOUTHEAST': return Hemisphere.SOUTHEAST;
      default: return Hemisphere.NORTHWEST;
    }
  }

  private mapClimate(climate: string): Climate {
    switch (climate?.toUpperCase()) {
      case 'NONE': return Climate.NONE;
      case 'SEMIARID': return Climate.SEMIARID;
      case 'ARID': return Climate.ARID;
      case 'OCEANIC': return Climate.OCEANIC;
      case 'TEMPERATE': return Climate.TEMPERATE;
      case 'SUBTROPICAL': return Climate.SUBTROPICAL;
      case 'TROPICAL': return Climate.TROPICAL;
      case 'SUBARCTIC': return Climate.SUBARCTIC;
      case 'ARCTIC': return Climate.ARCTIC;
      case 'ALPINE': return Climate.ALPINE;
      default: return Climate.NONE;
    }
  }

  private mapSector(sector: string): Sector {
    switch (sector?.toUpperCase()) {
      case 'STRUCTURE': return Sector.STRUCTURE;
      case 'CITY': return Sector.CITY;
      case 'FIELD': return Sector.FIELD;
      case 'FOREST': return Sector.FOREST;
      case 'HILLS': return Sector.HILLS;
      case 'MOUNTAIN': return Sector.MOUNTAIN;
      case 'SHALLOWS': return Sector.SHALLOWS;
      case 'WATER': return Sector.WATER;
      case 'UNDERWATER': return Sector.UNDERWATER;
      case 'AIR': return Sector.AIR;
      case 'ROAD': return Sector.ROAD;
      case 'GRASSLANDS': return Sector.GRASSLANDS;
      case 'CAVE': return Sector.CAVE;
      case 'RUINS': return Sector.RUINS;
      case 'SWAMP': return Sector.SWAMP;
      case 'BEACH': return Sector.BEACH;
      case 'UNDERDARK': return Sector.UNDERDARK;
      case 'ASTRALPLANE': return Sector.ASTRALPLANE;
      case 'AIRPLANE': return Sector.AIRPLANE;
      case 'FIREPLANE': return Sector.FIREPLANE;
      case 'EARTHPLANE': return Sector.EARTHPLANE;
      case 'ETHEREALPLANE': return Sector.ETHEREALPLANE;
      case 'AVERNUS': return Sector.AVERNUS;
      default: return Sector.STRUCTURE;
    }
  }

  private mapDirection(direction: string): Direction {
    switch (direction?.toLowerCase()) {
      case 'north': return Direction.NORTH;
      case 'east': return Direction.EAST;
      case 'south': return Direction.SOUTH;
      case 'west': return Direction.WEST;
      case 'up': return Direction.UP;
      case 'down': return Direction.DOWN;
      default: return Direction.NORTH;
    }
  }

  private mapObjectType(type: string): ObjectType {
    switch (type?.toUpperCase()) {
      case 'NOTHING': return ObjectType.NOTHING;
      case 'LIGHT': return ObjectType.LIGHT;
      case 'SCROLL': return ObjectType.SCROLL;
      case 'WAND': return ObjectType.WAND;
      case 'STAFF': return ObjectType.STAFF;
      case 'WEAPON': return ObjectType.WEAPON;
      case 'FIREWEAPON': return ObjectType.FIREWEAPON;
      case 'MISSILE': return ObjectType.MISSILE;
      case 'TREASURE': return ObjectType.TREASURE;
      case 'ARMOR': return ObjectType.ARMOR;
      case 'POTION': return ObjectType.POTION;
      case 'WORN': return ObjectType.WORN;
      case 'OTHER': return ObjectType.OTHER;
      case 'TRASH': return ObjectType.TRASH;
      case 'TRAP': return ObjectType.TRAP;
      case 'CONTAINER': return ObjectType.CONTAINER;
      case 'NOTE': return ObjectType.NOTE;
      case 'DRINKCON': 
      case 'DRINKCONTAINER': return ObjectType.DRINKCONTAINER;
      case 'KEY': return ObjectType.KEY;
      case 'FOOD': return ObjectType.FOOD;
      case 'MONEY': return ObjectType.MONEY;
      case 'PEN': return ObjectType.PEN;
      case 'BOAT': return ObjectType.BOAT;
      case 'FOUNTAIN': return ObjectType.FOUNTAIN;
      case 'PORTAL': return ObjectType.PORTAL;
      case 'ROPE': return ObjectType.ROPE;
      case 'SPELLBOOK': return ObjectType.SPELLBOOK;
      case 'WALL': return ObjectType.WALL;
      case 'TOUCHSTONE': return ObjectType.TOUCHSTONE;
      case 'BOARD': return ObjectType.BOARD;
      case 'INSTRUMENT': return ObjectType.INSTRUMENT;
      default: return ObjectType.OTHER;
    }
  }

  private mapScriptType(attachType: string): ScriptType {
    switch (attachType?.toLowerCase()) {
      case 'mob': return ScriptType.MOB;
      case 'object': return ScriptType.OBJECT;
      case 'world': return ScriptType.WORLD;
      default: return ScriptType.WORLD;
    }
  }

  private ensureArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.map(v => v.toString());
    }
    if (typeof value === 'string') {
      // Handle comma-separated strings
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  }

  private ensureString(value: any): string {
    if (Array.isArray(value)) {
      return value.join(' ');
    }
    if (typeof value === 'string') {
      return value;
    }
    return value?.toString() || '';
  }
}