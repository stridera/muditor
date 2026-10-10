import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import {
  PRIORITY_STEP,
  RULE_LIMITS,
  assertIntInRange,
  normalizeTarget,
  storedConditionKeys,
  validateConditions,
} from './mob-ai-rules';
import type {
  CreateClassAiRuleInput,
  MobAiRuleDto,
  SaveMobAiRuleInput,
  UpdateClassAiRuleInput,
} from './mob-ai.dto';

const ABILITY_SELECT = { id: true, name: true, abilityType: true } as const;
const WITH_ABILITY = { ability: { select: ABILITY_SELECT } } as const;

/** Conditions as Prisma wants them: SQL NULL for "no conditions". */
function jsonOrNull(
  v: Record<string, unknown> | null
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return v === null ? Prisma.DbNull : (v as Prisma.InputJsonValue);
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { code?: unknown }).code === 'P2002'
  );
}

/** Reject an `orderedIds` list that is not exactly a permutation of `existing`. */
function assertPermutation(
  label: string,
  existing: number[],
  ordered: number[]
): void {
  const dupes = ordered.length !== new Set(ordered).size;
  const same =
    ordered.length === existing.length &&
    ordered.every(id => existing.includes(id));
  if (dupes || !same) {
    throw new BadRequestException(
      `${label} must list every existing rule exactly once (expected ${existing.length}, got ${ordered.length}). Reload and try again.`
    );
  }
}

type MobRuleRow = Prisma.MobAbilitiesGetPayload<{
  include: { ability: { select: typeof ABILITY_SELECT } };
}>;

/** MobAbilities row -> API shape (`known` is exposed as `enabled`). */
function toMobRule(row: MobRuleRow): MobAiRuleDto {
  return {
    id: row.id,
    mobZoneId: row.mobZoneId,
    mobId: row.mobId,
    abilityId: row.abilityId,
    ability: row.ability,
    priority: row.priority,
    chancePct: row.chancePct,
    cooldownS: row.cooldownS,
    conditions: row.conditions,
    target: row.target,
    enabled: row.known,
  };
}

@Injectable()
export class MobAiService {
  constructor(private readonly db: DatabaseService) {}

  // ---------------------------------------------------------------- shared

  private async assertAbility(abilityId: number): Promise<void> {
    const found = await this.db.ability.findUnique({
      where: { id: abilityId },
      select: { id: true },
    });
    if (!found) {
      throw new BadRequestException(`Ability ${abilityId} does not exist`);
    }
  }

  // ----------------------------------------------------------- class rules

  async listClassRules(classId: number) {
    return this.db.classAiRules.findMany({
      where: { classId },
      include: WITH_ABILITY,
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    });
  }

  async createClassRule(data: CreateClassAiRuleInput) {
    const klass = await this.db.characterClass.findUnique({
      where: { id: data.classId },
      select: { id: true },
    });
    if (!klass) {
      throw new BadRequestException(`Class ${data.classId} does not exist`);
    }
    await this.assertAbility(data.abilityId);

    let priority = data.priority;
    if (priority === undefined || priority === null) {
      const { _max } = await this.db.classAiRules.aggregate({
        where: { classId: data.classId },
        _max: { priority: true },
      });
      priority = Math.min(
        (_max.priority ?? 0) + PRIORITY_STEP,
        RULE_LIMITS.priority.max
      );
    }
    assertIntInRange('priority', priority, RULE_LIMITS.priority);
    assertIntInRange('chancePct', data.chancePct, RULE_LIMITS.chancePct);
    assertIntInRange('cooldownS', data.cooldownS, RULE_LIMITS.cooldownS);
    if (data.minLevel != null) {
      assertIntInRange('minLevel', data.minLevel, RULE_LIMITS.minLevel);
    }
    const conditions = validateConditions(data.conditions);
    const target = normalizeTarget(data.target);

    try {
      return await this.db.classAiRules.create({
        data: {
          classId: data.classId,
          abilityId: data.abilityId,
          priority,
          chancePct: data.chancePct,
          cooldownS: data.cooldownS,
          conditions: jsonOrNull(conditions),
          target,
          minLevel: data.minLevel ?? null,
          enabled: data.enabled,
        },
        include: WITH_ABILITY,
      });
    } catch (e) {
      throw this.mapClassUnique(e, priority);
    }
  }

