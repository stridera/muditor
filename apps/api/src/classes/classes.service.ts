import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  AssignSkillToClassInput,
  CreateClassCircleInput,
  CreateClassInput,
  UpdateClassCircleInput,
  UpdateClassInput,
  UpdateClassSkillInput,
} from './classes.input';

@Injectable()
export class ClassesService {
  constructor(private readonly db: DatabaseService) {}

  // Class CRUD operations

  /**
   * Find all classes
   */
  async findAll(skip?: number, take?: number) {
    const args: Prisma.CharacterClassFindManyArgs = {
      orderBy: { name: 'asc' },
    };
    if (skip !== undefined) (args as any).skip = skip;
    if (take !== undefined) (args as any).take = take;
    return this.db.characterClass.findMany(args);
  }

  /**
   * Find a single class by ID
   */
  async findOne(id: number) {
    const characterClass = await this.db.characterClass.findUnique({
      where: { id },
    });

    if (!characterClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return characterClass;
  }

  /**
   * Find a class by name
   */
  async findByName(name: string) {
    return this.db.characterClass.findUnique({
      where: { name },
    });
  }

  /**
   * Get total count of classes
   */
  async count() {
    return this.db.characterClass.count();
  }

  /**
   * Create a new class
   * Requires CODER role (enforced by resolver guard)
   */
  async create(data: CreateClassInput) {
    // Check if class name already exists
    const existing = await this.findByName(data.name);
    if (existing) {
      throw new BadRequestException(
        `Class with name '${data.name}' already exists`
      );
    }

    const createData: Prisma.CharacterClassCreateInput = { name: data.name };
    if (data.description !== undefined)
      (createData as any).description = data.description;
    return this.db.characterClass.create({ data: createData });
  }

  /**
   * Update an existing class
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async update(id: number, data: UpdateClassInput) {
    await this.findOne(id); // Ensure class exists

    // If name is being changed, check for duplicates
    if (data.name) {
      const existing = await this.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Class with name '${data.name}' already exists`
        );
      }
    }

    const updateData: Prisma.CharacterClassUpdateInput = {};
    if (data.name !== undefined) (updateData as any).name = data.name;
    if (data.description !== undefined)
      (updateData as any).description = data.description;
    return this.db.characterClass.update({ where: { id }, data: updateData });
  }

  /**
   * Delete a class
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async remove(id: number) {
    await this.findOne(id); // Ensure class exists

    // Check for dependencies (characters, mobs)
    const [characterCount, mobCount] = await Promise.all([
      this.db.characters.count({ where: { classId: id } }),
      this.db.mobs.count({ where: { classId: id } }),
    ]);

    if (characterCount > 0 || mobCount > 0) {
      throw new BadRequestException(
        `Cannot delete class: it is used by ${characterCount} characters and ${mobCount} mobs`
      );
    }

    return this.db.characterClass.delete({
      where: { id },
    });
  }

  // Class Skill operations

  /**
   * Get all skills for a class
   */
  async getClassSkills(classId: number) {
    const skills = await this.db.classSkills.findMany({
      where: { classId },
      include: {
        characterClass: {
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

    return skills.map(skill => ({
      id: skill.id,
      classId: skill.classId,
      skillId: skill.abilityId,
      minLevel: skill.minLevel,
      maxLevel: undefined, // Not stored in ClassSkills model
      category: undefined, // Not stored in ClassSkills model
      className: skill.characterClass.name,
      skillName: skill.ability.name,
    }));
  }

  /**
   * Assign a skill to a class
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async assignSkillToClass(data: AssignSkillToClassInput) {
    // Verify class exists
    await this.findOne(data.classId);

    // Verify ability exists
    const ability = await this.db.ability.findUnique({
      where: { id: data.abilityId },
    });
    if (!ability) {
      throw new NotFoundException(`Ability ${data.abilityId} not found`);
    }

    // Check if assignment already exists
    const existing = await this.db.classSkills.findUnique({
      where: {
        classId_abilityId: {
          classId: data.classId,
          abilityId: data.abilityId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ability ${data.abilityId} is already assigned to class ${data.classId}`
      );
    }

    const classSkill = await this.db.classSkills.create({
      data,
      include: {
        characterClass: {
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
      ...classSkill,
      skillId: classSkill.abilityId,
      className: classSkill.characterClass.name,
      skillName: classSkill.ability.name,
      abilityType: classSkill.ability.abilityType,
    };
  }

  /**
   * Update a class skill assignment
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async updateClassSkill(id: number, data: UpdateClassSkillInput) {
    const existing = await this.db.classSkills.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Class skill ${id} not found`);
    }

    const classSkill = await this.db.classSkills.update({
      where: { id },
      data,
      include: {
        characterClass: {
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
      ...classSkill,
      skillId: classSkill.abilityId,
      className: classSkill.characterClass.name,
      skillName: classSkill.ability.name,
      abilityType: classSkill.ability.abilityType,
    };
  }

  /**
   * Remove a class skill assignment
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async removeClassSkill(id: number) {
    const existing = await this.db.classSkills.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Class skill ${id} not found`);
    }

    return this.db.classSkills.delete({
      where: { id },
    });
  }

  // Class Circle operations

  /**
   * Get all circles for a class
   */
  async getClassCircles(classId: number) {
    const circles = await this.db.classAbilityCircles.findMany({
      where: { classId },
      include: {
        characterClass: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { circle: 'asc' },
    });

    // Fetch abilities for each circle
    const circlesWithAbilities = await Promise.all(
      circles.map(async circle => {
        const abilities = await this.db.classAbilities.findMany({
          where: {
            classId: classId,
            circle: circle.circle,
          },
          include: {
            ability: {
              select: {
                id: true,
                name: true,
                abilityType: true,
              },
            },
          },
          orderBy: {
            ability: {
              name: 'asc',
            },
          },
        });

        return {
          ...circle,
          className: circle.characterClass.name,
          spells: abilities.map(a => ({
            id: a.id,
            spellId: a.abilityId,
            spellName: a.ability.name,
            minLevel: undefined, // Not stored in ClassAbilities model
            proficiencyGain: undefined, // Not stored in ClassAbilities model
          })),
        };
      })
    );

    return circlesWithAbilities;
  }

  /**
   * Create a class circle
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async createClassCircle(data: CreateClassCircleInput) {
    // Verify class exists
    await this.findOne(data.classId);

    // Check if circle already exists for this class
    const existing = await this.db.classAbilityCircles.findUnique({
      where: {
        classId_circle: {
          classId: data.classId,
          circle: data.circle,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Circle ${data.circle} already exists for class ${data.classId}`
      );
    }

    const circle = await this.db.classAbilityCircles.create({
      data,
      include: {
        characterClass: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...circle,
      className: circle.characterClass.name,
      spells: [], // New/updated circles start with no spells by default
    };
  }

  /**
   * Update a class circle
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async updateClassCircle(id: number, data: UpdateClassCircleInput) {
    const existing = await this.db.classAbilityCircles.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Class circle ${id} not found`);
    }

    const circle = await this.db.classAbilityCircles.update({
      where: { id },
      data,
      include: {
        characterClass: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...circle,
      className: circle.characterClass.name,
      spells: [], // New/updated circles start with no spells by default
    };
  }

  /**
   * Remove a class circle
   * Requires HEAD_BUILDER role (enforced by resolver guard)
   */
  async removeClassCircle(id: number) {
    const existing = await this.db.classAbilityCircles.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Class circle ${id} not found`);
    }

    return this.db.classAbilityCircles.delete({
      where: { id },
    });
  }
}
