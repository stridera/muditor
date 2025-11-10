import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { ClassDto, ClassSkillDto, ClassCircleDto } from './classes.dto';
import {
  CreateClassInput,
  UpdateClassInput,
  AssignSkillToClassInput,
  UpdateClassSkillInput,
  CreateClassCircleInput,
  UpdateClassCircleInput,
} from './classes.input';
import { ClassesService } from './classes.service';

@Resolver(() => ClassDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class ClassesResolver {
  constructor(private readonly classesService: ClassesService) {}

  // Class Queries - IMMORTAL+ can view
  @Query(() => [ClassDto], { name: 'classes' })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ) {
    return this.classesService.findAll(skip, take);
  }

  @Query(() => ClassDto, { name: 'class' })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.classesService.findOne(Number(id));
  }

  @Query(() => ClassDto, { name: 'classByName', nullable: true })
  @MinimumRole(UserRole.IMMORTAL)
  async findByName(@Args('name') name: string) {
    return this.classesService.findByName(name);
  }

  @Query(() => Int, { name: 'classesCount' })
  @MinimumRole(UserRole.IMMORTAL)
  async count() {
    return this.classesService.count();
  }

  // Class Mutations - CODER can create (requires FieryMUD code changes)
  @Mutation(() => ClassDto)
  @MinimumRole(UserRole.CODER)
  async createClass(@Args('data') data: CreateClassInput) {
    return this.classesService.create(data);
  }

  // HEAD_BUILDER can edit existing
  @Mutation(() => ClassDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateClass(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateClassInput
  ) {
    return this.classesService.update(Number(id), data);
  }

  // HEAD_BUILDER can delete
  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async deleteClass(@Args('id', { type: () => ID }) id: string | number) {
    await this.classesService.remove(Number(id));
    return true;
  }

  // Class Skill Queries
  @Query(() => [ClassSkillDto], {
    name: 'classSkills',
    description: 'Get all skills for a class',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async getClassSkills(@Args('classId', { type: () => Int }) classId: number) {
    return this.classesService.getClassSkills(classId);
  }

  // Class Skill Mutations - HEAD_BUILDER can manage associations
  @Mutation(() => ClassSkillDto, {
    description: 'Assign a skill to a class',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async assignSkillToClass(@Args('data') data: AssignSkillToClassInput) {
    return this.classesService.assignSkillToClass(data);
  }

  @Mutation(() => ClassSkillDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateClassSkill(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateClassSkillInput
  ) {
    return this.classesService.updateClassSkill(Number(id), data);
  }

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeClassSkill(@Args('id', { type: () => ID }) id: string | number) {
    await this.classesService.removeClassSkill(Number(id));
    return true;
  }

  // Class Circle Queries
  @Query(() => [ClassCircleDto], {
    name: 'classCirclesList',
    description: 'Get all spell circles for a class',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async getClassCircles(@Args('classId', { type: () => Int }) classId: number) {
    return this.classesService.getClassCircles(classId);
  }

  // Class Circle Mutations - HEAD_BUILDER can manage circles
  @Mutation(() => ClassCircleDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async createClassCircle(@Args('data') data: CreateClassCircleInput) {
    return this.classesService.createClassCircle(data);
  }

  @Mutation(() => ClassCircleDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateClassCircle(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateClassCircleInput
  ) {
    return this.classesService.updateClassCircle(Number(id), data);
  }

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeClassCircle(@Args('id', { type: () => ID }) id: string | number) {
    await this.classesService.removeClassCircle(Number(id));
    return true;
  }
}
