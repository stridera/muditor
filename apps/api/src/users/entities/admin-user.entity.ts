import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import './user.entity'; // registers the UserRole GraphQL enum

@ObjectType()
export class AdminUserAccountCharacter {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  level: number;
}

@ObjectType({
  description: 'User account row for the admin users page (no secrets)',
})
export class AdminUserAccount {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  hasGoogleLink: boolean;

  @Field()
  hasPassword: boolean;

  @Field()
  isBanned: boolean;

  @Field(() => [AdminUserAccountCharacter])
  characters: AdminUserAccountCharacter[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastLoginAt?: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date | null;

  @Field(() => String, { nullable: true })
  deletionReason?: string | null;
}

@ObjectType()
export class PasswordResetLink {
  @Field({
    description:
      'Full reset URL to hand to the player. Shown once; never stored in logs.',
  })
  url: string;

  @Field(() => GraphQLISODateTime)
  expiresAt: Date;
}
