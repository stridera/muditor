import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GrantResourceType, GrantPermission, UserRole } from '@muditor/db';

// Register enums with GraphQL
registerEnumType(GrantResourceType, {
  name: 'GrantResourceType',
  description: 'Type of resource that can be granted access to',
});

registerEnumType(GrantPermission, {
  name: 'GrantPermission',
  description: 'Permission level for a grant',
});

@ObjectType()
export class UserGrantDto {
  @Field(() => ID)
  id: number;

  @Field()
  userId: string;

  @Field(() => GrantResourceType)
  resourceType: GrantResourceType;

  @Field()
  resourceId: string;

  @Field(() => [GrantPermission])
  permissions: GrantPermission[];

  @Field()
  grantedBy: string;

  @Field()
  grantedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field({ description: 'Display name of the person who granted access' })
  grantedByDisplayName?: string;

  @Field({ description: 'Display name of the person who received the grant' })
  displayName?: string;
}

@ObjectType({
  description:
    'Minimal user summary for the zone grants picker (no email, ban or auth data)',
})
export class GrantableUserDto {
  @Field(() => ID)
  id: string;

  @Field()
  displayName: string;

  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class ZoneGrantDto {
  @Field(() => ID)
  zoneId: number;

  @Field()
  zoneName: string;

  @Field(() => [GrantPermission])
  permissions: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}
