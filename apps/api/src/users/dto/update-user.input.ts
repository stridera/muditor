import { InputType, Field, ID } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsEmail, IsInt, Min, Max } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
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
