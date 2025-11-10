import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Race } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  CreateRaceInput,
  UpdateRaceInput,
  AssignSkillToRaceInput,
  UpdateRaceSkillInput,
} from './races.input';

@Injectable()
export class RacesService {
  constructor(private readonly db: DatabaseService) {}

  // Race CRUD operations

  /**
   * Find all races
   */
  async findAll() {
    return this.db.races.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a single race by enum value
   */
  async findOne(race: Race) {
    const raceData = await this.db.races.findUnique({
      where: { race },
    });

    if (!raceData) {
      throw new NotFoundException(`Race ${race} not found`);
    }

    return raceData;
  }

  /**
   * Get total count of races
   */
  async count() {
    return this.db.races.count();
  }

  /**
   * Create a new race
   * Requires CODER role (enforced by resolver guard)
   */
  async create(data: CreateRaceInput) {
    // Check if race already exists
    const existing = await this.db.races.findUnique({
      where: { race: data.race },
    });

    if (existing) {
      throw new BadRequestException(`Race ${data.race} already exists`);
    }

    return this.db.races.create({
      data,
    });
  }

  /**
   * Update an existing race
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async update(race: Race, data: UpdateRaceInput) {
    await this.findOne(race); // Ensure race exists

    return this.db.races.update({
      where: { race },
      data,
    });
  }

  /**
   * Delete a race
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async remove(race: Race) {
    await this.findOne(race); // Ensure race exists

    // Check for dependencies (characters, mobs)
    const [characterCount, mobCount] = await Promise.all([
      this.db.characters.count({ where: { race } }),
      this.db.mobs.count({ where: { race } }),
    ]);

    if (characterCount > 0 || mobCount > 0) {
      throw new BadRequestException(
        `Cannot delete race: it is used by ${characterCount} characters and ${mobCount} mobs`
      );
    }

    return this.db.races.delete({
      where: { race },
    });
  }

  // Race Skill operations

  /**
   * Get all abilities for a race
   */
  async getRaceSkills(race: Race) {
    const abilities = await this.db.raceAbilities.findMany({
      where: { race },
      include: {
        raceData: {
          select: {
            name: true,
          },
        },
        ability: {
          select: {
            name: true,
            abilityType: true,
          },
        },
      },
      orderBy: { abilityId: 'asc' },
    });

    return abilities.map((ability) => ({
      ...ability,
      raceName: ability.raceData.name,
      abilityName: ability.ability.name,
      abilityType: ability.ability.abilityType,
    }));
  }

  /**
   * Assign an ability to a race
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async assignSkillToRace(data: AssignSkillToRaceInput) {
    // Verify race exists
    await this.findOne(data.race);

    // Verify ability exists
    const ability = await this.db.ability.findUnique({
      where: { id: data.abilityId },
    });
    if (!ability) {
      throw new NotFoundException(`Ability ${data.abilityId} not found`);
    }

    // Check if assignment already exists
    const existing = await this.db.raceAbilities.findUnique({
      where: {
        race_abilityId: {
          race: data.race,
          abilityId: data.abilityId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ability ${data.abilityId} is already assigned to race ${data.race}`
      );
    }

    const raceAbility = await this.db.raceAbilities.create({
      data,
      include: {
        raceData: {
          select: {
            name: true,
          },
        },
        ability: {
          select: {
            name: true,
            abilityType: true,
          },
        },
      },
    });

    return {
      ...raceAbility,
      raceName: raceAbility.raceData.name,
      abilityName: raceAbility.ability.name,
      abilityType: raceAbility.ability.abilityType,
    };
  }

  /**
   * Update a race ability assignment
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async updateRaceSkill(id: number, data: UpdateRaceSkillInput) {
    const existing = await this.db.raceAbilities.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Race ability ${id} not found`);
    }

    const raceAbility = await this.db.raceAbilities.update({
      where: { id },
      data,
      include: {
        raceData: {
          select: {
            name: true,
          },
        },
        ability: {
          select: {
            name: true,
            abilityType: true,
          },
        },
      },
    });

    return {
      ...raceAbility,
      raceName: raceAbility.raceData.name,
      abilityName: raceAbility.ability.name,
      abilityType: raceAbility.ability.abilityType,
    };
  }

  /**
   * Remove a race ability assignment
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async removeRaceSkill(id: number) {
    const existing = await this.db.raceAbilities.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Race ability ${id} not found`);
    }

    return this.db.raceAbilities.delete({
      where: { id },
    });
  }
}
