import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import {
  QuestObjectiveType,
  QuestRewardType,
  QuestStatus,
  DialogueMatchType,
} from '@prisma/client';

// Register enums for GraphQL
registerEnumType(QuestObjectiveType, { name: 'QuestObjectiveType' });
registerEnumType(QuestRewardType, { name: 'QuestRewardType' });
registerEnumType(QuestStatus, { name: 'QuestStatus' });
registerEnumType(DialogueMatchType, { name: 'DialogueMatchType' });

// ============================================================================
// Quest DTOs (ordered by dependencies - leaf types first)
// ============================================================================

@ObjectType()
export class QuestDialogueDto {
  @Field(() => Int)
  id: number;

  @Field()
  npcMessage: string;

  @Field(() => DialogueMatchType)
  matchType: DialogueMatchType;

  @Field(() => [String])
  matchKeywords: string[];

  @Field(() => Int, { nullable: true })
  dialogueTreeId?: number;
}

@ObjectType()
export class QuestRewardDto {
  @Field(() => Int)
  id: number;

  @Field(() => QuestRewardType)
  rewardType: QuestRewardType;

  @Field(() => Int, { nullable: true })
  amount?: number;

  @Field(() => Int, { nullable: true })
  objectZoneId?: number;

  @Field(() => Int, { nullable: true })
  objectId?: number;

  @Field(() => Int, { nullable: true })
  abilityId?: number;

  @Field(() => Int, { nullable: true })
  choiceGroup?: number;
}

@ObjectType()
export class QuestPrerequisiteDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  questZoneId: number;

  @Field(() => Int)
  questId: number;

  @Field(() => Int)
  prerequisiteQuestZoneId: number;

  @Field(() => Int)
  prerequisiteQuestId: number;
}

@ObjectType()
export class QuestObjectiveDto {
  @Field(() => Int)
  questZoneId: number;

  @Field(() => Int)
  questId: number;

  @Field(() => Int)
  phaseId: number;

  @Field(() => Int)
  id: number;

  @Field(() => QuestObjectiveType)
  objectiveType: QuestObjectiveType;

  @Field()
  playerDescription: string;

  @Field({ nullable: true })
  internalNote?: string;

  @Field(() => Boolean)
  showProgress: boolean;

  @Field(() => Int)
  requiredCount: number;

  @Field(() => Int, { nullable: true })
  targetMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  targetMobId?: number;

  @Field(() => Int, { nullable: true })
  targetObjectZoneId?: number;

  @Field(() => Int, { nullable: true })
  targetObjectId?: number;

  @Field(() => Int, { nullable: true })
  targetRoomZoneId?: number;

  @Field(() => Int, { nullable: true })
  targetRoomId?: number;

  @Field(() => Int, { nullable: true })
  targetAbilityId?: number;

  @Field(() => Int, { nullable: true })
  deliverToMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  deliverToMobId?: number;

  @Field({ nullable: true })
  luaExpression?: string;

  @Field(() => QuestDialogueDto, { nullable: true })
  dialogue?: QuestDialogueDto;
}

@ObjectType()
export class QuestPhaseDto {
  @Field(() => Int)
  questZoneId: number;

  @Field(() => Int)
  questId: number;

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field(() => [QuestObjectiveDto], { nullable: true })
  objectives?: QuestObjectiveDto[];
}

@ObjectType()
export class QuestDto {
  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  maxLevel?: number;

  @Field(() => Boolean)
  repeatable: boolean;

  @Field(() => Boolean)
  hidden: boolean;

  @Field(() => Int, { nullable: true })
  giverMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  giverMobId?: number;

  @Field(() => Int, { nullable: true })
  completerMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  completerMobId?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [QuestPhaseDto], { nullable: true })
  phases?: QuestPhaseDto[];

  @Field(() => [QuestRewardDto], { nullable: true })
  rewards?: QuestRewardDto[];

  @Field(() => [QuestPrerequisiteDto], { nullable: true })
  prerequisites?: QuestPrerequisiteDto[];
}

// ============================================================================
// Character Quest Progress DTOs
// ============================================================================

@ObjectType()
export class CharacterQuestObjectiveDto {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  currentCount: number;

  @Field(() => Boolean)
  completed: boolean;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;
}

@ObjectType()
export class CharacterQuestDto {
  @Field(() => ID)
  id: string;

  @Field()
  characterId: string;

  @Field(() => Int)
  questZoneId: number;

  @Field(() => Int)
  questId: number;

