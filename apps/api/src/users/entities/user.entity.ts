import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { BanRecord } from './ban-record.entity';
import { UserPreferences } from './user-preferences.entity';

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
  passwordHash?: string | null;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastLoginAt?: Date | null;

  // Password reset fields - don't expose in GraphQL
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;

  // Security fields - don't expose in GraphQL
  failedLoginAttempts?: number; // always present in DB
  lockedUntil?: Date | null;
  lastFailedLogin?: Date | null;

  @Field(() => [BanRecord], {
    description: 'Ban records for this user',
    nullable: true,
  })
  banRecords?: BanRecord[];

  @Field({ description: 'Whether the user is currently banned' })
  isBanned: boolean;

  @Field(() => UserPreferences, { nullable: true, description: 'User preferences for UI and navigation' })
  preferences?: UserPreferences;
}
