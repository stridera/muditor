import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ObjectSummaryDto } from '../mobs/mob-reset.dto';

@ObjectType()
export class CharacterDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  alignment: number;

  // Core stats
  @Field(() => Int)
  strength: number;

  @Field(() => Int)
  intelligence: number;

  @Field(() => Int)
  wisdom: number;

  @Field(() => Int)
  dexterity: number;

  @Field(() => Int)
  constitution: number;

  @Field(() => Int)
  charisma: number;

  @Field(() => Int)
  luck: number;

  // Health/Resources
  @Field(() => Int)
  hitPoints: number;

  @Field(() => Int)
  movement: number;

  @Field(() => Int)
  hitPointsMax: number;

  @Field(() => Int)
  movementMax: number;

  // Currency
  @Field(() => Int)
  copper: number;

  @Field(() => Int)
  silver: number;

  @Field(() => Int)
  gold: number;

  @Field(() => Int)
  platinum: number;

  @Field(() => Int)
  bankCopper: number;

  @Field(() => Int)
  bankSilver: number;

  @Field(() => Int)
  bankGold: number;

  @Field(() => Int)
  bankPlatinum: number;

  // Character identity
  @Field()
  gender: string;

  // Physical attributes
  @Field(() => Int, { nullable: true })
  height?: number;

  @Field(() => Int, { nullable: true })
  weight?: number;

  // Location & session
  @Field(() => Int, { nullable: true })
  currentRoom?: number;

  @Field(() => Int, { nullable: true })
  saveRoom?: number;

  @Field(() => Int, { nullable: true })
  homeRoom?: number;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field(() => Int)
  timePlayed: number;

  // Biological needs
  @Field(() => Int)
  hunger: number;

  @Field(() => Int)
  thirst: number;

  // Display/UI
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  prompt: string;

  // Flags
  @Field(() => [String], { nullable: true })
  playerFlags?: string[];

  @Field(() => [String], { nullable: true })
  privilegeFlags?: string[];

  @Field(() => Int)
  invisLevel: number;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  classId?: number;

  @Field({ nullable: true, description: 'Race enum value (e.g. HUMAN)' })
  race?: string;

  @Field({ nullable: true, description: 'Class display name' })
  class?: string;

  @Field(() => Int)
  experience: number;

  @Field(() => Int)
  skillPoints: number;

  // Relations
  @Field(() => [CharacterItemDto], { nullable: true })
  characterItems?: CharacterItemDto[];

  @Field(() => [CharacterEffectDto], { nullable: true })
  characterEffects?: CharacterEffectDto[];
}

@ObjectType()
export class CharacterItemDto {
  @Field(() => ID)
  id: number;

  @Field()
  characterId: string;

  @Field(() => Int)
  objectPrototypeId: number;

  @Field(() => Int, { nullable: true })
  containerId?: number;

  @Field({ nullable: true })
  equippedLocation?: string;

  @Field(() => Int)
  condition: number;

  @Field(() => Int)
  charges: number;

  @Field(() => [String])
  instanceFlags: string[];

  @Field({ nullable: true })
  customShortDesc?: string;

  @Field({ nullable: true })
  customLongDesc?: string;

  @Field(() => GraphQLJSON)
  customValues: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => CharacterDto)
  characters: CharacterDto;

  @Field(() => ObjectSummaryDto)
  objects: ObjectSummaryDto;

  @Field(() => CharacterItemDto, { nullable: true })
  container?: CharacterItemDto;

  @Field(() => [CharacterItemDto])
  containedItems: CharacterItemDto[];
}

@ObjectType()
export class CharacterEffectDto {
  @Field(() => ID)
  id: number;

  @Field()
  characterId: string;

  @Field()
  effectName: string;

  @Field({ nullable: true })
  effectType?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => Int)
  strength: number;

  @Field(() => GraphQLJSON)
  modifierData: Record<string, unknown>;

  @Field({ nullable: true })
  sourceType?: string;

  @Field(() => Int, { nullable: true })
  sourceId?: number;

  @Field()
  appliedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  // Relations
  @Field(() => CharacterDto)
  character: CharacterDto;
}

@ObjectType()
export class CharacterLinkingInfoDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  level: number;

  @Field({ nullable: true })
  race?: string;

  @Field({ nullable: true })
  class?: string;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field(() => Int)
  timePlayed: number;

  @Field()
  isLinked: boolean;

  @Field()
  hasPassword: boolean;
}

@ObjectType()
export class CharacterSessionInfoDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field(() => Int)
  totalTimePlayed: number;

  @Field(() => Int)
  currentSessionTime: number;
}

@ObjectType()
export class UserSummaryDto {
  @Field(() => ID)
  id: string;

  @Field()
  displayName: string;

  @Field()
  role: string;
}

@ObjectType()
export class OnlineCharacterDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  level: number;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field({ nullable: true })
  race?: string;

  @Field({ nullable: true })
  class?: string;

  @Field(() => UserSummaryDto, { nullable: true })
  user?: UserSummaryDto;
}
