import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateCharacterInput {
  @Field()
  name: string;

  @Field(() => Int, { defaultValue: 1 })
  level: number;

  @Field(() => Int, { defaultValue: 0 })
  alignment: number;

  // Core stats
  @Field(() => Int, { defaultValue: 13 })
  strength: number;

  @Field(() => Int, { defaultValue: 13 })
  intelligence: number;

  @Field(() => Int, { defaultValue: 13 })
  wisdom: number;

  @Field(() => Int, { defaultValue: 13 })
  dexterity: number;

  @Field(() => Int, { defaultValue: 13 })
  constitution: number;

  @Field(() => Int, { defaultValue: 13 })
  charisma: number;

  @Field(() => Int, { defaultValue: 13 })
  luck: number;

  // Character identity
  @Field({ defaultValue: 'human' })
  raceType: string;

  @Field({ defaultValue: 'neutral' })
  gender: string;

  @Field({ nullable: true })
  playerClass?: string;

  @Field(() => Int, { defaultValue: 1 })
  raceId: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  title?: string;
}

@InputType()
export class UpdateCharacterInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => Int, { nullable: true })
  alignment?: number;

  // Core stats
  @Field(() => Int, { nullable: true })
  strength?: number;

  @Field(() => Int, { nullable: true })
  intelligence?: number;

  @Field(() => Int, { nullable: true })
  wisdom?: number;

  @Field(() => Int, { nullable: true })
  dexterity?: number;

  @Field(() => Int, { nullable: true })
  constitution?: number;

  @Field(() => Int, { nullable: true })
  charisma?: number;

  @Field(() => Int, { nullable: true })
  luck?: number;

  // Health/Resources
  @Field(() => Int, { nullable: true })
  hitPoints?: number;

  @Field(() => Int, { nullable: true })
  movement?: number;

  @Field(() => Int, { nullable: true })
  hitPointsMax?: number;

  @Field(() => Int, { nullable: true })
  movementMax?: number;

  // Character identity
  @Field({ nullable: true })
  raceType?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  playerClass?: string;

  // Physical attributes
  @Field(() => Int, { nullable: true })
  height?: number;

  @Field(() => Int, { nullable: true })
  weight?: number;

  // Location
  @Field(() => Int, { nullable: true })
  currentRoom?: number;

  @Field(() => Int, { nullable: true })
  saveRoom?: number;

  @Field(() => Int, { nullable: true })
  homeRoom?: number;

  // Display/UI
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  prompt?: string;

  @Field(() => Int, { nullable: true })
  pageLength?: number;

  // Flags
  @Field(() => [String], { nullable: true })
  playerFlags?: string[];

  @Field(() => [String], { nullable: true })
  privilegeFlags?: string[];

  // Builder/God specific
  @Field(() => [Int], { nullable: true })
  olcZones?: number[];

  @Field(() => Int, { nullable: true })
  invisLevel?: number;
}

@InputType()
export class CreateCharacterItemInput {
  @Field()
  characterId: string;

  @Field(() => Int)
  objectPrototypeId: number;

  @Field(() => Int, { nullable: true })
  containerId?: number;

  @Field({ nullable: true })
  equippedLocation?: string;

  @Field(() => Int, { defaultValue: 100 })
  condition: number;

  @Field(() => Int, { defaultValue: -1 })
  charges: number;

  @Field(() => [String], { defaultValue: [] })
  instanceFlags: string[];

  @Field({ nullable: true })
  customShortDesc?: string;

  @Field({ nullable: true })
  customLongDesc?: string;
}

@InputType()
export class UpdateCharacterItemInput {
  @Field(() => Int, { nullable: true })
  containerId?: number;

  @Field({ nullable: true })
  equippedLocation?: string;

  @Field(() => Int, { nullable: true })
  condition?: number;

  @Field(() => Int, { nullable: true })
  charges?: number;

  @Field(() => [String], { nullable: true })
  instanceFlags?: string[];

  @Field({ nullable: true })
  customShortDesc?: string;

  @Field({ nullable: true })
  customLongDesc?: string;
}

@InputType()
export class CreateCharacterEffectInput {
  @Field()
  characterId: string;

  @Field()
  effectName: string;

  @Field({ nullable: true })
  effectType?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => Int, { defaultValue: 1 })
  strength: number;

  @Field({ nullable: true })
  sourceType?: string;

  @Field(() => Int, { nullable: true })
  sourceId?: number;
}

@InputType()
export class UpdateCharacterEffectInput {
  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => Int, { nullable: true })
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
  characterId: string;
}

@InputType()
export class CharacterFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  raceType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  playerClass?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
}
