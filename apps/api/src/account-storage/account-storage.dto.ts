import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BigIntResolver } from 'graphql-scalars';

// Helper DTOs (must be defined before main DTOs that reference them)
@ObjectType()
export class AccountItemObjectDto {
  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  type?: string;
}

@ObjectType()
export class AccountItemCharacterDto {
  @Field()
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class AccountItemDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  slot: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => String, { nullable: true })
  customData: string | null; // JSON stringified

  @Field()
  storedAt: Date;

  @Field(() => String, { nullable: true })
  storedByCharacterId: string | null;

  // Nested relations
  @Field(() => AccountItemObjectDto)
  object: AccountItemObjectDto;

  @Field(() => AccountItemCharacterDto, { nullable: true })
  storedByCharacter: AccountItemCharacterDto | null;
}

@ObjectType()
export class AccountStorageDto {
  @Field(() => BigIntResolver)
  accountWealth: bigint;

  @Field(() => [AccountItemDto])
  items: AccountItemDto[];
}

@ObjectType()
export class WealthDisplayDto {
  @Field(() => BigIntResolver)
  totalCopper: bigint;

  @Field(() => Int)
  platinum: number;

  @Field(() => Int)
  gold: number;

  @Field(() => Int)
  silver: number;

  @Field(() => Int)
  copper: number;
}
