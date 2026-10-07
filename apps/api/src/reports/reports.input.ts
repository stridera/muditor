import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ReportStatus, ReportType } from '@muditor/db';

export enum ReportSort {
  RANK = 'RANK',
  NEWEST = 'NEWEST',
}

registerEnumType(ReportSort, {
  name: 'ReportSort',
  description: 'Sort order for the reports list',
});

@InputType()
export class ReportFilterInput {
  @Field(() => [ReportStatus], {
    nullable: true,
    description: 'Only these statuses (default: all)',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReportStatus, { each: true })
  status?: ReportStatus[];

  @Field(() => ReportType, { nullable: true })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @Field(() => Int, {
    nullable: true,
    description: 'Zone of the room the report was filed in',
  })
  @IsOptional()
  @IsInt()
  zoneId?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Matches message or reporter name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}

@InputType()
export class UpdateReportInput {
  @Field(() => ReportStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @Field(() => Int, {
    nullable: true,
    description: '0..3 sets the priority override; -1 clears it',
  })
  @IsOptional()
  @IsInt()
  @Min(-1)
  @Max(3)
  priority?: number;

  @Field(() => String, { nullable: true, description: 'Resolution note' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  resolution?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Empty string clears the assignment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assignedTo?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}
