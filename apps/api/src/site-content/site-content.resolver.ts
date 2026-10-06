import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SiteContentKind, UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { SiteContentDto } from './site-content.dto';
import {
  CreateSiteContentInput,
  UpdateSiteContentInput,
} from './site-content.input';
import { SiteContentService } from './site-content.service';

@Resolver(() => SiteContentDto)
export class SiteContentResolver {
  constructor(private readonly siteContentService: SiteContentService) {}

  // Queries - public. Anonymous callers only ever see published content.

  @Query(() => [SiteContentDto], {
    name: 'siteContents',
    description:
      'List site content. Anonymous callers only get published rows; BUILDER+ may pass publishedOnly=false to include drafts',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Args('kind', { type: () => SiteContentKind, nullable: true })
    kind?: SiteContentKind,
    @Args('publishedOnly', {
      type: () => Boolean,
      nullable: true,
      defaultValue: true,
    })
    publishedOnly?: boolean,
    @CurrentUser() user?: Users | null
  ) {
    return this.siteContentService.findAll(
      kind ?? undefined,
      publishedOnly ?? true,
      user
    );
  }

  @Query(() => SiteContentDto, {
    name: 'siteContent',
    description: 'Get a single piece of site content by slug',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('slug') slug: string,
    @CurrentUser() user?: Users | null
  ) {
    return this.siteContentService.findBySlug(slug, user);
  }

  // Mutations - BUILDER+

  @Mutation(() => SiteContentDto, { description: 'Create site content' })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.BUILDER)
  async createSiteContent(
    @Args('data') data: CreateSiteContentInput,
    @CurrentUser() user: Users
  ) {
    return this.siteContentService.create(data, user.id);
  }

  @Mutation(() => SiteContentDto, { description: 'Update site content' })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.BUILDER)
  async updateSiteContent(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateSiteContentInput
  ) {
    return this.siteContentService.update(id, data);
  }

  @Mutation(() => Boolean, { description: 'Delete site content' })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.BUILDER)
  async deleteSiteContent(@Args('id', { type: () => ID }) id: string) {
    await this.siteContentService.remove(id);
    return true;
  }
}
