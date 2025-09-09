import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ValidationService, ValidationReport } from './validation.service';
import {
  ValidationReportType,
  ValidationSummaryType,
  ValidationIssue,
} from './validation.types';

@Resolver()
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
