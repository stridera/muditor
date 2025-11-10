import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GrantResourceType, GrantPermission } from '@prisma/client';

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

  @Field({ description: 'Username of the person who granted access' })
  grantedByUsername?: string;

  @Field({ description: 'Username of the person who received the grant' })
  username?: string;
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
