import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';

// Register enum with GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role in the MUD system',
});

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
  godLevel: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;
}