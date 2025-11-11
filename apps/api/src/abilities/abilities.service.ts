import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateAbilityInput,
  UpdateAbilityInput,
  CreateAbilityTargetingInput,
  UpdateAbilityTargetingInput,
  CreateAbilitySavingThrowInput,
  CreateAbilityMessagesInput,
  UpdateAbilityMessagesInput,
} from './abilities.input';

@Injectable()
export class AbilitiesService {
  constructor(private prisma: DatabaseService) {}

  async findAll(skip?: number, take?: number, abilityType?: string, search?: string) {
    const where: any = {};

    if (abilityType) {
      where.abilityType = abilityType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { school: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const args: any = {
      where,
      include: {
        school: true,
        effects: { include: { effect: true } },
        targeting: true,
        restrictions: true,
        savingThrows: true,
        messages: true,
      },
      orderBy: { name: 'asc' },
    };
    if (skip !== undefined) args.skip = skip;
    if (take !== undefined) args.take = take;
    return this.prisma.ability.findMany(args);
  }

  async count(abilityType?: string, search?: string) {
    const where: any = {};

    if (abilityType) {
      where.abilityType = abilityType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { school: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.ability.count({ where });
  }

  async findOne(id: number) {
    return this.prisma.ability.findUnique({
      where: { id },
      include: {
        school: true,
        effects: {
          include: {
            effect: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        targeting: true,
        restrictions: true,
        savingThrows: true,
        messages: true,
      },
    });
  }

  async findByGameId(gameId: string) {
    return this.prisma.ability.findUnique({
      where: { gameId },
      include: {
        school: true,
        effects: {
          include: {
            effect: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        targeting: true,
        restrictions: true,
        savingThrows: true,
        messages: true,
      },
    });
  }

  async create(data: CreateAbilityInput) {
    const createData: any = {
      name: data.name,
      abilityType: data.abilityType,
      minPosition: data.minPosition,
      violent: data.violent,
      castTimeRounds: data.castTimeRounds,
      cooldownMs: data.cooldownMs,
      inCombatOnly: data.inCombatOnly,
      isArea: data.isArea,
    };
    if (data.description !== undefined) createData.description = data.description;
    if (data.gameId !== undefined) createData.gameId = data.gameId;
    if (data.schoolId !== undefined) createData.schoolId = data.schoolId;
    if (data.notes !== undefined) createData.notes = data.notes;
    if (data.tags !== undefined) createData.tags = data.tags;
    if (data.luaScript !== undefined) createData.luaScript = data.luaScript;

    return this.prisma.ability.create({
      data: createData,
      include: {
        school: true,
        effects: { include: { effect: true } },
        targeting: true,
        restrictions: true,
        savingThrows: true,
        messages: true,
      },
    });
  }

  async update(id: number, data: UpdateAbilityInput) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.gameId !== undefined) updateData.gameId = data.gameId;
    if (data.abilityType !== undefined) updateData.abilityType = data.abilityType;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
    if (data.minPosition !== undefined) updateData.minPosition = data.minPosition;
    if (data.violent !== undefined) updateData.violent = data.violent;
    if (data.castTimeRounds !== undefined) updateData.castTimeRounds = data.castTimeRounds;
    if (data.cooldownMs !== undefined) updateData.cooldownMs = data.cooldownMs;
    if (data.inCombatOnly !== undefined) updateData.inCombatOnly = data.inCombatOnly;
    if (data.isArea !== undefined) updateData.isArea = data.isArea;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.luaScript !== undefined) updateData.luaScript = data.luaScript;

    return this.prisma.ability.update({
      where: { id },
      data: updateData,
      include: {
        school: true,
        effects: { include: { effect: true } },
        targeting: true,
        restrictions: true,
        savingThrows: true,
        messages: true,
      },
    });
  }

  async delete(id: number) {
    await this.prisma.ability.delete({
      where: { id },
    });
    return true;
  }

  // Targeting methods
  async createTargeting(data: CreateAbilityTargetingInput) {
    return this.prisma.abilityTargeting.create({
      data,
    });
  }

  async updateTargeting(abilityId: number, data: UpdateAbilityTargetingInput) {
    return this.prisma.abilityTargeting.update({
      where: { abilityId },
      data,
    });
  }

  async deleteTargeting(abilityId: number) {
    await this.prisma.abilityTargeting.delete({
      where: { abilityId },
    });
    return true;
  }

  // Saving throw methods
  async createSavingThrow(data: CreateAbilitySavingThrowInput) {
    return this.prisma.abilitySavingThrow.create({
      data,
    });
  }

  async deleteSavingThrow(id: number) {
    await this.prisma.abilitySavingThrow.delete({
      where: { id },
    });
    return true;
  }

  // Messages methods
  async createMessages(data: CreateAbilityMessagesInput) {
    return this.prisma.abilityMessages.create({
      data,
    });
  }

  async updateMessages(abilityId: number, data: UpdateAbilityMessagesInput) {
    return this.prisma.abilityMessages.update({
      where: { abilityId },
      data,
    });
  }

  async deleteMessages(abilityId: number) {
    await this.prisma.abilityMessages.delete({
      where: { abilityId },
    });
    return true;
  }

  // Schools methods
  async findAllSchools() {
    return this.prisma.abilitySchool.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findSchool(id: number) {
    return this.prisma.abilitySchool.findUnique({
      where: { id },
    });
  }

  // Effects methods
  async findAllEffects(skip?: number, take?: number, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { effectType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const args: any = {
      where,
      orderBy: { effectType: 'asc' },
    };
    if (skip !== undefined) args.skip = skip;
    if (take !== undefined) args.take = take;
    return this.prisma.effect.findMany(args);
  }

  async countEffects(search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { effectType: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.effect.count({ where });
  }

  async findEffect(id: number) {
    return this.prisma.effect.findUnique({
      where: { id },
    });
  }
}
