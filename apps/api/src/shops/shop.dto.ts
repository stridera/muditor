import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ShopFlag, ShopTradesWith } from '@prisma/client';

// Register GraphQL enums
registerEnumType(ShopFlag, { name: 'ShopFlag' });
registerEnumType(ShopTradesWith, { name: 'ShopTradesWith' });

@ObjectType()
export class ShopDto {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  buyProfit: number;

  @Field(() => Float)
  sellProfit: number;

  @Field(() => Int)
  temper1: number;

  @Field(() => [ShopFlag])
  flags: ShopFlag[];

  @Field(() => [ShopTradesWith])
  tradesWithFlags: ShopTradesWith[];

  @Field({ nullable: true })
  noSuchItem1?: string;

  @Field({ nullable: true })
  noSuchItem2?: string;

  @Field({ nullable: true })
  doNotBuy?: string;

  @Field({ nullable: true })
  missingCash1?: string;

  @Field({ nullable: true })
  missingCash2?: string;

  @Field({ nullable: true })
  messageBuy?: string;

  @Field({ nullable: true })
  messageSell?: string;

  @Field(() => Int, { nullable: true })
  keeperId?: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@InputType()
export class CreateShopInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => Int)
  @IsNumber()
  vnum: number;

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
  temper1?: number;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  noSuchItem1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  noSuchItem2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  doNotBuy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  missingCash1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  missingCash2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageBuy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageSell?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  keeperId?: number;

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
  temper1?: number;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  noSuchItem1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  noSuchItem2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  doNotBuy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  missingCash1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  missingCash2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageBuy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageSell?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  keeperId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;
}
