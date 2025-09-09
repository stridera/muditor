import { ObjectType, Field, ID } from '@nestjs/graphql';
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

  @Field()
  bannedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  unbannedAt?: Date;

  @Field(() => ID, { nullable: true })
  unbannedBy?: string;

  @Field()
  active: boolean;

  // User field handled by resolver, not exposed directly
  user?: any;

  @Field(() => AdminUser, {
    nullable: true,
    description: 'The admin who issued the ban',
  })
  admin?: AdminUser;

  @Field(() => AdminUser, {
    nullable: true,
    description: 'The admin who lifted the ban',
  })
  unbanner?: AdminUser;
}
