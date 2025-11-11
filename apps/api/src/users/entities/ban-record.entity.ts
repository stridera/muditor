import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from './user.entity';

@ObjectType()
export class AdminUser {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class BanRecord {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  bannedBy: string;

  @Field()
  reason: string;

  @Field(() => GraphQLISODateTime)
  bannedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  expiresAt?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  unbannedAt?: Date | null;

  @Field(() => ID, { nullable: true })
  unbannedBy?: string | null;

  @Field()
  active: boolean;

  // User field handled by resolver, not exposed directly (partial view)
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isBanned: boolean;
  } | null;

  @Field(() => AdminUser, {
    nullable: true,
    description: 'The admin who issued the ban',
  })
  admin?: AdminUser | null;

  @Field(() => AdminUser, {
    nullable: true,
    description: 'The admin who lifted the ban',
  })
  unbanner?: AdminUser | null;
}
