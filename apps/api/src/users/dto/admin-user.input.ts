import { Field, ID, InputType } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class AdminSetUserRoleInput {
  @Field(() => ID)
  @IsString()
  userId: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;
}

@InputType()
export class AdminSetUserDeletedInput {
  @Field(() => ID)
  @IsString()
  userId: string;

  @Field({ description: 'true = soft-delete, false = restore' })
  deleted: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Required when deleting',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

@InputType()
export class AdminUnlinkCharacterInput {
  @Field(() => ID)
  @IsString()
  characterId: string;
}
