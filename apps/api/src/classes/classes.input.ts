import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

@InputType()
export class CreateClassInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ defaultValue: '1d8' })
  @IsString()
  hitDice: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  primaryStat?: string;
}

@InputType()
export class UpdateClassInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  hitDice?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  primaryStat?: string;

  /** Killer-class alignment bias for the kill alignment formula (-1000..1000). */
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(-1000)
  @Max(1000)
  @IsOptional()
  alignmentBias?: number;
}

@InputType()
export class AssignSkillToClassInput {
  @Field(() => Int)
  @IsInt()
  classId: number;

  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  minLevel: number;
}

@InputType()
export class UpdateClassSkillInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  minLevel?: number;
}

@InputType()
export class CreateClassCircleInput {
  @Field(() => Int)
  @IsInt()
  classId: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  circle: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  minLevel: number;
}

@InputType()
export class UpdateClassCircleInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  circle?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  minLevel?: number;
}
