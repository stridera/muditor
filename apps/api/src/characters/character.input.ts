import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Race } from '@muditor/db';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateCharacterInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  level: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  alignment: number;

  // Core stats
  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  strength: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  intelligence: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  wisdom: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  dexterity: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  constitution: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  charisma: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsInt()
  luck: number;

  // Character identity
  @Field({ defaultValue: 'neutral' })
  @IsString()
  gender: string;

  // GraphQL enum 'Race' is registered once in ../mobs/mob.dto
  @Field(() => Race, { defaultValue: Race.HUMAN })
  @IsEnum(Race)
  race: Race;

  @Field(() => Int, { description: 'CharacterClass id' })
  @IsInt()
  classId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({
    nullable: true,
    description:
      'Token from rollCharacterStats. Required for non-staff: the stat fields must then be an assignment (permutation) of the rolled values. Staff may omit it and set stats directly.',
  })
  @IsOptional()
  @IsString()
  statRollToken?: string;
}

@InputType()
export class UpdateCharacterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  level?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  alignment?: number;

  // Core stats
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  strength?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  intelligence?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  wisdom?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  dexterity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  constitution?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  charisma?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  luck?: number;

  // Health/Resources
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  hitPoints?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  movement?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  hitPointsMax?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  movementMax?: number;

  // Character identity
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field(() => Race, { nullable: true })
  @IsOptional()
  @IsEnum(Race)
  race?: Race;

  @Field(() => Int, { nullable: true, description: 'CharacterClass id' })
  @IsOptional()
  @IsInt()
  classId?: number;

  // Physical attributes
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  height?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  weight?: number;

  // Location
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  currentRoom?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  saveRoom?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  homeRoom?: number;

  // Display/UI
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  prompt?: string;

  // Flags
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  playerFlags?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  privilegeFlags?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  invisLevel?: number;
}

@InputType()
export class CreateCharacterItemInput {
  @Field()
  @IsString()
  characterId: string;

  @Field(() => Int)
  @IsInt()
  objectZoneId: number;

  @Field(() => Int)
  @IsInt()
  objectId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  containerId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  equippedLocation?: string;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  condition: number;

  @Field(() => Int, { defaultValue: -1 })
  @IsInt()
  charges: number;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  instanceFlags: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customShortDesc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customLongDesc?: string;
}

@InputType()
export class UpdateCharacterItemInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  containerId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  equippedLocation?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  condition?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  charges?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instanceFlags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customShortDesc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customLongDesc?: string;
}

@InputType()
export class CreateCharacterEffectInput {
  @Field()
  @IsString()
  characterId: string;

  @Field()
  @IsString()
  effectName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  effectType?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  strength: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sourceId?: number;
}

@InputType()
export class UpdateCharacterEffectInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  strength: number;
}

@InputType()
export class LinkCharacterInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  characterName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  characterPassword: string;
}

@InputType()
export class UnlinkCharacterInput {
  @Field(() => ID)
  @IsString()
  characterId: string;
}

@InputType()
export class CharacterFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
