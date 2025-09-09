import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum ValidationIssueTypeEnum {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum ValidationCategory {
  INTEGRITY = 'integrity',
  QUALITY = 'quality',
  CONSISTENCY = 'consistency',
}

export enum ValidationEntity {
  ZONE = 'zone',
  ROOM = 'room',
  MOB = 'mob',
  OBJECT = 'object',
  SHOP = 'shop',
}

export enum ValidationSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

registerEnumType(ValidationIssueTypeEnum, {
  name: 'ValidationIssueType',
  description: 'The type of validation issue',
});

registerEnumType(ValidationCategory, {
  name: 'ValidationCategory',
  description: 'The category of validation issue',
});

registerEnumType(ValidationEntity, {
  name: 'ValidationEntity',
  description: 'The type of entity being validated',
});

registerEnumType(ValidationSeverity, {
  name: 'ValidationSeverity',
  description: 'The severity level of the validation issue',
});

@ObjectType()
export class ValidationIssue {
  @Field(() => String)
  id: string;

  @Field(() => ValidationIssueTypeEnum)
  type: ValidationIssueTypeEnum;

  @Field(() => ValidationCategory)
  category: ValidationCategory;

  @Field(() => ValidationEntity)
  entity: ValidationEntity;

  @Field(() => Int)
  entityId: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  suggestion?: string;

  @Field(() => ValidationSeverity)
  severity: ValidationSeverity;
}

@ObjectType()
export class ValidationReportType {
  @Field(() => Int)
  zoneId: number;

  @Field(() => String)
  zoneName: string;

  @Field(() => Int)
  totalIssues: number;

  @Field(() => Int)
  errorCount: number;

  @Field(() => Int)
  warningCount: number;

  @Field(() => Int)
  infoCount: number;

  @Field(() => [ValidationIssue])
  issues: ValidationIssue[];

  @Field(() => Date)
  generatedAt: Date;
}

@ObjectType()
export class ValidationSummaryType {
  @Field(() => Int)
  totalZones: number;

  @Field(() => Int)
  zonesWithIssues: number;

  @Field(() => Int)
  totalIssues: number;

  @Field(() => Int)
  errorCount: number;

  @Field(() => Int)
  warningCount: number;

  @Field(() => Int)
  infoCount: number;
}
