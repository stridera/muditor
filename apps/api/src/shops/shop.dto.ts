import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ShopFlag, ShopTradesWith } from '@muditor/db';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ObjectSummaryDto } from '../mobs/mob-reset.dto';

// Register GraphQL enums
registerEnumType(ShopFlag, { name: 'ShopFlag' });
registerEnumType(ShopTradesWith, { name: 'ShopTradesWith' });

@ObjectType()
export class KeeperDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;

  @Field(() => [String])
  keywords: string[];
}

@ObjectType()
export class ShopDto {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  buyProfit: number;

  @Field(() => Float)
  sellProfit: number;

  @Field(() => Int)
  temper: number;

  @Field(() => [ShopFlag])
  flags: ShopFlag[];

  @Field(() => [ShopTradesWith])
  tradesWithFlags: ShopTradesWith[];

  @Field(() => [String], { defaultValue: [] })
  noSuchItemMessages: string[];

  @Field(() => [String], { defaultValue: [] })
  doNotBuyMessages: string[];

  @Field(() => [String], { defaultValue: [] })
  missingCashMessages: string[];

  @Field(() => [String], { defaultValue: [] })
  buyMessages: string[];

  @Field(() => [String], { defaultValue: [] })
  sellMessages: string[];

  @Field(() => Int, { nullable: true })
  keeperId?: number;

  @Field(() => KeeperDto, { nullable: true })
  keeper?: KeeperDto;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [ShopItemDto], { defaultValue: [] })
  items: ShopItemDto[];

  @Field(() => [ShopAcceptDto], { defaultValue: [] })
  accepts: ShopAcceptDto[];
}

@InputType()
export class CreateShopInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  buyProfit?: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  sellProfit?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  temper?: number;

  @Field(() => [ShopFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(ShopFlag, { each: true })
  flags?: ShopFlag[];

  @Field(() => [ShopTradesWith], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(ShopTradesWith, { each: true })
  tradesWithFlags?: ShopTradesWith[];

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  noSuchItemMessages?: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  doNotBuyMessages?: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  missingCashMessages?: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  buyMessages?: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  sellMessages?: string[];

  @Field(() => Int)
  @IsNumber()
  keeperZoneId: number;

  @Field(() => Int)
  @IsNumber()
  keeperId: number;

  @Field(() => Int)
  @IsNumber()
  zoneId: number;
}

@InputType()
export class UpdateShopInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  buyProfit?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  sellProfit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  temper?: number;

  @Field(() => [ShopFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ShopFlag, { each: true })
  flags?: ShopFlag[];

  @Field(() => [ShopTradesWith], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ShopTradesWith, { each: true })
  tradesWithFlags?: ShopTradesWith[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  noSuchItemMessages?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  doNotBuyMessages?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  missingCashMessages?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  buyMessages?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  sellMessages?: string[];

  // Keeper is a (zone, id) pair: send both or neither. null/omitted leaves the
  // current keeper unchanged (a shop always needs a keeper mob).
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  keeperId?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  keeperZoneId?: number | null;
}

@ObjectType()
export class ShopItemDto {
  @Field()
  id: string;

  @Field(() => Int)
  amount: number;

  @Field(() => Int)
  objectId: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => ObjectSummaryDto, { nullable: true })
  object?: ObjectSummaryDto;
}

@ObjectType()
export class ShopAcceptDto {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  keywords?: string;
}

@InputType()
export class ShopItemInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  amount: number;

  @Field(() => Int)
  @IsInt()
  objectZoneId: number;

  @Field(() => Int)
  @IsInt()
  objectId: number;
}

@InputType()
export class UpdateShopInventoryInput {
  @Field(() => [ShopItemInput])
  @IsArray()
  items: ShopItemInput[];
}
