import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ScriptType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// Register GraphQL enums
registerEnumType(ScriptType, { name: 'ScriptType' });

@ObjectType()
export class TriggerDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => ScriptType)
  attachType: ScriptType;

  @Field(() => Int)
  numArgs: number;

  @Field(() => [String])
  argList: string[];

  @Field()
  commands: string;

  @Field(() => Int, { nullable: true })
  zoneId?: number;

  @Field(() => Int, { nullable: true })
  mobId?: number;

  @Field(() => Int, { nullable: true })
  objectId?: number;

  @Field(() => String)
  variables: string; // JSON stringified

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
}

@InputType()
export class CreateTriggerInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ScriptType)
  @IsEnum(ScriptType)
  attachType: ScriptType;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  numArgs?: number;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  argList?: string[];

  @Field()
  @IsString()
  commands: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  mobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectId?: number;

  @Field({ defaultValue: '{}' })
  @IsOptional()
  @IsString()
  variables?: string;
}

@InputType()
export class UpdateTriggerInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => ScriptType, { nullable: true })
  @IsOptional()
  @IsEnum(ScriptType)
  attachType?: ScriptType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  numArgs?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  argList?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  commands?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  mobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  variables?: string;
}

@InputType()
export class AttachTriggerInput {
  @Field(() => Int)
  @IsNumber()
  triggerId: number;

  @Field(() => ScriptType)
  @IsEnum(ScriptType)
  attachType: ScriptType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  mobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;
}
