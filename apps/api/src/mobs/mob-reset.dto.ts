import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class ObjectSummaryDto {
  @Field(() => Int)
  id: number;

  @Field()
  shortDesc: string;

  @Field()
  type: string;
}

@ObjectType()
export class MobCarryingDto {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  max: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  objectId: number;

  @Field(() => ObjectSummaryDto, { description: 'The object being carried' })
  object: ObjectSummaryDto;
}

@ObjectType()
export class MobEquippedDto {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  max: number;

  @Field()
  location: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  objectId: number;

  @Field(() => ObjectSummaryDto, { description: 'The object being equipped' })
  object: ObjectSummaryDto;
}

@ObjectType()
export class MobResetDto {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  max: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => [MobCarryingDto])
  carrying: MobCarryingDto[];

  @Field(() => [MobEquippedDto])
  equipped: MobEquippedDto[];
}

// Input types for creating/updating equipment
@InputType()
export class CreateMobCarryingInput {
  @Field(() => Int)
  max: number = 1;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  objectId: number;
}

@InputType()
export class CreateMobEquippedInput {
  @Field(() => Int)
  max: number = 1;

  @Field()
  location: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  objectId: number;
}

@InputType()
export class CreateMobResetInput {
  @Field(() => Int)
  max: number = 1;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => [CreateMobCarryingInput], { defaultValue: [] })
  carrying: CreateMobCarryingInput[] = [];

  @Field(() => [CreateMobEquippedInput], { defaultValue: [] })
  equipped: CreateMobEquippedInput[] = [];
}

@InputType()
export class UpdateMobCarryingInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => Int, { nullable: true })
  max?: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  objectId?: number;
}

@InputType()
export class UpdateMobEquippedInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => Int, { nullable: true })
  max?: number;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  objectId?: number;
}

@InputType()
export class UpdateMobResetInput {
  @Field(() => Int, { nullable: true })
  max?: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  roomId?: number;

  @Field(() => [UpdateMobCarryingInput], { nullable: true })
  carrying?: UpdateMobCarryingInput[];

  @Field(() => [UpdateMobEquippedInput], { nullable: true })
  equipped?: UpdateMobEquippedInput[];
}
