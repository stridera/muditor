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
import { TriggerAttachType, TriggerType } from '@prisma/client';

// Register GraphQL enums
registerEnumType(TriggerAttachType, { name: 'TriggerAttachType' });
registerEnumType(TriggerType, { name: 'TriggerType' });

@ObjectType()
export class TriggerDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => TriggerAttachType)
  attachType: TriggerAttachType;

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

  @Field(() => [TriggerType])
  triggerTypes: TriggerType[];

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

  @Field(() => TriggerAttachType)
  @IsEnum(TriggerAttachType)
  attachType: TriggerAttachType;

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

  @Field(() => [TriggerType], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(TriggerType, { each: true })
  triggerTypes?: TriggerType[];
}

@InputType()
export class UpdateTriggerInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => TriggerAttachType, { nullable: true })
  @IsOptional()
  @IsEnum(TriggerAttachType)
  attachType?: TriggerAttachType;

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

  @Field(() => [TriggerType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TriggerType, { each: true })
  triggerTypes?: TriggerType[];
}

@InputType()
export class AttachTriggerInput {
  @Field()
  @IsString()
  triggerId: string;

  @Field(() => TriggerAttachType)
  @IsEnum(TriggerAttachType)
  attachType: TriggerAttachType;

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
