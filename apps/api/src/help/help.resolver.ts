import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { HelpEntryDto } from './help.dto';
import {
  CreateHelpEntryInput,
  UpdateHelpEntryInput,
  HelpEntryFilterInput,
} from './help.input';
import { HelpService } from './help.service';

@Resolver(() => HelpEntryDto)
export class HelpResolver {
  constructor(private readonly helpService: HelpService) {}

  // Queries - public (anonymous allowed). Anonymous/PLAYER callers only see
  // minLevel < 100; staff (IMMORTAL+) see everything.

  @Query(() => [HelpEntryDto], {
    name: 'helpEntries',
    description: 'Get all help entries with optional filtering',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Args('filter', { nullable: true }) filter?: HelpEntryFilterInput,
    @CurrentUser() user?: Users | null
  ) {
    return this.helpService.findAll(filter, user);
  }

  @Query(() => HelpEntryDto, {
    name: 'helpEntry',
    description: 'Get a single help entry by ID',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('id', { type: () => ID }) id: string | number,
    @CurrentUser() user?: Users | null
  ) {
    return this.helpService.findOne(Number(id), user);
  }

  @Query(() => HelpEntryDto, {
    name: 'helpByKeyword',
    description: 'Get a help entry by keyword',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findByKeyword(
    @Args('keyword') keyword: string,
    @CurrentUser() user?: Users | null
  ) {
    return this.helpService.findByKeyword(keyword, user);
  }

  @Query(() => Int, {
    name: 'helpEntriesCount',
    description: 'Get total count of help entries',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async count(
    @Args('filter', { nullable: true }) filter?: HelpEntryFilterInput,
    @CurrentUser() user?: Users | null
  ) {
    return this.helpService.count(filter, user);
  }

  @Query(() => [String], {
    name: 'helpCategories',
    description: 'Get all distinct help entry categories',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async getCategories(@CurrentUser() user?: Users | null) {
    return this.helpService.getCategories(user);
  }

  @Query(() => [HelpEntryDto], {
    name: 'searchHelp',
    description: 'Search help entries by keyword, title, or content',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async search(
    @Args('query') query: string,
    @Args('filter', { nullable: true }) filter?: HelpEntryFilterInput,
    @CurrentUser() user?: Users | null
  ) {
    return this.helpService.search(query, filter, user);
  }

  // Mutations - BUILDER+ can create/update, CODER+ can delete

  @Mutation(() => HelpEntryDto, {
    description: 'Create a new help entry',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.BUILDER)
  async createHelpEntry(@Args('data') data: CreateHelpEntryInput) {
    return this.helpService.create(data);
  }

  @Mutation(() => HelpEntryDto, {
    description: 'Update an existing help entry',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
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
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async deleteHelpEntry(@Args('id', { type: () => ID }) id: string | number) {
    await this.helpService.remove(Number(id));
    return true;
  }
}
