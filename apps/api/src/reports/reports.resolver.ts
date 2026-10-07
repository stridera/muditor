import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { ReportDto, ReportPageDto } from './reports.dto';
import {
  ReportFilterInput,
  ReportSort,
  UpdateReportInput,
} from './reports.input';
import { ReportsService } from './reports.service';

/**
 * Player reports. Role split (kept simple): IMMORTAL+ may read; every mutation
 * (status, priority, resolution, duplicate marking) needs HEAD_BUILDER+, for all
 * report types including BUG.
 */
@Resolver(() => ReportDto)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => ReportPageDto, {
    name: 'reports',
    description: 'List player reports with computed rank and score',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.IMMORTAL)
  async reports(
    @Args('filter', { type: () => ReportFilterInput, nullable: true })
    filter?: ReportFilterInput,
    @Args('sort', {
      type: () => ReportSort,
      nullable: true,
      defaultValue: ReportSort.RANK,
    })
    sort?: ReportSort,
    @Args('take', { type: () => Int, defaultValue: 50 }) take?: number,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip?: number
  ) {
    return this.reportsService.findAll(
      filter,
      sort ?? ReportSort.RANK,
      Math.min(Math.max(take ?? 50, 1), 200),
      Math.max(skip ?? 0, 0)
    );
  }

  @Query(() => ReportDto, { name: 'report', description: 'A single report' })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.IMMORTAL)
  async report(@Args('id', { type: () => ID }) id: string) {
    return this.reportsService.findOne(Number(id));
  }

  @Query(() => Int, {
    name: 'reportOpenCount',
    description: 'Reports that are OPEN or IN_PROGRESS (nav badge)',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.IMMORTAL)
  async reportOpenCount() {
    return this.reportsService.openCount();
  }

  @Mutation(() => ReportDto, {
    description: 'Update status, priority, resolution note, assignee or tags',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateReportInput,
    @CurrentUser() user: Users
  ) {
    return this.reportsService.update(Number(id), data, user.displayName);
  }

  @Mutation(() => ReportDto, {
    description: 'Mark a report as a duplicate of another report',
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async markDuplicate(
    @Args('id', { type: () => ID }) id: string,
    @Args('ofId', { type: () => ID }) ofId: string,
    @CurrentUser() user: Users
  ) {
    return this.reportsService.markDuplicate(
      Number(id),
      Number(ofId),
      user.displayName
    );
  }
}
