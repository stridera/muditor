import { InputType, Field, ID } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
