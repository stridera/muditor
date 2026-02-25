import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Field()
  @IsString()
  @MinLength(3, { message: 'Display name must be at least 3 characters long' })
  @MaxLength(20, { message: 'Display name must be at most 20 characters long' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Display name can only contain letters, numbers, and underscores',
  })
  displayName: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must be at most 128 characters long' })
  password: string;
}
