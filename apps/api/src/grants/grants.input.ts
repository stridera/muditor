import { InputType, Field } from '@nestjs/graphql';
import { GrantResourceType, GrantPermission } from '@prisma/client';

@InputType()
export class CreateGrantInput {
  @Field()
  userId: string;

  @Field(() => GrantResourceType)
  resourceType: GrantResourceType;

  @Field()
  resourceId: string;

  @Field(() => [GrantPermission])
  permissions: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateGrantInput {
  @Field(() => [GrantPermission], { nullable: true })
  permissions?: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class GrantZoneAccessInput {
  @Field()
  userId: string;

  @Field()
  zoneId: number;

  @Field(() => [GrantPermission])
  permissions: GrantPermission[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  notes?: string;
}
