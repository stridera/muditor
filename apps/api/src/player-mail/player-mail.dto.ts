import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

// ============================================================================
// PLAYER MAIL DTOs (Character-to-Character)
// ============================================================================

// Helper DTOs (must be defined before main DTOs that reference them)
@ObjectType()
export class PlayerMailCharacterDto {
  @Field()
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class PlayerMailObjectDto {
  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

@ObjectType()
export class PlayerMailDto {
  @Field(() => Int)
  id: number;

  // Legacy IDs (for imported mail from CircleMUD)
  @Field(() => Int, { nullable: true })
  legacySenderId?: number;

  @Field(() => Int, { nullable: true })
  legacyRecipientId?: number;

  // Character IDs (null for legacy mail not yet remapped)
  @Field(() => String, { nullable: true })
  senderCharacterId?: string;

  @Field(() => String, { nullable: true })
  recipientCharacterId?: string;

  @Field()
  body: string;

  @Field()
  sentAt: Date;

  @Field({ nullable: true })
  readAt?: Date;

  // Wealth attachments
  @Field(() => Int)
  attachedCopper: number;

  @Field(() => Int)
  attachedSilver: number;

  @Field(() => Int)
  attachedGold: number;

  @Field(() => Int)
  attachedPlatinum: number;

  // Object attachment
  @Field(() => Int, { nullable: true })
  attachedObjectZoneId?: number;

  @Field(() => Int, { nullable: true })
  attachedObjectId?: number;

  // Retrieval tracking
  @Field({ nullable: true })
  wealthRetrievedAt?: Date;

  @Field(() => String, { nullable: true })
  wealthRetrievedByCharacterId?: string;

  @Field({ nullable: true })
  objectRetrievedAt?: Date;

  @Field(() => String, { nullable: true })
  objectRetrievedByCharacterId?: string;

  @Field()
  objectMovedToAccountStorage: boolean;

  @Field()
  isDeleted: boolean;

  @Field()
  createdAt: Date;

  // Computed display fields
  @Field()
  senderName: string; // Character name or "<deleted>"

  @Field(() => String, { nullable: true })
  wealthRetrievalInfo?: string; // "Retrieved by CharName" or null

  @Field(() => String, { nullable: true })
  objectRetrievalInfo?: string; // "Retrieved by CharName" or "Moved to account storage"

  // Nested relations (optional - loaded on demand)
  @Field(() => PlayerMailCharacterDto, { nullable: true })
  sender?: PlayerMailCharacterDto;

  @Field(() => PlayerMailCharacterDto, { nullable: true })
  recipient?: PlayerMailCharacterDto;

  @Field(() => PlayerMailObjectDto, { nullable: true })
  attachedObject?: PlayerMailObjectDto;
}

@InputType()
export class PlayerMailFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  senderCharacterId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  recipientCharacterId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchBody?: string;

  @Field({ nullable: true })
  @IsOptional()
  fromDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  toDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  includeDeleted?: boolean;
}

@InputType()
export class SendPlayerMailInput {
  @Field()
  @IsString()
  senderCharacterId: string;

  @Field()
  @IsString()
  recipientCharacterId: string;

  @Field()
  @IsString()
  body: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  attachedCopper?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  attachedSilver?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  attachedGold?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  attachedPlatinum?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  attachedObjectZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  attachedObjectId?: number;
}

// ============================================================================
// ACCOUNT MAIL DTOs (Account-to-Account)
// ============================================================================

// Helper DTO (must be defined before main DTO)
@ObjectType()
export class AccountMailUserDto {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;
}

@ObjectType()
export class AccountMailDto {
  @Field(() => Int)
  id: number;

  @Field()
  senderUserId: string;

  @Field(() => String, { nullable: true })
  recipientUserId?: string;

  @Field()
  isBroadcast: boolean;

  @Field()
  subject: string;

  @Field()
  body: string;

  @Field()
  sentAt: Date;

  @Field({ nullable: true })
  readAt?: Date;

  @Field()
  isDeleted: boolean;

  @Field()
  createdAt: Date;

  // Computed display fields
  @Field()
  senderName: string; // Account username/email

  // Nested relations
  @Field(() => AccountMailUserDto, { nullable: true })
  sender?: AccountMailUserDto;

  @Field(() => AccountMailUserDto, { nullable: true })
  recipient?: AccountMailUserDto;
}

@InputType()
export class AccountMailFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  senderUserId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  recipientUserId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchSubject?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchBody?: string;

  @Field({ nullable: true })
  @IsOptional()
  includeBroadcasts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeDeleted?: boolean;
}

@InputType()
export class SendAccountMailInput {
  @Field()
  @IsString()
  recipientUserId: string;

  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  body: string;
}

@InputType()
export class SendBroadcastInput {
  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  body: string;
}
