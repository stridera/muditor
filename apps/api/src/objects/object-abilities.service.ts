import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { DatabaseService } from '../database/database.service';
import { ObjectAbilityDto, ObjectAbilityInput } from './object-abilities.dto';

/** Object types whose spells live in `ObjectAbilities` (what the game reads). */
export const SPELL_ITEM_TYPES = ['POTION', 'SCROLL', 'WAND', 'STAFF'] as const;
/** Types that carry a per-slot charge count. */
const CHARGED_TYPES = ['WAND', 'STAFF'];
export const MAX_ITEM_SPELLS = 20;

@Injectable()
export class ObjectAbilitiesService {
  constructor(private readonly database: DatabaseService) {}

  async list(
    zoneId: number,
    id: number,
    hideGodZones = false
  ): Promise<ObjectAbilityDto[]> {
    const object = await this.database.objects.findFirst({
      where: { zoneId, id, ...inVisibleZone(hideGodZones) },
      select: { id: true },
    });
    if (!object) return [];
    return this.database.$transaction(tx => this.read(tx, zoneId, id));
  }

  /**
   * Replace the whole ordered spell list of an object. Row order is the
   * order the game fires the spells (it sorts by `id`), duplicates are
   * allowed (a potion may carry CURE_LIGHT twice). The legacy mirror keys in
   * `Objects.values` (Spells / Spell / Level / Max_Charges / Charges_Left,
   * which the importer writes and the game ignores) are rewritten in the same
   * transaction so the two never disagree.
   */
  async replace(
    zoneId: number,
    id: number,
    inputs: ObjectAbilityInput[]
  ): Promise<ObjectAbilityDto[]> {
    const object = await this.database.objects.findUnique({
      where: { zoneId_id: { zoneId, id } },
      select: { type: true, values: true },
    });
    if (!object) {
      throw new NotFoundException(`Object ${zoneId}:${id} does not exist`);
    }
    if (!(SPELL_ITEM_TYPES as readonly string[]).includes(object.type)) {
      throw new BadRequestException(
        `Only ${SPELL_ITEM_TYPES.join(', ')} objects carry spells (this one is ${object.type})`
      );
    }
    if (inputs.length > MAX_ITEM_SPELLS) {
      throw new BadRequestException(
        `At most ${MAX_ITEM_SPELLS} spells per object`
      );
    }
    // A list argument is not run through class-validator, so check here.
    inputs.forEach((input, i) => {
      const bad = (what: string) =>
        new BadRequestException(`Spell ${i + 1}: ${what}`);
      if (!Number.isInteger(input.abilityId))
        throw bad('abilityId must be a whole number');
      if (
        !Number.isInteger(input.level) ||
        input.level < 0 ||
        input.level > 1000
      )
        throw bad('level must be a whole number from 0 to 1000');
      if (
        input.charges !== undefined &&
        input.charges !== null &&
        (!Number.isInteger(input.charges) ||
          input.charges < 0 ||
          input.charges > 10_000)
      )
        throw bad('charges must be a whole number from 0 to 10000');
    });
    const charged = CHARGED_TYPES.includes(object.type);

    const abilityIds = [...new Set(inputs.map(i => i.abilityId))];
    const abilities = await this.database.ability.findMany({
      where: { id: { in: abilityIds } },
      select: { id: true, plainName: true },
    });
    const plainById = new Map(abilities.map(a => [a.id, a.plainName]));
    const unknown = abilityIds.filter(a => !plainById.has(a));
    if (unknown.length > 0) {
      throw new BadRequestException(
        `Unknown ability id${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`
      );
    }

    return this.database.$transaction(async tx => {
      await tx.objectAbilities.deleteMany({
        where: { objectZoneId: zoneId, objectId: id },
      });
      // Created one by one so ids ascend in list order.
      for (const input of inputs) {
        await tx.objectAbilities.create({
          data: {
            objectZoneId: zoneId,
            objectId: id,
            abilityId: input.abilityId,
            level: input.level,
            charges: charged ? (input.charges ?? null) : null,
          },
        });
      }

      const values: Record<string, unknown> = {
        ...((object.values as Record<string, unknown> | null) ?? {}),
      };
      const names = inputs.map(i => plainById.get(i.abilityId)!);
      if (charged) {
        if (names.length > 0) values['Spell'] = names[0];
        else delete values['Spell'];
        const charges = inputs[0]?.charges;
        if (charges !== undefined && charges !== null) {
          values['Max_Charges'] = charges;
          values['Charges_Left'] = charges;
        }
      } else {
        values['Spells'] = names;
      }
      if (inputs[0]) values['Level'] = inputs[0].level;
      await tx.objects.update({
        where: { zoneId_id: { zoneId, id } },
        data: { values: values as Prisma.InputJsonValue },
      });

      return this.read(tx, zoneId, id);
    });
  }

  private async read(
    db: Pick<Prisma.TransactionClient, 'objectAbilities'>,
    zoneId: number,
    id: number
  ): Promise<ObjectAbilityDto[]> {
    const rows = await db.objectAbilities.findMany({
      where: { objectZoneId: zoneId, objectId: id },
      orderBy: { id: 'asc' },
      include: { ability: { select: { name: true, plainName: true } } },
    });
    return rows.map(r => ({
      id: r.id,
      abilityId: r.abilityId,
      abilityName: r.ability.name,
      abilityPlainName: r.ability.plainName,
      level: r.level,
      ...(r.charges !== null && { charges: r.charges }),
    }));
  }
}
