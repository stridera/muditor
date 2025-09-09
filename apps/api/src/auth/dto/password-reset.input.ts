import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}

@ObjectType()
export class PasswordResetResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
