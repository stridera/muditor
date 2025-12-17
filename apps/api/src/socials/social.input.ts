import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Position } from '@prisma/client';

@InputType({ description: 'Input for creating a new social command' })
export class CreateSocialInput {
  @Field({ description: 'Unique command name (e.g., smile, bow, hug)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @Field({ defaultValue: false, description: 'Hide who initiated the action' })
  @IsBoolean()
  hide: boolean;

  @Field(() => Position, {
    defaultValue: Position.STANDING,
    description: 'Minimum position for the target',
  })
  @IsEnum(Position)
  minVictimPosition: Position;

  // No argument messages
  @Field({ nullable: true, description: 'Message to actor when no target' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  charNoArg?: string;

  @Field({ nullable: true, description: 'Message to room when no target' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  othersNoArg?: string;

  // Target found messages
  @Field({ nullable: true, description: 'Message to actor when target found' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  charFound?: string;

  @Field({
    nullable: true,
    description: 'Message to room (excluding target) when target found',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  othersFound?: string;

  @Field({ nullable: true, description: 'Message to target' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  victFound?: string;

  // Target not found
  @Field({ nullable: true, description: 'Message when target not found' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notFound?: string;

  // Self-targeting messages
  @Field({
    nullable: true,
    description: 'Message to actor when targeting self',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  charAuto?: string;

  @Field({
    nullable: true,
    description: 'Message to room when actor targets self',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  othersAuto?: string;
}

@InputType({ description: 'Input for updating a social command' })
export class UpdateSocialInput {
  @Field({ nullable: true, description: 'Hide who initiated the action' })
  @IsBoolean()
  @IsOptional()
  hide?: boolean;

  @Field(() => Position, {
    nullable: true,
    description: 'Minimum position for the target',
  })
  @IsEnum(Position)
  @IsOptional()
  minVictimPosition?: Position;

  // No argument messages
  @Field({ nullable: true, description: 'Message to actor when no target' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  charNoArg?: string;

  @Field({ nullable: true, description: 'Message to room when no target' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  othersNoArg?: string;

  // Target found messages
  @Field({ nullable: true, description: 'Message to actor when target found' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  charFound?: string;

  @Field({
    nullable: true,
    description: 'Message to room (excluding target) when target found',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  othersFound?: string;

  @Field({ nullable: true, description: 'Message to target' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  victFound?: string;

  // Target not found
  @Field({ nullable: true, description: 'Message when target not found' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notFound?: string;

  // Self-targeting messages
  @Field({
    nullable: true,
    description: 'Message to actor when targeting self',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  charAuto?: string;

  @Field({
    nullable: true,
    description: 'Message to room when actor targets self',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  othersAuto?: string;
}
