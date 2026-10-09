import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const KEYWORD_PATTERN = /^\S+$/;
const KEYWORD_MESSAGE = 'keyword must be a single word with no spaces';

@InputType({ description: 'Input for creating a creation recipe' })
export class CreateCreationRecipeInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  abilityId: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Matches(KEYWORD_PATTERN, { message: KEYWORD_MESSAGE })
  keyword?: string | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  classId?: number | null;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  objectZoneId: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  objectId?: number | null;
}

@InputType({ description: 'Input for updating a creation recipe' })
export class UpdateCreationRecipeInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  abilityId?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Pass null or empty to clear',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Matches(KEYWORD_PATTERN, { message: KEYWORD_MESSAGE })
  keyword?: string | null;

  @Field(() => Int, { nullable: true, description: 'Pass null to clear' })
  @IsInt()
  @IsOptional()
  @Min(1)
  classId?: number | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  objectZoneId?: number;

  @Field(() => Int, { nullable: true, description: 'Pass null to clear' })
  @IsInt()
  @IsOptional()
  @Min(0)
  objectId?: number | null;
}
