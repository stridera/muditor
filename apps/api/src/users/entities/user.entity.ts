import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { BanRecord } from './ban-record.entity';

// Register enum with GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role in the MUD system',
});

// Re-export for other modules
export { UserRole };

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  // Don't expose password hash
  passwordHash?: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  // Password reset fields - don't expose in GraphQL
  resetToken?: string;
  resetTokenExpiry?: Date;

  // Security fields - don't expose in GraphQL
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  lastFailedLogin?: Date;

  @Field(() => [BanRecord], {
    description: 'Ban records for this user',
    nullable: true,
  })
  banRecords?: BanRecord[];

  @Field({ description: 'Whether the user is currently banned' })
  isBanned: boolean;
}
