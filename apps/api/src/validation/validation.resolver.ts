import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { ValidationService, type ValidationReport } from './validation.service';
import {
  ValidationReportType,
  ValidationSummaryType,
} from './validation.types';

// Each query scans whole zones, so it is login + BUILDER+ (never anonymous).
@Resolver()
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
@MinimumRole(UserRole.BUILDER)
export class ValidationResolver {
  constructor(private readonly validationService: ValidationService) {}

  @Query(() => ValidationReportType, {
    description: 'Get validation report for a specific zone',
  })
  async validateZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<ValidationReport> {
    return this.validationService.validateZone(zoneId);
  }

  @Query(() => [ValidationReportType], {
    description: 'Get validation reports for all zones',
  })
  async validateAllZones(): Promise<ValidationReport[]> {
    return this.validationService.validateAllZones();
  }

  @Query(() => ValidationSummaryType, {
    description: 'Get validation summary statistics',
  })
  async getValidationSummary() {
    return this.validationService.getValidationSummary();
  }
}