  async updateClassRule(id: number, data: UpdateClassAiRuleInput) {
    const current = await this.db.classAiRules.findUnique({ where: { id } });
    if (!current) throw new NotFoundException(`Class AI rule ${id} not found`);

    const patch: Prisma.ClassAiRulesUncheckedUpdateInput = {};
    if (data.abilityId != null && data.abilityId !== current.abilityId) {
      await this.assertAbility(data.abilityId);
      patch.abilityId = data.abilityId;
    }
    if (data.priority != null) {
      patch.priority = assertIntInRange(
        'priority',
        data.priority,
        RULE_LIMITS.priority
      );
    }
    if (data.chancePct != null) {
      patch.chancePct = assertIntInRange(
        'chancePct',
        data.chancePct,
        RULE_LIMITS.chancePct
      );
    }
    if (data.cooldownS != null) {
      patch.cooldownS = assertIntInRange(
        'cooldownS',
        data.cooldownS,
        RULE_LIMITS.cooldownS
      );
    }
    if (data.conditions !== undefined) {
      // Keys already on the rule are kept even if this API does not know them.
      patch.conditions = jsonOrNull(
        validateConditions(
          data.conditions,
          storedConditionKeys(current.conditions)
        )
      );
    }
    if (data.target != null) patch.target = normalizeTarget(data.target);
    if (data.minLevel !== undefined) {
      patch.minLevel =
        data.minLevel === null
          ? null
          : assertIntInRange('minLevel', data.minLevel, RULE_LIMITS.minLevel);
    }
    if (data.enabled != null) patch.enabled = data.enabled;

    try {
      return await this.db.classAiRules.update({
        where: { id },
        data: patch,
        include: WITH_ABILITY,
      });
    } catch (e) {
      throw this.mapClassUnique(e, data.priority ?? current.priority);
    }
  }

