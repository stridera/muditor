import { InputType, Field } from '@nestjs/graphql';
import { GrantResourceType, GrantPermission } from '@muditor/db';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
} from 'class-validator';

@InputType()
export class CreateGrantInput {
  @Field()
  @IsString()
  userId: string;

  @Field(() => GrantResourceType)
  resourceType: GrantResourceType;

  @Field()
  @IsString()
  resourceId: string;

  @Field(() => [GrantPermission])
  @IsArray()
  permissions: GrantPermission[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateGrantInput {
  @Field(() => [GrantPermission], { nullable: true })
  @IsOptional()
  @IsArray()
  permissions?: GrantPermission[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class GrantZoneAccessInput {
  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsNumber()
  zoneId: number;

  @Field(() => [GrantPermission])
  @IsArray()
  permissions: GrantPermission[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
