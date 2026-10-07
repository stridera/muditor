import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { hidesGodZones } from '../common/god-zone-visibility';
import { EntityKeyInput } from '../common/dto/entity-key.input';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Prisma, Race, type Users } from '@muditor/db'; // all enums already registered in mob.dto
import { calculateMobCombatDefaults } from '../common/dice-formulas';
import { mapMob } from '../common/mappers/mob.mapper';
import {
  CreateMobInput,
  MobCombatDefaultsDto,
  MobDto,
  UpdateMobInput,
} from './mob.dto';
import { MobDefaultEffectInput } from './mob-effects.dto';
import { MobsService } from './mobs.service';

interface MobFieldSource {
  totalWealth?: number;
}

@Resolver(() => MobDto)
export class MobsResolver {
  constructor(private readonly mobsService: MobsService) {}

  // Mob reads are public. Mobs in god zones are hidden from anonymous
  // callers and mortal accounts; IMMORTAL+ still see them.
  @Query(() => [MobDto], { name: 'mobs' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @CurrentUser() user?: Users | null
  ): Promise<MobDto[]> {
    const params: {
      skip?: number;
      take?: number;
      search?: string;
      hideGodZones: boolean;
    } = { hideGodZones: hidesGodZones(user ?? null) };
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    if (search !== undefined) params.search = search;
    const mobs = await this.mobsService.findAll(params);
    return mobs.map(m => mapMob(m));
  }

  @Query(() => MobDto, { name: 'mob' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<MobDto | null> {
    const mob = await this.mobsService.findOne(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    );
    return mob ? mapMob(mob) : null;
  }

  @Query(() => [MobDto], { name: 'mobsByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @CurrentUser() user?: Users | null
  ): Promise<MobDto[]> {
    const mobs = await this.mobsService.findByZone(
      zoneId,
      search,
      hidesGodZones(user ?? null)
    );
    return mobs.map(m => mapMob(m));
  }

  @Query(() => Int, { name: 'mobsCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async count(@CurrentUser() user?: Users | null): Promise<number> {
    return this.mobsService.count(undefined, hidesGodZones(user ?? null));
  }

  @Query(() => [MobDto], { name: 'searchMobs' })
  @UseGuards(OptionalJwtAuthGuard)
  async searchMobs(
    @Args('search', { type: () => String }) search: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number,
    @CurrentUser() user?: Users | null
  ): Promise<MobDto[]> {
    const mobs = await this.mobsService.search(
      search,
      limit,
      zoneId,
      hidesGodZones(user ?? null)
    );
    return mobs.map(m => mapMob(m));
  }

  /**
   * Calculate default combat stats (HP dice, damage dice) for a mob
   * based on level, race, and optionally class.
   *
   * Uses legacy FieryMUD formulas for proper game balance.
   */
  @Query(() => MobCombatDefaultsDto, { name: 'mobCombatDefaults' })
  async getMobCombatDefaults(
    @Args('level', { type: () => Int, defaultValue: 1 }) level: number,
    @Args('race', { type: () => Race, defaultValue: Race.HUMANOID }) race: Race,
    @Args('classId', { type: () => Int, nullable: true }) classId?: number
  ): Promise<MobCombatDefaultsDto> {
    // Look up class name if classId provided
    let className: string | undefined;
    if (classId) {
      const charClass = await this.mobsService.findClassById(classId);
      if (charClass) {
        className = charClass.plainName;
      }
    }

    // Calculate defaults using legacy formulas
    return calculateMobCombatDefaults(level, race, className);
  }

  @Mutation(() => MobDto)
  @RequireZoneWrite()
  async createMob(@Args('data') data: CreateMobInput): Promise<MobDto> {
    // Exclude wealth from direct persistence; it's derived (totalWealth) in DB
    const { zoneId, race, hpDice, damageDice, wealth, classId, ...rest } = data;

    // Parse dice strings (e.g., "2d8+3" -> num=2, size=8, bonus=3)
    const parseDice = (diceStr: string) => {
      const match = /^(\d+)d(\d+)([+-]\d+)?$/.exec(diceStr);
      if (!match) return null;
      const numStr = match[1]!;
      const sizeStr = match[2]!;
      const bonusStr = match[3];
      return {
        num: parseInt(numStr, 10),
        size: parseInt(sizeStr, 10),
        bonus: bonusStr ? parseInt(bonusStr, 10) : 0,
      };
    };

    // Get class name for formula calculation if classId provided
    let className: string | undefined;
    if (classId) {
      const charClass = await this.mobsService.findClassById(classId);
      if (charClass) {
        className = charClass.plainName;
      }
    }

    // Calculate defaults using legacy formulas
    const level = rest.level ?? 1;
    const raceForCalc = race ?? Race.HUMANOID;
    const defaults = calculateMobCombatDefaults(level, raceForCalc, className);

    // Use provided dice or fall back to calculated defaults
    const hp = hpDice ? parseDice(hpDice) : null;
    const dmg = damageDice ? parseDice(damageDice) : null;

    const createData: Prisma.MobsCreateInput = {
      ...rest,
      role: rest.role ?? 'NORMAL', // Default mob role
      hpDiceNum: hp?.num ?? defaults.hpDiceNum,
      hpDiceSize: hp?.size ?? defaults.hpDiceSize,
      hpDiceBonus: hp?.bonus ?? defaults.hpDiceBonus,
      damageDiceNum: dmg?.num ?? defaults.damageDiceNum,
      damageDiceSize: dmg?.size ?? defaults.damageDiceSize,
      damageDiceBonus: dmg?.bonus ?? defaults.damageDiceBonus,
      zones: { connect: { id: zoneId } },
    };
    if (race) {
      createData.race = race as Race;
    }
    if (classId) {
      createData.characterClass = { connect: { id: classId } };
    }
    const created = await this.mobsService.create(createData);
    return mapMob(created);
  }

  @Mutation(() => MobDto)
  @RequireZoneWrite()
  async updateMob(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateMobInput
  ): Promise<MobDto> {
    const { race, ...rest } = data;
    const updateData: Prisma.MobsUpdateInput = { ...rest };
    if (race) {
      updateData.race = race as Race;
    }
    const updated = await this.mobsService.update(zoneId, id, updateData);
    return mapMob(updated);
  }

  @Mutation(() => MobDto)
  @RequireZoneWrite()
  async deleteMob(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<MobDto> {
    const deleted = await this.mobsService.delete(zoneId, id);
    return mapMob(deleted);
  }

  @Mutation(() => Int, { name: 'deleteMobs' })
  @RequireZoneWrite()
  async deleteMobs(
    @Args('keys', { type: () => [EntityKeyInput] }) keys: EntityKeyInput[]
  ): Promise<number> {
    return this.mobsService.deleteMany(keys);
  }

  // Note: hpDice and damageDice are computed directly in the mapper (mapMob)
  // from hpDiceNum/Size/Bonus and damageDiceNum/Size/Bonus fields.
  // Do NOT add @ResolveField decorators here as they would override
  // the correctly mapped values with fallback defaults.

  @ResolveField(() => Int, { nullable: true })
  wealth(@Parent() mob: MobFieldSource): number | null {
    // Map totalWealth from database to wealth in DTO
    return mob.totalWealth ?? null;
  }

  @Mutation(() => MobDto)
  @RequireZoneWrite()
  async updateMobDefaultEffects(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('effects', { type: () => [MobDefaultEffectInput] })
    effects: MobDefaultEffectInput[]
  ): Promise<MobDto> {
    const mob = await this.mobsService.updateMobDefaultEffects(
      zoneId,
      id,
      effects
    );
    return mapMob(mob!);
  }
}
