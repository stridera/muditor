import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  @MinLength(1, { message: 'Identifier is required' })
  identifier: string; // Can be email or username

  @Field()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}