  @Field(() => QuestStatus)
  status: QuestStatus;

  @Field(() => Date)
  acceptedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  currentPhaseId?: number;

  @Field(() => QuestDto, { nullable: true })
  quest?: QuestDto;

  @Field(() => [CharacterQuestObjectiveDto], { nullable: true })
  objectiveProgress?: CharacterQuestObjectiveDto[];
}

// ============================================================================
// Input Types
// ============================================================================

@InputType()
export class CreateQuestInput {
  @Field(() => Int)
  @IsNumber()
  zoneId: number;

  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(100)
  maxLevel?: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  repeatable?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  giverMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  giverMobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  completerMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  completerMobId?: number;
}

@InputType()
export class UpdateQuestInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxLevel?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  repeatable?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  giverMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  giverMobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  completerMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  completerMobId?: number;
}

@InputType()
export class CreateQuestPhaseInput {
  @Field(() => Int)
  @IsNumber()
  questZoneId: number;

  @Field(() => Int)
  @IsNumber()
  questId: number;

  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsNumber()
  order: number;
}

@InputType()
export class UpdateQuestPhaseInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  order?: number;
}

@InputType()
export class CreateQuestObjectiveInput {
  @Field(() => Int)
  @IsNumber()
  questZoneId: number;

  @Field(() => Int)
  @IsNumber()
  questId: number;

  @Field(() => Int)
  @IsNumber()
  phaseId: number;

  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => QuestObjectiveType)
  @IsEnum(QuestObjectiveType)
  objectiveType: QuestObjectiveType;

  @Field()
  @IsString()
  playerDescription: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  showProgress?: boolean;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  requiredCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetMobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetObjectZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetObjectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetRoomZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetRoomId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetAbilityId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  deliverToMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  deliverToMobId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  luaExpression?: string;
}

@InputType()
export class UpdateQuestObjectiveInput {
  @Field(() => QuestObjectiveType, { nullable: true })
  @IsOptional()
  @IsEnum(QuestObjectiveType)
  objectiveType?: QuestObjectiveType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  playerDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  showProgress?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  requiredCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetMobId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetObjectZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetObjectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetRoomZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetRoomId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  targetAbilityId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  deliverToMobZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  deliverToMobId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  luaExpression?: string;
}

@InputType()
export class CreateQuestDialogueInput {
  @Field(() => Int)
  @IsNumber()
  questZoneId: number;

  @Field(() => Int)
  @IsNumber()
  questId: number;

  @Field(() => Int)
  @IsNumber()
  phaseId: number;

  @Field(() => Int)
  @IsNumber()
  objectiveId: number;

  @Field()
  @IsString()
  npcMessage: string;

  @Field(() => DialogueMatchType, { defaultValue: DialogueMatchType.CONTAINS })
  @IsOptional()
  @IsEnum(DialogueMatchType)
  matchType?: DialogueMatchType;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  matchKeywords?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  dialogueTreeId?: number;
}

@InputType()
export class UpdateQuestDialogueInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  npcMessage?: string;

  @Field(() => DialogueMatchType, { nullable: true })
  @IsOptional()
  @IsEnum(DialogueMatchType)
  matchType?: DialogueMatchType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  matchKeywords?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  dialogueTreeId?: number;
}

@InputType()
export class CreateQuestRewardInput {
  @Field(() => Int)
  @IsNumber()
  questZoneId: number;

  @Field(() => Int)
  @IsNumber()
  questId: number;

  @Field(() => QuestRewardType)
  @IsEnum(QuestRewardType)
  rewardType: QuestRewardType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  abilityId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  choiceGroup?: number;
}

@InputType()
export class UpdateQuestRewardInput {
  @Field(() => QuestRewardType, { nullable: true })
  @IsOptional()
  @IsEnum(QuestRewardType)
  rewardType?: QuestRewardType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  objectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  abilityId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  choiceGroup?: number;
}

@InputType()
export class CreateQuestPrerequisiteInput {
  @Field(() => Int)
  @IsNumber()
  questZoneId: number;

  @Field(() => Int)
  @IsNumber()
  questId: number;

  @Field(() => Int)
  @IsNumber()
  prerequisiteQuestZoneId: number;

  @Field(() => Int)
  @IsNumber()
  prerequisiteQuestId: number;
}

// ============================================================================
// Filter/Query Inputs
// ============================================================================

@InputType()
export class QuestFilterInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;

  @Field(() => QuestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(QuestStatus)
  status?: QuestStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxLevel?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
