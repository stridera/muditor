import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';
import { ScriptType, TriggerFlag } from '@prisma/client';

// Register GraphQL enums
registerEnumType(ScriptType, { name: 'ScriptType' });
registerEnumType(TriggerFlag, { name: 'TriggerFlag' });

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

  @Field({ nullable: true })
  argList?: string;

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

  @Field(() => [TriggerFlag])
  flags: TriggerFlag[];

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  argList?: string;

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

  @Field(() => [TriggerFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(TriggerFlag, { each: true })
  flags?: TriggerFlag[];
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  argList?: string;

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

  @Field(() => [TriggerFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TriggerFlag, { each: true })
  flags?: TriggerFlag[];
}

@InputType()
export class AttachTriggerInput {
  @Field()
  @IsString()
  triggerId: string;

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
