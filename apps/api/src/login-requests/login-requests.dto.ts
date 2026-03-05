import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LoginRequestStatus } from '@muditor/db';

registerEnumType(LoginRequestStatus, {
  name: 'LoginRequestStatus',
  description: 'Status of a passwordless login request',
});

@ObjectType()
export class LoginRequestDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => LoginRequestStatus)
  status: LoginRequestStatus;

  @Field(() => String, { nullable: true })
  ipAddress: string | null;

  @Field()
  expiresAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  resolvedAt: Date | null;
}
