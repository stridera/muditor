import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { WearFlag } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register WearFlag enum for GraphQL
registerEnumType(WearFlag, {
  name: 'WearFlag',
});

@ObjectType()
export class ObjectAffectDto {
  @Field()
  location: string;

  @Field(() => Int)
  modifier: number;
}

@ObjectType()
export class ObjectSummaryDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field(() => Int, { nullable: true })
  cost?: number;

  @Field({ nullable: true })
  examineDescription?: string;

  @Field(() => Number, { nullable: true })
  weight?: number;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  values?: any;

  @Field(() => [String], { nullable: true })
  flags?: string[];

  @Field(() => [String], { nullable: true })
  effectFlags?: string[];

  @Field(() => [String], { nullable: true })
  wearFlags?: string[];

  @Field(() => [ObjectAffectDto], { nullable: true })
  objectAffects?: ObjectAffectDto[];
}

@ObjectType()
export class MobSummaryDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;
}

@ObjectType()
export class RoomSummaryDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;
}

@ObjectType()
export class MobResetEquipmentDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

  @Field(() => WearFlag, { nullable: true })
  wearLocation?: WearFlag;

  @Field(() => Int)
  maxInstances: number;

  @Field(() => Float)
  probability: number;

  @Field(() => ObjectSummaryDto, { description: 'The object being equipped' })
  object: ObjectSummaryDto;
}

@ObjectType()
export class MobResetDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  mobZoneId: number;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  roomZoneId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int)
  maxInstances: number;

  @Field(() => Float)
  probability: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [MobResetEquipmentDto])
  equipment: MobResetEquipmentDto[];

  @Field(() => MobSummaryDto, { nullable: true })
  mob?: MobSummaryDto;

  @Field(() => RoomSummaryDto, { nullable: true })
  room?: RoomSummaryDto;
}

// Input types for creating/updating equipment
@InputType()
export class CreateMobResetEquipmentInput {
  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

  @Field(() => WearFlag, { nullable: true })
  wearLocation?: WearFlag;

  @Field(() => Int, { defaultValue: 1 })
  maxInstances: number = 1;

  @Field(() => Float, { defaultValue: 1.0 })
  probability: number = 1.0;
}

@InputType()
export class CreateMobResetInput {
  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  mobZoneId: number;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  roomZoneId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int, { defaultValue: 1 })
  maxInstances: number = 1;

  @Field(() => Float, { defaultValue: 1.0 })
  probability: number = 1.0;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [CreateMobResetEquipmentInput], {
    nullable: true,
    defaultValue: [],
  })
  equipment?: CreateMobResetEquipmentInput[];
}

@InputType()
export class UpdateMobResetEquipmentInput {
  @Field(() => ID, { nullable: true })
  id?: number;

  @Field(() => Int, { nullable: true })
  objectZoneId?: number;

  @Field(() => Int, { nullable: true })
  objectId?: number;

  @Field(() => WearFlag, { nullable: true })
  wearLocation?: WearFlag;

  @Field(() => Int, { nullable: true })
  maxInstances?: number;

  @Field(() => Float, { nullable: true })
  probability?: number;
}

@InputType()
export class UpdateMobResetInput {
  @Field(() => Int, { nullable: true })
  maxInstances?: number;

  @Field(() => Float, { nullable: true })
  probability?: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Int, { nullable: true })
  roomZoneId?: number;

  @Field(() => Int, { nullable: true })
  roomId?: number;

  @Field(() => [UpdateMobResetEquipmentInput], { nullable: true })
  equipment?: UpdateMobResetEquipmentInput[];
}
