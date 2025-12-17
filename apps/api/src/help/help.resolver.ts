import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { HelpEntryDto } from './help.dto';
import {
  CreateHelpEntryInput,
  UpdateHelpEntryInput,
  HelpEntryFilterInput,
} from './help.input';
import { HelpService } from './help.service';

@Resolver(() => HelpEntryDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class HelpResolver {
  constructor(private readonly helpService: HelpService) {}

  // Queries - PLAYER+ can view help entries (read-only access for all users)

  @Query(() => [HelpEntryDto], {
    name: 'helpEntries',
    description: 'Get all help entries with optional filtering',
  })
  @MinimumRole(UserRole.PLAYER)
  async findAll(
    @Args('filter', { nullable: true }) filter?: HelpEntryFilterInput
  ) {
    return this.helpService.findAll(filter);
  }

  @Query(() => HelpEntryDto, {
    name: 'helpEntry',
    description: 'Get a single help entry by ID',
  })
  @MinimumRole(UserRole.PLAYER)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.helpService.findOne(Number(id));
  }

  @Query(() => HelpEntryDto, {
    name: 'helpByKeyword',
    description: 'Get a help entry by keyword',
  })
  @MinimumRole(UserRole.PLAYER)
  async findByKeyword(@Args('keyword') keyword: string) {
    return this.helpService.findByKeyword(keyword);
  }

  @Query(() => Int, {
    name: 'helpEntriesCount',
    description: 'Get total count of help entries',
  })
  @MinimumRole(UserRole.PLAYER)
  async count(
    @Args('filter', { nullable: true }) filter?: HelpEntryFilterInput
  ) {
    return this.helpService.count(filter);
  }

  @Query(() => [String], {
    name: 'helpCategories',
    description: 'Get all distinct help entry categories',
  })
  @MinimumRole(UserRole.PLAYER)
  async getCategories() {
    return this.helpService.getCategories();
  }

  @Query(() => [HelpEntryDto], {
    name: 'searchHelp',
    description: 'Search help entries by keyword, title, or content',
  })
  @MinimumRole(UserRole.PLAYER)
  async search(
    @Args('query') query: string,
    @Args('filter', { nullable: true }) filter?: HelpEntryFilterInput
  ) {
    return this.helpService.search(query, filter);
  }

  // Mutations - BUILDER+ can create/update, GOD can delete

  @Mutation(() => HelpEntryDto, {
    description: 'Create a new help entry',
  })
  @MinimumRole(UserRole.BUILDER)
  async createHelpEntry(@Args('data') data: CreateHelpEntryInput) {
    return this.helpService.create(data);
  }

  @Mutation(() => HelpEntryDto, {
    description: 'Update an existing help entry',
  })
  @MinimumRole(UserRole.BUILDER)
  async updateHelpEntry(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateHelpEntryInput
  ) {
    return this.helpService.update(Number(id), data);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a help entry',
  })
  @MinimumRole(UserRole.GOD)
  async deleteHelpEntry(@Args('id', { type: () => ID }) id: string | number) {
    await this.helpService.remove(Number(id));
    return true;
  }
}