  async deleteClassRule(id: number): Promise<void> {
    const found = await this.db.classAiRules.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) throw new NotFoundException(`Class AI rule ${id} not found`);
    await this.db.classAiRules.delete({ where: { id } });
  }

  /**
   * Renumber a class's rules to 10, 20, 30... in the given order. Two passes
   * (parking priorities below zero) so the (class, ability, priority) unique
   * index never sees a transient duplicate.
   */
  async reorderClassRules(classId: number, ruleIds: number[]) {
    const rows = await this.db.classAiRules.findMany({
      where: { classId },
      select: { id: true },
    });
    assertPermutation(
      'ruleIds',
      rows.map(r => r.id),
      ruleIds
    );
    await this.db.$transaction(async tx => {
      for (const [i, id] of ruleIds.entries()) {
        await tx.classAiRules.update({
          where: { id },
          data: { priority: -(i + 1) },
        });
      }
      for (const [i, id] of ruleIds.entries()) {
        await tx.classAiRules.update({
          where: { id },
          data: { priority: (i + 1) * PRIORITY_STEP },
        });
      }
    });
    return this.listClassRules(classId);
  }

  private mapClassUnique(e: unknown, priority: number): unknown {
    if (isUniqueViolation(e)) {
      return new BadRequestException(
        `This class already has a rule for that ability at priority ${priority}`
      );
    }
    return e;
  }

  // ------------------------------------------------------------- mob rules

  async listMobRules(zoneId: number, mobId: number): Promise<MobAiRuleDto[]> {
    const rows = await this.db.mobAbilities.findMany({
      where: { mobZoneId: zoneId, mobId },
      include: WITH_ABILITY,
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toMobRule);
  }

  /**
   * Create or update the rule for (mob, ability). Updates are partial and
   * validate `conditions` against the keys already stored on the row.
   */
  async saveMobRule(
    zoneId: number,
    mobId: number,
    data: SaveMobAiRuleInput
  ): Promise<MobAiRuleDto> {
    const mob = await this.db.mobs.findUnique({
      where: { zoneId_id: { zoneId, id: mobId } },
      select: { id: true },
    });
    if (!mob) {
      throw new NotFoundException(`Mob ${mobId} not found in zone ${zoneId}`);
    }
    await this.assertAbility(data.abilityId);

    const existing = await this.db.mobAbilities.findUnique({
      where: {
        mobZoneId_mobId_abilityId: {
          mobZoneId: zoneId,
          mobId,
          abilityId: data.abilityId,
        },
      },
    });

    const fields: Prisma.MobAbilitiesUncheckedUpdateInput = {};
    if (data.priority != null) {
      fields.priority = assertIntInRange(
        'priority',
        data.priority,
        RULE_LIMITS.priority
      );
    }
    if (data.chancePct != null) {
      fields.chancePct = assertIntInRange(
        'chancePct',
        data.chancePct,
        RULE_LIMITS.chancePct
      );
    }
    if (data.cooldownS != null) {
      fields.cooldownS = assertIntInRange(
        'cooldownS',
        data.cooldownS,
        RULE_LIMITS.cooldownS
      );
    }
    if (data.conditions !== undefined) {
      fields.conditions = jsonOrNull(
        validateConditions(
          data.conditions,
          storedConditionKeys(existing?.conditions)
        )
      );
    }
    if (data.target != null) {
      const target = normalizeTarget(data.target);
      fields.target = target === 'AUTO' ? null : target; // null = AUTO
    }
    if (data.enabled != null) fields.known = data.enabled;

    if (existing) {
      return toMobRule(
        await this.db.mobAbilities.update({
          where: { id: existing.id },
          data: fields,
          include: WITH_ABILITY,
        })
      );
    }
    if (data.priority == null) {
      const { _max } = await this.db.mobAbilities.aggregate({
        where: { mobZoneId: zoneId, mobId },
        _max: { priority: true },
      });
      fields.priority = Math.min(
        (_max.priority ?? 0) + PRIORITY_STEP,
        RULE_LIMITS.priority.max
      );
    }
    return toMobRule(
      await this.db.mobAbilities.create({
        data: {
          ...(fields as Prisma.MobAbilitiesUncheckedCreateInput),
          mobZoneId: zoneId,
          mobId,
          abilityId: data.abilityId,
        },
        include: WITH_ABILITY,
      })
    );
  }

  async deleteMobRule(
    zoneId: number,
    mobId: number,
    abilityId: number
  ): Promise<void> {
    const result = await this.db.mobAbilities.deleteMany({
      where: { mobZoneId: zoneId, mobId, abilityId },
    });
    if (result.count === 0) {
      throw new NotFoundException(
        `Mob ${zoneId}:${mobId} has no rule for ability ${abilityId}`
      );
    }
  }

  /** Renumber a mob's rules to 10, 20, 30... in the order of `abilityIds`. */
  async reorderMobRules(
    zoneId: number,
    mobId: number,
    abilityIds: number[]
  ): Promise<MobAiRuleDto[]> {
    const rows = await this.db.mobAbilities.findMany({
      where: { mobZoneId: zoneId, mobId },
      select: { id: true, abilityId: true },
    });
    assertPermutation(
      'abilityIds',
      rows.map(r => r.abilityId),
      abilityIds
    );
    await this.db.$transaction(async tx => {
      for (const [i, abilityId] of abilityIds.entries()) {
        await tx.mobAbilities.updateMany({
          where: { mobZoneId: zoneId, mobId, abilityId },
          data: { priority: (i + 1) * PRIORITY_STEP },
        });
      }
    });
    return this.listMobRules(zoneId, mobId);
  }
}
