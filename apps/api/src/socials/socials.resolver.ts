import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { SocialDto } from './social.dto';
import { CreateSocialInput, UpdateSocialInput } from './social.input';
import { SocialsService } from './socials.service';

@Resolver(() => SocialDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class SocialsResolver {
  constructor(private readonly socialsService: SocialsService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [SocialDto], {
    name: 'socials',
    description: 'Get all social commands',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.socialsService.findAll();
  }

  @Query(() => SocialDto, {
    name: 'social',
    description: 'Get a single social by ID',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.socialsService.findOne(Number(id));
  }

  @Query(() => SocialDto, {
    name: 'socialByName',
    description: 'Get a social by its command name',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findByName(@Args('name') name: string) {
    return this.socialsService.findByName(name);
  }

  @Query(() => Int, {
    name: 'socialsCount',
    description: 'Get total count of socials',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async count() {
    return this.socialsService.count();
  }

  @Query(() => [SocialDto], {
    name: 'searchSocials',
    description: 'Search socials by name pattern',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async search(@Args('query') query: string) {
    return this.socialsService.search(query);
  }

  // Mutations - GOD only (system-level changes)

  @Mutation(() => SocialDto, {
    description: 'Create a new social command',
  })
  @MinimumRole(UserRole.GOD)
  async createSocial(@Args('data') data: CreateSocialInput) {
    return this.socialsService.create(data);
  }

  @Mutation(() => SocialDto, {
    description: 'Update an existing social command',
  })
  @MinimumRole(UserRole.GOD)
  async updateSocial(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateSocialInput
  ) {
    return this.socialsService.update(Number(id), data);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a social command',
  })
  @MinimumRole(UserRole.GOD)
  async deleteSocial(@Args('id', { type: () => ID }) id: string | number) {
    await this.socialsService.remove(Number(id));
    return true;
  }
}
