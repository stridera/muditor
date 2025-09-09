import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UnbanUserInput {
  @Field(() => ID)
  userId: string;
}
