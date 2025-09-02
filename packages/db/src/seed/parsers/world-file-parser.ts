import { PrismaClient, Prisma } from '@prisma/client';
import { 
  ResetMode, 
  Hemisphere, 
  Climate, 
  Sector, 
  Direction, 
  ObjectType, 
  ScriptType,
  MobFlag,
  EffectFlag,
  RoomFlag,
  TriggerFlag,
  ShopFlag,
  ShopTradesWith,
  Gender,
  Race,
  Position,
  LifeForce,
  Composition,
  Stance,
  DamageType,
  Size,
  ObjectFlag,
  WearFlag
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
      mobFlags: this.mapMobFlags(mob.mob_flags),
      effectFlags: this.mapEffectFlags(mob.effect_flags),
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
      position: this.mapPosition(mob.position),
      defaultPosition: this.mapPosition(mob.default_position),
      gender: this.mapGender(mob.gender),
      
      // Use legacy race field during transition
      raceLegacy: this.mapRace(mob.race),
      raceAlign: mob.race_align || 0,
      size: this.mapSize(mob.size),
      
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
      lifeForce: this.mapLifeForce(mob.life_force),
      composition: this.mapComposition(mob.composition),
      stance: this.mapStance(mob.stance),
      damageType: this.mapDamageType(mob.damage_type),
      
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
      flags: this.mapObjectFlags(obj.flags),
      effectFlags: this.mapEffectFlags(obj.effect_flags),
      wearFlags: this.mapWearFlags(obj.wear_flags),
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
      flags: this.mapRoomFlags(room.flags),
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
        const mappedDirection = this.mapDirection(direction);
        await this.prisma.roomExit.upsert({
          where: {
            roomId_direction: {
              roomId: createdRoom.id,
              direction: mappedDirection,
            },
          },
          update: {
            description: exitData.description || null,
            keyword: exitData.keyword || null,
            key: exitData.key === '-1' ? null : exitData.key,
            destination: exitData.destination ? parseInt(exitData.destination.toString()) : null,
          },
          create: {
            direction: mappedDirection,
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
      flags: this.mapShopFlags(shop.flags),
      tradesWithFlags: this.mapShopTradesWithFlags(shop.trades_with),
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
      flags: this.mapTriggerFlags(trigger.flags),
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

  private mapMobFlags(flags: any): MobFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      switch (upperFlag) {
        case 'SPEC': return MobFlag.SPEC;
        case 'SENTINEL': return MobFlag.SENTINEL;
        case 'SCAVENGER': return MobFlag.SCAVENGER;
        case 'ISNPC': return MobFlag.ISNPC;
        case 'AWARE': return MobFlag.AWARE;
        case 'AGGRESSIVE': return MobFlag.AGGRESSIVE;
        case 'STAY_ZONE': return MobFlag.STAY_ZONE;
        case 'WIMPY': return MobFlag.WIMPY;
        case 'AGGRO_EVIL': return MobFlag.AGGRO_EVIL;
        case 'AGGRO_GOOD': return MobFlag.AGGRO_GOOD;
        case 'AGGRO_NEUTRAL': return MobFlag.AGGRO_NEUTRAL;
        case 'MEMORY': return MobFlag.MEMORY;
        case 'HELPER': return MobFlag.HELPER;
        case 'NO_CHARM': return MobFlag.NO_CHARM;
        case 'NO_SUMMOM': return MobFlag.NO_SUMMOM;
        case 'NO_SLEEP': return MobFlag.NO_SLEEP;
        case 'NO_BASH': return MobFlag.NO_BASH;
        case 'NO_BLIND': return MobFlag.NO_BLIND;
        case 'MOUNT': return MobFlag.MOUNT;
        case 'STAY_SECT': return MobFlag.STAY_SECT;
        case 'HATES_SUN': return MobFlag.HATES_SUN;
        case 'NO_KILL': return MobFlag.NO_KILL;
        case 'TRACK': return MobFlag.TRACK;
        case 'ILLUSION': return MobFlag.ILLUSION;
        case 'POISON_BITE': return MobFlag.POISON_BITE;
        case 'THIEF': return MobFlag.THIEF;
        case 'WARRIOR': return MobFlag.WARRIOR;
        case 'SORCERER': return MobFlag.SORCERER;
        case 'CLERIC': return MobFlag.CLERIC;
        case 'PALADIN': return MobFlag.PALADIN;
        case 'ANTI_PALADIN': return MobFlag.ANTI_PALADIN;
        case 'RANGER': return MobFlag.RANGER;
        case 'DRUID': return MobFlag.DRUID;
        case 'SHAMAN': return MobFlag.SHAMAN;
        case 'ASSASSIN': return MobFlag.ASSASSIN;
        case 'MERCENARY': return MobFlag.MERCENARY;
        case 'NECROMANCER': return MobFlag.NECROMANCER;
        case 'CONJURER': return MobFlag.CONJURER;
        case 'MONK': return MobFlag.MONK;
        case 'BERSERKER': return MobFlag.BERSERKER;
        case 'DIABOLIST': return MobFlag.DIABOLIST;
        default: return MobFlag.ISNPC; // Default fallback
      }
    }).filter(flag => flag !== undefined);
  }

  private mapEffectFlags(flags: any): EffectFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      // Remove EFF_ prefix if present
      const normalizedFlag = upperFlag.startsWith('EFF_') ? upperFlag.substring(4) : upperFlag;
      switch (normalizedFlag) {
        case 'BLIND': return EffectFlag.BLIND;
        case 'INVISIBLE': return EffectFlag.INVISIBLE;
        case 'DETECT_ALIGN': return EffectFlag.DETECT_ALIGN;
        case 'DETECT_INVIS': return EffectFlag.DETECT_INVIS;
        case 'DETECT_MAGIC': return EffectFlag.DETECT_MAGIC;
        case 'SENSE_LIFE': return EffectFlag.SENSE_LIFE;
        case 'WATERWALK': return EffectFlag.WATERWALK;
        case 'SANCTUARY': return EffectFlag.SANCTUARY;
        case 'GROUP': return EffectFlag.GROUP;
        case 'CURSE': return EffectFlag.CURSE;
        case 'INFRAVISION': return EffectFlag.INFRAVISION;
        case 'POISON': return EffectFlag.POISON;
        case 'PROTECT_EVIL': return EffectFlag.PROTECT_EVIL;
        case 'PROTECT_GOOD': return EffectFlag.PROTECT_GOOD;
        case 'SLEEP': return EffectFlag.SLEEP;
        case 'NO_TRACK': return EffectFlag.NO_TRACK;
        case 'SNEAK': return EffectFlag.SNEAK;
        case 'HIDE': return EffectFlag.HIDE;
        case 'CHARM': return EffectFlag.CHARM;
        case 'FLYING': return EffectFlag.FLYING;
        case 'WATERBREATH': return EffectFlag.WATERBREATH;
        case 'ANGELIC_AURA': return EffectFlag.ANGELIC_AURA;
        case 'ETHEREAL': return EffectFlag.ETHEREAL;
        case 'MAGICONLY': return EffectFlag.MAGICONLY;
        case 'NEXTPARTIAL': return EffectFlag.NEXTPARTIAL;
        case 'NEXTNOATTACK': return EffectFlag.NEXTNOATTACK;
        case 'SPELL_TURNING': return EffectFlag.SPELL_TURNING;
        case 'COMPREHEND_LANG': return EffectFlag.COMPREHEND_LANG;
        case 'FIRESHIELD': return EffectFlag.FIRESHIELD;
        case 'DEATH_FIELD': return EffectFlag.DEATH_FIELD;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as EffectFlag[];
  }

  private mapRoomFlags(flags: any): RoomFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      // Remove ROOM_ prefix if present
      const normalizedFlag = upperFlag.startsWith('ROOM_') ? upperFlag.substring(5) : upperFlag;
      switch (normalizedFlag) {
        case 'DARK': return RoomFlag.DARK;
        case 'DEATH': return RoomFlag.DEATH;
        case 'NOMOB': return RoomFlag.NOMOB;
        case 'INDOORS': return RoomFlag.INDOORS;
        case 'PEACEFUL': return RoomFlag.PEACEFUL;
        case 'SOUNDPROOF': return RoomFlag.SOUNDPROOF;
        case 'NOTRACK': return RoomFlag.NOTRACK;
        case 'NOMAGIC': return RoomFlag.NOMAGIC;
        case 'TUNNEL': return RoomFlag.TUNNEL;
        case 'PRIVATE': return RoomFlag.PRIVATE;
        case 'GODROOM': return RoomFlag.GODROOM;
        case 'HOUSE': return RoomFlag.HOUSE;
        case 'HOUSECRASH': return RoomFlag.HOUSECRASH;
        case 'ATRIUM': return RoomFlag.ATRIUM;
        case 'OLC': return RoomFlag.OLC;
        case 'BFS_MARK': return RoomFlag.BFS_MARK;
        case 'WORLDMAP': return RoomFlag.WORLDMAP;
        case 'FERRY_DEST': return RoomFlag.FERRY_DEST;
        case 'ISOLATED': return RoomFlag.ISOLATED;
        case 'ARENA': return RoomFlag.ARENA;
        case 'LARGE': return RoomFlag.LARGE;
        case 'MEDIUM_LARGE': return RoomFlag.MEDIUM_LARGE;
        case 'MEDIUM': return RoomFlag.MEDIUM;
        case 'MEDIUM_SMALL': return RoomFlag.MEDIUM_SMALL;
        case 'SMALL': return RoomFlag.SMALL;
        case 'VERY_SMALL': return RoomFlag.VERY_SMALL;
        case 'ONE_PERSON': return RoomFlag.ONE_PERSON;
        case 'EFFECTS_NEXT': return RoomFlag.EFFECTS_NEXT;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as RoomFlag[];
  }

  private mapTriggerFlags(flags: any): TriggerFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const titleFlag = flag.charAt(0).toUpperCase() + flag.slice(1).toLowerCase();
      switch (titleFlag) {
        case 'Global': return TriggerFlag.Global;
        case 'Random': return TriggerFlag.Random;
        case 'Command': return TriggerFlag.Command;
        case 'Speech': return TriggerFlag.Speech;
        case 'Act': return TriggerFlag.Act;
        case 'Death': return TriggerFlag.Death;
        case 'Greet': return TriggerFlag.Greet;
        case 'GreetAll': return TriggerFlag.GreetAll;
        case 'Entry': return TriggerFlag.Entry;
        case 'Receive': return TriggerFlag.Receive;
        case 'Fight': return TriggerFlag.Fight;
        case 'HitPrcnt': return TriggerFlag.HitPrcnt;
        case 'Bribe': return TriggerFlag.Bribe;
        case 'Load': return TriggerFlag.Load;
        case 'Memory': return TriggerFlag.Memory;
        case 'Cast': return TriggerFlag.Cast;
        case 'Leave': return TriggerFlag.Leave;
        case 'Door': return TriggerFlag.Door;
        case 'Time': return TriggerFlag.Time;
        case 'Auto': return TriggerFlag.Auto;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as TriggerFlag[];
  }

  private mapShopFlags(flags: any): ShopFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      switch (upperFlag) {
        case 'WILL_FIGHT': return ShopFlag.WILL_FIGHT;
        case 'USES_BANK': return ShopFlag.USES_BANK;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as ShopFlag[];
  }

  private mapShopTradesWithFlags(flags: any): ShopTradesWith[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      switch (upperFlag) {
        case 'ALIGNMENT': case 'TRADES_WITH_ALIGNMENT': return ShopTradesWith.ALIGNMENT;
        case 'RACE': case 'TRADES_WITH_RACE': return ShopTradesWith.RACE;
        case 'CLASS': case 'TRADES_WITH_CLASS': return ShopTradesWith.CLASS;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as ShopTradesWith[];
  }

  private mapObjectFlags(flags: any): ObjectFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      switch (upperFlag) {
        case 'GLOW': return ObjectFlag.GLOW;
        case 'HUM': return ObjectFlag.HUM;
        case 'NO_RENT': return ObjectFlag.NO_RENT;
        case 'INVISIBLE': return ObjectFlag.INVISIBLE;
        case 'MAGIC': return ObjectFlag.MAGIC;
        case 'NO_DROP': return ObjectFlag.NO_DROP;
        case 'PERMANENT': return ObjectFlag.PERMANENT;
        case 'ANTI_GOOD': return ObjectFlag.ANTI_GOOD;
        case 'ANTI_EVIL': return ObjectFlag.ANTI_EVIL;
        case 'ANTI_NEUTRAL': return ObjectFlag.ANTI_NEUTRAL;
        case 'NO_SELL': return ObjectFlag.NO_SELL;
        case 'FLOAT': return ObjectFlag.FLOAT;
        case 'NO_FALL': return ObjectFlag.NO_FALL;
        case 'ELVEN': return ObjectFlag.ELVEN;
        case 'DWARVEN': return ObjectFlag.DWARVEN;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as ObjectFlag[];
  }

  private mapWearFlags(flags: any): WearFlag[] {
    const flagArray = this.ensureArray(flags);
    return flagArray.map(flag => {
      const upperFlag = flag.toUpperCase();
      switch (upperFlag) {
        case 'TAKE': return WearFlag.TAKE;
        case 'FINGER': return WearFlag.FINGER;
        case 'NECK': return WearFlag.NECK;
        case 'BODY': return WearFlag.BODY;
        case 'HEAD': return WearFlag.HEAD;
        case 'LEGS': return WearFlag.LEGS;
        case 'FEET': return WearFlag.FEET;
        case 'HANDS': return WearFlag.HANDS;
        case 'ARMS': return WearFlag.ARMS;
        case 'SHIELD': return WearFlag.SHIELD;
        case 'ABOUT': return WearFlag.ABOUT;
        case 'WAIST': return WearFlag.WAIST;
        case 'WRIST': return WearFlag.WRIST;
        case 'WIELD': return WearFlag.WIELD;
        case 'HOLD': return WearFlag.HOLD;
        case 'TWO_HAND_WIELD': case 'TWO-HAND-WIELD': return WearFlag.TWO_HAND_WIELD;
        default: return null; // Skip unknown flags
      }
    }).filter(flag => flag !== null) as WearFlag[];
  }

  private mapGender(gender: any): Gender {
    if (typeof gender === 'number') {
      switch (gender) {
        case 0: return Gender.NEUTRAL;
        case 1: return Gender.MALE;
        case 2: return Gender.FEMALE;
        case 3: return Gender.NON_BINARY;
        default: return Gender.NEUTRAL;
      }
    }
    const genderStr = gender?.toString().toUpperCase();
    switch (genderStr) {
      case 'MALE': return Gender.MALE;
      case 'FEMALE': return Gender.FEMALE;
      case 'NON_BINARY': return Gender.NON_BINARY;
      case 'NEUTRAL':
      default: return Gender.NEUTRAL;
    }
  }

  private mapRace(race: any): Race {
    if (typeof race === 'number') {
      // Map numeric race values to enum
      const raceNames = Object.values(Race);
      return raceNames[race] || Race.HUMAN;
    }
    const raceStr = race?.toString().toUpperCase();
    switch (raceStr) {
      case 'HUMAN': return Race.HUMAN;
      case 'ELF': return Race.ELF;
      case 'GNOME': return Race.GNOME;
      case 'DWARF': return Race.DWARF;
      case 'TROLL': return Race.TROLL;
      case 'DROW': return Race.DROW;
      case 'DUERGAR': return Race.DUERGAR;
      case 'OGRE': return Race.OGRE;
      case 'ORC': return Race.ORC;
      case 'HALF_ELF': case 'HALF-ELF': return Race.HALF_ELF;
      case 'BARBARIAN': return Race.BARBARIAN;
      case 'HALFLING': return Race.HALFLING;
      default: return Race.HUMAN;
    }
  }

  private mapPosition(position: any): Position {
    if (typeof position === 'number') {
      switch (position) {
        case 0: return Position.PRONE;
        case 1: return Position.SITTING;
        case 2: return Position.KNEELING;
        case 3: return Position.STANDING;
        case 4: return Position.FLYING;
        default: return Position.STANDING;
      }
    }
    const posStr = position?.toString().toUpperCase();
    switch (posStr) {
      case 'PRONE': return Position.PRONE;
      case 'SITTING': return Position.SITTING;
      case 'KNEELING': return Position.KNEELING;
      case 'STANDING': return Position.STANDING;
      case 'FLYING': return Position.FLYING;
      default: return Position.STANDING;
    }
  }

  private mapSize(size: any): Size {
    if (typeof size === 'number') {
      switch (size) {
        case 0: return Size.TINY;
        case 1: return Size.SMALL;
        case 2: return Size.MEDIUM;
        case 3: return Size.LARGE;
        case 4: return Size.HUGE;
        case 5: return Size.GIANT;
        case 6: return Size.GARGANTUAN;
        case 7: return Size.COLOSSAL;
        case 8: return Size.TITANIC;
        case 9: return Size.MOUNTAINOUS;
        default: return Size.MEDIUM;
      }
    }
    const sizeStr = size?.toString().toUpperCase();
    switch (sizeStr) {
      case 'TINY': return Size.TINY;
      case 'SMALL': return Size.SMALL;
      case 'MEDIUM': return Size.MEDIUM;
      case 'LARGE': return Size.LARGE;
      case 'HUGE': return Size.HUGE;
      case 'GIANT': return Size.GIANT;
      case 'GARGANTUAN': return Size.GARGANTUAN;
      case 'COLOSSAL': return Size.COLOSSAL;
      case 'TITANIC': return Size.TITANIC;
      case 'MOUNTAINOUS': return Size.MOUNTAINOUS;
      default: return Size.MEDIUM;
    }
  }

  private mapLifeForce(lifeForce: any): LifeForce {
    const lifeForceStr = lifeForce?.toString().toUpperCase();
    switch (lifeForceStr) {
      case 'LIFE': return LifeForce.LIFE;
      case 'UNDEAD': return LifeForce.UNDEAD;
      case 'MAGIC': return LifeForce.MAGIC;
      case 'CELESTIAL': return LifeForce.CELESTIAL;
      case 'DEMONIC': return LifeForce.DEMONIC;
      case 'ELEMENTAL': return LifeForce.ELEMENTAL;
      default: return LifeForce.LIFE;
    }
  }

  private mapComposition(composition: any): Composition {
    const compStr = composition?.toString().toUpperCase();
    switch (compStr) {
      case 'FLESH': return Composition.FLESH;
      case 'EARTH': return Composition.EARTH;
      case 'AIR': return Composition.AIR;
      case 'FIRE': return Composition.FIRE;
      case 'WATER': return Composition.WATER;
      case 'ICE': return Composition.ICE;
      case 'MIST': return Composition.MIST;
      case 'ETHER': return Composition.ETHER;
      case 'METAL': return Composition.METAL;
      case 'STONE': return Composition.STONE;
      case 'BONE': return Composition.BONE;
      case 'LAVA': return Composition.LAVA;
      case 'PLANT': return Composition.PLANT;
      default: return Composition.FLESH;
    }
  }

  private mapStance(stance: any): Stance {
    const stanceStr = stance?.toString().toUpperCase();
    switch (stanceStr) {
      case 'DEAD': return Stance.DEAD;
      case 'MORT': return Stance.MORT;
      case 'INCAPACITATED': return Stance.INCAPACITATED;
      case 'STUNNED': return Stance.STUNNED;
      case 'SLEEPING': return Stance.SLEEPING;
      case 'RESTING': return Stance.RESTING;
      case 'ALERT': return Stance.ALERT;
      case 'FIGHTING': return Stance.FIGHTING;
      default: return Stance.ALERT;
    }
  }

  private mapDamageType(damageType: any): DamageType {
    const damageStr = damageType?.toString().toUpperCase();
    switch (damageStr) {
      case 'HIT': return DamageType.HIT;
      case 'STING': return DamageType.STING;
      case 'WHIP': return DamageType.WHIP;
      case 'SLASH': return DamageType.SLASH;
      case 'BITE': return DamageType.BITE;
      case 'BLUDGEON': return DamageType.BLUDGEON;
      case 'CRUSH': return DamageType.CRUSH;
      case 'POUND': return DamageType.POUND;
      case 'CLAW': return DamageType.CLAW;
      case 'MAUL': return DamageType.MAUL;
      case 'THRASH': return DamageType.THRASH;
      case 'PIERCE': return DamageType.PIERCE;
      case 'BLAST': return DamageType.BLAST;
      case 'PUNCH': return DamageType.PUNCH;
      case 'STAB': return DamageType.STAB;
      case 'FIRE': return DamageType.FIRE;
      case 'COLD': return DamageType.COLD;
      case 'ACID': return DamageType.ACID;
      case 'SHOCK': return DamageType.SHOCK;
      case 'POISON': return DamageType.POISON;
      case 'ALIGN': return DamageType.ALIGN;
      default: return DamageType.HIT;
    }
  }
}