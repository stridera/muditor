import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { CreationRecipeDto } from './creation-recipe.dto';
import {
  CreateCreationRecipeInput,
  UpdateCreationRecipeInput,
} from './creation-recipe.input';
import { CreationRecipesService } from './creation-recipes.service';

@Resolver(() => CreationRecipeDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class CreationRecipesResolver {
  constructor(private readonly service: CreationRecipesService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [CreationRecipeDto], {
    name: 'creationRecipes',
    description: 'Get all creation recipes, grouped by ability',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  @Query(() => CreationRecipeDto, {
    name: 'creationRecipe',
    description: 'Get a single creation recipe by ID',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.service.findOne(Number(id));
  }

  // Mutations - BUILDER+ (world-content catalog)

  @Mutation(() => CreationRecipeDto, {
    description: 'Create a creation recipe',
  })
  @MinimumRole(UserRole.BUILDER)
  async createCreationRecipe(@Args('data') data: CreateCreationRecipeInput) {
    return this.service.create(data);
  }

  @Mutation(() => CreationRecipeDto, {
    description: 'Update a creation recipe',
  })
  @MinimumRole(UserRole.BUILDER)
  async updateCreationRecipe(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateCreationRecipeInput
  ) {
    return this.service.update(Number(id), data);
  }

  @Mutation(() => Boolean, { description: 'Delete a creation recipe' })
  @MinimumRole(UserRole.BUILDER)
  async deleteCreationRecipe(
    @Args('id', { type: () => ID }) id: string | number
  ) {
    await this.service.remove(Number(id));
    return true;
  }
}
