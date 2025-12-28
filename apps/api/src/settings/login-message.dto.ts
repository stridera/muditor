import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { LoginStage } from '@prisma/client';

registerEnumType(LoginStage, {
  name: 'LoginStage',
  description: 'Stage in the login/character creation flow',
});

@ObjectType({ description: 'Login flow message' })
export class LoginMessageDto {
  @Field(() => ID)
  id: number;

  @Field(() => LoginStage, { description: 'Login flow stage' })
  stage: LoginStage;

  @Field({ description: 'Message variant (default, or for A/B testing)' })
  variant: string;

  @Field({ description: 'Message content' })
  message: string;

  @Field({ description: 'Whether this message is active' })
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
