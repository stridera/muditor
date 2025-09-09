import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

@InputType()
export class BanUserInput {
  @Field(() => ID)
  userId: string;

  @Field()
  @IsString()
  @MinLength(10, { message: 'Ban reason must be at least 10 characters long' })
  @MaxLength(500, { message: 'Ban reason cannot exceed 500 characters' })
  reason: string;

  @Field({
    nullable: true,
    description:
      'ISO string for ban expiration. If not provided, ban is permanent',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
